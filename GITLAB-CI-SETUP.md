# GitLab CI/CD Setup Guide

Complete guide to set up automatic deployment from GitLab to your VPS.

## Prerequisites

- GitLab repository with your code
- VPS with application already deployed and working
- SSH access to your VPS

## Step 1: Generate SSH Key on Your Local Machine

```bash
# Generate a new SSH key specifically for GitLab CI/CD
ssh-keygen -t ed25519 -C "gitlab-ci" -f ~/.ssh/gitlab_ci_key

# This creates two files:
# - ~/.ssh/gitlab_ci_key (private key - keep this secret!)
# - ~/.ssh/gitlab_ci_key.pub (public key)
```

## Step 2: Add Public Key to VPS

```bash
# Copy the public key content
cat ~/.ssh/gitlab_ci_key.pub

# SSH to your VPS
ssh your-username@your-vps-ip

# Add the public key to authorized_keys
echo "paste-the-public-key-here" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Exit VPS
exit
```

## Step 3: Test SSH Connection

```bash
# Test that the key works
ssh -i ~/.ssh/gitlab_ci_key your-username@your-vps-ip

# If it works without asking for a password, you're good!
exit
```

## Step 4: Add CI/CD Variables to GitLab

1. Go to your GitLab repository
2. Navigate to **Settings** → **CI/CD** → **Variables**
3. Click **Add variable** and add these variables:

### Required Variables:

| Variable Name | Value | Protected | Masked |
|--------------|-------|-----------|--------|
| `SSH_PRIVATE_KEY` | Content of `~/.ssh/gitlab_ci_key` (entire file) | ✓ | ✓ |
| `VPS_HOST` | Your VPS IP address (e.g., 123.45.67.89) | ✓ | ✗ |
| `VPS_USERNAME` | Your VPS username (e.g., root or ubuntu) | ✓ | ✗ |

**To get the private key content:**
```bash
cat ~/.ssh/gitlab_ci_key
```
Copy everything including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...entire key content...
-----END OPENSSH PRIVATE KEY-----
```

### Variable Settings:
- **Protected**: Check this box to only allow the variable in protected branches
- **Masked**: Check this for sensitive data (GitLab will hide it in logs)
- **Environment scope**: Leave as `*` (all environments)

## Step 5: Configure Git on VPS

The deployment script uses `git pull`, so make sure git is configured on your VPS:

```bash
# SSH to your VPS
ssh your-username@your-vps-ip

# Navigate to project directory
cd /var/www/koreanexams

# Configure git (if not already done)
git config user.name "Your Name"
git config user.email "your-email@example.com"

# Set up git to use main branch
git branch --set-upstream-to=origin/main main

# Optional: Store git credentials to avoid password prompts
git config credential.helper store
```

## Step 6: Test the Pipeline

1. Make a small change to your code (e.g., add a comment)
2. Commit and push to the `main` branch:
   ```bash
   git add .
   git commit -m "Test CI/CD deployment"
   git push origin main
   ```
3. Go to your GitLab repository → **CI/CD** → **Pipelines**
4. You should see a new pipeline running
5. Since `when: manual` is set, you need to click the **play button** to start deployment

## Step 7: Monitor Deployment

Click on the pipeline to see:
- Real-time logs of the deployment
- Any errors that occur
- Confirmation when deployment completes

## Pipeline Behavior

- **Triggered on**: Push to `main` branch
- **Runs**: Manually (you must click the play button)
- **Actions**:
  1. Connects to VPS via SSH
  2. Pulls latest code from git
  3. Installs server dependencies
  4. Installs client dependencies and builds
  5. Restarts PM2 processes
  6. Shows PM2 status

## Changing to Automatic Deployment

If you want automatic deployment (without manual approval), edit `.gitlab-ci.yml`:

```yaml
# Remove or comment out this line:
# when: manual
```

## Troubleshooting

### Pipeline fails with "Permission denied (publickey)"

**Solution:**
- Verify the `SSH_PRIVATE_KEY` variable contains the complete private key
- Check that the public key is in `~/.ssh/authorized_keys` on the VPS
- Ensure correct file permissions on VPS: `chmod 600 ~/.ssh/authorized_keys`

### Pipeline fails with "git pull" errors

**Solution:**
```bash
# On your VPS, check git status
cd /var/www/koreanexams
git status

# If there are uncommitted changes, stash or commit them
git stash

# Or reset to remote version
git reset --hard origin/main
```

### Pipeline succeeds but changes not visible

**Solution:**
```bash
# SSH to VPS and check PM2 logs
pm2 logs koreanexams-api

# Restart PM2 manually
pm2 restart all

# Check nginx
sudo systemctl status nginx
sudo systemctl reload nginx
```

### Build fails with "out of memory"

**Solution:**
Add this to `.gitlab-ci.yml` in the client build section:
```yaml
- export NODE_OPTIONS="--max_old_space_size=2048"
- npm run build
```

## Security Best Practices

1. **Use deployment keys**: Instead of personal SSH keys, create a dedicated deployment key
2. **Limit key access**: The SSH key should only have access to the deployment directory
3. **Protected branches**: Enable branch protection for `main` in GitLab settings
4. **Review before deploy**: Keep `when: manual` to review changes before deployment
5. **Backup before deploy**: Consider adding backup steps to the pipeline

## Advanced: Add Slack/Discord Notifications

Add this to `.gitlab-ci.yml` after the deployment:

```yaml
after_script:
  - |
    if [ "$CI_JOB_STATUS" == "success" ]; then
      MESSAGE="✅ Deployment to production succeeded!"
    else
      MESSAGE="❌ Deployment to production failed!"
    fi
    # Send to webhook (Slack/Discord)
    curl -X POST -H 'Content-type: application/json' \
      --data "{\"text\":\"$MESSAGE\"}" \
      $WEBHOOK_URL
```

Add `WEBHOOK_URL` as a CI/CD variable.

## Pipeline Workflow Diagram

```
┌─────────────────┐
│  Git Push       │
│  (main branch)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitLab Runner  │
│  Starts         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Manual Trigger │
│  (Click Play)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SSH to VPS     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pull Code      │
│  Build Client   │
│  Restart PM2    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ✅ Deployed!   │
└─────────────────┘
```

## Success!

Your CI/CD pipeline is now set up! Every time you push to `main`:

1. GitLab will prepare a deployment pipeline
2. Click the **play button** to deploy
3. Watch the logs in real-time
4. Your changes go live automatically

Visit https://koreanexams.com to see your deployed application!
