import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesPackage, CustomerInfo } from 'react-native-purchases';

const API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '',
};

export interface PurchaseTier {
  id: string;
  name: string;
  price: string;
  period: string;
  identifier: string;
  features: string[];
  popular?: boolean;
  color: string;
}

export const DEFAULT_TIERS: PurchaseTier[] = [
  {
    id: 'basic',
    name: 'Basic Pass',
    price: '$4.99',
    period: '/month',
    identifier: 'season_pass_basic',
    color: '#3b82f6',
    features: [
      'Unlock all premium story chapters',
      '2x Points from mini-games',
      'Exclusive outfits & accessories',
      'Daily Gem bonus (+10/day)',
    ],
  },
  {
    id: 'premium',
    name: 'VIP Pass',
    price: '$9.99',
    period: '/month',
    identifier: 'season_pass_vip',
    color: '#a855f7',
    popular: true,
    features: [
      'Everything in Basic Pass',
      '3x Points from mini-games',
      'Early access to new chapters',
      'Daily Gem bonus (+25/day)',
      'Exclusive VIP-only mini-games',
      'AI Dialogue unlocked for all NPCs',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime Pass',
    price: '$49.99',
    period: ' one-time',
    identifier: 'season_pass_lifetime',
    color: '#f59e0b',
    features: [
      'All VIP Pass perks forever',
      'No recurring payments',
      'Founder badge on profile',
      'Exclusive lifetime-only items',
      'Name in game credits',
    ],
  },
];

let initialized = false;

export async function initRevenueCat(): Promise<void> {
  if (initialized) return;
  if (Platform.OS === 'web') {
    initialized = true;
    return;
  }

  const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
  if (!apiKey) {
    console.warn('RevenueCat API key not configured for', Platform.OS);
    return;
  }

  Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
  Purchases.configure({ apiKey });
  initialized = true;
}

export async function getOfferings(): Promise<PurchasesPackage[] | null> {
  if (Platform.OS === 'web') return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? null;
  } catch (e) {
    console.error('Failed to fetch offerings:', e);
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  if (Platform.OS === 'web') return null;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (e: any) {
    if (e.userCancelled) {
      console.log('User cancelled purchase');
      return null;
    }
    console.error('Purchase failed:', e);
    throw e;
  }
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (Platform.OS === 'web') return null;
  try {
    const result = await Purchases.restorePurchases();
    // RevenueCat SDK v9 returns { customerInfo }, v10 may return CustomerInfo directly
    return (result as any)?.customerInfo ?? result ?? null;
  } catch (e) {
    console.error('Restore failed:', e);
    return null;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (Platform.OS === 'web') return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (e) {
    console.error('Failed to get customer info:', e);
    return null;
  }
}

export function hasEntitlement(customerInfo: CustomerInfo | null, entitlementId: string): boolean {
  if (!customerInfo) return false;
  return customerInfo.entitlements.active[entitlementId]?.isActive === true;
}

export function hasAnyPass(customerInfo: CustomerInfo | null): boolean {
  return (
    hasEntitlement(customerInfo, 'season_pass_basic') ||
    hasEntitlement(customerInfo, 'season_pass_vip') ||
    hasEntitlement(customerInfo, 'season_pass_lifetime')
  );
}

export function hasVIPOrHigher(customerInfo: CustomerInfo | null): boolean {
  return (
    hasEntitlement(customerInfo, 'season_pass_vip') ||
    hasEntitlement(customerInfo, 'season_pass_lifetime')
  );
}

export async function createWebCheckoutSession(tierId: string): Promise<string | null> {
  const endpoint = process.env.EXPO_PUBLIC_STRIPE_CHECKOUT_ENDPOINT?.trim();
  if (!endpoint) {
    console.warn('Stripe checkout endpoint not configured');
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tierId }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { checkoutUrl?: string };
    return data.checkoutUrl?.trim() || null;
  } catch (e) {
    console.error('Failed to create Stripe checkout session:', e);
    return null;
  }
}
