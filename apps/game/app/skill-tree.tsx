import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Button, colors, spacing, radii } from '@repo/ui';
import { useGameStore, SKILL_TREES, getSkillPointsAvailable } from '@repo/game-engine';
import type { SkillTreeId, SkillNode } from '@repo/types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Constants ──────────────────────────────────────────────────────

const TREE_TAB_COLORS: Record<SkillTreeId, readonly [string, string, string]> = {
  academics: ['#3b82f6', '#60a5fa', '#2563eb'] as const,
  athletics: ['#22c55e', '#4ade80', '#16a34a'] as const,
  creativity: ['#a855f7', '#c084fc', '#9333ea'] as const,
  popularity: ['#ec4899', '#f472b6', '#db2777'] as const,
  rebellion: ['#6b7280', '#9ca3af', '#4b5563'] as const,
};

const TREE_ICONS: Record<SkillTreeId, string> = {
  academics: '📚',
  athletics: '🏆',
  creativity: '🎨',
  popularity: '✨',
  rebellion: '🔥',
};

const TREE_NAMES: Record<SkillTreeId, string> = {
  academics: 'Academics',
  athletics: 'Athletics',
  creativity: 'Creativity',
  popularity: 'Popularity',
  rebellion: 'Rebellion',
};

const BRANCH_LABELS: Record<string, string> = {
  left: 'Branch 1',
  center: 'Branch 2',
  right: 'Branch 3',
};

// ─── Skill Node Component ───────────────────────────────────────────

function SkillNodeCard({
  node,
  isAvailable,
  onPress,
  treeColor,
  index,
}: {
  node: SkillNode;
  isAvailable: boolean;
  onPress: () => void;
  treeColor: string;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const nodeStyle = [
    styles.nodeCard,
    node.purchased && { borderColor: treeColor, backgroundColor: `${treeColor}30`, borderWidth: 2 },
    !node.purchased && node.unlocked && isAvailable && { borderColor: treeColor, borderWidth: 1.5, borderStyle: 'dashed' as const },
    !node.unlocked && { borderColor: colors.surfaceHighlight, backgroundColor: colors.surface, opacity: 0.6 },
  ];

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 50).duration(300)}
      style={[nodeStyle, animatedStyle]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        disabled={!node.unlocked && !node.purchased}
        style={styles.nodeTouchable}
      >
        <View style={[styles.nodeIconWrap, { backgroundColor: node.purchased ? `${treeColor}50` : colors.surfaceHighlight }]}>
          <Text style={styles.nodeIcon}>{node.icon}</Text>
          {node.purchased && (
            <View style={[styles.purchasedBadge, { backgroundColor: treeColor }]}>
              <Text style={styles.purchasedCheck}>✓</Text>
            </View>
          )}
        </View>
        <Text style={[styles.nodeName, node.purchased && { color: treeColor }]} numberOfLines={1}>
          {node.name}
        </Text>
        <Text style={styles.nodeCost}>{node.cost} SP</Text>
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>T{node.tier}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Connection Line ────────────────────────────────────────────────

function ConnectionLine({
  fromPurchased,
  toPurchased,
  treeColor,
}: {
  fromPurchased: boolean;
  toPurchased: boolean;
  treeColor: string;
}) {
  const lineColor = fromPurchased && toPurchased
    ? treeColor
    : fromPurchased
    ? `${treeColor}80`
    : colors.surfaceHighlight;

  return (
    <View style={styles.connectionContainer}>
      <View style={[styles.connectionLine, { backgroundColor: lineColor }]} />
      {(fromPurchased || toPurchased) && (
        <View style={[styles.connectionDot, { backgroundColor: lineColor }]} />
      )}
    </View>
  );
}

// ─── Node Detail Sheet ──────────────────────────────────────────────

function NodeDetailSheet({
  node,
  visible,
  onClose,
  onPurchase,
  treeColor,
  canAfford,
}: {
  node: SkillNode | null;
  visible: boolean;
  onClose: () => void;
  onPurchase: () => void;
  treeColor: string;
  canAfford: boolean;
}) {
  if (!node) return null;

  const hasStatBonus = node.effects.statBonus && Object.keys(node.effects.statBonus).length > 0;
  const hasActionBonus = node.effects.actionBonus && Object.keys(node.effects.actionBonus).length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View entering={FadeInUp.duration(300)} style={styles.modalContent}>
          <LinearGradient
            colors={[colors.surface, colors.surfaceHighlight]}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: `${treeColor}40` }]}>
                <Text style={styles.modalIcon}>{node.icon}</Text>
              </View>
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, { color: treeColor }]}>{node.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {TREE_NAMES[node.treeId]} · Tier {node.tier} · {BRANCH_LABELS[node.branch]}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.modalDescription}>{node.description}</Text>

            {/* Effects */}
            {(hasStatBonus || hasActionBonus || node.effects.unlockAction || node.effects.unlockFeature) && (
              <View style={styles.effectsSection}>
                <Text style={styles.effectsTitle}>Effects</Text>
                {hasStatBonus && Object.entries(node.effects.statBonus!).map(([key, val]) => (
                  <View key={key} style={styles.effectRow}>
                    <Text style={styles.effectIcon}>📈</Text>
                    <Text style={styles.effectText}>
                      +{val} {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                  </View>
                ))}
                {hasActionBonus && Object.entries(node.effects.actionBonus!).map(([key, val]) => (
                  <View key={key} style={styles.effectRow}>
                    <Text style={styles.effectIcon}>⚡</Text>
                    <Text style={styles.effectText}>
                      {key}: {typeof val === 'number' && val < 2 ? `+${Math.round((val - 1) * 100)}%` : `x${val}`}
                    </Text>
                  </View>
                ))}
                {node.effects.unlockAction && (
                  <View style={styles.effectRow}>
                    <Text style={styles.effectIcon}>🔓</Text>
                    <Text style={styles.effectText}>Unlocks action: {node.effects.unlockAction}</Text>
                  </View>
                )}
                {node.effects.unlockFeature && (
                  <View style={styles.effectRow}>
                    <Text style={styles.effectIcon}>🌟</Text>
                    <Text style={styles.effectText}>Unlocks feature: {node.effects.unlockFeature}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Requirements */}
            <View style={styles.reqSection}>
              <Text style={styles.reqTitle}>Requirements</Text>
              <Text style={styles.reqText}>
                Cost: {node.cost} Skill Points{'\n'}
                {node.requirements.minStat && `Min Stat: ${node.requirements.minStat}\n`}
                {node.requirements.minSemester && `Min Semester: ${node.requirements.minSemester}\n`}
                {node.requirements.parentNodeIds.length > 0 && `Requires: ${node.requirements.parentNodeIds.length} parent node(s)`}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalButtons}>
              {!node.purchased && node.unlocked && (
                <Button
                  title={canAfford ? `Unlock (${node.cost} SP)` : 'Not enough SP'}
                  onPress={onPurchase}
                  disabled={!canAfford}
                  style={{ flex: 1, marginRight: spacing.sm }}
                />
              )}
              {!node.unlocked && (
                <Button
                  title="Locked"
                  onPress={() => {}}
                  disabled
                  style={{ flex: 1, marginRight: spacing.sm }}
                />
              )}
              <Button title="Close" variant="ghost" onPress={onClose} />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Skill Tree Screen ──────────────────────────────────────────────

export default function SkillTreeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SkillTreeId>('academics');
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState('');

  const {
    player,
    skillTrees,
    purchasedSkillNodes,
    purchaseSkillNode,
  } = useGameStore();

  const skillPoints = getSkillPointsAvailable(player);
  const currentTree = skillTrees[activeTab];
  const treeColors = TREE_TAB_COLORS[activeTab];

  const handleNodePress = useCallback((node: SkillNode) => {
    setSelectedNode(node);
    setModalVisible(true);
  }, []);

  const handlePurchase = useCallback(() => {
    if (!selectedNode) return;
    const result = purchaseSkillNode(selectedNode.id, activeTab);
    setPurchaseMessage(result.message);

    if (result.success) {
      setModalVisible(false);
      setSelectedNode(null);
    }

    // Clear message after delay
    setTimeout(() => setPurchaseMessage(''), 2000);
  }, [selectedNode, activeTab, purchaseSkillNode]);

  // Group nodes by branch and tier
  const branches = ['left', 'center', 'right'] as const;
  const tiers = [1, 2, 3, 4] as const;

  const getNodesForBranchAndTier = (branch: typeof branches[number], tier: typeof tiers[number]) => {
    return currentTree.nodes.filter((n) => n.branch === branch && n.tier === tier);
  };

  const isNodeAvailable = (node: SkillNode) => {
    if (node.purchased) return true;
    return skillPoints >= node.cost;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={treeColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Skill Trees</Text>
          <View style={styles.spCounter}>
            <Text style={styles.spIcon}>⚡</Text>
            <Text style={styles.spValue}>{skillPoints}</Text>
            <Text style={styles.spLabel}>SP</Text>
          </View>
        </View>

        {/* Tree Tabs */}
        <View style={styles.tabsRow}>
          {(Object.keys(TREE_NAMES) as SkillTreeId[]).map((treeId) => {
            const isActive = treeId === activeTab;
            return (
              <TouchableOpacity
                key={treeId}
                onPress={() => setActiveTab(treeId)}
                style={[
                  styles.tabBtn,
                  isActive && { backgroundColor: 'rgba(255,255,255,0.25)' },
                ]}
              >
                <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                  {TREE_ICONS[treeId]}
                </Text>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {TREE_NAMES[treeId]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>

      {/* Purchase message toast */}
      {purchaseMessage ? (
        <Animated.View entering={FadeInDown} style={styles.toast}>
          <Text style={styles.toastText}>{purchaseMessage}</Text>
        </Animated.View>
      ) : null}

      {/* Skill Tree Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(400)} key={activeTab}>
          {/* Tree Title */}
          <View style={styles.treeHeader}>
            <Text style={[styles.treeTitle, { color: treeColors[0] }]}>
              {TREE_ICONS[activeTab]} {currentTree.name}
            </Text>
            <Text style={styles.treeDescription}>{currentTree.description}</Text>
            {/* Progress */}
            <View style={styles.progressRow}>
              <View style={[styles.progressBar, { backgroundColor: `${treeColors[0]}30` }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: treeColors[0],
                      width: `${(purchasedSkillNodes.filter((id) => id.startsWith(activeTab)).length / 12) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {purchasedSkillNodes.filter((id) => id.startsWith(activeTab)).length}/12
              </Text>
            </View>
          </View>

          {/* Branches */}
          {branches.map((branch, branchIdx) => (
            <View key={branch} style={styles.branchSection}>
              <Text style={[styles.branchTitle, { color: treeColors[0] }]}>
                {BRANCH_LABELS[branch]}
              </Text>
              <View style={styles.tierRows}>
                {tiers.map((tier) => {
                  const nodes = getNodesForBranchAndTier(branch, tier);
                  return (
                    <View key={tier} style={styles.tierRow}>
                      {/* Connection line from previous tier */}
                      {tier > 1 && (
                        <ConnectionLine
                          fromPurchased={getNodesForBranchAndTier(branch, (tier - 1) as 1 | 2 | 3 | 4).some((n) => n.purchased)}
                          toPurchased={nodes.some((n) => n.purchased)}
                          treeColor={treeColors[0]}
                        />
                      )}
                      <View style={styles.tierNodesRow}>
                        {nodes.map((node, nodeIdx) => (
                          <SkillNodeCard
                            key={node.id}
                            node={node}
                            isAvailable={isNodeAvailable(node)}
                            onPress={() => handleNodePress(node)}
                            treeColor={treeColors[0]}
                            index={branchIdx * 4 + tier - 1 + nodeIdx}
                          />
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

          <View style={{ height: spacing.xxl }} />
        </Animated.View>
      </ScrollView>

      {/* Node Detail Modal */}
      <NodeDetailSheet
        node={selectedNode}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedNode(null);
        }}
        onPurchase={handlePurchase}
        treeColor={treeColors[0]}
        canAfford={selectedNode ? skillPoints >= selectedNode.cost : false}
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingTop: 48,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backBtn: {
    paddingVertical: spacing.sm,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  spCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  spIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  spValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  spLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.sm,
  },
  tabBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    flex: 1,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.7,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  treeHeader: {
    marginBottom: spacing.lg,
  },
  treeTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  treeDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    width: 36,
    textAlign: 'right',
  },
  branchSection: {
    marginBottom: spacing.lg,
  },
  branchTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
    opacity: 0.8,
  },
  tierRows: {
    gap: spacing.sm,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionContainer: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  connectionLine: {
    width: 2,
    height: 24,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 10,
  },
  tierNodesRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  nodeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.surfaceHighlight,
    overflow: 'hidden',
  },
  nodeTouchable: {
    padding: spacing.sm,
    alignItems: 'center',
  },
  nodeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  nodeIcon: {
    fontSize: 22,
  },
  purchasedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  purchasedCheck: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  nodeName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  nodeCost: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  tierBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  tierText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden',
    maxHeight: SCREEN_H * 0.7,
  },
  modalGradient: {
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  modalIcon: {
    fontSize: 28,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  effectsSection: {
    marginBottom: spacing.md,
  },
  effectsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  effectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  effectIcon: {
    marginRight: spacing.sm,
    fontSize: 14,
  },
  effectText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reqSection: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reqTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reqText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  // Toast
  toast: {
    position: 'absolute',
    top: 120,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radii.lg,
    padding: spacing.md,
    zIndex: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success,
  },
  toastText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
});
