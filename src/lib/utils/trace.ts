import {
  context,
  trace,
  type Span,
  type Context,
  type SpanOptions,
  SpanStatusCode,
} from '@opentelemetry/api';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

class Trace {
  provider!: WebTracerProvider;
  serviceName: string = '';
  endpoint: string = '';
  exportTimeoutMillis: number = 1000;

  setupSDK(service: string, endpoint: string) {
    this.serviceName = service;
    this.endpoint = endpoint;
    this.provider = new WebTracerProvider({
      resource: new Resource({
        [SEMRESATTRS_SERVICE_NAME]: this.serviceName,
      }),
    });
    const provider = this.provider;
    const exporter = new OTLPTraceExporter({
      timeoutMillis: this.exportTimeoutMillis,
      url: endpoint,
    });
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    provider.register({
      contextManager: new ZoneContextManager(),
      propagator: new B3Propagator(),
    });

    // Registering instrumentations
    registerInstrumentations({
      instrumentations: [new DocumentLoadInstrumentation()],
    });
  }

  public contextFromParent(parent: Span): Context {
    const ctx = trace.setSpan(context.active(), parent);
    return ctx;
  }

  public traceparent(span: Span): string {
    const version = '00';
    const traceId = span.spanContext().traceId;
    const spanId = span.spanContext().spanId;
    const sampled = '01';
    return `${version}-${traceId}-${spanId}-${sampled}`;
  }

  public tracestate(span: Span): string {
    return span.spanContext().traceState?.serialize() ?? '';
  }

  public getTracer() {
    return this.provider.getTracer(this.serviceName);
  }

  public getTrace() {
    return trace;
  }

  public startSpan(name: string, options?: SpanOptions, context?: Context) {
    return this.getTracer().startSpan(name, options, context);
  }

  public recordOK(span: Span) {
    span.setStatus({
      code: SpanStatusCode.OK,
    });
  }

  public recordError(span: Span, message: string, ignoreTraceError?: boolean) {
    span.recordException(message);
    if (!ignoreTraceError) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: message,
      });
    }
  }
}

export default new Trace();
