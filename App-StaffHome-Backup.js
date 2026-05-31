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

    Alert.alert('Owner page coming next.');
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

  const showComingSoon = (title, message) => {
    Alert.alert(title, message);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {screen === 'login' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topHeader}>
            <Text style={styles.menuIcon}>☰</Text>

            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>AEC</Text>
            </View>

            <View style={styles.bellWrap}>
              <Text style={styles.bellIcon}>🔔</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>2</Text>
              </View>
            </View>
          </View>

          <View style={styles.waveCard}>
            <Text style={styles.welcomeTitle}>Advanced Education</Text>
            <Text style={styles.welcomeSubtitle}>
              Private access for parents, staff, and owner.
            </Text>
          </View>

          <View style={styles.container}>
            <View style={styles.loginCard}>
              <Text style={styles.cardTitle}>Welcome Back</Text>
              <Text style={styles.cardSubtitle}>
                Sign in using the email and invite code sent by the owner.
              </Text>

              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.form}
              >
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

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Pressable
                  accessibilityRole="button"
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>Log In</Text>
                </Pressable>
              </KeyboardAvoidingView>
            </View>

            <View style={styles.testCard}>
              <Text style={styles.testTitle}>Test Access Codes</Text>
              <Text style={styles.testSubtitle}>
                Tap one to fill the login form while we build.
              </Text>

              {MOCK_ACCESS_CODES.map((account) => (
                <Pressable
                  accessibilityRole="button"
                  key={account.code}
                  onPress={() => fillTestAccount(account)}
                  style={({ pressed }) => [
                    styles.testAccountCard,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <View>
                    <Text style={styles.testAccountLabel}>
                      {account.label}
                    </Text>
                    <Text style={styles.testAccountEmail}>
                      {account.email}
                    </Text>
                    <Text style={styles.testAccountDescription}>
                      {account.description}
                    </Text>
                  </View>

                  <View style={styles.codePill}>
                    <Text style={styles.codePillText}>{account.code}</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            <Text style={styles.footerNote}>
              No public signup. Access is created and controlled by the owner.
            </Text>
          </View>
        </ScrollView>
      ) : screen === 'parent-home' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topHeader}>
            <Text style={styles.menuIcon}>☰</Text>

            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>AEC</Text>
            </View>

            <View style={styles.bellWrap}>
              <Text style={styles.bellIcon}>🔔</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>2</Text>
              </View>
            </View>
          </View>

          <View style={styles.waveCard}>
            <Text style={styles.welcomeTitle}>Parent Home</Text>
            <Text style={styles.welcomeSubtitle}>
              {PARENT_CHILD.name} is checked in today.
            </Text>
          </View>

          <View style={styles.container}>
            <View style={styles.loginCard}>
              <View style={styles.homeGreetingRow}>
                <View>
                  <Text style={styles.homeGreetingTitle}>Good afternoon</Text>
                  <Text style={styles.homeGreetingSubtitle}>
                    Here is today&apos;s quick summary.
                  </Text>
                </View>

                <View style={styles.statusBadgeSuccess}>
                  <Text style={styles.statusBadgeText}>
                    {PARENT_CHILD.status}
                  </Text>
                </View>
              </View>

              <View style={styles.childCard}>
                <View>
                  <Text style={styles.childCardLabel}>Child</Text>
                  <Text style={styles.childCardName}>{PARENT_CHILD.name}</Text>
                  <Text style={styles.childCardDescription}>
                    Daily attendance and program status
                  </Text>
                </View>

                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>MC</Text>
                </View>
              </View>
            </View>

            <View style={styles.homeGrid}>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  showComingSoon(
                    'Before & After Care',
                    'Before & After Care details coming next.'
                  )
                }
                style={({ pressed }) => [
                  styles.featureCard,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.featureLabel}>Before & After Care</Text>
                <Text style={styles.featureValue}>
                  {PARENT_CHILD.beforeAfterCare}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  showComingSoon(
                    'Summer Camp',
                    'Summer Camp details coming next.'
                  )
                }
                style={({ pressed }) => [
                  styles.featureCard,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.featureLabel}>Summer Camp</Text>
                <Text style={styles.featureValue}>
                  {PARENT_CHILD.summerCamp}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  showComingSoon('Billing', 'Billing details coming next.')
                }
                style={({ pressed }) => [
                  styles.featureCard,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.featureLabel}>Billing</Text>
                <Text style={styles.featureValue}>{PARENT_CHILD.billing}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  showComingSoon(
                    'Notifications',
                    'Notifications details coming next.'
                  )
                }
                style={({ pressed }) => [
                  styles.featureCard,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.featureLabel}>Notifications</Text>
                <Text style={styles.featureValue}>
                  {PARENT_CHILD.notifications}
                </Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.primaryButton,
                styles.logoutButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Logout</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topHeader}>
            <Text style={styles.menuIcon}>☰</Text>

            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>AEC</Text>
            </View>

            <View style={styles.bellWrap}>
              <Text style={styles.bellIcon}>🔔</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>2</Text>
              </View>
            </View>
          </View>

          <View style={styles.waveCard}>
            <Text style={styles.welcomeTitle}>Staff Home</Text>
            <Text style={styles.welcomeSubtitle}>
              {STAFF_MEMBER.name} is {STAFF_MEMBER.status.toLowerCase()} today.
            </Text>
          </View>

          <View style={styles.container}>
            <View style={styles.loginCard}>
              <View style={styles.homeGreetingRow}>
                <View>
                  <Text style={styles.homeGreetingTitle}>Good afternoon</Text>
                  <Text style={styles.homeGreetingSubtitle}>
                    Here&apos;s your staff snapshot for today.
                  </Text>
                </View>

                <View style={styles.statusBadgeWarning}>
                  <Text style={styles.statusBadgeText}>
                    {STAFF_MEMBER.status}
                  </Text>
                </View>
              </View>

              <View style={styles.childCard}>
                <View>
                  <Text style={styles.childCardLabel}>Staff Name</Text>
                  <Text style={styles.childCardName}>{STAFF_MEMBER.name}</Text>
                  <Text style={styles.childCardDescription}>
                    Shift and task tools below
                  </Text>
                </View>

                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>SS</Text>
                </View>
              </View>
            </View>

            <View style={styles.homeGrid}>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  showComingSoon('Today&apos;s shift', STAFF_MEMBER.shift)
                }
                style={({ pressed }) => [
                  styles.featureCard,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.featureLabel}>Today&apos;s Shift</Text>
                <Text style={styles.featureValue}>{STAFF_MEMBER.shift}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  showComingSoon(
                    'My Hours',
                    'My Hours details coming next.'
                  )
                }
                style={({ pressed }) => [
                  styles.featureCard,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.featureLabel}>My Hours</Text>
                <Text style={styles.featureValue}>{STAFF_MEMBER.hours}</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  showComingSoon(
                    'Clock In / Out',
                    STAFF_MEMBER.checkInOut
                  )
                }
                style={({ pressed }) => [
                  styles.featureCard,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.featureLabel}>Clock In / Out</Text>
                <Text style={styles.featureValue}>Open</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  showComingSoon(
                    'Student Check-In / Out',
                    STAFF_MEMBER.studentCheck
                  )
                }
                style={({ pressed }) => [
                  styles.featureCard,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.featureLabel}>
                  Student Check-In / Out
                </Text>
                <Text style={styles.featureValue}>Open</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  showComingSoon(
                    'Camp Headcount',
                    STAFF_MEMBER.campHeadcount
                  )
                }
                style={({ pressed }) => [
                  styles.featureCard,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.featureLabel}>Camp Headcount</Text>
                <Text style={styles.featureValue}>Open</Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.primaryButton,
                styles.logoutButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Logout</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    alignItems: 'center',
    backgroundColor: COLORS.navyDark,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 42,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  menuIcon: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '800',
  },
  logoCircle: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 999,
    height: 82,
    justifyContent: 'center',
    width: 82,
  },
  logoText: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: '900',
  },
  bellWrap: {
    position: 'relative',
  },
  bellIcon: {
    fontSize: 26,
  },
  notificationBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: 999,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -8,
    top: -8,
    width: 20,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
  waveCard: {
    backgroundColor: COLORS.card,
    borderRadius: 28,
    marginHorizontal: 20,
    marginTop: -30,
    padding: 20,
  },
  welcomeTitle: {
    color: COLORS.navyDark,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    textAlign: 'center',
  },
  container: {
    padding: 20,
  },
  loginCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
  },
  cardSubtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  form: {
    gap: 12,
    marginTop: 18,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.blue,
    borderRadius: 999,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 58,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  testCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 18,
    padding: 18,
  },
  testTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
  },
  testSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 12,
  },
  testAccountCard: {
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 14,
  },
  testAccountLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  testAccountEmail: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 3,
  },
  testAccountDescription: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
    maxWidth: 190,
  },
  codePill: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  codePillText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
  },
  footerNote: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 18,
    textAlign: 'center',
  },
  homeGreetingRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  homeGreetingTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
  },
  homeGreetingSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  statusBadgeSuccess: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.success,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusBadgeWarning: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.warning,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
  childCard: {
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    borderColor: COLORS.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    padding: 16,
  },
  childCardLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  childCardName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  childCardDescription: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },
  childAvatar: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  childAvatarText: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: '900',
  },
  homeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
  },
  featureCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 22,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 110,
    padding: 16,
  },
  featureLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  featureValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
  },
  logoutButton: {
    marginTop: 18,
  },
});
