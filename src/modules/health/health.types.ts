export type DependencyState = 'up' | 'down';

export interface ReadinessReport {
  status: 'ok' | 'unavailable';
  checks: Record<string, DependencyState>;
}