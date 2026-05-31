import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const COLORS = {
  navy: '#022B5B',
  navyDark: '#001B3D',
  blue: '#0F62FE',
  lightBlue: '#EAF2FF',
  background: '#F4F7FB',
  card: '#FFFFFF',
  text: '#101828',
  muted: '#667085',
  border: '#D7E3F5',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',
  white: '#FFFFFF',
  softBlue: '#F4F8FF',
  softGreen: '#F1FBF4',
  softOrange: '#FFF8EE',
  softPurple: '#F7F3FF',
};

const MOCK_ACCESS_CODES = [
  {
    email: 'parent@test.com',
    code: 'MIA-4821',
    role: 'parent',
    label: 'Parent Access',
    description: 'Opens Mia Carter parent view only',
  },
  {
    email: 'staff@test.com',
    code: 'STAFF-9142',
    role: 'staff',
    label: 'Staff Access',
    description: 'Opens staff tools',
  },
  {
    email: 'owner@test.com',
    code: 'OWNER-0001',
    role: 'owner',
    label: 'Owner Access',
    description: 'Opens owner tools later',
  },
];

const PARENT_CHILD = {
  name: 'Mia Carter',
  status: 'Checked In',
  beforeAfterCare: 'Enrolled',
  summerCamp: 'Registered',
  billing: 'Current',
  notifications: '2 New',
};

const STAFF_MEMBER = {
  name: 'Ms. Sarah',
  status: 'Checked Out',
  shift: '7:30 AM - 4:00 PM',
  hours: '28.5 Hours This Week',
  checkInOut: 'Tap to log staff arrival or departure.',
  studentCheck: 'Tap to mark a student check-in or check-out.',
  campHeadcount: '24 Students Present',
};

const OWNER_MODULES = [
  'Before & After Care',
  'Summer Camp',
  'Students',
  'Staff',
  'Parents',
  'Billing',
  'Reports',
  'Messages',
];

function ScreenShell({ children, title, subtitle, badge, titleMaxWidth }) {
  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <View style={styles.heroOrbLarge} />
        <View style={styles.heroOrbSmall} />
        <View style={styles.heroTopRow}>
          <Pressable accessibilityRole="button" style={styles.headerIconButton}>
            <Text style={styles.headerIcon}>☰</Text>
          </Pressable>

          <View style={styles.brandLockup}>
            <View style={styles.brandMark}>
              <View style={styles.brandMarkStripe} />
              <Text style={styles.brandMarkText}>AE</Text>
            </View>

            <View style={styles.brandCopy}>
              <Text style={styles.brandName}>Advanced Education Center</Text>
              <Text style={styles.brandTag}>Invite-only childcare portal</Text>
            </View>
          </View>

          <View style={styles.bellWrap}>
            <Pressable accessibilityRole="button" style={styles.headerIconButton}>
              <Text style={styles.headerIcon}>🔔</Text>
            </Pressable>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroCopy}>
          {badge ? (
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>{badge}</Text>
            </View>
          ) : null}

          <Text
            style={[
              styles.heroTitle,
              titleMaxWidth ? { maxWidth: titleMaxWidth } : null,
            ]}
          >
            {title}
          </Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
}

function SectionLabel({ title, actionLabel }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {actionLabel ? <Text style={styles.sectionAction}>{actionLabel}</Text> : null}
    </View>
  );
}

function SummaryTile({ accent, title, value, note, fill, onPress, badge }) {
  const accentStyles = {
    blue: styles.tileBlue,
    green: styles.tileGreen,
    orange: styles.tileOrange,
    purple: styles.tilePurple,
  };

  const Content = (
    <>
      <View style={styles.tileTopRow}>
        <View style={[styles.tileIconWrap, accentStyles[accent] || styles.tileBlue]}>
          <Text style={styles.tileIconText}>{badge}</Text>
        </View>
        {fill ? <Text style={styles.tileChip}>{fill}</Text> : null}
      </View>

      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileTitle}>{title}</Text>
      {note ? <Text style={styles.tileNote}>{note}</Text> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.summaryTile,
          pressed && styles.pressedTile,
        ]}
      >
        {Content}
      </Pressable>
    );
  }

  return <View style={styles.summaryTile}>{Content}</View>;
}

function ActionButtonCard({ accent, title, value, note, onPress, outline = false }) {
  const accentStyles = {
    blue: styles.actionAccentBlue,
    green: styles.actionAccentGreen,
    orange: styles.actionAccentOrange,
    purple: styles.actionAccentPurple,
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        outline && styles.actionCardOutline,
        pressed && styles.pressedTile,
      ]}
    >
      <View style={[styles.actionAccent, accentStyles[accent] || styles.actionAccentBlue]} />
      <View style={styles.actionCardBody}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionValue}>{value}</Text>
        {note ? <Text style={styles.actionNote}>{note}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function HomeCard({ title, value, note, accent, onPress }) {
  const accentStyles = {
    blue: styles.homeAccentBlue,
    green: styles.homeAccentGreen,
    orange: styles.homeAccentOrange,
    purple: styles.homeAccentPurple,
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.homeCard,
        pressed && styles.pressedTile,
      ]}
    >
      <View style={styles.homeCardTop}>
        <Text style={styles.homeCardLabel}>{title}</Text>
        <View style={[styles.homeChip, accentStyles[accent] || styles.homeAccentBlue]}>
          <Text style={styles.homeChipText}>{value}</Text>
        </View>
      </View>
      {note ? <Text style={styles.homeCardNote}>{note}</Text> : null}
    </Pressable>
  );
}

export default function App() {
  const [email, setEmail] = useState('parent@test.com');
  const [inviteCode, setInviteCode] = useState('MIA-4821');
  const [error, setError] = useState('');
  const [screen, setScreen] = useState('login');

  const handleLogin = () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = inviteCode.trim().toUpperCase();

    const match = MOCK_ACCESS_CODES.find(
      (entry) => entry.email === cleanEmail && entry.code === cleanCode
    );

    if (!match) {
      setError('Email and invite code do not match.');
      return;
    }

    setError('');

    if (match.role === 'parent') {
      setScreen('parent-home');
      return;
    }

    if (match.role === 'staff') {
      setScreen('staff-home');
      return;
    }

    setScreen('owner-home');
  };

  const fillTestAccount = (account) => {
    setEmail(account.email);
    setInviteCode(account.code);
    setError('');
  };

  const handleLogout = () => {
    setScreen('login');
    setError('');
  };

  const showComingSoon = (title, message = 'Coming Soon') => {
    Alert.alert(title, message);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {screen === 'login' ? (
        <ScreenShell
          badge="Secure Invite Access"
          title="Welcome back to your childcare portal"
          subtitle="Sign in with your invite-only email and access code."
          titleMaxWidth={320}
        >
          <View style={styles.contentStack}>
            <View style={styles.primaryIntroCard}>
              <View style={styles.primaryIntroHeader}>
                <View style={styles.primaryIntroTextWrap}>
                  <Text style={styles.primaryIntroLabel}>Private access</Text>
                  <Text style={styles.primaryIntroTitle}>
                    Advanced Education Center
                  </Text>
                </View>
                <View style={styles.securePill}>
                  <Text style={styles.securePillText}>Invite Only</Text>
                </View>
              </View>

              <Text style={styles.primaryIntroSubtitle}>
                Parents, staff, and owners sign in using a code issued by the center.
              </Text>
            </View>

            <View style={styles.loginCard}>
              <SectionLabel title="Secure Login" actionLabel="Private portal" />
              <Text style={styles.cardSubtitle}>
                Use the email and access code you were given. This screen is
                intentionally limited to approved users.
              </Text>

              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.form}
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    placeholder="parent@test.com"
                    placeholderTextColor={COLORS.muted}
                    style={styles.input}
                    value={email}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Invite Code</Text>
                  <TextInput
                    autoCapitalize="characters"
                    autoCorrect={false}
                    onChangeText={setInviteCode}
                    placeholder="MIA-4821"
                    placeholderTextColor={COLORS.muted}
                    style={styles.input}
                    value={inviteCode}
                  />
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Pressable
                  accessibilityRole="button"
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>Log In</Text>
                </Pressable>
              </KeyboardAvoidingView>
            </View>

            <View style={styles.loginCard}>
              <SectionLabel title="Demo Access" actionLabel="Tap to autofill" />
              <View style={styles.demoList}>
                {MOCK_ACCESS_CODES.map((account) => (
                  <Pressable
                    accessibilityRole="button"
                    key={account.code}
                    onPress={() => fillTestAccount(account)}
                    style={({ pressed }) => [
                      styles.demoCard,
                      pressed && styles.pressedTile,
                    ]}
                  >
                    <View style={styles.demoTextWrap}>
                      <View style={styles.demoHeaderRow}>
                        <Text style={styles.demoLabel}>{account.label}</Text>
                        <View style={styles.demoCodePill}>
                          <Text style={styles.demoCode}>{account.code}</Text>
                        </View>
                      </View>
                      <Text style={styles.demoEmail}>{account.email}</Text>
                      <Text style={styles.demoDescription}>
                        {account.description}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            <Text style={styles.footerNote}>
              No public signup. Access is created and controlled by the owner.
            </Text>
          </View>
        </ScreenShell>
      ) : screen === 'parent-home' ? (
        <ScreenShell
          badge="Parent View"
          title="Welcome back"
          subtitle="Mia Carter is checked in today."
          titleMaxWidth={220}
        >
          <View style={styles.contentStack}>
            <View style={styles.parentStatusCard}>
              <View style={styles.parentStatusCopy}>
                <Text style={styles.cardSectionLabel}>Today&apos;s child</Text>
                <Text style={styles.parentChildName}>{PARENT_CHILD.name}</Text>
                <Text style={styles.parentStatusNote}>
                  Daily attendance and program summary
                </Text>
              </View>
              <View style={styles.parentStatusBadge}>
                <Text style={styles.parentStatusBadgeText}>
                  {PARENT_CHILD.status}
                </Text>
              </View>
            </View>

            <SectionLabel title="Quick Overview" actionLabel="At a glance" />
            <View style={styles.summaryGrid}>
              <SummaryTile
                accent="blue"
                badge="B"
                title="Before & After Care"
                value={PARENT_CHILD.beforeAfterCare}
                note="View schedule details"
                fill="Open"
                onPress={() => showComingSoon('Before & After Care')}
              />
              <SummaryTile
                accent="purple"
                badge="S"
                title="Summer Camp"
                value={PARENT_CHILD.summerCamp}
                note="Tap for camp details"
                fill="Open"
                onPress={() => showComingSoon('Summer Camp')}
              />
              <SummaryTile
                accent="green"
                badge="$"
                title="Billing"
                value={PARENT_CHILD.billing}
                note="Account status and balances"
                fill="Open"
                onPress={() => showComingSoon('Billing')}
              />
              <SummaryTile
                accent="orange"
                badge="!"
                title="Notifications"
                value={PARENT_CHILD.notifications}
                note="Unread updates and alerts"
                fill="Open"
                onPress={() => showComingSoon('Notifications')}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.primaryButton,
                styles.logoutButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.primaryButtonText}>Logout</Text>
            </Pressable>
          </View>
        </ScreenShell>
      ) : screen === 'staff-home' ? (
        <ScreenShell
          badge="Staff View"
          title="Good afternoon"
          subtitle="Ms. Sarah is checked out right now."
          titleMaxWidth={220}
        >
          <View style={styles.contentStack}>
            <View style={styles.staffStatusCard}>
              <View style={styles.staffStatusLeft}>
                <Text style={styles.cardSectionLabel}>Staff status</Text>
                <Text style={styles.staffName}>{STAFF_MEMBER.name}</Text>
                <Text style={styles.staffShift}>{STAFF_MEMBER.shift}</Text>
              </View>
              <View style={styles.staffStatusBadge}>
                <Text style={styles.staffStatusBadgeText}>
                  {STAFF_MEMBER.status}
                </Text>
              </View>
            </View>

            <SectionLabel title="Today&apos;s Tools" actionLabel="Tap any card" />
            <View style={styles.staffButtonStack}>
              <ActionButtonCard
                accent="blue"
                title="Today's Shift"
                value={STAFF_MEMBER.shift}
                note="Shift details and schedule"
                onPress={() => showComingSoon("Today's Shift", STAFF_MEMBER.shift)}
              />
              <ActionButtonCard
                accent="purple"
                title="My Hours"
                value={STAFF_MEMBER.hours}
                note="Time totals and weekly hours"
                onPress={() => showComingSoon('My Hours')}
              />
              <ActionButtonCard
                accent="green"
                title="Clock In / Out"
                value="Open"
                note={STAFF_MEMBER.checkInOut}
                onPress={() => showComingSoon('Clock In / Out')}
              />
              <ActionButtonCard
                accent="orange"
                title="Student Check-In / Out"
                value="Open"
                note={STAFF_MEMBER.studentCheck}
                onPress={() => showComingSoon('Student Check-In / Out')}
              />
              <ActionButtonCard
                accent="blue"
                title="Camp Headcount"
                value="Open"
                note={STAFF_MEMBER.campHeadcount}
                onPress={() => showComingSoon('Camp Headcount')}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.primaryButton,
                styles.logoutButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.primaryButtonText}>Logout</Text>
            </Pressable>
          </View>
        </ScreenShell>
      ) : (
        <ScreenShell
          badge="Owner Control Center"
          title="Welcome back"
          subtitle="Advanced Education Center"
          titleMaxWidth={220}
        >
          <View style={styles.contentStack}>
            <View style={styles.ownerIntroCard}>
              <Text style={styles.cardSectionLabel}>Control center</Text>
              <Text style={styles.ownerIntroTitle}>Quick access to the main modules</Text>
              <Text style={styles.ownerIntroNote}>
                Everything here is a placeholder for now, but the layout is ready for
                the next pass.
              </Text>
            </View>

            <SectionLabel title="Modules" actionLabel="Coming soon" />
            <View style={styles.ownerGrid}>
              {OWNER_MODULES.map((moduleName, index) => {
                const accents = ['blue', 'purple', 'green', 'orange'];
                const accent = accents[index % accents.length];

                return (
                  <SummaryTile
                    key={moduleName}
                    accent={accent}
                    badge={moduleName.charAt(0)}
                    title={moduleName}
                    value="Coming Soon"
                    note="Control panel placeholder"
                    fill="Admin"
                    onPress={() => showComingSoon(moduleName)}
                  />
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.primaryButton,
                styles.logoutButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.primaryButtonText}>Logout</Text>
            </Pressable>
          </View>
        </ScreenShell>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hero: {
    backgroundColor: COLORS.navyDark,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    overflow: 'hidden',
    paddingBottom: 20,
    paddingTop: 12,
    position: 'relative',
  },
  heroOrbLarge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    height: 170,
    position: 'absolute',
    right: -60,
    top: -70,
    width: 170,
  },
  heroOrbSmall: {
    backgroundColor: 'rgba(15, 98, 254, 0.18)',
    borderRadius: 999,
    bottom: -65,
    height: 120,
    left: -30,
    position: 'absolute',
    width: 120,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  headerIconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerIcon: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  brandLockup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 12,
    flex: 1,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    height: 46,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 46,
  },
  brandMarkStripe: {
    backgroundColor: COLORS.blue,
    height: 7,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  brandMarkText: {
    color: COLORS.navyDark,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 5,
  },
  brandCopy: {
    flex: 1,
  },
  brandName: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
  },
  brandTag: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  bellWrap: {
    position: 'relative',
  },
  notificationBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: 999,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    top: 4,
    width: 20,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
  heroCopy: {
    marginTop: 18,
    paddingHorizontal: 20,
  },
  heroPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroPillText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginTop: 14,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 340,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 28,
  },
  contentStack: {
    gap: 16,
    marginTop: -18,
  },
  primaryIntroCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  primaryIntroHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryIntroTextWrap: {
    flex: 1,
  },
  primaryIntroLabel: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  primaryIntroTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    marginTop: 4,
  },
  primaryIntroSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  securePill: {
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  securePillText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
  },
  loginCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  cardSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  form: {
    gap: 14,
    marginTop: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.blue,
    borderRadius: 999,
    justifyContent: 'center',
    marginTop: 6,
    minHeight: 58,
  },
  pressedButton: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '900',
  },
  demoList: {
    gap: 10,
    marginTop: 14,
  },
  demoCard: {
    backgroundColor: COLORS.softBlue,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  demoTextWrap: {
    gap: 8,
  },
  demoHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  demoLabel: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
  },
  demoCodePill: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  demoCode: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
  },
  demoEmail: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  demoDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  footerNote: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionAction: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '800',
  },
  parentStatusCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  parentStatusCopy: {
    flex: 1,
  },
  cardSectionLabel: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  parentChildName: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
  },
  parentStatusNote: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  parentStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.success,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  parentStatusBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryTile: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 154,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  tileTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tileIconWrap: {
    alignItems: 'center',
    borderRadius: 16,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  tileIconText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
  },
  tileChip: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
  },
  tileValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 18,
  },
  tileTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  tileNote: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  tileBlue: {
    backgroundColor: COLORS.blue,
  },
  tileGreen: {
    backgroundColor: COLORS.success,
  },
  tileOrange: {
    backgroundColor: COLORS.warning,
  },
  tilePurple: {
    backgroundColor: '#7C4DFF',
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 92,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  actionCardOutline: {
    backgroundColor: COLORS.white,
  },
  actionAccent: {
    borderRadius: 18,
    height: 44,
    width: 44,
  },
  actionAccentBlue: {
    backgroundColor: COLORS.blue,
  },
  actionAccentGreen: {
    backgroundColor: COLORS.success,
  },
  actionAccentOrange: {
    backgroundColor: COLORS.warning,
  },
  actionAccentPurple: {
    backgroundColor: '#7C4DFF',
  },
  actionCardBody: {
    flex: 1,
  },
  actionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  actionValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
  },
  actionNote: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  chevron: {
    color: COLORS.muted,
    fontSize: 28,
    fontWeight: '700',
    marginTop: -2,
  },
  staffStatusCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  staffStatusLeft: {
    flex: 1,
  },
  staffName: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
  },
  staffShift: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  staffStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.warning,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  staffStatusBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
  staffButtonStack: {
    gap: 12,
  },
  ownerIntroCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  ownerIntroTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    marginTop: 8,
  },
  ownerIntroNote: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  ownerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  homeCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 120,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  homeCardTop: {
    alignItems: 'flex-start',
    gap: 10,
  },
  homeCardLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  homeChip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  homeChipText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
  homeAccentBlue: {
    backgroundColor: COLORS.blue,
  },
  homeAccentGreen: {
    backgroundColor: COLORS.success,
  },
  homeAccentOrange: {
    backgroundColor: COLORS.warning,
  },
  homeAccentPurple: {
    backgroundColor: '#7C4DFF',
  },
  homeCardNote: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },
  logoutButton: {
    marginTop: 2,
  },
});
