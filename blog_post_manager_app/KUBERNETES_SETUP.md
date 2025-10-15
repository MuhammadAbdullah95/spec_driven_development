# ☸️ Kubernetes Setup Guide

## TL;DR - Quickest Path

**If you have Docker Desktop installed:**
1. Open Docker Desktop
2. Settings → Kubernetes → ✅ Enable Kubernetes
3. Apply & Restart
4. Wait 2-3 minutes
5. Done! Run: `kubectl cluster-info`

---

## 🎯 Choose Your Setup

### For Local Testing (Pick One)

| Option | Best For | Pros | Cons |
|--------|----------|------|------|
| **Docker Desktop** | Beginners | Easy, 1-click setup | Only 1 node |
| **Minikube** | Learning | Full-featured, addons | Slower startup |
| **Kind** | CI/CD Testing | Fast, lightweight | Command-line only |

### For Production

| Provider | Best For | Starting Cost |
|----------|----------|---------------|
| **DigitalOcean** | Beginners | $12/month |
| **GCP (GKE)** | Scalability | ~$75/month |
| **AWS (EKS)** | AWS users | ~$75/month |
| **Azure (AKS)** | Azure users | ~$75/month |

---

## 💻 Installation Instructions

### Option 1: Docker Desktop (Recommended)

#### **You Already Have This!**

Since you're using Docker Compose, you already have Docker Desktop.

**Enable Kubernetes:**

**Windows/Mac:**
1. Open Docker Desktop
2. Click ⚙️ Settings (gear icon in top-right)
3. Navigate to **Kubernetes** tab
4. Check ✅ **Enable Kubernetes**
5. Click **Apply & Restart**
6. Wait for Docker Desktop to restart (2-3 minutes)
7. Look for "Kubernetes is running" indicator (green icon)

**Verify:**
```bash
kubectl version --client
kubectl cluster-info
kubectl get nodes
```

**Expected output:**
```
NAME             STATUS   ROLES           AGE   VERSION
docker-desktop   Ready    control-plane   5m    v1.27.2
```

**That's it! Skip to "Deploy Your App" section below.**

---

### Option 2: Minikube

**Install Minikube:**

**Windows (PowerShell as Admin):**
```powershell
winget install Kubernetes.minikube
```

**macOS:**
```bash
brew install minikube
```

**Linux:**
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

**Start Cluster:**
```bash
minikube start

# Optional: Enable useful addons
minikube addons enable metrics-server
minikube addons enable ingress
minikube addons enable dashboard

# Optional: Open dashboard
minikube dashboard
```

**Verify:**
```bash
kubectl get nodes
```

---

### Option 3: Kind (Kubernetes in Docker)

**Install Kind:**

**Windows:**
```powershell
winget install Kubernetes.kind
```

**macOS:**
```bash
brew install kind
```

**Linux:**
```bash
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

**Create Cluster:**
```bash
kind create cluster --name blog-api

# With ingress support (optional)
cat <<EOF | kind create cluster --name blog-api --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF
```

**Verify:**
```bash
kubectl cluster-info --context kind-blog-api
```

---

## 🔧 Install kubectl (Required)

kubectl is the command-line tool to interact with Kubernetes.

### Check if Already Installed
```bash
kubectl version --client
```

If you see version info, you're done! Otherwise:

### Windows (PowerShell as Admin)
```powershell
winget install Kubernetes.kubectl
```

### macOS
```bash
brew install kubectl
```

### Linux
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

### Verify
```bash
kubectl version --client
```

---

## 🚀 Deploy Your Blog API

Now that Kubernetes is running, deploy your application:

### Step 1: Build Docker Image
```bash
cd blog_post_manager_app
docker build -t blog-post-manager:latest .
```

### Step 2: Load Image (if using Minikube/Kind)

**For Minikube:**
```bash
eval $(minikube docker-env)
docker build -t blog-post-manager:latest .
```

**For Kind:**
```bash
kind load docker-image blog-post-manager:latest --name blog-api
```

**For Docker Desktop:**
No need to load - it uses local Docker images automatically.

### Step 3: Create Namespace
```bash
kubectl apply -f k8s/namespace.yaml
```

### Step 4: Configure Secrets
```bash
# Generate secrets
export JWT_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
export DB_URL="postgresql+asyncpg://blog_user:blog_password@host.docker.internal:5432/blog_db"

# Create secrets
kubectl create secret generic blog-api-secrets \
  --from-literal=DATABASE_URL="$DB_URL" \
  --from-literal=JWT_SECRET_KEY="$JWT_SECRET" \
  -n blog-api
```

**Note:** Using `host.docker.internal` allows the Kubernetes pod to connect to PostgreSQL running in Docker Compose on your host machine.

### Step 5: Deploy Application
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### Step 6: Access the Application
```bash
# Port forward to access locally
kubectl port-forward -n blog-api svc/blog-api 8000:80

# In another terminal or browser, access:
# http://localhost:8000/docs
```

### Step 7: Verify Deployment
```bash
# Check pods
kubectl get pods -n blog-api

# Should show 3 pods running:
# NAME                        READY   STATUS    RESTARTS   AGE
# blog-api-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
# blog-api-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
# blog-api-xxxxxxxxxx-xxxxx   1/1     Running   0          1m

# Check logs
kubectl logs -f deployment/blog-api -n blog-api

# Test health
curl http://localhost:8000/health
```

---

## 🎉 Success!

Your Blog Post Manager API is now running on Kubernetes!

**Access URLs:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

**Next Steps:**
1. **Test the API** - See [k8s/QUICKSTART.md](k8s/QUICKSTART.md) for test commands
2. **Enable Autoscaling** - `kubectl apply -f k8s/hpa.yaml`
3. **Monitor** - Install k9s: `winget install k9s` then run `k9s`

---

## 🛠️ Optional: Useful Tools

### k9s (Terminal UI for Kubernetes)

**Install:**
```bash
# Windows
winget install k9s

# macOS
brew install k9s

# Linux
curl -sS https://webinstall.dev/k9s | bash
```

**Usage:**
```bash
k9s
# Press :namespace then type "blog-api"
# Press :pods to view pods
# Press :logs to view logs
# Press ? for help
```

### Helm (Package Manager)

**Install:**
```bash
# Windows
winget install Helm.Helm

# macOS
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### Lens (Desktop UI)

Download from: https://k8slens.dev/

---

## 🐛 Troubleshooting

### Docker Desktop Kubernetes Won't Start

**Solution:**
1. Docker Desktop → Settings → Kubernetes
2. Click "Reset Kubernetes Cluster"
3. Wait 5 minutes
4. Try again

### kubectl: command not found

**Solution:**
```bash
# Reinstall kubectl
# Windows
winget install Kubernetes.kubectl

# Restart terminal
```

### Pods Stay in Pending

**Check:**
```bash
kubectl describe pod <pod-name> -n blog-api
```

**Common causes:**
- Insufficient resources (increase Docker Desktop memory)
- Image pull errors (check image name in deployment.yaml)

### Can't Connect to Database

**If using Docker Compose PostgreSQL:**

The Kubernetes pods need to connect to your host machine's PostgreSQL.

**Use:**
```bash
DATABASE_URL=postgresql+asyncpg://blog_user:blog_password@host.docker.internal:5432/blog_db
```

**Or run PostgreSQL in Kubernetes:**
```bash
# Create a postgres deployment (for testing only)
kubectl run postgres --image=postgres:15-alpine \
  --env="POSTGRES_USER=blog_user" \
  --env="POSTGRES_PASSWORD=blog_password" \
  --env="POSTGRES_DB=blog_db" \
  -n blog-api

# Then use:
DATABASE_URL=postgresql+asyncpg://blog_user:blog_password@postgres:5432/blog_db
```

---

## 📚 Learn More

- **Official Docs**: https://kubernetes.io/docs/home/
- **Tutorials**: https://kubernetes.io/docs/tutorials/
- **k9s Guide**: https://k9scli.io/
- **Your Quickstart**: [k8s/QUICKSTART.md](k8s/QUICKSTART.md)
- **Full K8s Guide**: [k8s/README.md](k8s/README.md)

---

## 🆘 Need Help?

```bash
# Check cluster status
kubectl cluster-info

# Check nodes
kubectl get nodes

# Check all resources
kubectl get all -n blog-api

# View logs
kubectl logs -f deployment/blog-api -n blog-api

# Describe pod (shows errors)
kubectl describe pod <pod-name> -n blog-api
```

---

## 🎯 Summary

**For Local Testing:**
1. Enable Kubernetes in Docker Desktop (✅ Easiest)
2. Install kubectl
3. Deploy: `kubectl apply -f k8s/`
4. Access: `kubectl port-forward -n blog-api svc/blog-api 8000:80`

**For Production:**
1. Choose cloud provider (DigitalOcean is easiest)
2. Create cluster via web UI
3. Download kubeconfig
4. Deploy: `kubectl apply -f k8s/`
5. Configure domain and Ingress

**You're ready to go!** 🚀
