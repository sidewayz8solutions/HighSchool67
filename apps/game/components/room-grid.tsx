import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors, spacing } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import type { RoomItem, PlacedItem } from '@repo/types';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_SIZE = 8;
const CELL_MARGIN = 2;
const GRID_PADDING = 8;
const AVAILABLE_WIDTH = SCREEN_W - spacing.md * 2 - GRID_PADDING * 2;
const CELL_SIZE = Math.floor((AVAILABLE_WIDTH - CELL_MARGIN * (GRID_SIZE - 1)) / GRID_SIZE);

const RARITY_COLORS: Record<string, string> = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

const CATEGORY_ICONS: Record<string, string> = {
  furniture: '🪑',
  wall: '🧱',
  floor: '🏠',
  poster: '🖼️',
  lighting: '💡',
  clothing: '👕',
};

export default function RoomGridEditor() {
  const room = useGameStore((s) => s.player.room);
  const inventory = useGameStore((s) => s.player.inventory);
  const placeRoomItem = useGameStore((s) => s.placeRoomItem);
  const removeRoomItem = useGameStore((s) => s.removeRoomItem);

  const [selectedItem, setSelectedItem] = useState<RoomItem | null>(null);
  const [selectedPlaced, setSelectedPlaced] = useState<PlacedItem | null>(null);

  const canPlace = useCallback(
    (item: RoomItem, x: number, y: number): boolean => {
      const w = item.gridSize?.width ?? 1;
      const h = item.gridSize?.height ?? 1;
      if (x + w > GRID_SIZE || y + h > GRID_SIZE) return false;

      // Check overlap with existing items
      for (const placed of room.items) {
        const pw = placed.gridSize?.width ?? 1;
        const ph = placed.gridSize?.height ?? 1;
        if (
          x < placed.position.x + pw &&
          x + w > placed.position.x &&
          y < placed.position.y + ph &&
          y + h > placed.position.y
        ) {
          return false;
        }
      }
      return true;
    },
    [room.items]
  );

  const handleCellPress = (x: number, y: number) => {
    // Check if there's an item here
    const placed = room.items.find((item) => {
      const w = item.gridSize?.width ?? 1;
      const h = item.gridSize?.height ?? 1;
      return x >= item.position.x && x < item.position.x + w && y >= item.position.y && y < item.position.y + h;
    });

    if (placed) {
      setSelectedPlaced(placed);
      setSelectedItem(null);
      return;
    }

    if (selectedItem) {
      if (canPlace(selectedItem, x, y)) {
        placeRoomItem({
          ...selectedItem,
          position: { x, y },
          rotation: 0,
        });
        setSelectedItem(null);
      }
    }
  };

  const handleRotate = () => {
    if (!selectedPlaced) return;
    const oldW = selectedPlaced.gridSize?.width ?? 1;
    const oldH = selectedPlaced.gridSize?.height ?? 1;
    const newWidth = oldH;
    const newHeight = oldW;

    // Check if rotation is valid
    if (selectedPlaced.position.x + newWidth > GRID_SIZE || selectedPlaced.position.y + newHeight > GRID_SIZE) {
      return;
    }

    // Check overlap with other items (excluding the one being rotated)
    for (const placed of room.items) {
      if (placed.id === selectedPlaced.id && placed.position.x === selectedPlaced.position.x && placed.position.y === selectedPlaced.position.y) {
        continue;
      }
      const pw = placed.gridSize?.width ?? 1;
      const ph = placed.gridSize?.height ?? 1;
      if (
        selectedPlaced.position.x < placed.position.x + pw &&
        selectedPlaced.position.x + newWidth > placed.position.x &&
        selectedPlaced.position.y < placed.position.y + ph &&
        selectedPlaced.position.y + newHeight > placed.position.y
      ) {
        return; // Would overlap
      }
    }

    // Remove old placement and add rotated version
    removeRoomItem(selectedPlaced.id, { x: selectedPlaced.position.x, y: selectedPlaced.position.y });
    placeRoomItem({
      ...selectedPlaced,
      gridSize: { width: newWidth, height: newHeight },
      rotation: ((selectedPlaced.rotation ?? 0) + 90) % 360 as 0 | 90 | 180 | 270,
      position: { x: selectedPlaced.position.x, y: selectedPlaced.position.y },
    });
    setSelectedPlaced(null);
  };

  const handleRemove = () => {
    if (!selectedPlaced) return;
    removeRoomItem(selectedPlaced.id, { x: selectedPlaced.position.x, y: selectedPlaced.position.y });
    setSelectedPlaced(null);
  };

  // Build a lookup for which cells have items
  const cellMap: (PlacedItem | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );

  for (const item of room.items) {
    const w = item.gridSize?.width ?? 1;
    const h = item.gridSize?.height ?? 1;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const cx = item.position.x + dx;
        const cy = item.position.y + dy;
        if (cx < GRID_SIZE && cy < GRID_SIZE) {
          cellMap[cy][cx] = item;
        }
      }
    }
  }

  return (
    <View>
      <View style={[styles.gridContainer, { backgroundColor: room.wallColor }]}>
        {Array.from({ length: GRID_SIZE }).map((_, y) => (
          <View key={y} style={styles.row}>
            {Array.from({ length: GRID_SIZE }).map((_, x) => {
              const placed = cellMap[y][x];
              const isOrigin = placed && placed.position.x === x && placed.position.y === y;
              const isSelected = selectedPlaced && placed && selectedPlaced.id === placed.id && selectedPlaced.position.x === placed.position.x && selectedPlaced.position.y === placed.position.y;

              return (
                <TouchableOpacity
                  key={x}
                  activeOpacity={0.7}
                  onPress={() => handleCellPress(x, y)}
                  style={[
                    styles.cell,
                    {
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      marginRight: x < GRID_SIZE - 1 ? CELL_MARGIN : 0,
                      marginBottom: y < GRID_SIZE - 1 ? CELL_MARGIN : 0,
                    },
                    placed && { backgroundColor: `${RARITY_COLORS[placed.rarity]}40`, borderColor: RARITY_COLORS[placed.rarity] },
                    isSelected && { borderWidth: 2, borderColor: colors.primary },
                  ]}
                >
                  {isOrigin && (
                    <View style={styles.itemLabel}>
                      <Text style={styles.itemLabelText}>
                        {CATEGORY_ICONS[placed.category] ?? '📦'} {placed.name}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {selectedPlaced && (
        <Animated.View entering={ZoomIn} exiting={ZoomOut} style={styles.actionBar}>
          <Text style={styles.actionTitle}>{selectedPlaced.name}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleRemove}>
              <Text style={styles.actionBtnText}>📦 Return to Inventory</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <Text style={styles.sectionTitle}>Inventory</Text>
      <View style={styles.inventoryGrid}>
        {inventory.length === 0 ? (
          <Text style={styles.emptyText}>No items in inventory. Visit the Shop!</Text>
        ) : (
          inventory.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedItem(item);
                setSelectedPlaced(null);
              }}
              style={[
                styles.invItem,
                selectedItem?.id === item.id && { borderColor: colors.primary, borderWidth: 2 },
              ]}
            >
              <Text style={styles.invIcon}>{CATEGORY_ICONS[item.category] ?? '📦'}</Text>
              <Text style={styles.invName}>{item.name}</Text>
              <Text style={[styles.invRarity, { color: RARITY_COLORS[item.rarity] }]}>{item.rarity}</Text>
              <Text style={styles.invSize}>
                {item.gridSize?.width ?? 1}x{item.gridSize?.height ?? 1}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {selectedItem && (
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>
            Tap a cell to place <Text style={{ fontWeight: '700' }}>{selectedItem.name}</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    padding: GRID_PADDING,
    borderRadius: 12,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemLabel: {
    padding: 2,
  },
  itemLabelText: {
    fontSize: 8,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionBar: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  actionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  invItem: {
    width: '30%',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceHighlight,
  },
  invIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  invName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  invRarity: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  invSize: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
    paddingVertical: spacing.md,
  },
  hintBar: {
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  hintText: {
    color: colors.text,
    fontSize: 14,
  },
});
