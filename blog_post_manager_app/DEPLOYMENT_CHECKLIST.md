# 🚀 Blog Post Manager - Production Deployment Checklist

## ✅ Project Status: Ready for Production

All development and testing is complete. Follow this checklist to deploy to production.

---

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] **Generate Production JWT Secret**
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
  Store this securely (e.g., AWS Secrets Manager, HashiCorp Vault)

- [ ] **Set up Production Database**
  - [ ] PostgreSQL 15+ instance provisioned
  - [ ] Database credentials secured
  - [ ] Database URL formatted: `postgresql+asyncpg://user:pass@host:5432/dbname`
  - [ ] Database backups configured

- [ ] **Configure Environment Variables**
  ```bash
  DATABASE_URL=postgresql+asyncpg://...
  JWT_SECRET_KEY=<your-generated-secret>
  CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
  ENVIRONMENT=production
  LOG_LEVEL=INFO
  ```

### 2. Security Review

- [x] Passwords hashed with SHA-256 + bcrypt
- [x] JWT tokens with expiry (15min access, 7 days refresh)
- [x] Rate limiting enabled (100 req/min)
- [x] CORS configured for specific origins
- [x] SQL injection prevention (ORM)
- [x] Non-root container user
- [ ] HTTPS/TLS enabled (via Ingress/Load Balancer)
- [ ] Secrets not committed to git
- [ ] Environment variables externalized

### 3. Code Quality

- [x] All 88 tests passing
- [x] 87% test coverage (exceeds 85% requirement)
- [x] Type hints on all functions
- [x] Linting passed (ruff)
- [x] No security vulnerabilities (CodeQL, Trivy)

### 4. Documentation

- [x] README.md complete
- [x] API documentation at /docs
- [x] Deployment guides (Docker, Kubernetes)
- [x] CI/CD documentation
- [x] Testing documentation

---

## 🐳 Docker Deployment

### Quick Start (Development/Staging)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd blog_post_manager_app

# 2. Set environment variables
export JWT_SECRET_KEY="your-secret-key"
export DATABASE_URL="postgresql+asyncpg://..."

# 3. Start services
docker-compose up -d

# 4. Check health
curl http://localhost:8000/health

# 5. Access API
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
# Adminer: http://localhost:8080
```

### Production Deployment

```bash
# 1. Create .env file (DO NOT COMMIT)
cat > .env << EOF
DATABASE_URL=postgresql+asyncpg://user:pass@production-db:5432/blog_db
JWT_SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
CORS_ORIGINS=https://yourdomain.com
ENVIRONMENT=production
LOG_LEVEL=INFO
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40
EOF

# 2. Deploy with production compose
docker-compose -f docker-compose.prod.yml up -d

# 3. Verify deployment
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f api

# 4. Health check
curl https://yourdomain.com/health
```

**Note:** Database migrations run automatically on container startup via the entrypoint script.

---

## ☸️ Kubernetes Deployment

### Prerequisites

- [ ] Kubernetes cluster (1.21+) provisioned
- [ ] kubectl configured and connected
- [ ] Container registry access (e.g., ghcr.io, Docker Hub)
- [ ] Ingress controller installed (nginx)
- [ ] cert-manager installed (for TLS)
- [ ] Metrics server installed (for HPA)

### Step-by-Step Deployment

#### 1. Build and Push Docker Image

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u <username> --password-stdin

# Build image
docker build -t ghcr.io/<username>/blog-api:v1.0.0 .

# Push image
docker push ghcr.io/<username>/blog-api:v1.0.0
```

#### 2. Create Kubernetes Secrets

```bash
# Copy secrets template
cp k8s/secrets.yaml.example k8s/secrets.yaml

# Generate base64 encoded values
echo -n "postgresql+asyncpg://..." | base64
echo -n "$(python -c 'import secrets; print(secrets.token_urlsafe(32))')" | base64

# Edit k8s/secrets.yaml with generated values
nano k8s/secrets.yaml

# Apply secrets (DO NOT COMMIT secrets.yaml)
kubectl apply -f k8s/secrets.yaml
```

#### 3. Update Configuration

```bash
# Edit k8s/configmap.yaml
nano k8s/configmap.yaml

# Update:
# - CORS_ORIGINS with your domain
# - LOG_LEVEL if needed
# - DB_POOL_SIZE for your workload
```

#### 4. Update Ingress Domain

```bash
# Edit k8s/ingress.yaml
nano k8s/ingress.yaml

# Change api.yourdomain.com to your actual domain
```

#### 5. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply configuration
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Optional: Prometheus monitoring
kubectl apply -f k8s/servicemonitor.yaml
```

#### 6. Run Database Migrations

```bash
# Get pod name
POD=$(kubectl get pods -n blog-api -l app=blog-api -o jsonpath='{.items[0].metadata.name}')

# Run migrations
kubectl exec -n blog-api $POD -- alembic upgrade head
```

**Better approach:** Migrations run automatically via entrypoint script.

#### 7. Verify Deployment

```bash
# Check pods
kubectl get pods -n blog-api

# Check services
kubectl get svc -n blog-api

# Check ingress
kubectl get ingress -n blog-api

# View logs
kubectl logs -f deployment/blog-api -n blog-api

# Test health endpoint
kubectl exec -n blog-api $POD -- curl localhost:8000/health
```

#### 8. Monitor Autoscaling

```bash
# Check HPA status
kubectl get hpa -n blog-api

# Watch pod scaling
kubectl get pods -n blog-api -w
```

---

## 🔄 CI/CD Setup (GitHub Actions)

### Prerequisites

- [ ] Code pushed to GitHub repository
- [ ] GitHub Actions enabled

### Configure Secrets

Go to GitHub Settings → Secrets and variables → Actions:

```
KUBE_CONFIG - Base64 encoded kubectl config (for deployments)
SLACK_WEBHOOK - Slack webhook URL (optional, for notifications)
```

Generate KUBE_CONFIG:
```bash
cat ~/.kube/config | base64 -w 0
```

### Available Workflows

All workflows are already configured in `.github/workflows/`:

1. **test.yml** - Runs automatically on push/PR
   - Linting, type checking, tests
   - Coverage enforcement (85%)
   - No configuration needed

2. **build.yml** - Runs on push to main/tags
   - Builds Docker image
   - Pushes to ghcr.io
   - Security scanning with Trivy
   - No configuration needed

3. **deploy.yml** - Manual deployment trigger
   ```bash
   gh workflow run deploy.yml \
     -f environment=production \
     -f image_tag=v1.0.0
   ```

4. **release.yml** - Runs on version tags
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

5. **codeql.yml** - Security scanning
   - Runs weekly and on PR
   - No configuration needed

6. **dependabot.yml** - Dependency updates
   - Weekly automated PRs
   - No configuration needed

---

## 🧪 Post-Deployment Testing

### 1. Health Check

```bash
curl https://yourdomain.com/health
# Expected: {"status":"healthy","version":"0.1.0","database":"connected"}
```

### 2. API Documentation

```bash
# Check Swagger UI
curl https://yourdomain.com/docs

# Check OpenAPI JSON
curl https://yourdomain.com/api/v1/openapi.json
```

### 3. User Registration

```bash
curl -X POST https://yourdomain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123",
    "full_name": "Test User"
  }'
```

### 4. User Login

```bash
curl -X POST https://yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### 5. Create Blog Post

```bash
TOKEN="<access_token_from_login>"

curl -X POST https://yourdomain.com/api/v1/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content",
    "excerpt": "Short description",
    "tags": ["test", "blog"],
    "status": "published"
  }'
```

### 6. Search Posts

```bash
curl "https://yourdomain.com/api/v1/search/posts?q=first+post"
```

### 7. Load Testing (Optional)

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Run load test (1000 requests, 10 concurrent)
ab -n 1000 -c 10 https://yourdomain.com/health
```

---

## 📊 Monitoring & Observability

### Metrics (Prometheus)

```bash
# Prometheus metrics endpoint
curl https://yourdomain.com/metrics
```

Available metrics:
- Request counts by endpoint
- Response times (latency)
- Error rates
- Database connection pool status
- Active requests

### Logs

**Docker:**
```bash
docker-compose logs -f api
```

**Kubernetes:**
```bash
kubectl logs -f deployment/blog-api -n blog-api
```

**Structured JSON logs include:**
- Timestamp
- Log level
- Logger name
- Message
- Correlation ID (for request tracing)
- Environment

### Health Checks

- **Liveness**: `/health` - Application is running
- **Readiness**: `/health` - Application is ready to serve traffic

**Kubernetes probes:**
- Liveness: Every 30s
- Readiness: Every 10s
- Startup: 60s grace period

---

## 🔧 Troubleshooting

### Docker Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs api

# Check if database is ready
docker-compose logs postgres

# Restart services
docker-compose restart api
```

**Database connection error:**
```bash
# Test database connectivity
docker-compose exec postgres psql -U blog_user -d blog_db

# Run migrations manually
docker-compose exec api alembic upgrade head
```

**CORS errors:**
```bash
# Verify CORS_ORIGINS environment variable
docker-compose exec api printenv CORS_ORIGINS

# Update in docker-compose.yml and restart
docker-compose restart api
```

### Kubernetes Issues

**Pods not starting:**
```bash
# Describe pod
kubectl describe pod <pod-name> -n blog-api

# Check events
kubectl get events -n blog-api --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n blog-api
```

**Image pull errors:**
```bash
# Verify image exists
docker pull ghcr.io/<username>/blog-api:v1.0.0

# Check image pull secrets
kubectl get secrets -n blog-api
```

**Database connection issues:**
```bash
# Test from pod
kubectl exec -it <pod-name> -n blog-api -- /bin/bash
curl localhost:8000/health

# Check secrets
kubectl get secret blog-api-secrets -n blog-api -o yaml
```

**HPA not scaling:**
```bash
# Check metrics server
kubectl top pods -n blog-api

# Check HPA status
kubectl describe hpa blog-api-hpa -n blog-api

# View HPA events
kubectl get events -n blog-api | grep HorizontalPodAutoscaler
```

---

## 🔄 Maintenance

### Rolling Updates

**Docker:**
```bash
# Pull latest image
docker-compose pull

# Restart with new image
docker-compose up -d
```

**Kubernetes:**
```bash
# Update image
kubectl set image deployment/blog-api \
  blog-api=ghcr.io/<username>/blog-api:v1.1.0 \
  -n blog-api

# Watch rollout
kubectl rollout status deployment/blog-api -n blog-api

# Rollback if needed
kubectl rollout undo deployment/blog-api -n blog-api
```

### Database Migrations

**Docker:**
```bash
# Run migrations
docker-compose exec api alembic upgrade head

# Rollback one migration
docker-compose exec api alembic downgrade -1

# Check current version
docker-compose exec api alembic current
```

**Kubernetes:**
```bash
# Run migrations
kubectl exec deployment/blog-api -n blog-api -- alembic upgrade head
```

### Backup & Restore

**Database Backup:**
```bash
# Docker
docker-compose exec postgres pg_dump -U blog_user blog_db > backup.sql

# Kubernetes
kubectl exec postgres-pod -n blog-api -- pg_dump -U blog_user blog_db > backup.sql
```

**Database Restore:**
```bash
# Docker
docker-compose exec -T postgres psql -U blog_user blog_db < backup.sql

# Kubernetes
kubectl exec -i postgres-pod -n blog-api -- psql -U blog_user blog_db < backup.sql
```

---

## 📈 Scaling Guidelines

### Horizontal Scaling (Kubernetes)

**Manual:**
```bash
kubectl scale deployment blog-api --replicas=5 -n blog-api
```

**Automatic (HPA):**
- Min replicas: 3
- Max replicas: 10
- CPU target: 70%
- Memory target: 80%

Adjust in `k8s/hpa.yaml` based on traffic patterns.

### Database Connection Pool

Adjust for concurrent connections:

```yaml
# k8s/configmap.yaml
DB_POOL_SIZE: "20"        # Base connections per pod
DB_MAX_OVERFLOW: "40"     # Additional connections

# Total max connections = (POOL_SIZE + MAX_OVERFLOW) × replicas
# Example: (20 + 40) × 3 = 180 connections
```

Ensure database supports total connections.

### Resource Limits

**Current limits per pod:**
- CPU: 250m request, 500m limit
- Memory: 256Mi request, 512Mi limit

**Monitor and adjust:**
```bash
kubectl top pods -n blog-api
```

Update in `k8s/deployment.yaml` based on actual usage.

---

## 🎯 Success Criteria

After deployment, verify:

- [ ] Health endpoint returns `{"status":"healthy"}`
- [ ] API documentation accessible at `/docs`
- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens validated correctly
- [ ] Blog post CRUD operations work
- [ ] Tag management works
- [ ] Search functionality works
- [ ] Rate limiting enforced (100 req/min)
- [ ] CORS configured for production domains
- [ ] HTTPS/TLS enabled
- [ ] Database migrations applied
- [ ] Logs structured and readable
- [ ] Metrics endpoint responding at `/metrics`
- [ ] Autoscaling working (if Kubernetes)
- [ ] Health checks passing
- [ ] No errors in logs under normal load

---

## 📞 Support Resources

### Documentation
- Main README: `README.md`
- Testing Guide: `tests/README.md`
- Kubernetes Guide: `k8s/README.md`
- CI/CD Guide: `.github/workflows/README.md`
- This Checklist: `DEPLOYMENT_CHECKLIST.md`

### Quick Commands Reference

```bash
# Docker
docker-compose up -d              # Start services
docker-compose logs -f api        # View logs
docker-compose exec api bash      # Shell into container
docker-compose down               # Stop services

# Kubernetes
kubectl get pods -n blog-api                    # List pods
kubectl logs -f deployment/blog-api -n blog-api # View logs
kubectl exec -it <pod> -n blog-api -- bash      # Shell into pod
kubectl get hpa -n blog-api                     # Check autoscaling

# Testing
pytest tests/ -v                  # Run all tests
curl http://localhost:8000/health # Health check
```

---

## ✅ Deployment Complete!

Once all items are checked and tests pass, your Blog Post Manager API is successfully deployed and ready for production traffic!

**Need Help?**
1. Check logs for errors
2. Review troubleshooting section above
3. Consult documentation links
4. Open GitHub issue

---

*Last updated: 2025-10-15*
*Version: 1.0.0*
