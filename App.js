import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './supabase';

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
  messages: '2 New',
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

function formatDailyNoteDateLabel(value) {
  return formatDate(value);
}

function formatMessageDateTime(value) {
  return formatDateTime(value);
}

function parseDateValue(value) {
  if (!value) {
    return null;
  }

  const parsed = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function formatDate(value) {
  const parsed = parseDateValue(String(value || ''));

  if (!parsed) {
    return 'Date not set';
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  const parsed = parseDateValue(String(value || ''));

  if (!parsed) {
    return 'Date not set';
  }

  const datePart = parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = parsed.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${datePart} • ${timePart}`;
}

function formatDuration(minutes) {
  const numericMinutes = Number(minutes);

  if (!Number.isFinite(numericMinutes) || numericMinutes <= 0) {
    return '0 min';
  }

  if (numericMinutes < 60) {
    return `${Math.round(numericMinutes)} min`;
  }

  const hours = Math.floor(numericMinutes / 60);
  const remainder = Math.round(numericMinutes % 60);

  return `${hours} hr ${remainder} min`;
}

function formatCurrency(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return '$0.00';
  }

  return numericValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

function formatAudienceLabel(audienceType) {
  if (audienceType === 'all_parents') {
    return 'All Parents';
  }
  if (audienceType === 'all_staff') {
    return 'All Staff';
  }
  if (audienceType === 'one_parent') {
    return 'One Parent';
  }
  if (audienceType === 'one_staff') {
    return 'One Staff';
  }

  return audienceType || 'All Parents';
}

function formatMessageTypeLabel(messageType) {
  if (!messageType) {
    return 'Announcement';
  }

  return messageType
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const EMERGENCY_CONTACT_PRIORITY_OPTIONS = [
  { value: 1, label: 'Primary Contact' },
  { value: 2, label: 'Secondary Contact' },
  { value: 3, label: 'Third Contact' },
  { value: 4, label: 'Fourth Contact' },
];

function formatEmergencyContactPriority(value) {
  const numericPriority = Number(value);
  const selectedOption = EMERGENCY_CONTACT_PRIORITY_OPTIONS.find(
    (option) => option.value === numericPriority
  );

  if (!selectedOption) {
    return 'Priority not set';
  }

  return `Priority ${selectedOption.value} - ${selectedOption.label}`;
}

function formatTime(value) {
  if (!value) {
    return 'Not recorded';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'Not recorded';
  }

  return parsed.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatMinutes(minutes) {
  return formatDuration(minutes);
}

function formatAttendanceType(value) {
  if (value === 'check_in') {
    return 'Checked In';
  }

  if (value === 'check_out') {
    return 'Checked Out';
  }

  return 'Attendance Event';
}

function getTodayIsoRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function deriveBeforeAfterStage(sessionRow) {
  if (!sessionRow) {
    return 0;
  }

  if (sessionRow.pickup_time) {
    return 4;
  }

  if (sessionRow.returned_time) {
    return 3;
  }

  if (sessionRow.bus_departure_time) {
    return 2;
  }

  if (sessionRow.drop_off_time) {
    return 1;
  }

  return 0;
}

function getBeforeAfterStatusLabel(sessionRow) {
  switch (deriveBeforeAfterStage(sessionRow)) {
    case 1:
      return 'Dropped Off';
    case 2:
      return 'On Bus';
    case 3:
      return 'Returned From Bus';
    case 4:
      return 'Picked Up';
    default:
      return 'Ready for Drop Off';
  }
}

function getBeforeAfterLatestTime(sessionRow) {
  return (
    sessionRow?.pickup_time ||
    sessionRow?.returned_time ||
    sessionRow?.bus_departure_time ||
    sessionRow?.drop_off_time ||
    sessionRow?.created_at ||
    'Not started'
  );
}

function getBeforeAfterTimelineEntries(sessionRow, events) {
  const eventMap = {
    parent_drop_off: 'Dropped Off',
    put_on_bus: 'On Bus',
    returned_from_bus: 'Returned From Bus',
    parent_pickup: 'Picked Up',
  };

  const sessionEntries = [
    sessionRow?.drop_off_time
      ? {
          id: `${sessionRow.id}-drop-off`,
          title: 'Dropped Off',
          time: sessionRow.drop_off_time,
          message: 'Parent drop off recorded.',
        }
      : null,
    sessionRow?.bus_departure_time
      ? {
          id: `${sessionRow.id}-bus`,
          title: 'On Bus',
          time: sessionRow.bus_departure_time,
          message: 'Put on bus recorded.',
        }
      : null,
    sessionRow?.returned_time
      ? {
          id: `${sessionRow.id}-returned`,
          title: 'Returned From Bus',
          time: sessionRow.returned_time,
          message: 'Returned from bus recorded.',
        }
      : null,
    sessionRow?.pickup_time
      ? {
          id: `${sessionRow.id}-pickup`,
          title: 'Picked Up',
          time: sessionRow.pickup_time,
          message: 'Parent pickup recorded.',
        }
      : null,
  ].filter(Boolean);

  const eventEntries = (Array.isArray(events) ? events : []).map((event) => ({
    id: event.id,
    title: eventMap[event.event_type] || event.event_type || 'Attendance Update',
    time: event.event_time,
    message: eventMap[event.event_type]
      ? `${eventMap[event.event_type]} recorded.`
      : 'Attendance update recorded.',
  }));

  return [...eventEntries, ...sessionEntries].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );
}

function BeforeAfterCareScreen({ onBack, onLogout, loading, error, records }) {
  const renderStatusPill = (status) => (
    <View
      style={[
        styles.beforeAfterStatusPill,
        status === 'picked_up'
          ? styles.staffAttendanceStatusPillGreen
          : status === 'on_bus'
            ? styles.staffAttendanceStatusPillBlue
            : styles.staffAttendanceStatusPillOrange,
      ]}
    >
      <Text
        style={[
          styles.beforeAfterStatusPillText,
          status === 'picked_up'
            ? styles.staffAttendanceStatusPillTextGreen
            : status === 'on_bus'
              ? styles.staffAttendanceStatusPillTextBlue
              : styles.staffAttendanceStatusPillTextOrange,
        ]}
      >
        {status === 'picked_up'
          ? 'Picked Up'
          : status === 'on_bus'
            ? 'On Bus'
            : status === 'returned'
              ? 'Returned From Bus'
              : status === 'dropped_off'
                ? 'Dropped Off'
                : 'Ready for Drop Off'}
      </Text>
    </View>
  );

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
              <Text style={styles.parentHeroGreeting}>Before & After Care</Text>
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
          {loading ? <Text style={styles.parentAttendanceStateText}>Loading camp roster...</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Today&apos;s B&amp;A Records</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Read only</Text>
            </View>

            {loading ? (
              <Text style={styles.parentAttendanceStateText}>Loading Before & After Care...</Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : records.length ? (
              <View style={styles.profileList}>
                {records.map((record) => (
                  <View key={record.id} style={styles.profileCardInner}>
                    <View style={styles.parentSectionHeaderRow}>
                      <Text style={styles.parentSectionHeaderTitle}>{record.childName}</Text>
                      {renderStatusPill(record.status)}
                    </View>

                    <View style={styles.beforeAfterStatusList}>
                      <View style={styles.beforeAfterStatusRow}>
                        <Text style={styles.beforeAfterStatusLabel}>Drop Off Time</Text>
                        <Text style={styles.beforeAfterStatusValue}>
                          {formatTime(record.drop_off_time)}
                        </Text>
                      </View>
                      <View style={styles.beforeAfterStatusRow}>
                        <Text style={styles.beforeAfterStatusLabel}>Put On Bus Time</Text>
                        <Text style={styles.beforeAfterStatusValue}>
                          {formatTime(record.bus_departure_time)}
                        </Text>
                      </View>
                      <View style={styles.beforeAfterStatusRow}>
                        <Text style={styles.beforeAfterStatusLabel}>Morning Time</Text>
                        <Text style={styles.beforeAfterStatusValue}>
                          {formatMinutes(record.morning_minutes)}
                        </Text>
                      </View>
                      <View style={styles.beforeAfterStatusRow}>
                        <Text style={styles.beforeAfterStatusLabel}>Returned Time</Text>
                        <Text style={styles.beforeAfterStatusValue}>
                          {formatTime(record.returned_time)}
                        </Text>
                      </View>
                      <View style={styles.beforeAfterStatusRow}>
                        <Text style={styles.beforeAfterStatusLabel}>Parent Pickup Time</Text>
                        <Text style={styles.beforeAfterStatusValue}>
                          {formatTime(record.pickup_time)}
                        </Text>
                      </View>
                      <View style={styles.beforeAfterStatusRow}>
                        <Text style={styles.beforeAfterStatusLabel}>Afternoon Time</Text>
                        <Text style={styles.beforeAfterStatusValue}>
                          {formatMinutes(record.afternoon_minutes)}
                        </Text>
                      </View>
                      <View style={styles.beforeAfterStatusRow}>
                        <Text style={styles.beforeAfterStatusLabel}>Total Time Today</Text>
                        <Text style={styles.beforeAfterStatusValue}>
                          {formatMinutes(record.total_minutes)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.parentAttendanceStateText}>
                No Before &amp; After Care record for today.
              </Text>
            )}
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

function ParentBillingScreen({ onBack, onLogout, currentUserId }) {
  const [invoices, setInvoices] = useState([]);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState('');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);

  const loadParentBillingData = useCallback(async () => {
    if (!currentUserId) {
      setInvoices([]);
      setBillingError('No parent account found.');
      setBillingLoading(false);
      return;
    }

    setBillingLoading(true);
    setBillingError('');

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', currentUserId)
        .single();

      if (profileError || !profile || profile.role !== 'parent') {
        setInvoices([]);
        setBillingError('No parent account found.');
        return;
      }

      const { data: invoiceRows, error: invoiceError } = await supabase
        .from('invoices')
        .select(
          'id, invoice_number, parent_profile_id, child_id, billing_period_start, billing_period_end, subtotal, total, status, due_date, created_at'
        )
        .eq('parent_profile_id', currentUserId)
        .order('created_at', { ascending: false });

      if (invoiceError) {
        throw new Error(invoiceError.message || 'Could not load invoices.');
      }

      const rows = Array.isArray(invoiceRows) ? invoiceRows : [];
      const invoiceIds = Array.from(new Set(rows.map((invoice) => invoice.id).filter(Boolean)));
      const childIds = Array.from(new Set(rows.map((invoice) => invoice.child_id).filter(Boolean)));

      const [childrenResult, lineItemsResult] = await Promise.all([
        childIds.length
          ? supabase
              .from('children')
              .select('id, first_name, last_name')
              .in('id', childIds)
          : Promise.resolve({ data: [], error: null }),
        invoiceIds.length
          ? supabase
              .from('invoice_line_items')
              .select('id, invoice_id, description, quantity, rate, amount')
              .in('invoice_id', invoiceIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (childrenResult.error) {
        throw new Error(childrenResult.error.message || 'Could not load children.');
      }

      if (lineItemsResult.error) {
        throw new Error(lineItemsResult.error.message || 'Could not load invoice line items.');
      }

      const childById = (Array.isArray(childrenResult.data) ? childrenResult.data : []).reduce(
        (acc, child) => {
          acc[child.id] = child;
          return acc;
        },
        {}
      );

      const lineItemsByInvoiceId = (Array.isArray(lineItemsResult.data) ? lineItemsResult.data : []).reduce(
        (acc, item) => {
          if (!acc[item.invoice_id]) {
            acc[item.invoice_id] = [];
          }
          acc[item.invoice_id].push(item);
          return acc;
        },
        {}
      );

      setInvoices(
        rows.map((invoice) => {
          const child = childById[invoice.child_id];
          return {
            ...invoice,
            childName:
              `${child?.first_name || ''} ${child?.last_name || ''}`.trim() ||
              'Unnamed Student',
            lineItems: lineItemsByInvoiceId[invoice.id] || [],
          };
        })
      );
    } catch (loadError) {
      setInvoices([]);
      setBillingError(loadError?.message || 'Could not load billing records.');
    } finally {
      setBillingLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadParentBillingData();
  }, [loadParentBillingData]);

  const summaryTotals = invoices.reduce(
    (acc, invoice) => {
      const total = Number(invoice.total || 0);
      if (invoice.status === 'paid') {
        acc.paidTotal += total;
      } else if (invoice.status === 'overdue') {
        acc.overdueTotal += total;
        acc.currentBalance += total;
      } else if (invoice.status === 'pending') {
        acc.currentBalance += total;
      }
      return acc;
    },
    { currentBalance: 0, paidTotal: 0, overdueTotal: 0 }
  );

  const getInvoiceStatusLabel = (status) => {
    if (!status) {
      return 'Pending';
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusStyle = (status) => {
    if (status === 'paid') {
      return [styles.billingInvoiceStatusPill, styles.billingInvoiceStatusPaid];
    }
    if (status === 'overdue') {
      return [styles.billingInvoiceStatusPill, styles.billingInvoiceStatusOverdue];
    }
    if (status === 'cancelled') {
      return [styles.billingInvoiceStatusPill, styles.billingInvoiceStatusCancelled];
    }
    return [styles.billingInvoiceStatusPill, styles.billingInvoiceStatusPending];
  };

  const getStatusTextStyle = (status) => {
    if (status === 'paid') {
      return [styles.billingInvoiceStatusText, styles.billingInvoiceStatusTextPaid];
    }
    if (status === 'overdue') {
      return [styles.billingInvoiceStatusText, styles.billingInvoiceStatusTextOverdue];
    }
    if (status === 'cancelled') {
      return [styles.billingInvoiceStatusText, styles.billingInvoiceStatusTextCancelled];
    }
    return [styles.billingInvoiceStatusText, styles.billingInvoiceStatusTextPending];
  };

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
              <Text style={styles.parentHeroGreeting}>Billing</Text>
            </View>

            <View style={styles.parentHeroPhotoWrap}>
              <Image source={HEADER_PHOTO} resizeMode="cover" style={styles.parentHeroPhoto} />
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Billing Summary</Text>
              <View style={styles.billingStatusPillOrange}>
                <Text style={styles.billingStatusPillOrangeText}>View Only</Text>
              </View>
            </View>

            <View style={styles.billingDetailList}>
              <View style={styles.billingDetailRow}>
                <Text style={styles.billingDetailLabel}>Current Balance</Text>
                <Text style={styles.billingDetailValue}>
                  {formatCurrency(summaryTotals.currentBalance)}
                </Text>
              </View>
              <View style={styles.billingDetailRow}>
                <Text style={styles.billingDetailLabel}>Paid Total</Text>
                <Text style={styles.billingDetailValue}>
                  {formatCurrency(summaryTotals.paidTotal)}
                </Text>
              </View>
              <View style={styles.billingDetailRow}>
                <Text style={styles.billingDetailLabel}>Overdue Total</Text>
                <Text style={styles.billingDetailValue}>
                  {formatCurrency(summaryTotals.overdueTotal)}
                </Text>
              </View>
            </View>
          </View>

          {billingLoading ? (
            <View style={styles.profileCard}>
              <Text style={styles.parentAttendanceStateText}>Loading invoices...</Text>
            </View>
          ) : billingError ? (
            <View style={styles.profileCard}>
              <Text style={styles.errorText}>{billingError}</Text>
            </View>
          ) : invoices.length ? (
            <View style={styles.profileCard}>
              <View style={styles.parentSectionHeaderRow}>
                <Text style={styles.parentSectionHeaderTitle}>Invoices</Text>
                <Text style={styles.parentSectionHeaderSubtle}>Recent records</Text>
              </View>

              <View style={styles.billingInvoiceList}>
                {invoices.map((invoice) => {
                  const isExpanded = expandedInvoiceId === invoice.id;
                  return (
                    <Pressable
                      key={invoice.id}
                      accessibilityRole="button"
                      onPress={() =>
                        setExpandedInvoiceId((current) =>
                          current === invoice.id ? null : invoice.id
                        )
                      }
                      style={({ pressed }) => [
                        styles.billingInvoiceCard,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <View style={styles.billingInvoiceCardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.billingInvoicePeriod}>{invoice.invoice_number}</Text>
                          <Text style={styles.billingInvoiceDetail}>{invoice.childName}</Text>
                          <Text style={styles.billingInvoiceDetail}>
                            {`${formatDate(invoice.billing_period_start)} - ${formatDate(
                              invoice.billing_period_end
                            )}`}
                          </Text>
                        </View>
                        <View style={getStatusStyle(invoice.status)}>
                          <Text style={getStatusTextStyle(invoice.status)}>
                            {getInvoiceStatusLabel(invoice.status)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.billingInvoiceCardFooter}>
                        <Text style={styles.billingInvoiceAmount}>
                          {formatCurrency(invoice.total)}
                        </Text>
                        <Text style={styles.billingInvoiceDetail}>
                          Due {formatDate(invoice.due_date)}
                        </Text>
                      </View>

                      {isExpanded ? (
                        <View style={styles.billingInvoiceExpandedSection}>
                          <View style={styles.billingDetailList}>
                            {(invoice.lineItems || []).length ? (
                              invoice.lineItems.map((lineItem) => (
                                <View key={lineItem.id} style={styles.billingLineItemCard}>
                                  <Text style={styles.billingLineItemDescription}>
                                    {lineItem.description || 'Invoice item'}
                                  </Text>
                                  <View style={styles.billingLineItemRow}>
                                    <Text style={styles.billingLineItemMeta}>
                                      Qty {lineItem.quantity}
                                    </Text>
                                    <Text style={styles.billingLineItemMeta}>
                                      {formatCurrency(lineItem.rate)}
                                    </Text>
                                    <Text style={styles.billingLineItemMeta}>
                                      {formatCurrency(lineItem.amount)}
                                    </Text>
                                  </View>
                                </View>
                              ))
                            ) : (
                              <Text style={styles.billingNote}>No line items found.</Text>
                            )}
                          </View>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.profileCard}>
              <Text style={styles.parentAttendanceStateText}>No invoices yet.</Text>
            </View>
          )}

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

function StaffHomeScreen({
  onLogout,
  onShowComingSoon,
  onOpenClock,
  onOpenBeforeAfter,
  onOpenIncidentReports,
  onOpenCamp,
  onOpenMessages,
  onOpenNotifications,
  onOpenNotes,
  onOpenHours,
  staffStatus,
  messages,
  loading,
  error,
  expandedMessageId,
  onToggleMessage,
}) {
  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.staffHero}>
          <View style={styles.staffHeroMain}>
            <View style={styles.staffHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Hi, Ms. Sarah</Text>
              <Text style={styles.staffHeroSubheading}>Staff Workspace</Text>
              <View style={styles.staffStatusPill}>
                <Text style={styles.staffStatusPillText}>{staffStatus}</Text>
              </View>
            </View>

            <View style={styles.staffAvatarPlaceholder}>
              <Text style={styles.staffAvatarText}>MS</Text>
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.staffButtonStack}>
            {STAFF_WORKSPACE_CARDS.map((card) => (
              <ActionButtonCard
                key={card.title}
                accent={card.accent}
                title={card.title}
                value={card.title === 'Clock In / Out' ? staffStatus : card.value}
                note={card.note}
                onPress={() =>
                  card.title === 'Clock In / Out'
                    ? onOpenClock()
                    : card.title === 'Before & After Care Attendance'
                      ? onOpenBeforeAfter()
                    : card.title === 'Summer Camp Group Check-In'
                      ? onOpenCamp()
                      : card.title === 'Incident Reports'
                        ? onOpenIncidentReports()
                    : card.title === 'Messages'
                      ? onOpenMessages()
                      : card.title === 'Notifications'
                        ? onOpenNotifications()
                      : card.title === 'Daily Notes'
                        ? onOpenNotes()
                        : card.title === 'My Hours'
                          ? onOpenHours()
                              : onShowComingSoon(card.title)
                }
              />
            ))}
          </View>

          <RecipientMessagesSection
            title="Messages"
            subtitle="Recent updates sent to this account."
            messages={messages}
            loading={loading}
            error={error}
            expandedMessageId={expandedMessageId}
            onToggleMessage={onToggleMessage}
          />

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

/*
function StaffDailyNotesScreen({ onBack, onLogout, savedNotes, onSaveNote }) {
  const [selectedChildId, setSelectedChildId] = useState(STAFF_DAILY_NOTE_CHILDREN[0]?.id ?? null);
  const [selectedQuickNotes, setSelectedQuickNotes] = useState([]);
  const [customNote, setCustomNote] = useState('');
  const visibility = { parent: false, owner: true };
  const [savedFormKey, setSavedFormKey] = useState('');
  const [savedFormKey, setSavedFormKey] = useState('');
  const [savedFormKey, setSavedFormKey] = useState('');
  const [savedFormKey, setSavedFormKey] = useState('');
  const [savedFormKey, setSavedFormKey] = useState('');
  const [savedSignature, setSavedSignature] = useState(null);

  const selectedChild =
    STAFF_DAILY_NOTE_CHILDREN.find((child) => child.id === selectedChildId) ||
    STAFF_DAILY_NOTE_CHILDREN[0] ||
    null;

  const toggleQuickNote = (note) => {
    setSelectedQuickNotes((prev) =>
      prev.includes(note) ? prev.filter((item) => item !== note) : [...prev, note]
    );
  };

  const toggleVisibility = (target) => {
    setVisibility((prev) => ({
      ...prev,
      [target]: !prev[target],
    }));
  };

  const previewQuickNotes = selectedQuickNotes.length
    ? selectedQuickNotes.join(' • ')
    : 'No quick notes selected';
  const previewCustomNote = customNote.trim() || 'No custom note added';
  const previewVisibility = [
    visibility.parent ? 'Parent' : null,
    visibility.owner ? 'Owner' : null,
  ].filter(Boolean);
  const currentFormKey = [
    selectedChild?.id || '',
    [...selectedQuickNotes].sort().join('|'),
    customNote.trim(),
    visibility.parent ? '1' : '0',
    visibility.owner ? '1' : '0',
  ].join('::');
  const hasContent = selectedQuickNotes.length > 0 || customNote.trim().length > 0;
  const isSaved = Boolean(savedFormKey) && savedFormKey === currentFormKey;
  const canSave = Boolean(selectedChild) && hasContent;
  const isSaveDisabled = !canSave || isSaved;
  const currentSignature = [
    selectedChild?.id || '',
    [...selectedQuickNotes].sort().join('|'),
    customNote.trim(),
    visibility.parent ? '1' : '0',
    visibility.owner ? '1' : '0',
  ].join('::');
  const hasContent = selectedQuickNotes.length > 0 || customNote.trim().length > 0;
  const isSaved = savedSignature !== null && savedSignature === currentSignature;
  const canSave = Boolean(selectedChild) && hasContent;
  const isSaveDisabled = !canSave || isSaved;

  const handleSave = async () => {
    if (!selectedChild) {
      Alert.alert('Select a child first.');
      return;
    }

    if (!hasContent || isSaved) {
      return;
    }

    const savedEntry = await onSaveNote({
      childId: selectedChild.id,
      childName: selectedChild.name,
      quickNotes: selectedQuickNotes,
      customNote: customNote.trim(),
      visibility,
      signature: currentSignature,
    });

    if (!savedEntry) {
      return;
    }

    Alert.alert(`Daily note saved for ${selectedChild.name}.`);
    setSavedSignature(currentSignature);
  };

  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.staffClockHero}>
          <View style={styles.childProfileHeaderRow}>
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              style={({ pressed }) => [styles.childProfileBackButton, pressed && styles.pressedButton]}
            >
              <Text style={styles.childProfileBackButtonText}>Back</Text>
            </Pressable>

            <Text style={styles.childProfileHeaderLabel}>Daily Notes</Text>
          </View>

          <View style={styles.staffHeroMain}>
            <View style={styles.staffHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Staff: Ms. Sarah</Text>
              <Text style={styles.staffHeroSubheading}>Parent note writer</Text>
            </View>

            <View style={styles.staffAvatarPlaceholder}>
              <Text style={styles.staffAvatarText}>MS</Text>
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Select Child</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Tap one child</Text>
            </View>

            <View style={styles.staffDailyNotesChildGrid}>
              {STAFF_DAILY_NOTE_CHILDREN.map((child) => {
                const isSelected = child.id === selectedChild?.id;
                const theme = getChildGroupTheme(child.accentGroup);

                return (
                  <Pressable
                    key={child.id}
                    accessibilityRole="button"
                    onPress={() => {
                      setSelectedChildId(child.id);
                      setSavedSignature(null);
                    }}
                    style={({ pressed }) => [
                      styles.staffDailyNotesChildCard,
                      { borderColor: theme.border },
                      isSelected && styles.staffDailyNotesChildCardSelected,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <View style={[styles.staffDailyNotesChildAccent, { backgroundColor: theme.accent }]} />
                    <Text style={styles.staffDailyNotesChildName}>{child.name}</Text>
                    <Text style={styles.staffDailyNotesChildMeta}>
                      {isSelected ? 'Selected' : 'Tap to select'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Quick Notes</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Tap multiple chips</Text>
            </View>

            <View style={styles.staffDailyNotesChipWrap}>
              {STAFF_DAILY_NOTE_CHIPS.map((note) => {
                const active = selectedQuickNotes.includes(note);

                return (
                  <Pressable
                    key={note}
                    accessibilityRole="button"
                    onPress={() => {
                      toggleQuickNote(note);
                      setSavedSignature(null);
                    }}
                    style={({ pressed }) => [
                      styles.staffDailyNotesChip,
                      active && styles.staffDailyNotesChipActive,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.staffDailyNotesChipText,
                        active && styles.staffDailyNotesChipTextActive,
                      ]}
                    >
                      {note}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Custom Note</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Optional</Text>
            </View>

            <TextInput
              multiline
              onChangeText={(text) => {
                setCustomNote(text);
                setSavedSignature(null);
              }}
              placeholder="Write a note for the parent..."
              placeholderTextColor={COLORS.muted}
              style={[styles.input, styles.staffDailyNotesInput]}
              textAlignVertical="top"
              value={customNote}
            />
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Visibility</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Default: Parent + Owner</Text>
            </View>

            <View style={styles.staffDailyNotesVisibilityRow}>
              {[
                { key: 'parent', label: 'Parent' },
                { key: 'owner', label: 'Owner' },
              ].map((item) => {
                const active = visibility[item.key];

                return (
                  <Pressable
                    key={item.key}
                    accessibilityRole="button"
                    onPress={() => {
                      toggleVisibility(item.key);
                      setSavedSignature(null);
                    }}
                    style={({ pressed }) => [
                      styles.staffDailyNotesVisibilityChip,
                      active && styles.staffDailyNotesVisibilityChipActive,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.staffDailyNotesVisibilityText,
                        active && styles.staffDailyNotesVisibilityTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Note Preview</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Mock sync preview</Text>
            </View>

            <View style={styles.staffDailyNotesPreviewList}>
              <View style={styles.staffDailyNotesPreviewBlock}>
                <Text style={styles.staffDailyNotesPreviewLabel}>Selected child</Text>
                <Text style={styles.staffDailyNotesPreviewValue}>{selectedChild?.name || '—'}</Text>
              </View>
              <View style={styles.staffDailyNotesPreviewBlock}>
                <Text style={styles.staffDailyNotesPreviewLabel}>Quick notes</Text>
                <Text style={styles.staffDailyNotesPreviewValue}>{previewQuickNotes}</Text>
              </View>
              <View style={styles.staffDailyNotesPreviewBlock}>
                <Text style={styles.staffDailyNotesPreviewLabel}>Custom note</Text>
                <Text style={styles.staffDailyNotesPreviewValue}>{previewCustomNote}</Text>
              </View>
              <View style={styles.staffDailyNotesPreviewBlock}>
                <Text style={styles.staffDailyNotesPreviewLabel}>Staff / time</Text>
                <Text style={styles.staffDailyNotesPreviewValue}>
                  {STAFF_MEMBER.name} · {STAFF_CLOCK_CURRENT_TIME}
                </Text>
              </View>
              <View style={styles.staffDailyNotesPreviewBlock}>
                <Text style={styles.staffDailyNotesPreviewLabel}>Sync targets</Text>
                <View style={styles.staffDailyNotesTagRow}>
                  {previewVisibility.length ? (
                    previewVisibility.map((target) => (
                      <View key={target} style={styles.staffDailyNotesTag}>
                        <Text style={styles.staffDailyNotesTagText}>{target}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.staffDailyNotesPreviewValue}>No visibility selected</Text>
                  )}
                </View>
              </View>
            </View>

            <Text style={styles.staffDailyNotesPreviewFooter}>
              This note can later sync to Parent Notifications, Child Timeline, and the Owner Dashboard.
            </Text>

            <View style={styles.staffDailyNotesSavedHeader}>
              <Text style={styles.staffDailyNotesSavedTitle}>Recent Saved Notes</Text>
              <Text style={styles.staffDailyNotesPreviewFooter}>Local only</Text>
            </View>

            <View style={styles.staffDailyNotesSavedList}>
              {savedNotes.length ? (
                savedNotes.slice(0, 3).map((note) => (
                  <View key={note.id} style={styles.staffDailyNotesSavedItem}>
                    <View style={styles.staffDailyNotesSavedTopRow}>
                      <Text style={styles.staffDailyNotesSavedChild}>{note.childName}</Text>
                      <Text style={styles.staffDailyNotesSavedTime}>{note.time}</Text>
                    </View>
                    <Text style={styles.staffDailyNotesSavedSummary}>{note.summary}</Text>
                    <View style={styles.staffDailyNotesTagRow}>
                      {note.visibility.parent ? (
                        <View style={styles.staffDailyNotesTag}>
                          <Text style={styles.staffDailyNotesTagText}>Parent</Text>
                        </View>
                      ) : null}
                      {note.visibility.owner ? (
                        <View style={styles.staffDailyNotesTag}>
                          <Text style={styles.staffDailyNotesTagText}>Owner</Text>
                        </View>
                      ) : null}
                      <View style={styles.staffDailyNotesTag}>
                        <Text style={styles.staffDailyNotesTagText}>Timeline</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.staffDailyNotesPreviewFooter}>No notes saved yet.</Text>
              )}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleSave}
            disabled={isSaveDisabled}
            style={({ pressed }) => [
              styles.primaryButton,
              isSaved && styles.staffDailyNotesSaveButtonSaved,
              isSaveDisabled && !isSaved && styles.staffDailyNotesSaveButtonDisabled,
              pressed && !isSaveDisabled && styles.pressedButton,
            ]}
          >
            <Text
              style={[
                styles.primaryButtonText,
                isSaved && styles.staffDailyNotesSaveButtonTextSaved,
                isSaveDisabled && !isSaved && styles.staffDailyNotesSaveButtonTextDisabled,
              ]}
            >
              {isSaved ? '✓ Note Saved' : 'Save Daily Note'}
            </Text>
          </Pressable>

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
*/

function StaffDailyNotesScreen({ onBack, onLogout, savedNotes, onSaveNote }) {
  const [staffDailyNoteChildren, setStaffDailyNoteChildren] = useState([]);
  const [staffDailyNotesLoading, setStaffDailyNotesLoading] = useState(true);
  const [staffDailyNotesError, setStaffDailyNotesError] = useState('');
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [selectedQuickNotes, setSelectedQuickNotes] = useState([]);
  const [customNote, setCustomNote] = useState('');
  const visibility = { parent: false, owner: true };
  const [savedFormKey, setSavedFormKey] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadChildren = async () => {
      setStaffDailyNotesLoading(true);
      setStaffDailyNotesError('');

      const { data, error } = await supabase
        .from('children')
        .select('id, first_name, last_name, room, status, profile_accent_color')
        .eq('status', 'active');

      if (!isMounted) {
        return;
      }

      if (error) {
        setStaffDailyNoteChildren([]);
        setStaffDailyNotesError(error.message || 'Could not load children.');
        setStaffDailyNotesLoading(false);
        return;
      }

      const loadedChildren = (Array.isArray(data) ? data : []).map((child, index) => {
        const firstName = child.first_name?.trim() || '';
        const lastName = child.last_name?.trim() || '';
        const name = `${firstName} ${lastName}`.trim() || 'Unnamed Student';

        return {
          id: child.id ?? `${name}-${index}`,
          name,
          room: child.room?.trim() || 'Room not set',
          status: child.status?.trim() || 'active',
          accentGroup: child.profile_accent_color || 'blue',
          first_name: child.first_name || '',
          last_name: child.last_name || '',
        };
      });

      setStaffDailyNoteChildren(loadedChildren);
      setSelectedChildId((current) => current || loadedChildren[0]?.id || null);
      setStaffDailyNotesLoading(false);
    };

    loadChildren();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedChild =
    staffDailyNoteChildren.find((child) => child.id === selectedChildId) ||
    staffDailyNoteChildren[0] ||
    null;

  const toggleQuickNote = (note) => {
    setSelectedQuickNotes((prev) =>
      prev.includes(note) ? prev.filter((item) => item !== note) : [...prev, note]
    );
  };

  const previewQuickNotes = selectedQuickNotes.length
    ? selectedQuickNotes.join(' • ')
    : 'No quick notes selected';
  const previewCustomNote = customNote.trim() || 'No custom note added';
  const previewVisibility = ['Owner Review'];
  const currentFormKey = [
    selectedChild?.id || '',
    [...selectedQuickNotes].sort().join('|'),
    customNote.trim(),
    visibility.parent ? '1' : '0',
    visibility.owner ? '1' : '0',
  ].join('::');
  const hasContent = selectedQuickNotes.length > 0 || customNote.trim().length > 0;
  const isSaved = Boolean(savedFormKey) && savedFormKey === currentFormKey;
  const canSave = Boolean(selectedChild) && hasContent;
  const isSaveDisabled = !canSave || isSaved;

  const handleSave = async () => {
    if (!selectedChild) {
      Alert.alert('Select a child first.');
      return;
    }

    if (!hasContent || isSaved) {
      return;
    }

    const savedEntry = await onSaveNote({
      childId: selectedChild.id,
      childName: selectedChild.name,
      quickNotes: selectedQuickNotes,
      customNote: customNote.trim(),
      visibility,
      signature: currentFormKey,
    });

    if (!savedEntry) {
      return;
    }

    Alert.alert('Daily note sent to owner for review.');
    setSelectedQuickNotes([]);
    setCustomNote('');
    setSavedFormKey(currentFormKey);
  };

  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.staffClockHero}>
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

            <Text style={styles.childProfileHeaderLabel}>Daily Notes</Text>
          </View>

          <View style={styles.staffHeroMain}>
            <View style={styles.staffHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Staff: Ms. Sarah</Text>
              <Text style={styles.staffHeroSubheading}>Parent note writer</Text>
            </View>

            <View style={styles.staffAvatarPlaceholder}>
              <Text style={styles.staffAvatarText}>MS</Text>
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Select Child</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Tap one child</Text>
            </View>

            {staffDailyNotesLoading ? (
              <Text style={styles.staffDailyNotesPreviewFooter}>Loading children...</Text>
            ) : staffDailyNotesError ? (
              <Text style={styles.errorText}>{staffDailyNotesError}</Text>
            ) : (
              <View style={styles.staffDailyNotesChildGrid}>
                {staffDailyNoteChildren.map((child) => {
                const isSelected = child.id === selectedChild?.id;
                const theme = getChildGroupTheme(child.accentGroup);

                return (
                  <Pressable
                    key={child.id}
                    accessibilityRole="button"
                    onPress={() => {
                      setSelectedChildId(child.id);
                      setSelectedQuickNotes([]);
                      setCustomNote('');
                      setSavedFormKey('');
                    }}
                    style={({ pressed }) => [
                      styles.staffDailyNotesChildCard,
                      { borderColor: theme.border },
                      isSelected && styles.staffDailyNotesChildCardSelected,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <View style={[styles.staffDailyNotesChildAccent, { backgroundColor: theme.accent }]} />
                    <Text style={styles.staffDailyNotesChildName}>{child.name}</Text>
                    <Text style={styles.staffDailyNotesChildMeta}>
                      {isSelected ? 'Selected' : 'Tap to select'}
                    </Text>
                    </Pressable>
                );
              })}
              </View>
            )}
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Quick Notes</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Tap multiple chips</Text>
            </View>

            <View style={styles.staffDailyNotesChipWrap}>
              {STAFF_DAILY_NOTE_CHIPS.map((note) => {
                const active = selectedQuickNotes.includes(note);

                return (
                  <Pressable
                    key={note}
                    accessibilityRole="button"
                    onPress={() => {
                      toggleQuickNote(note);
                      setSavedFormKey('');
                    }}
                    style={({ pressed }) => [
                      styles.staffDailyNotesChip,
                      active && styles.staffDailyNotesChipActive,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.staffDailyNotesChipText,
                        active && styles.staffDailyNotesChipTextActive,
                      ]}
                    >
                      {note}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Custom Note</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Optional</Text>
            </View>

            <TextInput
              multiline
              onChangeText={(text) => {
                setCustomNote(text);
                setSavedFormKey('');
              }}
              placeholder="Write a note for the parent..."
              placeholderTextColor={COLORS.muted}
              style={[styles.input, styles.staffDailyNotesInput]}
              textAlignVertical="top"
              value={customNote}
            />
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Owner Review</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Sent to owner for approval</Text>
            </View>

            <View style={styles.staffDailyNotesTagRow}>
              <View style={styles.staffDailyNotesTag}>
                <Text style={styles.staffDailyNotesTagText}>Pending</Text>
              </View>
              <View style={styles.staffDailyNotesTag}>
                <Text style={styles.staffDailyNotesTagText}>Owner Review</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Note Preview</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Mock sync preview</Text>
            </View>

            <View style={styles.staffDailyNotesPreviewList}>
              <View style={styles.staffDailyNotesPreviewBlock}>
                <Text style={styles.staffDailyNotesPreviewLabel}>Selected child</Text>
                <Text style={styles.staffDailyNotesPreviewValue}>{selectedChild?.name || '—'}</Text>
              </View>
              <View style={styles.staffDailyNotesPreviewBlock}>
                <Text style={styles.staffDailyNotesPreviewLabel}>Quick notes</Text>
                <Text style={styles.staffDailyNotesPreviewValue}>{previewQuickNotes}</Text>
              </View>
              <View style={styles.staffDailyNotesPreviewBlock}>
                <Text style={styles.staffDailyNotesPreviewLabel}>Custom note</Text>
                <Text style={styles.staffDailyNotesPreviewValue}>{previewCustomNote}</Text>
              </View>
              <View style={styles.staffDailyNotesPreviewBlock}>
                <Text style={styles.staffDailyNotesPreviewLabel}>Staff / time</Text>
                <Text style={styles.staffDailyNotesPreviewValue}>
                  {STAFF_MEMBER.name} · {STAFF_CLOCK_CURRENT_TIME}
                </Text>
              </View>
              <View style={styles.staffDailyNotesPreviewBlock}>
                <Text style={styles.staffDailyNotesPreviewLabel}>Review targets</Text>
                <View style={styles.staffDailyNotesTagRow}>
                  {previewVisibility.length ? (
                    previewVisibility.map((target) => (
                      <View key={target} style={styles.staffDailyNotesTag}>
                        <Text style={styles.staffDailyNotesTagText}>{target}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.staffDailyNotesPreviewValue}>Owner Review</Text>
                  )}
                </View>
              </View>
            </View>

            <Text style={styles.staffDailyNotesPreviewFooter}>
              This note is sent to the owner for review before parents can see it.
            </Text>

            <View style={styles.staffDailyNotesSavedHeader}>
              <Text style={styles.staffDailyNotesSavedTitle}>Recent Saved Notes</Text>
              <Text style={styles.staffDailyNotesPreviewFooter}>Local only</Text>
            </View>

            <View style={styles.staffDailyNotesSavedList}>
              {savedNotes.length ? (
                savedNotes.slice(0, 3).map((note) => (
                  <View key={note.id} style={styles.staffDailyNotesSavedItem}>
                    <View style={styles.staffDailyNotesSavedTopRow}>
                      <Text style={styles.staffDailyNotesSavedChild}>{note.childName}</Text>
                      <Text style={styles.staffDailyNotesSavedTime}>{note.time}</Text>
                    </View>
                    <Text style={styles.staffDailyNotesSavedSummary}>{note.summary}</Text>
                    <View style={styles.staffDailyNotesTagRow}>
                      <View style={styles.staffDailyNotesTag}>
                        <Text style={styles.staffDailyNotesTagText}>Owner Review</Text>
                      </View>
                      <View style={styles.staffDailyNotesTag}>
                        <Text style={styles.staffDailyNotesTagText}>Pending</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.staffDailyNotesPreviewFooter}>No notes saved yet.</Text>
              )}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleSave}
            disabled={isSaveDisabled}
            style={({ pressed }) => [
              styles.primaryButton,
              isSaved && styles.staffDailyNotesSaveButtonSaved,
              isSaveDisabled && !isSaved && styles.staffDailyNotesSaveButtonDisabled,
              pressed && !isSaveDisabled && styles.pressedButton,
            ]}
          >
            <Text
              style={[
                styles.primaryButtonText,
                isSaved && styles.staffDailyNotesSaveButtonTextSaved,
                isSaveDisabled && !isSaved && styles.staffDailyNotesSaveButtonTextDisabled,
              ]}
            >
              {isSaved ? '✓ Note Saved' : 'Save Daily Note'}
            </Text>
          </Pressable>

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

function StaffMyHoursScreen({ onBack, onLogout }) {
  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.staffClockHero}>
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

            <Text style={styles.childProfileHeaderLabel}>My Hours</Text>
          </View>

          <View style={styles.staffHeroMain}>
            <View style={styles.staffHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Staff: Ms. Sarah</Text>
              <Text style={styles.staffHeroSubheading}>Hours overview</Text>
            </View>

            <View style={styles.staffAvatarPlaceholder}>
              <Text style={styles.staffAvatarText}>MS</Text>
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>This Week</Text>
              <View style={styles.staffHoursPendingPill}>
                <Text style={styles.staffHoursPendingPillText}>Pending Owner Review</Text>
              </View>
            </View>

            <View style={styles.staffHoursWeekList}>
              {STAFF_HOURS_THIS_WEEK.map((item) => (
                <View key={item.day} style={styles.staffHoursWeekRow}>
                  <Text style={styles.staffHoursWeekDay}>{item.day}</Text>
                  <Text style={styles.staffHoursWeekValue}>{item.hours}</Text>
                </View>
              ))}
            </View>

            <View style={styles.staffHoursTotalBlock}>
              <Text style={styles.staffHoursTotalLabel}>Weekly Total</Text>
              <Text style={styles.staffHoursTotalValue}>32.0 Hours</Text>
            </View>
          </View>

          {STAFF_HOURS_APPROVED_WEEKS.map((week) => (
            <View key={week.title} style={styles.profileCard}>
              <View style={styles.parentSectionHeaderRow}>
                <Text style={styles.parentSectionHeaderTitle}>{week.title}</Text>
                <View style={styles.staffHoursApprovedPill}>
                  <Text style={styles.staffHoursApprovedPillText}>{week.status}</Text>
                </View>
              </View>

              <View style={styles.staffHoursApprovedList}>
                <View style={styles.staffHoursApprovedRow}>
                  <Text style={styles.staffHoursApprovedLabel}>Total Hours</Text>
                  <Text style={styles.staffHoursApprovedValue}>{week.total}</Text>
                </View>
                <View style={styles.staffHoursApprovedRow}>
                  <Text style={styles.staffHoursApprovedLabel}>Approval Date</Text>
                  <Text style={styles.staffHoursApprovedValue}>{week.date}</Text>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Clock Activity</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Recent entries</Text>
            </View>

            <View style={styles.staffHoursActivityList}>
              {STAFF_HOURS_CLOCK_ACTIVITY.map((entry) => (
                <View key={`${entry.label}-${entry.time}`} style={styles.staffHoursActivityRow}>
                  <View style={styles.staffHoursActivityDot} />
                  <Text style={styles.staffHoursActivityLabel}>{entry.label}</Text>
                  <Text style={styles.staffHoursActivityTime}>{entry.time}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.profileCard}>
            <Text style={styles.staffHoursInfoText}>
              Hours are reviewed and approved by Advanced Education management before payroll processing.
            </Text>
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

function OwnerDashboardScreen({
  onLogout,
  onShowComingSoon,
  onOpenStudents,
  onOpenStaff,
  onOpenParents,
  onOpenMessages,
  onOpenNotifications,
  onOpenBilling,
  onOpenCampEvents,
  onOpenInviteCodes,
  onOpenReports,
  onOpenSummerCampCheckIn,
  onOpenDailyNotesReview,
  onOpenIncidentReportsReview,
  ownerSummerCampSummary,
  staffSummerCampGroups,
  ownerPendingDailyNotesCount,
  ownerDailyNotesPendingLoading,
  ownerBeforeAfterCounts,
  ownerBeforeAfterCountsLoading,
  ownerBeforeAfterCountsError,
  ownerIncidentReportsPending,
  ownerIncidentReportsPendingLoading,
  ownerIncidentReportsPendingError,
}) {
  const [openSection, setOpenSection] = useState(null);

  const centerStatusCards = [
    {
      accent: 'blue',
      badge: 'S',
      title: 'Students Present',
      value: '42',
      note: 'On campus now',
      fill: 'Live',
    },
    {
      accent: 'green',
      badge: 'C',
      title: 'Checked Out',
      value: '15',
      note: 'Left for the day',
      fill: 'Today',
    },
    {
      accent: 'orange',
      badge: 'P',
      title: 'Pending Pickups',
      value: '3',
      note: 'Awaiting release',
      fill: 'Watch',
    },
    {
      accent: 'purple',
      badge: 'T',
      title: 'Staff Clocked In',
      value: '7',
      note: 'On shift now',
      fill: 'Shift',
    },
  ];

  const beforeAfterCards = [
    {
      accent: 'blue',
      badge: 'D',
      title: 'Dropped Off',
      value: ownerBeforeAfterCountsLoading ? 'Loading...' : String(ownerBeforeAfterCounts.droppedOff),
      note: 'Morning check-in',
      fill: 'Before & After Care',
    },
    {
      accent: 'green',
      badge: 'B',
      title: 'On Bus',
      value: ownerBeforeAfterCountsLoading ? 'Loading...' : String(ownerBeforeAfterCounts.onBus),
      note: 'In transit',
      fill: 'Morning',
    },
    {
      accent: 'orange',
      badge: 'R',
      title: 'Returned',
      value: ownerBeforeAfterCountsLoading ? 'Loading...' : String(ownerBeforeAfterCounts.returned),
      note: 'Back on site',
      fill: 'Afternoon',
    },
    {
      accent: 'purple',
      badge: 'P',
      title: 'Picked Up',
      value: ownerBeforeAfterCountsLoading ? 'Loading...' : String(ownerBeforeAfterCounts.pickedUp),
      note: 'Released to parent',
      fill: 'Closed',
    },
  ];

  const campConfirmedCounts = OWNER_SUMMER_CAMP_GROUP_NAMES.reduce((acc, groupName) => {
    acc[groupName] = (staffSummerCampGroups[groupName] || []).filter(
      (child) =>
        child.checkInStatus === 'Checked In' &&
        child.groupConfirmationStatus === 'Confirmed Present'
    ).length;
    return acc;
  }, {});

  const campAccentByGroup = {
    'Yellow Group': 'yellow',
    'Orange Group': 'orange',
    'Green Group': 'green',
    'Blue Group': 'blue',
    'Red Group': 'red',
    'Pink Group': 'pink',
    'Purple Group': 'purple',
  };

  const campCards = OWNER_SUMMER_CAMP_GROUP_NAMES.map((groupName) => {
    const ownerCount = Number(ownerSummerCampSummary[groupName] || 0);
    const counselorCount = Number(campConfirmedCounts[groupName] || 0);
    const status =
      ownerCount === 0 || counselorCount === 0
        ? 'Pending'
        : counselorCount === ownerCount
          ? 'Complete'
          : 'Discrepancy';

    return {
      accent: campAccentByGroup[groupName] || 'blue',
      badge: groupName[0],
      title: groupName,
      value: `Owner: ${ownerCount}`,
      note: `Counselor: ${counselorCount}`,
      fill: `Status: ${status}`,
      status,
    };
  });

  const staffNotesCards = [
    {
      accent: 'green',
      badge: 'N',
      title: 'Daily Notes Submitted',
      value: '15',
      note: 'Ready for parent sync',
      fill: 'Today',
    },
    {
      accent: 'orange',
      badge: 'R',
      title: 'Pending Owner Review',
      value: '4',
      note: 'Needs approval',
      fill: 'Queue',
    },
    {
      accent: 'purple',
      badge: 'H',
      title: 'Staff Hours Pending Review',
      value: '3',
      note: 'Check timecards',
      fill: 'Hours',
    },
    {
      accent: 'blue',
      badge: 'M',
      title: 'Unread Parent Messages',
      value: '4',
      note: 'New replies waiting',
      fill: 'Inbox',
    },
  ];

  const activityFeed = [
    {
      time: '9:15 AM',
      text: 'Blue Group headcount submitted by Ms. Sarah',
      color: COLORS.blue,
    },
    {
      time: '8:12 AM',
      text: 'Mia Carter checked in for Before & After Care',
      color: COLORS.success,
    },
    {
      time: '7:30 AM',
      text: 'Ms. Sarah clocked in',
      color: COLORS.warning,
    },
    {
      time: '2:45 PM',
      text: 'Daily note added for Emma Davis',
      color: '#7C4DFF',
    },
    {
      time: '4:35 PM',
      text: 'Pickup window opened for Mia Carter',
      color: COLORS.danger,
    },
  ];

  const dailyNotesReviewSummary = ownerDailyNotesPendingLoading
    ? 'Loading pending notes...'
    : ownerPendingDailyNotesCount > 0
      ? `${ownerPendingDailyNotesCount} pending note${ownerPendingDailyNotesCount === 1 ? '' : 's'}`
      : 'No pending notes';

  const ownerSections = [
    {
      key: 'center-status',
      title: 'Today’s Center Status',
      summary: 'Students present, pickups, and staff on shift',
      details: (
        <View style={styles.ownerSectionDetailsGrid}>
          {centerStatusCards.map((card) => (
            <SummaryTile
              key={card.title}
              accent={card.accent}
              badge={card.badge}
              title={card.title}
              value={card.value}
              note={card.note}
              fill={card.fill}
            />
          ))}
        </View>
      ),
    },
    {
      key: 'before-after',
      title: 'Before & After Care',
      summary: ownerBeforeAfterCountsLoading
        ? 'Loading live counts...'
        : ownerBeforeAfterCountsError
          ? 'Could not load live counts'
          : 'Daily attendance flow for school-year care',
      details: (
        <>
          {ownerBeforeAfterCountsError ? (
            <Text style={styles.errorText}>{ownerBeforeAfterCountsError}</Text>
          ) : null}
          <View style={styles.ownerSectionDetailsGrid}>
            {beforeAfterCards.map((card) => (
              <SummaryTile
                key={card.title}
                accent={card.accent}
                badge={card.badge}
                title={card.title}
                value={card.value}
                note={card.note}
                fill={card.fill}
              />
            ))}
          </View>
        </>
      ),
    },
    {
      key: 'camp-headcounts',
      title: 'Summer Camp Headcounts',
      summary: 'Group confirmations by camp color',
      details: (
        <>
          <View style={styles.staffCampSummaryRow}>
            {[
              { label: 'Pending', value: campCards.filter((card) => card.status === 'Pending').length },
              { label: 'Complete', value: campCards.filter((card) => card.status === 'Complete').length },
              {
                label: 'Discrepancies',
                value: campCards.filter((card) => card.status === 'Discrepancy').length,
              },
            ].map((item) => (
              <View
                key={item.label}
                style={[styles.staffCampSummaryPill, { backgroundColor: OWNER_MODULE_COLORS['Camp Events'] }]}
              >
                <Text style={styles.staffCampSummaryLabel}>{item.label}</Text>
                <Text style={styles.staffCampSummaryValue}>{item.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.ownerSectionDetailsGrid}>
          {campCards.map((card) => (
            <SummaryTile
              key={card.title}
              accent={card.accent}
              badge={card.badge}
              title={card.title}
              value={card.value}
              note={card.note}
              fill={card.fill}
            />
          ))}
          </View>
        </>
      ),
    },
    {
      key: 'owner-camp-check-in',
      title: 'Summer Camp Check-In',
      summary: 'Owner check-in only',
      details: (
        <View style={styles.ownerSummerCampActionBlock}>
          <Text style={styles.ownerSummerCampActionText}>
            Counselors confirm headcount after the owner checks campers in.
          </Text>
          <OwnerNavCard
            accentColor={OWNER_MODULE_COLORS['Camp Events']}
            title="Open Summer Camp Check-In"
            subtitle="Owner check-in only"
            onPress={onOpenSummerCampCheckIn}
          />
        </View>
      ),
    },
    {
      key: 'staff-notes',
      title: 'Staff & Notes',
      summary: 'Daily notes, hours, and parent inbox activity',
      details: (
        <View style={styles.ownerSectionDetailsGrid}>
          {staffNotesCards.map((card) => (
            <SummaryTile
              key={card.title}
              accent={card.accent}
              badge={card.badge}
              title={card.title}
              value={card.value}
              note={card.note}
              fill={card.fill}
            />
          ))}
        </View>
      ),
    },
    {
      key: 'daily-notes-review',
      title: 'Daily Notes Review',
      summary: dailyNotesReviewSummary,
      details: (
        <View style={styles.ownerSummerCampActionBlock}>
          <Text style={styles.ownerSummerCampActionText}>
            Approve staff notes before parents see them.
          </Text>
          <OwnerNavCard
            accentColor={COLORS.warning}
            title="Open Daily Notes Review"
            subtitle="Review pending staff notes"
            onPress={onOpenDailyNotesReview}
          />
        </View>
      ),
    },
    {
      key: 'incident-reports-review',
      title: 'Incident Reports Review',
      summary: ownerIncidentReportsPendingLoading
        ? 'Loading pending reports...'
        : ownerIncidentReportsPendingError
          ? 'Could not load pending reports'
          : `${ownerIncidentReportsPending.length} pending reports`,
      details: (
        <View style={styles.ownerSummerCampActionBlock}>
          <Text style={styles.ownerSummerCampActionText}>
            Review staff incident reports before parents see them.
          </Text>
          <OwnerNavCard
            accentColor={COLORS.warning}
            title="Open Incident Reports Review"
            subtitle="Approve or reject pending reports"
            onPress={onOpenIncidentReportsReview}
          />
        </View>
      ),
    },
    {
      key: 'activity-feed',
      title: 'Recent Activity Feed',
      summary: 'Latest center events by time',
      details: (
        <View style={styles.ownerSectionList}>
          {activityFeed.map((item) => (
            <View key={`${item.time}-${item.text}`} style={styles.ownerActivityRow}>
              <Text style={styles.ownerActivityTime}>{item.time}</Text>
              <View style={[styles.ownerActivityDot, { backgroundColor: item.color }]} />
              <Text style={styles.ownerActivityText}>{item.text}</Text>
            </View>
          ))}
        </View>
      ),
    },
    {
      key: 'quick-actions',
      title: 'Owner Quick Actions',
      summary: '8 mission-control shortcuts',
      details: (
        <View style={styles.ownerQuickActionsList}>
          {(() => {
            const quickActionDescriptions = {
              Students: 'Manage enrolled children',
              Staff: 'Manage employees and hours',
              Parents: 'Manage parent accounts',
              Billing: 'Review balances and invoices',
              Messages: 'Center-wide communication',
              Notifications: 'Center attention hub',
              'Camp Events': 'Manage camp schedules',
              'Invite Codes': 'Create parent and staff access',
              Reports: 'Attendance and program reports',
            };
            return OWNER_MODULES.map((moduleName) => {
              const action =
                moduleName === 'Students'
                  ? onOpenStudents
                  : moduleName === 'Staff'
                    ? onOpenStaff
                    : moduleName === 'Parents'
                      ? onOpenParents
                    : moduleName === 'Messages'
                        ? onOpenMessages
                      : moduleName === 'Notifications'
                        ? onOpenNotifications
                      : moduleName === 'Billing'
                        ? onOpenBilling
                      : moduleName === 'Camp Events'
                        ? onOpenCampEvents
                      : moduleName === 'Invite Codes'
                        ? onOpenInviteCodes
                      : moduleName === 'Reports'
                        ? onOpenReports
                    : onShowComingSoon;

              return (
                <OwnerNavCard
                  key={moduleName}
                  accentColor={OWNER_MODULE_COLORS[moduleName]}
                  title={moduleName}
                  subtitle={quickActionDescriptions[moduleName]}
                  onPress={() =>
                    moduleName === 'Students'
                      ? onOpenStudents()
                      : moduleName === 'Staff'
                        ? onOpenStaff()
                      : moduleName === 'Parents'
                        ? onOpenParents()
                      : moduleName === 'Messages'
                        ? onOpenMessages()
                      : moduleName === 'Notifications'
                        ? onOpenNotifications()
                      : moduleName === 'Billing'
                        ? onOpenBilling()
                      : moduleName === 'Camp Events'
                        ? onOpenCampEvents()
                      : moduleName === 'Invite Codes'
                        ? onOpenInviteCodes()
                      : moduleName === 'Reports'
                        ? onOpenReports()
                      : action(moduleName)
                  }
                />
              );
            });
          })()}
        </View>
      ),
    },
  ];

  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <View style={styles.heroOrbLarge} />
        <View style={styles.heroOrbSmall} />
        <View style={styles.ownerDashboardHeroCopy}>
          <Text style={styles.ownerDashboardEyebrow}>Advanced Education</Text>
          <Text style={styles.shellHeroTitle}>Owner Dashboard</Text>
          <Text style={styles.shellHeroSubtitle}>Welcome back</Text>
          <View style={[styles.shellHeroPill, { marginTop: 10 }]}>
            <Text style={styles.shellHeroPillText}>Live Center View</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentStack}>
          {ownerSections.map((section) => {
            const isOpen = openSection === section.key;

            return (
              <View key={section.key} style={styles.ownerAccordionCard}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    setOpenSection((current) => (current === section.key ? null : section.key))
                  }
                  style={({ pressed }) => [styles.ownerAccordionHeader, pressed && styles.pressedButton]}
                >
                  <View style={styles.ownerAccordionHeadingBlock}>
                    <Text style={styles.ownerAccordionTitle}>{section.title}</Text>
                    <Text style={styles.ownerAccordionSummary}>{section.summary}</Text>
                  </View>
                  <Text style={styles.ownerAccordionChevron}>{isOpen ? '⌃' : '⌄'}</Text>
                </Pressable>

                {isOpen ? <View style={styles.ownerAccordionContent}>{section.details}</View> : null}
              </View>
            );
          })}

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

function OwnerDailyNotesReviewScreen({
  onBack,
  pendingNotes,
  loading,
  error,
  onApprove,
  onReject,
  actionNoteId,
}) {
  const pendingCount = pendingNotes.length;

  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ownerDailyNotesReviewStickyHeader}>
          <View style={styles.ownerDailyNotesReviewHeaderTopRow}>
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

            <View style={[styles.ownerAccessPill, { backgroundColor: COLORS.warning }]}>
              <Text style={styles.ownerAccessPillText}>Owner Access</Text>
            </View>
          </View>

          <View style={styles.ownerDailyNotesReviewHeroMain}>
            <View style={styles.ownerDailyNotesReviewHeroCopy}>
              <Text style={styles.ownerDashboardEyebrow}>Advanced Education</Text>
              <Text style={styles.shellHeroTitle}>Daily Notes Review</Text>
              <Text style={styles.ownerDailyNotesReviewSubtitle}>
                Approve staff notes before parents see them
              </Text>
            </View>

            <View style={[styles.ownerDailyNotesReviewCountBadge, { backgroundColor: COLORS.warning }]}>
              <Text style={styles.ownerDailyNotesReviewCountValue}>{pendingCount}</Text>
              <Text style={styles.ownerDailyNotesReviewCountLabel}>Pending</Text>
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Pending Notes</Text>
              <Text style={styles.parentSectionHeaderSubtle}>
                {loading ? 'Loading...' : `${pendingCount} waiting`}
              </Text>
            </View>
            <Text style={styles.notificationsIntroText}>
              Review each note and approve or reject it for parent visibility.
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {loading ? <Text style={styles.ownerStudentsStateText}>Loading daily notes...</Text> : null}

          {!loading && pendingCount === 0 ? (
            <Text style={styles.ownerStudentsStateText}>No pending notes.</Text>
          ) : null}

          {!loading && pendingCount > 0 ? (
            <View style={styles.ownerDailyNotesReviewList}>
              {pendingNotes.map((note) => {
                const quickNotes = Array.isArray(note.quick_notes) ? note.quick_notes : [];
                const isSaving = actionNoteId === note.id;

                return (
                  <View key={note.id} style={styles.profileCard}>
                    <View style={styles.parentSectionHeaderRow}>
                      <View style={styles.ownerDailyNotesReviewCardHeading}>
                        <Text style={styles.parentSectionHeaderTitle}>{note.childName}</Text>
                        <Text style={styles.parentSectionHeaderSubtle}>
                          {formatDailyNoteDateLabel(note.date || note.created_at)}
                        </Text>
                      </View>

                      <View style={[styles.ownerAccessPill, { backgroundColor: COLORS.warning }]}>
                        <Text style={styles.ownerAccessPillText}>Pending Review</Text>
                      </View>
                    </View>

                    {quickNotes.length ? (
                      <View style={styles.ownerFilterPillRow}>
                        {quickNotes.map((item) => (
                          <View key={`${note.id}-${item}`} style={styles.ownerFilterPill}>
                            <Text style={styles.ownerFilterPillText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {note.custom_note ? (
                      <Text style={styles.ownerDailyNotesReviewCustomNote}>{note.custom_note}</Text>
                    ) : null}

                    <View style={styles.ownerDailyNotesReviewActionRow}>
                      <Pressable
                        accessibilityRole="button"
                        disabled={isSaving}
                        onPress={() => onApprove(note)}
                        style={({ pressed }) => [
                          styles.ownerDailyNotesReviewApproveButton,
                          pressed && !isSaving && styles.buttonPressed,
                          isSaving && styles.ownerDailyNotesReviewButtonDisabled,
                        ]}
                      >
                        <Text style={styles.ownerDailyNotesReviewApproveButtonText}>
                          {isSaving ? 'Saving...' : 'Approve'}
                        </Text>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        disabled={isSaving}
                        onPress={() => onReject(note)}
                        style={({ pressed }) => [
                          styles.ownerDailyNotesReviewRejectButton,
                          pressed && !isSaving && styles.buttonPressed,
                          isSaving && styles.ownerDailyNotesReviewButtonDisabled,
                        ]}
                      >
                        <Text style={styles.ownerDailyNotesReviewRejectButtonText}>
                          {isSaving ? 'Saving...' : 'Reject'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function StaffIncidentReportsScreen({
  onBack,
  onLogout,
  activeChildren,
  selectedChildId,
  loading,
  error,
  location,
  description,
  actionTaken,
  staffWitness,
  saving,
  recentReports,
  recentReportsLoading,
  recentReportsError,
  onSelectChild,
  onChangeLocation,
  onChangeDescription,
  onChangeActionTaken,
  onChangeWitness,
  onSubmit,
}) {
  const selectedChild = activeChildren.find((child) => child.id === selectedChildId) || null;

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

            <Text style={styles.childProfileHeaderLabel}>Incident Reports</Text>
          </View>

          <View style={styles.notificationsHeroMain}>
            <View style={styles.notificationsHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Incident Reports</Text>
              <View style={styles.notificationsHeroTag}>
                <Text style={styles.notificationsHeroTagText}>Staff Access</Text>
              </View>
              <Text style={styles.notificationsHeroSubtitle}>
                Create child incident reports
              </Text>
            </View>

            <View style={styles.parentHeroPhotoWrap}>
              <Image source={HEADER_PHOTO} resizeMode="cover" style={styles.parentHeroPhoto} />
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Select Child</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Active students</Text>
            </View>

            {loading ? (
              <Text style={styles.parentAttendanceStateText}>Loading active children...</Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : activeChildren.length ? (
              <View style={styles.ownerFilterPillRow}>
                {activeChildren.map((child) => {
                  const isActive = selectedChildId === child.id;
                  return (
                    <Pressable
                      key={child.id}
                      accessibilityRole="button"
                      onPress={() => onSelectChild(child.id)}
                      style={({ pressed }) => [
                        styles.ownerFilterPill,
                        isActive && styles.ownerFilterPillActive,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.ownerFilterPillText,
                          isActive && styles.ownerFilterPillTextActive,
                        ]}
                      >
                        {`${child.first_name || ''} ${child.last_name || ''}`.trim() ||
                          'Unnamed Student'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.parentAttendanceStateText}>No active children found.</Text>
            )}
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>New Incident Report</Text>
              <Text style={styles.parentSectionHeaderSubtle}>
                {selectedChild
                  ? `${selectedChild.first_name || ''} ${selectedChild.last_name || ''}`.trim()
                  : 'No child selected'}
              </Text>
            </View>

            <Text style={styles.ownerStudentFormLabel}>Location</Text>
            <TextInput
              placeholder="Location"
              placeholderTextColor={COLORS.muted}
              value={location}
              onChangeText={onChangeLocation}
              style={styles.ownerSearchInput}
            />

            <Text style={styles.ownerStudentFormLabel}>Description</Text>
            <TextInput
              placeholder="Description"
              placeholderTextColor={COLORS.muted}
              value={description}
              onChangeText={onChangeDescription}
              multiline
              style={[styles.ownerSearchInput, styles.ownerTextArea]}
            />

            <Text style={styles.ownerStudentFormLabel}>Action Taken</Text>
            <TextInput
              placeholder="Action Taken"
              placeholderTextColor={COLORS.muted}
              value={actionTaken}
              onChangeText={onChangeActionTaken}
              multiline
              style={[styles.ownerSearchInput, styles.ownerTextArea]}
            />

            <Text style={styles.ownerStudentFormLabel}>Staff Witness</Text>
            <TextInput
              placeholder="Staff Witness"
              placeholderTextColor={COLORS.muted}
              value={staffWitness}
              onChangeText={onChangeWitness}
              style={styles.ownerSearchInput}
            />

            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={onSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressedButton,
                saving && { opacity: 0.75 },
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? 'Submitting...' : 'Submit Incident Report'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={() => {
                onChangeLocation('');
                onChangeDescription('');
                onChangeActionTaken('');
                onChangeWitness('');
              }}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressedButton,
                { marginTop: 12 },
              ]}
            >
              <Text style={styles.secondaryButtonText}>Clear</Text>
            </Pressable>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Recent Incident Reports</Text>
              <Text style={styles.parentSectionHeaderSubtle}>
                {recentReports.length} submitted
              </Text>
            </View>

            {recentReportsLoading ? (
              <Text style={styles.parentAttendanceStateText}>Loading incident reports...</Text>
            ) : recentReportsError ? (
              <Text style={styles.errorText}>{recentReportsError}</Text>
            ) : recentReports.length ? (
              <View style={styles.ownerSectionList}>
                {recentReports.map((report) => (
                  <View key={report.id} style={styles.profileListRow}>
                    <View style={styles.profileListDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.profileListLabel}>{report.childName}</Text>
                      <Text style={styles.profileListValue}>
                        {formatDateTime(report.created_at)}
                      </Text>
                      <Text style={styles.profileListValue}>{report.location}</Text>
                      <Text style={styles.profileListValue}>{report.review_status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.parentAttendanceStateText}>No incident reports yet.</Text>
            )}
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

function OwnerIncidentReportsReviewScreen({
  onBack,
  loading,
  error,
  pendingReports,
  onApprove,
  onReject,
  actionReportId,
}) {
  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ownerDailyNotesReviewStickyHeader}>
          <View style={styles.ownerDailyNotesReviewHeaderTopRow}>
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

            <View style={[styles.ownerAccessPill, { backgroundColor: COLORS.warning }]}>
              <Text style={styles.ownerAccessPillText}>Owner Access</Text>
            </View>
          </View>

          <View style={styles.ownerDailyNotesReviewHeroMain}>
            <View style={styles.ownerDailyNotesReviewHeroCopy}>
              <Text style={styles.ownerDashboardEyebrow}>Advanced Education</Text>
              <Text style={styles.shellHeroTitle}>Incident Reports Review</Text>
              <Text style={styles.ownerDailyNotesReviewSubtitle}>
                Approve staff reports before parents see them
              </Text>
            </View>

            <View style={[styles.ownerDailyNotesReviewCountBadge, { backgroundColor: COLORS.warning }]}>
              <Text style={styles.ownerDailyNotesReviewCountValue}>{pendingReports.length}</Text>
              <Text style={styles.ownerDailyNotesReviewCountLabel}>Pending</Text>
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Pending Reports</Text>
              <Text style={styles.parentSectionHeaderSubtle}>
                {loading ? 'Loading...' : `${pendingReports.length} waiting`}
              </Text>
            </View>
            <Text style={styles.notificationsIntroText}>
              Review each report and approve or reject it for parent visibility.
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {loading ? <Text style={styles.ownerStudentsStateText}>Loading incident reports...</Text> : null}

          {!loading && pendingReports.length === 0 ? (
            <Text style={styles.ownerStudentsStateText}>No pending reports.</Text>
          ) : null}

          {!loading && pendingReports.length > 0 ? (
            <View style={styles.ownerDailyNotesReviewList}>
              {pendingReports.map((report) => {
                const isSaving = actionReportId === report.id;

                return (
                  <View key={report.id} style={styles.profileCard}>
                    <View style={styles.parentSectionHeaderRow}>
                      <View style={styles.ownerDailyNotesReviewCardHeading}>
                        <Text style={styles.parentSectionHeaderTitle}>{report.childName}</Text>
                        <Text style={styles.parentSectionHeaderSubtle}>
                          {formatDateTime(report.created_at)}
                        </Text>
                      </View>

                      <View style={[styles.ownerAccessPill, { backgroundColor: COLORS.warning }]}>
                        <Text style={styles.ownerAccessPillText}>Pending Review</Text>
                      </View>
                    </View>

                    <Text style={styles.ownerDailyNotesReviewCustomNote}>
                      Location: {report.location}
                    </Text>
                    <Text style={styles.ownerDailyNotesReviewCustomNote}>
                      Description: {report.description}
                    </Text>
                    <Text style={styles.ownerDailyNotesReviewCustomNote}>
                      Action Taken: {report.action_taken}
                    </Text>
                    <Text style={styles.ownerDailyNotesReviewCustomNote}>
                      Staff Witness: {report.staff_witness}
                    </Text>

                    <View style={styles.ownerDailyNotesReviewActionRow}>
                      <Pressable
                        accessibilityRole="button"
                        disabled={isSaving}
                        onPress={() => onApprove(report)}
                        style={({ pressed }) => [
                          styles.ownerDailyNotesReviewApproveButton,
                          pressed && !isSaving && styles.buttonPressed,
                          isSaving && styles.ownerDailyNotesReviewButtonDisabled,
                        ]}
                      >
                        <Text style={styles.ownerDailyNotesReviewApproveButtonText}>
                          {isSaving ? 'Saving...' : 'Approve'}
                        </Text>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        disabled={isSaving}
                        onPress={() => onReject(report)}
                        style={({ pressed }) => [
                          styles.ownerDailyNotesReviewRejectButton,
                          pressed && !isSaving && styles.buttonPressed,
                          isSaving && styles.ownerDailyNotesReviewButtonDisabled,
                        ]}
                      >
                        <Text style={styles.ownerDailyNotesReviewRejectButtonText}>
                          {isSaving ? 'Saving...' : 'Reject'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function ParentIncidentReportsScreen({
  onBack,
  onLogout,
  reports,
  loading,
  error,
  acknowledgingId,
  onAcknowledge,
}) {
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

            <Text style={styles.childProfileHeaderLabel}>Incident Reports</Text>
          </View>

          <View style={styles.notificationsHeroMain}>
            <View style={styles.notificationsHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Incident Reports</Text>
              <View style={styles.notificationsHeroTag}>
                <Text style={styles.notificationsHeroTagText}>Family Access</Text>
              </View>
              <Text style={styles.notificationsHeroSubtitle}>
                View approved child incident reports
              </Text>
            </View>

            <View style={styles.parentHeroPhotoWrap}>
              <Image source={HEADER_PHOTO} resizeMode="cover" style={styles.parentHeroPhoto} />
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Approved Reports</Text>
              <Text style={styles.parentSectionHeaderSubtle}>{reports.length} available</Text>
            </View>
            <Text style={styles.notificationsIntroText}>
              Only approved reports are shown here.
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {loading ? <Text style={styles.parentAttendanceStateText}>Loading incident reports...</Text> : null}

          {!loading && !reports.length ? (
            <Text style={styles.parentAttendanceStateText}>No incident reports yet.</Text>
          ) : null}

          {!loading && reports.length ? (
            <View style={styles.ownerDailyNotesReviewList}>
              {reports.map((report) => {
                const acknowledged = !!report.parent_acknowledged_at;
                const isSaving = acknowledgingId === report.id;

                return (
                  <View key={report.id} style={styles.profileCard}>
                    <View style={styles.parentSectionHeaderRow}>
                      <View style={styles.ownerDailyNotesReviewCardHeading}>
                        <Text style={styles.parentSectionHeaderTitle}>{report.childName}</Text>
                        <Text style={styles.parentSectionHeaderSubtle}>
                          {formatDateTime(report.created_at)}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.ownerAccessPill,
                          { backgroundColor: acknowledged ? COLORS.success : COLORS.warning },
                        ]}
                      >
                        <Text style={styles.ownerAccessPillText}>
                          {acknowledged ? 'Acknowledged' : 'Approved'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.ownerDailyNotesReviewCustomNote}>
                      Location: {report.location}
                    </Text>
                    <Text style={styles.ownerDailyNotesReviewCustomNote}>
                      Description: {report.description}
                    </Text>
                    <Text style={styles.ownerDailyNotesReviewCustomNote}>
                      Action Taken: {report.action_taken}
                    </Text>

                    {!acknowledged ? (
                      <Pressable
                        accessibilityRole="button"
                        disabled={isSaving}
                        onPress={() => onAcknowledge(report)}
                        style={({ pressed }) => [
                          styles.primaryButton,
                          pressed && !isSaving && styles.pressedButton,
                          isSaving && { opacity: 0.75 },
                          { marginTop: 12 },
                        ]}
                      >
                        <Text style={styles.primaryButtonText}>
                          {isSaving ? 'Saving...' : 'Acknowledge Report'}
                        </Text>
                      </Pressable>
                    ) : (
                      <Text style={styles.parentAttendanceStateText}>Report acknowledged.</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ) : null}

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

function UnifiedChildProfileScreen({
  onBack,
  onLogout,
  accessibleChildren,
  selectedChildId,
  selectedChild,
  loading,
  error,
  onSelectChild,
  pickups,
  pickupsLoading,
  pickupsError,
  emergencyRows,
  emergencyLoading,
  emergencyError,
  attendanceRows,
  beforeAfterRows,
  dailyNotesRows,
  incidentRows,
  summerCampCheckIns,
  summerCampHeadcounts,
  campGroups,
}) {
  const [openChildProfileSection, setOpenChildProfileSection] = useState('student-information');

  const selectedCampGroupId =
    summerCampCheckIns[0]?.camp_group_id ||
    summerCampHeadcounts[0]?.camp_group_id ||
    selectedChild?.camp_group_id ||
    null;
  const selectedCampGroup = campGroups.find((group) => group.id === selectedCampGroupId) || null;
  const groupDisplayName = getCampGroupDisplayName(
    selectedCampGroup?.name ||
      selectedCampGroup?.group_name ||
      selectedCampGroup?.label ||
      selectedCampGroup?.color ||
      selectedChild?.profile_accent_color ||
      selectedChild?.group ||
      'Blue Group'
  );
  const childTheme = getChildGroupTheme(groupDisplayName);
  const enrollmentInfo = Array.isArray(selectedChild?.program_enrollment)
    ? selectedChild.program_enrollment
    : Array.isArray(selectedChild?.programEnrollment)
      ? selectedChild.programEnrollment
      : [];
  const enrollmentText = Array.isArray(enrollmentInfo) && enrollmentInfo.length
    ? enrollmentInfo
        .map((item) =>
          typeof item === 'string'
            ? item
            : `${item.label || item.name || 'Enrollment'}: ${item.value || item.status || 'Yes'}`
        )
        .join(' • ')
    : selectedChild?.enrollment_info || selectedChild?.enrollmentInfo || 'Not available';

  const toggleSection = (key) => {
    setOpenChildProfileSection((current) => (current === key ? null : key));
  };

  const renderAccordion = (key, title, summary, body) => (
    <View
      key={key}
      style={[
        styles.parentAccordionCard,
        openChildProfileSection === key && styles.parentAccordionCardOpen,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => toggleSection(key)}
        style={({ pressed }) => [styles.parentAccordionHeader, pressed && styles.pressedButton]}
      >
        <View style={styles.parentAccordionHeaderCopy}>
          <Text style={styles.parentAccordionTitle}>{title}</Text>
          <Text style={styles.parentAccordionSummary}>{summary}</Text>
        </View>
        <Text style={styles.parentAccordionChevron}>
          {openChildProfileSection === key ? '▴' : '▾'}
        </Text>
      </Pressable>
      {openChildProfileSection === key ? <View style={styles.parentAccordionBody}>{body}</View> : null}
    </View>
  );

  const renderEmpty = (message) => <Text style={styles.parentAttendanceStateText}>{message}</Text>;

  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.childProfileHero}>
          <View style={styles.parentHeroGlowOne} />
          <View style={styles.parentHeroGlowTwo} />

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

            <Text style={styles.childProfileHeaderLabel}>Child Profile</Text>
          </View>

          <View style={styles.childProfileHeroMain}>
            <View style={styles.childProfileHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>
                {selectedChild
                  ? `${selectedChild.first_name || ''} ${selectedChild.last_name || ''}`.trim() ||
                    'Child Profile'
                  : 'Child Profile'}
              </Text>
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
                  style={[styles.childProfileGroupBadgeText, { color: childTheme.accent }]}
                >
                  {selectedChild?.room || 'Room not set'}
                </Text>
              </View>
              <View
                style={[
                  styles.childProfileStatusPill,
                  { backgroundColor: childTheme.accent },
                ]}
              >
                <Text style={styles.childProfileStatusPillText}>
                  {selectedChild?.status || 'Status not set'}
                </Text>
              </View>
            </View>

            <View style={styles.parentHeroPhotoWrap}>
              <Image source={HEADER_PHOTO} resizeMode="cover" style={styles.parentHeroPhoto} />
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Select Child</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Accessible accounts</Text>
            </View>
            {accessibleChildren.length ? (
              <View style={styles.ownerFilterPillRow}>
                {accessibleChildren.map((child) => {
                  const isActive = child.id === (selectedChildId || selectedChild?.id);
                  return (
                    <Pressable
                      key={child.id}
                      accessibilityRole="button"
                      onPress={() => onSelectChild(child)}
                      style={({ pressed }) => [
                        styles.ownerFilterPill,
                        isActive && styles.ownerFilterPillActive,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.ownerFilterPillText,
                          isActive && styles.ownerFilterPillTextActive,
                        ]}
                      >
                        {`${child.first_name || ''} ${child.last_name || ''}`.trim() ||
                          'Unnamed Student'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : loading ? (
              <Text style={styles.parentAttendanceStateText}>Loading child profile...</Text>
            ) : (
              <Text style={styles.parentAttendanceStateText}>
                No child available for this account.
              </Text>
            )}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {loading ? (
            <Text style={styles.parentAttendanceStateText}>Loading child profile...</Text>
          ) : selectedChild ? (
            <>
              {renderAccordion(
                'student-information',
                'Student Information',
                'Name, room, status, and enrollment info',
                <View style={styles.profileList}>
                  <View style={styles.profileListRow}>
                    <View style={styles.profileListDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.profileListLabel}>Name</Text>
                      <Text style={styles.profileListValue}>
                        {`${selectedChild.first_name || ''} ${selectedChild.last_name || ''}`.trim() ||
                          'Not set'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.profileListRow}>
                    <View style={styles.profileListDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.profileListLabel}>Room</Text>
                      <Text style={styles.profileListValue}>{selectedChild.room || 'Room not set'}</Text>
                    </View>
                  </View>
                  <View style={styles.profileListRow}>
                    <View style={styles.profileListDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.profileListLabel}>Status</Text>
                      <Text style={styles.profileListValue}>{selectedChild.status || 'Status not set'}</Text>
                    </View>
                  </View>
                  <View style={styles.profileListRow}>
                    <View style={styles.profileListDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.profileListLabel}>Group color</Text>
                      <Text style={styles.profileListValue}>{groupDisplayName}</Text>
                    </View>
                  </View>
                  <View style={styles.profileListRow}>
                    <View style={styles.profileListDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.profileListLabel}>Enrollment</Text>
                      <Text style={styles.profileListValue}>{enrollmentText}</Text>
                    </View>
                  </View>
                </View>
              )}

              {renderAccordion(
                'authorized-pickups',
                'Authorized Pickups',
                'Real pickup approvals',
                pickupsLoading ? (
                  renderEmpty('Loading authorized pickups...')
                ) : pickupsError ? (
                  <Text style={styles.errorText}>{pickupsError}</Text>
                ) : pickups.length ? (
                  <View style={styles.profileList}>
                    {pickups.map((pickup) => (
                      <View key={pickup.id} style={styles.profileListRow}>
                        <View
                          style={[styles.profileListDot, { backgroundColor: childTheme.accent }]}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.profileListLabel}>{pickup.full_name}</Text>
                          <Text style={styles.profileListValue}>{pickup.relationship}</Text>
                          <Text style={styles.profileListValue}>{pickup.phone}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  renderEmpty('No authorized pickups on file.')
                )
              )}

              {renderAccordion(
                'emergency-contacts',
                'Emergency Contacts',
                'Safety contacts for emergencies',
                emergencyLoading ? (
                  renderEmpty('Loading emergency contacts...')
                ) : emergencyError ? (
                  <Text style={styles.errorText}>{emergencyError}</Text>
                ) : emergencyRows.length ? (
                  <View style={styles.profileList}>
                    {emergencyRows.map((contact) => (
                      <View key={contact.id} style={styles.profileListRow}>
                        <View
                          style={[styles.profileListDot, { backgroundColor: childTheme.accent }]}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.profileListLabel}>{contact.full_name}</Text>
                          <Text style={styles.profileListValue}>{contact.relationship}</Text>
                          <Text style={styles.profileListValue}>{contact.phone}</Text>
                          <Text style={styles.profileListValue}>
                            {formatEmergencyContactPriority(contact.priority)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  renderEmpty('No emergency contacts on file.')
                )
              )}

              {renderAccordion(
                'attendance-history',
                'Attendance History',
                'Real check-in and check-out records',
                attendanceRows.length ? (
                  <View style={styles.profileList}>
                    {attendanceRows.map((event) => (
                      <View key={event.id} style={styles.profileListRow}>
                        <View
                          style={[styles.profileListDot, { backgroundColor: childTheme.accent }]}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.profileListLabel}>
                            {formatAttendanceType(event.event_type)}
                          </Text>
                          <Text style={styles.profileListValue}>
                            {formatDateTime(event.event_time)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  renderEmpty('No attendance records yet.')
                )
              )}

              {renderAccordion(
                'before-after-care',
                'Before & After Care',
                'Real school-year care sessions',
                beforeAfterRows.length ? (
                  <View style={styles.profileList}>
                    {beforeAfterRows.map((sessionRow) => (
                      <View key={sessionRow.id} style={styles.profileListRow}>
                        <View
                          style={[styles.profileListDot, { backgroundColor: childTheme.accent }]}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.profileListLabel}>
                            {formatDate(sessionRow.date || sessionRow.created_at)}
                          </Text>
                          <Text style={styles.profileListValue}>
                            Status: {getBeforeAfterStatusLabel(sessionRow)}
                          </Text>
                          <Text style={styles.profileListValue}>
                            Drop Off: {formatTime(sessionRow.drop_off_time)}
                          </Text>
                          <Text style={styles.profileListValue}>
                            Put On Bus: {formatTime(sessionRow.bus_departure_time)}
                          </Text>
                          <Text style={styles.profileListValue}>
                            Morning: {formatMinutes(sessionRow.morning_minutes)}
                          </Text>
                          <Text style={styles.profileListValue}>
                            Returned: {formatTime(sessionRow.returned_time)}
                          </Text>
                          <Text style={styles.profileListValue}>
                            Parent Pickup: {formatTime(sessionRow.pickup_time)}
                          </Text>
                          <Text style={styles.profileListValue}>
                            Afternoon: {formatMinutes(sessionRow.afternoon_minutes)}
                          </Text>
                          <Text style={styles.profileListValue}>
                            Total: {formatMinutes(sessionRow.total_minutes)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  renderEmpty('No Before & After Care record for today.')
                )
              )}

              {renderAccordion(
                'daily-notes',
                'Daily Notes',
                'Approved notes visible to families',
                dailyNotesRows.length ? (
                  <View style={styles.profileList}>
                    {dailyNotesRows.map((note) => (
                      <View key={note.id} style={styles.profileListRow}>
                        <View
                          style={[styles.profileListDot, { backgroundColor: childTheme.accent }]}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.profileListLabel}>
                            {formatDate(note.date || note.created_at)}
                          </Text>
                          <Text style={styles.profileListValue}>
                            {Array.isArray(note.quick_notes) && note.quick_notes.length
                              ? note.quick_notes.join(' • ')
                              : 'No quick notes'}
                          </Text>
                          {note.custom_note ? (
                            <Text style={styles.profileListValue}>{note.custom_note}</Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  renderEmpty('No daily notes yet.')
                )
              )}

              {renderAccordion(
                'incident-reports',
                'Incident Reports',
                'Approved incident reports',
                incidentRows.length ? (
                  <View style={styles.profileList}>
                    {incidentRows.map((report) => (
                      <View key={report.id} style={styles.profileListRow}>
                        <View
                          style={[styles.profileListDot, { backgroundColor: childTheme.accent }]}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.profileListLabel}>
                            {formatDateTime(report.created_at)}
                          </Text>
                          <Text style={styles.profileListValue}>Location: {report.location}</Text>
                          <Text style={styles.profileListValue}>
                            Description: {report.description}
                          </Text>
                          <Text style={styles.profileListValue}>
                            Action Taken: {report.action_taken}
                          </Text>
                          <Text style={styles.profileListValue}>
                            Staff Witness: {report.staff_witness}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  renderEmpty('No incident reports yet.')
                )
              )}

              {renderAccordion(
                'summer-camp',
                'Summer Camp',
                'Group, check-ins, and headcounts',
                <>
                  <View style={styles.profileList}>
                    <View style={styles.profileListRow}>
                      <View style={[styles.profileListDot, { backgroundColor: childTheme.accent }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.profileListLabel}>Group</Text>
                        <Text style={styles.profileListValue}>{groupDisplayName}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={[styles.parentSectionHeaderTitle, { marginTop: 18 }]}>Check-ins</Text>
                  {summerCampCheckIns.length ? (
                    <View style={styles.profileList}>
                      {summerCampCheckIns.map((checkIn) => {
                        const checkInGroup = campGroups.find((group) => group.id === checkIn.camp_group_id);
                        const checkInGroupName = getCampGroupDisplayName(
                          checkInGroup?.name ||
                            checkInGroup?.group_name ||
                            checkInGroup?.label ||
                            checkInGroup?.color ||
                            checkIn.camp_group_id
                        );

                        return (
                          <View key={checkIn.id} style={styles.profileListRow}>
                            <View
                              style={[
                                styles.profileListDot,
                                { backgroundColor: childTheme.accent },
                              ]}
                            />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.profileListLabel}>
                                {formatDate(checkIn.date)}
                              </Text>
                              <Text style={styles.profileListValue}>{checkInGroupName}</Text>
                              <Text style={styles.profileListValue}>
                                Checked In: {formatTime(checkIn.checked_in_at)}
                              </Text>
                              <Text style={styles.profileListValue}>
                                Status: {checkIn.status || 'checked_in'}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    renderEmpty('No camp check-ins on file.')
                  )}

                  <Text style={[styles.parentSectionHeaderTitle, { marginTop: 18 }]}>Headcounts</Text>
                  {summerCampHeadcounts.length ? (
                    <View style={styles.profileList}>
                      {summerCampHeadcounts.map((headcount) => {
                        const headcountGroup = campGroups.find(
                          (group) => group.id === headcount.camp_group_id
                        );
                        const headcountGroupName = getCampGroupDisplayName(
                          headcountGroup?.name ||
                            headcountGroup?.group_name ||
                            headcountGroup?.label ||
                            headcountGroup?.color ||
                            headcount.camp_group_id
                        );

                        return (
                          <View key={headcount.id} style={styles.profileListRow}>
                            <View
                              style={[
                                styles.profileListDot,
                                { backgroundColor: childTheme.accent },
                              ]}
                            />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.profileListLabel}>
                                {formatDate(headcount.date)}
                              </Text>
                              <Text style={styles.profileListValue}>{headcountGroupName}</Text>
                              <Text style={styles.profileListValue}>
                                Owner: {headcount.owner_checked_in_count || 0}
                              </Text>
                              <Text style={styles.profileListValue}>
                                Counselor: {headcount.counselor_confirmed_count || 0}
                              </Text>
                              <Text style={styles.profileListValue}>
                                Status: {headcount.status || 'pending'}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    renderEmpty('No camp headcounts on file.')
                  )}
                </>
              )}
            </>
          ) : null}

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

function OwnerStudentsScreen({
  onBack,
  onLogout,
  onShowComingSoon,
  authorizedPickupRows,
  authorizedPickupRowsLoading,
  authorizedPickupRowsError,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [studentRows, setStudentRows] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState('');
  const [studentStatusView, setStudentStatusView] = useState('active');
  const [availableParentProfiles, setAvailableParentProfiles] = useState([]);
  const [childParentLinkRows, setChildParentLinkRows] = useState([]);
  const [availableParentsLoading, setAvailableParentsLoading] = useState(true);
  const [availableParentsError, setAvailableParentsError] = useState('');
  const [showLinkParentModal, setShowLinkParentModal] = useState(false);
  const [selectedStudentForLink, setSelectedStudentForLink] = useState(null);
  const [selectedParentProfileId, setSelectedParentProfileId] = useState('');
  const [linkParentError, setLinkParentError] = useState('');
  const [isLinkingParent, setIsLinkingParent] = useState(false);
  const [manageOpenStudentId, setManageOpenStudentId] = useState(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [attendanceSavingStudentId, setAttendanceSavingStudentId] = useState(null);
  const [attendanceSavingType, setAttendanceSavingType] = useState('');
  const [isArchivingStudentId, setIsArchivingStudentId] = useState(null);
  const [showDailyNoteModal, setShowDailyNoteModal] = useState(false);
  const [selectedStudentForDailyNote, setSelectedStudentForDailyNote] = useState(null);
  const [selectedDailyNoteChips, setSelectedDailyNoteChips] = useState([]);
  const [dailyNoteCustomNote, setDailyNoteCustomNote] = useState('');
  const [dailyNoteError, setDailyNoteError] = useState('');
  const [isSavingDailyNote, setIsSavingDailyNote] = useState(false);
  const [createStudentError, setCreateStudentError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [createStudentForm, setCreateStudentForm] = useState({
    firstName: '',
    lastName: '',
    room: '',
    status: 'active',
  });
  const studentAccent = OWNER_MODULE_COLORS.Students;
  const badgeToneStyles = {
    blue: styles.ownerStudentBadgeBlue,
    green: styles.ownerStudentBadgeGreen,
    orange: styles.ownerStudentBadgeOrange,
    red: styles.ownerStudentBadgeRed,
    purple: styles.ownerStudentBadgePurple,
  };

  const filterPills = ['All', 'Before & After Care', 'Summer Camp', 'Both'];
  const studentViewPills = [
    { label: 'Active Students', value: 'active' },
    { label: 'Archived Students', value: 'archived' },
  ];
  const dailyNoteChips = [
    'Great day',
    'Participated in activity',
    'Ate snack',
    'Needs extra clothes',
    'Bring water bottle tomorrow',
    'Rested quietly',
  ];

  const loadStudents = useCallback(async () => {
    setStudentsLoading(true);
    setStudentsError('');

    const { data, error } = await supabase
      .from('children')
      .select('id, first_name, last_name, room, status, profile_accent_color');

    if (error) {
      setStudentsError(error.message || 'Could not load students.');
      setStudentRows([]);
      setStudentsLoading(false);
      return;
    }

    setStudentRows(Array.isArray(data) ? data : []);
    setStudentsLoading(false);
  }, []);

  const loadParentLinkData = useCallback(async () => {
    setAvailableParentsLoading(true);
    setAvailableParentsError('');

    const [parentProfilesResult, linkRowsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'parent')
        .eq('account_status', 'active'),
      supabase.from('child_parent_links').select('child_id, parent_profile_id'),
    ]);

    const parentProfilesError = parentProfilesResult.error;
    const linkRowsError = linkRowsResult.error;

    setAvailableParentProfiles(Array.isArray(parentProfilesResult.data) ? parentProfilesResult.data : []);
    setChildParentLinkRows(Array.isArray(linkRowsResult.data) ? linkRowsResult.data : []);

    if (parentProfilesError || linkRowsError) {
      setAvailableParentsError(
        parentProfilesError?.message ||
          linkRowsError?.message ||
          'Could not load parent link data.'
      );
    }

    setAvailableParentsLoading(false);
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    loadParentLinkData();
  }, [loadParentLinkData]);

  const students = [
    {
      id: 'mia',
      name: 'Mia Carter',
      parent: 'Avery Parent',
      programs: ['B&A', 'Summer Camp'],
      programLabels: ['Before & After Care', 'Summer Camp'],
      status: 'Checked In',
      statusTone: 'green',
      badgeLabel: 'Blue Group',
      badgeTone: 'blue',
      filterKey: 'Both',
    },
    {
      id: 'liam',
      name: 'Liam Wilson',
      parent: 'Dana Wilson',
      programs: ['Before & After Care'],
      programLabels: ['Before & After Care'],
      status: 'On Bus',
      statusTone: 'orange',
      badgeLabel: 'Sky Blue',
      badgeTone: 'blue',
      filterKey: 'Before & After Care',
    },
    {
      id: 'emma',
      name: 'Emma Davis',
      parent: 'Jordan Davis',
      programs: ['Summer Camp'],
      programLabels: ['Summer Camp'],
      status: 'Group Confirmed',
      statusTone: 'blue',
      badgeLabel: 'Red Group',
      badgeTone: 'red',
      filterKey: 'Summer Camp',
    },
    {
      id: 'noah',
      name: 'Noah Brown',
      parent: 'Taylor Brown',
      programs: ['Before & After Care'],
      programLabels: ['Before & After Care'],
      status: 'Picked Up',
      statusTone: 'green',
      badgeLabel: 'Soft Orange',
      badgeTone: 'orange',
      filterKey: 'Before & After Care',
    },
  ];

  const summaryCards = [
    { title: 'Total Students', value: '42', accent: 'blue' },
    { title: 'Before & After Care', value: '24', accent: 'blue' },
    { title: 'Summer Camp', value: '31', accent: 'blue' },
    { title: 'Both Programs', value: '13', accent: 'blue' },
  ];

  const realStudents = studentRows.map((student, index) => {
    const firstName = student.first_name?.trim() || '';
    const lastName = student.last_name?.trim() || '';
    const name = `${firstName} ${lastName}`.trim() || 'Unnamed Student';
    const room = student.room?.trim() || 'Room not set';
    const status = student.status?.trim() || 'Unknown';

    return {
      id: student.id ?? `${name}-${room}-${index}`,
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      isRealStudent: true,
      name,
      room,
      status,
      accentColor: student.profile_accent_color || studentAccent,
    };
  });

  const linkedParentsByStudentId = childParentLinkRows.reduce((acc, linkRow) => {
    const parent = availableParentProfiles.find((profile) => profile.id === linkRow.parent_profile_id);

    if (!parent) {
      return acc;
    }

    const current = acc[linkRow.child_id] || [];
    const alreadyIncluded = current.some((entry) => entry.id === parent.id);

    if (alreadyIncluded) {
      return acc;
    }

    return {
      ...acc,
      [linkRow.child_id]: [...current, parent],
    };
  }, {});

  const authorizedPickupsByStudentId = (Array.isArray(authorizedPickupRows) ? authorizedPickupRows : []).reduce(
    (acc, pickupRow) => {
      const current = acc[pickupRow.child_id] || [];
      acc[pickupRow.child_id] = [...current, pickupRow];
      return acc;
    },
    {}
  );

  const visibleRealStudents = realStudents.filter((student) => {
    const query = searchQuery.trim().toLowerCase();
    const normalizedStatus = (student.status || '').trim().toLowerCase();
    const matchesStatusView =
      studentStatusView === 'archived'
        ? normalizedStatus === 'inactive'
        : normalizedStatus !== 'inactive';

    if (!query) {
      return matchesStatusView;
    }

    return (
      matchesStatusView &&
      (student.name.toLowerCase().includes(query) ||
        student.room.toLowerCase().includes(query) ||
        student.status.toLowerCase().includes(query))
    );
  });

  const visibleStudents = students.filter((student) => {
    const query = searchQuery.trim().toLowerCase();
    const normalizedStatus = (student.status || '').trim().toLowerCase();
    const matchesStatusView =
      studentStatusView === 'archived'
        ? normalizedStatus === 'inactive'
        : normalizedStatus !== 'inactive';
    const matchesQuery =
      !query ||
      student.name.toLowerCase().includes(query) ||
      student.parent.toLowerCase().includes(query);
    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Both' ? student.programs.length > 1 : student.filterKey === activeFilter);
    return matchesQuery && matchesFilter && matchesStatusView;
  });

  const hasRealStudents = visibleRealStudents.length > 0;
  const showEmptyState = !studentsLoading && !studentsError && !hasRealStudents;
  const displayMockFallback = !!studentsError && !hasRealStudents;

  const handleOpenStudentForm = () => {
    setCreateStudentError('');
    setSelectedStudent(null);
    setManageOpenStudentId(null);
    setCreateStudentForm({
      firstName: '',
      lastName: '',
      room: '',
      status: 'active',
    });
    setShowStudentForm(true);
  };

  const handleEditStudent = (student) => {
    setCreateStudentError('');
    setManageOpenStudentId(null);
    setSelectedStudent(student);
    setCreateStudentForm({
      firstName: student.first_name?.trim() || '',
      lastName: student.last_name?.trim() || '',
      room: student.room?.trim() || '',
      status: student.status?.trim() || 'active',
    });
    setShowStudentForm(true);
  };

  const handleCancelStudentForm = () => {
    setCreateStudentError('');
    setShowStudentForm(false);
    setSelectedStudent(null);
    setManageOpenStudentId(null);
    setCreateStudentForm({
      firstName: '',
      lastName: '',
      room: '',
      status: 'active',
    });
  };

  const handleArchiveStudent = (student) => {
    if (!student?.id) {
      return;
    }

    setManageOpenStudentId(null);
    Alert.alert('Archive this student?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          setIsArchivingStudentId(student.id);

          const { error } = await supabase
            .from('children')
            .update({
              status: 'inactive',
            })
            .eq('id', student.id);

          if (error) {
            setStudentsError(error.message || 'Could not archive student.');
            setIsArchivingStudentId(null);
            return;
          }

          await loadStudents();
          setIsArchivingStudentId(null);
        },
      },
    ]);
  };

  const handleSaveStudent = async () => {
    const firstName = createStudentForm.firstName.trim();
    const lastName = createStudentForm.lastName.trim();
    const room = createStudentForm.room.trim();
    const status = createStudentForm.status.trim();

    if (!firstName || !lastName || !room || !status) {
      setCreateStudentError('Please fill in all fields.');
      return;
    }

    setIsSavingStudent(true);
    setCreateStudentError('');

    let error;

    if (selectedStudent?.id) {
      ({ error } = await supabase
        .from('children')
        .update({
          first_name: firstName,
          last_name: lastName,
          room,
          status,
        })
        .eq('id', selectedStudent.id));
    } else {
      ({ error } = await supabase.from('children').insert({
        first_name: firstName,
        last_name: lastName,
        room,
        status,
      }));
    }

    if (error) {
      setCreateStudentError(error.message || 'Could not save student.');
      setIsSavingStudent(false);
      return;
    }

    await loadStudents();
    setIsSavingStudent(false);
    setShowStudentForm(false);
    setSelectedStudent(null);
    setSearchQuery('');
    setActiveFilter('All');
    setCreateStudentForm({
      firstName: '',
      lastName: '',
      room: '',
      status: 'active',
    });
  };

  const handleOpenLinkParent = (student) => {
    setLinkParentError('');
    setSelectedStudentForLink(student);
    setSelectedParentProfileId('');
    setShowLinkParentModal(true);
    setManageOpenStudentId(null);
  };

  const handleToggleStudentActions = (studentId) => {
    setManageOpenStudentId((current) => (current === studentId ? null : studentId));
  };

  const handleViewStudentDetails = () => {
    Alert.alert('Owner student profile coming next.');
  };

  const handleOpenDailyNote = (student) => {
    if (!student?.id) {
      return;
    }

    setDailyNoteError('');
    setSelectedStudentForDailyNote(student);
    setSelectedDailyNoteChips([]);
    setDailyNoteCustomNote('');
    setShowDailyNoteModal(true);
    setManageOpenStudentId(null);
  };

  const handleCloseDailyNoteModal = () => {
    setDailyNoteError('');
    setSelectedStudentForDailyNote(null);
    setSelectedDailyNoteChips([]);
    setDailyNoteCustomNote('');
    setIsSavingDailyNote(false);
    setShowDailyNoteModal(false);
  };

  const toggleDailyNoteChip = (chip) => {
    setSelectedDailyNoteChips((current) =>
      current.includes(chip) ? current.filter((item) => item !== chip) : [...current, chip]
    );
  };

  const handleSaveDailyNote = async () => {
    if (!selectedStudentForDailyNote?.id) {
      return;
    }

    const trimmedCustomNote = dailyNoteCustomNote.trim();

    if (!selectedDailyNoteChips.length && !trimmedCustomNote) {
      setDailyNoteError('Please add a quick note or custom note.');
      return;
    }

    setIsSavingDailyNote(true);
    setDailyNoteError('');

    const { error } = await supabase.from('daily_notes').insert({
      child_id: selectedStudentForDailyNote.id,
      date: new Date().toISOString().split('T')[0],
      quick_notes: selectedDailyNoteChips,
      custom_note: trimmedCustomNote,
      visibility: 'both',
      review_status: 'approved',
    });

    if (error) {
      setDailyNoteError(error.message || 'Could not save daily note.');
      setIsSavingDailyNote(false);
      return;
    }

    Alert.alert('Daily note saved.');
    handleCloseDailyNoteModal();
  };

  const handleRecordAttendance = async (student, eventType) => {
    if (!student?.id) {
      return;
    }

    setManageOpenStudentId(null);
    setAttendanceSavingStudentId(student.id);
    setAttendanceSavingType(eventType);

    const { data: latestEvents, error: latestEventError } = await supabase
      .from('attendance_events')
      .select('event_type, event_time')
      .eq('child_id', student.id)
      .order('event_time', { ascending: false })
      .limit(1);

    if (latestEventError) {
      Alert.alert('Could not save attendance.');
      setAttendanceSavingStudentId(null);
      setAttendanceSavingType('');
      return;
    }

    const latestEvent = Array.isArray(latestEvents) && latestEvents.length ? latestEvents[0] : null;

    if (latestEvent?.event_type === eventType) {
      Alert.alert(
        eventType === 'check_in'
          ? 'Student is already checked in.'
          : 'Student is already checked out.'
      );
      setAttendanceSavingStudentId(null);
      setAttendanceSavingType('');
      return;
    }

    const { error } = await supabase.from('attendance_events').insert({
      child_id: student.id,
      event_type: eventType,
      event_time: new Date().toISOString(),
    });

    setAttendanceSavingStudentId(null);
    setAttendanceSavingType('');

    if (error) {
      Alert.alert('Could not save attendance.');
      return;
    }

    Alert.alert(eventType === 'check_in' ? 'Checked in' : 'Checked out');
  };

  const handleCloseLinkParentModal = () => {
    setLinkParentError('');
    setShowLinkParentModal(false);
    setSelectedStudentForLink(null);
    setSelectedParentProfileId('');
  };

  const handleLinkParent = async () => {
    if (!selectedStudentForLink?.id || !selectedParentProfileId) {
      setLinkParentError('Select a parent to continue.');
      return;
    }

    setIsLinkingParent(true);
    setLinkParentError('');
    setManageOpenStudentId(null);

    const { data: existingLinks, error: existingLinkError } = await supabase
      .from('child_parent_links')
      .select('id')
      .eq('child_id', selectedStudentForLink.id)
      .eq('parent_profile_id', selectedParentProfileId);

    if (existingLinkError) {
      setLinkParentError(existingLinkError.message || 'Could not link parent.');
      setIsLinkingParent(false);
      return;
    }

    if (Array.isArray(existingLinks) && existingLinks.length > 0) {
      setLinkParentError('Parent already linked.');
      setIsLinkingParent(false);
      return;
    }

    const { error: insertError } = await supabase.from('child_parent_links').insert({
      child_id: selectedStudentForLink.id,
      parent_profile_id: selectedParentProfileId,
    });

    if (insertError) {
      setLinkParentError(insertError.message || 'Could not link parent.');
      setIsLinkingParent(false);
      return;
    }

    await loadParentLinkData();
    setIsLinkingParent(false);
    handleCloseLinkParentModal();
  };

  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <View style={styles.heroOrbLarge} />
        <View style={styles.heroOrbSmall} />
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

          <Text style={styles.childProfileHeaderLabel}>Students</Text>
        </View>
          <View style={styles.ownerDashboardHeroCopy}>
            <Text style={styles.ownerDashboardEyebrow}>Advanced Education</Text>
            <Text style={styles.shellHeroTitle}>Students</Text>
            <Text style={styles.shellHeroSubtitle}>Manage enrolled children</Text>
          <View
            style={[
              styles.shellHeroPill,
              styles.ownerStudentsHeroPill,
              { marginTop: 10 },
            ]}
          >
            <Text style={styles.ownerStudentsHeroPillText}>Owner Access</Text>
          </View>
          </View>
        </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentStack}>
          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Student Summary</Text>
            <View style={[styles.ownerSectionDetailsGrid, { marginTop: 14 }]}>
              {summaryCards.map((card) => (
                <SummaryTile
                  key={card.title}
                  accent={card.accent}
                  badge={card.title.charAt(0)}
                  title={card.title}
                  value={card.value}
                  note="Center-wide totals"
                  fill="Owner"
                />
              ))}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Search / Filter</Text>
            <TextInput
              placeholder="Search student name..."
              placeholderTextColor={COLORS.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.ownerSearchInput}
            />

            <View style={styles.ownerFilterPillRow}>
              {filterPills.map((pill) => {
                const isActive = activeFilter === pill;
                return (
                  <Pressable
                    key={pill}
                    accessibilityRole="button"
                    onPress={() => setActiveFilter(pill)}
                    style={({ pressed }) => [
                      styles.ownerFilterPill,
                      isActive && styles.ownerFilterPillActive,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ownerFilterPillText,
                        isActive && styles.ownerFilterPillTextActive,
                      ]}
                    >
                      {pill}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.ownerStudentFormLabel}>Student View</Text>
            <View style={styles.ownerFilterPillRow}>
              {studentViewPills.map((pill) => {
                const isActive = studentStatusView === pill.value;
                return (
                  <Pressable
                    key={pill.value}
                    accessibilityRole="button"
                    onPress={() => setStudentStatusView(pill.value)}
                    style={({ pressed }) => [
                      styles.ownerFilterPill,
                      isActive && styles.ownerFilterPillActive,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ownerFilterPillText,
                        isActive && styles.ownerFilterPillTextActive,
                      ]}
                    >
                      {pill.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {showStudentForm ? (
            <View style={styles.ownerAccordionCard}>
              <Text style={styles.ownerAccordionTitle}>
                {selectedStudent ? 'Edit Student' : 'Add Student'}
              </Text>

              <Text style={styles.ownerStudentFormLabel}>First Name</Text>
              <TextInput
                placeholder="First Name"
                placeholderTextColor={COLORS.muted}
                value={createStudentForm.firstName}
                onChangeText={(value) =>
                  setCreateStudentForm((current) => ({ ...current, firstName: value }))
                }
                style={styles.ownerSearchInput}
              />

              <Text style={styles.ownerStudentFormLabel}>Last Name</Text>
              <TextInput
                placeholder="Last Name"
                placeholderTextColor={COLORS.muted}
                value={createStudentForm.lastName}
                onChangeText={(value) =>
                  setCreateStudentForm((current) => ({ ...current, lastName: value }))
                }
                style={styles.ownerSearchInput}
              />

              <Text style={styles.ownerStudentFormLabel}>Room</Text>
              <TextInput
                placeholder="Room"
                placeholderTextColor={COLORS.muted}
                value={createStudentForm.room}
                onChangeText={(value) =>
                  setCreateStudentForm((current) => ({ ...current, room: value }))
                }
                style={styles.ownerSearchInput}
              />

              <Text style={styles.ownerStudentFormLabel}>Status</Text>
              <View style={styles.ownerFilterPillRow}>
                {['active', 'inactive'].map((statusOption) => {
                  const isActive = createStudentForm.status === statusOption;
                  return (
                    <Pressable
                      key={statusOption}
                      accessibilityRole="button"
                      onPress={() =>
                        setCreateStudentForm((current) => ({ ...current, status: statusOption }))
                      }
                      style={({ pressed }) => [
                        styles.ownerFilterPill,
                        isActive && styles.ownerFilterPillActive,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.ownerFilterPillText,
                          isActive && styles.ownerFilterPillTextActive,
                        ]}
                      >
                        {statusOption}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {createStudentError ? (
                <Text style={[styles.errorText, { marginTop: 12 }]}>{createStudentError}</Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                disabled={isSavingStudent}
                onPress={handleSaveStudent}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressedButton,
                  isSavingStudent && { opacity: 0.75 },
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {isSavingStudent ? 'Saving Student...' : 'Save Student'}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isSavingStudent}
                onPress={handleCancelStudentForm}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressedButton,
                  { marginTop: 12 },
                ]}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Student List</Text>
            {studentsLoading ? (
              <Text style={[styles.ownerStudentsStateText, { marginBottom: 12 }]}>
                Loading students...
              </Text>
            ) : studentsError ? (
              <Text style={[styles.errorText, { marginBottom: 12 }]}>Could not load students.</Text>
            ) : null}

            <View style={styles.ownerStudentList}>
              {showEmptyState ? (
                <Text style={styles.ownerStudentsStateText}>No students added yet.</Text>
              ) : hasRealStudents ? (
                visibleRealStudents.map((student) => (
                  <View key={student.id} style={styles.ownerStudentCard}>
                    <View style={styles.ownerStudentTopRow}>
                      <View style={styles.ownerStudentMainBlock}>
                        <Text style={styles.ownerStudentName}>{student.name}</Text>
                        <Text style={styles.ownerStudentParent}>Room: {student.room}</Text>
                      </View>
                      <View
                        style={[
                          styles.ownerStudentBadge,
                          { backgroundColor: student.accentColor },
                        ]}
                      >
                        <Text style={styles.ownerStudentBadgeText}>{student.room}</Text>
                      </View>
                    </View>

                    <View style={styles.ownerStudentMetaRow}>
                      <View
                        style={[
                          styles.ownerStudentStatusPill,
                          styles.ownerStudentStatusPillBlue,
                        ]}
                      >
                        <Text style={styles.ownerStudentStatusPillText}>{student.status}</Text>
                      </View>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handleToggleStudentActions(student.id)}
                      style={({ pressed }) => [
                        styles.ownerStudentProfileButton,
                        { backgroundColor: COLORS.navy, alignSelf: 'flex-start' },
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <Text style={styles.ownerStudentProfileButtonText}>
                        {manageOpenStudentId === student.id ? 'Manage ▴' : 'Manage ▾'}
                      </Text>
                    </Pressable>

                    {manageOpenStudentId === student.id ? (
                      <View style={[styles.ownerStudentActionMenu, styles.studentActionDropdown]}>
                        <View style={styles.ownerLinkedParentsBlock}>
                          <Text style={styles.ownerLinkedParentsLabel}>Linked Parents</Text>
                          {linkedParentsByStudentId[student.id]?.length ? (
                            linkedParentsByStudentId[student.id].map((parent) => (
                              <Text key={parent.id} style={styles.ownerLinkedParentsValue}>
                                {parent.email}
                              </Text>
                            ))
                          ) : (
                            <Text style={styles.ownerLinkedParentsValue}>None</Text>
                          )}
                        </View>

                        <View style={styles.ownerLinkedParentsBlock}>
                          <Text style={styles.ownerLinkedParentsLabel}>Authorized Pickups</Text>
                          {authorizedPickupRowsLoading ? (
                            <Text style={styles.ownerLinkedParentsValue}>Loading pickups...</Text>
                          ) : authorizedPickupRowsError ? (
                            <Text style={styles.ownerLinkedParentsValue}>
                              {authorizedPickupRowsError}
                            </Text>
                          ) : authorizedPickupsByStudentId[student.id]?.length ? (
                            authorizedPickupsByStudentId[student.id].map((pickup) => (
                              <View key={pickup.id} style={styles.ownerPickupItem}>
                                <Text style={styles.ownerLinkedParentsValue}>
                                  {pickup.full_name}
                                </Text>
                                <Text style={styles.ownerPickupMeta}>
                                  {pickup.relationship} · {pickup.phone_number}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text style={styles.ownerLinkedParentsValue}>
                              No authorized pickups on file.
                            </Text>
                          )}
                        </View>

                        <View style={styles.studentActionRow}>
                          {student.status?.trim().toLowerCase() !== 'inactive' ? (
                            <>
                              <Pressable
                                accessibilityRole="button"
                                disabled={
                                  attendanceSavingStudentId === student.id &&
                                  attendanceSavingType === 'check_in'
                                }
                                onPress={() => handleRecordAttendance(student, 'check_in')}
                                style={({ pressed }) => [
                                  styles.studentActionPill,
                                  styles.studentActionPillGreen,
                                  pressed && styles.pressedButton,
                                  attendanceSavingStudentId === student.id &&
                                    attendanceSavingType === 'check_in' &&
                                    { opacity: 0.75 },
                                ]}
                              >
                                <Text style={styles.ownerStudentProfileButtonText}>
                                  {attendanceSavingStudentId === student.id &&
                                  attendanceSavingType === 'check_in'
                                    ? 'Checking In...'
                                    : 'Check In'}
                                </Text>
                              </Pressable>
                              <Pressable
                                accessibilityRole="button"
                                disabled={
                                  attendanceSavingStudentId === student.id &&
                                  attendanceSavingType === 'check_out'
                                }
                                onPress={() => handleRecordAttendance(student, 'check_out')}
                                style={({ pressed }) => [
                                  styles.studentActionPill,
                                  styles.studentActionPillNavy,
                                  pressed && styles.pressedButton,
                                  attendanceSavingStudentId === student.id &&
                                    attendanceSavingType === 'check_out' &&
                                    { opacity: 0.75 },
                                ]}
                              >
                                <Text style={styles.ownerStudentProfileButtonText}>
                                  {attendanceSavingStudentId === student.id &&
                                  attendanceSavingType === 'check_out'
                                    ? 'Checking Out...'
                                    : 'Check Out'}
                                </Text>
                              </Pressable>
                            </>
                          ) : null}
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => handleViewStudentDetails()}
                            style={({ pressed }) => [
                              styles.studentActionPill,
                              styles.studentActionPillBlue,
                              pressed && styles.pressedButton,
                            ]}
                            >
                              <Text style={styles.ownerStudentProfileButtonText}>View Details</Text>
                            </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => handleOpenDailyNote(student)}
                            style={({ pressed }) => [
                              styles.studentActionPill,
                              styles.studentActionPillPurple,
                              pressed && styles.pressedButton,
                            ]}
                          >
                            <Text style={styles.ownerStudentProfileButtonText}>Daily Note</Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => handleEditStudent(student)}
                            style={({ pressed }) => [
                              styles.studentActionPill,
                              styles.studentActionPillNavy,
                              pressed && styles.pressedButton,
                            ]}
                          >
                            <Text style={styles.ownerStudentProfileButtonText}>Edit</Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => handleOpenLinkParent(student)}
                            style={({ pressed }) => [
                              styles.studentActionPill,
                              styles.studentActionPillGreen,
                              pressed && styles.pressedButton,
                            ]}
                          >
                            <Text style={styles.ownerStudentProfileButtonText}>Link Parent</Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            disabled={isArchivingStudentId === student.id}
                            onPress={() => handleArchiveStudent(student)}
                            style={({ pressed }) => [
                              styles.studentActionPill,
                              styles.studentActionPillRed,
                              pressed && styles.pressedButton,
                              isArchivingStudentId === student.id && { opacity: 0.7 },
                            ]}
                          >
                            <Text style={styles.ownerStudentProfileButtonText}>Archive</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : null}
                  </View>
                ))
              ) : displayMockFallback ? (
                visibleStudents.map((student) => (
                  <View key={student.id} style={styles.ownerStudentCard}>
                    <View style={styles.ownerStudentTopRow}>
                      <View style={styles.ownerStudentMainBlock}>
                        <Text style={styles.ownerStudentName}>{student.name}</Text>
                        <Text style={styles.ownerStudentParent}>Parent: {student.parent}</Text>
                      </View>
                      <View
                        style={[
                          styles.ownerStudentBadge,
                          badgeToneStyles[student.badgeTone] || styles.ownerStudentBadgeBlue,
                        ]}
                      >
                        <Text style={styles.ownerStudentBadgeText}>{student.badgeLabel}</Text>
                      </View>
                    </View>

                    <View style={styles.ownerStudentChipRow}>
                      {student.programLabels.map((program) => (
                        <View key={program} style={styles.ownerStudentProgramChip}>
                          <Text style={styles.ownerStudentProgramChipText}>{program}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.ownerStudentMetaRow}>
                      <View
                        style={[
                          styles.ownerStudentStatusPill,
                          styles.ownerStudentStatusPillBlue,
                        ]}
                      >
                        <Text style={styles.ownerStudentStatusPillText}>{student.status}</Text>
                      </View>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handleToggleStudentActions(student.id)}
                      style={({ pressed }) => [
                        styles.ownerStudentProfileButton,
                        { backgroundColor: COLORS.navy, alignSelf: 'flex-start' },
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <Text style={styles.ownerStudentProfileButtonText}>
                        {manageOpenStudentId === student.id ? 'Manage ▴' : 'Manage ▾'}
                      </Text>
                    </Pressable>

                    {manageOpenStudentId === student.id ? (
                      <View style={[styles.ownerStudentActionMenu, styles.studentActionDropdown]}>
                        <View style={styles.ownerLinkedParentsBlock}>
                          <Text style={styles.ownerLinkedParentsLabel}>Linked Parents</Text>
                          <Text style={styles.ownerLinkedParentsValue}>None</Text>
                        </View>

                        <View style={styles.studentActionRow}>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => handleViewStudentDetails()}
                            style={({ pressed }) => [
                              styles.studentActionPill,
                              styles.studentActionPillBlue,
                              pressed && styles.pressedButton,
                            ]}
                          >
                            <Text style={styles.ownerStudentProfileButtonText}>View Details</Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => handleEditStudent(student)}
                            style={({ pressed }) => [
                              styles.studentActionPill,
                              styles.studentActionPillNavy,
                              pressed && styles.pressedButton,
                            ]}
                          >
                            <Text style={styles.ownerStudentProfileButtonText}>Edit</Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            disabled
                            onPress={() => {}}
                            style={({ pressed }) => [
                              styles.studentActionPill,
                              styles.studentActionPillGreen,
                              pressed && styles.pressedButton,
                              { opacity: 0.45 },
                            ]}
                          >
                            <Text style={styles.ownerStudentProfileButtonText}>Link Parent</Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            disabled
                            onPress={() => {}}
                            style={({ pressed }) => [
                              styles.studentActionPill,
                              styles.studentActionPillRed,
                              pressed && styles.pressedButton,
                              { opacity: 0.45 },
                            ]}
                          >
                            <Text style={styles.ownerStudentProfileButtonText}>Archive</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : null}
                  </View>
                ))
              ) : null}
            </View>
          </View>

          <Modal
            animationType="fade"
            onRequestClose={handleCloseLinkParentModal}
            transparent
            visible={showLinkParentModal}
          >
            <View style={styles.ownerLinkParentModalOverlay}>
              <View style={styles.ownerLinkParentModalCard}>
                <Text style={styles.ownerLinkParentModalTitle}>Link Parent</Text>
                <Text style={styles.ownerLinkParentModalSubtitle}>
                  {selectedStudentForLink ? selectedStudentForLink.name : ''}
                </Text>

                {availableParentsLoading ? (
                  <Text style={styles.ownerStudentsStateText}>Loading parents...</Text>
                ) : availableParentsError ? (
                  <Text style={styles.errorText}>Could not load parents.</Text>
                ) : (
                  <ScrollView style={styles.ownerLinkParentModalList}>
                    {availableParentProfiles.map((parent) => {
                      const isActive = selectedParentProfileId === parent.id;
                      return (
                        <Pressable
                          key={parent.id}
                          accessibilityRole="button"
                          onPress={() => setSelectedParentProfileId(parent.id)}
                          style={({ pressed }) => [
                            styles.ownerLinkParentOption,
                            isActive && styles.ownerLinkParentOptionActive,
                            pressed && styles.pressedButton,
                          ]}
                        >
                          <Text style={styles.ownerLinkParentOptionEmail}>{parent.email}</Text>
                          <Text style={styles.ownerLinkParentOptionMeta}>{parent.role}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                )}

                {linkParentError ? (
                  <Text style={[styles.errorText, { marginTop: 12 }]}>{linkParentError}</Text>
                ) : null}

                <View style={styles.ownerLinkParentModalButtonRow}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isLinkingParent}
                    onPress={handleCloseLinkParentModal}
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      { flex: 1, marginTop: 0 },
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    disabled={isLinkingParent}
                    onPress={handleLinkParent}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      { flex: 1, marginTop: 0 },
                      pressed && styles.pressedButton,
                      isLinkingParent && { opacity: 0.75 },
                    ]}
                  >
                    <Text style={styles.primaryButtonText}>
                      {isLinkingParent ? 'Linking...' : 'Link'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="fade"
            onRequestClose={handleCloseDailyNoteModal}
            transparent
            visible={showDailyNoteModal}
          >
            <View style={styles.ownerLinkParentModalOverlay}>
              <View style={styles.ownerLinkParentModalCard}>
                <Text style={styles.ownerLinkParentModalTitle}>Daily Note</Text>
                <Text style={styles.ownerLinkParentModalSubtitle}>
                  {selectedStudentForDailyNote ? selectedStudentForDailyNote.name : ''}
                </Text>

                <Text style={styles.ownerStudentFormLabel}>Quick Notes</Text>
                <View style={styles.staffDailyNotesChipWrap}>
                  {dailyNoteChips.map((chip) => {
                    const isActive = selectedDailyNoteChips.includes(chip);

                    return (
                      <Pressable
                        key={chip}
                        accessibilityRole="button"
                        onPress={() => toggleDailyNoteChip(chip)}
                        style={({ pressed }) => [
                          styles.staffDailyNotesChip,
                          isActive && styles.staffDailyNotesChipActive,
                          pressed && styles.pressedButton,
                        ]}
                      >
                        <Text
                          style={[
                            styles.staffDailyNotesChipText,
                            isActive && styles.staffDailyNotesChipTextActive,
                          ]}
                        >
                          {chip}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.ownerStudentFormLabel}>Custom Note</Text>
                <TextInput
                  multiline
                  onChangeText={setDailyNoteCustomNote}
                  placeholder="Write a note for the parent..."
                  placeholderTextColor={COLORS.muted}
                  style={[styles.ownerSearchInput, styles.ownerDailyNoteInput]}
                  textAlignVertical="top"
                  value={dailyNoteCustomNote}
                />

                {dailyNoteError ? (
                  <Text style={[styles.errorText, { marginTop: 12 }]}>{dailyNoteError}</Text>
                ) : null}

                <View style={styles.ownerLinkParentModalButtonRow}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSavingDailyNote}
                    onPress={handleCloseDailyNoteModal}
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      { flex: 1, marginTop: 0 },
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    disabled={isSavingDailyNote}
                    onPress={handleSaveDailyNote}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      { flex: 1, marginTop: 0 },
                      pressed && styles.pressedButton,
                      isSavingDailyNote && { opacity: 0.75 },
                    ]}
                  >
                    <Text style={styles.primaryButtonText}>
                      {isSavingDailyNote ? 'Saving...' : 'Save Daily Note'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Owner Student Actions</Text>
            <View style={styles.ownerActionButtonStack}>
              {['Add Student', 'Send Parent Invite Code', 'View Attendance', 'View Billing'].map(
                (label) => (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    onPress={() =>
                      label === 'Add Student' ? handleOpenStudentForm() : onShowComingSoon(label)
                    }
                    style={({ pressed }) => [
                      styles.actionCard,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <View style={styles.actionAccentBlue} />
                    <View style={styles.actionCardBody}>
                      <Text style={styles.actionTitle}>{label}</Text>
                      <Text style={styles.actionNote}>
                        {label === 'Add Student' ? 'Create a new student record' : 'Coming Soon'}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                )
              )}
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

function OwnerStaffScreen({ onBack, onLogout, onShowComingSoon }) {
  const staffAccent = OWNER_MODULE_COLORS.Staff;

  const staffSummaryCards = [
    { title: 'Total Staff', value: '12', accent: 'green' },
    { title: 'Clocked In', value: '7', accent: 'green' },
    { title: 'Clocked Out', value: '5', accent: 'green' },
    { title: 'Hours Pending Review', value: '3', accent: 'green' },
  ];

  const staffMembers = [
    {
      id: 'ms-sarah',
      name: 'Ms. Sarah',
      role: 'Counselor',
      status: 'Clocked In',
      today: '7:30 AM - 4:00 PM',
      hours: '32.0',
      review: 'Pending',
      badge: 'Shift On',
      badgeTone: 'green',
    },
    {
      id: 'mr-james',
      name: 'Mr. James',
      role: 'Bus / After Care',
      status: 'Clocked In',
      today: '8:00 AM - 5:00 PM',
      hours: '30.5',
      review: 'Approved',
      badge: 'Shift On',
      badgeTone: 'blue',
    },
    {
      id: 'ms-kelly',
      name: 'Ms. Kelly',
      role: 'Camp Counselor',
      status: 'Clocked Out',
      today: '7:00 AM - 3:00 PM',
      hours: '28.0',
      review: 'Pending',
      badge: 'Shift Off',
      badgeTone: 'orange',
    },
  ];

  const badgeToneStyles = {
    blue: styles.ownerStaffBadgeBlue,
    green: styles.ownerStaffBadgeGreen,
    orange: styles.ownerStaffBadgeOrange,
    red: styles.ownerStaffBadgeRed,
    purple: styles.ownerStaffBadgePurple,
  };

  const reviewToneStyles = {
    blue: styles.ownerStaffReviewBlue,
    green: styles.ownerStaffReviewGreen,
    orange: styles.ownerStaffReviewOrange,
  };

  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <View style={styles.heroOrbLarge} />
        <View style={styles.heroOrbSmall} />
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

          <Text style={styles.childProfileHeaderLabel}>Staff</Text>
        </View>

        <View style={styles.ownerDashboardHeroCopy}>
          <Text style={styles.ownerDashboardEyebrow}>Advanced Education</Text>
          <Text style={styles.shellHeroTitle}>Staff</Text>
          <Text style={styles.shellHeroSubtitle}>Manage employees and hours</Text>
          <View
            style={[
              styles.shellHeroPill,
              styles.ownerStaffHeroPill,
              { marginTop: 10 },
            ]}
          >
            <Text style={styles.ownerStaffHeroPillText}>Owner Access</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentStack}>
          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Staff Summary</Text>
            <View style={[styles.ownerSectionDetailsGrid, { marginTop: 14 }]}>
              {staffSummaryCards.map((card) => (
                <SummaryTile
                  key={card.title}
                  accent={card.accent}
                  badge={card.title.charAt(0)}
                  title={card.title}
                  value={card.value}
                  note="Center-wide totals"
                  fill="Owner"
                />
              ))}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Staff List</Text>
            <View style={styles.ownerStaffList}>
              {staffMembers.map((member) => (
                <View key={member.id} style={styles.ownerStaffCard}>
                  <View style={styles.ownerStudentTopRow}>
                    <View style={styles.ownerStudentMainBlock}>
                      <Text style={styles.ownerStudentName}>{member.name}</Text>
                      <Text style={styles.ownerStudentParent}>Role: {member.role}</Text>
                    </View>
                    <View
                      style={[
                        styles.ownerStaffBadge,
                        badgeToneStyles[member.badgeTone] || styles.ownerStaffBadgeGreen,
                      ]}
                    >
                      <Text style={styles.ownerStaffBadgeText}>{member.badge}</Text>
                    </View>
                  </View>

                  <View style={styles.ownerStaffMetaList}>
                    <View style={styles.ownerStaffMetaRow}>
                      <Text style={styles.ownerStaffMetaLabel}>Status</Text>
                      <View
                        style={[
                          styles.ownerStaffStatusPill,
                          member.status === 'Clocked In'
                            ? styles.ownerStaffStatusPillGreen
                            : styles.ownerStaffStatusPillOrange,
                        ]}
                      >
                        <Text style={styles.ownerStaffStatusPillText}>{member.status}</Text>
                      </View>
                    </View>
                    <View style={styles.ownerStaffMetaRow}>
                      <Text style={styles.ownerStaffMetaLabel}>Today</Text>
                      <Text style={styles.ownerStaffMetaValue}>{member.today}</Text>
                    </View>
                    <View style={styles.ownerStaffMetaRow}>
                      <Text style={styles.ownerStaffMetaLabel}>Hours This Week</Text>
                      <Text style={styles.ownerStaffMetaValue}>{member.hours}</Text>
                    </View>
                    <View style={styles.ownerStaffMetaRow}>
                      <Text style={styles.ownerStaffMetaLabel}>Review Status</Text>
                      <View
                        style={[
                          styles.ownerStaffReviewPill,
                          member.review === 'Approved'
                            ? reviewToneStyles.green
                            : reviewToneStyles.orange,
                        ]}
                      >
                        <Text style={styles.ownerStaffReviewPillText}>{member.review}</Text>
                      </View>
                    </View>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onShowComingSoon('View Staff Profile')}
                    style={({ pressed }) => [
                      styles.ownerStaffProfileButton,
                      { backgroundColor: staffAccent },
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text style={styles.ownerStaffProfileButtonText}>View Staff Profile</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Owner Staff Actions</Text>
            <View style={styles.ownerActionButtonStack}>
              {['Add Staff', 'Send Staff Invite Code', 'Review Hours', 'Staff Schedule'].map(
                (label) => (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    onPress={() => onShowComingSoon(label)}
                    style={({ pressed }) => [
                      styles.actionCard,
                      pressed && styles.pressedTile,
                    ]}
                  >
                    <View style={[styles.actionAccent, { backgroundColor: staffAccent }]} />
                    <View style={styles.actionCardBody}>
                      <Text style={styles.actionTitle}>{label}</Text>
                      <Text style={styles.actionNote}>Coming Soon</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                )
              )}
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

function StaffClockInOutScreen({
  onBack,
  onLogout,
  staffStatus,
  onToggleStaffStatus,
  lastClockInTime,
  lastClockOutTime,
}) {
  const isCheckedOut = staffStatus === 'Checked Out';

  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.staffClockHero}>
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

            <Text style={styles.childProfileHeaderLabel}>Clock In / Out</Text>
          </View>

          <View style={styles.staffHeroMain}>
            <View style={styles.staffHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Staff: Ms. Sarah</Text>
              <Text style={styles.staffHeroSubheading}>Time clock</Text>
              <View style={styles.staffClockStatusPill}>
                <Text style={styles.staffClockStatusPillText}>{staffStatus}</Text>
              </View>
            </View>

            <View style={styles.staffAvatarPlaceholder}>
              <Text style={styles.staffAvatarText}>MS</Text>
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Current Status</Text>
              <View style={styles.staffClockStatusPill}>
                <Text style={styles.staffClockStatusPillText}>{staffStatus}</Text>
              </View>
            </View>

            <View style={styles.staffClockDetailList}>
              <View style={styles.staffClockDetailRow}>
                <Text style={styles.staffClockDetailLabel}>Staff status</Text>
                <Text style={styles.staffClockDetailValue}>{staffStatus}</Text>
              </View>
              <View style={styles.staffClockDetailRow}>
                <Text style={styles.staffClockDetailLabel}>Today&apos;s shift</Text>
                <Text style={styles.staffClockDetailValue}>{STAFF_MEMBER.shift}</Text>
              </View>
              <View style={styles.staffClockDetailRow}>
                <Text style={styles.staffClockDetailLabel}>Current mock time</Text>
                <Text style={styles.staffClockDetailValue}>{STAFF_CLOCK_CURRENT_TIME}</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Location Check</Text>
              <View style={styles.staffClockLocationPill}>
                <Text style={styles.staffClockLocationPillText}>{STAFF_CLOCK_LOCATION_STATUS}</Text>
              </View>
            </View>

            <Text style={styles.staffClockLocationNote}>
              Clock in is only available at Advanced Education.
            </Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Time Clock</Text>
              <Text style={styles.parentSectionHeaderSubtle}>
                {isCheckedOut ? 'Ready to clock in' : 'Ready to clock out'}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={onToggleStaffStatus}
              style={({ pressed }) => [
                styles.staffClockPrimaryButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.staffClockPrimaryButtonText}>
                {isCheckedOut ? 'Clock In' : 'Clock Out'}
              </Text>
            </Pressable>

            <View style={styles.staffClockDetailList}>
              <View style={styles.staffClockDetailRow}>
                <Text style={styles.staffClockDetailLabel}>Last clock in</Text>
                <Text style={styles.staffClockDetailValue}>
                  {lastClockInTime || 'Not logged yet'}
                </Text>
              </View>
              <View style={styles.staffClockDetailRow}>
                <Text style={styles.staffClockDetailLabel}>Last clock out</Text>
                <Text style={styles.staffClockDetailValue}>
                  {lastClockOutTime || 'Not logged yet'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Owner Review</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Pending</Text>
            </View>

            <Text style={styles.billingNote}>
              Your hours are tracked for owner review.
            </Text>
            <View style={styles.staffClockOwnerPill}>
              <Text style={styles.staffClockOwnerPillText}>Approval Status: Pending</Text>
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

function StaffBeforeAfterAttendanceScreen({
  onBack,
  onLogout,
  loading,
  error,
  attendanceChildren,
  selectedChildId,
  onSelectChild,
  pickupChild,
  authorizedPickupsLoading,
  onAction,
  onConfirmPickup,
  savingChildId,
}) {
  const getButtonState = (child, action) => {
    if (action === 'drop-off') return !!child.canDropOff;
    if (action === 'put-on-bus') return !!child.canPutOnBus;
    if (action === 'returned') return !!child.canReturned;
    if (action === 'parent-pickup') return !!child.canParentPickup;
    return false;
  };

  const getDetailValue = (value, fallback = '—') => (value ? value : fallback);

  const selectedChild =
    selectedChildId
      ? attendanceChildren.find((child) => child.id === selectedChildId) || null
      : null;

  const summaryCounts = attendanceChildren.reduce(
    (acc, child) => {
      if (child.stage >= 1) acc.droppedOff += 1;
      if (child.stage >= 2) acc.onBus += 1;
      if (child.stage >= 3) acc.returned += 1;
      if (child.stage >= 4) acc.pickedUp += 1;
      return acc;
    },
    { droppedOff: 0, onBus: 0, returned: 0, pickedUp: 0 }
  );

  const renderActionButton = (child, action, label) => {
    const enabled = getButtonState(child, action);
    const disabled = !enabled || savingChildId === child.id;

    return (
      <Pressable
        key={action}
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => onAction(child.id, action)}
        style={({ pressed }) => [
          styles.staffAttendanceActionButton,
          disabled && styles.staffAttendanceActionButtonDisabled,
          pressed && !disabled && styles.pressedButton,
        ]}
      >
      <Text
          style={[
            styles.staffAttendanceActionButtonText,
            disabled && styles.staffAttendanceActionButtonTextDisabled,
          ]}
        >
          {savingChildId === child.id ? 'Saving...' : label}
        </Text>
      </Pressable>
    );
  };

  const renderDetailRow = (label, value, fallback = '—') => (
    <View style={styles.staffAttendanceDetailRow}>
      <Text style={styles.staffAttendanceDetailLabel}>{label}</Text>
      <Text style={styles.staffAttendanceDetailValue}>{getDetailValue(value, fallback)}</Text>
    </View>
  );

  const renderStatusPill = (status) => (
    <View
      style={[
        styles.staffAttendanceStatusPill,
        status === 'Picked Up'
          ? styles.staffAttendanceStatusPillGreen
          : status === 'On Bus'
            ? styles.staffAttendanceStatusPillBlue
            : styles.staffAttendanceStatusPillOrange,
      ]}
    >
      <Text
        style={[
          styles.staffAttendanceStatusPillText,
          status === 'Picked Up'
            ? styles.staffAttendanceStatusPillTextGreen
            : status === 'On Bus'
              ? styles.staffAttendanceStatusPillTextBlue
              : styles.staffAttendanceStatusPillTextOrange,
        ]}
      >
        {status}
      </Text>
    </View>
  );

  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.staffClockHero}>
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

            <Text style={styles.childProfileHeaderLabel}>Before & After Care Attendance</Text>
          </View>

          <View style={styles.staffHeroMain}>
            <View style={styles.staffHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Staff: Ms. Sarah</Text>
              <Text style={styles.staffHeroSubheading}>School-year attendance</Text>
            </View>

            <View style={styles.staffAvatarPlaceholder}>
              <Text style={styles.staffAvatarText}>MS</Text>
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Today&apos;s B&amp;A Summary</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Current counts</Text>
            </View>

            <View style={styles.staffAttendanceSummaryGrid}>
              <View style={styles.staffAttendanceSummaryItem}>
                <Text style={styles.staffAttendanceSummaryValue}>{summaryCounts.droppedOff}</Text>
                <Text style={styles.staffAttendanceSummaryLabel}>Dropped Off</Text>
              </View>
              <View style={styles.staffAttendanceSummaryItem}>
                <Text style={styles.staffAttendanceSummaryValue}>{summaryCounts.onBus}</Text>
                <Text style={styles.staffAttendanceSummaryLabel}>On Bus</Text>
              </View>
              <View style={styles.staffAttendanceSummaryItem}>
                <Text style={styles.staffAttendanceSummaryValue}>{summaryCounts.returned}</Text>
                <Text style={styles.staffAttendanceSummaryLabel}>Returned From Bus</Text>
              </View>
              <View style={styles.staffAttendanceSummaryItem}>
                <Text style={styles.staffAttendanceSummaryValue}>{summaryCounts.pickedUp}</Text>
                <Text style={styles.staffAttendanceSummaryLabel}>Picked Up</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>B&amp;A Student List</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Tap a child</Text>
            </View>

            <View style={styles.staffAttendanceList}>
              {loading ? (
                <Text style={styles.parentAttendanceStateText}>
                  Loading before & after care students...
                </Text>
              ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : attendanceChildren.length ? (
                attendanceChildren.map((child) => {
                const isSelected = child.id === selectedChild?.id;
                const theme = getChildGroupTheme(child.accentGroup);

                return (
                  <View key={child.id} style={styles.staffAttendanceItemWrap}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => onSelectChild(child.id)}
                      style={({ pressed }) => [
                        styles.staffAttendanceCard,
                        isSelected && styles.staffAttendanceCardSelected,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <View style={styles.staffAttendanceCardTopRow}>
                        <View style={styles.staffAttendanceNameBlock}>
                          <Text style={styles.staffAttendanceName}>{child.name}</Text>
                          <Text style={styles.staffAttendanceTime}>
                            Last update: {formatTime(child.lastUpdateTime)}
                          </Text>
                        </View>
                        {renderStatusPill(child.status)}
                      </View>

                        <View style={styles.staffAttendanceMiniRow}>
                          <View
                            style={[
                              styles.staffAttendanceAccentPill,
                            {
                              backgroundColor: theme.soft,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <Text style={[styles.staffAttendanceAccentText, { color: theme.accent }]}>
                            {child.accentGroup || 'Before & After Care'}
                          </Text>
                        </View>
                        <Text style={styles.staffAttendanceMiniMeta}>
                          {isSelected
                            ? 'Expanded below'
                            : `Manage · Total today: ${formatMinutes(child.totalMinutes)}`}
                        </Text>
                        </View>
                      </Pressable>

                      {isSelected ? (
                        <View style={styles.staffAttendanceExpandedPanel}>
                        <View style={styles.staffAttendanceExpandedHeader}>
                          <Text style={styles.staffAttendanceExpandedTitle}>{child.name}</Text>
                          {renderStatusPill(child.status)}
                        </View>

                        <View style={styles.staffAttendanceDetailList}>
                          {renderDetailRow('Drop Off Time', formatTime(child.dropOffTime))}
                          {renderDetailRow('Put On Bus Time', formatTime(child.busTime))}
                          {renderDetailRow('Morning Time in Class', formatMinutes(child.morningMinutes))}
                          {renderDetailRow('Returned Time', formatTime(child.returnedTime))}
                          {renderDetailRow('Parent Pickup Time', formatTime(child.pickupTime))}
                          {renderDetailRow('Afternoon Time in Class', formatMinutes(child.afternoonMinutes))}
                          {renderDetailRow('Total Time Today', formatMinutes(child.totalMinutes))}
                        </View>

                        <View style={styles.staffAttendanceActionsRow}>
                          {renderActionButton(child, 'drop-off', 'Parent Drop Off')}
                          {renderActionButton(child, 'put-on-bus', 'Put On Bus')}
                          {renderActionButton(child, 'returned', 'Returned')}
                          {renderActionButton(child, 'parent-pickup', 'Parent Pickup')}
                        </View>

                        {pickupChild && pickupChild.id === child.id ? (
                          <View style={styles.profileCardInner}>
                            <View style={styles.parentSectionHeaderRow}>
                              <Text style={styles.parentSectionHeaderTitle}>Authorized Pickups</Text>
                              <View style={styles.staffAttendanceStatusPill}>
                                <Text style={styles.staffAttendanceStatusPillText}>Review</Text>
                              </View>
                            </View>

                            <Text style={styles.staffAttendancePreviewName}>{pickupChild.name}</Text>
                            <Text style={styles.staffAttendancePreviewNote}>
                              Confirm pickup details before releasing this child.
                            </Text>

                            <View style={styles.staffAttendancePreviewList}>
                              {authorizedPickupsLoading ? (
                                <Text style={styles.staffAttendancePreviewValue}>
                                  Loading pickups...
                                </Text>
                              ) : pickupChild.authorizedPickups?.length ? (
                                pickupChild.authorizedPickups.map((pickup) => (
                                  <View key={pickup.id} style={styles.staffAttendancePreviewBlock}>
                                    <Text style={styles.staffAttendancePreviewLabel}>
                                      {pickup.full_name}
                                    </Text>
                                    <Text style={styles.staffAttendancePreviewValue}>
                                      {pickup.relationship}
                                    </Text>
                                    <Text style={styles.staffAttendancePreviewValue}>
                                      {pickup.phone_number}
                                    </Text>
                                    {pickup.notes ? (
                                      <Text style={styles.staffAttendancePreviewValue}>
                                        {pickup.notes}
                                      </Text>
                                    ) : null}
                                  </View>
                                ))
                              ) : (
                                <Text style={styles.staffAttendancePreviewValue}>
                                  No authorized pickups on file.
                                </Text>
                              )}
                            </View>

                            <Pressable
                              accessibilityRole="button"
                              onPress={onConfirmPickup}
                              style={({ pressed }) => [
                                styles.staffAttendanceConfirmButton,
                                pressed && styles.pressedButton,
                              ]}
                            >
                              <Text style={styles.staffAttendanceConfirmButtonText}>
                                Confirm Pickup
                              </Text>
                            </Pressable>
                          </View>
                        ) : null}
                        </View>
                      ) : null}
                    </View>
                );
                })
              ) : (
                <Text style={styles.parentAttendanceStateText}>
                  No active before & after care students found.
                </Text>
              )}
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

function StaffSummerCampGroupCheckInScreen({
  onBack,
  onLogout,
  groups,
  selectedGroup,
  onSelectGroup,
  onConfirmPresent,
  onSendHeadcount,
  ownerStatus,
  loading,
  error,
  savingChildId,
  sendingGroup,
}) {
  const roster = groups[selectedGroup] || [];
  const theme = getChildGroupTheme(selectedGroup);
  const ownerCheckedInRoster = roster.filter((child) => child.checkInStatus === 'Checked In');
  const confirmedCount = ownerCheckedInRoster.filter(
    (child) => child.groupConfirmationStatus === 'Confirmed Present'
  ).length;
  const missingChildren = ownerCheckedInRoster.filter(
    (child) => child.groupConfirmationStatus !== 'Confirmed Present'
  );

  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.staffClockHero}>
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

            <Text style={styles.childProfileHeaderLabel}>Summer Camp Group Check-In</Text>
          </View>

          <View style={styles.staffHeroMain}>
            <View style={styles.staffHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Staff: Ms. Sarah</Text>
              <Text style={styles.staffHeroSubheading}>Summer camp workflow</Text>
            </View>

            <View style={styles.staffAvatarPlaceholder}>
              <Text style={styles.staffAvatarText}>MS</Text>
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Choose Assigned Group</Text>
              <Text style={styles.parentSectionHeaderSubtle}>
                Counselors confirm after owner check-in
              </Text>
            </View>

            <View style={styles.staffCampGroupButtonRow}>
              {STAFF_CAMP_GROUP_NAMES.map((groupName) => {
                const groupTheme = getChildGroupTheme(groupName);
                const selected = selectedGroup === groupName;

                return (
                  <Pressable
                    key={groupName}
                    accessibilityRole="button"
                    disabled={loading}
                    onPress={() => onSelectGroup(groupName)}
                    style={({ pressed }) => [
                      styles.staffCampGroupButton,
                      {
                        backgroundColor: selected ? groupTheme.soft : COLORS.background,
                        borderColor: selected ? groupTheme.border : COLORS.border,
                      },
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.staffCampGroupButtonText,
                        { color: groupTheme.accent },
                      ]}
                    >
                      {groupName.replace(' Group', '')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Campers Ready for Headcount</Text>
              <Text style={styles.parentSectionHeaderSubtle}>
                {ownerStatus[selectedGroup]?.ownerCheckedInCount ?? ownerCheckedInRoster.length}{' '}
                owner check-ins ready
              </Text>
            </View>

            <View style={styles.staffCampSummaryRow}>
              <View style={[styles.staffCampSummaryPill, { backgroundColor: theme.soft }]}>
                <Text style={[styles.staffCampSummaryLabel, { color: theme.accent }]}>
                  Owner Checked In
                </Text>
                <Text style={styles.staffCampSummaryValue}>
                  {ownerStatus[selectedGroup]?.ownerCheckedInCount ?? ownerCheckedInRoster.length}
                </Text>
              </View>
              <View style={[styles.staffCampSummaryPill, { backgroundColor: COLORS.softGreen }]}>
                <Text style={[styles.staffCampSummaryLabel, { color: COLORS.success }]}>
                  Counselor Confirmed
                </Text>
                <Text style={styles.staffCampSummaryValue}>{confirmedCount}</Text>
              </View>
            </View>

            <View style={styles.staffCampRosterList}>
              {ownerCheckedInRoster.map((child) => {
                const confirmed = child.groupConfirmationStatus === 'Confirmed Present';
                const groupTheme = theme;

                return (
                  <View key={child.id} style={styles.staffCampChildCard}>
                    <View style={styles.staffCampChildCardTopRow}>
                      <View style={styles.staffCampChildNameBlock}>
                        <Text style={styles.staffCampChildName}>{child.name}</Text>
                        <Text style={styles.staffCampChildTime}>
                          Checked in: {formatTime(child.checkedInAt || child.lastUpdateTime)}
                        </Text>
                      </View>

                      <View style={styles.staffCampStatusStack}>
                        <View style={styles.staffCampStatusPillBlue}>
                          <Text style={styles.staffCampStatusPillTextBlue}>
                            Owner Checked In
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.staffCampStatusPill,
                            {
                              backgroundColor: confirmed ? COLORS.softGreen : COLORS.softOrange,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.staffCampStatusPillText,
                              { color: confirmed ? COLORS.success : '#C2410C' },
                            ]}
                          >
                            {child.groupConfirmationStatus}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.childProfileGroupBadge,
                        {
                          backgroundColor: groupTheme.soft,
                          borderColor: groupTheme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.childProfileGroupBadgeText,
                          { color: groupTheme.accent },
                        ]}
                      >
                        {selectedGroup}
                      </Text>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      disabled={confirmed || savingChildId === child.id}
                      onPress={() => onConfirmPresent(selectedGroup, child.id)}
                      style={({ pressed }) => [
                        styles.staffCampConfirmButton,
                        (confirmed || savingChildId === child.id) &&
                          styles.staffCampConfirmButtonDisabled,
                        pressed && !confirmed && savingChildId !== child.id && styles.pressedButton,
                      ]}
                    >
                      <Text style={styles.staffCampConfirmButtonText}>
                        {savingChildId === child.id
                          ? 'Confirming...'
                          : confirmed
                            ? 'Confirmed'
                            : 'Confirm Present'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            {!ownerCheckedInRoster.length ? (
              <Text style={styles.staffCampOwnerUpdate}>
                No campers have been checked in by the owner for this group yet.
              </Text>
            ) : null}
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Summer Camp Headcount</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Counselor confirmation</Text>
            </View>

            <Text style={styles.staffCampHeadcountValue}>
              Confirmed: {confirmedCount} / {ownerCheckedInRoster.length}
            </Text>

            <View style={styles.staffCampMissingBlock}>
              <Text style={styles.staffCampMissingLabel}>Missing / Not Confirmed</Text>
              <Text style={styles.staffCampMissingValue}>
                {missingChildren.length ? missingChildren.map((child) => child.name).join(', ') : 'None'}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={sendingGroup === selectedGroup}
              onPress={() => onSendHeadcount(selectedGroup)}
              style={({ pressed }) => [
                styles.staffCampSendButton,
                sendingGroup === selectedGroup && styles.staffCampConfirmButtonDisabled,
                pressed && sendingGroup !== selectedGroup && styles.pressedButton,
              ]}
            >
              <Text style={styles.staffCampSendButtonText}>
                {sendingGroup === selectedGroup ? 'Sending...' : 'Send Headcount to Owner'}
              </Text>
            </Pressable>

            <Text style={styles.staffCampOwnerUpdate}>
              {ownerStatus[selectedGroup]?.status === 'submitted'
                ? `Headcount submitted at ${formatDateTime(ownerStatus[selectedGroup].submittedAt)}.`
                : ownerStatus[selectedGroup]?.status === 'discrepancy'
                  ? `Headcount sent with discrepancy at ${formatDateTime(
                      ownerStatus[selectedGroup].submittedAt
                    )}.`
                  : 'Headcount not sent yet.'}
            </Text>
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

function OwnerParentsScreen({ onBack, onLogout, onShowComingSoon }) {
  const parentsAccent = OWNER_MODULE_COLORS.Parents;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [openParentId, setOpenParentId] = useState(null);

  const filterPills = ['All', 'Active', 'Pending Invite'];

  const parents = [
    {
      id: 'avery-parent',
      name: 'Avery Parent',
      childCount: '1 Child',
      status: 'Active Account',
      statusTone: 'green',
      email: 'avery.parent@example.com',
      phone: '(555) 201-4801',
      children: ['Mia Carter'],
      programs: ['Before & After Care', 'Summer Camp'],
      inviteStatus: 'Active Account',
      lastLogin: 'Today at 7:42 AM',
      emergencyContactStatus: 'Confirmed',
      filterKey: 'Active',
    },
    {
      id: 'dana-wilson',
      name: 'Dana Wilson',
      childCount: '2 Children',
      status: 'Active Account',
      statusTone: 'green',
      email: 'dana.wilson@example.com',
      phone: '(555) 201-4802',
      children: ['Liam Wilson', 'Ava Wilson'],
      programs: ['Before & After Care'],
      inviteStatus: 'Active Account',
      lastLogin: 'Yesterday at 5:18 PM',
      emergencyContactStatus: 'Confirmed',
      filterKey: 'Active',
    },
    {
      id: 'jordan-davis',
      name: 'Jordan Davis',
      childCount: '1 Child',
      status: 'Active Account',
      statusTone: 'green',
      email: 'jordan.davis@example.com',
      phone: '(555) 201-4803',
      children: ['Emma Davis'],
      programs: ['Summer Camp'],
      inviteStatus: 'Active Account',
      lastLogin: 'Today at 8:05 AM',
      emergencyContactStatus: 'Confirmed',
      filterKey: 'Active',
    },
    {
      id: 'taylor-brown',
      name: 'Taylor Brown',
      childCount: '1 Child',
      status: 'Pending Invite',
      statusTone: 'orange',
      email: 'taylor.brown@example.com',
      phone: '(555) 201-4804',
      children: ['Noah Brown'],
      programs: ['Before & After Care'],
      inviteStatus: 'Pending Invite',
      lastLogin: 'Not yet logged in',
      emergencyContactStatus: 'On file',
      filterKey: 'Pending Invite',
    },
  ];

  const visibleParents = parents.filter((parent) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      parent.name.toLowerCase().includes(query) ||
      parent.children.some((child) => child.toLowerCase().includes(query));
    const matchesFilter =
      activeFilter === 'All' || parent.filterKey === activeFilter;
    return matchesQuery && matchesFilter;
  });

  const badgeToneStyles = {
    green: styles.ownerStudentBadgeGreen,
    orange: styles.ownerStudentBadgeOrange,
    purple: styles.ownerStudentBadgePurple,
  };

  return (
    <View style={styles.page}>
      <View style={styles.ownerParentsHero}>
        <View style={styles.heroOrbLarge} />
        <View style={styles.heroOrbSmall} />

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

          <Text style={styles.childProfileHeaderLabel}>Parents</Text>
        </View>

        <View style={styles.ownerDashboardHeroCopy}>
          <Text style={styles.ownerDashboardEyebrow}>Advanced Education</Text>
          <Text style={styles.shellHeroTitle}>Parents</Text>
          <Text style={styles.shellHeroSubtitle}>Manage parent accounts</Text>
          <View
            style={[
              styles.shellHeroPill,
              styles.ownerParentsHeroPill,
              { marginTop: 10 },
            ]}
          >
            <Text style={styles.ownerParentsHeroPillText}>Owner Access</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentStack}>
          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Parent Summary</Text>
            <View style={[styles.ownerSectionDetailsGrid, { marginTop: 14 }]}>
              {[
                { title: 'Total Parent Accounts', value: '38' },
                { title: 'Active Accounts', value: '35' },
                { title: 'Pending Invites', value: '3' },
              ].map((card) => (
                <SummaryTile
                  key={card.title}
                  accent="purple"
                  badge={card.title.charAt(0)}
                  title={card.title}
                  value={card.value}
                  note="Center-wide totals"
                  fill="Owner"
                />
              ))}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Search & Filter</Text>
            <TextInput
              placeholder="Search parent or child..."
              placeholderTextColor={COLORS.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.ownerSearchInput}
            />

            <View style={styles.ownerFilterPillRow}>
              {filterPills.map((pill) => {
                const isActive = activeFilter === pill;
                return (
                  <Pressable
                    key={pill}
                    accessibilityRole="button"
                    onPress={() => setActiveFilter(pill)}
                    style={({ pressed }) => [
                      styles.ownerFilterPill,
                      isActive && styles.ownerFilterPillActive,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ownerFilterPillText,
                        isActive && styles.ownerFilterPillTextActive,
                      ]}
                    >
                      {pill}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Parent Directory</Text>
            <View style={styles.ownerParentList}>
              {visibleParents.map((parent) => {
                const isOpen = openParentId === parent.id;
                const childLabel = parent.childCount;
                const toneStyle = badgeToneStyles[parent.statusTone] || styles.ownerStudentBadgePurple;

                return (
                  <View key={parent.id} style={styles.ownerParentCard}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        setOpenParentId((current) => (current === parent.id ? null : parent.id))
                      }
                      style={({ pressed }) => [
                        styles.ownerParentCardHeader,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <View style={styles.ownerParentHeaderTextBlock}>
                        <Text style={styles.ownerParentName}>{parent.name}</Text>
                        <Text style={styles.ownerParentChildCount}>{childLabel}</Text>
                      </View>

                      <View style={styles.ownerParentHeaderRight}>
                        <View style={[styles.ownerStudentBadge, toneStyle]}>
                          <Text style={styles.ownerStudentBadgeText}>{parent.status}</Text>
                        </View>
                        <Text style={styles.ownerNavChevron}>{isOpen ? '⌃' : '›'}</Text>
                      </View>
                    </Pressable>

                    {isOpen ? (
                      <View style={styles.ownerParentExpandedContent}>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Parent email</Text>
                          <Text style={styles.ownerParentDetailValue}>{parent.email}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Phone number</Text>
                          <Text style={styles.ownerParentDetailValue}>{parent.phone}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Children linked</Text>
                          <Text style={styles.ownerParentDetailValue}>{parent.children.join(', ')}</Text>
                        </View>
                        <View style={styles.ownerParentChipRow}>
                          {parent.programs.map((program) => (
                            <View key={program} style={styles.ownerParentProgramChip}>
                              <Text style={styles.ownerParentProgramChipText}>{program}</Text>
                            </View>
                          ))}
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Invite status</Text>
                          <Text style={styles.ownerParentDetailValue}>{parent.inviteStatus}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Last login</Text>
                          <Text style={styles.ownerParentDetailValue}>{parent.lastLogin}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Emergency contact status</Text>
                          <Text style={styles.ownerParentDetailValue}>
                            {parent.emergencyContactStatus}
                          </Text>
                        </View>

                        <View style={styles.ownerParentActionList}>
                          {[
                            'View Children',
                            'Send Message',
                            'Resend Invite',
                            'View Billing',
                          ].map((label) => (
                            <OwnerNavCard
                              key={label}
                              accentColor={parentsAccent}
                              title={label}
                              subtitle="Coming Soon"
                              onPress={() => onShowComingSoon(label)}
                            />
                          ))}
                        </View>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Owner Parent Actions</Text>
            <View style={styles.ownerActionButtonStack}>
              {['Add Parent', 'Send Parent Invite', 'Parent Account Report'].map((label) => (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  onPress={() => onShowComingSoon(label)}
                  style={({ pressed }) => [
                    styles.actionCard,
                    pressed && styles.pressedTile,
                  ]}
                >
                  <View style={[styles.actionAccent, { backgroundColor: parentsAccent }]} />
                  <View style={styles.actionCardBody}>
                    <Text style={styles.actionTitle}>{label}</Text>
                    <Text style={styles.actionNote}>Coming Soon</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
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
 
/*
function OwnerMessagesScreen({
  onBack,
  onLogout,
  currentUserId,
  expandedRecentMessageId,
  onToggleRecentMessage,
}) {
  const messagesAccent = OWNER_MODULE_COLORS.Messages;
  const [selectedAudienceType, setSelectedAudienceType] = useState('all_parents');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedMessageType, setSelectedMessageType] = useState('announcement');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [activeParents, setActiveParents] = useState([]);
  const [activeStaff, setActiveStaff] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState('');
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentMessagesLoading, setRecentMessagesLoading] = useState(true);
  const [recentMessagesError, setRecentMessagesError] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendMessageError, setSendMessageError] = useState('');

  const recipientAudienceOptions = [
    { value: 'all_parents', label: 'All Parents' },
    { value: 'all_staff', label: 'All Staff' },
    { value: 'one_parent', label: 'One Parent' },
    { value: 'one_staff', label: 'One Staff' },
  ];

  const messageTypeOptions = [
    { value: 'announcement', label: 'announcement' },
    { value: 'reminder', label: 'reminder' },
    { value: 'camp_update', label: 'camp_update' },
    { value: 'emergency', label: 'emergency' },
  ];

  const loadActiveProfiles = useCallback(async () => {
    setProfilesLoading(true);
    setProfilesError('');

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, account_status')
      .eq('account_status', 'active')
      .in('role', ['parent', 'staff']);

    if (error) {
      setActiveParents([]);
      setActiveStaff([]);
      setProfilesError(error.message || 'Could not load recipients.');
      setProfilesLoading(false);
      return;
    }

    const rows = Array.isArray(data) ? data : [];
    setActiveParents(rows.filter((row) => row.role === 'parent'));
    setActiveStaff(rows.filter((row) => row.role === 'staff'));
    setProfilesLoading(false);
  }, []);

  const loadRecentMessages = useCallback(async () => {
    setRecentMessagesLoading(true);
    setRecentMessagesError('');

    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_profile_id, title, body, message_type, audience_type, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      setRecentMessages([]);
      setRecentMessagesError(error.message || 'Could not load messages.');
      setRecentMessagesLoading(false);
      return;
    }

    const rows = Array.isArray(data) ? data : [];
    setRecentMessages(rows);
    setRecentMessagesLoading(false);
  }, []);

  useEffect(() => {
    loadActiveProfiles();
    loadRecentMessages();
  }, [loadActiveProfiles, loadRecentMessages]);

  const handleAudienceTypeChange = (audienceType) => {
    setSelectedAudienceType(audienceType);
    setSendMessageError('');

    if (audienceType !== 'one_parent') {
      setSelectedParentId('');
    }

    if (audienceType !== 'one_staff') {
      setSelectedStaffId('');
    }
  };

  const handleSendMessage = async () => {
    const cleanTitle = messageTitle.trim();
    const cleanBody = messageBody.trim();

    if (!currentUserId) {
      setSendMessageError('No owner session found.');
      return;
    }

    if (!cleanTitle || !cleanBody) {
      setSendMessageError('Title and message body are required.');
      return;
    }

    let recipientIds = [];

    if (selectedAudienceType === 'all_parents') {
      recipientIds = activeParents.map((profile) => profile.id);
    } else if (selectedAudienceType === 'all_staff') {
      recipientIds = activeStaff.map((profile) => profile.id);
    } else if (selectedAudienceType === 'one_parent') {
      if (!selectedParentId) {
        setSendMessageError('Select a parent recipient.');
        return;
      }
      recipientIds = [selectedParentId];
    } else if (selectedAudienceType === 'one_staff') {
      if (!selectedStaffId) {
        setSendMessageError('Select a staff recipient.');
        return;
      }
      recipientIds = [selectedStaffId];
    }

    if (!recipientIds.length) {
      setSendMessageError('No active recipients found.');
      return;
    }

    setSendingMessage(true);
    setSendMessageError('');

    try {
      const { data: messageRow, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_profile_id: currentUserId,
          title: cleanTitle,
          body: cleanBody,
          message_type: selectedMessageType,
          audience_type: selectedAudienceType,
        })
        .select('id')
        .single();

      if (messageError || !messageRow) {
        throw new Error(messageError?.message || 'Could not send message.');
      }

      const deliveredAt = new Date().toISOString();
      const recipientRows = recipientIds.map((recipientId) => ({
        message_id: messageRow.id,
        recipient_profile_id: recipientId,
        delivered_at: deliveredAt,
      }));

      const { error: recipientsError } = await supabase
        .from('message_recipients')
        .insert(recipientRows);

      if (recipientsError) {
        throw new Error(recipientsError.message || 'Could not save recipients.');
      }

      Alert.alert('Message sent.');
      setMessageTitle('');
      setMessageBody('');
      setSelectedAudienceType('all_parents');
      setSelectedParentId('');
      setSelectedStaffId('');
      setSelectedMessageType('announcement');
      await loadRecentMessages();
    } catch (sendError) {
      const message = sendError?.message || 'Could not send message.';
      setSendMessageError(message);
      Alert.alert('Could not send message.', message);
    } finally {
      setSendingMessage(false);
    }
  };

  const renderRecipientSelection = () => {
    if (selectedAudienceType === 'one_parent') {
      return (
        <View style={styles.ownerMessageRecipientSection}>
          <Text style={styles.ownerChipGroupLabel}>Select Parent</Text>
          {profilesLoading ? (
            <Text style={styles.ownerMessagesStateText}>Loading recipients...</Text>
          ) : null}
          {!profilesLoading && activeParents.length === 0 ? (
            <Text style={styles.ownerMessagesStateText}>No active parents found.</Text>
          ) : null}
          <View style={styles.ownerMessageRecipientList}>
            {activeParents.map((profile) => {
              const isActive = selectedParentId === profile.id;

              return (
                <Pressable
                  key={profile.id}
                  accessibilityRole="button"
                  onPress={() => setSelectedParentId(profile.id)}
                  style={({ pressed }) => [
                    styles.ownerMessageRecipientCard,
                    isActive && styles.ownerMessageRecipientCardActive,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text style={styles.ownerMessageRecipientEmail}>{profile.email}</Text>
                  <Text
                    style={[
                      styles.ownerMessageRecipientRole,
                      isActive && styles.ownerMessageRecipientRoleActive,
                    ]}
                  >
                    Parent
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    if (selectedAudienceType === 'one_staff') {
      return (
        <View style={styles.ownerMessageRecipientSection}>
          <Text style={styles.ownerChipGroupLabel}>Select Staff</Text>
          {profilesLoading ? (
            <Text style={styles.ownerMessagesStateText}>Loading recipients...</Text>
          ) : null}
          {!profilesLoading && activeStaff.length === 0 ? (
            <Text style={styles.ownerMessagesStateText}>No active staff found.</Text>
          ) : null}
          <View style={styles.ownerMessageRecipientList}>
            {activeStaff.map((profile) => {
              const isActive = selectedStaffId === profile.id;

              return (
                <Pressable
                  key={profile.id}
                  accessibilityRole="button"
                  onPress={() => setSelectedStaffId(profile.id)}
                  style={({ pressed }) => [
                    styles.ownerMessageRecipientCard,
                    isActive && styles.ownerMessageRecipientCardActive,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text style={styles.ownerMessageRecipientEmail}>{profile.email}</Text>
                  <Text
                    style={[
                      styles.ownerMessageRecipientRole,
                      isActive && styles.ownerMessageRecipientRoleActive,
                    ]}
                  >
                    Staff
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.page}>
      <View style={styles.ownerMessagesHero}>
        <View style={styles.heroOrbLarge} />
        <View style={styles.heroOrbSmall} />

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

          <Text style={styles.childProfileHeaderLabel}>Messages</Text>
        </View>

        <View style={styles.ownerDashboardHeroCopy}>
          <Text style={styles.ownerDashboardEyebrow}>Advanced Education</Text>
          <Text style={styles.shellHeroTitle}>Messages</Text>
          <Text style={styles.shellHeroSubtitle}>Center-wide communication</Text>
          <View
            style={[
              styles.shellHeroPill,
              styles.ownerMessagesHeroPill,
              { marginTop: 10 },
            ]}
          >
            <Text style={styles.ownerMessagesHeroPillText}>Owner Access</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.contentStack}>
          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Message Summary</Text>
            <View style={[styles.ownerSectionDetailsGrid, { marginTop: 14 }]}>
              {[
                { title: 'All Parents', value: String(activeParents.length) },
                { title: 'All Staff', value: String(activeStaff.length) },
                { title: 'Recent Messages', value: String(recentMessages.length) },
                { title: 'Drafts', value: '0' },
              ].map((card) => (
                <SummaryTile
                  key={card.title}
                  accent="blue"
                  badge={card.title.charAt(0)}
                  title={card.title}
                  value={card.value}
                  note="Center-wide totals"
                  fill=\"Owner\"\n                />\n              ))}\n            </View>\n          </View>\n\n          <View style={styles.ownerAccordionCard}>\n            <Text style={styles.ownerAccordionTitle}>Send New Message</Text>\n            <Text style={styles.ownerAccordionSummary}>Pick recipients and a message type</Text>\n\n            {profilesError ? <Text style={styles.ownerMessagesErrorText}>{profilesError}</Text> : null}\n            {sendMessageError ? <Text style={styles.ownerMessagesErrorText}>{sendMessageError}</Text> : null}\n\n            <View style={styles.ownerChipGroup}>\n              <Text style={styles.ownerChipGroupLabel}>Recipients</Text>\n              <View style={styles.ownerFilterPillRow}>\n                {recipientAudienceOptions.map((option) => {\n                  const isActive = selectedAudienceType === option.value;\n\n                  return (\n                    <Pressable\n                      key={option.value}\n                      accessibilityRole=\"button\"\n                      onPress={() => handleAudienceTypeChange(option.value)}\n                      style={({ pressed }) => [\n                        styles.ownerFilterPill,\n                        isActive && styles.ownerFilterPillActive,\n                        pressed && styles.pressedButton,\n                      ]}\n                    >\n                      <Text\n                        style={[\n                          styles.ownerFilterPillText,\n                          isActive && styles.ownerFilterPillTextActive,\n                        ]}\n                      >\n                        {option.label}\n                      </Text>\n                    </Pressable>\n                  );\n                })}\n              </View>\n            </View>\n\n            {renderRecipientSelection()}\n\n            <View style={styles.ownerChipGroup}>\n              <Text style={styles.ownerChipGroupLabel}>Title</Text>\n              <TextInput\n                placeholder=\"Message title\"\n                placeholderTextColor={COLORS.muted}\n                value={messageTitle}\n                onChangeText={setMessageTitle}\n                style={styles.ownerTitleInput}\n              />\n            </View>\n\n            <View style={styles.ownerChipGroup}>\n              <Text style={styles.ownerChipGroupLabel}>Message Type</Text>\n              <View style={styles.ownerFilterPillRow}>\n                {messageTypeOptions.map((option) => {\n                  const isActive = selectedMessageType === option.value;\n                  return (\n                    <Pressable\n                      key={option.value}\n                      accessibilityRole=\"button\"\n                      onPress={() => setSelectedMessageType(option.value)}\n                      style={({ pressed }) => [\n                        styles.ownerFilterPill,\n                        isActive && styles.ownerFilterPillActive,\n                        pressed && styles.pressedButton,\n                      ]}\n                    >\n                      <Text\n                        style={[\n                          styles.ownerFilterPillText,\n                          isActive && styles.ownerFilterPillTextActive,\n                        ]}\n                      >\n                        {option.label}\n                      </Text>\n                    </Pressable>\n                  );\n                })}\n              </View>\n            </View>\n\n            <TextInput\n              placeholder=\"Write a message...\"\n              placeholderTextColor={COLORS.muted}\n              value={messageBody}\n              onChangeText={setMessageBody}\n              multiline\n              style={styles.ownerMessageInput}\n            />\n\n            <Pressable\n              accessibilityRole=\"button\"\n              disabled={sendingMessage}\n              onPress={handleSendMessage}\n              style={({ pressed }) => [\n                styles.primaryButton,\n                { backgroundColor: messagesAccent },\n                pressed && !sendingMessage && styles.pressedButton,\n                sendingMessage && styles.ownerMessageSendDisabled,\n              ]}\n            >\n              <Text style={styles.primaryButtonText}>\n                {sendingMessage ? 'Sending...' : 'Send Message'}\n              </Text>\n            </Pressable>\n          </View>\n\n          <View style={styles.ownerAccordionCard}>\n            <Text style={styles.ownerAccordionTitle}>Recent Messages</Text>\n            {recentMessagesLoading ? (\n              <Text style={styles.ownerMessagesStateText}>Loading messages...</Text>\n            ) : null}\n            {recentMessagesError ? (\n              <Text style={styles.ownerMessagesErrorText}>{recentMessagesError}</Text>\n            ) : null}\n            {!recentMessagesLoading && recentMessages.length === 0 ? (\n              <Text style={styles.ownerMessagesStateText}>No messages yet.</Text>\n            ) : null}\n            <View style={styles.ownerRecentMessageList}>\n              {recentMessages.map((message) => (\n                <View key={message.id} style={styles.ownerRecentMessageCard}>\n                  <View style={styles.ownerRecentMessageTopRow}>\n                    <View style={styles.ownerRecentMessageTextBlock}>\n                      <Text style={styles.ownerRecentMessageTitle}>{message.title}</Text>\n                      <Text style={styles.ownerRecentMessageAudience}>\n                        Sent to {formatAudienceLabel(message.audience_type)}\n                      </Text>\n                    </View>\n                    <View style={[styles.ownerRecentMessageBadge, { backgroundColor: messagesAccent }]}>\n                      <Text style={styles.ownerRecentMessageBadgeText}>\n                        {formatMessageTypeLabel(message.message_type)}\n                      </Text>\n                    </View>\n                  </View>\n                  <Text style={styles.ownerRecentMessageTime}>\n                    {formatMessageDateTime(message.created_at)}\n                  </Text>\n                </View>\n              ))}\n            </View>\n          </View>\n\n          <View style={styles.ownerAccordionCard}>\n            <Text style={styles.ownerAccordionTitle}>Communication Notes</Text>\n            <Text style={styles.ownerCommunicationNote}>\n              Messages sent here are stored in Supabase with recipient rows for the selected audience.\n            </Text>\n          </View>\n\n          <Pressable\n            accessibilityRole=\"button\"\n            onPress={onLogout}\n            style={({ pressed }) => [\n              styles.primaryButton,\n              styles.logoutButton,\n              pressed && styles.pressedButton,\n            ]}\n          >\n            <Text style={styles.primaryButtonText}>Logout</Text>\n          </Pressable>\n        </View>\n      </ScrollView>\n    </View>\n  );\n}\n*** End Patch
*/

function OwnerMessagesScreen({
  onBack,
  onLogout,
  currentUserId,
  expandedRecentMessageId,
  onToggleRecentMessage,
}) {
  const messagesAccent = OWNER_MODULE_COLORS.Messages;
  const [selectedAudienceType, setSelectedAudienceType] = useState('all_parents');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedMessageType, setSelectedMessageType] = useState('announcement');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [activeParents, setActiveParents] = useState([]);
  const [activeStaff, setActiveStaff] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState('');
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentMessagesLoading, setRecentMessagesLoading] = useState(true);
  const [recentMessagesError, setRecentMessagesError] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendMessageError, setSendMessageError] = useState('');

  const recipientAudienceOptions = [
    { value: 'all_parents', label: 'All Parents' },
    { value: 'all_staff', label: 'All Staff' },
    { value: 'one_parent', label: 'One Parent' },
    { value: 'one_staff', label: 'One Staff' },
  ];

  const messageTypeOptions = [
    { value: 'announcement', label: 'announcement' },
    { value: 'reminder', label: 'reminder' },
    { value: 'camp_update', label: 'camp_update' },
    { value: 'emergency', label: 'emergency' },
  ];

  const loadActiveProfiles = useCallback(async () => {
    setProfilesLoading(true);
    setProfilesError('');

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, account_status')
      .eq('account_status', 'active')
      .in('role', ['parent', 'staff']);

    if (error) {
      setActiveParents([]);
      setActiveStaff([]);
      setProfilesError(error.message || 'Could not load recipients.');
      setProfilesLoading(false);
      return;
    }

    const rows = Array.isArray(data) ? data : [];
    setActiveParents(rows.filter((row) => row.role === 'parent'));
    setActiveStaff(rows.filter((row) => row.role === 'staff'));
    setProfilesLoading(false);
  }, []);

  const loadRecentMessages = useCallback(async () => {
    setRecentMessagesLoading(true);
    setRecentMessagesError('');

    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, sender_profile_id, title, body, message_type, audience_type, created_at')
        .order('created_at', { ascending: false });

      if (messagesError) {
        throw new Error(messagesError.message || 'Could not load messages.');
      }

      const messageRows = Array.isArray(messagesData) ? messagesData : [];
      const messageIds = messageRows.map((message) => message.id).filter(Boolean);

      if (!messageIds.length) {
        setRecentMessages([]);
        return;
      }

      const { data: recipientData, error: recipientError } = await supabase
        .from('message_recipients')
        .select('id, message_id, recipient_profile_id, delivered_at, read_at')
        .in('message_id', messageIds);

      if (recipientError) {
        throw new Error(recipientError.message || 'Could not load message receipts.');
      }

      const recipientRows = Array.isArray(recipientData) ? recipientData : [];
      const recipientIds = Array.from(
        new Set(recipientRows.map((recipient) => recipient.recipient_profile_id).filter(Boolean))
      );

      let profilesById = {};

      if (recipientIds.length) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', recipientIds);

        if (profileError) {
          throw new Error(profileError.message || 'Could not load recipient profiles.');
        }

        profilesById = (Array.isArray(profileData) ? profileData : []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
      }

      const recipientsByMessageId = recipientRows.reduce((acc, recipient) => {
        if (!acc[recipient.message_id]) {
          acc[recipient.message_id] = [];
        }

        const profile = profilesById[recipient.recipient_profile_id];
        acc[recipient.message_id].push({
          id: recipient.id,
          email: profile?.email || recipient.recipient_profile_id || 'Unknown Recipient',
          readAt: recipient.read_at,
          deliveredAt: recipient.delivered_at,
        });
        return acc;
      }, {});

      setRecentMessages(
        messageRows.map((message) => {
          const recipients = recipientsByMessageId[message.id] || [];
          const readCount = recipients.filter((recipient) => Boolean(recipient.readAt)).length;
          const totalRecipients = recipients.length;

          return {
            ...message,
            recipients,
            totalRecipients,
            readCount,
            unreadCount: Math.max(totalRecipients - readCount, 0),
          };
        })
      );
    } catch (loadError) {
      setRecentMessages([]);
      setRecentMessagesError(loadError?.message || 'Could not load messages.');
    } finally {
      setRecentMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActiveProfiles();
    loadRecentMessages();
  }, [loadActiveProfiles, loadRecentMessages]);

  const handleAudienceTypeChange = (audienceType) => {
    setSelectedAudienceType(audienceType);
    setSendMessageError('');

    if (audienceType !== 'one_parent') {
      setSelectedParentId('');
    }

    if (audienceType !== 'one_staff') {
      setSelectedStaffId('');
    }
  };

  const handleSendMessage = async () => {
    const cleanTitle = messageTitle.trim();
    const cleanBody = messageBody.trim();

    if (!currentUserId) {
      setSendMessageError('No owner session found.');
      return;
    }

    if (!cleanTitle || !cleanBody) {
      setSendMessageError('Title and message body are required.');
      return;
    }

    let recipientIds = [];

    if (selectedAudienceType === 'all_parents') {
      recipientIds = activeParents.map((profile) => profile.id);
    } else if (selectedAudienceType === 'all_staff') {
      recipientIds = activeStaff.map((profile) => profile.id);
    } else if (selectedAudienceType === 'one_parent') {
      if (!selectedParentId) {
        setSendMessageError('Select a parent recipient.');
        return;
      }
      recipientIds = [selectedParentId];
    } else if (selectedAudienceType === 'one_staff') {
      if (!selectedStaffId) {
        setSendMessageError('Select a staff recipient.');
        return;
      }
      recipientIds = [selectedStaffId];
    }

    if (!recipientIds.length) {
      setSendMessageError('No active recipients found.');
      return;
    }

    setSendingMessage(true);
    setSendMessageError('');

    try {
      const { data: messageRow, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_profile_id: currentUserId,
          title: cleanTitle,
          body: cleanBody,
          message_type: selectedMessageType,
          audience_type: selectedAudienceType,
        })
        .select('id')
        .single();

      if (messageError || !messageRow) {
        throw new Error(messageError?.message || 'Could not send message.');
      }

      const deliveredAt = new Date().toISOString();
      const recipientRows = recipientIds.map((recipientId) => ({
        message_id: messageRow.id,
        recipient_profile_id: recipientId,
        delivered_at: deliveredAt,
      }));

      const { error: recipientsError } = await supabase
        .from('message_recipients')
        .insert(recipientRows);

      if (recipientsError) {
        throw new Error(recipientsError.message || 'Could not save recipients.');
      }

      Alert.alert('Message sent.');
      setMessageTitle('');
      setMessageBody('');
      setSelectedAudienceType('all_parents');
      setSelectedParentId('');
      setSelectedStaffId('');
      setSelectedMessageType('announcement');
      await loadRecentMessages();
    } catch (sendError) {
      const message = sendError?.message || 'Could not send message.';
      setSendMessageError(message);
      Alert.alert('Could not send message.', message);
    } finally {
      setSendingMessage(false);
    }
  };

  const renderRecipientSelection = () => {
    if (selectedAudienceType === 'one_parent') {
      return (
        <View style={styles.ownerMessageRecipientSection}>
          <Text style={styles.ownerChipGroupLabel}>Select Parent</Text>
          {profilesLoading ? (
            <Text style={styles.ownerMessagesStateText}>Loading recipients...</Text>
          ) : null}
          {!profilesLoading && activeParents.length === 0 ? (
            <Text style={styles.ownerMessagesStateText}>No active parents found.</Text>
          ) : null}
          <View style={styles.ownerMessageRecipientList}>
            {activeParents.map((profile) => {
              const isActive = selectedParentId === profile.id;

              return (
                <Pressable
                  key={profile.id}
                  accessibilityRole="button"
                  onPress={() => setSelectedParentId(profile.id)}
                  style={({ pressed }) => [
                    styles.ownerMessageRecipientCard,
                    isActive && styles.ownerMessageRecipientCardActive,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text style={styles.ownerMessageRecipientEmail}>{profile.email}</Text>
                  <Text
                    style={[
                      styles.ownerMessageRecipientRole,
                      isActive && styles.ownerMessageRecipientRoleActive,
                    ]}
                  >
                    Parent
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    if (selectedAudienceType === 'one_staff') {
      return (
        <View style={styles.ownerMessageRecipientSection}>
          <Text style={styles.ownerChipGroupLabel}>Select Staff</Text>
          {profilesLoading ? (
            <Text style={styles.ownerMessagesStateText}>Loading recipients...</Text>
          ) : null}
          {!profilesLoading && activeStaff.length === 0 ? (
            <Text style={styles.ownerMessagesStateText}>No active staff found.</Text>
          ) : null}
          <View style={styles.ownerMessageRecipientList}>
            {activeStaff.map((profile) => {
              const isActive = selectedStaffId === profile.id;

              return (
                <Pressable
                  key={profile.id}
                  accessibilityRole="button"
                  onPress={() => setSelectedStaffId(profile.id)}
                  style={({ pressed }) => [
                    styles.ownerMessageRecipientCard,
                    isActive && styles.ownerMessageRecipientCardActive,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text style={styles.ownerMessageRecipientEmail}>{profile.email}</Text>
                  <Text
                    style={[
                      styles.ownerMessageRecipientRole,
                      isActive && styles.ownerMessageRecipientRoleActive,
                    ]}
                  >
                    Staff
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.page}>
      <View style={styles.ownerMessagesHero}>
        <View style={styles.heroOrbLarge} />
        <View style={styles.heroOrbSmall} />

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

          <Text style={styles.childProfileHeaderLabel}>Messages</Text>
        </View>

        <View style={styles.ownerDashboardHeroCopy}>
          <Text style={styles.ownerDashboardEyebrow}>Advanced Education</Text>
          <Text style={styles.shellHeroTitle}>Messages</Text>
          <Text style={styles.shellHeroSubtitle}>Center-wide communication</Text>
          <View
            style={[
              styles.shellHeroPill,
              styles.ownerMessagesHeroPill,
              { marginTop: 10 },
            ]}
          >
            <Text style={styles.ownerMessagesHeroPillText}>Owner Access</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.contentStack}>
          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Message Summary</Text>
            <View style={[styles.ownerSectionDetailsGrid, { marginTop: 14 }]}>
              {[
                { title: 'All Parents', value: String(activeParents.length) },
                { title: 'All Staff', value: String(activeStaff.length) },
                { title: 'Recent Messages', value: String(recentMessages.length) },
                { title: 'Drafts', value: '0' },
              ].map((card) => (
                <SummaryTile
                  key={card.title}
                  accent="blue"
                  badge={card.title.charAt(0)}
                  title={card.title}
                  value={card.value}
                  note="Center-wide totals"
                  fill="Owner"
                />
              ))}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Send New Message</Text>
            <Text style={styles.ownerAccordionSummary}>Pick recipients and a message type</Text>

            {profilesError ? <Text style={styles.ownerMessagesErrorText}>{profilesError}</Text> : null}
            {sendMessageError ? <Text style={styles.ownerMessagesErrorText}>{sendMessageError}</Text> : null}

            <View style={styles.ownerChipGroup}>
              <Text style={styles.ownerChipGroupLabel}>Recipients</Text>
              <View style={styles.ownerFilterPillRow}>
                {recipientAudienceOptions.map((option) => {
                  const isActive = selectedAudienceType === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      onPress={() => handleAudienceTypeChange(option.value)}
                      style={({ pressed }) => [
                        styles.ownerFilterPill,
                        isActive && styles.ownerFilterPillActive,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.ownerFilterPillText,
                          isActive && styles.ownerFilterPillTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {renderRecipientSelection()}

            <View style={styles.ownerChipGroup}>
              <Text style={styles.ownerChipGroupLabel}>Title</Text>
              <TextInput
                placeholder="Message title"
                placeholderTextColor={COLORS.muted}
                value={messageTitle}
                onChangeText={setMessageTitle}
                style={styles.ownerTitleInput}
              />
            </View>

            <View style={styles.ownerChipGroup}>
              <Text style={styles.ownerChipGroupLabel}>Message Type</Text>
              <View style={styles.ownerFilterPillRow}>
                {messageTypeOptions.map((option) => {
                  const isActive = selectedMessageType === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      onPress={() => setSelectedMessageType(option.value)}
                      style={({ pressed }) => [
                        styles.ownerFilterPill,
                        isActive && styles.ownerFilterPillActive,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.ownerFilterPillText,
                          isActive && styles.ownerFilterPillTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <TextInput
              placeholder="Write a message..."
              placeholderTextColor={COLORS.muted}
              value={messageBody}
              onChangeText={setMessageBody}
              multiline
              style={styles.ownerMessageInput}
            />

            <Pressable
              accessibilityRole="button"
              disabled={sendingMessage}
              onPress={handleSendMessage}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: messagesAccent },
                pressed && !sendingMessage && styles.pressedButton,
                sendingMessage && styles.ownerMessageSendDisabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Recent Messages</Text>
            {recentMessagesLoading ? (
              <Text style={styles.ownerMessagesStateText}>Loading messages...</Text>
            ) : null}
            {recentMessagesError ? (
              <Text style={styles.ownerMessagesErrorText}>{recentMessagesError}</Text>
            ) : null}
            {!recentMessagesLoading && recentMessages.length === 0 ? (
              <Text style={styles.ownerMessagesStateText}>No messages yet.</Text>
            ) : null}
            <View style={styles.ownerRecentMessageList}>
              {recentMessages.map((message) => (
                <Pressable
                  key={message.id}
                  accessibilityRole="button"
                  onPress={() => onToggleRecentMessage(message.id)}
                  style={({ pressed }) => [
                    styles.ownerRecentMessageCard,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <View style={styles.ownerRecentMessageTopRow}>
                    <View style={styles.ownerRecentMessageTextBlock}>
                      <Text style={styles.ownerRecentMessageTitle}>{message.title}</Text>
                      <Text style={styles.ownerRecentMessageAudience}>
                        Sent to {formatAudienceLabel(message.audience_type)}
                      </Text>
                    </View>
                    <View style={[styles.ownerRecentMessageBadge, { backgroundColor: messagesAccent }]}>
                      <Text style={styles.ownerRecentMessageBadgeText}>
                        {formatMessageTypeLabel(message.message_type)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.ownerRecentMessageTime}>
                    {formatMessageDateTime(message.created_at)}
                  </Text>

                  <View style={styles.ownerRecentMessageReceiptRow}>
                    <Text style={styles.ownerRecentMessageReceiptText}>
                      Read: {message.readCount} / {message.totalRecipients}
                    </Text>
                    <Text style={styles.ownerRecentMessageReceiptText}>
                      Unread: {message.unreadCount}
                    </Text>
                  </View>

                  {expandedRecentMessageId === message.id ? (
                    <View style={styles.ownerRecentMessageExpandedBody}>
                      <Text style={styles.ownerRecentMessageExpandedLabel}>Message</Text>
                      <Text style={styles.ownerRecentMessageExpandedMessage}>{message.body}</Text>

                      <Text style={styles.ownerRecentMessageExpandedLabel}>Recipients</Text>
                      {message.recipients.length ? (
                        <View style={styles.ownerRecentMessageRecipientList}>
                          {message.recipients.map((recipient) => (
                            <View key={recipient.id} style={styles.ownerRecentMessageRecipientRow}>
                              <Text style={styles.ownerRecentMessageRecipientEmail}>
                                {recipient.email}
                              </Text>
                              <Text
                                style={[
                                  styles.ownerRecentMessageRecipientStatus,
                                  recipient.readAt
                                    ? styles.ownerRecentMessageRecipientStatusRead
                                    : styles.ownerRecentMessageRecipientStatusUnread,
                                ]}
                              >
                                {recipient.readAt ? 'Read' : 'Unread'}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.ownerMessagesStateText}>No recipients found.</Text>
                      )}
                    </View>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Communication Notes</Text>
            <Text style={styles.ownerCommunicationNote}>
              Messages sent here are stored in Supabase with recipient rows for the selected audience.
            </Text>
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

function OwnerBillingScreen({ onBack, onLogout, currentUserId }) {
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [ownerParents, setOwnerParents] = useState([]);
  const [ownerParentsLoading, setOwnerParentsLoading] = useState(true);
  const [ownerParentsError, setOwnerParentsError] = useState('');
  const [ownerChildren, setOwnerChildren] = useState([]);
  const [ownerChildrenLoading, setOwnerChildrenLoading] = useState(false);
  const [ownerChildrenError, setOwnerChildrenError] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [billingSuccess, setBillingSuccess] = useState('');
  const [billingForm, setBillingForm] = useState({
    billingPeriodStart: '',
    billingPeriodEnd: '',
    dueDate: '',
    description: '',
    quantity: '1',
    rate: '',
    status: 'pending',
  });

  const loadOwnerBillingInvoices = useCallback(async () => {
    if (!currentUserId) {
      setInvoices([]);
      setInvoicesError('');
      setInvoicesLoading(false);
      return;
    }

    setInvoicesLoading(true);
    setInvoicesError('');

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', currentUserId)
        .single();

      if (profileError || !profile || profile.role !== 'owner') {
        setInvoices([]);
        return;
      }

      const { data: invoicesData, error: invoicesQueryError } = await supabase
        .from('invoices')
        .select(
          'id, invoice_number, parent_profile_id, child_id, billing_period_start, billing_period_end, subtotal, total, status, due_date, created_at'
        )
        .order('created_at', { ascending: false });

      if (invoicesQueryError) {
        throw new Error(invoicesQueryError.message || 'Could not load invoices.');
      }

      const rawInvoices = Array.isArray(invoicesData) ? invoicesData : [];
      const parentIds = Array.from(
        new Set(rawInvoices.map((invoice) => invoice.parent_profile_id).filter(Boolean))
      );
      const childIds = Array.from(
        new Set(rawInvoices.map((invoice) => invoice.child_id).filter(Boolean))
      );
      const invoiceIds = Array.from(new Set(rawInvoices.map((invoice) => invoice.id).filter(Boolean)));

      const [invoiceParentsResult, invoiceChildrenResult, invoiceLineItemsResult] = await Promise.all([
        parentIds.length
          ? supabase.from('profiles').select('id, email').in('id', parentIds)
          : Promise.resolve({ data: [], error: null }),
        childIds.length
          ? supabase
              .from('children')
              .select('id, first_name, last_name')
              .in('id', childIds)
          : Promise.resolve({ data: [], error: null }),
        invoiceIds.length
          ? supabase
              .from('invoice_line_items')
              .select('id, invoice_id, description, quantity, rate, amount')
              .in('invoice_id', invoiceIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (invoiceParentsResult.error) {
        throw new Error(invoiceParentsResult.error.message || 'Could not load parent profiles.');
      }

      if (invoiceChildrenResult.error) {
        throw new Error(invoiceChildrenResult.error.message || 'Could not load children.');
      }

      if (invoiceLineItemsResult.error) {
        throw new Error(
          invoiceLineItemsResult.error.message || 'Could not load invoice line items.'
        );
      }

      const parentById = (Array.isArray(invoiceParentsResult.data)
        ? invoiceParentsResult.data
        : []
      ).reduce((acc, parent) => {
        acc[parent.id] = parent;
        return acc;
      }, {});

      const childById = (Array.isArray(invoiceChildrenResult.data)
        ? invoiceChildrenResult.data
        : []
      ).reduce((acc, child) => {
        acc[child.id] = child;
        return acc;
      }, {});

      const lineItemByInvoiceId = (Array.isArray(invoiceLineItemsResult.data)
        ? invoiceLineItemsResult.data
        : []
      ).reduce((acc, item) => {
        if (!acc[item.invoice_id]) {
          acc[item.invoice_id] = item;
        }
        return acc;
      }, {});

      setInvoices(
        rawInvoices.map((invoice) => {
          const parent = parentById[invoice.parent_profile_id];
          const child = childById[invoice.child_id];
          const lineItem = lineItemByInvoiceId[invoice.id];

          return {
            ...invoice,
            lineItemId: lineItem?.id || '',
            description: lineItem?.description || '',
            quantity: String(lineItem?.quantity ?? ''),
            rate: String(lineItem?.rate ?? ''),
            parentEmail: parent?.email || 'Unknown parent',
            childName:
              `${child?.first_name || ''} ${child?.last_name || ''}`.trim() ||
              'Unnamed Student',
          };
        })
      );
    } catch (loadError) {
      setInvoices([]);
      setInvoicesError(loadError?.message || 'Could not load invoices.');
    } finally {
      setInvoicesLoading(false);
    }
  }, [currentUserId]);

  const loadOwnerBillingParents = useCallback(async () => {
    if (!currentUserId) {
      setOwnerParents([]);
      setOwnerParentsError('');
      setOwnerParentsLoading(false);
      return;
    }

    setOwnerParentsLoading(true);
    setOwnerParentsError('');

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', currentUserId)
        .single();

      if (profileError || !profile || profile.role !== 'owner') {
        setOwnerParents([]);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('role', 'parent')
        .eq('account_status', 'active')
        .order('email', { ascending: true });

      if (error) {
        throw new Error(error.message || 'Could not load parents.');
      }

      const parentRows = Array.isArray(data) ? data : [];
      setOwnerParents(parentRows);
      setSelectedParentId((current) =>
        current && parentRows.some((parent) => parent.id === current)
          ? current
          : parentRows[0]?.id || ''
      );
    } catch (loadError) {
      setOwnerParents([]);
      setOwnerParentsError(loadError?.message || 'Could not load parents.');
    } finally {
      setOwnerParentsLoading(false);
    }
  }, [currentUserId]);

  const loadOwnerBillingChildren = useCallback(async (parentId) => {
    if (!parentId) {
      setOwnerChildren([]);
      setOwnerChildrenError('');
      setOwnerChildrenLoading(false);
      setSelectedChildId('');
      return;
    }

    setOwnerChildrenLoading(true);
    setOwnerChildrenError('');

    try {
      const { data: links, error: linksError } = await supabase
        .from('child_parent_links')
        .select('child_id')
        .eq('parent_profile_id', parentId);

      if (linksError) {
        throw new Error(linksError.message || 'Could not load linked children.');
      }

      const childIds = Array.from(
        new Set((Array.isArray(links) ? links : []).map((link) => link.child_id).filter(Boolean))
      );

      const [{ data: activeChildrenData, error: activeChildrenError }, linkedChildrenResult] =
        await Promise.all([
          supabase
            .from('children')
            .select('id, first_name, last_name, room, status')
            .eq('status', 'active')
            .order('first_name', { ascending: true }),
          childIds.length
            ? supabase
                .from('children')
                .select('id, first_name, last_name, room, status')
                .in('id', childIds)
            : Promise.resolve({ data: [], error: null }),
        ]);

      if (activeChildrenError) {
        throw new Error(activeChildrenError.message || 'Could not load active children.');
      }

      if (linkedChildrenResult.error) {
        throw new Error(linkedChildrenResult.error.message || 'Could not load linked children.');
      }

      const linkedChildren = Array.isArray(linkedChildrenResult.data)
        ? linkedChildrenResult.data
        : [];
      const activeChildren = Array.isArray(activeChildrenData) ? activeChildrenData : [];
      const mergedChildren = Array.from(
        new Map([...linkedChildren, ...activeChildren].map((child) => [child.id, child])).values()
      ).sort((a, b) => {
        const aName = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase();
        const bName = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase();
        return aName.localeCompare(bName);
      });

      const childRows = mergedChildren;
      setOwnerChildren(childRows);
      setSelectedChildId((current) =>
        current && childRows.some((child) => child.id === current) ? current : childRows[0]?.id || ''
      );
    } catch (loadError) {
      setOwnerChildren([]);
      setOwnerChildrenError(loadError?.message || 'Could not load linked children.');
      setSelectedChildId('');
    } finally {
      setOwnerChildrenLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOwnerBillingParents();
  }, [loadOwnerBillingParents]);

  useEffect(() => {
    loadOwnerBillingInvoices();
  }, [loadOwnerBillingInvoices]);

  useEffect(() => {
    loadOwnerBillingChildren(selectedParentId);
  }, [loadOwnerBillingChildren, selectedParentId]);

  const billingSummaryCards = [
    {
      title: 'Total Outstanding',
      value: formatCurrency(
        invoices.filter((invoice) => invoice.status !== 'paid').reduce((sum, invoice) => sum + Number(invoice.total || 0), 0)
      ),
      accent: 'orange',
      note: 'Pending and overdue balances',
    },
    {
      title: 'Paid',
      value: String(invoices.filter((invoice) => invoice.status === 'paid').length),
      accent: 'green',
      note: 'Completed invoices',
    },
    {
      title: 'Pending',
      value: String(invoices.filter((invoice) => invoice.status === 'pending').length),
      accent: 'orange',
      note: 'Awaiting payment',
    },
    {
      title: 'Overdue',
      value: String(invoices.filter((invoice) => invoice.status === 'overdue').length),
      accent: 'red',
      note: 'Needs follow-up',
    },
  ];

  const filteredInvoices = invoices.filter((invoice) =>
    invoiceFilter === 'all' ? true : invoice.status === invoiceFilter
  );

  const resetForm = useCallback(() => {
    setBillingForm({
      billingPeriodStart: '',
      billingPeriodEnd: '',
      dueDate: '',
      description: '',
      quantity: '1',
      rate: '',
      status: 'pending',
    });
    setSelectedInvoiceId('');
    setSelectedChildId(ownerChildren[0]?.id || '');
  }, [ownerChildren]);

  const handleOpenCreateForm = () => {
    setBillingSuccess('');
    setSelectedInvoiceId('');
    resetForm();
    setShowCreateForm(true);
  };

  const handleCancelCreateForm = () => {
    resetForm();
    setShowCreateForm(false);
  };

  const handleOpenEditInvoice = useCallback(
    (invoice) => {
      setBillingSuccess('');
      setSelectedInvoiceId(invoice.id);
      setSelectedParentId(invoice.parent_profile_id || '');
      setSelectedChildId(invoice.child_id || '');
      setBillingForm({
        billingPeriodStart: invoice.billing_period_start || '',
        billingPeriodEnd: invoice.billing_period_end || '',
        dueDate: invoice.due_date || '',
        description: invoice.description || '',
        quantity: invoice.quantity || '1',
        rate: invoice.rate || '',
        status: invoice.status || 'pending',
      });
      setShowCreateForm(true);
    },
    []
  );

  const handleSaveInvoice = useCallback(async () => {
    if (!currentUserId || !selectedParentId || !selectedChildId) {
      Alert.alert('Select a parent and child first.');
      return;
    }

    const quantity = Number(billingForm.quantity);
    const rate = Number(billingForm.rate);

    if (!billingForm.billingPeriodStart || !billingForm.billingPeriodEnd || !billingForm.dueDate) {
      Alert.alert('Please complete all date fields.');
      return;
    }

    if (!billingForm.description.trim()) {
      Alert.alert('Please enter a description.');
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(rate) || rate <= 0) {
      Alert.alert('Quantity and rate must be greater than zero.');
      return;
    }

    setSavingInvoice(true);
    setBillingSuccess('');

    try {
      const subtotal = quantity * rate;
      const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(
        Date.now()
      ).slice(-6)}`;

      if (selectedInvoiceId) {
        const currentInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId);
        const lineItemId = currentInvoice?.lineItemId;

        const { error: invoiceError } = await supabase
          .from('invoices')
          .update({
            parent_profile_id: selectedParentId,
            child_id: selectedChildId,
            billing_period_start: billingForm.billingPeriodStart,
            billing_period_end: billingForm.billingPeriodEnd,
            subtotal,
            total: subtotal,
            status: billingForm.status || 'pending',
            due_date: billingForm.dueDate,
          })
          .eq('id', selectedInvoiceId);

        if (invoiceError) {
          throw new Error(invoiceError.message || 'Could not update invoice.');
        }

        if (lineItemId) {
          const { error: lineItemError } = await supabase
            .from('invoice_line_items')
            .update({
              description: billingForm.description.trim(),
              quantity,
              rate,
              amount: subtotal,
            })
            .eq('id', lineItemId);

          if (lineItemError) {
            throw new Error(lineItemError.message || 'Could not update invoice line item.');
          }
        } else {
          const { error: lineItemInsertError } = await supabase.from('invoice_line_items').insert({
            invoice_id: selectedInvoiceId,
            description: billingForm.description.trim(),
            quantity,
            rate,
            amount: subtotal,
          });

          if (lineItemInsertError) {
            throw new Error(
              lineItemInsertError.message || 'Could not create invoice line item.'
            );
          }
        }

        await loadOwnerBillingInvoices();
        setBillingSuccess('Invoice updated.');
        setShowCreateForm(false);
        resetForm();
        Alert.alert('Invoice updated.');
      } else {
        const { data: invoiceRow, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            parent_profile_id: selectedParentId,
            child_id: selectedChildId,
            invoice_number: invoiceNumber,
            billing_period_start: billingForm.billingPeriodStart,
            billing_period_end: billingForm.billingPeriodEnd,
            subtotal,
            total: subtotal,
            status: billingForm.status || 'pending',
            due_date: billingForm.dueDate,
            created_by_owner_id: currentUserId,
          })
          .select('id')
          .single();

        if (invoiceError || !invoiceRow?.id) {
          throw new Error(invoiceError?.message || 'Could not create invoice.');
        }

        const { error: lineItemError } = await supabase.from('invoice_line_items').insert({
          invoice_id: invoiceRow.id,
          description: billingForm.description.trim(),
          quantity,
          rate,
          amount: subtotal,
        });

        if (lineItemError) {
          throw new Error(lineItemError.message || 'Could not save invoice line item.');
        }

        await loadOwnerBillingInvoices();
        setBillingSuccess('Invoice created.');
        setShowCreateForm(false);
        resetForm();
        Alert.alert('Invoice created.');
      }
    } catch (saveError) {
      Alert.alert(
        selectedInvoiceId ? 'Could not update invoice.' : 'Could not create invoice.',
        saveError?.message || 'Try again.'
      );
    } finally {
      setSavingInvoice(false);
    }
  }, [
    billingForm.billingPeriodEnd,
    billingForm.billingPeriodStart,
    billingForm.description,
    billingForm.dueDate,
    billingForm.quantity,
    billingForm.rate,
    billingForm.status,
    currentUserId,
    invoices,
    loadOwnerBillingInvoices,
    resetForm,
    selectedChildId,
    selectedParentId,
    selectedInvoiceId,
  ]);

  const invoiceStatusFilters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Paid' },
    { key: 'overdue', label: 'Overdue' },
  ];

  const getInvoiceStatusLabel = (status) => {
    if (!status) {
      return 'Pending';
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <View style={styles.page}>
      <View style={styles.ownerBillingHero}>
        <View style={styles.heroOrbLarge} />
        <View style={styles.heroOrbSmall} />

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

        <View style={styles.ownerDashboardHeroCopy}>
          <Text style={styles.ownerDashboardEyebrow}>Advanced Education</Text>
          <Text style={styles.shellHeroTitle}>Billing</Text>
          <Text style={styles.shellHeroSubtitle}>Review balances and invoices</Text>
          <View style={[styles.shellHeroPill, styles.ownerBillingHeroPill, { marginTop: 0 }]}>
            <Text style={styles.ownerBillingHeroPillText}>Owner Access</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.contentStack}>
          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Billing Summary</Text>
            <View style={[styles.ownerSectionDetailsGrid, { marginTop: 14 }]}>
              {billingSummaryCards.map((card) => (
                <SummaryTile
                  key={card.title}
                  accent={card.accent}
                  badge={card.title.charAt(0)}
                  title={card.title}
                  value={card.value}
                  note={card.note}
                  fill="Owner"
                />
              ))}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <View style={styles.ownerSectionHeaderRow}>
              <Text style={styles.ownerAccordionTitle}>Invoices</Text>
              <Pressable
                accessibilityRole="button"
                onPress={handleOpenCreateForm}
                style={({ pressed }) => [styles.ownerCreateInvoiceButton, pressed && styles.pressedButton]}
              >
                <Text style={styles.ownerCreateInvoiceButtonText}>Create Invoice</Text>
              </Pressable>
            </View>

            <View style={styles.ownerBillingFilterRow}>
              {invoiceStatusFilters.map((filter) => {
                const active = invoiceFilter === filter.key;
                return (
                  <Pressable
                    key={filter.key}
                    accessibilityRole="button"
                    onPress={() => setInvoiceFilter(filter.key)}
                    style={({ pressed }) => [
                      styles.ownerBillingFilterPill,
                      active && styles.ownerBillingFilterPillActive,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ownerBillingFilterPillText,
                        active && styles.ownerBillingFilterPillTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {invoicesLoading ? (
              <Text style={styles.parentAttendanceStateText}>Loading invoices...</Text>
            ) : invoicesError ? (
              <Text style={styles.errorText}>{invoicesError}</Text>
            ) : filteredInvoices.length ? (
              <View style={styles.ownerInvoiceList}>
                {filteredInvoices.map((invoice) => (
                  <View key={invoice.id} style={styles.ownerInvoiceCard}>
                    <View style={styles.ownerInvoiceHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.ownerInvoiceNumber}>{invoice.invoice_number}</Text>
                        <Text style={styles.ownerInvoiceSubtitle}>{invoice.parentEmail}</Text>
                        <Text style={styles.ownerInvoiceSubtitle}>{invoice.childName}</Text>
                      </View>
                      <View
                        style={[
                          styles.ownerInvoiceStatusPill,
                          invoice.status === 'paid'
                            ? styles.ownerBillingBadgeGreen
                            : invoice.status === 'overdue'
                              ? styles.ownerBillingBadgeRed
                              : styles.ownerBillingBadgeOrange,
                        ]}
                      >
                        <Text style={styles.ownerInvoiceStatusPillText}>
                          {getInvoiceStatusLabel(invoice.status)}
                        </Text>
                      </View>
                    </View>

                      <View style={styles.ownerInvoiceDetailGrid}>
                      <View style={styles.ownerInvoiceDetailRow}>
                        <Text style={styles.ownerInvoiceDetailLabel}>Total</Text>
                        <Text style={styles.ownerInvoiceDetailValue}>
                          {formatCurrency(invoice.total)}
                        </Text>
                      </View>
                      <View style={styles.ownerInvoiceDetailRow}>
                        <Text style={styles.ownerInvoiceDetailLabel}>Due Date</Text>
                        <Text style={styles.ownerInvoiceDetailValue}>
                          {formatDate(invoice.due_date)}
                        </Text>
                      </View>
                      <View style={styles.ownerInvoiceDetailRow}>
                        <Text style={styles.ownerInvoiceDetailLabel}>Billing Period</Text>
                        <Text style={styles.ownerInvoiceDetailValue}>
                          {`${formatDate(invoice.billing_period_start)} - ${formatDate(
                            invoice.billing_period_end
                          )}`}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.ownerInvoiceCardActions}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => handleOpenEditInvoice(invoice)}
                        style={({ pressed }) => [
                          styles.ownerInvoiceActionButton,
                          pressed && styles.pressedButton,
                        ]}
                      >
                        <Text style={styles.ownerInvoiceActionButtonText}>Edit</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.parentAttendanceStateText}>No invoices yet.</Text>
            )}
          </View>

          {showCreateForm ? (
            <View style={styles.ownerAccordionCard}>
              <Text style={styles.ownerAccordionTitle}>
                {selectedInvoiceId ? 'Edit Invoice' : 'Create Invoice'}
              </Text>

              <View style={styles.ownerBillingFormSection}>
                <Text style={styles.inputLabel}>Select Parent</Text>
                {!selectedParentId ? (
                  <Text style={styles.parentAttendanceStateText}>Select a parent first</Text>
                ) : null}
                {ownerParentsLoading ? (
                  <Text style={styles.parentAttendanceStateText}>Loading parents...</Text>
                ) : ownerParentsError ? (
                  <Text style={styles.errorText}>{ownerParentsError}</Text>
                ) : ownerParents.length ? (
                  <View style={styles.ownerBillingOptionList}>
                    {ownerParents.map((parent) => {
                      const active = selectedParentId === parent.id;
                      return (
                        <Pressable
                          key={parent.id}
                          accessibilityRole="button"
                          onPress={() => setSelectedParentId(parent.id)}
                          style={({ pressed }) => [
                            styles.ownerBillingOptionCard,
                            active && styles.ownerBillingOptionCardActive,
                            pressed && styles.pressedButton,
                          ]}
                        >
                          <Text
                            style={[
                              styles.ownerBillingOptionCardLabel,
                              active && styles.ownerBillingOptionCardLabelActive,
                            ]}
                          >
                            Parent
                          </Text>
                          <Text
                            style={[
                              styles.ownerBillingOptionCardText,
                              active && styles.ownerBillingOptionCardTextActive,
                            ]}
                          >
                            {parent.email}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.parentAttendanceStateText}>No parents available.</Text>
                )}

                <Text style={styles.inputLabel}>Select Child</Text>
                {!selectedParentId ? (
                  <Text style={styles.parentAttendanceStateText}>Select a parent first</Text>
                ) : ownerChildrenLoading ? (
                  <Text style={styles.parentAttendanceStateText}>Loading children...</Text>
                ) : ownerChildrenError ? (
                  <Text style={styles.errorText}>{ownerChildrenError}</Text>
                ) : ownerChildren.length ? (
                  <View style={styles.ownerBillingOptionList}>
                    {ownerChildren.map((child) => {
                      const active = selectedChildId === child.id;
                      const childLabel =
                        `${child.first_name || ''} ${child.last_name || ''}`.trim() ||
                        'Unnamed Student';

                      return (
                        <Pressable
                          key={child.id}
                          accessibilityRole="button"
                          onPress={() => setSelectedChildId(child.id)}
                          style={({ pressed }) => [
                            styles.ownerBillingOptionCard,
                            active && styles.ownerBillingOptionCardActive,
                            pressed && styles.pressedButton,
                          ]}
                        >
                          <Text
                            style={[
                              styles.ownerBillingOptionCardLabel,
                              active && styles.ownerBillingOptionCardLabelActive,
                            ]}
                          >
                            Child
                          </Text>
                          <Text
                            style={[
                              styles.ownerBillingOptionCardText,
                              active && styles.ownerBillingOptionCardTextActive,
                            ]}
                          >
                            {childLabel}
                          </Text>
                          <Text
                            style={[
                              styles.ownerBillingOptionCardMeta,
                              active && styles.ownerBillingOptionCardMetaActive,
                            ]}
                          >
                            {child.room ? `Room ${child.room}` : 'No room listed'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.parentAttendanceStateText}>No children available.</Text>
                )}

                <Text style={styles.inputLabel}>Billing Period Start</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={(text) =>
                    setBillingForm((current) => ({ ...current, billingPeriodStart: text }))
                  }
                  placeholder="2026-06-03"
                  placeholderTextColor={COLORS.muted}
                  style={styles.input}
                  value={billingForm.billingPeriodStart}
                />

                <Text style={styles.inputLabel}>Billing Period End</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={(text) =>
                    setBillingForm((current) => ({ ...current, billingPeriodEnd: text }))
                  }
                  placeholder="2026-06-10"
                  placeholderTextColor={COLORS.muted}
                  style={styles.input}
                  value={billingForm.billingPeriodEnd}
                />

                <Text style={styles.inputLabel}>Due Date</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={(text) =>
                    setBillingForm((current) => ({ ...current, dueDate: text }))
                  }
                  placeholder="2026-06-15"
                  placeholderTextColor={COLORS.muted}
                  style={styles.input}
                  value={billingForm.dueDate}
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  autoCapitalize="sentences"
                  autoCorrect={true}
                  multiline
                  onChangeText={(text) =>
                    setBillingForm((current) => ({ ...current, description: text }))
                  }
                  placeholder="Before & After Care weekly tuition"
                  placeholderTextColor={COLORS.muted}
                  style={[styles.input, styles.ownerBillingTextArea]}
                  value={billingForm.description}
                />

                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="numeric"
                  onChangeText={(text) =>
                    setBillingForm((current) => ({ ...current, quantity: text }))
                  }
                  placeholder="1"
                  placeholderTextColor={COLORS.muted}
                  style={styles.input}
                  value={billingForm.quantity}
                />

                <Text style={styles.inputLabel}>Rate</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="decimal-pad"
                  onChangeText={(text) =>
                    setBillingForm((current) => ({ ...current, rate: text }))
                  }
                  placeholder="150.00"
                  placeholderTextColor={COLORS.muted}
                  style={styles.input}
                  value={billingForm.rate}
                />

                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.ownerBillingStatusOptionRow}>
                  {['pending', 'paid', 'overdue'].map((status) => {
                    const active = billingForm.status === status;
                    return (
                      <Pressable
                        key={status}
                        accessibilityRole="button"
                        onPress={() =>
                          setBillingForm((current) => ({ ...current, status }))
                        }
                        style={({ pressed }) => [
                          styles.ownerBillingStatusOption,
                          active && styles.ownerBillingStatusOptionActive,
                          pressed && styles.pressedButton,
                        ]}
                      >
                        <Text
                          style={[
                            styles.ownerBillingStatusOptionText,
                            active && styles.ownerBillingStatusOptionTextActive,
                          ]}
                        >
                          {getInvoiceStatusLabel(status)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.ownerInvoiceCreateActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleSaveInvoice}
                  disabled={savingInvoice}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    savingInvoice && styles.buttonDisabled,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {savingInvoice ? 'Saving...' : 'Save Invoice'}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleCancelCreateForm}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {billingSuccess ? (
            <View style={styles.ownerAccordionCard}>
              <Text style={styles.ownerCommunicationNote}>{billingSuccess}</Text>
            </View>
          ) : null}

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Payment Processing Note</Text>
            <Text style={styles.ownerCommunicationNote}>
              Payments are not processed in this prototype. Billing is review-only until payment
              processing is connected.
            </Text>
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

function OwnerCampEventsScreen({ onBack, onLogout, onShowComingSoon }) {
  const campEventsAccent = OWNER_MODULE_COLORS['Camp Events'];
  const [openEventId, setOpenEventId] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    dateTime: '',
    audience: '',
    supplies: '',
    parentMessage: '',
  });

  const eventSummaryCards = [
    { title: 'Upcoming Events', value: '4', accent: 'blue', note: 'On the calendar' },
    { title: 'This Week', value: '2', accent: 'green', note: 'Happening soon' },
    { title: 'Parent Notices Sent', value: '3', accent: 'orange', note: 'Shared with families' },
    { title: 'Draft Events', value: '1', accent: 'purple', note: 'Not published yet' },
  ];

  const upcomingEvents = [
    {
      id: 'water-day',
      title: 'Water Day',
      dateTime: 'Friday at 1:00 PM',
      audience: 'Summer Camp Parents',
      status: 'Notice Sent',
      supplies: 'Towels, sunscreen, water shoes',
      noticeStatus: 'Sent',
      groupBadges: ['Summer Camp'],
    },
    {
      id: 'field-trip',
      title: 'Field Trip',
      dateTime: 'Next Tuesday',
      audience: 'Blue and Green Groups',
      status: 'Draft',
      supplies: 'Field trip permission slips, lunches, group walkie-talkies',
      noticeStatus: 'Draft',
      groupBadges: ['Blue Group', 'Green Group'],
    },
    {
      id: 'art-project',
      title: 'Art Project',
      dateTime: 'Wednesday Morning',
      audience: 'All Camp Groups',
      status: 'Scheduled',
      supplies: 'Construction paper, glue, markers, wipes',
      noticeStatus: 'Scheduled',
      groupBadges: ['All Camp Groups'],
    },
    {
      id: 'camp-spirit-day',
      title: 'Camp Spirit Day',
      dateTime: 'Friday Morning',
      audience: 'All Camp Groups',
      status: 'Scheduled',
      supplies: 'Camp shirts, stickers, music speaker',
      noticeStatus: 'Scheduled',
      groupBadges: ['All Camp Groups'],
    },
  ];

  const statusTone = {
    'Notice Sent': styles.ownerCampBadgeGreen,
    Draft: styles.ownerCampBadgeOrange,
    Scheduled: styles.ownerCampBadgeBlue,
  };

  const handleSaveEvent = () => {
    Alert.alert('Camp event saved.');
    setEventForm({
      title: '',
      dateTime: '',
      audience: '',
      supplies: '',
      parentMessage: '',
    });
  };

  return (
    <View style={styles.page}>
      <View style={styles.ownerCampEventsHero}>
        <View style={styles.heroOrbLarge} />
        <View style={styles.heroOrbSmall} />

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

          <Text style={styles.childProfileHeaderLabel}>Camp Events</Text>
        </View>

        <View style={styles.ownerDashboardHeroCopy}>
          <Text style={styles.ownerDashboardEyebrow}>Advanced Education</Text>
          <Text style={styles.shellHeroTitle}>Camp Events</Text>
          <Text style={styles.shellHeroSubtitle}>Manage camp schedules</Text>
          <View
            style={[
              styles.shellHeroPill,
              styles.ownerCampEventsHeroPill,
              { marginTop: 10 },
            ]}
          >
            <Text style={styles.ownerCampEventsHeroPillText}>Owner Access</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentStack}>
          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Camp Event Summary</Text>
            <View style={[styles.ownerSectionDetailsGrid, { marginTop: 14 }]}>
              {eventSummaryCards.map((card) => (
                <SummaryTile
                  key={card.title}
                  accent={card.accent}
                  badge={card.title.charAt(0)}
                  title={card.title}
                  value={card.value}
                  note={card.note}
                  fill="Owner"
                />
              ))}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Upcoming Events</Text>
            <View style={styles.ownerParentList}>
              {upcomingEvents.map((event) => {
                const isOpen = openEventId === event.id;

                return (
                  <View key={event.id} style={styles.ownerParentCard}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        setOpenEventId((current) => (current === event.id ? null : event.id))
                      }
                      style={({ pressed }) => [
                        styles.ownerParentCardHeader,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <View style={styles.ownerParentHeaderTextBlock}>
                        <Text style={styles.ownerParentName}>{event.title}</Text>
                        <Text style={styles.ownerParentChildCount}>{event.dateTime}</Text>
                      </View>

                      <View style={styles.ownerParentHeaderRight}>
                        <View style={[styles.ownerCampStatusPill, statusTone[event.status] || styles.ownerCampBadgeOrange]}>
                          <Text style={styles.ownerCampStatusPillText}>{event.status}</Text>
                        </View>
                        <Text style={styles.ownerNavChevron}>{isOpen ? '⌃' : '›'}</Text>
                      </View>
                    </Pressable>

                    {isOpen ? (
                      <View style={styles.ownerParentExpandedContent}>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Event title</Text>
                          <Text style={styles.ownerParentDetailValue}>{event.title}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Date / Time</Text>
                          <Text style={styles.ownerParentDetailValue}>{event.dateTime}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Audience</Text>
                          <Text style={styles.ownerParentDetailValue}>{event.audience}</Text>
                        </View>

                        <View style={styles.ownerParentChipRow}>
                          {event.groupBadges.map((badge) => (
                            <View key={badge} style={styles.ownerParentProgramChip}>
                              <Text style={styles.ownerParentProgramChipText}>{badge}</Text>
                            </View>
                          ))}
                        </View>

                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Supplies needed</Text>
                          <Text style={styles.ownerParentDetailValue}>{event.supplies}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Parent notice status</Text>
                          <Text style={styles.ownerParentDetailValue}>{event.noticeStatus}</Text>
                        </View>

                        <View style={styles.ownerParentActionList}>
                          {['Edit Event', 'Send Parent Notice', 'Add to Timeline'].map((label) => (
                            <OwnerNavCard
                              key={label}
                              accentColor={campEventsAccent}
                              title={label}
                              subtitle="Coming Soon"
                              onPress={() => onShowComingSoon(label)}
                            />
                          ))}
                        </View>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Create Event</Text>
            <View style={styles.ownerEventForm}>
              {[
                ['Event Title', 'title'],
                ['Date / Time', 'dateTime'],
                ['Audience', 'audience'],
                ['Supplies Needed', 'supplies'],
                ['Parent Message', 'parentMessage'],
              ].map(([label, key]) => (
                <View key={key} style={styles.ownerEventField}>
                  <Text style={styles.ownerEventFieldLabel}>{label}</Text>
                  <TextInput
                    placeholder={label}
                    placeholderTextColor={COLORS.muted}
                    value={eventForm[key]}
                    onChangeText={(value) =>
                      setEventForm((current) => ({ ...current, [key]: value }))
                    }
                    style={[
                      styles.ownerMessageInput,
                      { minHeight: key === 'parentMessage' ? 120 : 52, marginTop: 0 },
                    ]}
                  />
                </View>
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleSaveEvent}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: campEventsAccent },
                pressed && styles.pressedButton,
                { marginTop: 14 },
              ]}
            >
              <Text style={styles.primaryButtonText}>Save Camp Event</Text>
            </Pressable>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Camp Event Notes</Text>
            <Text style={styles.ownerCommunicationNote}>
              Camp events will eventually appear in Parent Summer Camp, Parent Notifications, and
              Child Timeline.
            </Text>
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

function OwnerInviteCodesScreen({ onBack, onLogout, onShowComingSoon }) {
  const inviteAccent = OWNER_MODULE_COLORS['Invite Codes'];
  const [selectedType, setSelectedType] = useState('Parent');
  const [generatedCode, setGeneratedCode] = useState('PARENT-4821');
  const [openInviteId, setOpenInviteId] = useState(null);
  const [generatedType, setGeneratedType] = useState('Parent');

  const [parentForm, setParentForm] = useState({
    child: 'Mia Carter',
    email: 'avery.parent@example.com',
    accessLevel: 'Parent View Only',
  });
  const [staffForm, setStaffForm] = useState({
    name: 'Ms. Sarah',
    email: 'ms.sarah@example.com',
    accessLevel: 'Staff Workspace',
  });

  const inviteSummaryCards = [
    { title: 'Active Parent Codes', value: '35', accent: 'blue', note: 'In use' },
    { title: 'Active Staff Codes', value: '12', accent: 'green', note: 'In use' },
    { title: 'Pending Invites', value: '5', accent: 'orange', note: 'Waiting' },
    { title: 'Expired Codes', value: '2', accent: 'red', note: 'Archived' },
  ];

  const inviteCards = [
    {
      id: 'avery',
      name: 'Avery Parent',
      type: 'Parent',
      childOrRole: 'Mia Carter',
      status: 'Active',
      code: 'MIA-4821',
      email: 'avery.parent@example.com',
      createdDate: 'May 24',
    },
    {
      id: 'dana',
      name: 'Dana Wilson',
      type: 'Parent',
      childOrRole: 'Liam Wilson',
      status: 'Pending',
      code: 'LIAM-7310',
      email: 'dana.wilson@example.com',
      createdDate: 'May 26',
    },
    {
      id: 'sarah',
      name: 'Ms. Sarah',
      type: 'Staff',
      childOrRole: 'Counselor',
      status: 'Active',
      code: 'STAFF-9142',
      email: 'ms.sarah@example.com',
      createdDate: 'May 20',
    },
    {
      id: 'james',
      name: 'Mr. James',
      type: 'Staff',
      childOrRole: 'Bus / After Care',
      status: 'Pending',
      code: 'STAFF-5520',
      email: 'mr.james@example.com',
      createdDate: 'May 28',
    },
  ];

  const typeToneStyles = {
    Parent: styles.ownerInviteBadgeBlue,
    Staff: styles.ownerInviteBadgeTeal,
  };

  const statusToneStyles = {
    Active: styles.ownerInviteBadgeGreen,
    Pending: styles.ownerInviteBadgeOrange,
  };

  const handleGenerateCode = () => {
    const nextCode = selectedType === 'Parent' ? 'PARENT-4821' : 'STAFF-9142';
    setGeneratedCode(nextCode);
    setGeneratedType(selectedType);
    Alert.alert('Invite code generated.');
  };

  return (
    <View style={styles.page}>
      <View style={styles.ownerInviteCodesHero}>
        <View style={styles.heroOrbLarge} />
        <View style={styles.heroOrbSmall} />

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

          <Text style={styles.childProfileHeaderLabel}>Invite Codes</Text>
        </View>

        <View style={styles.ownerDashboardHeroCopy}>
          <Text style={styles.ownerDashboardEyebrow}>Advanced Education</Text>
          <Text style={styles.shellHeroTitle}>Invite Codes</Text>
          <Text style={styles.shellHeroSubtitle}>Create parent and staff access</Text>
          <View
            style={[
              styles.shellHeroPill,
              styles.ownerInviteCodesHeroPill,
              { marginTop: 10 },
            ]}
          >
            <Text style={styles.ownerInviteCodesHeroPillText}>Owner Access</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentStack}>
          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Invite Summary</Text>
            <View style={[styles.ownerSectionDetailsGrid, { marginTop: 14 }]}>
              {inviteSummaryCards.map((card) => (
                <SummaryTile
                  key={card.title}
                  accent={card.accent}
                  badge={card.title.charAt(0)}
                  title={card.title}
                  value={card.value}
                  note={card.note}
                  fill="Owner"
                />
              ))}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Generate Invite Code</Text>

            <View style={styles.ownerChipGroup}>
              <Text style={styles.ownerChipGroupLabel}>Type</Text>
              <View style={styles.ownerFilterPillRow}>
                {['Parent', 'Staff'].map((type) => {
                  const isActive = selectedType === type;
                  return (
                    <Pressable
                      key={type}
                      accessibilityRole="button"
                      onPress={() => setSelectedType(type)}
                      style={({ pressed }) => [
                        styles.ownerFilterPill,
                        isActive && styles.ownerFilterPillActive,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.ownerFilterPillText,
                          isActive && styles.ownerFilterPillTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {selectedType === 'Parent' ? (
              <View style={styles.ownerEventForm}>
                <View style={styles.ownerEventField}>
                  <Text style={styles.ownerEventFieldLabel}>Select Child</Text>
                  <TextInput
                    placeholder="Select Child"
                    placeholderTextColor={COLORS.muted}
                    value={parentForm.child}
                    onChangeText={(value) =>
                      setParentForm((current) => ({ ...current, child: value }))
                    }
                    style={styles.ownerMessageInput}
                  />
                </View>
                <View style={styles.ownerEventField}>
                  <Text style={styles.ownerEventFieldLabel}>Parent Email</Text>
                  <TextInput
                    placeholder="Parent Email"
                    placeholderTextColor={COLORS.muted}
                    value={parentForm.email}
                    onChangeText={(value) =>
                      setParentForm((current) => ({ ...current, email: value }))
                    }
                    style={styles.ownerMessageInput}
                  />
                </View>
                <View style={styles.ownerEventField}>
                  <Text style={styles.ownerEventFieldLabel}>Access Level</Text>
                  <TextInput
                    placeholder="Parent View Only"
                    placeholderTextColor={COLORS.muted}
                    value={parentForm.accessLevel}
                    onChangeText={(value) =>
                      setParentForm((current) => ({ ...current, accessLevel: value }))
                    }
                    style={styles.ownerMessageInput}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.ownerEventForm}>
                <View style={styles.ownerEventField}>
                  <Text style={styles.ownerEventFieldLabel}>Staff Name</Text>
                  <TextInput
                    placeholder="Staff Name"
                    placeholderTextColor={COLORS.muted}
                    value={staffForm.name}
                    onChangeText={(value) =>
                      setStaffForm((current) => ({ ...current, name: value }))
                    }
                    style={styles.ownerMessageInput}
                  />
                </View>
                <View style={styles.ownerEventField}>
                  <Text style={styles.ownerEventFieldLabel}>Staff Email</Text>
                  <TextInput
                    placeholder="Staff Email"
                    placeholderTextColor={COLORS.muted}
                    value={staffForm.email}
                    onChangeText={(value) =>
                      setStaffForm((current) => ({ ...current, email: value }))
                    }
                    style={styles.ownerMessageInput}
                  />
                </View>
                <View style={styles.ownerEventField}>
                  <Text style={styles.ownerEventFieldLabel}>Access Level</Text>
                  <TextInput
                    placeholder="Staff Workspace"
                    placeholderTextColor={COLORS.muted}
                    value={staffForm.accessLevel}
                    onChangeText={(value) =>
                      setStaffForm((current) => ({ ...current, accessLevel: value }))
                    }
                    style={styles.ownerMessageInput}
                  />
                </View>
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={handleGenerateCode}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: inviteAccent },
                pressed && styles.pressedButton,
                { marginTop: 14 },
              ]}
            >
              <Text style={styles.primaryButtonText}>Generate Code</Text>
            </Pressable>

            <View style={styles.ownerInviteGeneratedBlock}>
              <Text style={styles.ownerInviteGeneratedLabel}>Generated Code</Text>
              <Text style={styles.ownerInviteGeneratedCode}>{generatedCode}</Text>
              <Text style={styles.ownerInviteGeneratedMeta}>
                {generatedType} invite prepared for owner use.
              </Text>
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Pending Invites</Text>
            <View style={styles.ownerParentList}>
              {inviteCards.map((invite) => {
                const isOpen = openInviteId === invite.id;

                return (
                  <View key={invite.id} style={styles.ownerParentCard}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        setOpenInviteId((current) => (current === invite.id ? null : invite.id))
                      }
                      style={({ pressed }) => [
                        styles.ownerParentCardHeader,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <View style={styles.ownerParentHeaderTextBlock}>
                        <Text style={styles.ownerParentName}>{invite.name}</Text>
                        <Text style={styles.ownerParentChildCount}>
                          {invite.type} · {invite.childOrRole}
                        </Text>
                      </View>

                      <View style={styles.ownerParentHeaderRight}>
                        <View
                          style={[
                            styles.ownerInviteStatusPill,
                            typeToneStyles[invite.type] || styles.ownerInviteBadgeBlue,
                            statusToneStyles[invite.status] || styles.ownerInviteBadgeOrange,
                          ]}
                        >
                          <Text style={styles.ownerInviteStatusPillText}>{invite.status}</Text>
                        </View>
                        <Text style={styles.ownerNavChevron}>{isOpen ? '⌃' : '›'}</Text>
                      </View>
                    </Pressable>

                    {isOpen ? (
                      <View style={styles.ownerParentExpandedContent}>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Recipient name</Text>
                          <Text style={styles.ownerParentDetailValue}>{invite.name}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Email</Text>
                          <Text style={styles.ownerParentDetailValue}>{invite.email}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Type</Text>
                          <Text style={styles.ownerParentDetailValue}>{invite.type}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Linked child or staff role</Text>
                          <Text style={styles.ownerParentDetailValue}>{invite.childOrRole}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Code</Text>
                          <Text style={styles.ownerParentDetailValue}>{invite.code}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Status</Text>
                          <Text style={styles.ownerParentDetailValue}>{invite.status}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Created date</Text>
                          <Text style={styles.ownerParentDetailValue}>{invite.createdDate}</Text>
                        </View>

                        <View style={styles.ownerParentActionList}>
                          {['Send Code', 'Copy Code', 'Revoke Code'].map((label) => (
                            <OwnerNavCard
                              key={label}
                              accentColor={inviteAccent}
                              title={label}
                              subtitle="Coming Soon"
                              onPress={() => onShowComingSoon(label)}
                            />
                          ))}
                        </View>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Invite Rules</Text>
            <View style={styles.ownerInviteRulesList}>
              {[
                'Parent codes only open that parent’s child profile.',
                'Staff codes only open staff workspace.',
                'Owner codes should not be shared.',
                'Codes can be revoked by the owner.',
              ].map((rule) => (
                <View key={rule} style={styles.ownerInviteRuleRow}>
                  <View style={[styles.ownerInviteRuleDot, { backgroundColor: inviteAccent }]} />
                  <Text style={styles.ownerInviteRuleText}>{rule}</Text>
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

function OwnerReportsScreen({ onBack, onLogout, onShowComingSoon }) {
  const reportsAccent = OWNER_MODULE_COLORS.Reports;
  const [openReportId, setOpenReportId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('This Week');

  const reportSummaryCards = [
    { title: 'Attendance Records', value: '128', accent: 'blue', note: 'All attendance logs' },
    { title: 'Billing Reports', value: '14', accent: 'orange', note: 'Balances and invoices' },
    { title: 'Staff Hour Reports', value: '6', accent: 'green', note: 'Time review queue' },
    { title: 'Camp Headcount Reports', value: '8', accent: 'purple', note: 'Camp totals' },
  ];

  const reports = [
    {
      id: 'ba-attendance',
      title: 'Before & After Care Attendance',
      description: 'Daily drop-off, bus, return, and pickup records',
      dateRange: 'May 27 - June 1',
      lastGenerated: 'Today at 9:15 AM',
      status: 'Ready',
    },
    {
      id: 'camp-headcounts',
      title: 'Summer Camp Headcounts',
      description: 'Group confirmation and owner check-in totals',
      dateRange: 'This Week',
      lastGenerated: 'Today at 8:45 AM',
      status: 'Ready',
    },
    {
      id: 'staff-hours',
      title: 'Staff Hours',
      description: 'Clock-in/out records and owner review status',
      dateRange: 'May 27 - June 1',
      lastGenerated: 'Yesterday at 6:00 PM',
      status: 'Pending Review',
    },
    {
      id: 'billing-summary',
      title: 'Billing Summary',
      description: 'Pending, paid, and overdue balances',
      dateRange: 'This Month',
      lastGenerated: 'Today at 7:30 AM',
      status: 'Ready',
    },
    {
      id: 'daily-notes',
      title: 'Daily Notes',
      description: 'Notes submitted by staff for parent review',
      dateRange: 'This Week',
      lastGenerated: 'Today at 10:00 AM',
      status: 'Ready',
    },
  ];

  const filters = [
    'Today',
    'This Week',
    'This Month',
    'Before & After Care',
    'Summer Camp',
    'Staff',
    'Billing',
  ];

  return (
    <View style={styles.page}>
      <View style={styles.ownerReportsHero}>
        <View style={styles.heroOrbLarge} />
        <View style={styles.heroOrbSmall} />

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

          <Text style={styles.childProfileHeaderLabel}>Reports</Text>
        </View>

        <View style={styles.ownerDashboardHeroCopy}>
          <Text style={styles.ownerDashboardEyebrow}>Advanced Education</Text>
          <Text style={[styles.shellHeroTitle, styles.ownerReportsHeroTitle]}>Reports</Text>
          <Text style={styles.shellHeroSubtitle}>Attendance and program reports</Text>
          <View
            style={[
              styles.shellHeroPill,
              styles.ownerReportsHeroPill,
              { marginTop: 10 },
            ]}
          >
            <Text style={styles.ownerReportsHeroPillText}>Owner Access</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentStack}>
          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Report Summary</Text>
            <View style={[styles.ownerSectionDetailsGrid, { marginTop: 14 }]}>
              {reportSummaryCards.map((card) => (
                <SummaryTile
                  key={card.title}
                  accent={card.accent}
                  badge={card.title.charAt(0)}
                  title={card.title}
                  value={card.value}
                  note={card.note}
                  fill="Owner"
                />
              ))}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Quick Reports</Text>
            <View style={styles.ownerParentList}>
              {reports.map((report) => {
                const isOpen = openReportId === report.id;

                return (
                  <View key={report.id} style={styles.ownerParentCard}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        setOpenReportId((current) => (current === report.id ? null : report.id))
                      }
                      style={({ pressed }) => [
                        styles.ownerParentCardHeader,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <View style={styles.ownerParentHeaderTextBlock}>
                        <Text style={styles.ownerParentName}>{report.title}</Text>
                        <Text style={styles.ownerParentChildCount}>{report.description}</Text>
                      </View>

                      <View style={styles.ownerParentHeaderRight}>
                        <View style={[styles.ownerReportsStatusPill, styles.ownerReportsStatusReady]}>
                          <Text style={styles.ownerReportsStatusPillText}>{report.status}</Text>
                        </View>
                        <Text style={styles.ownerNavChevron}>{isOpen ? '⌃' : '›'}</Text>
                      </View>
                    </Pressable>

                    {isOpen ? (
                      <View style={styles.ownerParentExpandedContent}>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Report description</Text>
                          <Text style={styles.ownerParentDetailValue}>{report.description}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Mock date range</Text>
                          <Text style={styles.ownerParentDetailValue}>{report.dateRange}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Last generated</Text>
                          <Text style={styles.ownerParentDetailValue}>{report.lastGenerated}</Text>
                        </View>
                        <View style={styles.ownerParentDetailRow}>
                          <Text style={styles.ownerParentDetailLabel}>Status</Text>
                          <Text style={styles.ownerParentDetailValue}>{report.status}</Text>
                        </View>

                        <View style={styles.ownerParentActionList}>
                          {['View Report', 'Export PDF', 'Send to Owner Email'].map((label) => (
                            <OwnerNavCard
                              key={label}
                              accentColor={reportsAccent}
                              title={label}
                              subtitle="Coming Soon"
                              onPress={() => onShowComingSoon(label)}
                            />
                          ))}
                        </View>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Report Filters</Text>
            <View style={styles.ownerFilterPillRow}>
              {filters.map((pill) => {
                const isActive = activeFilter === pill;
                return (
                  <Pressable
                    key={pill}
                    accessibilityRole="button"
                    onPress={() => setActiveFilter(pill)}
                    style={({ pressed }) => [
                      styles.ownerFilterPill,
                      isActive && styles.ownerFilterPillActive,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ownerFilterPillText,
                        isActive && styles.ownerFilterPillTextActive,
                      ]}
                    >
                      {pill}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.ownerAccordionCard}>
            <Text style={styles.ownerAccordionTitle}>Reports Note</Text>
            <Text style={styles.ownerCommunicationNote}>
              Reports are mock-only in this prototype. When connected to real data, reports will
              summarize attendance, billing, staff hours, daily notes, and camp headcounts.
            </Text>
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

function OwnerSummerCampCheckInScreen({
  onBack,
  onLogout,
  ownerSummerCampChildren,
  ownerSummerCampSummary,
  ownerSummerCampGroups,
  loading,
  error,
  savingChildId,
  selectedGroupByChildId,
  groupPickerChildId,
  onToggleGroupPicker,
  onSelectGroupForChild,
  onCheckInChild,
}) {
  const totalAccent = OWNER_MODULE_COLORS['Camp Events'];

  const campSummaryCards = [
    {
      accent: 'blue',
      badge: 'T',
      title: 'Total Campers Checked In',
      value: String(ownerSummerCampSummary.total || 0),
      note: 'Owner access only',
      fill: 'Live',
    },
    {
      accent: 'yellow',
      badge: 'Y',
      title: 'Yellow Group',
      value: String(ownerSummerCampSummary['Yellow Group'] || 0),
      note: 'Owner checked in',
      fill: 'Camp',
    },
    {
      accent: 'orange',
      badge: 'O',
      title: 'Orange Group',
      value: String(ownerSummerCampSummary['Orange Group'] || 0),
      note: 'Owner checked in',
      fill: 'Camp',
    },
    {
      accent: 'green',
      badge: 'G',
      title: 'Green Group',
      value: String(ownerSummerCampSummary['Green Group'] || 0),
      note: 'Owner checked in',
      fill: 'Camp',
    },
    {
      accent: 'blue',
      badge: 'B',
      title: 'Blue Group',
      value: String(ownerSummerCampSummary['Blue Group'] || 0),
      note: 'Owner checked in',
      fill: 'Camp',
    },
    {
      accent: 'red',
      badge: 'R',
      title: 'Red Group',
      value: String(ownerSummerCampSummary['Red Group'] || 0),
      note: 'Owner checked in',
      fill: 'Camp',
    },
    {
      accent: 'pink',
      badge: 'P',
      title: 'Pink Group',
      value: String(ownerSummerCampSummary['Pink Group'] || 0),
      note: 'Owner checked in',
      fill: 'Camp',
    },
    {
      accent: 'purple',
      badge: 'P',
      title: 'Purple Group',
      value: String(ownerSummerCampSummary['Purple Group'] || 0),
      note: 'Owner checked in',
      fill: 'Camp',
    },
  ];

  return (
    <View style={styles.parentHomePage}>
      <ScrollView
        stickyHeaderIndices={[0]}
        style={styles.parentScrollArea}
        contentContainerStyle={styles.parentHomeScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ownerSummerCampHero}>
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

            <Text style={styles.childProfileHeaderLabel}>Summer Camp Check-In</Text>
          </View>

          <View style={styles.ownerSummerCampHeroMain}>
            <View style={styles.ownerSummerCampHeroCopy}>
              <Text style={styles.ownerDashboardEyebrow}>Advanced Education</Text>
              <Text style={styles.shellHeroTitle}>Summer Camp Check-In</Text>
              <Text style={styles.shellHeroSubtitle}>Owner check-in only</Text>
              <View style={[styles.ownerAccessPill, { backgroundColor: totalAccent }]}>
                <Text style={styles.ownerAccessPillText}>Owner Access</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          {loading ? <Text style={styles.sectionHelperText}>Loading camp check-ins...</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Camp Check-In Summary</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Live totals across the center</Text>
            </View>

            <View style={styles.staffCampSummaryRow}>
              {[
                { label: 'Pending', value: 0 },
                { label: 'Complete', value: 0 },
                { label: 'Discrepancies', value: 0 },
              ].map((item) => (
                <View
                  key={item.label}
                  style={[styles.staffCampSummaryPill, { backgroundColor: totalAccent }]}
                >
                  <Text style={styles.staffCampSummaryLabel}>{item.label}</Text>
                  <Text style={styles.staffCampSummaryValue}>{item.value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.ownerSectionDetailsGrid}>
              {campSummaryCards.map((card) => (
                <SummaryTile
                  key={card.title}
                  accent={card.accent}
                  badge={card.badge}
                  title={card.title}
                  value={card.value}
                  note={card.note}
                  fill={card.fill}
                />
              ))}
            </View>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Choose Child to Check In</Text>
              <Text style={styles.parentSectionHeaderSubtle}>
                {ownerSummerCampChildren.length} campers in the owner list
              </Text>
            </View>

            <View style={styles.ownerSummerCampChildList}>
              {ownerSummerCampChildren.map((child) => {
                const theme = getChildGroupTheme(child.assignedGroupName || child.groupName);
                const checkedIn = child.checkInStatus === 'Checked In';
                const selectedGroupId = selectedGroupByChildId?.[child.id] || child.selectedGroupId;
                const selectedGroup = ownerSummerCampGroups.find((group) => group.id === selectedGroupId);
                const isPickerOpen = groupPickerChildId === child.id;

                return (
                  <View key={child.id} style={styles.staffCampChildCard}>
                    <View style={styles.staffCampChildCardTopRow}>
                      <View style={styles.staffCampChildNameBlock}>
                        <Text style={styles.staffCampChildName}>{child.name}</Text>
                        <Text style={styles.staffCampChildTime}>
                          Last update: {formatTime(child.lastUpdateTime)}
                        </Text>
                        <Text style={styles.staffCampChildTime}>
                          Assigned group: {child.assignedGroupName || selectedGroup?.name || 'Not assigned'}
                        </Text>
                      </View>

                      <View style={styles.staffCampStatusStack}>
                        <View
                          style={[
                            styles.childProfileGroupBadge,
                            {
                              backgroundColor: theme.soft,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.childProfileGroupBadgeText,
                              { color: theme.accent },
                            ]}
                          >
                            {child.assignedGroupName || selectedGroup?.name || child.groupName}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.childProfileStatusBadge,
                            {
                              backgroundColor: checkedIn ? COLORS.success : COLORS.softOrange,
                            },
                          ]}
                        >
                          <Text style={styles.childProfileStatusBadgeText}>
                            {child.checkInStatus}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.ownerSummerCampGroupPickerRow}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => onToggleGroupPicker(child.id)}
                        style={({ pressed }) => [
                          styles.ownerSummerCampGroupPickerButton,
                          pressed && styles.pressedButton,
                        ]}
                      >
                        <Text style={styles.ownerSummerCampGroupPickerButtonText}>
                          {selectedGroup?.name || 'Assign Group'}
                        </Text>
                        <Text style={styles.ownerNavChevron}>{isPickerOpen ? '⌃' : '›'}</Text>
                      </Pressable>
                    </View>

                    {isPickerOpen ? (
                      <View style={styles.ownerSummerCampGroupPickerOptions}>
                        {ownerSummerCampGroups.map((group) => {
                          const isSelected = selectedGroup?.id === group.id;
                          return (
                            <Pressable
                              key={group.id}
                              accessibilityRole="button"
                              onPress={() => onSelectGroupForChild(child.id, group.id)}
                              style={({ pressed }) => [
                                styles.ownerSummerCampGroupOption,
                                isSelected && styles.ownerSummerCampGroupOptionActive,
                                pressed && styles.pressedButton,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.ownerSummerCampGroupOptionText,
                                  isSelected && styles.ownerSummerCampGroupOptionTextActive,
                                ]}
                              >
                                {group.name || getCampGroupDisplayName(group) || 'Unnamed Group'}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : null}

                    <Pressable
                      accessibilityRole="button"
                      disabled={checkedIn || savingChildId === child.id}
                      onPress={() => onCheckInChild(child.id, child.name)}
                      style={({ pressed }) => [
                        styles.staffCampConfirmButton,
                        {
                          backgroundColor: checkedIn ? COLORS.success : totalAccent,
                        },
                        checkedIn && styles.staffCampConfirmButtonDisabled,
                        (pressed && !checkedIn && savingChildId !== child.id) && styles.pressedButton,
                      ]}
                    >
                      <Text style={styles.staffCampConfirmButtonText}>
                        {savingChildId === child.id ? 'Checking In...' : checkedIn ? 'Checked In' : 'Check In to Camp'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
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
  'Orange Group': {
    accent: '#F59E0B',
    border: '#FDE68A',
    soft: '#FFF7ED',
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
  'Pink Group': {
    accent: '#EC4899',
    border: '#F9A8D4',
    soft: '#FDF2F8',
  },
  'Purple Group': {
    accent: '#7C4DFF',
    border: '#D8C7FF',
    soft: '#F6F0FF',
  },
};

function getChildGroupTheme(group) {
  return CHILD_GROUP_THEMES[group] || CHILD_GROUP_THEMES['Blue Group'];
}

function getCampGroupCanonicalName(value) {
  const rawValue =
    typeof value === 'string'
      ? value
      : value?.name || value?.group_name || value?.title || value?.label || value?.color || '';
  const normalized = String(rawValue).toLowerCase();

  if (normalized.includes('yellow')) return 'Yellow Group';
  if (normalized.includes('orange')) return 'Orange Group';
  if (normalized.includes('green')) return 'Green Group';
  if (normalized.includes('blue')) return 'Blue Group';
  if (normalized.includes('red')) return 'Red Group';
  if (normalized.includes('pink')) return 'Pink Group';
  if (normalized.includes('purple')) return 'Purple Group';

  return '';
}

const STAFF_MEMBER = {
  name: 'Ms. Sarah',
  status: 'Checked Out',
  shift: '7:30 AM - 4:00 PM',
};

const STAFF_WORKSPACE_CARDS = [
  {
    accent: 'green',
    title: 'Clock In / Out',
    value: STAFF_MEMBER.status,
    note: `${STAFF_MEMBER.shift} · Location required for clock in`,
  },
  {
    accent: 'orange',
    title: 'Before & After Care Attendance',
    value: 'School-year workflow',
    note: 'Check-in, bus, and pickup management',
  },
  {
    accent: 'blue',
    title: 'Summer Camp Group Check-In',
    value: 'Blue Group',
    note: 'Group check-in and headcount confirmation',
  },
  {
    accent: 'red',
    title: 'Incident Reports',
    value: 'Create reports',
    note: 'Create child incident reports',
  },
  {
    accent: 'purple',
    title: 'Daily Notes',
    value: '3 notes today',
    note: 'Add notes for parents',
  },
  {
    accent: 'blue',
    title: 'Messages',
    value: 'View updates',
    note: 'View staff updates and center announcements',
  },
  {
    accent: 'blue',
    title: 'My Hours',
    value: '28.5 hours this week',
    note: 'Pending owner review',
  },
  {
    accent: 'purple',
    title: 'Notifications',
    value: 'See alerts',
    note: 'Unread messages and attention needed',
  },
];

const STAFF_HOURS_THIS_WEEK = [
  { day: 'Monday', hours: '8.0 hrs' },
  { day: 'Tuesday', hours: '8.5 hrs' },
  { day: 'Wednesday', hours: '7.5 hrs' },
  { day: 'Thursday', hours: '8.0 hrs' },
  { day: 'Friday', hours: '0.0 hrs' },
];

const STAFF_HOURS_APPROVED_WEEKS = [
  {
    title: 'Last Week',
    total: '38.5',
    status: 'Approved',
    date: 'May 24',
  },
  {
    title: 'Previous Week',
    total: '36.0',
    status: 'Approved',
    date: 'May 17',
  },
];

const STAFF_HOURS_CLOCK_ACTIVITY = [
  { label: 'Clock In', time: '7:30 AM' },
  { label: 'Lunch Out', time: '12:00 PM' },
  { label: 'Lunch In', time: '12:30 PM' },
  { label: 'Clock Out', time: '4:00 PM' },
];

const STAFF_DAILY_NOTE_CHIPS = [
  'Great day',
  'Completed homework',
  'Ate snack',
  'Participated in activity',
  'Needs extra clothes',
  'Bring water bottle tomorrow',
  'Rested quietly',
  'Played well with group',
];

const STAFF_CLOCK_CURRENT_TIME = '7:24 AM';
const STAFF_CLOCK_LOCATION_STATUS = 'At Work Location';

const STAFF_CAMP_GROUP_NAMES = [
  'Yellow Group',
  'Orange Group',
  'Green Group',
  'Blue Group',
  'Red Group',
  'Pink Group',
  'Purple Group',
];

const STAFF_BA_MOCK_TIMES = {
  dropOff: '7:12 AM',
  bus: '8:05 AM',
  returned: '3:20 PM',
  pickup: '5:10 PM',
};

const STAFF_BA_MOCK_DURATIONS = {
  morning: '53 min',
  afternoon: '1 hr 50 min',
  total: '2 hr 43 min',
};

function buildBeforeAfterChild({
  id,
  name,
  stage,
  pickup,
  accentGroup,
  timelineMessages,
}) {
  const stepData = {
    0: {
      status: 'Ready for Drop Off',
      dropOffTime: '',
      busTime: '',
      returnedTime: '',
      pickupTime: '',
      morningDuration: '',
      afternoonDuration: '',
      totalDailyTime: '',
      lastUpdateTime: 'Not started',
    },
    1: {
      status: 'Dropped Off',
      dropOffTime: STAFF_BA_MOCK_TIMES.dropOff,
      busTime: '',
      returnedTime: '',
      pickupTime: '',
      morningDuration: 'Pending',
      afternoonDuration: 'Pending',
      totalDailyTime: 'Pending',
      lastUpdateTime: STAFF_BA_MOCK_TIMES.dropOff,
    },
    2: {
      status: 'On Bus',
      dropOffTime: STAFF_BA_MOCK_TIMES.dropOff,
      busTime: STAFF_BA_MOCK_TIMES.bus,
      returnedTime: '',
      pickupTime: '',
      morningDuration: STAFF_BA_MOCK_DURATIONS.morning,
      afternoonDuration: 'Pending',
      totalDailyTime: 'Pending',
      lastUpdateTime: STAFF_BA_MOCK_TIMES.bus,
    },
    3: {
      status: 'Returned From Bus',
      dropOffTime: STAFF_BA_MOCK_TIMES.dropOff,
      busTime: STAFF_BA_MOCK_TIMES.bus,
      returnedTime: STAFF_BA_MOCK_TIMES.returned,
      pickupTime: '',
      morningDuration: STAFF_BA_MOCK_DURATIONS.morning,
      afternoonDuration: 'Pending',
      totalDailyTime: 'Pending',
      lastUpdateTime: STAFF_BA_MOCK_TIMES.returned,
    },
    4: {
      status: 'Picked Up',
      dropOffTime: STAFF_BA_MOCK_TIMES.dropOff,
      busTime: STAFF_BA_MOCK_TIMES.bus,
      returnedTime: STAFF_BA_MOCK_TIMES.returned,
      pickupTime: STAFF_BA_MOCK_TIMES.pickup,
      morningDuration: STAFF_BA_MOCK_DURATIONS.morning,
      afternoonDuration: STAFF_BA_MOCK_DURATIONS.afternoon,
      totalDailyTime: STAFF_BA_MOCK_DURATIONS.total,
      lastUpdateTime: STAFF_BA_MOCK_TIMES.pickup,
    },
  };

  const data = stepData[stage] || stepData[0];
  const timeline = (timelineMessages || []).map((item) => ({
    id: `${id}-${item.title}-${item.time}`,
    ...item,
    childName: name,
  }));

  return {
    id,
    name,
    stage,
    accentGroup,
    status: data.status,
    lastUpdateTime: data.lastUpdateTime,
    programBadge: 'Before & After Care',
    dropOffTime: data.dropOffTime,
    busTime: data.busTime,
    returnedTime: data.returnedTime,
    pickupTime: data.pickupTime,
    morningDuration: data.morningDuration,
    afternoonDuration: data.afternoonDuration,
    totalDailyTime: data.totalDailyTime,
    pickup,
    timeline,
  };
}

function createStaffBeforeAfterChildren() {
  return [
    buildBeforeAfterChild({
      id: 'ba-mia',
      name: 'Mia Carter',
      stage: 1,
      accentGroup: 'Blue Group',
      pickup: {
        authorizedPickups: ['Avery Parent', 'Susan Carter'],
        emergencyContact: 'David Carter',
        medicalAlerts: ['Peanut Allergy'],
      },
      timelineMessages: [
        {
          time: STAFF_BA_MOCK_TIMES.dropOff,
          title: 'Dropped Off',
          message: 'Mia was dropped off for Before & After Care.',
        },
      ],
    }),
    buildBeforeAfterChild({
      id: 'ba-liam',
      name: 'Liam Wilson',
      stage: 2,
      accentGroup: 'Green Group',
      pickup: {
        authorizedPickups: ['Jordan Wilson'],
        emergencyContact: 'Megan Wilson',
        medicalAlerts: ['No Known Allergies'],
      },
      timelineMessages: [
        {
          time: STAFF_BA_MOCK_TIMES.dropOff,
          title: 'Dropped Off',
          message: 'Liam arrived for Before & After Care.',
        },
        {
          time: STAFF_BA_MOCK_TIMES.bus,
          title: 'On Bus',
          message: 'Liam boarded the bus for afternoon care.',
        },
      ],
    }),
    buildBeforeAfterChild({
      id: 'ba-emma',
      name: 'Emma Davis',
      stage: 3,
      accentGroup: 'Red Group',
      pickup: {
        authorizedPickups: ['Olivia Davis', 'Mark Davis'],
        emergencyContact: 'Mark Davis',
        medicalAlerts: ['Asthma'],
      },
      timelineMessages: [
        {
          time: STAFF_BA_MOCK_TIMES.dropOff,
          title: 'Dropped Off',
          message: 'Emma arrived for Before & After Care.',
        },
        {
          time: STAFF_BA_MOCK_TIMES.bus,
          title: 'On Bus',
          message: 'Emma boarded the bus for afternoon care.',
        },
        {
          time: STAFF_BA_MOCK_TIMES.returned,
          title: 'Returned From Bus',
          message: 'Emma returned from the bus and checked back in.',
        },
      ],
    }),
    buildBeforeAfterChild({
      id: 'ba-noah',
      name: 'Noah Brown',
      stage: 4,
      accentGroup: 'Yellow Group',
      pickup: {
        authorizedPickups: ['Rachel Brown'],
        emergencyContact: 'Rachel Brown',
        medicalAlerts: ['Milk Allergy'],
      },
      timelineMessages: [
        {
          time: STAFF_BA_MOCK_TIMES.dropOff,
          title: 'Dropped Off',
          message: 'Noah arrived for Before & After Care.',
        },
        {
          time: STAFF_BA_MOCK_TIMES.bus,
          title: 'On Bus',
          message: 'Noah boarded the bus for afternoon care.',
        },
        {
          time: STAFF_BA_MOCK_TIMES.returned,
          title: 'Returned From Bus',
          message: 'Noah returned from the bus and checked back in.',
        },
        {
          time: STAFF_BA_MOCK_TIMES.pickup,
          title: 'Picked Up',
          message: 'Noah was picked up for the day.',
        },
      ],
    }),
  ];
}

function createStaffSummerCampGroups() {
  return {
    'Blue Group': [
      {
        id: 'blue-mia',
        name: 'Mia Carter',
        checkInStatus: 'Not Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:12 AM',
      },
      {
        id: 'blue-ava',
        name: 'Ava Martin',
        checkInStatus: 'Checked In',
        groupConfirmationStatus: 'Confirmed Present',
        lastUpdateTime: '8:18 AM',
      },
      {
        id: 'blue-lucas',
        name: 'Lucas Reed',
        checkInStatus: 'Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:00 AM',
      },
      {
        id: 'blue-sophia',
        name: 'Sophia Green',
        checkInStatus: 'Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:22 AM',
      },
    ],
    'Green Group': [
      {
        id: 'green-liam',
        name: 'Liam Wilson',
        checkInStatus: 'Not Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:14 AM',
      },
      {
        id: 'green-owen',
        name: 'Owen Taylor',
        checkInStatus: 'Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:16 AM',
      },
      {
        id: 'green-lily',
        name: 'Lily Johnson',
        checkInStatus: 'Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:00 AM',
      },
      {
        id: 'green-ella',
        name: 'Ella Moore',
        checkInStatus: 'Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:20 AM',
      },
    ],
    'Red Group': [
      {
        id: 'red-sadie',
        name: 'Sadie Brooks',
        checkInStatus: 'Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:10 AM',
      },
      {
        id: 'red-james',
        name: 'James Walker',
        checkInStatus: 'Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:00 AM',
      },
      {
        id: 'red-zoe',
        name: 'Zoe Hall',
        checkInStatus: 'Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:18 AM',
      },
      {
        id: 'red-emma',
        name: 'Emma Davis',
        checkInStatus: 'Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:11 AM',
      },
    ],
    'Yellow Group': [
      {
        id: 'yellow-noah',
        name: 'Noah Brown',
        checkInStatus: 'Not Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:09 AM',
      },
      {
        id: 'yellow-mason',
        name: 'Mason Scott',
        checkInStatus: 'Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:00 AM',
      },
      {
        id: 'yellow-ava',
        name: 'Ava Brooks',
        checkInStatus: 'Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:16 AM',
      },
      {
        id: 'yellow-noelle',
        name: 'Noelle Diaz',
        checkInStatus: 'Checked In',
        groupConfirmationStatus: 'Not Confirmed',
        lastUpdateTime: '8:13 AM',
      },
    ],
  };
}

const OWNER_MODULES = [
  'Students',
  'Staff',
  'Parents',
  'Billing',
  'Messages',
  'Notifications',
  'Camp Events',
  'Invite Codes',
  'Reports',
];

const OWNER_MODULE_COLORS = {
  Students: '#0F62FE',
  Staff: '#16A34A',
  Parents: '#7C4DFF',
  Billing: '#F59E0B',
  Messages: '#38BDF8',
  Notifications: '#7C4DFF',
  'Camp Events': '#14B8A6',
  'Invite Codes': '#F97366',
  Reports: '#001B3D',
};

const OWNER_SUMMER_CAMP_INITIAL_SUMMARY = {
  total: 0,
  'Yellow Group': 0,
  'Orange Group': 0,
  'Green Group': 0,
  'Blue Group': 0,
  'Red Group': 0,
  'Pink Group': 0,
  'Purple Group': 0,
};

const OWNER_SUMMER_CAMP_GROUP_NAMES = [
  'Yellow Group',
  'Orange Group',
  'Green Group',
  'Blue Group',
  'Red Group',
  'Pink Group',
  'Purple Group',
];

function getCampGroupDisplayName(group) {
  return (
    group?.name ||
    group?.group_name ||
    group?.title ||
    group?.label ||
    group?.camp_group_name ||
    group?.display_name ||
    ''
  );
}

const OFFICIAL_LOGO = require('./assets/images/logo.png');
const HEADER_PHOTO = require('./assets/images/header_kids.jpg');

function SummaryTile({ accent, title, value, note, fill, onPress, badge }) {
  const accentStyles = {
    blue: styles.tileBlue,
    green: styles.tileGreen,
    orange: styles.tileOrange,
    pink: styles.tilePink,
    purple: styles.tilePurple,
    red: styles.tileRed,
    yellow: styles.tileYellow,
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

function ActionButtonCard({
  accent,
  title,
  subtitle,
  value,
  note,
  onPress,
  outline = false,
}) {
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
        {subtitle ? <Text style={styles.actionSubtitle}>{subtitle}</Text> : null}
        {value ? <Text style={styles.actionValue}>{value}</Text> : null}
        {note ? <Text style={styles.actionNote}>{note}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function OwnerNavCard({ accentColor, title, subtitle, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.ownerNavCard, pressed && styles.pressedTile]}
    >
      <View style={styles.ownerNavContent}>
        <View style={[styles.ownerNavAccent, { backgroundColor: accentColor }]} />
        <Text style={styles.ownerNavTitle}>{title}</Text>
        <Text style={styles.ownerNavSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.ownerNavChevron}>›</Text>
    </Pressable>
  );
}

function RecipientMessageCard({ item, expanded, onPress }) {
  const theme = getNotificationTheme(item.messageType);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(item)}
      style={({ pressed }) => [pressed && styles.buttonPressed]}
    >
      <View
        style={[
          styles.notificationCard,
          !item.readAt && styles.notificationCardUnread,
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
                item.readAt
                  ? styles.notificationStatusPillRead
                  : styles.notificationStatusPillUnread,
              ]}
            >
              <Text
                style={[
                  styles.notificationStatusPillText,
                  item.readAt
                    ? styles.notificationStatusPillTextRead
                    : styles.notificationStatusPillTextUnread,
                ]}
              >
                {item.readAt ? 'Read' : 'Unread'}
              </Text>
            </View>
          </View>

          <Text
            style={styles.notificationCardMessage}
            numberOfLines={expanded ? undefined : 2}
          >
            {item.body || 'No message body provided.'}
          </Text>

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
                {formatMessageTypeLabel(item.messageType)}
              </Text>
            </View>

            <Text style={styles.notificationTime}>
              {formatMessageDateTime(item.deliveredAt)}
            </Text>
          </View>

          {expanded ? (
            <View style={styles.recipientMessageExpandedFooter}>
              <Text style={styles.recipientMessageExpandedLabel}>
                Delivered to your account
              </Text>
              <Text style={styles.recipientMessageExpandedValue}>
                {item.readAt ? 'Opened' : 'Unread'}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function RecipientMessagesSection({
  title,
  subtitle,
  messages = [],
  loading,
  error,
  emptyText = 'No messages yet.',
  expandedMessageId,
  onToggleMessage,
}) {
  const unreadCount = messages.filter((item) => !item.readAt).length;

  return (
    <View style={styles.recipientMessagesSection}>
      <View style={styles.parentSectionHeaderRow}>
        <Text style={styles.parentSectionHeaderTitle}>{title}</Text>
        <Text style={styles.parentSectionHeaderSubtle}>
          {loading ? 'Loading...' : `${unreadCount} unread`}
        </Text>
      </View>

      {subtitle ? <Text style={styles.notificationsIntroText}>{subtitle}</Text> : null}

      {loading ? (
        <Text style={styles.recipientMessagesStateText}>Loading messages...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : messages.length ? (
        <View style={styles.notificationsList}>
          {messages.map((message) => (
            <RecipientMessageCard
              key={message.id}
              item={message}
              expanded={expandedMessageId === message.id}
              onPress={onToggleMessage}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.recipientMessagesStateText}>{emptyText}</Text>
      )}
    </View>
  );
}

function ParentAuthorizedPickupsScreen({ onBack, onLogout, currentUserId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkedChildren, setLinkedChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [pickupRows, setPickupRows] = useState([]);
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPickupData = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false);
      setError('');
      setLinkedChildren([]);
      setPickupRows([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: links, error: linksError } = await supabase
        .from('child_parent_links')
        .select('child_id')
        .eq('parent_profile_id', currentUserId);

      if (linksError) {
        throw new Error(linksError.message || 'Could not load linked children.');
      }

      const childIds = Array.from(
        new Set((Array.isArray(links) ? links : []).map((row) => row.child_id).filter(Boolean))
      );

      if (!childIds.length) {
        setLinkedChildren([]);
        setPickupRows([]);
        setSelectedChildId('');
        setLoading(false);
        return;
      }

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .in('id', childIds);

      if (childrenError) {
        throw new Error(childrenError.message || 'Could not load linked children.');
      }

      const children = Array.isArray(childrenData) ? childrenData : [];
      setLinkedChildren(children);
      setSelectedChildId((current) => {
        if (children.length === 1) {
          return children[0].id;
        }
        if (current && children.some((child) => child.id === current)) {
          return current;
        }
        return children[0]?.id || '';
      });
      if (!children.length) {
        setPickupRows([]);
      }
    } catch (loadError) {
      setError(loadError?.message || 'Could not load authorized pickups.');
      setLinkedChildren([]);
      setPickupRows([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadPickupData();
  }, [loadPickupData]);

  useEffect(() => {
    const loadChildPickups = async () => {
      if (!selectedChildId) {
        setPickupRows([]);
        return;
      }

      setLoading(true);
      setError('');

      const { data, error: pickupsError } = await supabase
        .from('authorized_pickups')
        .select('id, child_id, full_name, relationship, phone, created_at')
        .eq('child_id', selectedChildId)
        .order('created_at', { ascending: false });

      if (pickupsError) {
        setError(pickupsError.message || 'Could not load authorized pickups.');
        setPickupRows([]);
        setLoading(false);
        return;
      }

      setPickupRows(Array.isArray(data) ? data : []);
      setLoading(false);
    };

    if (linkedChildren.length) {
      loadChildPickups();
    }
  }, [linkedChildren.length, selectedChildId]);

  const selectedChild = linkedChildren.find((child) => child.id === selectedChildId) || null;
  const selectedChildPickups = pickupRows.filter((row) => row.child_id === selectedChildId);

  const handleCancel = () => {
    setFullName('');
    setRelationship('');
    setPhone('');
    setError('');
  };

  const handleSavePickup = async () => {
    const cleanName = fullName.trim();
    const cleanRelationship = relationship.trim();
    const cleanPhone = phone.trim();

    if (!selectedChild?.id) {
      setError('Select a child first.');
      return;
    }

    if (!cleanName || !cleanRelationship || !cleanPhone) {
      setError('Please fill in the required fields.');
      return;
    }

    setSaving(true);
    setError('');

    const { error: insertError } = await supabase.from('authorized_pickups').insert({
      child_id: selectedChild.id,
      full_name: cleanName,
      relationship: cleanRelationship,
      phone: cleanPhone,
    });

    if (insertError) {
      setError(insertError.message || 'Could not save authorized pickup.');
      setSaving(false);
      return;
    }

    await loadPickupData();
    handleCancel();
    setSaving(false);
    Alert.alert('Authorized pickup saved.');
  };

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

            <Text style={styles.childProfileHeaderLabel}>Authorized Pickups</Text>
          </View>

          <View style={styles.notificationsHeroMain}>
            <View style={styles.notificationsHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Authorized Pickups</Text>
              <View style={styles.notificationsHeroTag}>
                <Text style={styles.notificationsHeroTagText}>Family Access</Text>
              </View>
              <Text style={styles.notificationsHeroSubtitle}>
                Manage people allowed to pick up your child
              </Text>
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
              <Text style={styles.parentSectionHeaderTitle}>Select Child</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Linked accounts</Text>
            </View>

            {loading ? (
              <Text style={styles.parentAttendanceStateText}>Loading authorized pickups...</Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : linkedChildren.length ? (
              <View style={styles.ownerFilterPillRow}>
                {linkedChildren.map((child) => {
                  const isActive = selectedChildId === child.id;
                  return (
                    <Pressable
                      key={child.id}
                      accessibilityRole="button"
                      onPress={() => setSelectedChildId(child.id)}
                      style={({ pressed }) => [
                        styles.ownerFilterPill,
                        isActive && styles.ownerFilterPillActive,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.ownerFilterPillText,
                          isActive && styles.ownerFilterPillTextActive,
                        ]}
                      >
                        {`${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unnamed Student'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.parentAttendanceStateText}>
                No children linked to this account.
              </Text>
            )}
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>New Pickup Contact</Text>
              <Text style={styles.parentSectionHeaderSubtle}>
                {selectedChild ? `${selectedChild.first_name || ''} ${selectedChild.last_name || ''}`.trim() : 'No child selected'}
              </Text>
            </View>

            <Text style={styles.ownerStudentFormLabel}>Full Name</Text>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor={COLORS.muted}
              value={fullName}
              onChangeText={setFullName}
              style={styles.ownerSearchInput}
            />

            <Text style={styles.ownerStudentFormLabel}>Relationship</Text>
            <TextInput
              placeholder="Relationship"
              placeholderTextColor={COLORS.muted}
              value={relationship}
              onChangeText={setRelationship}
              style={styles.ownerSearchInput}
            />

            <Text style={styles.ownerStudentFormLabel}>Phone Number</Text>
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor={COLORS.muted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.ownerSearchInput}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={handleSavePickup}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressedButton,
                saving && { opacity: 0.75 },
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? 'Saving Pickup...' : 'Save Pickup'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={handleCancel}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressedButton,
                { marginTop: 12 },
              ]}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Authorized Pickups</Text>
              <Text style={styles.parentSectionHeaderSubtle}>
                {selectedChildPickups.length} on file
              </Text>
            </View>

            {loading ? (
              <Text style={styles.parentAttendanceStateText}>Loading authorized pickups...</Text>
            ) : selectedChildPickups.length ? (
              <View style={styles.profileList}>
                {selectedChildPickups.map((pickup) => (
                  <View key={pickup.id} style={styles.profileListRow}>
                    <View style={styles.profileListDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.profileListLabel}>{pickup.full_name}</Text>
                      <Text style={styles.profileListValue}>{pickup.relationship}</Text>
                      <Text style={styles.profileListValue}>{pickup.phone}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.parentAttendanceStateText}>No authorized pickups on file.</Text>
            )}
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

function ParentEmergencyContactsScreen({ onBack, onLogout, currentUserId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkedChildren, setLinkedChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [contactRows, setContactRows] = useState([]);
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [priority, setPriority] = useState('');
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadEmergencyData = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false);
      setError('');
      setLinkedChildren([]);
      setContactRows([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: links, error: linksError } = await supabase
        .from('child_parent_links')
        .select('child_id')
        .eq('parent_profile_id', currentUserId);

      if (linksError) {
        throw new Error(linksError.message || 'Could not load linked children.');
      }

      const childIds = Array.from(
        new Set((Array.isArray(links) ? links : []).map((row) => row.child_id).filter(Boolean))
      );

      if (!childIds.length) {
        setLinkedChildren([]);
        setContactRows([]);
        setSelectedChildId('');
        setLoading(false);
        return;
      }

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .in('id', childIds);

      if (childrenError) {
        throw new Error(childrenError.message || 'Could not load linked children.');
      }

      const children = Array.isArray(childrenData) ? childrenData : [];
      setLinkedChildren(children);
      setSelectedChildId((current) => {
        if (children.length === 1) {
          return children[0].id;
        }
        if (current && children.some((child) => child.id === current)) {
          return current;
        }
        return children[0]?.id || '';
      });
      if (!children.length) {
        setContactRows([]);
      }
    } catch (loadError) {
      setError(loadError?.message || 'Could not load emergency contacts.');
      setLinkedChildren([]);
      setContactRows([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadEmergencyData();
  }, [loadEmergencyData]);

  useEffect(() => {
    const loadChildContacts = async () => {
      if (!selectedChildId) {
        setContactRows([]);
        return;
      }

      setLoading(true);
      setError('');

      const { data, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('id, child_id, full_name, relationship, phone, priority, created_at')
        .eq('child_id', selectedChildId)
        .order('created_at', { ascending: false });

      if (contactsError) {
        setError(contactsError.message || 'Could not load emergency contacts.');
        setContactRows([]);
        setLoading(false);
        return;
      }

      setContactRows(Array.isArray(data) ? data : []);
      setLoading(false);
    };

    if (linkedChildren.length) {
      loadChildContacts();
    }
  }, [linkedChildren.length, selectedChildId]);

  const selectedChild = linkedChildren.find((child) => child.id === selectedChildId) || null;
  const selectedChildContacts = contactRows.filter((row) => row.child_id === selectedChildId);

  const handleCancel = () => {
    setFullName('');
    setRelationship('');
    setPhone('');
    setPriority('');
    setPriorityMenuOpen(false);
    setError('');
  };

  const handleSaveContact = async () => {
    const cleanName = fullName.trim();
    const cleanRelationship = relationship.trim();
    const cleanPhone = phone.trim();
    const cleanPriority = Number(priority);

    if (!selectedChild?.id) {
      setError('Select a child first.');
      return;
    }

    if (
      !cleanName ||
      !cleanRelationship ||
      !cleanPhone ||
      !EMERGENCY_CONTACT_PRIORITY_OPTIONS.some((option) => option.value === cleanPriority)
    ) {
      setError('Please fill in the required fields.');
      return;
    }

    setSaving(true);
    setError('');

    const { error: insertError } = await supabase.from('emergency_contacts').insert({
      child_id: selectedChild.id,
      full_name: cleanName,
      relationship: cleanRelationship,
      phone: cleanPhone,
      priority: cleanPriority,
    });

    if (insertError) {
      setError(insertError.message || 'Could not save emergency contact.');
      setSaving(false);
      return;
    }

    await loadEmergencyData();
    handleCancel();
    setSaving(false);
    Alert.alert('Emergency contact saved.');
  };

  const selectedPriorityOption =
    EMERGENCY_CONTACT_PRIORITY_OPTIONS.find((option) => option.value === Number(priority)) || null;

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

            <Text style={styles.childProfileHeaderLabel}>Emergency Contacts</Text>
          </View>

          <View style={styles.notificationsHeroMain}>
            <View style={styles.notificationsHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Emergency Contacts</Text>
              <View style={styles.notificationsHeroTag}>
                <Text style={styles.notificationsHeroTagText}>Safety Access</Text>
              </View>
              <Text style={styles.notificationsHeroSubtitle}>
                Manage emergency contacts for your child
              </Text>
            </View>

            <View style={styles.parentHeroPhotoWrap}>
              <Image source={HEADER_PHOTO} resizeMode="cover" style={styles.parentHeroPhoto} />
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Select Child</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Linked accounts</Text>
            </View>

            {loading ? (
              <Text style={styles.parentAttendanceStateText}>Loading emergency contacts...</Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : linkedChildren.length ? (
              <View style={styles.ownerFilterPillRow}>
                {linkedChildren.map((child) => {
                  const isActive = selectedChildId === child.id;
                  return (
                    <Pressable
                      key={child.id}
                      accessibilityRole="button"
                      onPress={() => setSelectedChildId(child.id)}
                      style={({ pressed }) => [
                        styles.ownerFilterPill,
                        isActive && styles.ownerFilterPillActive,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.ownerFilterPillText,
                          isActive && styles.ownerFilterPillTextActive,
                        ]}
                      >
                        {`${child.first_name || ''} ${child.last_name || ''}`.trim() ||
                          'Unnamed Student'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.parentAttendanceStateText}>
                No children linked to this account.
              </Text>
            )}
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>New Emergency Contact</Text>
              <Text style={styles.parentSectionHeaderSubtle}>
                {selectedChild
                  ? `${selectedChild.first_name || ''} ${selectedChild.last_name || ''}`.trim()
                  : 'No child selected'}
              </Text>
            </View>

            <Text style={styles.ownerStudentFormLabel}>Full Name</Text>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor={COLORS.muted}
              value={fullName}
              onChangeText={setFullName}
              style={styles.ownerSearchInput}
            />

            <Text style={styles.ownerStudentFormLabel}>Relationship</Text>
            <TextInput
              placeholder="Relationship"
              placeholderTextColor={COLORS.muted}
              value={relationship}
              onChangeText={setRelationship}
              style={styles.ownerSearchInput}
            />

            <Text style={styles.ownerStudentFormLabel}>Phone Number</Text>
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor={COLORS.muted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.ownerSearchInput}
            />

            <Text style={styles.ownerStudentFormLabel}>Priority</Text>
            <View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPriorityMenuOpen((current) => !current)}
                style={({ pressed }) => [
                  styles.ownerSearchInput,
                  styles.ownerPriorityDropdownTab,
                  pressed && styles.pressedButton,
                ]}
              >
                <Text style={styles.ownerPriorityDropdownTabText}>
                  {selectedPriorityOption
                    ? formatEmergencyContactPriority(selectedPriorityOption.value)
                    : 'Select priority'}
                </Text>
                <Text style={styles.ownerPriorityDropdownChevron}>
                  {priorityMenuOpen ? '▴' : '▾'}
                </Text>
              </Pressable>

              {priorityMenuOpen ? (
                <View style={styles.ownerPriorityDropdownMenu}>
                  {EMERGENCY_CONTACT_PRIORITY_OPTIONS.map((option) => {
                    const isActive = Number(priority) === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        onPress={() => {
                          setPriority(String(option.value));
                          setPriorityMenuOpen(false);
                        }}
                        style={({ pressed }) => [
                          styles.ownerPriorityDropdownItem,
                          isActive && styles.ownerPriorityDropdownItemActive,
                          pressed && styles.pressedButton,
                        ]}
                      >
                        <Text
                          style={[
                            styles.ownerFilterPillText,
                            isActive && styles.ownerFilterPillTextActive,
                          ]}
                        >
                          {formatEmergencyContactPriority(option.value)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={handleSaveContact}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressedButton,
                saving && { opacity: 0.75 },
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? 'Saving Contact...' : 'Save Contact'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={handleCancel}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressedButton,
                { marginTop: 12 },
              ]}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.parentSectionHeaderRow}>
              <Text style={styles.parentSectionHeaderTitle}>Emergency Contacts</Text>
              <Text style={styles.parentSectionHeaderSubtle}>
                {selectedChildContacts.length} on file
              </Text>
            </View>

            {loading ? (
              <Text style={styles.parentAttendanceStateText}>Loading emergency contacts...</Text>
            ) : selectedChildContacts.length ? (
              <View style={styles.profileList}>
                {selectedChildContacts.map((contact) => (
                  <View key={contact.id} style={styles.profileListRow}>
                    <View style={styles.profileListDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.profileListLabel}>{contact.full_name}</Text>
                      <Text style={styles.profileListValue}>{contact.relationship}</Text>
                      <Text style={styles.profileListValue}>{contact.phone}</Text>
                      <Text style={styles.profileListValue}>
                        {formatEmergencyContactPriority(contact.priority)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.parentAttendanceStateText}>No emergency contacts on file.</Text>
            )}
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

function NotificationsScreen({
  onBack,
  onLogout,
  messages,
  loading,
  error,
  expandedMessageId,
  onToggleMessage,
  title = 'Notifications',
  subtitle = 'Center updates and announcements',
  introTitle = 'Inbox',
  introText = 'Center updates and announcements',
}) {
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

            <Text style={styles.childProfileHeaderLabel}>{title}</Text>
          </View>

          <View style={styles.notificationsHeroMain}>
            <View style={styles.notificationsHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Mia Carter</Text>
              <View style={styles.notificationsHeroTag}>
                <Text style={styles.notificationsHeroTagText}>Messages</Text>
              </View>
              <Text style={styles.notificationsHeroSubtitle}>{subtitle}</Text>
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
          <RecipientMessagesSection
            title={introTitle}
            subtitle={introText}
            messages={messages}
            loading={loading}
            error={error}
            expandedMessageId={expandedMessageId}
            onToggleMessage={onToggleMessage}
          />

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

function NotificationHubScreen({
  onBack,
  onLogout,
  title = 'Notifications',
  subtitle = 'Center updates and announcements',
  badgeText = 'Notifications',
  introTitle = 'Overview',
  introText = 'What needs your attention right now.',
  cards = [],
  loading,
  error,
  emptyMessage = 'No notifications right now.',
}) {
  const totalCount = cards.reduce((sum, card) => sum + Number(card.count || 0), 0);

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

            <Text style={styles.childProfileHeaderLabel}>{title}</Text>
          </View>

          <View style={styles.notificationsHeroMain}>
            <View style={styles.notificationsHeroTextBlock}>
              <Text style={styles.parentHeroKicker}>Advanced Education</Text>
              <Text style={styles.parentHeroGreeting}>Notifications Center</Text>
              <View style={styles.notificationsHeroTag}>
                <Text style={styles.notificationsHeroTagText}>{badgeText}</Text>
              </View>
              <Text style={styles.notificationsHeroSubtitle}>{subtitle}</Text>
            </View>

            <View style={styles.parentHeroPhotoWrap}>
              <Image source={HEADER_PHOTO} resizeMode="cover" style={styles.parentHeroPhoto} />
            </View>
          </View>
        </View>

        <View style={styles.parentHomeContent}>
          <View style={styles.notificationsIntroCard}>
            <View style={styles.parentQuickSectionHeader}>
              <Text style={styles.parentSectionHeaderTitle}>{introTitle}</Text>
              <Text style={styles.parentSectionHeaderSubtle}>Tap a card for details</Text>
            </View>

            <Text style={styles.notificationsIntroText}>{introText}</Text>

            {loading ? (
              <Text style={styles.parentAttendanceStateText}>Loading notifications...</Text>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {!loading && !error && totalCount === 0 ? (
              <Text style={styles.parentAttendanceStateText}>{emptyMessage}</Text>
            ) : null}
          </View>

          <View style={styles.notificationsList}>
            {cards.map((card) => {
              const pillBackground = card.count > 0 ? 'rgba(15, 98, 254, 0.12)' : '#EEF2F6';
              const pillColor = card.count > 0 ? COLORS.blue : COLORS.muted;

              return (
                <Pressable
                  key={card.title}
                  accessibilityRole="button"
                  onPress={card.onPress}
                  style={({ pressed }) => [
                    styles.notificationCard,
                    card.count > 0 && styles.notificationCardUnread,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <View
                    style={[
                      styles.notificationAccentBar,
                      { backgroundColor: card.accent || COLORS.blue },
                    ]}
                  />

                  <View style={styles.notificationCardBody}>
                    <View style={styles.notificationCardTitleRow}>
                      <Text style={styles.notificationCardTitle}>{card.title}</Text>
                      <View style={[styles.notificationStatusPill, { backgroundColor: pillBackground }]}>
                        <Text style={[styles.notificationStatusPillText, { color: pillColor }]}>
                          {`Count: ${card.count}`}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.notificationCardMessage}>{card.description}</Text>

                    {card.timestamp ? (
                      <Text style={styles.notificationTime}>
                        {formatDateTime(card.timestamp)}
                      </Text>
                    ) : null}

                    <View style={styles.notificationMetaRow}>
                      <View
                        style={[
                          styles.notificationCategoryPill,
                          {
                            backgroundColor: 'rgba(15, 98, 254, 0.08)',
                            borderColor: card.accent || COLORS.blue,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.notificationCategoryPillText,
                            { color: card.accent || COLORS.blue },
                          ]}
                        >
                          {card.actionLabel || 'Open'}
                        </Text>
                      </View>

                      <Text style={styles.notificationTime}>›</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
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
  password,
  error,
  onChangeEmail,
  onChangePassword,
  onLogin,
  onFillTestAccount,
  onOpenActivateAccount,
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

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={true}
            onChangeText={onChangePassword}
            placeholder="Enter password"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            value={password}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            onPress={onLogin}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.primaryButtonText}>Enter Portal</Text>
          </Pressable>

          <View style={styles.inviteCodePrompt}>
            <Text style={styles.inviteCodeText}>Have an invite code?</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onOpenActivateAccount}
              style={({ pressed }) => [pressed && styles.buttonPressed]}
            >
              <Text style={styles.activateAccountText}>Activate Account</Text>
            </Pressable>
          </View>
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

function ActivateAccountScreen({
  email,
  code,
  password,
  confirmPassword,
  activationStep,
  activationError,
  onChangeEmail,
  onChangeCode,
  onChangePassword,
  onChangeConfirmPassword,
  onContinue,
  onBack,
}) {
  return (
    <View style={styles.loginPage}>
      <ImageBackground
        source={require('./assets/images/playground.png')}
        resizeMode="cover"
        style={styles.loginBackgroundImage}
      />
      <View style={styles.loginBackgroundOverlay} />

      <ScrollView contentContainerStyle={styles.loginScroll} keyboardShouldPersistTaps="handled">
        <View style={styles.loginCardPortal}>
          <View style={styles.loginCardHeaderPortal}>
            <View style={styles.loginCardHeaderText}>
              <Text style={styles.loginTitle}>Activate Account</Text>
              <Text style={styles.loginSubtitle}>Enter your email and invite code to continue.</Text>
            </View>
          </View>

          {activationStep === 'verify' ? (
            <>
              <Text style={styles.inputLabel}>Email</Text>
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
                onChangeText={(text) => onChangeCode(text.toUpperCase())}
                placeholder="MIA-4821"
                placeholderTextColor={COLORS.muted}
                style={styles.input}
                value={code}
              />
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={onChangePassword}
                placeholder="Create password"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={true}
                style={styles.input}
                value={password}
              />

              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={onChangeConfirmPassword}
                placeholder="Confirm password"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={true}
                style={styles.input}
                value={confirmPassword}
              />
            </>
          )}

          {activationError ? <Text style={styles.errorText}>{activationError}</Text> : null}

          <Pressable
            accessibilityRole="button"
            onPress={onContinue}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.primaryButtonText}>
              {activationStep === 'verify' ? 'Continue' : 'Activate Account'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
              { marginTop: 12 },
            ]}
          >
            <Text style={styles.secondaryButtonText}>Back to Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

export default function App() {
  const [email, setEmail] = useState('parent@test.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [screen, setScreen] = useState('login');
  const [activationEmail, setActivationEmail] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [activationPassword, setActivationPassword] = useState('');
  const [activationConfirmPassword, setActivationConfirmPassword] = useState('');
  const [activationError, setActivationError] = useState('');
  const [pendingInvite, setPendingInvite] = useState(null);
  const [activationStep, setActivationStep] = useState('verify');
  const [staffStatus, setStaffStatus] = useState(STAFF_MEMBER.status);
  const [lastClockInTime, setLastClockInTime] = useState('');
  const [lastClockOutTime, setLastClockOutTime] = useState('');
  const [staffBeforeAfterChildren, setStaffBeforeAfterChildren] = useState(() =>
    createStaffBeforeAfterChildren()
  );
  const [staffBeforeAfterSelectedChildId, setStaffBeforeAfterSelectedChildId] = useState(
    () => createStaffBeforeAfterChildren()[0]?.id ?? null
  );
  const [staffBeforeAfterPickupChildId, setStaffBeforeAfterPickupChildId] = useState(null);
  const [staffBeforeAfterLoading, setStaffBeforeAfterLoading] = useState(true);
  const [staffBeforeAfterError, setStaffBeforeAfterError] = useState('');
  const [staffBeforeAfterSavingChildId, setStaffBeforeAfterSavingChildId] = useState('');
  const [staffSummerCampGroups, setStaffSummerCampGroups] = useState(() =>
    createStaffSummerCampGroups()
  );
  const [staffSummerCampLoading, setStaffSummerCampLoading] = useState(true);
  const [staffSummerCampError, setStaffSummerCampError] = useState('');
  const [staffSummerCampSavingChildId, setStaffSummerCampSavingChildId] = useState('');
  const [staffSummerCampSendingGroup, setStaffSummerCampSendingGroup] = useState('');
  const [ownerSummerCampChildren, setOwnerSummerCampChildren] = useState([]);
  const [ownerSummerCampGroups, setOwnerSummerCampGroups] = useState([]);
  const [ownerSummerCampLoading, setOwnerSummerCampLoading] = useState(true);
  const [ownerSummerCampError, setOwnerSummerCampError] = useState('');
  const [ownerSummerCampSavingChildId, setOwnerSummerCampSavingChildId] = useState('');
  const [ownerSummerCampGroupPickerChildId, setOwnerSummerCampGroupPickerChildId] = useState('');
  const [ownerSummerCampSelectedGroupByChildId, setOwnerSummerCampSelectedGroupByChildId] =
    useState({});
  const [staffSummerCampSelectedGroup, setStaffSummerCampSelectedGroup] = useState(
    'Blue Group'
  );
  const [staffSummerCampOwnerStatus, setStaffSummerCampOwnerStatus] = useState({});
  const [ownerSummerCampSummary, setOwnerSummerCampSummary] = useState(
    OWNER_SUMMER_CAMP_INITIAL_SUMMARY
  );
  const [staffDailyNotesSavedEntries, setStaffDailyNotesSavedEntries] = useState([]);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [parentAttendanceLoading, setParentAttendanceLoading] = useState(true);
  const [parentAttendanceError, setParentAttendanceError] = useState('');
  const [parentAttendanceHistory, setParentAttendanceHistory] = useState([]);
  const [parentBeforeAfterLoading, setParentBeforeAfterLoading] = useState(true);
  const [parentBeforeAfterError, setParentBeforeAfterError] = useState('');
  const [parentBeforeAfterRecords, setParentBeforeAfterRecords] = useState([]);
  const [parentDailyNotesLoading, setParentDailyNotesLoading] = useState(true);
  const [parentDailyNotesError, setParentDailyNotesError] = useState('');
  const [parentDailyNotesHistory, setParentDailyNotesHistory] = useState([]);
  const [parentTimelineLoading, setParentTimelineLoading] = useState(true);
  const [parentTimelineError, setParentTimelineError] = useState('');
  const [parentTimelineHistory, setParentTimelineHistory] = useState([]);
  const [recipientMessages, setRecipientMessages] = useState([]);
  const [recipientMessagesLoading, setRecipientMessagesLoading] = useState(true);
  const [recipientMessagesError, setRecipientMessagesError] = useState('');
  const [recipientMessagesExpandedId, setRecipientMessagesExpandedId] = useState(null);
  const [ownerDailyNotesPending, setOwnerDailyNotesPending] = useState([]);
  const [ownerDailyNotesPendingLoading, setOwnerDailyNotesPendingLoading] = useState(true);
  const [ownerDailyNotesPendingError, setOwnerDailyNotesPendingError] = useState('');
  const [ownerDailyNotesReviewActionId, setOwnerDailyNotesReviewActionId] = useState('');
  const [ownerIncidentReportsPending, setOwnerIncidentReportsPending] = useState([]);
  const [ownerIncidentReportsPendingLoading, setOwnerIncidentReportsPendingLoading] =
    useState(true);
  const [ownerIncidentReportsPendingError, setOwnerIncidentReportsPendingError] = useState('');
  const [ownerIncidentReportsReviewActionId, setOwnerIncidentReportsReviewActionId] =
    useState('');
  const [ownerBeforeAfterCounts, setOwnerBeforeAfterCounts] = useState({
    droppedOff: 0,
    onBus: 0,
    returned: 0,
    pickedUp: 0,
  });
  const [ownerBeforeAfterCountsLoading, setOwnerBeforeAfterCountsLoading] = useState(true);
  const [ownerBeforeAfterCountsError, setOwnerBeforeAfterCountsError] = useState('');
  const [ownerMessagesExpandedId, setOwnerMessagesExpandedId] = useState(null);
  const [authorizedPickupRows, setAuthorizedPickupRows] = useState([]);
  const [authorizedPickupRowsLoading, setAuthorizedPickupRowsLoading] = useState(true);
  const [authorizedPickupRowsError, setAuthorizedPickupRowsError] = useState('');
  const [childProfileAccessibleChildren, setChildProfileAccessibleChildren] = useState([]);
  const [childProfileLoading, setChildProfileLoading] = useState(true);
  const [childProfileError, setChildProfileError] = useState('');
  const [childProfileLoadStartedAt, setChildProfileLoadStartedAt] = useState(null);
  const [childProfileAttendanceRows, setChildProfileAttendanceRows] = useState([]);
  const [childProfileBeforeAfterRows, setChildProfileBeforeAfterRows] = useState([]);
  const [childProfileDailyNotesRows, setChildProfileDailyNotesRows] = useState([]);
  const [childProfileIncidentRows, setChildProfileIncidentRows] = useState([]);
  const [childProfileSummerCampCheckIns, setChildProfileSummerCampCheckIns] = useState([]);
  const [childProfileSummerCampHeadcounts, setChildProfileSummerCampHeadcounts] = useState([]);
  const [childProfileCampGroups, setChildProfileCampGroups] = useState([]);
  const [staffIncidentChildren, setStaffIncidentChildren] = useState([]);
  const [staffIncidentChildrenLoading, setStaffIncidentChildrenLoading] = useState(true);
  const [staffIncidentChildrenError, setStaffIncidentChildrenError] = useState('');
  const [staffIncidentSelectedChildId, setStaffIncidentSelectedChildId] = useState('');
  const [staffIncidentLocation, setStaffIncidentLocation] = useState('');
  const [staffIncidentDescription, setStaffIncidentDescription] = useState('');
  const [staffIncidentActionTaken, setStaffIncidentActionTaken] = useState('');
  const [staffIncidentWitness, setStaffIncidentWitness] = useState('');
  const [staffIncidentSaving, setStaffIncidentSaving] = useState(false);
  const [staffIncidentRecentReports, setStaffIncidentRecentReports] = useState([]);
  const [staffIncidentRecentReportsLoading, setStaffIncidentRecentReportsLoading] =
    useState(true);
  const [staffIncidentRecentReportsError, setStaffIncidentRecentReportsError] = useState('');
  const [childProfilePickupRows, setChildProfilePickupRows] = useState([]);
  const [childProfilePickupLoading, setChildProfilePickupLoading] = useState(true);
  const [childProfilePickupError, setChildProfilePickupError] = useState('');
  const [childProfileSelectedChildId, setChildProfileSelectedChildId] = useState('');
  const [childProfileSelectedChild, setChildProfileSelectedChild] = useState(null);
  const childProfileSelectedChildRef = useRef(null);
  const [childProfileEmergencyRows, setChildProfileEmergencyRows] = useState([]);
  const [childProfileEmergencyLoading, setChildProfileEmergencyLoading] = useState(true);
  const [childProfileEmergencyError, setChildProfileEmergencyError] = useState('');
  const [parentIncidentReports, setParentIncidentReports] = useState([]);
  const [parentIncidentReportsLoading, setParentIncidentReportsLoading] = useState(true);
  const [parentIncidentReportsError, setParentIncidentReportsError] = useState('');
  const [parentIncidentAcknowledgingId, setParentIncidentAcknowledgingId] = useState('');
  const [parentLinkedChildren, setParentLinkedChildren] = useState([]);
  const [parentLinkedChildrenLoading, setParentLinkedChildrenLoading] = useState(true);
  const [parentLinkedChildrenError, setParentLinkedChildrenError] = useState('');

  useEffect(() => {
    childProfileSelectedChildRef.current = childProfileSelectedChild;
  }, [childProfileSelectedChild]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && session) {
      return;
    }
  }, [authLoading, session]);

  const loadParentAttendanceHistory = useCallback(async () => {
    if (!session?.user?.id) {
      setParentAttendanceHistory([]);
      setParentAttendanceError('');
      setParentAttendanceLoading(false);
      return;
    }

    setParentAttendanceLoading(true);
    setParentAttendanceError('');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'parent') {
      setParentAttendanceHistory([]);
      setParentAttendanceLoading(false);
      return;
    }

    const { data: linkRows, error: linksError } = await supabase
      .from('child_parent_links')
      .select('child_id')
      .eq('parent_profile_id', profile.id);

    if (linksError) {
      setParentAttendanceHistory([]);
      setParentAttendanceError(linksError.message || 'Could not load attendance history.');
      setParentAttendanceLoading(false);
      return;
    }

    const childIds = Array.from(
      new Set((Array.isArray(linkRows) ? linkRows : []).map((linkRow) => linkRow.child_id))
    );

    if (!childIds.length) {
      setParentAttendanceHistory([]);
      setParentAttendanceLoading(false);
      return;
    }

    const { data: childrenData, error: childrenError } = await supabase
      .from('children')
      .select('id, first_name, last_name, room')
      .in('id', childIds);

    if (childrenError) {
      setParentAttendanceHistory([]);
      setParentAttendanceError(childrenError.message || 'Could not load attendance history.');
      setParentAttendanceLoading(false);
      return;
    }

    const children = Array.isArray(childrenData) ? childrenData : [];

    const historyResults = await Promise.all(
      children.map(async (child) => {
        const { data: events, error: eventsError } = await supabase
          .from('attendance_events')
          .select('id, child_id, event_type, event_time')
          .eq('child_id', child.id)
          .order('event_time', { ascending: false });

        return {
          child,
          events: Array.isArray(events) ? events : [],
          error: eventsError,
        };
      })
    );

    const firstEventError = historyResults.find((result) => result.error)?.error;

    if (firstEventError) {
      setParentAttendanceError(firstEventError.message || 'Could not load attendance history.');
    }

    setParentAttendanceHistory(
      historyResults.map(({ child, events }) => ({
        id: child.id,
        name: `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unnamed Student',
        room: child.room || 'Room not set',
        events,
      }))
    );
    setParentAttendanceLoading(false);
  }, [session?.user?.id]);

  const loadParentBeforeAfterData = useCallback(async () => {
    if (!session?.user?.id) {
      setParentBeforeAfterRecords([]);
      setParentBeforeAfterError('');
      setParentBeforeAfterLoading(false);
      return;
    }

    setParentBeforeAfterLoading(true);
    setParentBeforeAfterError('');

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'parent') {
        setParentBeforeAfterRecords([]);
        setParentBeforeAfterLoading(false);
        return;
      }

      const { data: linkRows, error: linksError } = await supabase
        .from('child_parent_links')
        .select('child_id')
        .eq('parent_profile_id', profile.id);

      if (linksError) {
        throw new Error(linksError.message || 'Could not load Before & After Care.');
      }

      const childIds = Array.from(
        new Set((Array.isArray(linkRows) ? linkRows : []).map((linkRow) => linkRow.child_id))
      );

      if (!childIds.length) {
        setParentBeforeAfterRecords([]);
        setParentBeforeAfterLoading(false);
        return;
      }

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('id, first_name, last_name, room')
        .in('id', childIds);

      if (childrenError) {
        throw new Error(childrenError.message || 'Could not load Before & After Care.');
      }

      const children = Array.isArray(childrenData) ? childrenData : [];

      const { data: sessionRows, error: sessionError } = await supabase
        .from('before_after_care_sessions')
        .select(
          'id, child_id, date, drop_off_time, bus_departure_time, returned_time, pickup_time, morning_minutes, afternoon_minutes, total_minutes, status, created_at'
        )
        .in('child_id', childIds)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (sessionError) {
        throw new Error(sessionError.message || 'Could not load Before & After Care.');
      }

      const sessions = Array.isArray(sessionRows) ? sessionRows : [];
      const sessionsByChildId = sessions.reduce((acc, row) => {
        if (!acc[row.child_id]) {
          acc[row.child_id] = row;
        }
        return acc;
      }, {});

      const records = children
        .map((child) => {
          const sessionRow = sessionsByChildId[child.id];
          if (!sessionRow) {
            return null;
          }

          return {
            id: sessionRow.id,
            childId: child.id,
            childName:
              `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unnamed Student',
            room: child.room || 'Room not set',
            status: sessionRow.status || 'ready_for_drop_off',
            drop_off_time: sessionRow.drop_off_time,
            bus_departure_time: sessionRow.bus_departure_time,
            returned_time: sessionRow.returned_time,
            pickup_time: sessionRow.pickup_time,
            morning_minutes: sessionRow.morning_minutes,
            afternoon_minutes: sessionRow.afternoon_minutes,
            total_minutes: sessionRow.total_minutes,
          };
        })
        .filter(Boolean);

      setParentBeforeAfterRecords(records);
    } catch (loadError) {
      setParentBeforeAfterError(
        loadError?.message || 'Could not load Before & After Care.'
      );
      setParentBeforeAfterRecords([]);
    } finally {
      setParentBeforeAfterLoading(false);
    }
  }, [session?.user?.id]);

  const loadParentDailyNotes = useCallback(async () => {
    if (!session?.user?.id) {
      setParentDailyNotesHistory([]);
      setParentDailyNotesError('');
      setParentDailyNotesLoading(false);
      return;
    }

    setParentDailyNotesLoading(true);
    setParentDailyNotesError('');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'parent') {
      setParentDailyNotesHistory([]);
      setParentDailyNotesLoading(false);
      return;
    }

    const { data: linkRows, error: linksError } = await supabase
      .from('child_parent_links')
      .select('child_id')
      .eq('parent_profile_id', profile.id);

    if (linksError) {
      setParentDailyNotesHistory([]);
      setParentDailyNotesError(linksError.message || 'Could not load daily notes.');
      setParentDailyNotesLoading(false);
      return;
    }

    const childIds = Array.from(
      new Set((Array.isArray(linkRows) ? linkRows : []).map((linkRow) => linkRow.child_id))
    );

    if (!childIds.length) {
      setParentDailyNotesHistory([]);
      setParentDailyNotesLoading(false);
      return;
    }

    const { data: childrenData, error: childrenError } = await supabase
      .from('children')
      .select('id, first_name, last_name')
      .in('id', childIds);

    if (childrenError) {
      setParentDailyNotesHistory([]);
      setParentDailyNotesError(childrenError.message || 'Could not load daily notes.');
      setParentDailyNotesLoading(false);
      return;
    }

    const children = Array.isArray(childrenData) ? childrenData : [];
    const childById = children.reduce((acc, child) => {
      acc[child.id] = child;
      return acc;
    }, {});

    const { data: notesData, error: notesError } = await supabase
      .from('daily_notes')
      .select('id, child_id, date, quick_notes, custom_note, visibility, created_at')
      .in('child_id', childIds)
      .eq('review_status', 'approved')
      .order('created_at', { ascending: false });

    if (notesError) {
      setParentDailyNotesHistory([]);
      setParentDailyNotesError(notesError.message || 'Could not load daily notes.');
      setParentDailyNotesLoading(false);
      return;
    }

    const groupedNotes = (Array.isArray(notesData) ? notesData : []).reduce((acc, note) => {
      if (!acc[note.child_id]) {
        acc[note.child_id] = [];
      }

      acc[note.child_id].push(note);
      return acc;
    }, {});

    setParentDailyNotesHistory(
      childIds
        .map((childId) => {
          const child = childById[childId];

          if (!child) {
            return null;
          }

          return {
            id: child.id,
            name: `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unnamed Student',
            notes: groupedNotes[childId] || [],
          };
        })
        .filter(Boolean)
    );
    setParentDailyNotesLoading(false);
  }, [session?.user?.id]);

  const loadParentTimeline = useCallback(async () => {
    if (!session?.user?.id) {
      setParentTimelineHistory([]);
      setParentTimelineError('');
      setParentTimelineLoading(false);
      return;
    }

    setParentTimelineLoading(true);
    setParentTimelineError('');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'parent') {
      setParentTimelineHistory([]);
      setParentTimelineLoading(false);
      return;
    }

    const { data: linkRows, error: linksError } = await supabase
      .from('child_parent_links')
      .select('child_id')
      .eq('parent_profile_id', profile.id);

    if (linksError) {
      setParentTimelineHistory([]);
      setParentTimelineError(linksError.message || 'Could not load timeline.');
      setParentTimelineLoading(false);
      return;
    }

    const childIds = Array.from(
      new Set((Array.isArray(linkRows) ? linkRows : []).map((linkRow) => linkRow.child_id))
    );

    if (!childIds.length) {
      setParentTimelineHistory([]);
      setParentTimelineLoading(false);
      return;
    }

    const { data: childrenData, error: childrenError } = await supabase
      .from('children')
      .select('id, first_name, last_name, room')
      .in('id', childIds);

    if (childrenError) {
      setParentTimelineHistory([]);
      setParentTimelineError(childrenError.message || 'Could not load timeline.');
      setParentTimelineLoading(false);
      return;
    }

    const children = Array.isArray(childrenData) ? childrenData : [];

    const timelineResults = await Promise.all(
      children.map(async (child) => {
        const [attendanceResult, notesResult] = await Promise.all([
          supabase
            .from('attendance_events')
            .select('id, event_type, event_time, created_at')
            .eq('child_id', child.id)
            .order('event_time', { ascending: false }),
          supabase
            .from('daily_notes')
            .select('id, quick_notes, custom_note, created_at')
            .eq('child_id', child.id)
            .eq('review_status', 'approved')
            .order('created_at', { ascending: false }),
        ]);

        const attendanceEvents = Array.isArray(attendanceResult.data) ? attendanceResult.data : [];
        const dailyNotes = Array.isArray(notesResult.data) ? notesResult.data : [];
        const attendanceError = attendanceResult.error;
        const notesError = notesResult.error;

        return {
          child,
          items: [
            ...attendanceEvents.map((event) => ({
              id: `attendance-${event.id}`,
              childId: child.id,
              childName: `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unnamed Student',
              childRoom: child.room || 'Room not set',
              type: 'attendance',
              title: event.event_type === 'check_in' ? 'Checked In' : 'Checked Out',
              timestamp: event.event_time || event.created_at,
              quick_notes: [],
              custom_note: '',
            })),
            ...dailyNotes.map((note) => ({
              id: `daily-note-${note.id}`,
              childId: child.id,
              childName: `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unnamed Student',
              childRoom: child.room || 'Room not set',
              type: 'daily_note',
              title: 'Daily Note',
              timestamp: note.created_at,
              quick_notes: Array.isArray(note.quick_notes) ? note.quick_notes : [],
              custom_note: note.custom_note || '',
            })),
          ],
          error: attendanceError || notesError || null,
        };
      })
    );

    const firstTimelineError = timelineResults.find((result) => result.error)?.error;

    if (firstTimelineError) {
      setParentTimelineError(firstTimelineError.message || 'Could not load timeline.');
    }

    const mergedTimeline = timelineResults
      .flatMap((result) => result.items)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setParentTimelineHistory(mergedTimeline);
    setParentTimelineLoading(false);
  }, [session?.user?.id]);

  const loadOwnerDailyNotesReview = useCallback(async () => {
    if (!session?.user?.id) {
      setOwnerDailyNotesPending([]);
      setOwnerDailyNotesPendingError('');
      setOwnerDailyNotesPendingLoading(false);
      setOwnerDailyNotesReviewActionId('');
      return;
    }

    setOwnerDailyNotesPendingLoading(true);
    setOwnerDailyNotesPendingError('');
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'owner') {
        setOwnerDailyNotesPending([]);
        setOwnerDailyNotesPendingError('');
        setOwnerDailyNotesReviewActionId('');
        return;
      }

      const { data: notesData, error: notesError } = await supabase
        .from('daily_notes')
        .select(
          'id, child_id, date, quick_notes, custom_note, visibility, created_at, review_status, reviewed_at'
        )
        .eq('review_status', 'pending')
        .order('created_at', { ascending: false });

      if (notesError) {
        setOwnerDailyNotesPending([]);
        setOwnerDailyNotesPendingError(notesError.message || 'Could not load daily notes.');
        return;
      }

      const pendingNotes = Array.isArray(notesData) ? notesData : [];
      const childIds = Array.from(
        new Set(pendingNotes.map((note) => note.child_id).filter(Boolean))
      );

      let childById = {};

      if (childIds.length) {
        const { data: childrenData } = await supabase
          .from('children')
          .select('id, first_name, last_name')
          .in('id', childIds);

        childById = (Array.isArray(childrenData) ? childrenData : []).reduce((acc, child) => {
          acc[child.id] = child;
          return acc;
        }, {});
      }

      setOwnerDailyNotesPending(
        pendingNotes.map((note) => {
          const child = childById[note.child_id];
          const childName = child
            ? `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unnamed Student'
            : 'Unnamed Student';

          return {
            ...note,
            childName,
          };
        })
      );
    } catch (loadError) {
      const message = loadError?.message || 'Could not load daily notes.';
      setOwnerDailyNotesPending([]);
      setOwnerDailyNotesPendingError(message);
    } finally {
      setOwnerDailyNotesPendingLoading(false);
    }
  }, [session?.user?.id]);

  const loadOwnerIncidentReportsReview = useCallback(async () => {
    if (!session?.user?.id) {
      setOwnerIncidentReportsPending([]);
      setOwnerIncidentReportsPendingError('');
      setOwnerIncidentReportsPendingLoading(false);
      setOwnerIncidentReportsReviewActionId('');
      return;
    }

    setOwnerIncidentReportsPendingLoading(true);
    setOwnerIncidentReportsPendingError('');

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'owner') {
        setOwnerIncidentReportsPending([]);
        setOwnerIncidentReportsPendingError('');
        setOwnerIncidentReportsReviewActionId('');
        return;
      }

      const { data: reportRows, error: reportsError } = await supabase
        .from('incident_reports')
        .select(
          'id, child_id, created_at, location, description, action_taken, staff_witness, review_status, reviewed_at, reviewed_by, parent_acknowledged_at'
        )
        .eq('review_status', 'pending')
        .order('created_at', { ascending: false });

      if (reportsError) {
        setOwnerIncidentReportsPending([]);
        setOwnerIncidentReportsPendingError(reportsError.message || 'Could not load incident reports.');
        return;
      }

      const pendingReports = Array.isArray(reportRows) ? reportRows : [];
      const childIds = Array.from(
        new Set(pendingReports.map((report) => report.child_id).filter(Boolean))
      );

      let childById = {};

      if (childIds.length) {
        const { data: childrenData } = await supabase
          .from('children')
          .select('id, first_name, last_name')
          .in('id', childIds);

        childById = (Array.isArray(childrenData) ? childrenData : []).reduce((acc, child) => {
          acc[child.id] = child;
          return acc;
        }, {});
      }

      setOwnerIncidentReportsPending(
        pendingReports.map((report) => {
          const child = childById[report.child_id];
          const childName = child
            ? `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unnamed Student'
            : 'Unnamed Student';

          return {
            ...report,
            childName,
          };
        })
      );
    } catch (loadError) {
      const message = loadError?.message || 'Could not load incident reports.';
      setOwnerIncidentReportsPending([]);
      setOwnerIncidentReportsPendingError(message);
    } finally {
      setOwnerIncidentReportsPendingLoading(false);
    }
  }, [session?.user?.id]);

  const loadStaffIncidentReportsData = useCallback(async () => {
    if (!session?.user?.id) {
      setStaffIncidentChildren([]);
      setStaffIncidentSelectedChildId('');
      setStaffIncidentChildrenError('');
      setStaffIncidentChildrenLoading(false);
      setStaffIncidentRecentReports([]);
      setStaffIncidentRecentReportsError('');
      setStaffIncidentRecentReportsLoading(false);
      return;
    }

    setStaffIncidentChildrenLoading(true);
    setStaffIncidentRecentReportsLoading(true);
    setStaffIncidentChildrenError('');
    setStaffIncidentRecentReportsError('');

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'staff') {
        setStaffIncidentChildren([]);
        setStaffIncidentSelectedChildId('');
        setStaffIncidentRecentReports([]);
        return;
      }

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('id, first_name, last_name, room, status')
        .eq('status', 'active')
        .order('first_name', { ascending: true });

      if (childrenError) {
        throw new Error(childrenError.message || 'Could not load active children.');
      }

      const activeChildren = Array.isArray(childrenData) ? childrenData : [];
      setStaffIncidentChildren(activeChildren);
      setStaffIncidentSelectedChildId((current) => {
        if (activeChildren.length === 1) {
          return activeChildren[0].id;
        }
        if (current && activeChildren.some((child) => child.id === current)) {
          return current;
        }
        return activeChildren[0]?.id || '';
      });

      const { data: recentRows, error: recentError } = await supabase
        .from('incident_reports')
        .select(
          'id, child_id, created_at, location, description, action_taken, staff_witness, review_status, reviewed_at, reviewed_by'
        )
        .eq('created_by_profile_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) {
        throw new Error(recentError.message || 'Could not load incident reports.');
      }

      const childById = activeChildren.reduce((acc, child) => {
        acc[child.id] = child;
        return acc;
      }, {});

      setStaffIncidentRecentReports(
        (Array.isArray(recentRows) ? recentRows : []).map((report) => {
          const child = childById[report.child_id];
          return {
            ...report,
            childName: child
              ? `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unnamed Student'
              : 'Unnamed Student',
          };
        })
      );
    } catch (loadError) {
      const message = loadError?.message || 'Could not load incident reports.';
      setStaffIncidentChildren([]);
      setStaffIncidentSelectedChildId('');
      setStaffIncidentRecentReports([]);
      setStaffIncidentChildrenError(message);
      setStaffIncidentRecentReportsError(message);
    } finally {
      setStaffIncidentChildrenLoading(false);
      setStaffIncidentRecentReportsLoading(false);
    }
  }, [session?.user?.id]);

  const loadParentIncidentReports = useCallback(async () => {
    if (!session?.user?.id) {
      setParentIncidentReports([]);
      setParentIncidentReportsError('');
      setParentIncidentReportsLoading(false);
      return;
    }

    setParentIncidentReportsLoading(true);
    setParentIncidentReportsError('');

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'parent') {
        setParentIncidentReports([]);
        setParentIncidentReportsError('');
        return;
      }

      const { data: linkRows, error: linksError } = await supabase
        .from('child_parent_links')
        .select('child_id')
        .eq('parent_profile_id', profile.id);

      if (linksError) {
        throw new Error(linksError.message || 'Could not load incident reports.');
      }

      const childIds = Array.from(
        new Set((Array.isArray(linkRows) ? linkRows : []).map((linkRow) => linkRow.child_id))
      );

      if (!childIds.length) {
        setParentIncidentReports([]);
        return;
      }

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('id, first_name, last_name')
        .in('id', childIds);

      if (childrenError) {
        throw new Error(childrenError.message || 'Could not load incident reports.');
      }

      const childById = (Array.isArray(childrenData) ? childrenData : []).reduce((acc, child) => {
        acc[child.id] = child;
        return acc;
      }, {});

      const { data: reportRows, error: reportsError } = await supabase
        .from('incident_reports')
        .select(
          'id, child_id, created_at, location, description, action_taken, staff_witness, review_status, reviewed_at, reviewed_by, parent_acknowledged_at'
        )
        .in('child_id', childIds)
        .eq('review_status', 'approved')
        .order('created_at', { ascending: false });

      if (reportsError) {
        throw new Error(reportsError.message || 'Could not load incident reports.');
      }

      setParentIncidentReports(
        (Array.isArray(reportRows) ? reportRows : []).map((report) => {
          const child = childById[report.child_id];
          const childName = child
            ? `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unnamed Student'
            : 'Unnamed Student';

          return {
            ...report,
            childName,
          };
        })
      );
    } catch (loadError) {
      setParentIncidentReports([]);
      setParentIncidentReportsError(loadError?.message || 'Could not load incident reports.');
    } finally {
      setParentIncidentReportsLoading(false);
    }
  }, [session?.user?.id]);

  const loadParentLinkedChildren = useCallback(async () => {
    if (!session?.user?.id) {
      setParentLinkedChildren([]);
      setParentLinkedChildrenError('');
      setParentLinkedChildrenLoading(false);
      return;
    }

    setParentLinkedChildrenLoading(true);
    setParentLinkedChildrenError('');

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'parent') {
        setParentLinkedChildren([]);
        return;
      }

      const { data: linkRows, error: linksError } = await supabase
        .from('child_parent_links')
        .select('child_id')
        .eq('parent_profile_id', profile.id);

      if (linksError) {
        throw new Error(linksError.message || 'Could not load linked children.');
      }

      const childIds = Array.from(
        new Set((Array.isArray(linkRows) ? linkRows : []).map((linkRow) => linkRow.child_id))
      );

      if (!childIds.length) {
        setParentLinkedChildren([]);
        return;
      }

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('id, first_name, last_name, room, status, profile_accent_color')
        .in('id', childIds)
        .order('first_name', { ascending: true });

      if (childrenError) {
        throw new Error(childrenError.message || 'Could not load linked children.');
      }

      setParentLinkedChildren(Array.isArray(childrenData) ? childrenData : []);
    } catch (loadError) {
      setParentLinkedChildren([]);
      setParentLinkedChildrenError(loadError?.message || 'Could not load linked children.');
    } finally {
      setParentLinkedChildrenLoading(false);
    }
  }, [session?.user?.id]);

  const loadOwnerBeforeAfterCounts = useCallback(async () => {
    if (!session?.user?.id) {
      setOwnerBeforeAfterCounts({ droppedOff: 0, onBus: 0, returned: 0, pickedUp: 0 });
      setOwnerBeforeAfterCountsError('');
      setOwnerBeforeAfterCountsLoading(false);
      return;
    }

    setOwnerBeforeAfterCountsLoading(true);
    setOwnerBeforeAfterCountsError('');

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'owner') {
        setOwnerBeforeAfterCounts({ droppedOff: 0, onBus: 0, returned: 0, pickedUp: 0 });
        setOwnerBeforeAfterCountsError('');
        return;
      }

      const { data: sessionRows, error: sessionError } = await supabase
        .from('before_after_care_sessions')
        .select('id, status')
        .eq('date', today);

      if (sessionError) {
        throw new Error(sessionError.message || 'Could not load Before & After Care counts.');
      }

      const counts = (Array.isArray(sessionRows) ? sessionRows : []).reduce(
        (acc, row) => {
          if (row.status === 'dropped_off') acc.droppedOff += 1;
          if (row.status === 'on_bus') acc.onBus += 1;
          if (row.status === 'returned') acc.returned += 1;
          if (row.status === 'picked_up') acc.pickedUp += 1;
          return acc;
        },
        { droppedOff: 0, onBus: 0, returned: 0, pickedUp: 0 }
      );

      setOwnerBeforeAfterCounts(counts);
    } catch (loadError) {
      setOwnerBeforeAfterCounts({ droppedOff: 0, onBus: 0, returned: 0, pickedUp: 0 });
      setOwnerBeforeAfterCountsError(
        loadError?.message || 'Could not load Before & After Care counts.'
      );
    } finally {
      setOwnerBeforeAfterCountsLoading(false);
    }
  }, [session?.user?.id]);

  const loadOwnerSummerCampData = useCallback(async () => {
    if (!session?.user?.id) {
      setOwnerSummerCampChildren([]);
      setOwnerSummerCampGroups([]);
      setOwnerSummerCampSummary(OWNER_SUMMER_CAMP_INITIAL_SUMMARY);
      setOwnerSummerCampError('');
      setOwnerSummerCampLoading(false);
      setOwnerSummerCampGroupPickerChildId('');
      setOwnerSummerCampSelectedGroupByChildId({});
      return;
    }

    setOwnerSummerCampLoading(true);
    setOwnerSummerCampError('');

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'owner') {
        setOwnerSummerCampChildren([]);
        setOwnerSummerCampGroups([]);
        setOwnerSummerCampSummary(OWNER_SUMMER_CAMP_INITIAL_SUMMARY);
        setOwnerSummerCampGroupPickerChildId('');
        setOwnerSummerCampSelectedGroupByChildId({});
        setOwnerSummerCampLoading(false);
        return;
      }

      const [childrenResponse, groupsResponse, sessionsResponse] = await Promise.all([
        supabase
          .from('children')
          .select('id, first_name, last_name, room, profile_accent_color, status')
          .eq('status', 'active'),
        supabase.from('camp_groups').select('*'),
        supabase
          .from('camp_check_ins')
          .select('id, child_id, camp_group_id, date, checked_in_at, status, camp_group:camp_groups(*)')
          .eq('date', today)
          .order('checked_in_at', { ascending: false }),
      ]);

      if (childrenResponse.error) {
        throw new Error(
          childrenResponse.error.message || 'Could not load Summer Camp check-in children.'
        );
      }

      if (groupsResponse.error) {
        throw new Error(groupsResponse.error.message || 'Could not load camp groups.');
      }

      if (sessionsResponse.error) {
        throw new Error(sessionsResponse.error.message || 'Could not load camp check-ins.');
      }

      const children = Array.isArray(childrenResponse.data) ? childrenResponse.data : [];
      const groups = Array.isArray(groupsResponse.data) ? groupsResponse.data : [];
      const sessions = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : [];

      const groupById = groups.reduce((acc, group) => {
        if (group?.id != null) {
          acc[group.id] = group;
        }
        return acc;
      }, {});

      const sessionByChildId = sessions.reduce((acc, row) => {
        if (!acc[row.child_id]) {
          acc[row.child_id] = row;
        }
        return acc;
      }, {});

      const selectedGroupByChildId = {};
      const mappedChildren = children.map((child) => {
        const sessionRow = sessionByChildId[child.id] || null;
        const sessionGroup = sessionRow?.camp_group || groupById[sessionRow?.camp_group_id] || null;
        const assignedGroupName = getCampGroupDisplayName(sessionGroup);
        const selectedGroupId = sessionRow?.camp_group_id || '';

        if (selectedGroupId) {
          selectedGroupByChildId[child.id] = selectedGroupId;
        }

        return {
          id: child.id,
          name:
            `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unnamed Student',
          room: child.room || '',
          status: sessionRow?.status === 'checked_in' ? 'Checked In' : 'Not Checked In',
          checkInStatus: sessionRow?.status === 'checked_in' ? 'Checked In' : 'Not Checked In',
          groupName: assignedGroupName || child.room || 'No group assigned',
          selectedGroupId,
          assignedGroupName: assignedGroupName || '',
          checkInTime: sessionRow?.checked_in_at || '',
          lastUpdateTime: sessionRow?.checked_in_at || 'Pending',
          campCheckInStatus: sessionRow?.status === 'checked_in' ? 'Checked In' : 'Not Checked In',
          sessionRow,
        };
      });

      const summary = OWNER_SUMMER_CAMP_GROUP_NAMES.reduce(
        (acc, groupName) => {
          acc[groupName] = 0;
          return acc;
        },
        { total: 0 }
      );

      sessions.forEach((row) => {
        const groupName =
          getCampGroupDisplayName(row.camp_group) ||
          getCampGroupDisplayName(groupById[row.camp_group_id]) ||
          '';

        if (groupName && Object.prototype.hasOwnProperty.call(summary, groupName)) {
          summary[groupName] += 1;
        }

        summary.total += 1;
      });

      setOwnerSummerCampChildren(mappedChildren);
      setOwnerSummerCampGroups(groups);
      setOwnerSummerCampSummary(summary);
      setOwnerSummerCampSelectedGroupByChildId((current) => {
        const next = { ...selectedGroupByChildId };

        Object.keys(current).forEach((childId) => {
          if (!next[childId] && current[childId]) {
            next[childId] = current[childId];
          }
        });

        return next;
      });

      setOwnerSummerCampGroupPickerChildId((current) =>
        mappedChildren.some((child) => child.id === current) ? current : ''
      );
    } catch (loadError) {
      setOwnerSummerCampChildren([]);
      setOwnerSummerCampGroups([]);
      setOwnerSummerCampSummary(OWNER_SUMMER_CAMP_INITIAL_SUMMARY);
      setOwnerSummerCampError(loadError?.message || 'Could not load Summer Camp check-in data.');
      setOwnerSummerCampSelectedGroupByChildId({});
      setOwnerSummerCampGroupPickerChildId('');
    } finally {
      setOwnerSummerCampLoading(false);
    }
  }, [session?.user?.id]);

  const loadStaffSummerCampData = useCallback(async () => {
    if (!session?.user?.id) {
      setStaffSummerCampGroups(createStaffSummerCampGroups());
      setStaffSummerCampOwnerStatus({});
      setStaffSummerCampLoading(false);
      setStaffSummerCampError('');
      setStaffSummerCampSavingChildId('');
      setStaffSummerCampSendingGroup('');
      return;
    }

    setStaffSummerCampLoading(true);
    setStaffSummerCampError('');

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile || (profile.role !== 'staff' && profile.role !== 'owner')) {
        setStaffSummerCampGroups(createStaffSummerCampGroups());
        setStaffSummerCampOwnerStatus({});
        setStaffSummerCampLoading(false);
        return;
      }

      const { data: campGroupsData, error: campGroupsError } = await supabase
        .from('camp_groups')
        .select('*');

      if (campGroupsError) {
        throw new Error(campGroupsError.message || 'Could not load camp groups.');
      }

      const campGroups = Array.isArray(campGroupsData) ? campGroupsData : [];
      const groupById = campGroups.reduce((acc, group) => {
        if (group?.id != null) {
          acc[group.id] = group;
        }
        return acc;
      }, {});

      const groupIdByName = campGroups.reduce((acc, group) => {
        const canonicalName = getCampGroupCanonicalName(group);
        if (canonicalName) {
          acc[canonicalName] = group.id;
        }
        return acc;
      }, {});

      const { data: checkInData, error: checkInError } = await supabase
        .from('camp_check_ins')
        .select('id, child_id, camp_group_id, date, checked_in_at, status')
        .eq('date', today)
        .eq('status', 'checked_in')
        .order('checked_in_at', { ascending: false });

      if (checkInError) {
        throw new Error(checkInError.message || 'Could not load camp check-ins.');
      }

      const checkIns = Array.isArray(checkInData) ? checkInData : [];
      const childIds = Array.from(new Set(checkIns.map((row) => row.child_id).filter(Boolean)));
      const groupIds = Array.from(
        new Set(checkIns.map((row) => row.camp_group_id).filter(Boolean))
      );

      const [childrenResult, headcountsResult] = await Promise.all([
        childIds.length
          ? supabase.from('children').select('id, first_name, last_name').in('id', childIds)
          : Promise.resolve({ data: [], error: null }),
        groupIds.length
          ? supabase
              .from('camp_headcounts')
              .select(
                'id, camp_group_id, date, status, owner_checked_in_count, counselor_confirmed_count, submitted_at'
              )
              .eq('date', today)
              .in('camp_group_id', groupIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (childrenResult.error) {
        throw new Error(childrenResult.error.message || 'Could not load camp children.');
      }

      if (headcountsResult.error) {
        throw new Error(headcountsResult.error.message || 'Could not load camp headcounts.');
      }

      const children = Array.isArray(childrenResult.data) ? childrenResult.data : [];
      const childById = children.reduce((acc, child) => {
        acc[child.id] = child;
        return acc;
      }, {});

      const headcountRows = Array.isArray(headcountsResult.data) ? headcountsResult.data : [];
      const headcountByGroupId = headcountRows.reduce((acc, row) => {
        acc[row.camp_group_id] = row;
        return acc;
      }, {});

      const headcountIds = headcountRows.map((row) => row.id).filter(Boolean);
      const confirmedRows = headcountIds.length
        ? await supabase
            .from('camp_headcount_children')
            .select('id, camp_headcount_id, child_id, confirmed_present, confirmed_at')
            .in('camp_headcount_id', headcountIds)
        : { data: [], error: null };

      if (confirmedRows.error) {
        throw new Error(
          confirmedRows.error.message || 'Could not load camp headcount confirmations.'
        );
      }

      const confirmationByChildId = (Array.isArray(confirmedRows.data) ? confirmedRows.data : [])
        .filter((row) => row.confirmed_present)
        .reduce((acc, row) => {
          acc[row.child_id] = row;
          return acc;
        }, {});

      const groupedChildren = STAFF_CAMP_GROUP_NAMES.reduce((acc, groupName) => {
        acc[groupName] = [];
        return acc;
      }, {});

      checkIns.forEach((row) => {
        const groupName =
          getCampGroupCanonicalName(groupById[row.camp_group_id]) ||
          getCampGroupCanonicalName(row.camp_group_id) ||
          '';

        if (!groupName) {
          return;
        }

        const child = childById[row.child_id];
        if (!child) {
          return;
        }

        groupedChildren[groupName].push({
          id: child.id,
          name:
            `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unnamed Camper',
          campGroupId: row.camp_group_id,
          checkedInAt: row.checked_in_at || '',
          checkInStatus: 'Checked In',
          groupConfirmationStatus: confirmationByChildId[row.child_id]
            ? 'Confirmed Present'
            : 'Not Confirmed',
          confirmedAt: confirmationByChildId[row.child_id]?.confirmed_at || '',
          lastUpdateTime: row.checked_in_at || '',
          campCheckInId: row.id,
          headcountChildId: confirmationByChildId[row.child_id]?.id || null,
        });
      });

      const nextSelectedGroup = STAFF_CAMP_GROUP_NAMES.includes(staffSummerCampSelectedGroup)
        ? staffSummerCampSelectedGroup
        : STAFF_CAMP_GROUP_NAMES[0] || 'Blue Group';

      const nextOwnerStatus = STAFF_CAMP_GROUP_NAMES.reduce((acc, groupName) => {
        const groupId = groupIdByName[groupName];
        const headcountRow = groupId ? headcountByGroupId[groupId] : null;
        const roster = groupedChildren[groupName] || [];
        const confirmedCount = roster.filter(
          (child) => child.groupConfirmationStatus === 'Confirmed Present'
        ).length;

        acc[groupName] = {
          id: headcountRow?.id || null,
          status: headcountRow?.status || 'pending',
          submittedAt: headcountRow?.submitted_at || '',
          ownerCheckedInCount: headcountRow?.owner_checked_in_count ?? roster.length,
          counselorConfirmedCount:
            headcountRow?.counselor_confirmed_count ?? confirmedCount,
          campGroupId: groupId || null,
        };

        return acc;
      }, {});

      setStaffSummerCampGroups(groupedChildren);
      setStaffSummerCampOwnerStatus(nextOwnerStatus);
      setStaffSummerCampSelectedGroup(nextSelectedGroup);
    } catch (loadError) {
      setStaffSummerCampGroups(createStaffSummerCampGroups());
      setStaffSummerCampOwnerStatus({});
      setStaffSummerCampError(loadError?.message || 'Could not load summer camp headcount.');
    } finally {
      setStaffSummerCampLoading(false);
      setStaffSummerCampSavingChildId('');
      setStaffSummerCampSendingGroup('');
    }
  }, [session?.user?.id, staffSummerCampSelectedGroup]);

  const loadRecipientMessages = useCallback(async () => {
    if (!session?.user?.id) {
      setRecipientMessages([]);
      setRecipientMessagesError('');
      setRecipientMessagesLoading(false);
      setRecipientMessagesExpandedId(null);
      return;
    }

    setRecipientMessagesLoading(true);
    setRecipientMessagesError('');

    try {
      const { data, error } = await supabase
        .from('message_recipients')
        .select(
          'id, delivered_at, read_at, recipient_profile_id, message_id, message:messages(id, title, body, message_type, audience_type, created_at)'
        )
        .eq('recipient_profile_id', session.user.id)
        .order('delivered_at', { ascending: false });

      if (error) {
        setRecipientMessages([]);
        setRecipientMessagesError(error.message || 'Could not load messages.');
        return;
      }

      const rows = Array.isArray(data) ? data : [];
      setRecipientMessages(
        rows.map((row) => {
          const message = Array.isArray(row.message) ? row.message[0] : row.message;
          return {
            id: row.id,
            deliveredAt: row.delivered_at,
            readAt: row.read_at,
            recipientProfileId: row.recipient_profile_id,
            messageId: row.message_id,
            title: message?.title || 'Message',
            body: message?.body || '',
            messageType: message?.message_type || 'announcement',
            audienceType: message?.audience_type || 'all_parents',
            createdAt: message?.created_at || row.delivered_at,
          };
        })
      );
    } catch (loadError) {
      setRecipientMessages([]);
      setRecipientMessagesError(loadError?.message || 'Could not load messages.');
    } finally {
      setRecipientMessagesLoading(false);
    }
  }, [session?.user?.id]);

  const loadAuthorizedPickupRows = useCallback(async () => {
    if (!session?.user?.id) {
      setAuthorizedPickupRows([]);
      setAuthorizedPickupRowsError('');
      setAuthorizedPickupRowsLoading(false);
      return;
    }

    setAuthorizedPickupRowsLoading(true);
    setAuthorizedPickupRowsError('');

    try {
      const { data, error } = await supabase
        .from('authorized_pickups')
        .select('id, child_id, full_name, relationship, phone_number, notes, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Could not load authorized pickups.');
      }

      setAuthorizedPickupRows(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setAuthorizedPickupRows([]);
      setAuthorizedPickupRowsError(loadError?.message || 'Could not load authorized pickups.');
    } finally {
      setAuthorizedPickupRowsLoading(false);
    }
  }, [session?.user?.id]);

  const loadStaffBeforeAfterData = useCallback(async () => {
    if (!session?.user?.id) {
      setStaffBeforeAfterChildren([]);
      setStaffBeforeAfterSelectedChildId(null);
      setStaffBeforeAfterLoading(false);
      setStaffBeforeAfterError('');
      return;
    }

    setStaffBeforeAfterLoading(true);
    setStaffBeforeAfterError('');

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: childRows, error: childError } = await supabase
        .from('children')
        .select('id, first_name, last_name, room, status, profile_accent_color')
        .eq('status', 'active')
        .order('first_name', { ascending: true });

      if (childError) {
        throw new Error(childError.message || 'Could not load before & after care students.');
      }

      const children = Array.isArray(childRows) ? childRows : [];
      const childIds = children.map((child) => child.id).filter(Boolean);

      if (!childIds.length) {
        setStaffBeforeAfterChildren([]);
        setStaffBeforeAfterSelectedChildId(null);
        return;
      }

      const { startIso, endIso } = getTodayIsoRange();

      const [{ data: sessionRows, error: sessionError }, { data: eventRows, error: eventError }] =
        await Promise.all([
          supabase
            .from('before_after_care_sessions')
            .select(
              'id, child_id, date, drop_off_time, bus_departure_time, returned_time, pickup_time, morning_minutes, afternoon_minutes, total_minutes, status, created_at'
            )
            .in('child_id', childIds)
            .eq('date', today)
            .order('created_at', { ascending: false }),
          supabase
            .from('attendance_events')
            .select('id, child_id, event_type, event_time')
            .in('child_id', childIds)
            .gte('event_time', startIso)
            .lt('event_time', endIso)
            .order('event_time', { ascending: false }),
        ]);

      if (sessionError) {
        throw new Error(sessionError.message || 'Could not load before & after care sessions.');
      }

      if (eventError) {
        throw new Error(eventError.message || 'Could not load attendance events.');
      }

      const latestSessionByChildId = {};
      (Array.isArray(sessionRows) ? sessionRows : []).forEach((row) => {
        if (!latestSessionByChildId[row.child_id]) {
          latestSessionByChildId[row.child_id] = row;
        }
      });

      const eventsByChildId = (Array.isArray(eventRows) ? eventRows : []).reduce((acc, row) => {
        if (!acc[row.child_id]) {
          acc[row.child_id] = [];
        }
        acc[row.child_id].push(row);
        return acc;
      }, {});

      const mappedChildren = children.map((child) => {
        const sessionRow = latestSessionByChildId[child.id] || null;
        const stage = deriveBeforeAfterStage(sessionRow);
        const timeline = getBeforeAfterTimelineEntries(sessionRow, eventsByChildId[child.id]);

        return {
          id: child.id,
          name:
            `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unnamed Student',
          stage,
          accentGroup: child.profile_accent_color || child.room || 'Blue Group',
          status: getBeforeAfterStatusLabel(sessionRow),
          lastUpdateTime: getBeforeAfterLatestTime(sessionRow),
          programBadge: 'Before & After Care',
          dropOffTime: sessionRow?.drop_off_time || '',
          busTime: sessionRow?.bus_departure_time || '',
          returnedTime: sessionRow?.returned_time || '',
          pickupTime: sessionRow?.pickup_time || '',
          morningMinutes: sessionRow?.morning_minutes ?? null,
          afternoonMinutes: sessionRow?.afternoon_minutes ?? null,
          totalMinutes: sessionRow?.total_minutes ?? null,
          pickup: { authorizedPickups: [] },
          timeline,
          sessionRow,
          canDropOff: !sessionRow?.drop_off_time,
          canPutOnBus: !!sessionRow?.drop_off_time && !sessionRow?.bus_departure_time,
          canReturned: !!sessionRow?.bus_departure_time && !sessionRow?.returned_time,
          canParentPickup: !!sessionRow?.returned_time && !sessionRow?.pickup_time,
        };
      });

      setStaffBeforeAfterChildren(mappedChildren);
      setStaffBeforeAfterSelectedChildId((current) => {
        if (current && mappedChildren.some((child) => child.id === current)) {
          return current;
        }
        return mappedChildren[0]?.id ?? null;
      });
      setStaffBeforeAfterPickupChildId((current) =>
        current && mappedChildren.some((child) => child.id === current) ? current : null
      );
    } catch (loadError) {
      setStaffBeforeAfterError(
        loadError?.message || 'Could not load before & after care students.'
      );
      setStaffBeforeAfterChildren([]);
      setStaffBeforeAfterSelectedChildId(null);
    } finally {
      setStaffBeforeAfterLoading(false);
    }
  }, [session?.user?.id]);

  const handleStaffBeforeAfterAction = useCallback(
    async (childId, action) => {
      const child = staffBeforeAfterChildren.find((entry) => entry.id === childId);

      if (!child || staffBeforeAfterSavingChildId) {
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const existingSession = child.sessionRow || null;

      const baseSessionPayload = {
        child_id: childId,
        date: today,
        status: child.status,
        drop_off_time: child.dropOffTime || null,
        bus_departure_time: child.busTime || null,
        returned_time: child.returnedTime || null,
        pickup_time: child.pickupTime || null,
        morning_minutes: Number.isFinite(Number(child.sessionRow?.morning_minutes))
          ? Number(child.sessionRow.morning_minutes)
          : null,
        afternoon_minutes: Number.isFinite(Number(child.sessionRow?.afternoon_minutes))
          ? Number(child.sessionRow.afternoon_minutes)
          : null,
        total_minutes: Number.isFinite(Number(child.sessionRow?.total_minutes))
          ? Number(child.sessionRow.total_minutes)
          : null,
      };

      let nextSessionPayload = null;
      let nextEventType = null;

      if (action === 'drop-off') {
        if (existingSession?.drop_off_time) {
          return;
        }

        nextSessionPayload = {
          ...baseSessionPayload,
          drop_off_time: now,
          status: 'dropped_off',
        };
        nextEventType = 'parent_drop_off';
      }

      if (action === 'put-on-bus') {
        if (!existingSession?.drop_off_time || existingSession?.bus_departure_time) {
          return;
        }

        const morningMinutes = Math.max(
          0,
          Math.round((new Date(now).getTime() - new Date(existingSession.drop_off_time).getTime()) / 60000)
        );

        nextSessionPayload = {
          ...baseSessionPayload,
          drop_off_time: existingSession.drop_off_time,
          bus_departure_time: now,
          morning_minutes: morningMinutes,
          status: 'on_bus',
        };
        nextEventType = 'put_on_bus';
      }

      if (action === 'returned') {
        if (!existingSession?.bus_departure_time || existingSession?.returned_time) {
          return;
        }

        nextSessionPayload = {
          ...baseSessionPayload,
          drop_off_time: existingSession.drop_off_time,
          bus_departure_time: existingSession.bus_departure_time,
          returned_time: now,
          morning_minutes: Number.isFinite(Number(existingSession.morning_minutes))
            ? Number(existingSession.morning_minutes)
            : Math.max(
                0,
                Math.round(
                  (new Date(existingSession.bus_departure_time).getTime() -
                    new Date(existingSession.drop_off_time).getTime()) /
                    60000
                )
              ),
          status: 'returned',
        };
        nextEventType = 'returned_from_bus';
      }

      if (action === 'parent-pickup') {
        if (!existingSession?.returned_time || existingSession?.pickup_time) {
          return;
        }

        const afternoonMinutes = Math.max(
          0,
          Math.round((new Date(now).getTime() - new Date(existingSession.returned_time).getTime()) / 60000)
        );
        const morningMinutes = Number.isFinite(Number(existingSession.morning_minutes))
          ? Number(existingSession.morning_minutes)
          : Math.max(
              0,
              Math.round(
                (new Date(existingSession.bus_departure_time).getTime() -
                  new Date(existingSession.drop_off_time).getTime()) /
                  60000
              )
            );

        nextSessionPayload = {
          ...baseSessionPayload,
          drop_off_time: existingSession.drop_off_time,
          bus_departure_time: existingSession.bus_departure_time,
          returned_time: existingSession.returned_time,
          pickup_time: now,
          morning_minutes: morningMinutes,
          afternoon_minutes: afternoonMinutes,
          total_minutes: morningMinutes + afternoonMinutes,
          status: 'picked_up',
        };
        nextEventType = 'parent_pickup';
      }

      if (!nextSessionPayload || !nextEventType) {
        return;
      }

      setStaffBeforeAfterSavingChildId(childId);
      setStaffBeforeAfterError('');

      const sessionTable = supabase.from('before_after_care_sessions');
      const { error: sessionSaveError } = existingSession?.id
        ? await sessionTable.update(nextSessionPayload).eq('id', existingSession.id)
        : await sessionTable.insert(nextSessionPayload);

      if (sessionSaveError) {
        setStaffBeforeAfterError(
          sessionSaveError.message || 'Could not save before & after care session.'
        );
        setStaffBeforeAfterSavingChildId('');
        return;
      }

      const { error: eventSaveError } = await supabase.from('attendance_events').insert({
        child_id: childId,
        event_type: nextEventType,
        event_time: now,
      });

      if (eventSaveError) {
        setStaffBeforeAfterError(eventSaveError.message || 'Could not save attendance event.');
        setStaffBeforeAfterSavingChildId('');
        return;
      }

      await loadStaffBeforeAfterData();
      setStaffBeforeAfterSavingChildId('');
    },
    [
      loadStaffBeforeAfterData,
      staffBeforeAfterChildren,
      staffBeforeAfterSavingChildId,
    ]
  );

  const confirmBeforeAfterPickup = useCallback(async () => {
    if (!staffBeforeAfterPickupChildId) {
      return;
    }

    await handleStaffBeforeAfterAction(staffBeforeAfterPickupChildId, 'parent-pickup');
    setStaffBeforeAfterPickupChildId(null);
  }, [handleStaffBeforeAfterAction, staffBeforeAfterPickupChildId]);

  const loadChildProfileData = useCallback(
    async (childId) => {
      console.log('ChildProfile selected child', childProfileSelectedChildRef.current);
      console.log('ChildProfile childId argument', childId);
      console.log('Loading child profile data for', childId);

      if (!session?.user?.id) {
        setChildProfileError('No child selected.');
        setChildProfileLoading(false);
        setChildProfileLoadStartedAt(null);
        setChildProfilePickupLoading(false);
        setChildProfileEmergencyLoading(false);
        setChildProfilePickupRows([]);
        setChildProfileEmergencyRows([]);
        setChildProfileAttendanceRows([]);
        setChildProfileBeforeAfterRows([]);
        setChildProfileDailyNotesRows([]);
        setChildProfileIncidentRows([]);
        setChildProfileSummerCampCheckIns([]);
        setChildProfileSummerCampHeadcounts([]);
        setChildProfileCampGroups([]);
        return;
      }

      if (!childId) {
        setChildProfileError('No child selected.');
        setChildProfileLoading(false);
        setChildProfileLoadStartedAt(null);
        setChildProfilePickupLoading(false);
        setChildProfileEmergencyLoading(false);
        setChildProfilePickupRows([]);
        setChildProfileEmergencyRows([]);
        setChildProfileAttendanceRows([]);
        setChildProfileBeforeAfterRows([]);
        setChildProfileDailyNotesRows([]);
        setChildProfileIncidentRows([]);
        setChildProfileSummerCampCheckIns([]);
        setChildProfileSummerCampHeadcounts([]);
        setChildProfileCampGroups([]);
        return;
      }

      setChildProfileLoadStartedAt(Date.now());
      setChildProfileLoading(true);
      setChildProfileError('');
      setChildProfilePickupLoading(true);
      setChildProfileEmergencyLoading(true);

      const clearProfileRows = () => {
        setChildProfilePickupRows([]);
        setChildProfileEmergencyRows([]);
        setChildProfileAttendanceRows([]);
        setChildProfileBeforeAfterRows([]);
        setChildProfileDailyNotesRows([]);
        setChildProfileIncidentRows([]);
        setChildProfileSummerCampCheckIns([]);
        setChildProfileSummerCampHeadcounts([]);
        setChildProfileCampGroups([]);
      };

      const safeSelect = async (label, queryFactory) => {
        try {
          const { data, error } = await queryFactory();
          if (error) {
            console.log(`Child profile ${label} load error`, error);
            return [];
          }
          return Array.isArray(data) ? data : [];
        } catch (error) {
          console.log(`Child profile ${label} load error`, error);
          return [];
        }
      };

      try {
        let profileRole = null;
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.log('Child profile profile load error', profileError);
        }

        profileRole = profile?.role || null;

        let accessibleChildren = [];

        if (profileRole === 'parent') {
          const { data: links, error: linksError } = await supabase
            .from('child_parent_links')
            .select('child_id')
            .eq('parent_profile_id', session.user.id);

          if (linksError) {
            console.log('Child profile links load error', linksError);
          }

          const childIds = Array.from(
            new Set((Array.isArray(links) ? links : []).map((link) => link.child_id).filter(Boolean))
          );

          if (childIds.length) {
            const { data: childrenData, error: childrenError } = await supabase
              .from('children')
              .select('*')
              .in('id', childIds)
              .order('first_name', { ascending: true });

            if (childrenError) {
              console.log('Child profile children load error', childrenError);
            }

            accessibleChildren = Array.isArray(childrenData) ? childrenData : [];
          }
        } else if (profileRole) {
          const { data: childrenData, error: childrenError } = await supabase
            .from('children')
            .select('*')
            .order('first_name', { ascending: true });

          if (childrenError) {
            console.log('Child profile children load error', childrenError);
          }

          accessibleChildren = Array.isArray(childrenData) ? childrenData : [];
        }

        setChildProfileAccessibleChildren(accessibleChildren);

        const resolvedChild =
          accessibleChildren.find((child) => child.id === childId) ||
          accessibleChildren[0] ||
          childProfileSelectedChildRef.current ||
          null;

        if (!resolvedChild?.id) {
          setChildProfileSelectedChild(null);
          setChildProfileSelectedChildId('');
          clearProfileRows();
          setChildProfileError('No child selected.');
          return;
        }

        setChildProfileSelectedChild(resolvedChild);
        setChildProfileSelectedChildId(resolvedChild.id);

        const selectedChildId = resolvedChild.id;

        const [
          pickups,
          emergency,
          attendance,
          beforeAfter,
          dailyNotes,
          incident,
          campCheckIns,
          campHeadcounts,
          campGroups,
        ] = await Promise.all([
          safeSelect('authorized pickups', () =>
            supabase
              .from('authorized_pickups')
              .select('id, child_id, full_name, relationship, phone, created_at')
              .eq('child_id', selectedChildId)
              .order('created_at', { ascending: false })
          ),
          safeSelect('emergency contacts', () =>
            supabase
              .from('emergency_contacts')
              .select('id, child_id, full_name, relationship, phone, priority, created_at')
              .eq('child_id', selectedChildId)
              .order('priority', { ascending: true })
          ),
          safeSelect('attendance events', () =>
            supabase
              .from('attendance_events')
              .select('id, child_id, event_type, event_time')
              .eq('child_id', selectedChildId)
              .order('event_time', { ascending: false })
          ),
          safeSelect('before/after care', () =>
            supabase
              .from('before_after_care_sessions')
              .select(
                'id, child_id, date, drop_off_time, bus_departure_time, returned_time, pickup_time, morning_minutes, afternoon_minutes, total_minutes, status, created_at'
              )
              .eq('child_id', selectedChildId)
              .order('date', { ascending: false })
              .order('created_at', { ascending: false })
          ),
          safeSelect('daily notes', () =>
            supabase
              .from('daily_notes')
              .select(
                'id, child_id, date, quick_notes, custom_note, visibility, created_at, review_status'
              )
              .eq('child_id', selectedChildId)
              .eq('review_status', 'approved')
              .order('created_at', { ascending: false })
          ),
          safeSelect('incident reports', () =>
            supabase
              .from('incident_reports')
              .select(
                'id, child_id, created_at, location, description, action_taken, staff_witness, review_status, reviewed_at, reviewed_by, parent_acknowledged_at'
              )
              .eq('child_id', selectedChildId)
              .eq('review_status', 'approved')
              .order('created_at', { ascending: false })
          ),
          safeSelect('camp check ins', () =>
            supabase
              .from('camp_check_ins')
              .select('id, child_id, camp_group_id, date, checked_in_at, status, created_at')
              .eq('child_id', selectedChildId)
              .order('date', { ascending: false })
          ),
          safeSelect('camp headcounts', () =>
            supabase
              .from('camp_headcounts')
              .select(
                'id, child_id, camp_group_id, date, status, owner_checked_in_count, counselor_confirmed_count, submitted_at, created_at'
              )
              .eq('child_id', selectedChildId)
              .order('date', { ascending: false })
          ),
          safeSelect('camp groups', () =>
            supabase.from('camp_groups').select('*').order('created_at', { ascending: true })
          ),
        ]);

        setChildProfileCampGroups(campGroups);
        setChildProfilePickupRows(pickups);
        setChildProfileEmergencyRows(emergency);
        setChildProfileAttendanceRows(attendance);
        setChildProfileBeforeAfterRows(beforeAfter);
        setChildProfileDailyNotesRows(dailyNotes);
        setChildProfileIncidentRows(incident);
        setChildProfileSummerCampCheckIns(campCheckIns);
        setChildProfileSummerCampHeadcounts(campHeadcounts);

        console.log('Child profile data loaded');
      } catch (error) {
        console.log('Child profile load error', error);
        setChildProfileError(error.message || 'Could not load child profile.');
        clearProfileRows();
      } finally {
        setChildProfileLoading(false);
        setChildProfilePickupLoading(false);
        setChildProfileEmergencyLoading(false);
        setChildProfileLoadStartedAt(null);
      }
    },
    [session?.user?.id]
  );

  useEffect(() => {
    if (screen !== 'child-profile' || !childProfileLoading || !childProfileLoadStartedAt) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setChildProfileError((current) =>
        current || 'Could not load full profile. Showing available child info.'
      );
      setChildProfileLoading(false);
      setChildProfilePickupLoading(false);
      setChildProfileEmergencyLoading(false);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [screen, childProfileLoadStartedAt, childProfileLoading]);

  const loadParentDashboardData = useCallback(async () => {
    if (!session?.user?.id) {
      return;
    }

    console.log('Loading parent dashboard data');
    await Promise.all([
      loadParentLinkedChildren(),
      loadParentAttendanceHistory(),
      loadParentBeforeAfterData(),
      loadParentDailyNotes(),
      loadParentTimeline(),
      loadParentIncidentReports(),
    ]);
  }, [
    loadParentAttendanceHistory,
    loadParentBeforeAfterData,
    loadParentDailyNotes,
    loadParentLinkedChildren,
    loadParentTimeline,
    loadParentIncidentReports,
    session?.user?.id,
  ]);

  const markRecipientMessageRead = useCallback(
    async (recipientMessageId) => {
      const currentItem = recipientMessages.find((item) => item.id === recipientMessageId);
      if (!currentItem || currentItem.readAt) {
        return;
      }

      const now = new Date().toISOString();

      const { error } = await supabase
        .from('message_recipients')
        .update({ read_at: now })
        .eq('id', recipientMessageId);

      if (error) {
        setRecipientMessagesError(error.message || 'Could not mark message as read.');
        return;
      }

      setRecipientMessages((current) =>
        current.map((item) =>
          item.id === recipientMessageId
            ? {
                ...item,
                readAt: now,
              }
            : item
        )
      );
    },
    [recipientMessages]
  );

  const handleToggleRecipientMessage = useCallback(
    async (recipientMessage) => {
      setRecipientMessagesExpandedId((current) =>
        current === recipientMessage.id ? null : recipientMessage.id
      );

      if (!recipientMessage.readAt) {
        await markRecipientMessageRead(recipientMessage.id);
      }
    },
    [markRecipientMessageRead]
  );

  const markVisibleRecipientMessagesRead = useCallback(async () => {
    if (!session?.user?.id) {
      return;
    }

    if (screen !== 'parent-messages' && screen !== 'staff-messages') {
      return;
    }

    const now = new Date().toISOString();
    console.log('Marking messages read');

    const { data, error } = await supabase
      .from('message_recipients')
      .update({ read_at: now })
      .eq('recipient_profile_id', session.user.id)
      .is('read_at', null)
      .select('id, message_id, recipient_profile_id, read_at');

    console.log('Mark read result', { data, error });

    if (error) {
      console.log(error);
      setRecipientMessagesError(error.message || 'Could not mark messages as read.');
      return;
    }

    if (Array.isArray(data) && data.length) {
      setRecipientMessages((current) =>
        current.map((item) =>
          item.readAt
            ? item
            : {
                ...item,
                readAt: now,
              }
        )
      );
    }

    await loadRecipientMessages();
  }, [loadRecipientMessages, screen, session?.user?.id]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (screen !== 'parent-messages' && screen !== 'staff-messages') {
      return;
    }

    markVisibleRecipientMessagesRead();
  }, [authLoading, markVisibleRecipientMessagesRead, screen]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (screen === 'parent-home' && session?.user?.id) {
      loadParentDashboardData();
    }
  }, [screen, session?.user?.id, authLoading, loadParentDashboardData]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (screen !== 'child-profile') {
      return;
    }

    const selectedChildId =
      childProfileSelectedChild?.id ||
      childProfileSelectedChildId ||
      childProfileSelectedChildRef.current?.id ||
      null;

    if (selectedChildId) {
      console.log('Opening child profile for child id', selectedChildId);
      loadChildProfileData(selectedChildId);
      return;
    }

    if (parentLinkedChildren.length === 1 && parentLinkedChildren[0]?.id) {
      const fallbackChild = parentLinkedChildren[0];
      setChildProfileSelectedChild({
        id: fallbackChild.id,
        first_name: fallbackChild.first_name || '',
        last_name: fallbackChild.last_name || '',
        room: fallbackChild.room || '',
        status: fallbackChild.status || '',
        profile_accent_color: fallbackChild.profile_accent_color || '',
      });
      setChildProfileSelectedChildId(fallbackChild.id);
      console.log('Opening child profile for child id', fallbackChild.id);
      loadChildProfileData(fallbackChild.id);
    }
  }, [
    authLoading,
    loadChildProfileData,
    parentLinkedChildren,
    childProfileSelectedChild?.id,
    childProfileSelectedChildId,
    screen,
  ]);

  const handleOwnerDailyNoteReviewDecision = useCallback(
    async (note, reviewStatus) => {
      setOwnerDailyNotesReviewActionId(note.id);

      try {
        const { error: updateError } = await supabase
          .from('daily_notes')
          .update(
            reviewStatus === 'approved'
              ? {
                  review_status: 'approved',
                  visibility: 'both',
                  reviewed_at: new Date().toISOString(),
                }
              : {
                  review_status: 'rejected',
                  visibility: 'owner',
                  reviewed_at: new Date().toISOString(),
                }
          )
          .eq('id', note.id);

        if (updateError) {
          const message = updateError.message || 'Could not update daily note.';
          setOwnerDailyNotesPendingError(message);
          Alert.alert('Could not update daily note.', message);
          return;
        }

        setOwnerDailyNotesPendingError('');
        await loadOwnerDailyNotesReview();
        Alert.alert(
          reviewStatus === 'approved' ? 'Daily note approved.' : 'Daily note rejected.'
        );
      } finally {
        setOwnerDailyNotesReviewActionId('');
      }
    },
    [loadOwnerDailyNotesReview]
  );

  const handleSubmitIncidentReport = useCallback(async () => {
    const selectedChild = staffIncidentChildren.find(
      (child) => child.id === staffIncidentSelectedChildId
    );
    const cleanLocation = staffIncidentLocation.trim();
    const cleanDescription = staffIncidentDescription.trim();
    const cleanActionTaken = staffIncidentActionTaken.trim();
    const cleanWitness = staffIncidentWitness.trim();

    if (!session?.user?.id) {
      return;
    }

    if (!selectedChild) {
      Alert.alert('Select a child first.');
      return;
    }

    if (!cleanLocation || !cleanDescription || !cleanActionTaken || !cleanWitness) {
      Alert.alert('Please complete all incident report fields.');
      return;
    }

    setStaffIncidentSaving(true);

    try {
      const { error: insertError } = await supabase.from('incident_reports').insert({
        child_id: selectedChild.id,
        created_by_profile_id: session.user.id,
        location: cleanLocation,
        description: cleanDescription,
        action_taken: cleanActionTaken,
        staff_witness: cleanWitness,
        review_status: 'pending',
      });

      if (insertError) {
        throw new Error(insertError.message || 'Could not submit incident report.');
      }

      setStaffIncidentLocation('');
      setStaffIncidentDescription('');
      setStaffIncidentActionTaken('');
      setStaffIncidentWitness('');
      await loadStaffIncidentReportsData();
      await loadOwnerIncidentReportsReview();
      Alert.alert('Incident report sent to owner for review.');
    } catch (submitError) {
      Alert.alert('Could not submit incident report.', submitError?.message || 'Try again.');
    } finally {
      setStaffIncidentSaving(false);
    }
  }, [
    loadOwnerIncidentReportsReview,
    loadStaffIncidentReportsData,
    session?.user?.id,
    staffIncidentActionTaken,
    staffIncidentChildren,
    staffIncidentDescription,
    staffIncidentLocation,
    staffIncidentSelectedChildId,
    staffIncidentWitness,
  ]);

  const handleOwnerIncidentReviewDecision = useCallback(
    async (report, reviewStatus) => {
      if (!session?.user?.id || !report?.id) {
        return;
      }

      setOwnerIncidentReportsReviewActionId(report.id);

      try {
        const { error: updateError } = await supabase
          .from('incident_reports')
          .update({
            review_status: reviewStatus,
            reviewed_by: session.user.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', report.id);

        if (updateError) {
          throw new Error(updateError.message || 'Could not update incident report.');
        }

        await loadOwnerIncidentReportsReview();
        await loadParentIncidentReports();
        await loadStaffIncidentReportsData();
        Alert.alert(
          reviewStatus === 'approved' ? 'Incident report approved.' : 'Incident report rejected.'
        );
      } catch (reviewError) {
        Alert.alert('Could not update incident report.', reviewError?.message || 'Try again.');
      } finally {
        setOwnerIncidentReportsReviewActionId('');
      }
    },
    [loadOwnerIncidentReportsReview, loadParentIncidentReports, loadStaffIncidentReportsData, session?.user?.id]
  );

  const handleParentAcknowledgeIncidentReport = useCallback(
    async (report) => {
      if (!session?.user?.id || !report?.id) {
        return;
      }

      setParentIncidentAcknowledgingId(report.id);

      try {
        const { error: updateError } = await supabase
          .from('incident_reports')
          .update({
            parent_acknowledged_at: new Date().toISOString(),
          })
          .eq('id', report.id);

        if (updateError) {
          throw new Error(updateError.message || 'Could not acknowledge incident report.');
        }

        await loadParentIncidentReports();
        Alert.alert('Report acknowledged.');
      } catch (ackError) {
        Alert.alert('Could not acknowledge report.', ackError?.message || 'Try again.');
      } finally {
        setParentIncidentAcknowledgingId('');
      }
    },
    [loadParentIncidentReports, session?.user?.id]
  );

  const handleToggleOwnerRecentMessage = useCallback((messageId) => {
    setOwnerMessagesExpandedId((current) => (current === messageId ? null : messageId));
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    loadRecipientMessages();
    loadAuthorizedPickupRows();
    loadOwnerBeforeAfterCounts();
    loadOwnerSummerCampData();
    loadStaffSummerCampData();
    loadStaffBeforeAfterData();
    loadOwnerDailyNotesReview();
    loadOwnerIncidentReportsReview();
    loadStaffIncidentReportsData();
  }, [
    authLoading,
    loadAuthorizedPickupRows,
    loadStaffBeforeAfterData,
    loadOwnerDailyNotesReview,
    loadOwnerBeforeAfterCounts,
    loadOwnerSummerCampData,
    loadStaffSummerCampData,
    loadOwnerIncidentReportsReview,
    loadStaffIncidentReportsData,
    loadRecipientMessages,
  ]);

  async function handleSupabaseLogin(loginEmail, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error) {
      console.log('Supabase login failed');
      return false;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      console.log('Supabase login failed');
      return false;
    }

    if (profile.role === 'owner') {
      setScreen('owner-home');
    } else if (profile.role === 'staff') {
      setScreen('staff-home');
    } else if (profile.role === 'parent') {
      setScreen('parent-home');
    } else {
      console.log('Supabase login failed');
      return false;
    }

    console.log('Supabase login success');
    return true;
  }

  const handleLogin = async () => {
    const supabaseLoginSucceeded = await handleSupabaseLogin(email, password);

    if (supabaseLoginSucceeded) {
      return;
    }

    console.log('Using mock login');
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = password.trim().toUpperCase();

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
    setPassword(account.code);
    setError('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setScreen('login');
    setError('');
    setParentAttendanceLoading(true);
    setParentAttendanceError('');
    setParentAttendanceHistory([]);
    setParentDailyNotesLoading(true);
    setParentDailyNotesError('');
    setParentDailyNotesHistory([]);
    setParentTimelineLoading(true);
    setParentTimelineError('');
    setParentTimelineHistory([]);
    setOwnerDailyNotesPendingLoading(true);
    setOwnerDailyNotesPendingError('');
    setOwnerDailyNotesPending([]);
    setOwnerDailyNotesReviewActionId('');
    setOwnerIncidentReportsPendingLoading(true);
    setOwnerIncidentReportsPendingError('');
    setOwnerIncidentReportsPending([]);
    setOwnerIncidentReportsReviewActionId('');
    setStaffStatus(STAFF_MEMBER.status);
    setLastClockInTime('');
    setLastClockOutTime('');
    setStaffBeforeAfterChildren(createStaffBeforeAfterChildren());
    setStaffBeforeAfterSelectedChildId(createStaffBeforeAfterChildren()[0]?.id ?? null);
    setStaffBeforeAfterPickupChildId(null);
    setStaffSummerCampGroups(createStaffSummerCampGroups());
    setStaffSummerCampLoading(true);
    setStaffSummerCampError('');
    setStaffSummerCampSavingChildId('');
    setStaffSummerCampSendingGroup('');
    setOwnerSummerCampChildren([]);
    setOwnerSummerCampGroups([]);
    setOwnerSummerCampLoading(true);
    setOwnerSummerCampError('');
    setOwnerSummerCampSavingChildId('');
    setOwnerSummerCampGroupPickerChildId('');
    setOwnerSummerCampSelectedGroupByChildId({});
    setStaffSummerCampSelectedGroup('Blue Group');
    setStaffSummerCampOwnerStatus({});
    setOwnerSummerCampSummary(OWNER_SUMMER_CAMP_INITIAL_SUMMARY);
    setStaffDailyNotesSavedEntries([]);
    setChildProfileAccessibleChildren([]);
    setChildProfileSelectedChild(null);
    setChildProfileLoading(true);
    setChildProfileError('');
    setChildProfilePickupRows([]);
    setChildProfilePickupLoading(true);
    setChildProfilePickupError('');
    setChildProfileEmergencyRows([]);
    setChildProfileEmergencyLoading(true);
    setChildProfileEmergencyError('');
    setChildProfileAttendanceRows([]);
    setChildProfileBeforeAfterRows([]);
    setChildProfileDailyNotesRows([]);
    setChildProfileIncidentRows([]);
    setChildProfileSummerCampCheckIns([]);
    setChildProfileSummerCampHeadcounts([]);
    setChildProfileCampGroups([]);
    setStaffIncidentChildren([]);
    setStaffIncidentChildrenLoading(true);
    setStaffIncidentChildrenError('');
    setStaffIncidentSelectedChildId('');
    setStaffIncidentLocation('');
    setStaffIncidentDescription('');
    setStaffIncidentActionTaken('');
    setStaffIncidentWitness('');
    setStaffIncidentSaving(false);
    setStaffIncidentRecentReports([]);
    setStaffIncidentRecentReportsLoading(true);
    setStaffIncidentRecentReportsError('');
    setParentIncidentReports([]);
    setParentIncidentReportsLoading(true);
    setParentIncidentReportsError('');
    setParentIncidentAcknowledgingId('');
    setParentLinkedChildren([]);
    setParentLinkedChildrenLoading(true);
    setParentLinkedChildrenError('');
  };

  const openActivateAccountScreen = () => {
    setActivationEmail('');
    setActivationCode('');
    setActivationPassword('');
    setActivationConfirmPassword('');
    setActivationError('');
    setPendingInvite(null);
    setActivationStep('verify');
    setScreen('activate-account');
  };

  const closeActivateAccountScreen = () => {
    setActivationEmail('');
    setActivationCode('');
    setActivationPassword('');
    setActivationConfirmPassword('');
    setActivationError('');
    setPendingInvite(null);
    setActivationStep('verify');
    setScreen('login');
  };

  const handleActivateAccountContinue = async () => {
    if (activationStep === 'verify') {
      const normalizedEmail = activationEmail.trim().toLowerCase();
      const normalizedCode = activationCode.trim().toUpperCase();

      const { data, error } = await supabase.rpc('verify_invite_code', {
        input_email: normalizedEmail,
        input_code: normalizedCode,
      });

      if (error || !data || data.length === 0) {
        setActivationError('Invite code not found or already used.');
        return;
      }

      setActivationError('');
      setPendingInvite(data[0]);
      setActivationStep('password');
      return;
    }

    const trimmedPassword = activationPassword.trim();
    if (!trimmedPassword) {
      setActivationError('Password cannot be empty.');
      return;
    }

    if (activationPassword !== activationConfirmPassword) {
      setActivationError('Passwords do not match.');
      return;
    }

    if (!pendingInvite) {
      setActivationError('Invite code not found or already used.');
      setActivationStep('verify');
      return;
    }

    setActivationError('');

    const { data, error } = await supabase.auth.signUp({
      email: activationEmail,
      password: activationPassword,
    });

    if (error || !data?.user) {
      setActivationError(error?.message || 'Unable to create account.');
      return;
    }

    console.log('Account created');

    const profileInsertResult = await supabase.from('profiles').insert({
      id: data.user.id,
      email: activationEmail,
      role: pendingInvite.invite_role,
      account_status: 'active',
    });

    if (profileInsertResult.error) {
      setActivationError(profileInsertResult.error.message || 'Unable to create profile.');
      return;
    }

    console.log('Profile created');

    console.log('Redeem invite payload', {
      input_email: activationEmail,
      input_code: activationCode,
      input_user_id: data.user.id,
      pendingInvite,
    });

    const { data: redeemRows, error: redeemError } = await supabase.rpc('redeem_invite_by_id', {
      input_invite_id: pendingInvite.invite_id,
      input_user_id: data.user.id,
    });

    console.log('Redeem invite by id result', {
      redeemRows,
      redeemError,
    });

    if (redeemError || !redeemRows || redeemRows.length === 0) {
      setActivationError('Account was created, but invite code was not marked used.');
      return;
    }

    console.log('Invite marked used');

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: activationEmail,
      password: activationPassword,
    });

    if (signInError || !signInData?.user) {
      setActivationError(signInError?.message || 'Unable to sign in.');
      return;
    }

    console.log('Auto login success');

    const routeRole = pendingInvite.invite_role;
    if (routeRole === 'parent') {
      setScreen('parent-home');
    } else if (routeRole === 'staff') {
      setScreen('staff-home');
    } else {
      setActivationError('Unsupported account type.');
      return;
    }

    setActivationError('');
    setActivationStep('verify');
    setPendingInvite(null);
  };

  const toggleStaffStatus = () => {
    if (staffStatus === 'Checked Out') {
      setStaffStatus('Checked In');
      setLastClockInTime(STAFF_CLOCK_CURRENT_TIME);
      return;
    }

    setStaffStatus('Checked Out');
    setLastClockOutTime(STAFF_CLOCK_CURRENT_TIME);
  };

  const openBeforeAfterPickup = (childId) => {
    const child = staffBeforeAfterChildren.find((entry) => entry.id === childId);
    if (!child || !child.canParentPickup) {
      return;
    }

    setStaffBeforeAfterPickupChildId(childId);
  };

  const confirmCampPresent = useCallback(
    async (groupName, childId) => {
      const currentGroup = staffSummerCampGroups[groupName] || [];
      const existing = currentGroup.find((child) => child.id === childId);

      if (
        !existing ||
        existing.checkInStatus !== 'Checked In' ||
        !existing.campCheckInId ||
        !existing.campGroupId
      ) {
        return;
      }

      if (existing.groupConfirmationStatus === 'Confirmed Present') {
        Alert.alert('Confirmed', 'This camper is already confirmed present.');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const ownerCheckedInCount = currentGroup.length;
      const existingHeadcount = staffSummerCampOwnerStatus[groupName] || null;

      setStaffSummerCampSavingChildId(childId);
      setStaffSummerCampError('');

      try {
        let headcountId = existingHeadcount?.id || null;

        if (!headcountId) {
          const { data: insertedHeadcount, error: insertHeadcountError } = await supabase
            .from('camp_headcounts')
            .insert({
              camp_group_id: existing.campGroupId,
              date: today,
              status: 'pending',
              owner_checked_in_count: ownerCheckedInCount,
              counselor_confirmed_count: 0,
            })
            .select('id')
            .single();

          if (insertHeadcountError) {
            throw new Error(
              insertHeadcountError.message || 'Could not create camp headcount.'
            );
          }

          headcountId = insertedHeadcount?.id || null;
        } else {
          const { error: updateHeadcountError } = await supabase
            .from('camp_headcounts')
            .update({
              owner_checked_in_count: ownerCheckedInCount,
              status: 'pending',
            })
            .eq('id', headcountId);

          if (updateHeadcountError) {
            throw new Error(
              updateHeadcountError.message || 'Could not update camp headcount.'
            );
          }
        }

        if (!headcountId) {
          throw new Error('Could not resolve camp headcount.');
        }

        const { data: confirmedRows, error: confirmedRowsError } = await supabase
          .from('camp_headcount_children')
          .select('id, confirmed_present')
          .eq('camp_headcount_id', headcountId)
          .eq('child_id', childId)
          .limit(1);

        if (confirmedRowsError) {
          throw new Error(
            confirmedRowsError.message || 'Could not load camp confirmation row.'
          );
        }

        const existingConfirmedRow = Array.isArray(confirmedRows) ? confirmedRows[0] : null;

        if (existingConfirmedRow?.confirmed_present) {
          Alert.alert('Confirmed', 'This camper is already confirmed present.');
          return;
        }

        if (existingConfirmedRow?.id) {
          const { error: updateChildError } = await supabase
            .from('camp_headcount_children')
            .update({
              confirmed_present: true,
              confirmed_at: now,
            })
            .eq('id', existingConfirmedRow.id);

          if (updateChildError) {
            throw new Error(
              updateChildError.message || 'Could not confirm camper.'
            );
          }
        } else {
          const { error: insertChildError } = await supabase
            .from('camp_headcount_children')
            .insert({
              camp_headcount_id: headcountId,
              child_id: childId,
              confirmed_present: true,
              confirmed_at: now,
            });

          if (insertChildError) {
            throw new Error(
              insertChildError.message || 'Could not confirm camper.'
            );
          }
        }

        await loadStaffSummerCampData();
        Alert.alert(`${existing.name} confirmed present.`);
      } catch (confirmError) {
        const message = confirmError?.message || 'Could not confirm present.';
        setStaffSummerCampError(message);
        Alert.alert('Could not confirm present.', message);
      } finally {
        setStaffSummerCampSavingChildId('');
      }
    },
    [
      loadStaffSummerCampData,
      staffSummerCampGroups,
      staffSummerCampOwnerStatus,
    ]
  );

  const checkInOwnerSummerCampChild = useCallback(
    async (childId, childName) => {
      const child = ownerSummerCampChildren.find((entry) => entry.id === childId);

      if (!child || ownerSummerCampSavingChildId) {
        return;
      }

      if (child.sessionRow?.checked_in_at) {
        Alert.alert('Already checked in.');
        return;
      }

      const selectedGroupId =
        ownerSummerCampSelectedGroupByChildId[childId] || child.selectedGroupId || '';

      if (!selectedGroupId) {
        Alert.alert('Select a camp group first.');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      setOwnerSummerCampSavingChildId(childId);

      const { error } = await supabase.from('camp_check_ins').insert({
        child_id: childId,
        camp_group_id: selectedGroupId,
        date: today,
        checked_in_at: now,
        status: 'checked_in',
      });

      if (error) {
        Alert.alert('Could not check in to camp.', error.message || 'Please try again.');
        setOwnerSummerCampSavingChildId('');
        return;
      }

      await loadOwnerSummerCampData();
      setOwnerSummerCampSavingChildId('');
      Alert.alert(`${childName} checked into camp.`);
    },
    [
      loadOwnerSummerCampData,
      ownerSummerCampChildren,
      ownerSummerCampSavingChildId,
      ownerSummerCampSelectedGroupByChildId,
    ]
  );

  const handleToggleOwnerSummerCampGroupPicker = useCallback((childId) => {
    setOwnerSummerCampGroupPickerChildId((current) => (current === childId ? '' : childId));
  }, []);

  const handleSelectOwnerSummerCampGroupForChild = useCallback((childId, groupId) => {
    setOwnerSummerCampSelectedGroupByChildId((current) => ({
      ...current,
      [childId]: groupId,
    }));
    setOwnerSummerCampGroupPickerChildId('');
  }, []);

  const sendCampHeadcount = useCallback(
    async (groupName) => {
      const currentGroup = staffSummerCampGroups[groupName] || [];
      const currentHeadcount = staffSummerCampOwnerStatus[groupName] || null;
      const confirmedCount = currentGroup.filter(
        (child) => child.groupConfirmationStatus === 'Confirmed Present'
      ).length;
      const ownerCheckedInCount = currentGroup.length;
      const now = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0];
      const submittedStatus =
        confirmedCount === ownerCheckedInCount ? 'submitted' : 'discrepancy';

      if (!groupName) {
        return;
      }

      setStaffSummerCampSendingGroup(groupName);
      setStaffSummerCampError('');

      try {
        let headcountId = currentHeadcount?.id || null;

        if (!headcountId) {
          const { data: insertedHeadcount, error: insertHeadcountError } = await supabase
            .from('camp_headcounts')
            .insert({
              camp_group_id:
                currentHeadcount?.campGroupId || currentGroup[0]?.campGroupId || null,
              date: today,
              status: submittedStatus,
              owner_checked_in_count: ownerCheckedInCount,
              counselor_confirmed_count: confirmedCount,
              submitted_at: now,
            })
            .select('id')
            .single();

          if (insertHeadcountError) {
            throw new Error(
              insertHeadcountError.message || 'Could not send camp headcount.'
            );
          }

          headcountId = insertedHeadcount?.id || null;
        } else {
          const { error: updateHeadcountError } = await supabase
            .from('camp_headcounts')
            .update({
              counselor_confirmed_count: confirmedCount,
              owner_checked_in_count: ownerCheckedInCount,
              status: submittedStatus,
              submitted_at: now,
            })
            .eq('id', headcountId);

          if (updateHeadcountError) {
            throw new Error(
              updateHeadcountError.message || 'Could not send camp headcount.'
            );
          }
        }

        await loadStaffSummerCampData();
        Alert.alert('Headcount sent to owner.');
      } catch (sendError) {
        const message = sendError?.message || 'Could not send headcount.';
        setStaffSummerCampError(message);
        Alert.alert('Could not send headcount.', message);
      } finally {
        setStaffSummerCampSendingGroup('');
      }
    },
    [loadStaffSummerCampData, staffSummerCampGroups, staffSummerCampOwnerStatus]
  );

  const saveStaffDailyNote = async ({
    childId,
    childName,
    quickNotes,
    customNote,
    visibility,
    signature,
  }) => {
    const trimmedCustomNote = customNote.trim();

    if (!childId || (!quickNotes.length && !trimmedCustomNote)) {
      return null;
    }

    const summaryParts = [];

    if (quickNotes.length) {
      summaryParts.push(quickNotes.join(' • '));
    }

    if (trimmedCustomNote) {
      summaryParts.push(trimmedCustomNote);
    }

    const summary = summaryParts.length ? summaryParts.join(' · ') : 'No note added';
    const timestamp = new Date().toISOString();

    const { data, error } = await supabase
      .from('daily_notes')
      .insert({
        child_id: childId,
        date: timestamp.split('T')[0],
        quick_notes: quickNotes,
        custom_note: trimmedCustomNote,
        visibility: 'owner',
        review_status: 'pending',
      })
      .select('id, created_at')
      .single();

    if (error) {
      return null;
    }

    const entry = {
      id: data?.id ?? `${childId}-${timestamp}`,
      childId,
      childName,
      quickNotes,
      customNote: trimmedCustomNote,
      summary,
      time: data?.created_at ?? timestamp,
      visibility,
      signature,
      timelineMessage: `${childName} daily note saved at ${timestamp}.`,
      notificationMessage: `${childName} has a new daily note.`,
      ownerMessage: `${childName} note captured for owner review.`,
    };

    setStaffDailyNotesSavedEntries((prev) => [entry, ...prev].slice(0, 5));
    return entry;
  };

  const showComingSoon = (title, message = 'Coming Soon') => {
    Alert.alert(title, message);
  };

  const formatAttendanceType = (value) => {
    if (value === 'check_in') {
      return 'Checked In';
    }

    if (value === 'check_out') {
      return 'Checked Out';
    }

    return 'Attendance Event';
  };

  const parentAttendanceSummary = parentAttendanceHistory
    .flatMap((child) =>
      (Array.isArray(child.events) ? child.events : []).map((event) => ({
        ...event,
        childId: child.id,
        childName: child.name,
        childRoom: child.room,
      }))
    )
    .sort((left, right) => {
      const leftTime = new Date(left.event_time || left.created_at || 0).getTime();
      const rightTime = new Date(right.event_time || right.created_at || 0).getTime();
      return rightTime - leftTime;
    })[0];

  const parentDailyNotesSummary = parentDailyNotesHistory
    .flatMap((child) =>
      (Array.isArray(child.notes) ? child.notes : []).map((note) => ({
        ...note,
        childId: child.id,
        childName: child.name,
      }))
    )
    .sort((left, right) => {
      const leftTime = new Date(left.created_at || left.date || 0).getTime();
      const rightTime = new Date(right.created_at || right.date || 0).getTime();
      return rightTime - leftTime;
    })[0];

  const parentTimelineSummary = parentTimelineHistory[0] || null;
  const parentIncidentSummary = parentIncidentReports[0] || null;
  const parentPrimaryChild = parentLinkedChildren[0] || null;
  const parentPrimaryChildHistory = parentPrimaryChild
    ? parentAttendanceHistory.find((child) => child.id === parentPrimaryChild.id) || null
    : null;
  const parentPrimaryChildLatestEvent = parentPrimaryChildHistory?.events?.[0] || null;
  const parentPrimaryChildName =
    `${parentPrimaryChild?.first_name || ''} ${parentPrimaryChild?.last_name || ''}`.trim() ||
    PARENT_CHILD.name;
  const parentPrimaryChildStatus = parentPrimaryChildLatestEvent
    ? formatAttendanceType(parentPrimaryChildLatestEvent.event_type)
    : parentPrimaryChild?.status || PARENT_CHILD.status;
  const parentUnreadMessagesCount = recipientMessages.filter((message) => !message.readAt).length;
  const ownerUnreadMessagesCount = parentUnreadMessagesCount;
  const staffUnreadMessagesCount = parentUnreadMessagesCount;
  const parentDailyNotesCount = parentDailyNotesHistory.reduce(
    (total, child) => total + (Array.isArray(child.notes) ? child.notes.length : 0),
    0
  );
  const parentIncidentReportsCount = parentIncidentReports.filter(
    (report) => !report.parent_acknowledged_at
  ).length;
  const parentAttendanceUpdatesCount = parentAttendanceHistory.reduce(
    (total, child) => total + (Array.isArray(child.events) ? child.events.length : 0),
    0
  );
  const staffSummerCampStatusEntries = Object.values(staffSummerCampOwnerStatus || {});
  const staffPendingCampHeadcountCount = staffSummerCampStatusEntries.filter(
    (entry) => entry?.status === 'pending'
  ).length;
  const staffCampDiscrepancyCount = staffSummerCampStatusEntries.filter(
    (entry) => entry?.status === 'discrepancy'
  ).length;
  const ownerCampDiscrepancyCount = staffCampDiscrepancyCount;
  const ownerPendingCampHeadcountLatest = staffSummerCampStatusEntries
    .filter((entry) => entry?.status === 'pending')
    .sort((left, right) => {
      const leftTime = new Date(left.submittedAt || 0).getTime();
      const rightTime = new Date(right.submittedAt || 0).getTime();
      return rightTime - leftTime;
    })[0];
  const ownerCampDiscrepancyLatest = staffSummerCampStatusEntries
    .filter((entry) => entry?.status === 'discrepancy')
    .sort((left, right) => {
      const leftTime = new Date(left.submittedAt || 0).getTime();
      const rightTime = new Date(right.submittedAt || 0).getTime();
      return rightTime - leftTime;
    })[0];
  const ownerUnreadMessageLatest = recipientMessages.find((message) => !message.readAt) || recipientMessages[0] || null;
  const parentUnreadMessageLatest = recipientMessages.find((message) => !message.readAt) || recipientMessages[0] || null;
  const latestParentNotificationAttendance = parentAttendanceSummary || null;
  const latestParentNotificationDailyNote = parentDailyNotesSummary || null;
  const latestParentNotificationIncident = parentIncidentSummary || null;
  const resolveParentChild = useCallback(
    (childId) => parentLinkedChildren.find((child) => child.id === childId) || parentPrimaryChild || null,
    [parentLinkedChildren, parentPrimaryChild]
  );
  const ownerNotificationCards = [
    {
      title: 'Pending Daily Notes',
      count: ownerDailyNotesPending.length,
      description: 'Staff notes waiting on owner approval.',
      actionLabel: 'Open review',
      timestamp: ownerDailyNotesPending[0]?.created_at || ownerDailyNotesPending[0]?.date || null,
      accent: COLORS.warning,
      onPress: () => setScreen('owner-daily-notes-review'),
    },
    {
      title: 'Pending Incident Reports',
      count: ownerIncidentReportsPending.length,
      description: 'Incident reports waiting for review.',
      actionLabel: 'Open review',
      timestamp:
        ownerIncidentReportsPending[0]?.created_at ||
        ownerIncidentReportsPending[0]?.reviewed_at ||
        null,
      accent: COLORS.danger,
      onPress: () => setScreen('owner-incident-reports-review'),
    },
    {
      title: 'Camp Discrepancies',
      count: ownerCampDiscrepancyCount,
      description: 'Counselor counts do not match owner check-ins.',
      actionLabel: 'Open camp',
      timestamp: ownerCampDiscrepancyLatest?.submittedAt || null,
      accent: '#7C4DFF',
      onPress: () => setScreen('owner-summer-camp-check-in'),
    },
    {
      title: 'Unread Messages',
      count: ownerUnreadMessagesCount,
      description: 'Messages waiting in the owner inbox.',
      actionLabel: 'Open Messages',
      timestamp: ownerUnreadMessageLatest?.deliveredAt || ownerUnreadMessageLatest?.createdAt || null,
      accent: COLORS.blue,
      onPress: () => setScreen('owner-messages'),
    },
  ];
  const parentNotificationCards = [
    {
      title: 'Unread Messages',
      count: parentUnreadMessagesCount,
      description: 'Messages sent to this family account.',
      actionLabel: 'Open Messages',
      timestamp:
        parentUnreadMessageLatest?.deliveredAt || parentUnreadMessageLatest?.createdAt || null,
      accent: COLORS.blue,
      onPress: () => setScreen('parent-messages'),
    },
    {
      title: 'New Daily Notes',
      count: parentDailyNotesCount,
      description: 'Approved daily notes for linked children.',
      actionLabel: 'Open profile',
      timestamp:
        latestParentNotificationDailyNote?.created_at ||
        latestParentNotificationDailyNote?.date ||
        null,
      accent: '#7C4DFF',
      onPress: () => openParentChildProfile(resolveParentChild(latestParentNotificationDailyNote?.childId)),
    },
    {
      title: 'New Incident Reports',
      count: parentIncidentReportsCount,
      description: 'Approved incident reports awaiting acknowledgement.',
      actionLabel: 'Open reports',
      timestamp: latestParentNotificationIncident?.created_at || null,
      accent: COLORS.danger,
      onPress: () => setScreen('parent-incident-reports'),
    },
    {
      title: 'Recent Attendance Updates',
      count: parentAttendanceUpdatesCount,
      description: 'Latest check-ins and check-outs for linked children.',
      actionLabel: 'Open profile',
      timestamp:
        latestParentNotificationAttendance?.event_time ||
        latestParentNotificationAttendance?.created_at ||
        null,
      accent: COLORS.success,
      onPress: () => openParentChildProfile(resolveParentChild(latestParentNotificationAttendance?.childId)),
    },
  ];
  const staffNotificationCards = [
    {
      title: 'Unread Messages',
      count: staffUnreadMessagesCount,
      description: 'Messages waiting in the staff inbox.',
      actionLabel: 'Open Messages',
      timestamp: ownerUnreadMessageLatest?.deliveredAt || ownerUnreadMessageLatest?.createdAt || null,
      accent: COLORS.blue,
      onPress: () => setScreen('staff-messages'),
    },
    {
      title: 'Pending Camp Headcounts',
      count: staffPendingCampHeadcountCount,
      description: 'Counselor headcounts waiting to be submitted.',
      actionLabel: 'Open camp',
      timestamp: ownerPendingCampHeadcountLatest?.submittedAt || null,
      accent: COLORS.warning,
      onPress: () => setScreen('staff-summer-camp-group-check-in'),
    },
    {
      title: 'Camp Discrepancies',
      count: staffCampDiscrepancyCount,
      description: 'Groups where counselor counts do not match owner check-ins.',
      actionLabel: 'Open camp',
      timestamp: ownerCampDiscrepancyLatest?.submittedAt || null,
      accent: COLORS.danger,
      onPress: () => setScreen('staff-summer-camp-group-check-in'),
    },
  ];
  const ownerNotificationsLoading =
    ownerDailyNotesPendingLoading ||
    ownerIncidentReportsPendingLoading ||
    ownerBeforeAfterCountsLoading ||
    recipientMessagesLoading ||
    staffSummerCampLoading;
  const parentNotificationsLoading =
    parentAttendanceLoading ||
    parentDailyNotesLoading ||
    parentIncidentReportsLoading ||
    recipientMessagesLoading ||
    parentLinkedChildrenLoading;
  const staffNotificationsLoading = recipientMessagesLoading || staffSummerCampLoading;

  const openParentChildProfile = useCallback(
    (child) => {
      const targetChild = child || parentPrimaryChild;

      if (!targetChild?.id) {
        return;
      }

      setChildProfileAccessibleChildren(parentLinkedChildren);
      setChildProfileSelectedChild({
        id: targetChild.id,
        first_name: targetChild.first_name || '',
        last_name: targetChild.last_name || '',
        room: targetChild.room || '',
        status: targetChild.status || '',
        profile_accent_color: targetChild.profile_accent_color || '',
      });
      setChildProfileSelectedChildId(targetChild.id);
      setChildProfileError('');
      setChildProfileLoadStartedAt(null);
      setScreen('child-profile');
    },
    [parentPrimaryChild, parentLinkedChildren]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {screen === 'login' ? (
        <LoginScreen
          email={email}
          password={password}
          error={error}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onLogin={handleLogin}
          onFillTestAccount={fillTestAccount}
          onOpenActivateAccount={openActivateAccountScreen}
        />
      ) : screen === 'activate-account' ? (
        <ActivateAccountScreen
          email={activationEmail}
          code={activationCode}
          password={activationPassword}
          confirmPassword={activationConfirmPassword}
          activationStep={activationStep}
          activationError={activationError}
          pendingInviteId={pendingInvite?.id ?? null}
          onChangeEmail={setActivationEmail}
          onChangeCode={setActivationCode}
          onChangePassword={setActivationPassword}
          onChangeConfirmPassword={setActivationConfirmPassword}
          onContinue={handleActivateAccountContinue}
          onBack={closeActivateAccountScreen}
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
                <Text style={styles.parentHeroChildName}>{parentPrimaryChildName}</Text>
                <View style={styles.parentHeroStatusPill}>
                  <Text style={styles.parentHeroStatusPillText}>{parentPrimaryChildStatus}</Text>
                </View>
                <Text style={styles.parentHeroSubtitle}>
                  Your private childcare connection for {parentPrimaryChildName}&apos;s day.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open child profile"
                onPress={() => openParentChildProfile(parentPrimaryChild)}
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
              <View style={styles.parentQuickSectionHeader}>
                <Text style={styles.parentSectionHeaderTitle}>Children</Text>
                <Text style={styles.parentSectionHeaderSubtle}>
                  Tap a card to open the full profile
                </Text>
              </View>

              {parentLinkedChildrenLoading ? (
                <Text style={styles.parentAttendanceStateText}>Loading children...</Text>
              ) : parentLinkedChildrenError ? (
                <Text style={[styles.errorText, { marginTop: 0 }]}>
                  Could not load linked children.
                </Text>
              ) : parentLinkedChildren.length ? (
                <View style={styles.parentQuickGrid}>
                  {parentLinkedChildren.map((child) => {
                    const childName =
                      `${child.first_name || ''} ${child.last_name || ''}`.trim() ||
                      'Unnamed Student';
                    const childStatus = child.status || 'Status not set';
                    const childRoom = child.room || 'Room not set';

                    return (
                      <Pressable
                        key={child.id}
                        accessibilityRole="button"
                        onPress={() => openParentChildProfile(child)}
                        style={({ pressed }) => [
                          styles.parentQuickCard,
                          styles.parentQuickBlue,
                          pressed && styles.pressedButton,
                        ]}
                      >
                        <View style={styles.parentQuickAccentBlue} />
                        <Text style={styles.parentQuickTitle}>{childName}</Text>
                        <Text style={styles.parentQuickValue}>{childStatus}</Text>
                        <Text style={styles.parentQuickNote}>{childRoom}</Text>
                        <Text style={styles.parentQuickNote}>View Child Profile</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.parentAttendanceStateText}>
                  No children linked to this account.
                </Text>
              )}

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
                    <Text style={styles.parentTodayLabel}>Latest event</Text>
                    <Text style={styles.parentTodayValue}>
                      {parentPrimaryChildLatestEvent
                        ? `${formatAttendanceType(parentPrimaryChildLatestEvent.event_type)} • ${formatTime(parentPrimaryChildLatestEvent.event_time || parentPrimaryChildLatestEvent.created_at)}`
                        : 'No updates'}
                    </Text>
                  </View>

                  <View style={styles.parentTodayDivider} />

                  <View style={styles.parentTodayItem}>
                    <View style={styles.parentTodayIconWrap}>
                      <Text style={styles.parentTodayIcon}>★</Text>
                    </View>
                    <Text style={styles.parentTodayLabel}>Status</Text>
                    <Text style={styles.parentTodayValue}>{parentPrimaryChildStatus}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.parentAccordionCard}>
                <View style={styles.parentAccordionHeader}>
                  <View style={styles.parentAccordionHeaderCopy}>
                    <Text style={styles.parentAccordionTitle}>Attendance History</Text>
                    <Text style={styles.parentAccordionSummary}>
                      Latest check-in or check-out
                    </Text>
                  </View>
                  <Text style={styles.parentAttendanceEventTime}>
                    {parentAttendanceSummary
                      ? formatDateTime(parentAttendanceSummary.event_time || parentAttendanceSummary.created_at)
                      : '—'}
                  </Text>
                </View>

                <View style={styles.parentAccordionBody}>
                  {parentAttendanceLoading ? (
                    <Text style={styles.parentAttendanceStateText}>Loading attendance...</Text>
                  ) : parentAttendanceError ? (
                    <Text style={[styles.errorText, { marginTop: 0 }]}>
                      Could not load attendance.
                    </Text>
                  ) : parentAttendanceSummary ? (
                    <>
                      <View style={styles.parentAttendanceChildHeaderRow}>
                        <Text style={styles.parentAttendanceChildName}>
                          {parentAttendanceSummary.childName}
                        </Text>
                        <Text style={styles.parentAttendanceChildRoom}>
                          {parentAttendanceSummary.childRoom}
                        </Text>
                      </View>
                      <Text style={styles.parentTimelineTitle}>
                        {formatAttendanceType(parentAttendanceSummary.event_type)}
                      </Text>
                      <Text style={styles.parentDailyNoteQuickNotes}>
                        {formatDateTime(parentAttendanceSummary.event_time || parentAttendanceSummary.created_at)}
                      </Text>
                      <View style={styles.ownerFilterPillRow}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => openParentChildProfile(parentPrimaryChild)}
                          style={({ pressed }) => [
                            styles.ownerFilterPill,
                            pressed && styles.pressedButton,
                          ]}
                        >
                          <Text style={styles.ownerFilterPillText}>View Child Profile</Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.parentAttendanceStateText}>No attendance records yet.</Text>
                  )}
                </View>
              </View>

              <View style={styles.parentAccordionCard}>
                <View style={styles.parentAccordionHeader}>
                  <View style={styles.parentAccordionHeaderCopy}>
                    <Text style={styles.parentAccordionTitle}>Daily Notes</Text>
                    <Text style={styles.parentAccordionSummary}>Latest approved note</Text>
                  </View>
                  <Text style={styles.parentAttendanceEventTime}>
                    {parentDailyNotesSummary
                      ? formatDateTime(parentDailyNotesSummary.created_at || parentDailyNotesSummary.date)
                      : '—'}
                  </Text>
                </View>

                <View style={styles.parentAccordionBody}>
                  {parentDailyNotesLoading ? (
                    <Text style={styles.parentAttendanceStateText}>Loading daily notes...</Text>
                  ) : parentDailyNotesError ? (
                    <Text style={[styles.errorText, { marginTop: 0 }]}>
                      Could not load daily notes.
                    </Text>
                  ) : parentDailyNotesSummary ? (
                    <>
                      <View style={styles.parentAttendanceChildHeaderRow}>
                        <Text style={styles.parentAttendanceChildName}>
                          {parentDailyNotesSummary.childName}
                        </Text>
                        <Text style={styles.parentAttendanceChildRoom}>Approved</Text>
                      </View>
                      <Text style={styles.parentDailyNoteQuickNotes}>
                        {Array.isArray(parentDailyNotesSummary.quick_notes) &&
                        parentDailyNotesSummary.quick_notes.length
                          ? parentDailyNotesSummary.quick_notes.join(' • ')
                          : 'No quick notes'}
                      </Text>
                      {parentDailyNotesSummary.custom_note ? (
                        <Text style={styles.parentDailyNoteCustomNote}>
                          {parentDailyNotesSummary.custom_note}
                        </Text>
                      ) : null}
                      <View style={styles.ownerFilterPillRow}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => openParentChildProfile(parentPrimaryChild)}
                          style={({ pressed }) => [
                            styles.ownerFilterPill,
                            pressed && styles.pressedButton,
                          ]}
                        >
                          <Text style={styles.ownerFilterPillText}>View Child Profile</Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.parentAttendanceStateText}>No daily notes yet.</Text>
                  )}
                </View>
              </View>

              <View style={styles.parentAccordionCard}>
                <View style={styles.parentAccordionHeader}>
                  <View style={styles.parentAccordionHeaderCopy}>
                    <Text style={styles.parentAccordionTitle}>Timeline</Text>
                    <Text style={styles.parentAccordionSummary}>Recent activity for today</Text>
                  </View>
                  <Text style={styles.parentAttendanceEventTime}>
                    {parentTimelineSummary ? formatDateTime(parentTimelineSummary.timestamp) : '—'}
                  </Text>
                </View>

                <View style={styles.parentAccordionBody}>
                  {parentTimelineLoading ? (
                    <Text style={styles.parentAttendanceStateText}>Loading timeline...</Text>
                  ) : parentTimelineError ? (
                    <Text style={[styles.errorText, { marginTop: 0 }]}>
                      Could not load timeline.
                    </Text>
                  ) : parentTimelineSummary ? (
                    <>
                      <View style={styles.parentAttendanceChildHeaderRow}>
                        <Text style={styles.parentAttendanceChildName}>
                          {parentTimelineSummary.childName}
                        </Text>
                        <Text style={styles.parentAttendanceChildRoom}>
                          {parentTimelineSummary.childRoom}
                        </Text>
                      </View>
                      <Text style={styles.parentTimelineTitle}>
                        {parentTimelineSummary.type === 'attendance'
                          ? `✓ ${parentTimelineSummary.title}`
                          : 'Daily Note'}
                      </Text>
                      <Text style={styles.parentDailyNoteQuickNotes}>
                        {formatDateTime(parentTimelineSummary.timestamp)}
                      </Text>
                      {parentTimelineSummary.type === 'daily_note' ? (
                        <>
                          <Text style={styles.parentDailyNoteQuickNotes}>
                            {Array.isArray(parentTimelineSummary.quick_notes) &&
                            parentTimelineSummary.quick_notes.length
                              ? parentTimelineSummary.quick_notes.join(' • ')
                              : 'No quick notes'}
                          </Text>
                          {parentTimelineSummary.custom_note ? (
                            <Text style={styles.parentDailyNoteCustomNote}>
                              {parentTimelineSummary.custom_note}
                            </Text>
                          ) : null}
                        </>
                      ) : null}
                      <View style={styles.ownerFilterPillRow}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => openParentChildProfile(parentPrimaryChild)}
                          style={({ pressed }) => [
                            styles.ownerFilterPill,
                            pressed && styles.pressedButton,
                          ]}
                        >
                          <Text style={styles.ownerFilterPillText}>View Child Profile</Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.parentAttendanceStateText}>No activity yet.</Text>
                  )}
                </View>
              </View>

              <View style={styles.parentAccordionCard}>
                <View style={styles.parentAccordionHeader}>
                  <View style={styles.parentAccordionHeaderCopy}>
                    <Text style={styles.parentAccordionTitle}>Incident Reports</Text>
                    <Text style={styles.parentAccordionSummary}>
                      Latest approved report
                    </Text>
                  </View>
                  <Text style={styles.parentAttendanceEventTime}>
                    {parentIncidentSummary
                      ? formatDateTime(parentIncidentSummary.created_at)
                      : '—'}
                  </Text>
                </View>

                <View style={styles.parentAccordionBody}>
                  {parentIncidentReportsLoading ? (
                    <Text style={styles.parentAttendanceStateText}>
                      Loading incident reports...
                    </Text>
                  ) : parentIncidentReportsError ? (
                    <Text style={[styles.errorText, { marginTop: 0 }]}>
                      Could not load incident reports.
                    </Text>
                  ) : parentIncidentSummary ? (
                    <>
                      <View style={styles.parentAttendanceChildHeaderRow}>
                        <Text style={styles.parentAttendanceChildName}>
                          {parentIncidentSummary.childName}
                        </Text>
                        <Text style={styles.parentAttendanceChildRoom}>Approved</Text>
                      </View>
                      <Text style={styles.parentDailyNoteQuickNotes}>
                        Location: {parentIncidentSummary.location || 'Not set'}
                      </Text>
                      <Text style={styles.parentDailyNoteQuickNotes}>
                        {parentIncidentSummary.description || 'No description'}
                      </Text>
                      <Text style={styles.parentDailyNoteCustomNote}>
                        Action Taken: {parentIncidentSummary.action_taken || 'Not set'}
                      </Text>
                      <View style={styles.ownerFilterPillRow}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => setScreen('parent-incident-reports')}
                          style={({ pressed }) => [
                            styles.ownerFilterPill,
                            pressed && styles.pressedButton,
                          ]}
                        >
                          <Text style={styles.ownerFilterPillText}>View Reports</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => openParentChildProfile(parentPrimaryChild)}
                          style={({ pressed }) => [
                            styles.ownerFilterPill,
                            pressed && styles.pressedButton,
                          ]}
                        >
                          <Text style={styles.ownerFilterPillText}>View Child Profile</Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.parentAttendanceStateText}>No incident reports yet.</Text>
                  )}
                </View>
              </View>

              <View style={styles.parentQuickSectionHeader}>
                <Text style={styles.parentSectionHeaderTitle}>Quick Access</Text>
                <Text style={styles.parentSectionHeaderSubtle}>Tap a card for details</Text>
              </View>

              <View style={styles.parentQuickGrid}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openParentChildProfile(parentPrimaryChild)}
                  style={({ pressed }) => [
                    styles.parentQuickCard,
                    styles.parentQuickBlue,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <View style={styles.parentQuickAccentBlue} />
                  <Text style={styles.parentQuickTitle}>View Child Profile</Text>
                  <Text style={styles.parentQuickValue}>Open</Text>
                  <Text style={styles.parentQuickNote}>See the full child record</Text>
                </Pressable>

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
                  onPress={() => setScreen('parent-authorized-pickups')}
                  style={({ pressed }) => [
                    styles.parentQuickCard,
                    styles.parentQuickPurple,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <View style={styles.parentQuickAccentPurple} />
                  <Text style={styles.parentQuickTitle}>Authorized Pickups</Text>
                  <Text style={styles.parentQuickValue}>Manage</Text>
                  <Text style={styles.parentQuickNote}>
                    Manage people allowed to pick up your child
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setScreen('parent-emergency-contacts')}
                  style={({ pressed }) => [
                    styles.parentQuickCard,
                    styles.parentQuickGreen,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <View style={styles.parentQuickAccentGreen} />
                  <Text style={styles.parentQuickTitle}>Emergency Contacts</Text>
                  <Text style={styles.parentQuickValue}>Manage</Text>
                  <Text style={styles.parentQuickNote}>
                    Manage emergency contacts for your child
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setScreen('parent-messages')}
                  style={({ pressed }) => [
                    styles.parentQuickCard,
                    styles.parentQuickOrange,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <View style={styles.parentQuickAccentOrange} />
                  <Text style={styles.parentQuickTitle}>Messages</Text>
                  <Text style={styles.parentQuickValue}>{PARENT_CHILD.messages}</Text>
                  <Text style={styles.parentQuickNote}>View center updates and announcements</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setScreen('parent-incident-reports')}
                  style={({ pressed }) => [
                    styles.parentQuickCard,
                    styles.parentQuickOrange,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <View style={styles.parentQuickAccentOrange} />
                  <Text style={styles.parentQuickTitle}>Incident Reports</Text>
                  <Text style={styles.parentQuickValue}>View</Text>
                  <Text style={styles.parentQuickNote}>View approved incident reports</Text>
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
          currentUserId={session?.user?.id}
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
          onLogout={handleLogout}
          loading={parentBeforeAfterLoading}
          error={parentBeforeAfterError}
          records={parentBeforeAfterRecords}
        />
      ) : screen === 'parent-authorized-pickups' ? (
        <ParentAuthorizedPickupsScreen
          onBack={() => setScreen('parent-home')}
          onLogout={handleLogout}
          currentUserId={session?.user?.id}
        />
      ) : screen === 'parent-emergency-contacts' ? (
        <ParentEmergencyContactsScreen
          onBack={() => setScreen('parent-home')}
          onLogout={handleLogout}
          currentUserId={session?.user?.id}
        />
      ) : screen === 'parent-messages' ? (
        <NotificationsScreen
          onBack={() => setScreen('parent-home')}
          onLogout={handleLogout}
          messages={recipientMessages}
          loading={recipientMessagesLoading}
          error={recipientMessagesError}
          expandedMessageId={recipientMessagesExpandedId}
          onToggleMessage={handleToggleRecipientMessage}
          title="Messages"
          subtitle="Center updates and announcements"
          introTitle="Inbox"
          introText="Center updates and announcements"
        />
      ) : screen === 'parent-notifications' ? (
        <NotificationHubScreen
          onBack={() => setScreen('parent-home')}
          onLogout={handleLogout}
          title="Notifications"
          subtitle="Family updates and announcements."
          badgeText="Family Access"
          introTitle="Family Summary"
          introText="Quick summary of what needs your attention."
          cards={parentNotificationCards}
          loading={parentNotificationsLoading}
          error={
            parentLinkedChildrenError ||
            parentAttendanceError ||
            parentDailyNotesError ||
            parentIncidentReportsError ||
            recipientMessagesError
          }
        />
      ) : screen === 'parent-incident-reports' ? (
        <ParentIncidentReportsScreen
          onBack={() => setScreen('parent-home')}
          onLogout={handleLogout}
          reports={parentIncidentReports}
          loading={parentIncidentReportsLoading}
          error={parentIncidentReportsError}
          acknowledgingId={parentIncidentAcknowledgingId}
          onAcknowledge={handleParentAcknowledgeIncidentReport}
        />
      ) : screen === 'notifications' ? (
        <NotificationsScreen
          onBack={() => setScreen('parent-home')}
          onLogout={handleLogout}
          messages={recipientMessages}
          loading={recipientMessagesLoading}
          error={recipientMessagesError}
          expandedMessageId={recipientMessagesExpandedId}
          onToggleMessage={handleToggleRecipientMessage}
          title="Notifications"
          subtitle="Simple updates from Mia's day."
          introTitle="Inbox"
          introText="Simple updates from Mia's day."
        />
      ) : screen === 'child-profile' ? (
        <UnifiedChildProfileScreen
          onBack={() => setScreen('parent-home')}
          onLogout={handleLogout}
          accessibleChildren={childProfileAccessibleChildren}
          selectedChildId={childProfileSelectedChildId}
          selectedChild={childProfileSelectedChild}
          loading={childProfileLoading}
          error={childProfileError}
          onSelectChild={(child) => {
            setChildProfileSelectedChildId(child?.id || '');
            setChildProfileSelectedChild(child || null);
            loadChildProfileData(child?.id || null);
          }}
          pickups={childProfilePickupRows}
          pickupsLoading={childProfilePickupLoading}
          pickupsError={childProfilePickupError}
          emergencyRows={childProfileEmergencyRows}
          emergencyLoading={childProfileEmergencyLoading}
          emergencyError={childProfileEmergencyError}
          attendanceRows={childProfileAttendanceRows}
          beforeAfterRows={childProfileBeforeAfterRows}
          dailyNotesRows={childProfileDailyNotesRows}
          incidentRows={childProfileIncidentRows}
          summerCampCheckIns={childProfileSummerCampCheckIns}
          summerCampHeadcounts={childProfileSummerCampHeadcounts}
          campGroups={childProfileCampGroups}
        />
      ) : screen === 'staff-home' ? (
        <StaffHomeScreen
          onLogout={handleLogout}
          onShowComingSoon={showComingSoon}
          onOpenClock={() => setScreen('staff-clock-in-out')}
          onOpenBeforeAfter={() => setScreen('staff-before-after-attendance')}
          onOpenCamp={() => setScreen('staff-summer-camp-group-check-in')}
          onOpenIncidentReports={() => setScreen('staff-incident-reports')}
          onOpenMessages={() => setScreen('staff-messages')}
          onOpenNotifications={() => setScreen('staff-notifications')}
          onOpenNotes={() => setScreen('staff-daily-notes')}
          onOpenHours={() => setScreen('staff-hours')}
          staffStatus={staffStatus}
          messages={recipientMessages}
          loading={recipientMessagesLoading}
          error={recipientMessagesError}
          expandedMessageId={recipientMessagesExpandedId}
          onToggleMessage={handleToggleRecipientMessage}
        />
      ) : screen === 'staff-notifications' ? (
        <NotificationHubScreen
          onBack={() => setScreen('staff-home')}
          onLogout={handleLogout}
          title="Notifications"
          subtitle="Staff updates and center attention items."
          badgeText="Staff Access"
          introTitle="Staff Attention"
          introText="Quick summary of what needs your attention."
          cards={staffNotificationCards}
          loading={staffNotificationsLoading}
          error={recipientMessagesError || staffSummerCampError}
        />
      ) : screen === 'staff-messages' ? (
        <NotificationsScreen
          onBack={() => setScreen('staff-home')}
          onLogout={handleLogout}
          messages={recipientMessages}
          loading={recipientMessagesLoading}
          error={recipientMessagesError}
          expandedMessageId={recipientMessagesExpandedId}
          onToggleMessage={handleToggleRecipientMessage}
          title="Messages"
          subtitle="Staff updates and center announcements"
          introTitle="Inbox"
          introText="Staff updates and center announcements"
        />
      ) : screen === 'staff-clock-in-out' ? (
        <StaffClockInOutScreen
          onBack={() => setScreen('staff-home')}
          onLogout={handleLogout}
          staffStatus={staffStatus}
          onToggleStaffStatus={toggleStaffStatus}
          lastClockInTime={lastClockInTime}
          lastClockOutTime={lastClockOutTime}
        />
      ) : screen === 'staff-before-after-attendance' ? (
        <StaffBeforeAfterAttendanceScreen
          onBack={() => setScreen('staff-home')}
          onLogout={handleLogout}
          loading={staffBeforeAfterLoading}
          error={staffBeforeAfterError}
          attendanceChildren={staffBeforeAfterChildren}
          selectedChildId={staffBeforeAfterSelectedChildId}
          onSelectChild={(childId) => {
            setStaffBeforeAfterSelectedChildId((current) => (current === childId ? null : childId));
            setStaffBeforeAfterPickupChildId(null);
          }}
          pickupChild={
            staffBeforeAfterPickupChildId
              ? (() => {
                  const selected =
                    staffBeforeAfterChildren.find((entry) => entry.id === staffBeforeAfterPickupChildId) ||
                    null;

                  if (!selected) {
                    return null;
                  }

                  return {
                    ...selected,
                    authorizedPickups: (Array.isArray(authorizedPickupRows)
                      ? authorizedPickupRows
                      : []
                    ).filter((row) => row.child_id === selected.id),
                  };
                })()
              : null
          }
          authorizedPickupsLoading={authorizedPickupRowsLoading}
          savingChildId={staffBeforeAfterSavingChildId}
          onAction={async (childId, action) => {
            if (action === 'parent-pickup') {
              openBeforeAfterPickup(childId);
              return;
            }

            await handleStaffBeforeAfterAction(childId, action);
          }}
          onConfirmPickup={confirmBeforeAfterPickup}
        />
      ) : screen === 'staff-summer-camp-group-check-in' ? (
        <StaffSummerCampGroupCheckInScreen
          onBack={() => setScreen('staff-home')}
          onLogout={handleLogout}
          groups={staffSummerCampGroups}
          selectedGroup={staffSummerCampSelectedGroup}
          onSelectGroup={setStaffSummerCampSelectedGroup}
          onConfirmPresent={confirmCampPresent}
          onSendHeadcount={sendCampHeadcount}
          ownerStatus={staffSummerCampOwnerStatus}
          loading={staffSummerCampLoading}
          error={staffSummerCampError}
          savingChildId={staffSummerCampSavingChildId}
          sendingGroup={staffSummerCampSendingGroup}
        />
      ) : screen === 'staff-incident-reports' ? (
        <StaffIncidentReportsScreen
          onBack={() => setScreen('staff-home')}
          onLogout={handleLogout}
          activeChildren={staffIncidentChildren}
          selectedChildId={staffIncidentSelectedChildId}
          loading={staffIncidentChildrenLoading}
          error={staffIncidentChildrenError}
          location={staffIncidentLocation}
          description={staffIncidentDescription}
          actionTaken={staffIncidentActionTaken}
          staffWitness={staffIncidentWitness}
          saving={staffIncidentSaving}
          recentReports={staffIncidentRecentReports}
          recentReportsLoading={staffIncidentRecentReportsLoading}
          recentReportsError={staffIncidentRecentReportsError}
          onSelectChild={setStaffIncidentSelectedChildId}
          onChangeLocation={setStaffIncidentLocation}
          onChangeDescription={setStaffIncidentDescription}
          onChangeActionTaken={setStaffIncidentActionTaken}
          onChangeWitness={setStaffIncidentWitness}
          onSubmit={handleSubmitIncidentReport}
        />
      ) : screen === 'staff-hours' ? (
        <StaffMyHoursScreen
          onBack={() => setScreen('staff-home')}
          onLogout={handleLogout}
        />
      ) : screen === 'staff-daily-notes' ? (
        <StaffDailyNotesScreen
          onBack={() => setScreen('staff-home')}
          onLogout={handleLogout}
          savedNotes={staffDailyNotesSavedEntries}
          onSaveNote={saveStaffDailyNote}
        />
      ) : screen === 'owner-students' ? (
        <OwnerStudentsScreen
          onBack={() => setScreen('owner-home')}
          onLogout={handleLogout}
          onShowComingSoon={showComingSoon}
          authorizedPickupRows={authorizedPickupRows}
          authorizedPickupRowsLoading={authorizedPickupRowsLoading}
          authorizedPickupRowsError={authorizedPickupRowsError}
        />
      ) : screen === 'owner-parents' ? (
        <OwnerParentsScreen
          onBack={() => setScreen('owner-home')}
          onLogout={handleLogout}
          onShowComingSoon={showComingSoon}
        />
      ) : screen === 'owner-messages' ? (
        <OwnerMessagesScreen
          onBack={() => setScreen('owner-home')}
          onLogout={handleLogout}
          currentUserId={session?.user?.id}
          expandedRecentMessageId={ownerMessagesExpandedId}
          onToggleRecentMessage={handleToggleOwnerRecentMessage}
        />
      ) : screen === 'owner-notifications' ? (
        <NotificationHubScreen
          onBack={() => setScreen('owner-home')}
          onLogout={handleLogout}
          title="Notifications"
          subtitle="Owner updates and center attention items."
          badgeText="Owner Access"
          introTitle="Owner Attention"
          introText="Review the items that need your attention first."
          cards={ownerNotificationCards}
          loading={ownerNotificationsLoading}
          error={
            ownerDailyNotesPendingError ||
            ownerIncidentReportsPendingError ||
            ownerBeforeAfterCountsError ||
            recipientMessagesError ||
            staffSummerCampError
          }
        />
      ) : screen === 'owner-billing' ? (
        <OwnerBillingScreen
          onBack={() => setScreen('owner-home')}
          onLogout={handleLogout}
          onShowComingSoon={showComingSoon}
          currentUserId={session?.user?.id}
        />
      ) : screen === 'owner-camp-events' ? (
        <OwnerCampEventsScreen
          onBack={() => setScreen('owner-home')}
          onLogout={handleLogout}
          onShowComingSoon={showComingSoon}
        />
      ) : screen === 'owner-invite-codes' ? (
        <OwnerInviteCodesScreen
          onBack={() => setScreen('owner-home')}
          onLogout={handleLogout}
          onShowComingSoon={showComingSoon}
        />
      ) : screen === 'owner-reports' ? (
        <OwnerReportsScreen
          onBack={() => setScreen('owner-home')}
          onLogout={handleLogout}
          onShowComingSoon={showComingSoon}
        />
      ) : screen === 'owner-daily-notes-review' ? (
        <OwnerDailyNotesReviewScreen
          onBack={() => setScreen('owner-home')}
          pendingNotes={ownerDailyNotesPending}
          loading={ownerDailyNotesPendingLoading}
          error={ownerDailyNotesPendingError}
          onApprove={(note) => handleOwnerDailyNoteReviewDecision(note, 'approved')}
          onReject={(note) => handleOwnerDailyNoteReviewDecision(note, 'rejected')}
          actionNoteId={ownerDailyNotesReviewActionId}
        />
      ) : screen === 'owner-incident-reports-review' ? (
        <OwnerIncidentReportsReviewScreen
          onBack={() => setScreen('owner-home')}
          loading={ownerIncidentReportsPendingLoading}
          error={ownerIncidentReportsPendingError}
          pendingReports={ownerIncidentReportsPending}
          onApprove={(report) => handleOwnerIncidentReviewDecision(report, 'approved')}
          onReject={(report) => handleOwnerIncidentReviewDecision(report, 'rejected')}
          actionReportId={ownerIncidentReportsReviewActionId}
        />
      ) : screen === 'owner-staff' ? (
        <OwnerStaffScreen
          onBack={() => setScreen('owner-home')}
          onLogout={handleLogout}
          onShowComingSoon={showComingSoon}
        />
      ) : screen === 'owner-summer-camp-check-in' ? (
        <OwnerSummerCampCheckInScreen
          onBack={() => setScreen('owner-home')}
          onLogout={handleLogout}
          ownerSummerCampChildren={ownerSummerCampChildren}
          ownerSummerCampSummary={ownerSummerCampSummary}
          ownerSummerCampGroups={ownerSummerCampGroups}
          loading={ownerSummerCampLoading}
          error={ownerSummerCampError}
          savingChildId={ownerSummerCampSavingChildId}
          selectedGroupByChildId={ownerSummerCampSelectedGroupByChildId}
          groupPickerChildId={ownerSummerCampGroupPickerChildId}
          onToggleGroupPicker={handleToggleOwnerSummerCampGroupPicker}
          onSelectGroupForChild={handleSelectOwnerSummerCampGroupForChild}
          onCheckInChild={(childId, childName) => {
            const child = ownerSummerCampChildren.find((entry) => entry.id === childId);
            if (!child) {
              return;
            }

            checkInOwnerSummerCampChild(child.id, childName);
          }}
        />
      ) : (
        <OwnerDashboardScreen
          onLogout={handleLogout}
          onShowComingSoon={showComingSoon}
          onOpenStudents={() => setScreen('owner-students')}
          onOpenStaff={() => setScreen('owner-staff')}
          onOpenParents={() => setScreen('owner-parents')}
          onOpenMessages={() => setScreen('owner-messages')}
          onOpenNotifications={() => setScreen('owner-notifications')}
          onOpenBilling={() => setScreen('owner-billing')}
          onOpenCampEvents={() => setScreen('owner-camp-events')}
          onOpenInviteCodes={() => setScreen('owner-invite-codes')}
          onOpenReports={() => setScreen('owner-reports')}
          onOpenSummerCampCheckIn={() => setScreen('owner-summer-camp-check-in')}
          onOpenDailyNotesReview={() => setScreen('owner-daily-notes-review')}
          onOpenIncidentReportsReview={() => setScreen('owner-incident-reports-review')}
          ownerSummerCampSummary={ownerSummerCampSummary}
          staffSummerCampGroups={staffSummerCampGroups}
          ownerPendingDailyNotesCount={ownerDailyNotesPending.length}
          ownerDailyNotesPendingLoading={ownerDailyNotesPendingLoading}
          ownerBeforeAfterCounts={ownerBeforeAfterCounts}
          ownerBeforeAfterCountsLoading={ownerBeforeAfterCountsLoading}
          ownerBeforeAfterCountsError={ownerBeforeAfterCountsError}
          ownerIncidentReportsPending={ownerIncidentReportsPending}
          ownerIncidentReportsPendingLoading={ownerIncidentReportsPendingLoading}
          ownerIncidentReportsPendingError={ownerIncidentReportsPendingError}
        />
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,   
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
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
  tilePink: {
    backgroundColor: '#EC4899',
  },
  tilePurple: {
    backgroundColor: '#7C4DFF',
  },
  tileRed: {
    backgroundColor: COLORS.danger,
  },
  tileYellow: {
    backgroundColor: COLORS.warning,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 104,
    padding: 18,
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
    fontSize: 16,
    fontWeight: '900',
  },
  actionSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 4,
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
  staffHero: {
     backgroundColor: COLORS.navyDark,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,   
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  staffHeroMain: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  staffHeroTextBlock: {
    flex: 1,
    paddingVertical: 2,
  },
  staffHeroSubheading: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  staffStatusPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.warning,
    borderRadius: 999,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  staffStatusPillText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  staffAvatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 999,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  staffAvatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  staffClockHero: {
    backgroundColor: COLORS.navyDark,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,   
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  staffClockStatusPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.warning,
    borderRadius: 999,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  staffClockStatusPillText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  staffClockDetailList: {
    gap: 10,
  },
  staffClockDetailRow: {
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
  staffClockDetailLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  staffClockDetailValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
  },
  staffClockLocationPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.softGreen,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  staffClockLocationPillText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  staffClockLocationNote: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  staffClockPrimaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.blue,
    borderRadius: 20,
    minHeight: 64,
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  staffClockPrimaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  staffClockOwnerPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightBlue,
    borderRadius: 999,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  staffClockOwnerPillText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  staffHoursPendingPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.softOrange,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  staffHoursPendingPillText: {
    color: '#C2410C',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  staffHoursWeekList: {
    gap: 10,
    marginTop: 8,
  },
  staffHoursWeekRow: {
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
  staffHoursWeekDay: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  staffHoursWeekValue: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: '900',
  },
  staffHoursTotalBlock: {
    alignItems: 'center',
    backgroundColor: COLORS.softBlue,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 14,
  },
  staffHoursTotalLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  staffHoursTotalValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  staffHoursApprovedPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.softGreen,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  staffHoursApprovedPillText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  staffHoursApprovedList: {
    gap: 10,
    marginTop: 8,
  },
  staffHoursApprovedRow: {
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
  staffHoursApprovedLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  staffHoursApprovedValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
  },
  staffHoursActivityList: {
    gap: 10,
    marginTop: 8,
  },
  staffHoursActivityRow: {
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
  staffHoursActivityDot: {
    backgroundColor: COLORS.blue,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  staffHoursActivityLabel: {
    color: COLORS.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  staffHoursActivityTime: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '900',
  },
  staffHoursInfoText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  staffStudentSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  staffStudentSummaryItem: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 92,
    paddingVertical: 12,
    alignItems: 'center',
  },
  staffStudentSummaryValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
  },
  staffStudentSummaryLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  staffStudentList: {
    gap: 12,
  },
  staffStudentCard: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
  },
  staffStudentCardSelected: {
    borderColor: COLORS.blue,
    backgroundColor: COLORS.lightBlue,
  },
  staffStudentCardTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  staffStudentNameBlock: {
    flex: 1,
  },
  staffStudentName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  staffStudentLastTime: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
  staffStudentBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 12,
  },
  staffStudentStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  staffStudentStatusPillGreen: {
    backgroundColor: COLORS.softGreen,
  },
  staffStudentStatusPillBlue: {
    backgroundColor: COLORS.lightBlue,
  },
  staffStudentStatusPillOrange: {
    backgroundColor: COLORS.softOrange,
  },
  staffStudentStatusText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  staffStudentStatusTextGreen: {
    color: COLORS.success,
  },
  staffStudentStatusTextBlue: {
    color: COLORS.blue,
  },
  staffStudentStatusTextOrange: {
    color: '#C2410C',
  },
  staffStudentActionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  staffStudentActionButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
  },
  staffStudentPreviewName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  staffStudentPreviewNote: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  staffStudentPreviewList: {
    gap: 10,
    marginTop: 12,
  },
  staffStudentPreviewBlock: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  staffStudentPreviewLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  staffStudentPreviewValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: 4,
  },
  staffAttendanceSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  staffAttendanceSummaryItem: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 92,
    paddingVertical: 12,
  },
  staffAttendanceSummaryValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
  },
  staffAttendanceSummaryLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  staffAttendanceList: {
    gap: 12,
  },
  staffAttendanceItemWrap: {
    gap: 10,
  },
  staffAttendanceCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
  },
  staffAttendanceCardSelected: {
    borderColor: COLORS.blue,
    shadowColor: COLORS.blue,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },
  staffAttendanceCardTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  staffAttendanceNameBlock: {
    flex: 1,
  },
  staffAttendanceName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  staffAttendanceTime: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },
  staffAttendanceStatusPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.softOrange,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  staffAttendanceStatusPillText: {
    color: '#C2410C',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  staffAttendanceStatusPillBlue: {
    backgroundColor: COLORS.lightBlue,
  },
  staffAttendanceStatusPillGreen: {
    backgroundColor: COLORS.softGreen,
  },
  staffAttendanceStatusPillTextBlue: {
    color: COLORS.blue,
  },
  staffAttendanceStatusPillTextGreen: {
    color: COLORS.success,
  },
  staffAttendanceStatusPillTextOrange: {
    color: '#C2410C',
  },
  staffAttendanceMiniRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  staffAttendanceAccentPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  staffAttendanceAccentText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  staffAttendanceMiniMeta: {
    color: COLORS.muted,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },
  staffAttendanceExpandedPanel: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
    padding: 14,
  },
  staffAttendanceExpandedHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  staffAttendanceExpandedTitle: {
    color: COLORS.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
  },
  staffAttendanceDetailList: {
    gap: 8,
    marginTop: 12,
  },
  staffAttendanceDetailRow: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  staffAttendanceDetailLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  staffAttendanceDetailValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
  },
  staffAttendanceActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  staffAttendanceActionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    flexBasis: '48%',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  staffAttendanceActionButtonDisabled: {
    opacity: 0.42,
  },
  staffAttendanceActionButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  staffAttendanceActionButtonTextDisabled: {
    color: COLORS.muted,
  },
  staffAttendancePreviewName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  staffAttendancePreviewNote: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  staffAttendancePreviewList: {
    gap: 10,
    marginTop: 12,
  },
  staffAttendancePreviewBlock: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  staffAttendancePreviewLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  staffAttendancePreviewValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: 4,
  },
  staffAttendanceConfirmButton: {
    alignItems: 'center',
    backgroundColor: COLORS.blue,
    borderRadius: 20,
    marginTop: 12,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  staffAttendanceConfirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  staffDailyNotesChildGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  staffDailyNotesChildCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    flexBasis: '48%',
    minWidth: 140,
    padding: 12,
  },
  staffDailyNotesChildCardSelected: {
    borderColor: COLORS.blue,
    shadowColor: COLORS.blue,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },
  staffDailyNotesChildAccent: {
    borderRadius: 999,
    height: 4,
    marginBottom: 10,
  },
  staffDailyNotesChildName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  staffDailyNotesChildMeta: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  staffDailyNotesChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  staffDailyNotesChip: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    flexBasis: '48%',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  staffDailyNotesChipActive: {
    backgroundColor: COLORS.lightBlue,
    borderColor: COLORS.blue,
  },
  staffDailyNotesChipText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  staffDailyNotesChipTextActive: {
    color: COLORS.blue,
  },
  staffDailyNotesInput: {
    minHeight: 120,
    paddingVertical: 14,
  },
  staffDailyNotesVisibilityRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  staffDailyNotesVisibilityChip: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  staffDailyNotesVisibilityChipActive: {
    backgroundColor: COLORS.softBlue,
    borderColor: COLORS.blue,
  },
  staffDailyNotesVisibilityText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },
  staffDailyNotesVisibilityTextActive: {
    color: COLORS.blue,
  },
  staffDailyNotesPreviewList: {
    gap: 10,
    marginTop: 6,
  },
  staffDailyNotesPreviewBlock: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  staffDailyNotesPreviewLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  staffDailyNotesPreviewValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: 4,
  },
  staffDailyNotesPreviewFooter: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  staffDailyNotesSavedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  staffDailyNotesSavedTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  staffDailyNotesSavedList: {
    gap: 10,
    marginTop: 8,
  },
  staffDailyNotesSavedItem: {
    backgroundColor: COLORS.softBlue,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
  },
  staffDailyNotesSavedTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  staffDailyNotesSavedChild: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
  },
  staffDailyNotesSavedTime: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
  },
  staffDailyNotesSavedSummary: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  staffDailyNotesSaveButtonSaved: {
    backgroundColor: COLORS.success,
  },
  staffDailyNotesSaveButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  staffDailyNotesSaveButtonTextSaved: {
    color: COLORS.white,
  },
  staffDailyNotesSaveButtonTextDisabled: {
    color: COLORS.muted,
  },
  staffDailyNotesTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  staffDailyNotesTag: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  staffDailyNotesTagText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  staffCampGroupButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  staffCampGroupButton: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexBasis: '48%',
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  staffCampGroupButtonText: {
    fontSize: 14,
    fontWeight: '900',
  },
  staffCampRosterList: {
    gap: 12,
  },
  staffCampChildCard: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
  },
  staffCampChildCardTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  staffCampChildNameBlock: {
    flex: 1,
  },
  staffCampChildName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  staffCampChildTime: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
  staffCampStatusStack: {
    alignItems: 'flex-end',
    gap: 8,
  },
  staffCampSummaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  staffCampSummaryPill: {
    borderRadius: 16,
    flexGrow: 1,
    minWidth: 140,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  staffCampSummaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  staffCampSummaryValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  staffCampStatusPillBlue: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightBlue,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  staffCampStatusPillTextBlue: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  staffCampStatusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  staffCampStatusPillText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  staffCampConfirmButton: {
    alignItems: 'center',
    backgroundColor: COLORS.blue,
    borderRadius: 20,
    marginTop: 12,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  staffCampConfirmButtonDisabled: {
    backgroundColor: COLORS.success,
  },
  staffCampConfirmButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
  },
  ownerSummerCampGroupPickerRow: {
    marginTop: 12,
  },
  ownerSummerCampGroupPickerButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ownerSummerCampGroupPickerButtonText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    marginRight: 10,
  },
  ownerSummerCampGroupPickerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  ownerSummerCampGroupOption: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ownerSummerCampGroupOptionActive: {
    backgroundColor: COLORS.lightBlue,
    borderColor: COLORS.blue,
  },
  ownerSummerCampGroupOptionText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },
  ownerSummerCampGroupOptionTextActive: {
    color: COLORS.blue,
  },
  staffCampHeadcountValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  staffCampMissingBlock: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  staffCampMissingLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  staffCampMissingValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: 4,
  },
  staffCampSendButton: {
    alignItems: 'center',
    backgroundColor: COLORS.blue,
    borderRadius: 20,
    marginTop: 12,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  staffCampSendButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  staffCampOwnerUpdate: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
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
  ownerDashboardHeroCopy: {
    gap: 6,
    marginTop: 18,
    paddingHorizontal: 20,
  },
  ownerDashboardEyebrow: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  ownerParentsHero: {
    backgroundColor: COLORS.navyDark,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'relative',
  },
  ownerParentsHeroPill: {
    backgroundColor: COLORS.softPurple,
    borderColor: '#D6CCFF',
    borderWidth: 1,
  },
  ownerParentsHeroPillText: {
    color: OWNER_MODULE_COLORS.Parents,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  ownerMessagesHero: {
    backgroundColor: COLORS.navyDark,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'relative',
  },
  ownerMessagesHeroPill: {
    backgroundColor: COLORS.softBlue,
    borderColor: '#B5E3F7',
    borderWidth: 1,
  },
  ownerMessagesHeroPillText: {
    color: OWNER_MODULE_COLORS.Messages,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  ownerMessagesStateText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 8,
  },
  ownerMessagesErrorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 10,
  },
  ownerChipGroup: {
    marginTop: 14,
  },
  ownerChipGroupLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 10,
  },
  ownerMessageInput: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 22,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 15,
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlignVertical: 'top',
    marginTop: 14,
  },
  ownerTitleInput: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ownerMessageRecipientSection: {
    marginTop: 10,
  },
  ownerMessageRecipientList: {
    gap: 10,
    marginTop: 12,
  },
  ownerMessageRecipientCard: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  ownerMessageRecipientCardActive: {
    backgroundColor: COLORS.softBlue,
    borderColor: '#B5CCFF',
  },
  ownerMessageRecipientEmail: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  ownerMessageRecipientRole: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  ownerMessageRecipientRoleActive: {
    color: COLORS.blue,
  },
  ownerMessageSendDisabled: {
    opacity: 0.7,
  },
  ownerRecentMessageList: {
    gap: 12,
    marginTop: 14,
  },
  ownerRecentMessageCard: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  ownerRecentMessageTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  ownerRecentMessageTextBlock: {
    flex: 1,
  },
  ownerRecentMessageTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  ownerRecentMessageAudience: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 4,
  },
  ownerRecentMessageBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ownerRecentMessageBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
  ownerRecentMessageTime: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 0,
  },
  ownerRecentMessageReceiptRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  ownerRecentMessageReceiptText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
  ownerRecentMessageExpandedBody: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    marginTop: 4,
    padding: 12,
  },
  ownerRecentMessageExpandedLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  ownerRecentMessageExpandedMessage: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  ownerRecentMessageRecipientList: {
    gap: 10,
  },
  ownerRecentMessageRecipientRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  ownerRecentMessageRecipientEmail: {
    color: COLORS.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  ownerRecentMessageRecipientStatus: {
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    textTransform: 'uppercase',
  },
  ownerRecentMessageRecipientStatusRead: {
    backgroundColor: COLORS.softGreen,
    color: COLORS.success,
  },
  ownerRecentMessageRecipientStatusUnread: {
    backgroundColor: COLORS.lightBlue,
    color: COLORS.blue,
  },
  ownerPickupItem: {
    gap: 2,
  },
  ownerPickupMeta: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  ownerCommunicationNote: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },
  ownerInviteCodesHero: {
    backgroundColor: COLORS.navyDark,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'relative',
  },
  ownerInviteCodesHeroPill: {
    backgroundColor: COLORS.softOrange,
    borderColor: '#FCDFA6',
    borderWidth: 1,
  },
  ownerInviteCodesHeroPillText: {
    color: OWNER_MODULE_COLORS['Invite Codes'],
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  ownerReportsHero: {
    backgroundColor: COLORS.navyDark,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'relative',
  },
  ownerReportsHeroPill: {
    backgroundColor: COLORS.softNavy,
    borderColor: '#D9E1EF',
    borderWidth: 1,
  },
  ownerReportsHeroPillText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  ownerReportsHeroTitle: {
    letterSpacing: -0.5,
  },
  ownerReportsStatusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ownerReportsStatusPillText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  ownerReportsStatusReady: {
    backgroundColor: OWNER_MODULE_COLORS.Reports,
  },
  ownerReportsStatusPending: {
    backgroundColor: COLORS.warning,
  },
  ownerInviteBadgeBlue: {
    backgroundColor: OWNER_MODULE_COLORS.Students,
  },
  ownerInviteBadgeGreen: {
    backgroundColor: COLORS.success,
  },
  ownerInviteBadgeOrange: {
    backgroundColor: OWNER_MODULE_COLORS.Billing,
  },
  ownerInviteBadgeTeal: {
    backgroundColor: OWNER_MODULE_COLORS['Camp Events'],
  },
  ownerInviteStatusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  ownerInviteStatusPillText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  ownerInviteGeneratedBlock: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  ownerInviteGeneratedLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  ownerInviteGeneratedCode: {
    color: OWNER_MODULE_COLORS['Invite Codes'],
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  ownerInviteGeneratedMeta: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  ownerInviteRulesList: {
    gap: 12,
    marginTop: 14,
  },
  ownerInviteRuleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  ownerInviteRuleDot: {
    borderRadius: 999,
    height: 10,
    marginTop: 5,
    width: 10,
  },
  ownerInviteRuleText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  ownerCampEventsHero: {
    backgroundColor: COLORS.navyDark,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'relative',
  },
  ownerCampEventsHeroPill: {
    backgroundColor: COLORS.softTeal,
    borderColor: '#BDEAE6',
    borderWidth: 1,
  },
  ownerCampEventsHeroPillText: {
    color: OWNER_MODULE_COLORS['Camp Events'],
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  ownerCampBadgeBlue: {
    backgroundColor: OWNER_MODULE_COLORS.Students,
  },
  ownerCampBadgeGreen: {
    backgroundColor: OWNER_MODULE_COLORS.Staff,
  },
  ownerCampBadgeOrange: {
    backgroundColor: OWNER_MODULE_COLORS.Billing,
  },
  ownerCampBadgeTeal: {
    backgroundColor: OWNER_MODULE_COLORS['Camp Events'],
  },
  ownerCampStatusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  ownerCampStatusPillText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  ownerEventForm: {
    gap: 12,
    marginTop: 14,
  },
  ownerEventField: {
    gap: 8,
  },
  ownerEventFieldLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
  },
  ownerBillingHero: {
    backgroundColor: COLORS.navyDark,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'relative',
  },
  ownerBillingHeroPill: {
    backgroundColor: COLORS.softOrange,
    borderColor: '#FCDFA6',
    borderWidth: 1,
  },
  ownerBillingHeroPillText: {
    color: OWNER_MODULE_COLORS.Billing,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  ownerBillingProgramList: {
    gap: 12,
    marginTop: 14,
  },
  ownerBillingProgramRow: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  ownerBillingProgramLabel: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    paddingRight: 10,
  },
  ownerBillingAmountBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ownerBillingAmountBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
  ownerBillingBadgeBlue: {
    backgroundColor: OWNER_MODULE_COLORS.Students,
  },
  ownerBillingBadgeGreen: {
    backgroundColor: OWNER_MODULE_COLORS.Staff,
  },
  ownerBillingBadgeOrange: {
    backgroundColor: OWNER_MODULE_COLORS.Billing,
  },
  ownerBillingBadgeRed: {
    backgroundColor: COLORS.danger,
  },
  ownerBillingFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  ownerBillingFilterPill: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    minWidth: 84,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ownerBillingFilterPillActive: {
    backgroundColor: COLORS.navyDark,
    borderColor: COLORS.navyDark,
  },
  ownerBillingFilterPillText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  ownerBillingFilterPillTextActive: {
    color: COLORS.white,
  },
  ownerBillingOptionList: {
    gap: 12,
    marginTop: 8,
  },
  ownerBillingOptionCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ownerBillingOptionCardActive: {
    borderColor: COLORS.navyDark,
    backgroundColor: 'rgba(15, 61, 122, 0.08)',
  },
  ownerBillingOptionCardLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  ownerBillingOptionCardLabelActive: {
    color: COLORS.navyDark,
  },
  ownerBillingOptionCardText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  ownerBillingOptionCardTextActive: {
    color: COLORS.navyDark,
  },
  ownerBillingOptionCardMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  ownerBillingOptionCardMetaActive: {
    color: COLORS.navyDark,
  },
  ownerBillingStatusOptionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  ownerBillingStatusOption: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 92,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ownerBillingStatusOptionActive: {
    backgroundColor: COLORS.navyDark,
    borderColor: COLORS.navyDark,
  },
  ownerBillingStatusOptionText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  ownerBillingStatusOptionTextActive: {
    color: COLORS.white,
  },
  ownerBillingTextArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  ownerBillingFormSection: {
    gap: 12,
    marginTop: 14,
  },
  ownerCreateInvoiceButton: {
    alignItems: 'center',
    backgroundColor: COLORS.navyDark,
    borderRadius: 999,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  ownerCreateInvoiceButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
  },
  ownerInvoiceList: {
    gap: 12,
    marginTop: 16,
  },
  ownerInvoiceCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  ownerInvoiceHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  ownerInvoiceNumber: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  ownerInvoiceSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  ownerInvoiceStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  ownerInvoiceStatusPillText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  ownerInvoiceDetailGrid: {
    gap: 10,
    marginTop: 14,
  },
  ownerInvoiceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  ownerInvoiceDetailLabel: {
    color: COLORS.textMuted,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  ownerInvoiceDetailValue: {
    color: COLORS.text,
    flex: 1.3,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  ownerInvoiceCardActions: {
    alignItems: 'flex-end',
    marginTop: 14,
  },
  ownerInvoiceActionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.navyDark,
    borderRadius: 999,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  ownerInvoiceActionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
  },
  ownerInvoiceCreateActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  ownerBillingStatusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  ownerBillingStatusPillText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  ownerSummerCampHero: {
    backgroundColor: COLORS.navyDark,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'relative',
  },
  ownerSummerCampHeroMain: {
    marginTop: 18,
  },
  ownerSummerCampHeroCopy: {
    gap: 6,
  },
  ownerSummerCampHeroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  ownerAccessPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  ownerAccessPillText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ownerSummerCampActionBlock: {
    gap: 12,
  },
  ownerSummerCampActionText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  ownerSummerCampChildList: {
    gap: 12,
  },
  ownerActivityList: {
    gap: 12,
  },
  ownerActivityRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  ownerActivityTime: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '900',
    minWidth: 66,
  },
  ownerActivityDot: {
    borderRadius: 999,
    height: 10,
    marginTop: 5,
    width: 10,
  },
  ownerActivityText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  ownerAccordionCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  ownerAccordionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  ownerAccordionHeadingBlock: {
    flex: 1,
  },
  ownerAccordionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  ownerAccordionSummary: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  ownerAccordionChevron: {
    color: COLORS.blue,
    fontSize: 24,
    fontWeight: '900',
    marginTop: -2,
  },
  ownerAccordionContent: {
    marginTop: 14,
  },
  ownerDailyNotesReviewStickyHeader: {
    backgroundColor: COLORS.navyDark,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 4,
  },
  ownerDailyNotesReviewHeaderTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  ownerDailyNotesReviewHeroMain: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 18,
  },
  ownerDailyNotesReviewHeroCopy: {
    flex: 1,
    gap: 6,
  },
  ownerDailyNotesReviewSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  ownerDailyNotesReviewCountBadge: {
    alignItems: 'center',
    borderRadius: 22,
    justifyContent: 'center',
    minWidth: 88,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ownerDailyNotesReviewCountValue: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30,
  },
  ownerDailyNotesReviewCountLabel: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  ownerSectionDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ownerDailyNotesReviewList: {
    gap: 12,
    marginTop: 12,
  },
  ownerDailyNotesReviewCardHeading: {
    flex: 1,
    paddingRight: 12,
  },
  ownerDailyNotesReviewCustomNote: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  ownerDailyNotesReviewActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  ownerDailyNotesReviewApproveButton: {
    alignItems: 'center',
    backgroundColor: COLORS.success,
    borderRadius: 999,
    flexBasis: 0,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 120,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  ownerDailyNotesReviewApproveButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  ownerDailyNotesReviewRejectButton: {
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: 999,
    flexBasis: 0,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 120,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  ownerDailyNotesReviewRejectButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  ownerDailyNotesReviewButtonDisabled: {
    opacity: 0.7,
  },
  ownerSectionList: {
    gap: 12,
  },
  ownerQuickActionsList: {
    gap: 12,
  },
  ownerNavCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 92,
    overflow: 'hidden',
    paddingVertical: 16,
    paddingRight: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  ownerNavAccent: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    height: 8,
    marginBottom: 12,
    width: 64,
  },
  ownerNavContent: {
    flex: 1,
  },
  ownerNavTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '900',
  },
  ownerNavSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 4,
  },
  ownerNavChevron: {
    color: COLORS.blue,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 24,
  },
  ownerSearchInput: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ownerTextArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  ownerPriorityDropdownTab: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ownerPriorityDropdownTabText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    paddingRight: 12,
  },
  ownerPriorityDropdownChevron: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: '900',
  },
  ownerPriorityDropdownMenu: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  ownerPriorityDropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ownerPriorityDropdownItemActive: {
    backgroundColor: COLORS.softBlue,
  },
  ownerFilterPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  ownerFilterPill: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ownerFilterPillActive: {
    backgroundColor: COLORS.softBlue,
    borderColor: '#B5CCFF',
  },
  ownerFilterPillText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  ownerFilterPillTextActive: {
    color: COLORS.blue,
  },
  ownerStudentList: {
    gap: 12,
    marginTop: 14,
  },
  ownerStudentsStateText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  ownerStudentFormLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 8,
  },
  ownerStudentCard: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  ownerStudentTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  ownerStudentMainBlock: {
    flex: 1,
  },
  ownerStudentName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  ownerStudentParent: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 4,
  },
  ownerStudentBadge: {
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  ownerStudentBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  ownerStudentBadgeBlue: {
    backgroundColor: COLORS.blue,
  },
  ownerStudentBadgeGreen: {
    backgroundColor: COLORS.success,
  },
  ownerStudentBadgeOrange: {
    backgroundColor: COLORS.warning,
  },
  ownerStudentBadgeRed: {
    backgroundColor: COLORS.danger,
  },
  ownerStudentBadgePurple: {
    backgroundColor: '#7C4DFF',
  },
  ownerStudentChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  ownerStudentProgramChip: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ownerStudentProgramChipText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: '900',
  },
  ownerStudentMetaRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 12,
  },
  ownerStudentStatusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  ownerStudentStatusPillBlue: {
    backgroundColor: COLORS.softBlue,
  },
  ownerStudentStatusPillGreen: {
    backgroundColor: COLORS.softGreen,
  },
  ownerStudentStatusPillOrange: {
    backgroundColor: COLORS.softOrange,
  },
  ownerStudentStatusPillPurple: {
    backgroundColor: COLORS.softPurple,
  },
  ownerStudentStatusPillText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
  },
  ownerLinkedParentsBlock: {
    marginTop: 12,
  },
  ownerLinkedParentsLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  ownerLinkedParentsValue: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 4,
  },
  ownerStudentActionMenu: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  studentActionDropdown: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  studentActionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  studentActionPill: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  studentActionPillBlue: {
    backgroundColor: COLORS.blue,
  },
  studentActionPillNavy: {
    backgroundColor: COLORS.navy,
  },
  studentActionPillGreen: {
    backgroundColor: COLORS.success,
  },
  studentActionPillRed: {
    backgroundColor: COLORS.danger,
  },
  studentActionPillPurple: {
    backgroundColor: '#7C5CFF',
  },
  inviteCodePrompt: {
    alignItems: 'center',
    marginTop: 20,
  },
  inviteCodeText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  activateAccountText: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  ownerStudentProfileButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ownerStudentProfileButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
  ownerLinkParentModalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  ownerLinkParentModalCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 28,
    borderWidth: 1,
    maxHeight: '86%',
    padding: 18,
    width: '100%',
  },
  ownerLinkParentModalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },
  ownerLinkParentModalSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 4,
  },
  ownerLinkParentModalList: {
    marginTop: 14,
  },
  ownerLinkParentOption: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  ownerLinkParentOptionActive: {
    backgroundColor: COLORS.softBlue,
    borderColor: '#B5CCFF',
  },
  ownerLinkParentOptionEmail: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  ownerLinkParentOptionMeta: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  ownerLinkParentModalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  ownerDailyNoteInput: {
    minHeight: 120,
    paddingVertical: 14,
  },
  ownerParentList: {
    gap: 12,
    marginTop: 14,
  },
  ownerParentCard: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ownerParentCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 16,
  },
  ownerParentHeaderTextBlock: {
    flex: 1,
  },
  ownerParentName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  ownerParentChildCount: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  ownerParentHeaderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  ownerParentExpandedContent: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    padding: 16,
  },
  ownerParentDetailRow: {
    marginBottom: 12,
  },
  ownerParentDetailLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  ownerParentDetailValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  ownerParentChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  ownerParentProgramChip: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ownerParentProgramChipText: {
    color: OWNER_MODULE_COLORS.Parents,
    fontSize: 11,
    fontWeight: '900',
  },
  ownerParentActionList: {
    gap: 10,
    marginTop: 4,
  },
  ownerStudentsHeroPill: {
    backgroundColor: COLORS.softBlue,
    borderColor: '#B5CCFF',
    borderWidth: 1,
  },
  ownerStudentsHeroPillText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  ownerStaffHeroPill: {
    backgroundColor: '#F0FBF4',
    borderColor: '#B7E4C0',
    borderWidth: 1,
  },
  ownerStaffHeroPillText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  ownerStaffList: {
    gap: 12,
    marginTop: 14,
  },
  ownerStaffCard: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  ownerStaffBadge: {
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  ownerStaffBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  ownerStaffBadgeBlue: {
    backgroundColor: COLORS.blue,
  },
  ownerStaffBadgeGreen: {
    backgroundColor: COLORS.success,
  },
  ownerStaffBadgeOrange: {
    backgroundColor: COLORS.warning,
  },
  ownerStaffBadgeRed: {
    backgroundColor: COLORS.danger,
  },
  ownerStaffBadgePurple: {
    backgroundColor: '#7C4DFF',
  },
  ownerStaffMetaList: {
    gap: 10,
    marginTop: 12,
  },
  ownerStaffMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  ownerStaffMetaLabel: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  ownerStaffMetaValue: {
    color: COLORS.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  ownerStaffStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  ownerStaffStatusPillGreen: {
    backgroundColor: COLORS.softGreen,
  },
  ownerStaffStatusPillOrange: {
    backgroundColor: COLORS.softOrange,
  },
  ownerStaffStatusPillText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
  },
  ownerStaffReviewPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  ownerStaffReviewGreen: {
    backgroundColor: COLORS.softGreen,
  },
  ownerStaffReviewOrange: {
    backgroundColor: COLORS.softOrange,
  },
  ownerStaffReviewPillText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
  },
  ownerStaffProfileButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ownerStaffProfileButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
  ownerActionButtonStack: {
    gap: 12,
    marginTop: 14,
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,   
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
    marginTop: -8,
  },
  shellHeroSubtitle: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 15,
    lineHeight: 22,
    marginTop: -8,
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
   marginTop: -5,
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
    borderBottomRightRadius: 30,   
    overflow: 'hidden',
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
  parentAttendanceList: {
    gap: 12,
  },
  parentAttendanceChildBlock: {
    backgroundColor: COLORS.softBlue,
    borderColor: COLORS.border,
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  parentAttendanceChildHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  parentAttendanceChildName: {
    color: COLORS.text,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  parentAttendanceChildRoom: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '800',
  },
  parentAttendanceEventList: {
    gap: 10,
  },
  parentAttendanceEventRow: {
    alignItems: 'flex-start',
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  parentAttendanceEventCopy: {
    flex: 1,
    paddingRight: 12,
  },
  parentAttendanceEventType: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  parentAttendanceEventDate: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  parentAttendanceEventTime: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
  },
  parentAttendanceStateText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  parentAccordionCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  parentAccordionCardOpen: {
    shadowOpacity: 0.08,
    elevation: 3,
  },
  parentAccordionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  parentAccordionHeaderCopy: {
    flex: 1,
    paddingRight: 12,
  },
  parentAccordionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  parentAccordionSummary: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  parentAccordionChevron: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: '900',
  },
  parentAccordionBody: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    gap: 12,
    padding: 16,
  },
  parentTimelineList: {
    gap: 12,
  },
  parentTimelineCard: {
    backgroundColor: COLORS.softBlue,
    borderColor: COLORS.border,
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  parentTimelineAttendanceBlock: {
    gap: 4,
  },
  parentTimelineDailyNoteBlock: {
    gap: 6,
  },
  parentTimelineTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  parentTimelineMeta: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  parentTimelineTime: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: '900',
  },
  parentDailyNotesList: {
    gap: 10,
  },
  parentDailyNoteRow: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
  },
  parentDailyNoteQuickNotes: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: 6,
  },
  parentDailyNoteCustomNote: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 8,
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,   
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,   
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,   
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
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
  billingInvoiceStatusOverdue: {
    backgroundColor: COLORS.softRed,
  },
  billingInvoiceStatusCancelled: {
    backgroundColor: COLORS.softGray,
  },
  billingInvoiceStatusTextOverdue: {
    color: COLORS.danger,
  },
  billingInvoiceStatusTextCancelled: {
    color: COLORS.muted,
  },
  billingInvoiceCard: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  billingInvoiceCardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  billingInvoiceCardFooter: {
    alignItems: 'flex-start',
    gap: 2,
    marginTop: 10,
  },
  billingInvoiceExpandedSection: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  billingLineItemCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  billingLineItemDescription: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  billingLineItemRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  billingLineItemMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,   
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,   
    overflow: 'hidden',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 10,  },
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
  notificationsHeroSubtitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 10,
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
  recipientMessagesSection: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  recipientMessagesStateText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  recipientMessageExpandedFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  recipientMessageExpandedLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  recipientMessageExpandedValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
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
