// timeSlotDetector.ts - Detect current time slot

import type { TimeSlot } from '../types/DashboardContext';

/**
 * Detect current time slot based on hour of day.
 * - morning: 5am-11am
 * - midday: 11am-5pm
 * - evening: 5pm-10pm
 * - night: 10pm-5am
 */
export function detectTimeSlot(): TimeSlot {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 11) {
    return 'morning';
  } else if (hour >= 11 && hour < 17) {
    return 'midday';
  } else if (hour >= 17 && hour < 22) {
    return 'evening';
  } else {
    return 'night';
  }
}
