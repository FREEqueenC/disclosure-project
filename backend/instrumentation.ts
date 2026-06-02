import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { gcpDetector } from '@opentelemetry/resource-detector-gcp';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Optional: Enable OTel diagnostic logging for troubleshooting
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'gnostic-auditor-backend',
    // Application Signals attributes
    'service.namespace': process.env.K8S_NAMESPACE_NAME || 'default',
  }),
  // Detects GKE resource attributes (cluster name, pod name, etc.)
  resourceDetectors: [gcpDetector],
  traceExporter: new OTLPTraceExporter({
    // Point to the Managed OTel Collector endpoint in GKE
    url: 'http://opentelemetry-collector.gke-managed-otel.svc.cluster.local:4317',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

try {
  sdk.start();
  console.log('[Aetheric OTel] Instrumentation initialized');
} catch (error) {
  console.error('[Aetheric OTel] Failed to initialize instrumentation', error);
}
