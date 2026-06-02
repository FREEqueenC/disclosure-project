# OpenTelemetry Visualization Plan

**Objective:** Instrument the `disclosure-project.org` backend with OpenTelemetry (OTel) and visualize the telemetry data using Google Cloud's **Application Signals** feature on GKE.

**Key Files & Context:**
- `levity-cluster` (us-central1, project: `anw-aetheric-envoy`)
- `backend/package.json`
- `backend/index.ts`
- `backend/instrumentation.ts` (new)
- `backend/Dockerfile`

**Implementation Steps:**

1.  **Enable GKE Managed OpenTelemetry:**
    *   Run `gcloud container clusters update levity-cluster --location us-central1 --project anw-aetheric-envoy --enable-managed-otel`
    *   This deploys a managed OTel collector in the cluster (`http://opentelemetry-collector.gke-managed-otel.svc.cluster.local:4317`) that automatically forwards data to Cloud Trace and Cloud Monitoring.

2.  **Instrument the Node.js Backend:**
    *   Add required OTel packages to `backend/package.json` (`@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`, `@opentelemetry/exporter-trace-otlp-grpc`, `@opentelemetry/resource-detector-gcp`).
    *   Create a new file `backend/instrumentation.ts` to initialize the OTel SDK using the auto-instrumentations package. The `traceExporter` will point to the local GKE managed collector.

3.  **Update Build Configuration:**
    *   Modify `backend/Dockerfile` to start the Node.js application requiring the new `instrumentation.ts` file (`CMD ["npx", "ts-node", "--require", "./instrumentation.ts", "index.ts"]`).

4.  **Verification & Testing:**
    *   Deploy the updated backend to `levity-cluster` (assumed via CI/CD or manual `kubectl apply`).
    *   Generate test traffic to the `backend`.
    *   Verify the telemetry data populates in the Google Cloud Console under **Observability > Application Signals** (Service Map and health dashboards).

**Migration & Rollback:**
- Revert the `package.json` and `Dockerfile` changes if instrumentation causes startup issues.
- The `gcloud` cluster update can be reversed by disabling the managed feature.
