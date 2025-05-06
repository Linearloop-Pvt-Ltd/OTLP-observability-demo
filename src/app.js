const express = require('express');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { metrics } = require('@opentelemetry/api');

// Initialize OpenTelemetry
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

// Create custom metrics
const meter = metrics.getMeter('sample-app');

// HTTP Status Code Counters
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

// Response Time Histogram
const responseTimeHistogram = meter.createHistogram('http_response_time_seconds', {
  description: 'HTTP response time in seconds',
  unit: 's',
});

// Request Counter
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
});

const app = express();
const port = 3000;

// Middleware to track request metrics
app.use((req, res, next) => {
  const start = Date.now();
  requestCounter.add(1, { 
    method: req.method,
    path: req.path,
    endpoint: req.path
  });
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const statusCode = res.statusCode;
    
    // Record response time
    responseTimeHistogram.record(duration, {
      method: req.method,
      path: req.path,
      status_code: statusCode.toString()
    });

    // Count status codes
    if (statusCode >= 200 && statusCode < 300) {
      status2xxCounter.add(1, { path: req.path });
    } else if (statusCode >= 300 && statusCode < 400) {
      status3xxCounter.add(1, { path: req.path });
    } else if (statusCode >= 400 && statusCode < 500) {
      status4xxCounter.add(1, { path: req.path });
    } else if (statusCode >= 500) {
      status5xxCounter.add(1, { path: req.path });
    }
  });
  
  next();
});

// Sample endpoints with different response times and status codes
app.get('/api/hello', (req, res) => {
  // Simulate some work
  const start = Date.now();
  while (Date.now() - start < 100) {
    // Busy wait for 100ms
  }
  res.json({ message: 'Hello World!' });
});

app.get('/api/redirect', (req, res) => {
  res.redirect('/api/hello');
});

app.get('/api/not-found', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.get('/api/error', (req, res) => {
  res.status(500).json({ error: 'Internal Server Error' });
});

// Complex endpoint with random response time
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Bob Johnson' }
  ];
  
  // Simulate random processing time between 100ms and 500ms
  const processingTime = 100 + Math.random() * 400;
  setTimeout(() => {
    res.json(users);
  }, processingTime);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const server = app.listen(port, () => {
  console.log(`Sample app listening at http://localhost:${port}`);
});

// Handle server shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed');
  });
});