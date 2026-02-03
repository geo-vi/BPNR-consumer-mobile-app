import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Bell, ChevronDown } from 'lucide-react-native';
import { isLiquidGlassSupported } from '@callstack/liquid-glass';
import { useAtom, useAtomValue } from 'jotai';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassSurface } from './GlassSurface';
import { IconButton } from './IconButton';
import {
  companiesAtom,
  notificationsUnreadCountAtom,
  selectedCompanyIdAtom,
} from '../../state/session';
import { useTheme } from '../../theme/ThemeProvider';

export function AppTopBar() {
  const theme = useTheme();
  const fg = theme.colors.text;
  const mutedFg = theme.colors.textMuted;
  const modalBg = theme.colors.sheet;

  const companies = useAtomValue(companiesAtom);
  const [selectedCompanyId, setSelectedCompanyId] = useAtom(selectedCompanyIdAtom);
  const unread = useAtomValue(notificationsUnreadCountAtom);

  const selectedCompany = useMemo(
    () => companies.find(c => c.id === selectedCompanyId) ?? companies[0],
    [companies, selectedCompanyId],
  );

  const [companyPickerOpen, setCompanyPickerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const openNotifications = () => setNotificationsOpen(true);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.row}>
        <GlassSurface style={styles.companySurface} effect="regular" interactive>
          <Pressable
            accessibilityRole="button"
            onPress={() => setCompanyPickerOpen(true)}
            style={({ pressed }) => [styles.companyButton, pressed && styles.pressed]}
          >
            <Text numberOfLines={1} style={[styles.companyText, { color: fg }]}>
              {selectedCompany?.name ?? 'Select company'}
            </Text>
            <ChevronDown size={16} color={mutedFg} />
          </Pressable>
        </GlassSurface>

        <GlassSurface
          style={styles.notificationsSurface}
          effect="regular"
          interactive
          accessible={isLiquidGlassSupported}
          accessibilityRole={isLiquidGlassSupported ? 'button' : undefined}
          accessibilityLabel={isLiquidGlassSupported ? 'Notifications' : undefined}
          onTouchEnd={isLiquidGlassSupported ? openNotifications : undefined}
          onAccessibilityTap={isLiquidGlassSupported ? openNotifications : undefined}
        >
          <View
            style={styles.badgeWrap}
            pointerEvents={isLiquidGlassSupported ? 'none' : 'auto'}
          >
            {isLiquidGlassSupported ? (
              <Bell color={fg} size={20} />
            ) : (
              <IconButton
                accessibilityLabel="Notifications"
                icon={Bell}
                color={fg}
                onPress={openNotifications}
                style={styles.notificationsButton}
              />
            )}
            {unread > 0 ? (
              <View style={[styles.badge, { backgroundColor: theme.colors.notification }]}>
                <Text style={styles.badgeText}>
                  {unread > 99 ? '99+' : String(unread)}
                </Text>
              </View>
            ) : null}
          </View>
        </GlassSurface>
      </View>

      <Modal
        animationType="fade"
        visible={companyPickerOpen}
        transparent
        onRequestClose={() => setCompanyPickerOpen(false)}
      >
        <ModalBackdrop onPress={() => setCompanyPickerOpen(false)} />
        <View style={[styles.modalCard, { backgroundColor: modalBg }]}>
          <Text style={[styles.modalTitle, { color: fg }]}>Select company</Text>
          <FlatList
            data={companies}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={Separator}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setSelectedCompanyId(item.id);
                  setCompanyPickerOpen(false);
                }}
                style={({ pressed }) => [styles.modalRow, pressed && styles.pressed]}
              >
                <Text style={[styles.modalRowText, { color: fg }]}>
                  {item.name}
                </Text>
                {item.id === selectedCompanyId ? (
                  <Text style={[styles.selectedPill, { color: fg }]}>Selected</Text>
                ) : null}
              </Pressable>
            )}
          />
        </View>
      </Modal>

      <Modal
        animationType="slide"
        visible={notificationsOpen}
        transparent
        onRequestClose={() => setNotificationsOpen(false)}
      >
        <ModalBackdrop onPress={() => setNotificationsOpen(false)} />
        <View style={[styles.modalCard, { backgroundColor: modalBg }]}>
          <Text style={[styles.modalTitle, { color: fg }]}>Notifications</Text>
          <Text style={[styles.modalHint, { color: mutedFg }]}>
            Notification inbox will be wired to the backend; this is a placeholder.
          </Text>
          <View style={styles.placeholderRow}>
            <Text style={[styles.placeholderTitle, { color: fg }]}>No notifications yet</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Separator() {
  const theme = useTheme();
  return (
    <View style={[styles.separator, { backgroundColor: theme.colors.separator }]} />
  );
}

function ModalBackdrop({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close"
      onPress={onPress}
      style={[styles.backdrop, { backgroundColor: theme.colors.backdrop }]}
    />
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 8,
    gap: 10,
  },
  companySurface: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  notificationsSurface: {
    width: 44,
    height: 44,
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 44,
  },
  companyText: {
    maxWidth: 220,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
  badgeWrap: {
    position: 'relative',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationsButton: {
    width: 44,
    height: 44,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    marginHorizontal: 16,
    marginTop: 80,
    borderRadius: 18,
    overflow: 'hidden',
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalHint: {
    fontSize: 13,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  modalRowText: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  selectedPill: {
    fontSize: 12,
    opacity: 0.7,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  placeholderRow: {
    paddingVertical: 12,
  },
  placeholderTitle: {
    fontWeight: '600',
  },
});
