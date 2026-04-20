import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, colors, spacing, radii } from '@repo/ui';
import { useGameStore } from '@repo/game-engine';
import {
  getMonthGrid,
  getMonthName,
  getDayOfMonth,
  getShortWeekDay,
  isWeekend,
  isHoliday,
  getSemesterLabel,
  formatGameDate,
  getDayIcon,
} from '@repo/game-engine/event-calendar';
import {
  getEventsForDay,
  getCurrentSeasonalTheme,
} from '@repo/game-engine/world-events';
import { getAtmosphereDescription } from '@repo/game-engine/atmosphere';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DAY_CELL_SIZE = (width - spacing.lg * 2 - spacing.sm * 6) / 7;

const MONTH_INDEX_LABELS = ['Month 1', 'Month 2', 'Month 3'];

const CATEGORY_COLORS: Record<string, string> = {
  academic: colors.primary,
  social: colors.secondary,
  sports: colors.success,
  arts: '#f59e0b',
  drama: '#a855f7',
  holiday: '#ec4899',
  crisis: colors.danger,
  opportunity: colors.accent,
};

const CATEGORY_LABELS: Record<string, string> = {
  academic: 'Academic',
  social: 'Social',
  sports: 'Sports',
  arts: 'Arts',
  drama: 'Drama',
  holiday: 'Holiday',
  crisis: 'Crisis',
  opportunity: 'Opportunity',
};

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const progress = useGameStore((s) => s.progress);
  const atmosphere = useGameStore((s) => s.atmosphere);
  const upcomingEntries = useGameStore((s) =>
    s.getUpcomingEvents(14)
  );

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(() => {
    return Math.min(2, Math.floor((progress.day - 1) / 30));
  });
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const semester = progress.semester;
  const grid = getMonthGrid(semester, selectedMonthIndex);

  const theme = getCurrentSeasonalTheme(semester, progress.day);
  const atmosphereDesc = getAtmosphereDescription(atmosphere);

  const handleDayPress = useCallback((day: number) => {
    setSelectedDay(day);
  }, []);

  const handleEventPress = useCallback(
    (eventId: string) => {
      router.push({ pathname: '/event-detail', params: { eventId } });
    },
    [router]
  );

  const selectedDayEvents = selectedDay
    ? getEventsForDay(semester, selectedDay)
    : [];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <LinearGradient
      colors={colors.gradientDark }
      style={styles.gradientBg}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>School Calendar</Text>
          <Text style={styles.subtitle}>
            {getSemesterLabel(semester)} • Day {progress.day}
          </Text>
        </View>

        {/* Atmosphere Card */}
        <Card style={styles.atmosphereCard}>
          <View style={styles.atmosphereRow}>
            <View>
              <Text style={styles.atmosphereLabel}>School Atmosphere</Text>
              <Text style={styles.atmosphereValue}>{atmosphereDesc}</Text>
            </View>
            <View style={styles.atmosphereBadge}>
              <Text
                style={[
                  styles.atmosphereScore,
                  {
                    color:
                      atmosphere.overall >= 0 ? colors.success : colors.danger,
                  },
                ]}
              >
                {atmosphere.overall > 0 ? '+' : ''}
                {atmosphere.overall}
              </Text>
            </View>
          </View>
          {theme && (
            <View style={styles.themeRow}>
              <Text style={styles.themeLabel}>Current Season:</Text>
              <Text style={styles.themeName}>{theme.name}</Text>
            </View>
          )}
        </Card>

        {/* Upcoming Events */}
        {upcomingEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.upcomingList}
            >
              {upcomingEntries.slice(0, 5).map((entry, index) => (
                <Animated.View
                  key={`${entry.date.semester}-${entry.date.day}-${index}`}
                  entering={FadeInUp.delay(index * 80)}
                >
                  <TouchableOpacity
                    style={styles.upcomingCard}
                    onPress={() => handleDayPress(entry.date.day)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        colors.gradientSurface 
                      }
                      style={styles.upcomingGradient}
                    >
                      <Text style={styles.upcomingDay}>
                        {getMonthName(entry.date.semester, entry.date.day)}{' '}
                        {getDayOfMonth(entry.date.day)}
                      </Text>
                      {entry.events.map((evt) => (
                        <View key={evt.id} style={styles.upcomingEventRow}>
                          <Text
                            style={[
                              styles.upcomingDot,
                              {
                                color:
                                  CATEGORY_COLORS[evt.category] ??
                                  colors.textMuted,
                              },
                            ]}
                          >
                            ●
                          </Text>
                          <Text
                            style={styles.upcomingEventTitle}
                            numberOfLines={1}
                          >
                            {evt.title}
                          </Text>
                        </View>
                      ))}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          {MONTH_INDEX_LABELS.map((label, index) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.monthTab,
                selectedMonthIndex === index && styles.monthTabActive,
              ]}
              onPress={() => {
                setSelectedMonthIndex(index);
                setSelectedDay(null);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.monthTabText,
                  selectedMonthIndex === index &&
                    styles.monthTabTextActive,
                ]}
              >
                {getMonthName(semester, index * 30 + 1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calendar Grid */}
        <Card style={styles.calendarCard}>
          {/* Weekday headers */}
          <View style={styles.weekDaysRow}>
            {weekDays.map((wd) => (
              <Text key={wd} style={styles.weekDayLabel}>
                {wd}
              </Text>
            ))}
          </View>

          {/* Day grid */}
          {grid.map((week, weekIdx) => (
            <View key={weekIdx} style={styles.weekRow}>
              {week.map((cell, cellIdx) => {
                if (!cell.inMonth || cell.day === 0) {
                  return (
                    <View
                      key={`${weekIdx}-${cellIdx}`}
                      style={styles.dayCellEmpty}
                    />
                  );
                }

                const isSelected = selectedDay === cell.day;
                const isToday =
                  cell.day === progress.day;
                const hasEvents = cell.events.length > 0;
                const weekend = isWeekend(semester, cell.day);
                const holiday = isHoliday(semester, cell.day);
                const icon = getDayIcon(semester, cell.day);

                return (
                  <TouchableOpacity
                    key={`${weekIdx}-${cellIdx}`}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                      isToday && styles.dayCellToday,
                      weekend && styles.dayCellWeekend,
                      holiday.isHoliday && styles.dayCellHoliday,
                    ]}
                    onPress={() => handleDayPress(cell.day)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        isSelected && styles.dayCellTextSelected,
                        isToday && styles.dayCellTextToday,
                        weekend && styles.dayCellTextWeekend,
                        holiday.isHoliday && styles.dayCellTextHoliday,
                      ]}
                    >
                      {cell.day}
                    </Text>
                    {hasEvents && (
                      <View style={styles.eventDots}>
                        {cell.events.slice(0, 3).map((e, i) => (
                          <View
                            key={i}
                            style={[
                              styles.eventDot,
                              {
                                backgroundColor:
                                  CATEGORY_COLORS[e.category] ??
                                  colors.primary,
                              },
                            ]}
                          />
                        ))}
                      </View>
                    )}
                    {holiday.isHoliday && (
                      <Text style={styles.holidayIcon}>★</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </Card>

        {/* Selected Day Detail */}
        {selectedDay && (
          <Animated.View entering={FadeInUp} style={styles.dayDetail}>
            <View style={styles.dayDetailHeader}>
              <Text style={styles.dayDetailTitle}>
                {formatGameDate(semester, selectedDay)}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedDay(null)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedDayEvents.length === 0 ? (
              <Card style={styles.noEventsCard}>
                <Text style={styles.noEventsText}>
                  No events scheduled for this day.
                </Text>
              </Card>
            ) : (
              selectedDayEvents.map((evt) => (
                <TouchableOpacity
                  key={evt.id}
                  onPress={() => handleEventPress(evt.id)}
                  activeOpacity={0.8}
                >
                  <Card style={styles.eventCard} glow>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventIcon}>
                        {getDayIcon(semester, selectedDay)}
                      </Text>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle}>{evt.title}</Text>
                        <View style={styles.eventMetaRow}>
                          <View
                            style={[
                              styles.categoryBadge,
                              {
                                backgroundColor:
                                  CATEGORY_COLORS[evt.category] ??
                                  colors.primary,
                              },
                            ]}
                          >
                            <Text style={styles.categoryBadgeText}>
                              {CATEGORY_LABELS[evt.category] ?? evt.category}
                            </Text>
                          </View>
                          <Text style={styles.eventScope}>{evt.scope}</Text>
                        </View>
                      </View>
                    </View>
                    <Text
                      style={styles.eventDescription}
                      numberOfLines={2}
                    >
                      {evt.description}
                    </Text>
                    <Text style={styles.eventChoices}>
                      {evt.choices.length} choices available →
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </Animated.View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Event Types</Text>
          <View style={styles.legendGrid}>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <View key={key} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: CATEGORY_COLORS[key] ?? colors.text },
                  ]}
                />
                <Text style={styles.legendText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  atmosphereCard: {
    marginBottom: spacing.md,
  },
  atmosphereRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  atmosphereLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  atmosphereValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  atmosphereBadge: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  atmosphereScore: {
    fontSize: 16,
    fontWeight: '800',
  },
  themeRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  themeLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginRight: spacing.xs,
  },
  themeName: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  upcomingList: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  upcomingCard: {
    borderRadius: radii.md,
    overflow: 'hidden',
    width: 160,
  },
  upcomingGradient: {
    padding: spacing.sm,
  },
  upcomingDay: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  upcomingEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  upcomingDot: {
    fontSize: 10,
    marginRight: 4,
  },
  upcomingEventTitle: {
    fontSize: 11,
    color: colors.textMuted,
    flex: 1,
  },
  monthSelector: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  monthTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  monthTabActive: {
    backgroundColor: colors.primaryDark,
  },
  monthTabText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  monthTabTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  calendarCard: {
    marginBottom: spacing.md,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekDayLabel: {
    width: DAY_CELL_SIZE,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dayCell: {
    width: DAY_CELL_SIZE,
    height: DAY_CELL_SIZE + 8,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    backgroundColor: 'transparent',
  },
  dayCellEmpty: {
    width: DAY_CELL_SIZE,
    height: DAY_CELL_SIZE + 8,
    margin: 1,
  },
  dayCellSelected: {
    backgroundColor: colors.primaryDark,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayCellWeekend: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  dayCellHoliday: {
    backgroundColor: 'rgba(236,72,153,0.08)',
  },
  dayCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dayCellTextSelected: {
    color: '#fff',
    fontWeight: '800',
  },
  dayCellTextToday: {
    color: colors.primaryLight,
    fontWeight: '800',
  },
  dayCellTextWeekend: {
    color: colors.textSecondary,
  },
  dayCellTextHoliday: {
    color: colors.secondaryLight,
  },
  eventDots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  holidayIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 8,
    color: colors.secondary,
  },
  dayDetail: {
    marginBottom: spacing.md,
  },
  dayDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dayDetailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  noEventsCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  noEventsText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  eventCard: {
    marginBottom: spacing.sm,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  eventIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventScope: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  eventDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  eventChoices: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  legend: {
    marginTop: spacing.sm,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
