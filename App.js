import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
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

const CHILD_PROFILE = {
  age: '4',
  room: 'Preschool Room 2',
  group: 'Blue Group',
  status: 'Checked In',
  programEnrollment: [
    { label: 'Before & After Care', value: 'Enrolled' },
    { label: 'Summer Camp', value: 'Registered' },
  ],
  authorizedPickups: ['Avery Parent', 'Susan Carter, Grandmother', 'David Carter, Uncle'],
  emergencyContacts: ['Avery Parent', 'Susan Carter'],
  medicalAlerts: ['Peanut Allergy', 'Asthma', 'EpiPen Required'],
};

const CHILD_GROUP_THEMES = {
  'Blue Group': {
    accent: '#0F62FE',
    border: '#BFD1FF',
    soft: '#EEF4FF',
  },
  'Green Group': {
    accent: '#16A34A',
    border: '#BBF7D0',
    soft: '#ECFDF3',
  },
  'Red Group': {
    accent: '#F97366',
    border: '#FECACA',
    soft: '#FFF1F1',
  },
  'Yellow Group': {
    accent: '#D4A017',
    border: '#FDE68A',
    soft: '#FFF8E1',
  },
};

function getChildGroupTheme(group) {
  return CHILD_GROUP_THEMES[group] || CHILD_GROUP_THEMES['Blue Group'];
}

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

const OFFICIAL_LOGO = require('./assets/images/logo.png');
const HEADER_PHOTO = require('./assets/images/header_kids.jpg');
const PLAYGROUND_IMAGE = require('./assets/images/playground.png');

function ScreenShell({ children, title, subtitle, badge, titleMaxWidth }) {
  const hasHeroCopy = Boolean(title || subtitle || badge);

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
            <Image
              source={OFFICIAL_LOGO}
              resizeMode="contain"
              style={styles.brandLogo}
            />
            <Text style={styles.brandTag}>Secure Invite Access</Text>
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

        {hasHeroCopy ? (
          <View style={styles.heroCopy}>
            {badge ? (
              <View style={styles.shellHeroPill}>
                <Text style={styles.shellHeroPillText}>{badge}</Text>
              </View>
            ) : null}

            {title ? (
              <Text
                style={[
                  styles.shellHeroTitle,
                  titleMaxWidth ? { maxWidth: titleMaxWidth } : null,
                ]}
              >
                {title}
              </Text>
            ) : null}
            {subtitle ? <Text style={styles.shellHeroSubtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
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

function LoginScreen({
  email,
  inviteCode,
  error,
  onChangeEmail,
  onChangeInviteCode,
  onLogin,
  onFillTestAccount,
}) {
  return (
    <View style={styles.loginPage}>
        <ImageBackground
  source={require('./assets/images/playground.png')}
  resizeMode="cover"
  style={styles.loginBackgroundImage}/>
<View style={styles.loginBackgroundOverlay} />
      <View style={styles.loginHeroPhotoWrap}>
        <ImageBackground
          source={HEADER_PHOTO}
          resizeMode="cover"
          style={styles.loginHeroPhoto}
          imageStyle={styles.loginHeroPhotoImage}
        >
          <View style={styles.loginHeroOverlay} />
          <View style={styles.loginHeroContent}>
            <Image source={OFFICIAL_LOGO} style={styles.heroLogo} resizeMode="contain" />
            <Text style={styles.heroSubtitle}>Welcome, families and staff.</Text>
          </View>
        </ImageBackground>
      </View>

      <ScrollView
        contentContainerStyle={styles.loginScroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.loginCardPortal}>
          <View style={styles.loginCardHeaderPortal}>
            <View style={styles.loginCardHeaderText}>
              <Text style={styles.loginTitle}>Portal Login</Text>
              <Text style={styles.loginSubtitle}>
                Access is provided by Advanced Education.
              </Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={onChangeEmail}
            placeholder="parent@test.com"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            value={email}
          />

          <Text style={styles.inputLabel}>Invite Code</Text>
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            onChangeText={onChangeInviteCode}
            placeholder="MIA-4821"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            value={inviteCode}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            onPress={onLogin}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.primaryButtonText}>Enter Portal</Text>
          </Pressable>
        </View>

        <View style={styles.testCardPortal}>
          <View style={styles.testHeader}>
            <Text style={styles.testTitle}>Test Access Codes</Text>
            <Text style={styles.testHint}>Tap to autofill</Text>
          </View>

          <View style={styles.testAccountList}>
            {MOCK_ACCESS_CODES.map((account) => (
              <Pressable
                accessibilityRole="button"
                key={account.code}
                onPress={() => onFillTestAccount(account)}
                style={({ pressed }) => [styles.testAccountCard, pressed && styles.buttonPressed]}
              >
                <Text style={styles.testAccountLabel}>{account.label}</Text>
                <Text style={styles.testAccountEmail}>{account.email}</Text>
                <Text style={styles.testAccountDescription}>{account.description}</Text>
                <View style={styles.codePill}>
                  <Text style={styles.codePillText}>{account.code}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.footerWrap}>
          <Text style={styles.footerNote}>Need access? Contact the office.</Text>
          <Text style={styles.footerNote}>(609) 549-0076</Text>
          <Text style={styles.footerNote}>advancededunj@gmail.com</Text>
        </View>


      </ScrollView>
    </View>
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

  const childTheme = getChildGroupTheme(CHILD_PROFILE.group);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {screen === 'login' ? (
        <LoginScreen
          email={email}
          inviteCode={inviteCode}
          error={error}
          onChangeEmail={setEmail}
          onChangeInviteCode={setInviteCode}
          onLogin={handleLogin}
          onFillTestAccount={fillTestAccount}
        />
      ) : screen === 'parent-home' ? (
        <View style={styles.parentHomePage}>
          <View style={styles.parentHero}>
            <View style={styles.parentHeroGlowOne} />
            <View style={styles.parentHeroGlowTwo} />
            <View style={styles.parentHeroMain}>
              <View style={styles.parentHeroTextBlock}>
                <Text style={styles.parentHeroKicker}>Advanced Education</Text>
                <Text style={styles.parentHeroGreeting}>Hi, Avery 👋 </Text>
                <Text style={styles.parentHeroChildName}>Mia Carter</Text>
                <View style={styles.parentHeroStatusPill}>
                  <Text style={styles.parentHeroStatusPillText}>Checked In</Text>
                </View>
                <Text style={styles.parentHeroSubtitle}>
                  Your private childcare connection for Mia&apos;s day.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open child profile"
                onPress={() => setScreen('child-profile')}
                style={({ pressed }) => [
                  styles.parentHeroPhotoWrap,
                  pressed && styles.pressedButton,
                ]}
              >
                <Image
                  source={HEADER_PHOTO}
                  resizeMode="cover"
                  style={styles.parentHeroPhoto}
                />
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={styles.parentScrollArea}
            contentContainerStyle={styles.parentHomeScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.parentHomeContent}>
              <View style={styles.parentTodayCard}>
                <View style={styles.parentSectionHeaderRow}>
                  <Text style={styles.parentSectionHeaderTitle}>Today</Text>
                  <Text style={styles.parentSectionHeaderSubtle}>Live update</Text>
                </View>

                <View style={styles.parentTodayRow}>
                  <View style={styles.parentTodayItem}>
                    <View style={styles.parentTodayIconWrap}>
                      <Text style={styles.parentTodayIcon}>✓</Text>
                    </View>
                    <Text style={styles.parentTodayLabel}>Checked in</Text>
                    <Text style={styles.parentTodayValue}>8:12 AM</Text>
                  </View>

                  <View style={styles.parentTodayDivider} />

                  <View style={styles.parentTodayItem}>
                    <View style={styles.parentTodayIconWrap}>
                      <Text style={styles.parentTodayIcon}>★</Text>
                    </View>
                    <Text style={styles.parentTodayLabel}>With</Text>
                    <Text style={styles.parentTodayValue}>Ms. Sarah</Text>
                  </View>
                </View>
              </View>

              <View style={styles.parentQuickSectionHeader}>
                <Text style={styles.parentSectionHeaderTitle}>Quick Access</Text>
                <Text style={styles.parentSectionHeaderSubtle}>Tap a card for details</Text>
              </View>

              <View style={styles.parentQuickGrid}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => showComingSoon('Before & After Care')}
                  style={({ pressed }) => [
                    styles.parentQuickCard,
                    styles.parentQuickBlue,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <View style={styles.parentQuickAccentBlue} />
                  <Text style={styles.parentQuickTitle}>Before & After Care</Text>
                  <Text style={styles.parentQuickValue}>{PARENT_CHILD.beforeAfterCare}</Text>
                  <Text style={styles.parentQuickNote}>View schedule details</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => showComingSoon('Summer Camp')}
                  style={({ pressed }) => [
                    styles.parentQuickCard,
                    styles.parentQuickPurple,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <View style={styles.parentQuickAccentPurple} />
                  <Text style={styles.parentQuickTitle}>Summer Camp</Text>
                  <Text style={styles.parentQuickValue}>{PARENT_CHILD.summerCamp}</Text>
                  <Text style={styles.parentQuickNote}>Tap for camp details</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => showComingSoon('Billing')}
                  style={({ pressed }) => [
                    styles.parentQuickCard,
                    styles.parentQuickGreen,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <View style={styles.parentQuickAccentGreen} />
                  <Text style={styles.parentQuickTitle}>Billing</Text>
                  <Text style={styles.parentQuickValue}>{PARENT_CHILD.billing}</Text>
                  <Text style={styles.parentQuickNote}>Account status and balances</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => showComingSoon('Notifications')}
                  style={({ pressed }) => [
                    styles.parentQuickCard,
                    styles.parentQuickOrange,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <View style={styles.parentQuickAccentOrange} />
                  <Text style={styles.parentQuickTitle}>Notifications</Text>
                  <Text style={styles.parentQuickValue}>{PARENT_CHILD.notifications}</Text>
                  <Text style={styles.parentQuickNote}>Unread updates and alerts</Text>
                </Pressable>
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
          </ScrollView>
        </View>
      ) : screen === 'child-profile' ? (
        <View style={styles.parentHomePage}>
          <View style={styles.childProfileHero}>
            <View style={styles.parentHeroGlowOne} />
            <View style={styles.parentHeroGlowTwo} />

            <View style={styles.childProfileHeaderRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setScreen('parent-home')}
                style={({ pressed }) => [styles.childProfileBackButton, pressed && styles.pressedButton]}
              >
                <Text style={styles.childProfileBackButtonText}>Back</Text>
              </Pressable>

              <Text style={styles.childProfileHeaderLabel}>Child Profile</Text>
            </View>

            <View style={styles.childProfileHeroMain}>
              <View style={styles.childProfileHeroTextBlock}>
                <Text style={styles.parentHeroKicker}>Advanced Education</Text>
                <Text style={styles.parentHeroGreeting}>Mia Carter</Text>
                <View
                  style={[
                    styles.childProfileGroupBadge,
                    {
                      backgroundColor: childTheme.soft,
                      borderColor: childTheme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.childProfileGroupBadgeText,
                      { color: childTheme.accent },
                    ]}
                  >
                    {CHILD_PROFILE.group}
                  </Text>
                </View>
                <View
                  style={[
                    styles.childProfileStatusPill,
                    { backgroundColor: childTheme.accent },
                  ]}
                >
                  <Text style={styles.childProfileStatusPillText}>
                    {CHILD_PROFILE.status}
                  </Text>
                </View>
              </View>

              <View style={styles.parentHeroPhotoWrap}>
                <Image
                  source={HEADER_PHOTO}
                  resizeMode="cover"
                  style={styles.parentHeroPhoto}
                />
              </View>
            </View>
          </View>

          <ScrollView
            style={styles.parentScrollArea}
            contentContainerStyle={styles.parentHomeScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.parentHomeContent}>
              <View style={styles.profileCard}>
                <View style={styles.parentSectionHeaderRow}>
                  <View style={styles.childProfileSectionTitleRow}>
                    <View
                      style={[
                        styles.childProfileSectionIcon,
                        { backgroundColor: childTheme.accent },
                      ]}
                    />
                    <Text style={styles.parentSectionHeaderTitle}>Basic Info</Text>
                  </View>
                </View>
                <View style={styles.profileInfoGrid}>
                  <View style={styles.profileInfoItem}>
                    <Text style={styles.profileInfoLabel}>Name</Text>
                    <Text style={styles.profileInfoValue}>Mia Carter</Text>
                  </View>
                  <View style={styles.profileInfoItem}>
                    <Text style={styles.profileInfoLabel}>Age</Text>
                    <Text style={styles.profileInfoValue}>{CHILD_PROFILE.age}</Text>
                  </View>
                  <View style={styles.profileInfoItem}>
                    <Text style={styles.profileInfoLabel}>Room</Text>
                    <Text style={styles.profileInfoValue}>{CHILD_PROFILE.room}</Text>
                  </View>
                  <View style={styles.profileInfoItem}>
                    <Text style={styles.profileInfoLabel}>Status</Text>
                    <View
                      style={[
                        styles.childProfileStatusBadge,
                        { backgroundColor: childTheme.accent },
                      ]}
                    >
                      <Text style={styles.childProfileStatusBadgeText}>
                        {CHILD_PROFILE.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.profileCard}>
                <View style={styles.parentSectionHeaderRow}>
                  <View style={styles.childProfileSectionTitleRow}>
                    <View
                      style={[
                        styles.childProfileSectionIcon,
                        { backgroundColor: childTheme.accent },
                      ]}
                    />
                    <Text style={styles.parentSectionHeaderTitle}>Program Enrollment</Text>
                  </View>
                </View>
                <View style={styles.profileList}>
                  {CHILD_PROFILE.programEnrollment.map((item) => (
                    <View key={item.label} style={styles.profileListRow}>
                      <View
                        style={[
                          styles.profileListDot,
                          { backgroundColor: childTheme.accent },
                        ]}
                      />
                      <Text style={styles.profileListLabel}>{item.label}</Text>
                      <Text style={styles.profileListValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.profileCard}>
                <View style={styles.parentSectionHeaderRow}>
                  <View style={styles.childProfileSectionTitleRow}>
                    <View
                      style={[
                        styles.childProfileSectionIcon,
                        { backgroundColor: childTheme.accent },
                      ]}
                    />
                    <Text style={styles.parentSectionHeaderTitle}>Authorized Pickups</Text>
                  </View>
                </View>
                <View style={styles.profileBulletList}>
                  {CHILD_PROFILE.authorizedPickups.map((name) => (
                    <View key={name} style={styles.profileBulletRow}>
                      <View
                        style={[
                          styles.profileBulletDot,
                          { backgroundColor: childTheme.accent },
                        ]}
                      />
                      <Text style={styles.profileBulletItem}>{name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.profileCard}>
                <View style={styles.parentSectionHeaderRow}>
                  <View style={styles.childProfileSectionTitleRow}>
                    <View
                      style={[
                        styles.childProfileSectionIcon,
                        { backgroundColor: childTheme.accent },
                      ]}
                    />
                    <Text style={styles.parentSectionHeaderTitle}>Emergency Contacts</Text>
                  </View>
                </View>
                <View style={styles.profileBulletList}>
                  {CHILD_PROFILE.emergencyContacts.map((name) => (
                    <View key={name} style={styles.profileBulletRow}>
                      <View
                        style={[
                          styles.profileBulletDot,
                          { backgroundColor: childTheme.accent },
                        ]}
                      />
                      <Text style={styles.profileBulletItem}>{name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.profileCard}>
                <View style={styles.parentSectionHeaderRow}>
                  <View style={styles.childProfileSectionTitleRow}>
                    <View
                      style={[
                        styles.childProfileSectionIcon,
                        { backgroundColor: childTheme.accent },
                      ]}
                    />
                    <Text style={styles.parentSectionHeaderTitle}>Medical Alerts</Text>
                  </View>
                </View>
                <View style={styles.profileBadgeList}>
                  {CHILD_PROFILE.medicalAlerts.map((item) => (
                    <View key={item} style={styles.profileMedicalBadge}>
                      <Text style={styles.profileMedicalBadgeText}>{item}</Text>
                    </View>
                  ))}
                </View>
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
          </ScrollView>
        </View>
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
          subtitle="Advanced Education"
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
    backgroundColor: 'rgba(15, 99, 254, 0.11)',
    borderRadius: 999,
    bottom: -65,
    height: 120,
    left: -30,
    position: 'absolute',
    width: 120,
  },
  heroSubtitle: {
  color: 'black',
  fontWeight: '600',
  fontSize: 20,
  lineHeight: 24,
  textAlign: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
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
    justifyContent: 'center',
    marginHorizontal: 12,
    flex: 1,
  },
  brandLogo: {
    width: 188,
    height: 92,
  },
  brandTag: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginTop: 10,
    textAlign: 'center',
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
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 28,
  },
  contentStack: {
    gap: 16,
    marginTop: -18,
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
  cardSectionLabel: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
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
    fontSize: 13,
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
  childProfileHero: {
    alignItems: 'stretch',
    backgroundColor: COLORS.navyDark,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  childProfileHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  childProfileBackButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  childProfileBackButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  childProfileHeaderLabel: {
    color: '#D6E4FF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  childProfileHeroMain: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  childProfileHeroTextBlock: {
    flex: 1,
    paddingVertical: 2,
  },
  childProfileGroupBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  childProfileGroupBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  childProfileStatusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  childProfileStatusPillText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  profileInfoGrid: {
    gap: 12,
  },
  profileInfoItem: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  profileInfoLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  profileInfoValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  childProfileStatusBadge: {
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  childProfileStatusBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
  childProfileSectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  childProfileSectionIcon: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  profileList: {
    gap: 10,
  },
  profileListRow: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  profileListDot: {
    borderRadius: 999,
    height: 10,
    marginRight: 10,
    width: 10,
  },
  profileListLabel: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    paddingRight: 12,
  },
  profileListValue: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '900',
  },
  profileBulletList: {
    gap: 10,
  },
  profileBulletRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  profileBulletDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  profileBulletItem: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  profileBadgeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  profileMedicalBadge: {
    backgroundColor: '#FFF1F1',
    borderColor: '#FECACA',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  profileMedicalBadgeText: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '900',
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  shellHeroPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  shellHeroPillText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  shellHeroTitle: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginTop: 14,
  },
  shellHeroSubtitle: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 340,
  },
loginPage: {
  flex: 1,
  backgroundColor: 'transparent',
  position: 'relative',
},
  loginScroll: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
    gap: 14,
  },  loginHeroPhotoWrap: {
    marginHorizontal: -16,
    overflow: 'hidden',
  },
 loginHeroPhoto: {
   minHeight: 210,
   alignItems: 'center',
   justifyContent: 'center',
   paddingHorizontal: 16,
   paddingTop: 8,
   paddingBottom: 16,
 },
   loginHeroPhotoImage: {
     borderBottomLeftRadius: 28,
     borderBottomRightRadius: 28,
   },
   loginHeroOverlay: {
     ...StyleSheet.absoluteFillObject,
     backgroundColor: 'rgba(255, 255, 255, 0.39)',
   },
 loginHeroContent: {
   alignItems: 'center',
   justifyContent: 'center',
   position: 'relative',
   marginTop: -10,
 },
 heroLogo: {
   width: 350,
   height: 200,
 },
   loginCardPortal: {
 backgroundColor: 'rgba(255,255,255,0.32)',
     borderColor: COLORS.border,
     borderRadius: 28,
     borderWidth: 1,
     marginTop: 2,
     minHeight: 248,
     padding: 22,
     shadowColor: '#0F172A',
     shadowOffset: { width: 0, height: 10 },
     shadowOpacity: 0.06,
     shadowRadius: 24,
     elevation: 3,
   },
   loginCardHeaderPortal: {
     marginBottom: 16,
   },
   loginCardHeaderText: {
     gap: 4,
   },
   loginTitle: {
     color: COLORS.text,
     fontSize: 24,
     fontWeight: '900',
   },
   loginSubtitle: {
     color: COLORS.muted,
     fontSize: 13,
     lineHeight: 19,
     marginTop: 2,
   },
 testCardPortal: {
   backgroundColor: 'rgba(255,255,255,0.32)',
       borderColor: COLORS.border,
     borderRadius: 28,
     borderWidth: 1,
     marginTop: 4,
     padding: 18,
     shadowColor: '#0F172A',
     shadowOffset: { width: 0, height: 10 },
     shadowOpacity: 0.05,
     shadowRadius: 20,
     elevation: 2,
   },
   testHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
   },
   testHint: {
     color: COLORS.blue,
     fontSize: 13,
     fontWeight: '800',
   },
  testAccountList: {
    gap: 12,
    marginTop: 14,
  },
testAccountCard: {
  backgroundColor: 'rgba(234,242,255,0.0)',
      borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    width: '100%',
  },
  testAccountLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
  },
  testAccountEmail: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  testAccountDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  codePill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 10,
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  codePillText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: '900',
    maxWidth: '100%',
  },
  footerNote: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 14,
    marginTop: 0,
    textAlign: 'center',
  },
  footerWrap: {
    gap: 2,
    paddingBottom: 8,
  },
  parentHomeScroll: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
    paddingBottom: 44,
  },
  parentHomePage: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  parentScrollArea: {
    flex: 1,
  },
  parentHero: {
    alignItems: 'stretch',
    backgroundColor: COLORS.navyDark,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  parentHeroGlowOne: {
    backgroundColor: '#174EA6',
    borderRadius: 140,
    height: 130,
    opacity: 0.12,
    position: 'absolute',
    right: -60,
    top: -42,
    width: 130,
  },
  parentHeroGlowTwo: {
    backgroundColor: COLORS.blue,
    borderRadius: 140,
    bottom: -58,
    height: 120,
    left: -60,
    opacity: 0.12,
    position: 'absolute',
    width: 120,
  },
  parentHeroMain: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  parentHeroTextBlock: {
    flex: 1,
    paddingVertical: 2,
  },
  parentHeroKicker: {
    color: '#D6E4FF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 0,
    textAlign: 'left',
    textTransform: 'uppercase',
  },
  parentHeroGreeting: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4,
    textAlign: 'left',
  },
  parentHeroChildName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
    textAlign: 'left',
  },
  parentHeroStatusPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.success,
    borderRadius: 999,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  parentHeroStatusPillText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  parentHeroSubtitle: {
    color: '#D6E4FF',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
    maxWidth: 260,
    textAlign: 'left',
  },
parentHeroPhotoWrap: {
  alignItems: 'center',
  backgroundColor: COLORS.white,
  borderRadius: 999,
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.18,
  shadowRadius: 14,
  elevation: 4,
  padding: 4,
},
  parentHeroPhoto: {
    borderRadius: 999,
    height: 80,
    width: 80,
  },
  parentHomeContent: {
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  parentTodayCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  parentSectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  parentSectionHeaderTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '900',
  },
  parentSectionHeaderSubtle: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '800',
  },
  parentTodayRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
  },
  parentTodayItem: {
    flex: 1,
    alignItems: 'center',
  },
  parentTodayIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  parentTodayIcon: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: '900',
  },
  parentTodayLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
  },
  parentTodayValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 3,
    textAlign: 'center',
  },
  parentTodayDivider: {
    backgroundColor: COLORS.border,
    marginHorizontal: 14,
    width: 1,
  },
  parentQuickSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  parentQuickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  parentQuickCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    flexBasis: '48.5%',
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 158,
    overflow: 'hidden',
    padding: 15,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  parentQuickBlue: {
    backgroundColor: '#F3F7FF',
  },
  parentQuickPurple: {
    backgroundColor: '#F7F3FF',
  },
  parentQuickGreen: {
    backgroundColor: '#F2FAF5',
  },
  parentQuickOrange: {
    backgroundColor: '#FFF7EE',
  },
  parentQuickAccentBlue: {
    backgroundColor: COLORS.blue,
    borderRadius: 999,
    height: 10,
    width: 56,
  },
  parentQuickAccentPurple: {
    backgroundColor: '#7C5CFF',
    borderRadius: 999,
    height: 10,
    width: 56,
  },
  parentQuickAccentGreen: {
    backgroundColor: '#16A34A',
    borderRadius: 999,
    height: 10,
    width: 56,
  },
  parentQuickAccentOrange: {
    backgroundColor: '#F97316',
    borderRadius: 999,
    height: 10,
    width: 56,
  },
  parentQuickTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 16,
    lineHeight: 20,
  },
  parentQuickValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
    marginTop: 6,
  },
  parentQuickNote: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
  },
  logoutButton: {
    marginTop: 6,
  },
  loginBackgroundImage: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0.60,
},
loginBackgroundOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(244, 247, 251, 0.50)',
},});
