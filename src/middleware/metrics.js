const {
  httpStatusCounter,
  httpResponseTime,
  httpRequestsCounter,
  status2xxCounter,
  status3xxCounter,
  status4xxCounter,
  status5xxCounter,
} = require('../metrics');

function metricsMiddleware(req, res, next) {
  const start = process.hrtime();

  // Increment total requests counter
  httpRequestsCounter.add(1, {
    method: req.method,
    path: req.path,
    endpoint: req.originalUrl,
  });

  // Capture response
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;

    // Record response time
    httpResponseTime.record(duration, {
      method: req.method,
      path: req.path,
      status_code: res.statusCode.toString(),
    });

    // Record status code
    httpStatusCounter.add(1, {
      method: req.method,
      path: req.path,
      status_code: res.statusCode.toString(),
    });

    // Record specific status code counters
    if (res.statusCode >= 200 && res.statusCode < 300) {
      status2xxCounter.add(1, { path: req.path });
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      status3xxCounter.add(1, { path: req.path });
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      status4xxCounter.add(1, { path: req.path });
    } else if (res.statusCode >= 500) {
      status5xxCounter.add(1, { path: req.path });
    }
  });

  next();
}

module.exports = metricsMiddleware; 