// TelemetryCollector.ts - Event buffering and batch logging service

import type { DashboardTelemetryEvent } from '../types/TelemetryEvent';
import type { DashboardContext } from '../types/DashboardContext';

const FLUSH_THRESHOLD = 10;

/**
 * TelemetryCollector - Singleton service for dashboard event tracking.
 * Buffers events and auto-flushes when buffer reaches threshold.
 */
export class TelemetryCollector {
  private static instance: TelemetryCollector | null = null;
  
  private buffer: DashboardTelemetryEvent[] = [];
  private context: DashboardContext | null = null;
  private userId: string = 'user_anonymous';
  private sessionId: string;

  private constructor() {
    // Generate session ID once (simple timestamp-based UUID)
    this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  static getInstance(): TelemetryCollector {
    if (!TelemetryCollector.instance) {
      TelemetryCollector.instance = new TelemetryCollector();
    }
    return TelemetryCollector.instance;
  }

  /**
   * Set current dashboard context (called by HeroDashboard on context load).
   */
  setContext(context: DashboardContext): void {
    this.context = context;
  }

  /**
   * Set user ID for event attribution.
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Track an event with auto-context enrichment.
   */
  track(eventType: DashboardTelemetryEvent['eventType'], payload: Record<string, any> = {}): void {
    if (!this.context) {
      console.warn('[Telemetry] Context not set, skipping event:', eventType);
      return;
    }

    // Derive user state from patterns
    const userState = this.deriveUserState();

    const event: DashboardTelemetryEvent = {
      eventType,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      context: {
        timeSlot: this.context.timeSlot,
        userState,
        streakDays: this.context.patterns.streakDays,
        daysSinceLastWorkout: this.context.patterns.daysSinceLastWorkout === Infinity 
          ? null 
          : this.context.patterns.daysSinceLastWorkout,
      },
      payload,
    };

    this.buffer.push(event);

    // Auto-flush when buffer reaches threshold
    if (this.buffer.length >= FLUSH_THRESHOLD) {
      this.flush();
    }
  }

  /**
   * Flush buffered events (console.log batch for now, future: API upload).
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const batch = [...this.buffer];
    this.buffer = [];

    // Log batch to console (readable JSON format)
    console.log('[Telemetry Batch]', JSON.stringify(batch, null, 2));
  }

  /**
   * Derive user state from current context patterns.
   */
  private deriveUserState(): string {
    if (!this.context) {
      return 'unknown';
    }

    const { streakDays, daysSinceLastWorkout } = this.context.patterns;

    if (streakDays >= 3 && daysSinceLastWorkout === 0) {
      return 'active_streak';
    } else if (streakDays > 0 && daysSinceLastWorkout <= 1) {
      return 'recent_activity';
    } else if (daysSinceLastWorkout === Infinity) {
      return 'onboarding';
    } else {
      return 'inactive';
    }
  }
}
