import { useState } from 'react';
import {
  Alert,
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

const MOCK_NOTIFICATIONS = [
  {
    title: 'Camp Reminder',
    message: 'Water Day is Friday at 1:00 PM.',
    time: '1:00 PM',
    category: 'Camp',
    read: false,
  },
  {
    title: 'Pickup Alert',
    message: 'Mia was checked in today at 8:12 AM with Ms. Sarah.',
    time: '8:12 AM',
    category: 'Pickup',
    read: false,
  },
  {
    title: 'Billing Notice',
    message: 'Your weekly balance is current.',
    time: 'Today',
    category: 'Billing',
    read: true,
  },
  {
    title: 'Daily Note',
    message: 'Mia had a great day and participated in group activities.',
    time: 'Yesterday',
    category: 'Daily',
    read: true,
  },
];

const NOTIFICATION_CATEGORY_THEMES = {
  Camp: {
    accent: COLORS.warning,
    soft: COLORS.softOrange,
    border: '#FDE68A',
  },
  Pickup: {
    accent: COLORS.blue,
    soft: COLORS.softBlue,
    border: '#BFD1FF',
  },
  Billing: {
    accent: COLORS.success,
    soft: COLORS.softGreen,
    border: '#BBF7D0',
  },
  Daily: {
    accent: '#7C5CFF',
    soft: COLORS.softPurple,
    border: '#D8C7FF',
  },
};

function getNotificationTheme(category) {
  return NOTIFICATION_CATEGORY_THEMES[category] || NOTIFICATION_CATEGORY_THEMES.Pickup;
}

const BEFORE_AFTER_WEEKLY_HOURS = [
  { day: 'Monday', hours: '8.5 hrs' },
  { day: 'Tuesday', hours: '9.0 hrs' },
  { day: 'Wednesday', hours: '8.0 hrs' },
  { day: 'Thursday', hours: '7.5 hrs' },
  { day: 'Friday', hours: '0.0 hrs' },
];

const AUTHORIZED_PICKUPS_TODAY = [
  { name: 'Avery Parent', relationship: 'Parent' },
  { name: 'Susan Carter', relationship: 'Grandmother' },
  { name: 'David Carter', relationship: 'Uncle' },
];

function BeforeAfterCareScreen({ onBack, onLogout, onOpenBilling }) {
  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.beforeAfterHero}>
          <View style={styles.childProfileHeaderRow}>
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              style={({ pressed }) => [
                styles.childProfileBackButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.childProfileBackButtonText}>Back</Text>
            </Pressable>

            <Text style={styles.childProfileHeaderLabel}>Before & After Care</Text>
          </View>

          <View style={styles.beforeAfterHeroMain}>
            <View style={styles.beforeAfterHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Mia Carter</Text>
              <View style={styles.beforeAfterHeroTag}>
                <Text style={styles.beforeAfterHeroTagText}>View Only</Text>
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

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Current Status</Text>
              <View style={styles.beforeAfterStatusPill}>
                <Text style={styles.beforeAfterStatusPillText}>Checked In</Text>
              </View>
            </View>

            <View style={styles.beforeAfterStatusList}>
              <View style={styles.beforeAfterStatusRow}>
                <Text style={styles.beforeAfterStatusLabel}>Check In Time</Text>
                <Text style={styles.beforeAfterStatusValue}>7:12 AM</Text>
              </View>
              <View style={styles.beforeAfterStatusRow}>
                <Text style={styles.beforeAfterStatusLabel}>Staff Member</Text>
                <Text style={styles.beforeAfterStatusValue}>Ms. Sarah</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Today&apos;s Schedule</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Daily routine</Text>
            </View>

            <View style={styles.beforeAfterScheduleList}>
              <View style={styles.beforeAfterScheduleRow}>
                <Text style={styles.beforeAfterScheduleLabel}>Arrival Time</Text>
                <Text style={styles.beforeAfterScheduleValue}>7:12 AM</Text>
              </View>
              <View style={styles.beforeAfterScheduleRow}>
                <Text style={styles.beforeAfterScheduleLabel}>School Dismissal Time</Text>
                <Text style={styles.beforeAfterScheduleValue}>3:15 PM</Text>
              </View>
              <View style={styles.beforeAfterScheduleRow}>
                <Text style={styles.beforeAfterScheduleLabel}>Pickup Time</Text>
                <Text style={styles.beforeAfterScheduleValue}>5:45 PM</Text>
              </View>
              <View style={styles.beforeAfterScheduleNotes}>
                <Text style={styles.beforeAfterScheduleLabel}>Notes</Text>
                <Text style={styles.beforeAfterScheduleNoteText}>
                  Mia has a regular after care schedule today.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Weekly Hours</Text>
              <Text style={styles.parentSectionHeaderSubtle}>This week</Text>
            </View>

            <View style={styles.beforeAfterHoursList}>
              {BEFORE_AFTER_WEEKLY_HOURS.map((entry) => (
                <View key={entry.day} style={styles.beforeAfterHoursRow}>
                  <Text style={styles.beforeAfterHoursDay}>{entry.day}</Text>
                  <Text style={styles.beforeAfterHoursValue}>{entry.hours}</Text>
                </View>
              ))}
            </View>

            <View style={styles.beforeAfterTotalRow}>
              <Text style={styles.beforeAfterTotalLabel}>Weekly Total</Text>
              <Text style={styles.beforeAfterTotalValue}>33.0 Hours</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={onOpenBilling}
              style={({ pressed }) => [
                styles.beforeAfterBillingButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.beforeAfterBillingButtonText}>View Billing</Text>
            </Pressable>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Authorized Pickup Today</Text>
              <Text style={styles.parentSectionHeaderSubtle}>3 people</Text>
            </View>

            <View style={styles.beforeAfterPickupList}>
              {AUTHORIZED_PICKUPS_TODAY.map((person) => (
                <View key={person.name} style={styles.beforeAfterPickupRow}>
                  <View style={styles.beforeAfterPickupAvatar}>
                    <Text style={styles.beforeAfterPickupAvatarText}>
                      {person.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.beforeAfterPickupTextBlock}>
                    <Text style={styles.beforeAfterPickupName}>{person.name}</Text>
                    <Text style={styles.beforeAfterPickupRelationship}>
                      {person.relationship}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onLogout}
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
  );
}

const SUMMER_CAMP_EVENTS = [
  'Water Day — Friday at 1:00 PM',
  'Field Trip — Next Tuesday',
  'Art Project — Wednesday Morning',
];

const SUMMER_CAMP_NOTES = [
  'Bring towel and water bottle for Water Day.',
  'Wear sneakers for outdoor games.',
  'Blue Group will meet near the playground.',
];

const SUMMER_CAMP_PHOTOS = ['Photo 1', 'Photo 2', 'Photo 3'];

function SummerCampScreen({ onBack, onLogout }) {
  const childTheme = getChildGroupTheme(CHILD_PROFILE.group);

  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summerCampHero}>
          <View style={styles.childProfileHeaderRow}>
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              style={({ pressed }) => [
                styles.childProfileBackButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.childProfileBackButtonText}>Back</Text>
            </Pressable>

            <Text style={styles.childProfileHeaderLabel}>Summer Camp</Text>
          </View>

          <View style={styles.summerCampHeroMain}>
            <View style={styles.summerCampHeroTextBlock}>
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
                  Blue Group
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

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Camp Status</Text>
            </View>

            <View
              style={styles.summerCampStatusHeaderRow}
            >
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
                  Blue Group
                </Text>
              </View>

              <View
                style={[
                  styles.childProfileGroupBadge,
                  { backgroundColor: childTheme.accent },
                ]}
              >
                <Text
                  style={[
                    styles.childProfileGroupBadgeText,
                    { color: COLORS.white },
                  ]}
                >
                  Checked In
                </Text>
              </View>
            </View>

            <View style={styles.summerCampStatusList}>
              <View style={styles.summerCampStatusRow}>
                <Text style={styles.summerCampStatusLabel}>Counselor</Text>
                <Text style={styles.summerCampStatusValue}>Ms. Sarah</Text>
              </View>
              <View style={styles.summerCampStatusRow}>
                <Text style={styles.summerCampStatusLabel}>Checked In Confirmed</Text>
                <Text style={styles.summerCampStatusValue}>9:15 AM</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Today&apos;s Camp Schedule</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Blue Group</Text>
            </View>

            <View style={styles.summerCampScheduleList}>
              <View style={styles.summerCampScheduleRow}>
                <Text style={styles.summerCampScheduleLabel}>Morning Activity</Text>
                <Text style={styles.summerCampScheduleValue}>Outdoor Games</Text>
              </View>
              <View style={styles.summerCampScheduleRow}>
                <Text style={styles.summerCampScheduleLabel}>Lunch</Text>
                <Text style={styles.summerCampScheduleValue}>12:00 PM</Text>
              </View>
              <View style={styles.summerCampScheduleRow}>
                <Text style={styles.summerCampScheduleLabel}>Afternoon Activity</Text>
                <Text style={styles.summerCampScheduleValue}>Water Play</Text>
              </View>
              <View style={styles.summerCampScheduleRow}>
                <Text style={styles.summerCampScheduleLabel}>Pickup Window</Text>
                <Text style={styles.summerCampScheduleValue}>4:00 PM - 5:30 PM</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Upcoming Camp Events</Text>
              <Text style={styles.parentSectionHeaderSubtle}>This week</Text>
            </View>

            <View style={styles.summerCampEventList}>
              {SUMMER_CAMP_EVENTS.map((event) => (
                <View key={event} style={styles.summerCampEventRow}>
                  <View style={[styles.summerCampEventDot, { backgroundColor: childTheme.accent }]} />
                  <Text style={styles.summerCampEventText}>{event}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Camp Notes</Text>
              <Text style={styles.parentSectionHeaderSubtle}>View only</Text>
            </View>

            <View style={styles.summerCampNoteList}>
              {SUMMER_CAMP_NOTES.map((note) => (
                <View key={note} style={styles.summerCampNoteRow}>
                  <View style={[styles.summerCampNoteMarker, { backgroundColor: childTheme.accent }]} />
                  <Text style={styles.summerCampNoteText}>{note}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Camp Photos Preview</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Mock cards</Text>
            </View>

            <View style={styles.summerCampPhotoGrid}>
              {SUMMER_CAMP_PHOTOS.map((label) => (
                <View key={label} style={[styles.summerCampPhotoCard, { borderColor: childTheme.border }]}>
                  <View style={[styles.summerCampPhotoThumb, { backgroundColor: childTheme.soft }]}>
                    <Text style={[styles.summerCampPhotoThumbText, { color: childTheme.accent }]}>Blue Group</Text>
                  </View>
                  <Text style={styles.summerCampPhotoLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onLogout}
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
  );
}

const PARENT_BILLING_OVERVIEW = {
  balance: '$348.00',
  status: 'Pending',
  dueDate: 'Friday',
  note: 'Billing is reviewed and sent by Advanced Education.',
};

const PARENT_BILLING_CARE_BILLING = [
  { label: 'Weekly Hours', value: '33.0' },
  { label: 'Hourly Rate', value: '$6.00/hr' },
  { label: 'Weekly Estimate', value: '$198.00' },
  { label: 'Status', value: 'Pending', tone: 'pending' },
];

const PARENT_BILLING_SUMMER_BILLING = [
  { label: 'Camp Week', value: 'Week 2' },
  { label: 'Weekly Camp Fee', value: '$150.00' },
  { label: 'Field Trip Fee', value: '$0.00' },
  { label: 'Camp Balance', value: '$150.00' },
  { label: 'Status', value: 'Pending', tone: 'pending' },
];

const PARENT_BILLING_INVOICES = [
  {
    period: 'Before & After Care',
    detail: 'Week of May 27',
    amount: '$198.00',
    status: 'Pending',
  },
  {
    period: 'Summer Camp',
    detail: 'Week 2',
    amount: '$150.00',
    status: 'Pending',
  },
  {
    period: 'Before & After Care',
    detail: 'Week of May 20',
    amount: '$171.50',
    status: 'Paid',
  },
];

function ParentBillingScreen({ onBack, onLogout }) {
  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        >
        <View style={styles.billingHero}>
          <View style={styles.childProfileHeaderRow}>
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              style={({ pressed }) => [
                styles.childProfileBackButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.childProfileBackButtonText}>Back</Text>
            </Pressable>

            <Text style={styles.childProfileHeaderLabel}>Billing</Text>
          </View>

          <View style={styles.billingHeroMain}>
            <View style={styles.billingHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Mia Carter</Text>
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

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Billing Overview</Text>
              <View style={styles.billingStatusPillOrange}>
                <Text style={styles.billingStatusPillOrangeText}>
                  {PARENT_BILLING_OVERVIEW.status}
                </Text>
              </View>
            </View>
            <Text style={styles.billingAmount}>{PARENT_BILLING_OVERVIEW.balance}</Text>
            <View style={styles.billingDetailList}>
              <View style={styles.billingDetailRow}>
                <Text style={styles.billingDetailLabel}>Due Date</Text>
                <View style={styles.billingStatusPill}>
                  <Text style={styles.billingStatusPillText}>
                    {PARENT_BILLING_OVERVIEW.dueDate}
                  </Text>
                </View>
              </View>
              <Text style={styles.billingNote}>
                {PARENT_BILLING_OVERVIEW.note}
              </Text>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>
                Before & After Care Billing
              </Text>
              <Text style={styles.parentSectionHeaderSubtle}>Pending</Text>
            </View>

            <View style={styles.billingDetailList}>
              {PARENT_BILLING_CARE_BILLING.map((entry) => (
                <View key={entry.label} style={styles.billingDetailRow}>
                  <Text style={styles.billingDetailLabel}>{entry.label}</Text>
                  {entry.tone === 'pending' ? (
                    <View style={styles.billingStatusPillOrange}>
                      <Text style={styles.billingStatusPillOrangeText}>{entry.value}</Text>
                    </View>
                  ) : (
                    <Text style={styles.billingDetailValue}>{entry.value}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Summer Camp Billing</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Pending</Text>
            </View>

            <View style={styles.billingDetailList}>
              {PARENT_BILLING_SUMMER_BILLING.map((entry) => (
                <View key={entry.label} style={styles.billingDetailRow}>
                  <Text style={styles.billingDetailLabel}>{entry.label}</Text>
                  {entry.tone === 'pending' ? (
                    <View style={styles.billingStatusPillOrange}>
                      <Text style={styles.billingStatusPillOrangeText}>{entry.value}</Text>
                    </View>
                  ) : (
                    <Text style={styles.billingDetailValue}>{entry.value}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Recent Invoices</Text>
              <Text style={styles.parentSectionHeaderSubtle}>History</Text>
            </View>

            <View style={styles.billingInvoiceList}>
              {PARENT_BILLING_INVOICES.map((invoice) => (
                <View key={`${invoice.period}-${invoice.detail}`} style={styles.billingInvoiceRow}>
                  <View style={styles.billingInvoiceCopy}>
                    <Text style={styles.billingInvoicePeriod}>{invoice.period}</Text>
                    <Text style={styles.billingInvoiceDetail}>{invoice.detail}</Text>
                    <Text style={styles.billingInvoiceAmount}>{invoice.amount}</Text>
                  </View>
                  <View
                    style={[
                      styles.billingInvoiceStatusPill,
                      invoice.status === 'Paid'
                        ? styles.billingInvoiceStatusPaid
                        : styles.billingInvoiceStatusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.billingInvoiceStatusText,
                        invoice.status === 'Paid'
                          ? styles.billingInvoiceStatusTextPaid
                          : styles.billingInvoiceStatusTextPending,
                      ]}
                    >
                      {invoice.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Payment Note</Text>
              <Text style={styles.parentSectionHeaderSubtle}>View only</Text>
            </View>

            <View style={styles.billingNoteList}>
              <Text style={styles.billingNoteItem}>
                Payments are handled through Advanced Education.
              </Text>
              <Text style={styles.billingNoteItem}>
                This prototype does not process payments yet.
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onLogout}
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
  );
}

const CHILD_TIMELINE_ITEMS = [
  {
    time: '8:12 AM',
    title: 'Checked In',
    message: 'Mia was checked in with Ms. Sarah.',
  },
  {
    time: '9:15 AM',
    title: 'Camp Group Confirmed',
    message: 'Mia was confirmed present in Blue Group.',
  },
  {
    time: '10:30 AM',
    title: 'Daily Note',
    message: 'Mia participated in outdoor games.',
  },
  {
    time: '12:00 PM',
    title: 'Lunch',
    message: 'Mia ate lunch with her group.',
  },
  {
    time: '1:00 PM',
    title: 'Camp Activity',
    message: 'Water Play activity started.',
  },
  {
    time: '4:35 PM',
    title: 'Pickup',
    message: 'Scheduled pickup window is open.',
  },
];

function ChildTimelineScreen({ onBack, onLogout }) {
  const childTheme = getChildGroupTheme(CHILD_PROFILE.group);

  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timelineHero}>
          <View style={styles.childProfileHeaderRow}>
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              style={({ pressed }) => [
                styles.childProfileBackButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.childProfileBackButtonText}>Back</Text>
            </Pressable>

            <Text style={styles.childProfileHeaderLabel}>Child Timeline</Text>
          </View>

          <View style={styles.timelineHeroMain}>
            <View style={styles.timelineHeroTextBlock}>
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
                  Blue Group
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

        <View style={styles.parentHomeContent}>
          <View style={styles.timelineIntroCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Today&apos;s Timeline</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Blue Group</Text>
            </View>
            <Text style={styles.timelineIntroText}>
              A simple view of Mia&apos;s day.
            </Text>
          </View>

          <View style={styles.timelineList}>
            {CHILD_TIMELINE_ITEMS.map((item, index) => (
              <View key={item.time} style={styles.timelineRow}>
                <View style={styles.timelineTimeColumn}>
                  <Text style={styles.timelineTime}>{item.time}</Text>
                </View>

                <View style={styles.timelineTrackColumn}>
                  <View style={styles.timelineDot} />
                  {index < CHILD_TIMELINE_ITEMS.length - 1 ? (
                    <View style={styles.timelineLine} />
                  ) : null}
                </View>

                <View style={styles.timelineCard}>
                  <Text style={styles.timelineCardTitle}>{item.title}</Text>
                  <Text style={styles.timelineCardMessage}>{item.message}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onLogout}
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
  );
}

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

function NotificationCard({ item }) {
  const theme = getNotificationTheme(item.category);

  return (
    <View
      style={[
        styles.notificationCard,
        !item.read && styles.notificationCardUnread,
      ]}
    >
      <View
        style={[
          styles.notificationAccentBar,
          { backgroundColor: theme.accent },
        ]}
      />

      <View style={styles.notificationCardBody}>
        <View style={styles.notificationCardTitleRow}>
          <Text style={styles.notificationCardTitle}>{item.title}</Text>
          <View
            style={[
              styles.notificationStatusPill,
              item.read
                ? styles.notificationStatusPillRead
                : styles.notificationStatusPillUnread,
            ]}
          >
            <Text
              style={[
                styles.notificationStatusPillText,
                item.read
                  ? styles.notificationStatusPillTextRead
                  : styles.notificationStatusPillTextUnread,
              ]}
            >
              {item.read ? 'Read' : 'Unread'}
            </Text>
          </View>
        </View>

        <Text style={styles.notificationCardMessage}>{item.message}</Text>

        <View style={styles.notificationMetaRow}>
          <View
            style={[
              styles.notificationCategoryPill,
              {
                backgroundColor: theme.soft,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.notificationCategoryPillText,
                { color: theme.accent },
              ]}
            >
              {item.category}
            </Text>
          </View>

          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
      </View>
    </View>
  );
}

function NotificationsScreen({ onBack, onLogout }) {
  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.notificationsHero}>
          <View style={styles.childProfileHeaderRow}>
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              style={({ pressed }) => [
                styles.childProfileBackButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.childProfileBackButtonText}>Back</Text>
            </Pressable>

            <Text style={styles.childProfileHeaderLabel}>Notifications</Text>
          </View>

          <View style={styles.notificationsHeroMain}>
            <View style={styles.notificationsHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Mia Carter</Text>
              <View style={styles.notificationsHeroTag}>
                <Text style={styles.notificationsHeroTagText}>Messages</Text>
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

        <View style={styles.parentHomeContent}>
          <View style={styles.notificationsIntroCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Inbox</Text>
              <Text style={styles.parentSectionHeaderSubtle}>
                {MOCK_NOTIFICATIONS.filter((item) => !item.read).length} unread
              </Text>
            </View>
            <Text style={styles.notificationsIntroText}>
              Simple updates from Mia&apos;s day.
            </Text>
          </View>

          <View style={styles.notificationsList}>
            {MOCK_NOTIFICATIONS.map((item) => (
              <NotificationCard key={item.title} item={item} />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onLogout}
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
                  onPress={() => setScreen('before-after-care')}
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
                  onPress={() => setScreen('summer-camp')}
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
                  onPress={() => setScreen('child-timeline')}
                  style={({ pressed }) => [
                    styles.parentQuickCard,
                    styles.parentQuickBlue,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <View style={styles.parentQuickAccentBlue} />
                  <Text style={styles.parentQuickTitle}>Timeline</Text>
                  <Text style={styles.parentQuickValue}>View Day</Text>
                  <Text style={styles.parentQuickNote}>See Mia&apos;s timeline</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setScreen('parent-billing')}
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
                  onPress={() => setScreen('notifications')}
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
      ) : screen === 'parent-billing' ? (
        <ParentBillingScreen
          onBack={() => setScreen('parent-home')}
          onLogout={handleLogout}
        />
      ) : screen === 'summer-camp' ? (
        <SummerCampScreen
          onBack={() => setScreen('parent-home')}
          onLogout={handleLogout}
        />
      ) : screen === 'child-timeline' ? (
        <ChildTimelineScreen
          onBack={() => setScreen('parent-home')}
          onLogout={handleLogout}
        />
      ) : screen === 'before-after-care' ? (
        <BeforeAfterCareScreen
          onBack={() => setScreen('parent-home')}
          onOpenBilling={() => setScreen('parent-billing')}
          onLogout={handleLogout}
        />
      ) : screen === 'notifications' ? (
        <NotificationsScreen
          onBack={() => setScreen('parent-home')}
          onLogout={handleLogout}
        />
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
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
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
borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
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
  beforeAfterHero: {
    backgroundColor: COLORS.navyDark,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  beforeAfterHeroMain: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  beforeAfterHeroTextBlock: {
    flex: 1,
    paddingVertical: 2,
  },
  beforeAfterHeroTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightBlue,
    borderRadius: 999,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  beforeAfterHeroTagText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  beforeAfterStatusPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.success,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  beforeAfterStatusPillText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  beforeAfterStatusList: {
    gap: 10,
  },
  beforeAfterStatusRow: {
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
  beforeAfterStatusLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  beforeAfterStatusValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  beforeAfterScheduleList: {
    gap: 10,
  },
  beforeAfterScheduleRow: {
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
  beforeAfterScheduleNotes: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  beforeAfterScheduleLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  beforeAfterScheduleValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  beforeAfterScheduleNoteText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  beforeAfterHoursList: {
    gap: 10,
  },
  beforeAfterHoursRow: {
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
  beforeAfterHoursDay: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  beforeAfterHoursValue: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: '900',
  },
  beforeAfterTotalRow: {
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  beforeAfterTotalLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  beforeAfterTotalValue: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: '900',
  },
  beforeAfterBillingButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightBlue,
    borderRadius: 999,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  beforeAfterBillingButtonText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  beforeAfterPickupList: {
    gap: 12,
  },
  beforeAfterPickupRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  beforeAfterPickupAvatar: {
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  beforeAfterPickupAvatarText: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: '900',
  },
  beforeAfterPickupTextBlock: {
    flex: 1,
  },
  beforeAfterPickupName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  beforeAfterPickupRelationship: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 3,
  },
  summerCampHero: {
    backgroundColor: COLORS.navyDark,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  summerCampHeroMain: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  summerCampHeroTextBlock: {
    flex: 1,
    paddingVertical: 2,
  },
  summerCampStatusList: {
    gap: 10,
  },
  summerCampStatusHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: -2,
  },
  summerCampStatusRow: {
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
  summerCampStatusLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  summerCampStatusValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  summerCampScheduleList: {
    gap: 10,
  },
  summerCampScheduleRow: {
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
  summerCampScheduleLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  summerCampScheduleValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  summerCampEventList: {
    gap: 10,
  },
  summerCampEventRow: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summerCampEventDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  summerCampEventText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  summerCampNoteList: {
    gap: 10,
  },
  summerCampNoteRow: {
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summerCampNoteMarker: {
    borderRadius: 999,
    height: 10,
    marginTop: 5,
    width: 10,
  },
  summerCampNoteText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  summerCampPhotoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  summerCampPhotoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
    padding: 10,
  },
  summerCampPhotoThumb: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 88,
    padding: 10,
  },
  summerCampPhotoThumbText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  summerCampPhotoLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
    textAlign: 'center',
  },
  billingHero: {
    backgroundColor: COLORS.navyDark,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  billingHeroMain: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  billingHeroTextBlock: {
    flex: 1,
    paddingVertical: 2,
  },
  billingAmount: {
    color: COLORS.blue,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginTop: 4,
  },
  billingDetailList: {
    gap: 10,
    marginTop: 10,
  },
  billingDetailRow: {
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
  billingDetailLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  billingDetailValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  billingNote: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  billingStatusPillOrange: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.softOrange,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  billingStatusPillOrangeText: {
    color: '#C2410C',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  billingInvoiceList: {
    gap: 10,
  },
  billingInvoiceRow: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  billingInvoiceCopy: {
    flex: 1,
  },
  billingInvoicePeriod: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  billingInvoiceAmount: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  billingInvoiceDetail: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  billingInvoiceStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  billingInvoiceStatusPaid: {
    backgroundColor: COLORS.softGreen,
  },
  billingInvoiceStatusPending: {
    backgroundColor: COLORS.softOrange,
  },
  billingInvoiceStatusText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  billingInvoiceStatusTextPaid: {
    color: COLORS.success,
  },
  billingInvoiceStatusTextPending: {
    color: '#C2410C',
  },
  billingNoteList: {
    gap: 10,
  },
  billingNoteItem: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  billingStatusPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.softBlue,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  billingStatusPillText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  timelineHero: {
    backgroundColor: COLORS.navyDark,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  timelineHeroMain: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  timelineHeroTextBlock: {
    flex: 1,
    paddingVertical: 2,
  },
  timelineIntroCard: {
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
  timelineIntroText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  timelineList: {
    gap: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  timelineTimeColumn: {
    paddingTop: 6,
    width: 78,
  },
  timelineTime: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
  },
  timelineTrackColumn: {
    alignItems: 'center',
    width: 18,
  },
  timelineDot: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.white,
    borderRadius: 999,
    borderWidth: 3,
    height: 16,
    width: 16,
    zIndex: 1,
  },
  timelineLine: {
    backgroundColor: COLORS.border,
    flex: 1,
    marginTop: -1,
    width: 2,
  },
  timelineCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  timelineCardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  timelineCardMessage: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  notificationsHero: {
    backgroundColor: COLORS.navyDark,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  notificationsHeroMain: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  notificationsHeroTextBlock: {
    flex: 1,
    paddingVertical: 2,
  },
  notificationsHeroTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.blue,
    borderRadius: 999,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  notificationsHeroTagText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  notificationsIntroCard: {
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
  notificationsIntroText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  notificationCardUnread: {
    borderColor: '#BFD1FF',
    backgroundColor: '#FBFDFF',
  },
  notificationAccentBar: {
    width: 8,
  },
  notificationCardBody: {
    flex: 1,
    gap: 10,
    padding: 16,
  },
  notificationCardTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  notificationCardTitle: {
    color: COLORS.text,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  notificationStatusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  notificationStatusPillUnread: {
    backgroundColor: COLORS.lightBlue,
  },
  notificationStatusPillRead: {
    backgroundColor: '#EEF2F6',
  },
  notificationStatusPillText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  notificationStatusPillTextUnread: {
    color: COLORS.blue,
  },
  notificationStatusPillTextRead: {
    color: COLORS.muted,
  },
  notificationCardMessage: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  notificationMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  notificationCategoryPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  notificationCategoryPillText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  notificationTime: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
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
