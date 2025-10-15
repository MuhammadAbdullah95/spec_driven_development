# Kubernetes Deployment Guide

## Prerequisites

- Kubernetes cluster (1.21+)
- kubectl configured
- Container registry access
- Ingress controller (nginx recommended)
- cert-manager (for TLS certificates)
- Metrics server (for HPA)

## Quick Start

### 1. Build and Push Docker Image

```bash
# Build image
docker build -t your-registry/blog-api:latest .

# Push to registry
docker push your-registry/blog-api:latest
```

### 2. Create Secrets

```bash
# Copy secrets template
cp k8s/secrets.yaml.example k8s/secrets.yaml

# Edit secrets.yaml with real values (base64 encoded)
# Generate JWT secret: openssl rand -hex 32 | base64
# Encode DATABASE_URL: echo -n 'postgresql+asyncpg://...' | base64

# Apply secrets
kubectl apply -f k8s/secrets.yaml
```

### 3. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply configuration
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Setup ingress (update domain in ingress.yaml first)
kubectl apply -f k8s/ingress.yaml

# Enable autoscaling
kubectl apply -f k8s/hpa.yaml

# Setup monitoring (if Prometheus is installed)
kubectl apply -f k8s/servicemonitor.yaml
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods -n blog-api

# Check services
kubectl get svc -n blog-api

# Check ingress
kubectl get ingress -n blog-api

# View logs
kubectl logs -f deployment/blog-api -n blog-api

# Check health
kubectl exec -it deployment/blog-api -n blog-api -- curl localhost:8000/health
```

## Configuration

### Environment Variables

Configure in `k8s/configmap.yaml`:
- `ENVIRONMENT`: production/staging/development
- `LOG_LEVEL`: DEBUG/INFO/WARNING/ERROR
- `CORS_ORIGINS`: Comma-separated allowed origins
- `DB_POOL_SIZE`: Database connection pool size

### Secrets

Configure in `k8s/secrets.yaml`:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret key for JWT signing

### Resource Limits

Configure in `k8s/deployment.yaml`:
- CPU: 250m request, 500m limit
- Memory: 256Mi request, 512Mi limit

Adjust based on your workload.

### Autoscaling

Configure in `k8s/hpa.yaml`:
- Min replicas: 3
- Max replicas: 10
- CPU threshold: 70%
- Memory threshold: 80%

## Running Migrations

```bash
# Run migrations as a Job
kubectl run alembic-migrate \
  --image=your-registry/blog-api:latest \
  --restart=Never \
  --namespace=blog-api \
  --env="DATABASE_URL=$(kubectl get secret blog-api-secrets -n blog-api -o jsonpath='{.data.DATABASE_URL}' | base64 -d)" \
  -- alembic upgrade head

# Check migration logs
kubectl logs alembic-migrate -n blog-api

# Cleanup
kubectl delete pod alembic-migrate -n blog-api
```

## Monitoring

### Health Checks

- Liveness probe: `/health` every 30s
- Readiness probe: `/health` every 10s
- Startup probe: `/health` with 60s grace period

### Metrics

Prometheus metrics available at `/metrics`:
- Request counts
- Response times
- Active connections
- Error rates

### Logs

View application logs:
```bash
# All pods
kubectl logs -f deployment/blog-api -n blog-api

# Specific pod
kubectl logs -f blog-api-<pod-id> -n blog-api

# Previous pod logs
kubectl logs -f blog-api-<pod-id> -n blog-api --previous
```

## Scaling

### Manual Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment blog-api --replicas=5 -n blog-api
```

### Auto Scaling

Horizontal Pod Autoscaler (HPA) automatically scales based on:
- CPU utilization (target: 70%)
- Memory utilization (target: 80%)

View HPA status:
```bash
kubectl get hpa -n blog-api
```

## Updates and Rollbacks

### Rolling Update

```bash
# Update image
kubectl set image deployment/blog-api blog-api=your-registry/blog-api:v2 -n blog-api

# Check rollout status
kubectl rollout status deployment/blog-api -n blog-api
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/blog-api -n blog-api

# Rollback to specific revision
kubectl rollout undo deployment/blog-api --to-revision=2 -n blog-api

# View rollout history
kubectl rollout history deployment/blog-api -n blog-api
```

## Troubleshooting

### Pod Not Starting

```bash
# Describe pod
kubectl describe pod blog-api-<pod-id> -n blog-api

# Check events
kubectl get events -n blog-api --sort-by='.lastTimestamp'

# Check logs
kubectl logs blog-api-<pod-id> -n blog-api
```

### Database Connection Issues

```bash
# Test database connectivity
kubectl exec -it blog-api-<pod-id> -n blog-api -- /bin/sh
# Inside pod:
# curl localhost:8000/health
```

### Secrets Not Loading

```bash
# Verify secrets exist
kubectl get secrets -n blog-api

# Check secret values (base64 encoded)
kubectl get secret blog-api-secrets -n blog-api -o yaml
```

## Security

### Network Policies

Create network policies to restrict traffic:
```bash
# Allow only from ingress controller
kubectl apply -f k8s/networkpolicy.yaml
```

### Pod Security

- Runs as non-root user (uid 1000)
- Read-only root filesystem (can be enabled)
- No privilege escalation
- Capabilities dropped

### Secrets Management

- Never commit `secrets.yaml` to git
- Use external secrets manager (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly

## Performance Tuning

### Database Connection Pool

Adjust in `k8s/configmap.yaml`:
```yaml
DB_POOL_SIZE: "10"  # Base connections
DB_MAX_OVERFLOW: "20"  # Additional connections
```

### Replicas

- Dev: 1-2 replicas
- Staging: 2-3 replicas
- Production: 3-10 replicas (with HPA)

### Resources

Monitor actual usage:
```bash
kubectl top pods -n blog-api
```

Adjust `resources.requests` and `resources.limits` accordingly.

## Clean Up

```bash
# Delete all resources
kubectl delete namespace blog-api

# Or delete individually
kubectl delete -f k8s/
```

## Advanced

### Blue-Green Deployment

1. Deploy new version with different label
2. Test new version
3. Switch service selector
4. Remove old version

### Canary Deployment

Use service mesh (Istio/Linkerd) for traffic splitting.

### Multi-Region

Deploy to multiple regions with:
- Global load balancer
- Regional databases
- Cross-region replication

## Support

For issues or questions:
1. Check logs: `kubectl logs -f deployment/blog-api -n blog-api`
2. Check pod status: `kubectl describe pod <pod-name> -n blog-api`
3. Review documentation above
