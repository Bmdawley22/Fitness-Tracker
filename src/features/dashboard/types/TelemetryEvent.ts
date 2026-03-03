// TelemetryEvent.ts - Dashboard telemetry event schema

export type DashboardTelemetryEvent = {
  eventType: 
    | 'hero_dashboard_view'
    | 'widget_rendered'
    | 'quick_action_tap'
    | 'suggestion_accepted'
    | 'suggestion_dismissed'
    | 'widget_interaction';
  
  timestamp: number;
  userId: string;
  sessionId: string;
  
  context: {
    timeSlot: 'morning' | 'midday' | 'evening' | 'night';
    userState: string;
    streakDays: number;
    daysSinceLastWorkout: number | null;
  };
  
  payload: {
    widgetId?: string;
    widgetType?: string;
    widgetPosition?: number;
    actionId?: string;
    actionType?: string;
    suggestionId?: string;
    suggestionType?: string;
    interactionType?: string;
  };
};
