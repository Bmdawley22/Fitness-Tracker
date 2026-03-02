export type TelemetryEvent =
  | 'hero_impression'
  | 'hero_cta_click'
  | 'workout_card_plus'
  | 'flow_start'
  | 'flow_state'
  | 'flow_completion'
  | 'flow_completion_toast';

export function logTelemetry(event: TelemetryEvent, payload?: Record<string, unknown>) {
  // Replace with real telemetry backend as needed.
  console.log(`[telemetry] ${event}`, { timestamp: new Date().toISOString(), ...payload });
}
