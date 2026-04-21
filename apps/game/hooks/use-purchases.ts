import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import {
  initRevenueCat,
  getOfferings,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  hasAnyPass,
  hasVIPOrHigher,
  createWebCheckoutSession,
  DEFAULT_TIERS,
  type PurchaseTier,
} from '@/services/purchases';

interface UsePurchasesReturn {
  tiers: PurchaseTier[];
  packages: PurchasesPackage[] | null;
  customerInfo: CustomerInfo | null;
  loading: boolean;
  purchasing: boolean;
  hasPass: boolean;
  hasVIP: boolean;
  purchase: (tierId: string) => Promise<boolean>;
  restore: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function usePurchases(): UsePurchasesReturn {
  const [packages, setPackages] = useState<PurchasesPackage[] | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    await initRevenueCat();
    const [offerings, info] = await Promise.all([getOfferings(), getCustomerInfo()]);
    setPackages(offerings);
    setCustomerInfo(info);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const purchase = useCallback(
    async (tierId: string): Promise<boolean> => {
      setPurchasing(true);
      try {
        if (Platform.OS === 'web') {
          const checkoutUrl = await createWebCheckoutSession(tierId);
          if (!checkoutUrl) return false;
          if (typeof window !== 'undefined') {
            window.location.assign(checkoutUrl);
            return true;
          }
          return false;
        }

        const tier = DEFAULT_TIERS.find((t) => t.id === tierId);
        if (!tier) return false;

        // Find matching package from RevenueCat offerings
        const pkg = packages?.find((p) => p.identifier === tier.identifier);
        if (!pkg) {
          console.warn('Package not found for tier:', tierId);
          return false;
        }

        const info = await purchasePackage(pkg);
        setCustomerInfo(info);
        return info !== null;
      } catch (e) {
        console.error('Purchase error:', e);
        return false;
      } finally {
        setPurchasing(false);
      }
    },
    [packages]
  );

  const restore = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const info = await restorePurchases();
      setCustomerInfo(info);
      return info !== null;
    } catch (e) {
      console.error('Restore error:', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tiers: DEFAULT_TIERS,
    packages,
    customerInfo,
    loading,
    purchasing,
    hasPass: hasAnyPass(customerInfo),
    hasVIP: hasVIPOrHigher(customerInfo),
    purchase,
    restore,
    refresh,
  };
}
