export const DEFAULT_PRICING_RULES = [
  {
    rule_name: 'Weekend Premium',
    rule_type: 'day_of_week',
    multiplier: 1.15,
    conditions: {
      days: ['Saturday', 'Sunday']
    },
    display_label: 'Weekend Premium (+15%)',
    priority: 1,
    is_active: true
  },
  {
    rule_name: 'Evening Premium',
    rule_type: 'time_of_day',
    multiplier: 1.10,
    conditions: {
      start_hour: 17,
      end_hour: 21
    },
    display_label: 'Evening Service (+10%)',
    priority: 2,
    is_active: true
  },
  {
    rule_name: 'Last Minute Booking',
    rule_type: 'last_minute',
    multiplier: 1.20,
    conditions: {
      hours_notice: 24
    },
    display_label: 'Last-Minute Booking (+20%)',
    priority: 3,
    is_active: true
  },
  {
    rule_name: 'Long Distance',
    rule_type: 'distance',
    multiplier: 1.15,
    conditions: {
      min_miles: 15
    },
    display_label: 'Travel Fee (+15%)',
    priority: 4,
    is_active: true
  },
  {
    rule_name: 'Holiday Premium',
    rule_type: 'holiday',
    multiplier: 1.30,
    conditions: {
      holidays: [
        '2024-12-24',
        '2024-12-25',
        '2024-12-31',
        '2025-01-01',
        '2025-07-04',
        '2025-11-28'
      ]
    },
    display_label: 'Holiday Premium (+30%)',
    priority: 5,
    is_active: true
  },
  {
    rule_name: 'First Booking Discount',
    rule_type: 'first_booking_discount',
    multiplier: 0.90,
    conditions: {},
    display_label: 'First Booking Discount (-10%)',
    priority: 0,
    is_active: true
  }
];