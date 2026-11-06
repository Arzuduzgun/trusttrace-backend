import { isSpanContextValid, SpanStatusCode, trace, type Attributes } from '@opentelemetry/api';

const tracer = trace.getTracer('trusttrace');

export async function withSpan<T>(
  name: string,
  attributes: Attributes,
  task: () => T | Promise<T>,
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      return await task();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      span.recordException(error instanceof Error ? error : message);
      span.setStatus({ code: SpanStatusCode.ERROR, message });
      throw error;
    } finally {
      span.end();
    }
  });
}

export function annotateSpan(attributes: Attributes): void {
  trace.getActiveSpan()?.setAttributes(attributes);
}

export function currentTraceId(): string | null {
  const context = trace.getActiveSpan()?.spanContext();
  return context && isSpanContextValid(context) ? context.traceId : null;
}
