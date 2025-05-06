const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { metrics } = require('@opentelemetry/api');
const { MeterProvider } = require('@opentelemetry/sdk-metrics');

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'sample-app',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  metricReader: new PrometheusExporter({
    port: 9464,
  }),
});

// Handle process termination
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('SDK shut down successfully'))
    .catch((error) => console.log('Error shutting down SDK', error))
    .finally(() => process.exit(0));
});

sdk.start();

// Create a meter provider
const meterProvider = new MeterProvider();

// Create a Prometheus exporter
const prometheusExporter = new PrometheusExporter({
  port: 9464,
});

// Add the exporter to the meter provider
meterProvider.addMetricReader(prometheusExporter);

// Get a meter from the meter provider
const meter = meterProvider.getMeter('sample-app');

// Create metrics
const httpStatusCounter = meter.createCounter('http_status_total', {
  description: 'Total number of HTTP status codes',
});

const httpResponseTime = meter.createHistogram('http_response_time_seconds', {
  description: 'HTTP response time in seconds',
  unit: 's',
});

const httpRequestsCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
});

// Create status code specific counters
const status2xxCounter = meter.createCounter('http_status_2xx_total', {
  description: 'Total number of 2xx responses',
});

const status3xxCounter = meter.createCounter('http_status_3xx_total', {
  description: 'Total number of 3xx responses',
});

const status4xxCounter = meter.createCounter('http_status_4xx_total', {
  description: 'Total number of 4xx responses',
});

const status5xxCounter = meter.createCounter('http_status_5xx_total', {
  description: 'Total number of 5xx responses',
});

// Export the metrics
module.exports = {
  httpStatusCounter,
  httpResponseTime,
  httpRequestsCounter,
  status2xxCounter,
  status3xxCounter,
  status4xxCounter,
  status5xxCounter,
}; 