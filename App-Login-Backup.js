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
    description: 'Opens staff work tools',
  },
  {
    email: 'owner@test.com',
    code: 'OWNER-0001',
    role: 'owner',
    label: 'Owner Access',
    description: 'Opens full owner dashboard',
  },
];

export default function App() {
  const [email, setEmail] = useState('parent@test.com');
  const [inviteCode, setInviteCode] = useState('MIA-4821');
  const [error, setError] = useState('');

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

    Alert.alert(
      'Login Success',
      `${match.label}\n\nNext build step will open the ${match.role} home screen.`
    );
  };

  const fillTestAccount = (account) => {
    setEmail(account.email);
    setInviteCode(account.code);
    setError('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

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
            <Text style={styles.bellIcon}></Text>
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
                  <Text style={styles.testAccountLabel}>{account.label}</Text>
                  <Text style={styles.testAccountEmail}>{account.email}</Text>
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
});
