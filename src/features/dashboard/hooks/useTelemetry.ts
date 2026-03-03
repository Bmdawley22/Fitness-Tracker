// useTelemetry.ts - React hook for event tracking

import { useCallback } from 'react';
import { TelemetryCollector } from '../services/TelemetryCollector';
import type { DashboardTelemetryEvent } from '../types/TelemetryEvent';

/**
 * Hook for tracking dashboard telemetry events.
 * Provides a track() function that auto-enriches events with context.
 */
export function useTelemetry() {
  const track = useCallback(
    (eventType: DashboardTelemetryEvent['eventType'], payload: Record<string, any> = {}) => {
      TelemetryCollector.getInstance().track(eventType, payload);
    },
    []
  );

  return { track };
}
