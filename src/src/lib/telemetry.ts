/**
 * Telemetry and event logging
 * Tracks key user actions and API performance
 */

export type TelemetryEvent =
  | { type: 'page_view'; page: string }
  | { type: 'api_call_success'; endpoint: string; duration: number }
  | { type: 'api_call_error'; endpoint: string; error: string }
  | { type: 'ai_report_generate'; reportType: string; duration: number }
  | { type: 'export'; format: 'csv' | 'json'; itemCount: number }
  | { type: 'feature_use'; feature: string; metadata?: Record<string, any> };

class Telemetry {
  private events: TelemetryEvent[] = [];
  private maxEvents = 100;

  log(event: TelemetryEvent): void {
    const timestamp = new Date().toISOString();
    console.log(`[Telemetry ${timestamp}]`, event);

    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // In production, send to analytics service
    // this.sendToAnalytics(event);
  }

  pageView(page: string): void {
    this.log({ type: 'page_view', page });
  }

  apiSuccess(endpoint: string, duration: number): void {
    this.log({ type: 'api_call_success', endpoint, duration });
  }

  apiError(endpoint: string, error: string): void {
    this.log({ type: 'api_call_error', endpoint, error });
  }

  aiReport(reportType: string, duration: number): void {
    this.log({ type: 'ai_report_generate', reportType, duration });
  }

  export(format: 'csv' | 'json', itemCount: number): void {
    this.log({ type: 'export', format, itemCount });
  }

  featureUse(feature: string, metadata?: Record<string, any>): void {
    this.log({ type: 'feature_use', feature, metadata });
  }

  getEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }

  // In production, implement:
  // private sendToAnalytics(event: TelemetryEvent): void { ... }
}

export const telemetry = new Telemetry();
