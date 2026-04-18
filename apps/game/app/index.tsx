import { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import { AvatarPreview } from '@/components/avatar-preview';
import type { Clique, AvatarConfig, Gender } from '@repo/types';
import { SKIN_TONES, HAIR_COLORS, EYE_COLORS, HAIR_STYLES, OUTFITS, ACCESSORIES } from '@repo/types';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

const CLIQUES: { key: Clique; label: string; desc: string; gradient: readonly [string, string]; icon: string }[] = [
  { key: 'jock', label: 'Jock', desc: 'Athletic, competitive, popular with sports crowds.', gradient: ['#ef4444', '#f97316'], icon: 'J' },
  { key: 'nerd', label: 'Nerd', desc: 'Smart, curious, loves books and video games.', gradient: ['#8b5cf6', '#6366f1'], icon: 'N' },
  { key: 'popular', label: 'Popular', desc: 'Social, trendy, knows everyone in school.', gradient: ['#ec4899', '#f472b6'], icon: 'P' },
  { key: 'goth', label: 'Goth', desc: 'Mysterious, artistic, dark aesthetic.', gradient: ['#1e293b', '#334155'], icon: 'G' },
  { key: 'artsy', label: 'Artsy', desc: 'Creative, expressive, always making something.', gradient: ['#f59e0b', '#fbbf24'], icon: 'A' },
  { key: 'preppy', label: 'Preppy', desc: 'Polished, academic, future Ivy League.', gradient: ['#22c55e', '#10b981'], icon: 'Pr' },
];

const GENDERS: { key: Gender; label: string }[] = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
  { key: 'nonbinary', label: 'Non-Binary' },
];

function SectionTitle({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <Animated.Text entering={FadeInUp.delay(delay)} style={styles.sectionTitle}>
      {children}
    </Animated.Text>
  );
}

function ColorSwatch({ color, selected, onPress }: { color: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.swatch, selected && styles.swatchSelected]}>
      <View style={[styles.swatchInner, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const initGame = useGameStore((s) => s.initGame);
  const [name, setName] = useState('');
  const [selectedClique, setSelectedClique] = useState<Clique | null>(null);
  const [step, setStep] = useState<'avatar' | 'clique'>('avatar');

  const [avatar, setAvatar] = useState<AvatarConfig>({
    gender: 'nonbinary',
    skinTone: SKIN_TONES[3],
    hairStyle: 0,
    hairColor: HAIR_COLORS[0],
    eyeColor: EYE_COLORS[0],
    outfit: 0,
    accessory: 0,
  });

  const updateAvatar = useCallback((updates: Partial<AvatarConfig>) => {
    setAvatar((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleStart = () => {
    if (!name.trim() || !selectedClique) return;
    initGame(name.trim(), selectedClique, avatar);
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={colors.gradientDark as unknown as [string, string]} style={styles.gradientBg}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn} style={styles.header}>
          <Text style={styles.title}>High School Sim</Text>
          <Text style={styles.subtitle}>Create your legend</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100)} style={styles.previewContainer}>
          <AvatarPreview config={avatar} size={200} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)}>
          <SectionTitle delay={200}>Your Name</SectionTitle>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={20}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)}>
          <SectionTitle delay={300}>Gender</SectionTitle>
          <View style={styles.genderRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.key}
                style={[styles.genderBtn, avatar.gender === g.key && styles.genderBtnActive]}
                onPress={() => updateAvatar({ gender: g.key })}
              >
                <Text style={[styles.genderText, avatar.gender === g.key && styles.genderTextActive]}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)}>
          <SectionTitle delay={400}>Skin Tone</SectionTitle>
          <View style={styles.row}>
            {SKIN_TONES.map((tone) => (
              <ColorSwatch key={tone} color={tone} selected={avatar.skinTone === tone} onPress={() => updateAvatar({ skinTone: tone })} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500)}>
          <SectionTitle delay={500}>Hair Style</SectionTitle>
          <View style={styles.hairRow}>
            {HAIR_STYLES.map((style, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.hairBtn, avatar.hairStyle === idx && styles.hairBtnActive]}
                onPress={() => updateAvatar({ hairStyle: idx })}
              >
                <Text style={styles.hairText}>{style.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600)}>
          <SectionTitle delay={600}>Hair Color</SectionTitle>
          <View style={styles.row}>
            {HAIR_COLORS.map((color) => (
              <ColorSwatch key={color} color={color} selected={avatar.hairColor === color} onPress={() => updateAvatar({ hairColor: color })} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700)}>
          <SectionTitle delay={700}>Eye Color</SectionTitle>
          <View style={styles.row}>
            {EYE_COLORS.map((color) => (
              <ColorSwatch key={color} color={color} selected={avatar.eyeColor === color} onPress={() => updateAvatar({ eyeColor: color })} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(800)}>
          <SectionTitle delay={800}>Outfit</SectionTitle>
          <View style={styles.outfitRow}>
            {OUTFITS.map((outfit, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.outfitBtn, avatar.outfit === idx && styles.outfitBtnActive]}
                onPress={() => updateAvatar({ outfit: idx })}
              >
                <View style={[styles.outfitColor, { backgroundColor: outfit.color }]} />
                <Text style={styles.outfitText}>{outfit.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(900)}>
          <SectionTitle delay={900}>Accessory</SectionTitle>
          <View style={styles.accessoryRow}>
            {ACCESSORIES.map((acc, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.accessoryBtn, avatar.accessory === idx && styles.accessoryBtnActive]}
                onPress={() => updateAvatar({ accessory: idx })}
              >
                <Text style={styles.accessoryText}>{acc.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(1000)}>
          <SectionTitle delay={1000}>Choose Your Clique</SectionTitle>
          <View style={styles.cliqueGrid}>
            {CLIQUES.map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[styles.cliqueCard, selectedClique === c.key && styles.cliqueCardActive]}
                onPress={() => setSelectedClique(c.key)}
              >
                <LinearGradient colors={c.gradient as [string, string]} style={styles.cliqueIconBg}>
                  <Text style={styles.cliqueIcon}>{c.icon}</Text>
                </LinearGradient>
                <Text style={styles.cliqueLabel}>{c.label}</Text>
                <Text style={styles.cliqueDesc}>{c.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <View style={{ marginTop: spacing.lg, marginBottom: spacing.xxl }}>
          <Button
            title="Start Your Story"
            onPress={handleStart}
            disabled={!name.trim() || !selectedClique}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { padding: spacing.lg, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 36, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 16, color: colors.textMuted, marginTop: 4 },
  previewContainer: { alignItems: 'center', marginBottom: spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md,
    color: colors.text, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  genderRow: { flexDirection: 'row', gap: spacing.sm },
  genderBtn: { flex: 1, backgroundColor: colors.surface, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  genderBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryDark },
  genderText: { color: colors.textMuted, fontWeight: '600' },
  genderTextActive: { color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: { width: 40, height: 40, borderRadius: 20, padding: 3, borderWidth: 2, borderColor: 'transparent' },
  swatchSelected: { borderColor: colors.text },
  swatchInner: { width: '100%', height: '100%', borderRadius: 17 },
  hairRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hairBtn: { backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  hairBtnActive: { borderColor: colors.primary },
  hairText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  outfitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  outfitBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'transparent' },
  outfitBtnActive: { borderColor: colors.primary },
  outfitColor: { width: 16, height: 16, borderRadius: 4 },
  outfitText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  accessoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  accessoryBtn: { backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  accessoryBtnActive: { borderColor: colors.primary },
  accessoryText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  cliqueGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cliqueCard: { width: '48%', backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, borderWidth: 2, borderColor: 'transparent' },
  cliqueCardActive: { borderColor: colors.primary },
  cliqueIconBg: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  cliqueIcon: { fontSize: 18, fontWeight: '900', color: '#fff' },
  cliqueLabel: { color: colors.text, fontSize: 16, fontWeight: '700' },
  cliqueDesc: { color: colors.textMuted, fontSize: 12, marginTop: 4, lineHeight: 16 },
});
