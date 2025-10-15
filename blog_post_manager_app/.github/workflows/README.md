# CI/CD Workflows

This directory contains GitHub Actions workflows for automated testing, building, deployment, and security scanning.

---

## Workflows

### 1. **test.yml** - Continuous Integration

**Triggers:**
- Push to `master`, `main`, or `develop` branches
- Pull requests to `master`, `main`, or `develop` branches

**What it does:**
1. Sets up Python 3.11 environment
2. Installs dependencies with `uv`
3. Runs linting with `ruff`
4. Runs type checking with `mypy`
5. Sets up PostgreSQL database
6. Runs database migrations
7. Runs all tests (88 tests) with coverage
8. Uploads coverage to Codecov
9. Fails if coverage < 85%

**Required secrets:** None (uses default `GITHUB_TOKEN`)

**Example output:**
```
✓ Linting passed
✓ Type checking passed
✓ 88 tests passed
✓ Coverage: 87% (threshold: 85%)
```

---

### 2. **build.yml** - Docker Build and Push

**Triggers:**
- Push to `master` or `main` branches
- New tags matching `v*` (e.g., v1.0.0)
- Pull requests to `master` or `main` (build only, no push)

**What it does:**
1. Sets up Docker Buildx
2. Logs in to GitHub Container Registry (ghcr.io)
3. Extracts metadata (tags, labels)
4. Builds multi-stage Docker image
5. Pushes to ghcr.io (on push/tag events)
6. Runs Trivy vulnerability scanner
7. Uploads security results to GitHub Security tab

**Image tags created:**
- `latest` - Latest commit on default branch
- `main` or `master` - Branch name
- `v1.0.0` - Version tag
- `v1.0` - Minor version
- `v1` - Major version
- `main-abc1234` - Branch + commit SHA

**Required secrets:** None (uses default `GITHUB_TOKEN`)

**Image location:**
```bash
docker pull ghcr.io/<your-username>/blog_post_manager_app:latest
```

---

### 3. **deploy.yml** - Kubernetes Deployment

**Triggers:**
- Manual workflow dispatch (workflow_dispatch)

**Inputs:**
- `environment`: staging | production
- `image_tag`: Docker image tag to deploy (e.g., v1.0.0, latest)

**What it does:**
1. Sets up kubectl
2. Configures cluster access
3. Updates Kubernetes deployment with new image
4. Waits for rollout to complete (5min timeout)
5. Verifies deployment health
6. Runs smoke tests (health check, API docs)
7. Sends Slack notification (optional)

**Required secrets:**
- `KUBE_CONFIG` - Base64-encoded Kubernetes config file
- `SLACK_WEBHOOK` - Slack webhook URL (optional)

**How to run:**
1. Go to Actions → Deploy to Kubernetes
2. Click "Run workflow"
3. Select environment (staging/production)
4. Enter image tag
5. Click "Run workflow"

**Example:**
```
Environment: production
Image tag: v1.2.0
✓ Deployment updated
✓ Rollout completed
✓ Smoke tests passed
```

---

### 4. **release.yml** - GitHub Release

**Triggers:**
- Push new tag matching `v*` (e.g., v1.0.0)

**What it does:**
1. Generates changelog from commits
2. Creates GitHub Release with:
   - Changelog
   - Docker pull command
   - Installation instructions
   - Links to documentation
3. Attaches release notes

**Required secrets:** None (uses default `GITHUB_TOKEN`)

**How to create a release:**
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

This automatically:
- Triggers `build.yml` to build Docker image
- Triggers `release.yml` to create GitHub release

---

### 5. **codeql.yml** - Security Scanning

**Triggers:**
- Push to `master` or `main` branches
- Pull requests to `master` or `main` branches
- Weekly on Mondays at midnight (scheduled)

**What it does:**
1. Initializes CodeQL analysis
2. Builds the codebase
3. Analyzes code for security vulnerabilities
4. Uploads results to GitHub Security tab

**Scans for:**
- SQL injection
- Command injection
- Path traversal
- Authentication issues
- Cryptography issues
- And more...

**Required secrets:** None (uses default `GITHUB_TOKEN`)

**View results:** GitHub Security tab → Code scanning alerts

---

## Dependabot

**File:** `dependabot.yml`

**What it does:**
Automatically creates pull requests to update:
- GitHub Actions (weekly)
- Python dependencies (weekly)
- Docker base images (weekly)

**Configuration:**
- Max 10 open PRs for Python dependencies
- Auto-labels PRs with `dependencies` tag
- Semantic commit prefixes (ci, deps, docker)

**Example PR:**
```
deps: Bump fastapi from 0.104.0 to 0.105.0
```

---

## Setup Instructions

### 1. Enable GitHub Actions

GitHub Actions are enabled by default. No setup needed.

### 2. Configure Secrets (for deployment)

If using the deployment workflow:

1. Go to Settings → Secrets and variables → Actions
2. Add repository secrets:

**Required for deployment:**
```
KUBE_CONFIG - Your Kubernetes config file (base64 encoded)
```

**Optional for notifications:**
```
SLACK_WEBHOOK - Slack webhook URL
```

**Generate KUBE_CONFIG:**
```bash
cat ~/.kube/config | base64 -w 0
```

### 3. Configure Environments (optional)

For deployment workflows with approval:

1. Go to Settings → Environments
2. Create environments: `staging`, `production`
3. Add protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches

### 4. Enable Dependabot

1. Go to Settings → Security → Dependabot
2. Enable:
   - Dependabot alerts
   - Dependabot security updates
   - Dependabot version updates

---

## Workflow Status Badges

Add to README.md:

```markdown
[![Tests](https://github.com/<username>/<repo>/actions/workflows/test.yml/badge.svg)](https://github.com/<username>/<repo>/actions/workflows/test.yml)
[![Build](https://github.com/<username>/<repo>/actions/workflows/build.yml/badge.svg)](https://github.com/<username>/<repo>/actions/workflows/build.yml)
[![CodeQL](https://github.com/<username>/<repo>/actions/workflows/codeql.yml/badge.svg)](https://github.com/<username>/<repo>/actions/workflows/codeql.yml)
```

---

## Common Tasks

### Run tests locally (same as CI)

```bash
# Setup
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"

# Lint
ruff check src/ tests/

# Type check
mypy src/

# Test with coverage
pytest tests/ -v --cov=src --cov-report=term-missing
```

### Build Docker image locally

```bash
docker build -t blog-api:local .
docker run -p 8000:8000 blog-api:local
```

### Test Kubernetes deployment locally

```bash
# Using kind (Kubernetes in Docker)
kind create cluster
kubectl apply -f k8s/
kubectl port-forward svc/blog-api 8000:80
```

---

## Troubleshooting

### Tests fail on CI but pass locally

**Cause:** Database connection or environment differences

**Fix:**
1. Check DATABASE_URL in workflow
2. Ensure PostgreSQL service is healthy
3. Check environment variables

### Docker build fails

**Cause:** Build context or dependency issues

**Fix:**
1. Check `.dockerignore` includes correct files
2. Verify `pyproject.toml` has all dependencies
3. Test locally: `docker build .`

### Deployment fails

**Cause:** Cluster access or image pull issues

**Fix:**
1. Verify `KUBE_CONFIG` secret is correct
2. Check cluster connectivity
3. Verify image exists: `docker pull ghcr.io/<user>/<repo>:tag`
4. Check namespace exists: `kubectl get ns blog-api`

### CodeQL analysis fails

**Cause:** Code issues or analysis timeout

**Fix:**
1. Review security alerts in GitHub Security tab
2. Fix vulnerabilities
3. Re-run workflow

---

## Best Practices

### Branch Protection

Enable branch protection on `main`/`master`:
1. Require pull request reviews
2. Require status checks (test workflow)
3. Require branches to be up to date
4. No force pushes

### Deployment Strategy

**Recommended flow:**
1. Develop on feature branches
2. Merge to `develop` → auto-deploy to staging
3. Create PR to `main` → review
4. Merge to `main` → create tag → deploy to production

### Secrets Management

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Use environment-specific secrets

### Monitoring

- Check Actions tab regularly
- Review Dependabot PRs weekly
- Monitor Security tab for vulnerabilities
- Review deployment logs after releases

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)

---

## Support

For CI/CD issues:
1. Check workflow logs in Actions tab
2. Review this documentation
3. Check GitHub Actions status page
4. Open an issue on GitHub
