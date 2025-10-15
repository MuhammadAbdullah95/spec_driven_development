# 🚀 Kubernetes Quick Start Guide

## Prerequisites Check

Before deploying, ensure you have:

1. **Kubernetes Cluster Running**
   ```bash
   kubectl cluster-info
   # Should show: Kubernetes control plane is running
   ```

2. **kubectl Installed**
   ```bash
   kubectl version --client
   # Should show version info
   ```

3. **Docker Image Available**
   ```bash
   # Build image
   docker build -t blog-post-manager:latest .

   # Verify
   docker images | grep blog-post-manager
   ```

---

## 🎯 Quick Deploy (Local Testing)

### Step 1: Create Namespace
```bash
kubectl apply -f k8s/namespace.yaml
```

### Step 2: Configure Secrets
```bash
# Copy template
cp k8s/secrets.yaml.example k8s/secrets.yaml

# Generate base64 encoded secrets
echo -n "postgresql+asyncpg://blog_user:blog_password@postgres:5432/blog_db" | base64
echo -n "$(python -c 'import secrets; print(secrets.token_urlsafe(32))')" | base64

# Edit secrets.yaml with the generated values
nano k8s/secrets.yaml

# Apply secrets
kubectl apply -f k8s/secrets.yaml
```

### Step 3: Deploy Application
```bash
# Apply all manifests
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Check deployment
kubectl get pods -n blog-api
kubectl get svc -n blog-api
```

### Step 4: Access the Application

**Option A: Port Forward (Easiest)**
```bash
kubectl port-forward -n blog-api svc/blog-api 8000:80

# Access API at:
# http://localhost:8000/docs
```

**Option B: NodePort (If using Minikube/Kind)**
```bash
# Get the service URL
minikube service blog-api -n blog-api --url
# Or for kind:
kubectl get svc -n blog-api
```

**Option C: Ingress (For Production-like setup)**
```bash
# Install NGINX Ingress Controller (if not already installed)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# Update k8s/ingress.yaml with your domain or use localhost
# Change: api.yourdomain.com → localhost

# Apply ingress
kubectl apply -f k8s/ingress.yaml

# Access via: http://localhost/docs
```

---

## 🔍 Verify Deployment

### Check Pod Status
```bash
kubectl get pods -n blog-api

# Should show:
# NAME                        READY   STATUS    RESTARTS   AGE
# blog-api-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
# blog-api-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
# blog-api-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
```

### Check Logs
```bash
kubectl logs -f deployment/blog-api -n blog-api
```

### Test Health Endpoint
```bash
# Using port-forward
kubectl port-forward -n blog-api svc/blog-api 8000:80 &
curl http://localhost:8000/health

# Expected: {"status":"healthy","version":"0.1.0","database":"connected"}
```

---

## 🧪 Test the Application

### 1. Register a User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "k8stest@example.com",
    "username": "k8suser",
    "password": "SecurePass123",
    "full_name": "Kubernetes User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "k8stest@example.com",
    "password": "SecurePass123"
  }'

# Save the access_token from response
```

### 3. Create a Post
```bash
TOKEN="your-access-token-here"

curl -X POST http://localhost:8000/api/v1/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post on Kubernetes",
    "content": "This post is running on Kubernetes!",
    "excerpt": "Testing K8s deployment",
    "tags": ["kubernetes", "docker", "devops"],
    "status": "published"
  }'
```

---

## 📊 Monitor with k9s (Optional)

If you installed k9s:

```bash
k9s

# Inside k9s:
# :namespace blog-api  # Switch to blog-api namespace
# :pods                # View pods
# :logs                # View logs
# :describe            # Describe resources
```

---

## 🎚️ Scale the Application

### Manual Scaling
```bash
# Scale to 5 replicas
kubectl scale deployment blog-api --replicas=5 -n blog-api

# Verify
kubectl get pods -n blog-api
```

### Auto-Scaling with HPA
```bash
# Install metrics-server (if not installed)
# For Docker Desktop:
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# For Minikube:
minikube addons enable metrics-server

# Apply HPA
kubectl apply -f k8s/hpa.yaml

# Check HPA status
kubectl get hpa -n blog-api

# Watch it scale
kubectl get hpa -n blog-api -w
```

---

## 🔄 Update Deployment

### Rolling Update
```bash
# Build new image with tag
docker build -t blog-post-manager:v1.1.0 .

# Update deployment
kubectl set image deployment/blog-api \
  blog-api=blog-post-manager:v1.1.0 \
  -n blog-api

# Watch rollout
kubectl rollout status deployment/blog-api -n blog-api
```

### Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/blog-api -n blog-api

# Rollback to specific revision
kubectl rollout history deployment/blog-api -n blog-api
kubectl rollout undo deployment/blog-api --to-revision=2 -n blog-api
```

---

## 🧹 Clean Up

### Remove Application
```bash
# Delete all resources in namespace
kubectl delete namespace blog-api

# Or delete individually
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/service.yaml
kubectl delete -f k8s/configmap.yaml
kubectl delete -f k8s/secrets.yaml
kubectl delete -f k8s/namespace.yaml
```

### Stop Local Cluster

**Docker Desktop:**
- Settings → Kubernetes → Uncheck "Enable Kubernetes"

**Minikube:**
```bash
minikube stop
minikube delete  # To completely remove
```

**Kind:**
```bash
kind delete cluster --name blog-api
```

---

## 🐛 Troubleshooting

### Pods Not Starting
```bash
# Check pod details
kubectl describe pod <pod-name> -n blog-api

# Check events
kubectl get events -n blog-api --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n blog-api
```

### Image Pull Errors
```bash
# If using local image with Minikube:
eval $(minikube docker-env)
docker build -t blog-post-manager:latest .

# If using Kind:
kind load docker-image blog-post-manager:latest --name blog-api
```

### Can't Access Service
```bash
# Check service
kubectl get svc -n blog-api
kubectl describe svc blog-api -n blog-api

# Check endpoints
kubectl get endpoints -n blog-api

# Use port-forward as fallback
kubectl port-forward -n blog-api svc/blog-api 8000:80
```

### Database Connection Issues
```bash
# Check if database URL is correct in secrets
kubectl get secret blog-api-secrets -n blog-api -o yaml

# Check pod logs for connection errors
kubectl logs deployment/blog-api -n blog-api | grep -i database
```

---

## 📋 Common Commands Cheat Sheet

```bash
# Namespace
kubectl get namespaces
kubectl config set-context --current --namespace=blog-api

# Pods
kubectl get pods -n blog-api
kubectl describe pod <pod-name> -n blog-api
kubectl logs -f <pod-name> -n blog-api
kubectl exec -it <pod-name> -n blog-api -- /bin/bash

# Deployments
kubectl get deployments -n blog-api
kubectl describe deployment blog-api -n blog-api
kubectl rollout status deployment/blog-api -n blog-api
kubectl rollout restart deployment/blog-api -n blog-api

# Services
kubectl get svc -n blog-api
kubectl describe svc blog-api -n blog-api
kubectl port-forward svc/blog-api 8000:80 -n blog-api

# ConfigMaps & Secrets
kubectl get configmaps -n blog-api
kubectl get secrets -n blog-api
kubectl describe configmap blog-api-config -n blog-api

# HPA
kubectl get hpa -n blog-api
kubectl describe hpa blog-api-hpa -n blog-api

# Events
kubectl get events -n blog-api --sort-by='.lastTimestamp'

# Resource Usage
kubectl top pods -n blog-api
kubectl top nodes
```

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Pods are running: `kubectl get pods -n blog-api`
- [ ] Service is created: `kubectl get svc -n blog-api`
- [ ] Health endpoint responds: `curl http://localhost:8000/health`
- [ ] API docs accessible: `http://localhost:8000/docs`
- [ ] Can register user
- [ ] Can login and get JWT token
- [ ] Can create blog post
- [ ] HPA is active (if enabled)
- [ ] No errors in logs

---

## 🎉 You're Done!

Your Blog Post Manager API is now running on Kubernetes!

**Next Steps:**
- Try scaling: `kubectl scale deployment blog-api --replicas=5 -n blog-api`
- Monitor with k9s: `k9s`
- Add Prometheus monitoring: `kubectl apply -f k8s/servicemonitor.yaml`
- Set up Ingress for production-like access

**Need Help?**
- Check logs: `kubectl logs -f deployment/blog-api -n blog-api`
- Describe resources: `kubectl describe pod <pod-name> -n blog-api`
- View events: `kubectl get events -n blog-api`

---

*For production deployment to cloud providers, see [k8s/README.md](README.md)*
