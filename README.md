# OpenTelemetry, Prometheus, and Grafana POC

This is a proof of concept demonstrating application monitoring using OpenTelemetry, Prometheus, and Grafana.

## Architecture

- Node.js/Express application with OpenTelemetry instrumentation
- Prometheus for metrics collection
- Grafana for visualization
- All services containerized with Docker

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

## Getting Started

1. Clone this repository
2. Build and start the services:
   ```bash
   docker-compose up --build
   ```

3. Access the services:
   - Sample Application: http://localhost:3000
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001 (admin/admin)

## Testing the Application

The sample application provides two endpoints:
- http://localhost:3000/api/hello - Returns a hello message
- http://localhost:3000/api/error - Generates an error for testing error tracking

## Setting up Grafana

1. Log in to Grafana (http://localhost:3001) with credentials:
   - Username: admin
   - Password: admin

2. Add Prometheus as a data source:
   - URL: http://prometheus:9090
   - Access: Server (default)

3. Import the following dashboards:
   - Node.js Application Dashboard
   - Prometheus Overview Dashboard

## Available Metrics

The application exposes various metrics through OpenTelemetry:
- HTTP request duration
- HTTP request count
- Node.js runtime metrics
- Custom business metrics

## Stopping the Services
```bash
   docker-compose down
   ```
