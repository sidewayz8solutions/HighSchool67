#!/usr/bin/env python3
"""Batch-fix hardcoded paddingTop across game app screens."""
import re, os, sys

BASE = "/Users/sidewayz8/Desktop/highschool67/HighSchool67/apps/game/app"

FILES = [
    "(tabs)/index.tsx", "(tabs)/school.tsx", "(tabs)/minigame-hub.tsx",
    "(tabs)/room.tsx", "(tabs)/social.tsx", "(tabs)/story.tsx",
    "(tabs)/profile.tsx", "(tabs)/shop.tsx",
    "index.tsx", "friends.tsx", "gift-exchange.tsx", "leaderboard.tsx",
    "tournament.tsx", "daily-rewards.tsx", "event-detail.tsx", "career.tsx",
    "auth.tsx", "skill-tree.tsx", "social-feed.tsx", "calendar.tsx",
    "ai-dialogue.tsx", "season-pass.tsx", "story-chapter.tsx",
    "math-blitz.tsx", "football-toss.tsx", "dance-battle.tsx",
    "memory-match.tsx", "art-studio.tsx", "coding-challenge.tsx",
    "photo-hunt.tsx", "rhythm-strike.tsx", "word-blitz.tsx", "debate-club.tsx",
]

IMPORT_LINE = "import { useSafeAreaInsets } from 'react-native-safe-area-context';\n"

def find_default_export_start(lines):
    """Find the line index of 'export default function' or similar."""
    for i, line in enumerate(lines):
        if re.search(r'export\s+default\s+function\s+\w+', line):
            return i
    return None

def find_first_const_after(lines, start_idx):
    """Find first 'const ' declaration after start_idx (inside the function)."""
    for i in range(start_idx + 1, min(start_idx + 15, len(lines))):
        if re.match(r'\s+const\s+', lines[i]):
            return i
    return start_idx + 1

def fix_file(path):
    with open(path, 'r') as f:
        content = f.read()
    lines = content.splitlines(keepends=True)
    original = content

    # Only process if there's a hardcoded paddingTop
    if not re.search(r'paddingTop:\s*(60|48)', content):
        return False, "no hardcoded paddingTop"

    # 1. Add import if missing
    if 'useSafeAreaInsets' not in content:
        # Find a good place: after last import from 'react-native' or 'react-native-*'
        insert_idx = 0
        for i, line in enumerate(lines):
            if line.strip().startswith('import ') and ('react-native' in line or 'expo-' in line):
                insert_idx = i + 1
        lines.insert(insert_idx, IMPORT_LINE)

    # Rebuild content for further processing
    content = ''.join(lines)
    lines = content.splitlines(keepends=True)

    # 2. Add const insets inside default export function
    if 'const insets = useSafeAreaInsets()' not in content:
        export_idx = find_default_export_start(lines)
        if export_idx is not None:
            const_idx = find_first_const_after(lines, export_idx)
            indent = len(lines[const_idx]) - len(lines[const_idx].lstrip())
            indent_str = lines[const_idx][:indent]
            lines.insert(const_idx, f"{indent_str}const insets = useSafeAreaInsets();\n")

    content = ''.join(lines)

    # 3. Replace contentContainerStyle={styles.container} patterns
    # For ScrollView/FlatList with contentContainerStyle={styles.container} where container has paddingTop: 60
    if 'paddingTop: 60' in content:
        content = re.sub(
            r'contentContainerStyle=\{styles\.container\}',
            'contentContainerStyle={[styles.container, { paddingTop: insets.top + 12 }]}',
            content
        )
        content = re.sub(
            r'contentContainerStyle=\{styles\.scrollContent\}',
            'contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 12 }]}',
            content
        )
        # Remove paddingTop: 60 from styles
        content = re.sub(r',\s*paddingTop:\s*60', '', content)
        content = re.sub(r'paddingTop:\s*60,\s*', '', content)

    # 4. Replace View style={styles.container} where container has paddingTop: 48
    if 'paddingTop: 48' in content:
        # For mini-games and other views
        # Pattern A: style={styles.container} -> style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 12 }]}
        content = re.sub(
            r'style=\{styles\.container\}',
            'style={[styles.container, { paddingTop: Math.max(insets.top, 16) + 12 }]}',
            content
        )
        # Pattern B: style={styles.gameContainer}
        content = re.sub(
            r'style=\{styles\.gameContainer\}',
            'style={[styles.gameContainer, { paddingTop: Math.max(insets.top, 16) + 12 }]}',
            content
        )
        # Pattern C: style={styles.headerGradient} in daily-rewards etc
        content = re.sub(
            r'style=\{styles\.headerGradient\}',
            'style={[styles.headerGradient, { paddingTop: Math.max(insets.top, 16) + 12 }]}',
            content
        )
        # Pattern D: style={styles.hud} in dance-battle etc (hud should just use insets.top)
        content = re.sub(
            r'style=\{styles\.hud\}',
            'style={[styles.hud, { paddingTop: Math.max(insets.top, 16) + 8 }]}',
            content
        )
        # Pattern E: style={styles.modalOverlay} (some have paddingTop: 48)
        content = re.sub(
            r'style=\{styles\.modalOverlay\}',
            'style={[styles.modalOverlay, { paddingTop: Math.max(insets.top, 16) + 12 }]}',
            content
        )
        # Pattern F: style={styles.gameArea} or similar
        content = re.sub(
            r'style=\{styles\.gameArea\}',
            'style={[styles.gameArea, { paddingTop: Math.max(insets.top, 16) + 12 }]}',
            content
        )

        # Remove paddingTop: 48 from styles
        content = re.sub(r',\s*paddingTop:\s*48', '', content)
        content = re.sub(r'paddingTop:\s*48,\s*', '', content)
        content = re.sub(r'\s+paddingTop:\s*48\s*', '', content)

    if content == original:
        return False, "no changes made"

    with open(path, 'w') as f:
        f.write(content)
    return True, "fixed"

if __name__ == '__main__':
    for rel in FILES:
        path = os.path.join(BASE, rel)
        if not os.path.exists(path):
            print(f"SKIP (missing): {rel}")
            continue
        ok, msg = fix_file(path)
        print(f"{'FIX' if ok else 'SKIP'} ({msg}): {rel}")
