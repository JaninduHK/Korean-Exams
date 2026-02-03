#!/bin/bash

# GitLab CI/CD Setup Helper Script
# This script will guide you through the setup process

set -e

echo "🚀 GitLab CI/CD Setup Helper"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Generate SSH Key
echo -e "${BLUE}Step 1: Generate SSH Key for GitLab CI/CD${NC}"
echo "-------------------------------------------"

SSH_KEY_PATH="$HOME/.ssh/gitlab_ci_koreanexams"

if [ -f "$SSH_KEY_PATH" ]; then
    echo -e "${YELLOW}SSH key already exists at $SSH_KEY_PATH${NC}"
    read -p "Do you want to use the existing key? (y/n): " use_existing
    if [ "$use_existing" != "y" ]; then
        echo "Generating new SSH key..."
        ssh-keygen -t ed25519 -C "gitlab-ci-koreanexams" -f "$SSH_KEY_PATH"
    fi
else
    echo "Generating new SSH key..."
    ssh-keygen -t ed25519 -C "gitlab-ci-koreanexams" -f "$SSH_KEY_PATH" -N ""
fi

echo ""
echo -e "${GREEN}✓ SSH key generated${NC}"
echo ""

# Step 2: Display Public Key
echo -e "${BLUE}Step 2: Add Public Key to VPS${NC}"
echo "-------------------------------------------"
echo -e "${YELLOW}Copy this PUBLIC KEY and add it to your VPS:${NC}"
echo ""
cat "$SSH_KEY_PATH.pub"
echo ""
echo -e "${YELLOW}On your VPS, run:${NC}"
echo "  ssh your-username@your-vps-ip"
echo "  echo \"$(cat $SSH_KEY_PATH.pub)\" >> ~/.ssh/authorized_keys"
echo "  chmod 600 ~/.ssh/authorized_keys"
echo ""
read -p "Press Enter when you've added the public key to your VPS..."

# Step 3: Display Private Key
echo ""
echo -e "${BLUE}Step 3: Add Private Key to GitLab${NC}"
echo "-------------------------------------------"
echo -e "${YELLOW}Go to: GitLab Repository → Settings → CI/CD → Variables${NC}"
echo ""
echo "Add these 3 variables:"
echo ""
echo -e "${GREEN}Variable 1:${NC}"
echo "  Key: SSH_PRIVATE_KEY"
echo "  Value: (copy the text below)"
echo "  Type: Variable"
echo "  Protected: ✓"
echo "  Masked: ✓"
echo ""
echo "--- START COPYING FROM NEXT LINE ---"
cat "$SSH_KEY_PATH"
echo ""
echo "--- STOP COPYING AT PREVIOUS LINE ---"
echo ""
read -p "Press Enter when you've added SSH_PRIVATE_KEY to GitLab..."

# Step 4: Get VPS Details
echo ""
echo -e "${BLUE}Step 4: Add VPS Details to GitLab${NC}"
echo "-------------------------------------------"
read -p "Enter your VPS IP address: " vps_host
read -p "Enter your VPS username (e.g., root): " vps_username

echo ""
echo -e "${YELLOW}Add these to GitLab CI/CD Variables:${NC}"
echo ""
echo -e "${GREEN}Variable 2:${NC}"
echo "  Key: VPS_HOST"
echo "  Value: $vps_host"
echo "  Type: Variable"
echo "  Protected: ✓"
echo "  Masked: ✗"
echo ""
echo -e "${GREEN}Variable 3:${NC}"
echo "  Key: VPS_USERNAME"
echo "  Value: $vps_username"
echo "  Type: Variable"
echo "  Protected: ✓"
echo "  Masked: ✗"
echo ""
read -p "Press Enter when you've added all variables to GitLab..."

# Step 5: Configure Git on VPS
echo ""
echo -e "${BLUE}Step 5: Configure Git on VPS${NC}"
echo "-------------------------------------------"
echo -e "${YELLOW}Run these commands on your VPS:${NC}"
echo ""
echo "ssh $vps_username@$vps_host"
echo "cd /var/www/koreanexams"
echo "git remote add gitlab https://gitlab.com/YOUR-USERNAME/Korean-Exams.git"
echo "git fetch gitlab"
echo "git branch --set-upstream-to=gitlab/main main"
echo ""
read -p "Press Enter when you've configured git on your VPS..."

# Step 6: Test SSH Connection
echo ""
echo -e "${BLUE}Step 6: Test SSH Connection${NC}"
echo "-------------------------------------------"
echo "Testing SSH connection to VPS..."

if ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$vps_username@$vps_host" "echo 'SSH connection successful!'" 2>/dev/null; then
    echo -e "${GREEN}✓ SSH connection test passed${NC}"
else
    echo -e "${RED}✗ SSH connection test failed${NC}"
    echo "Please check:"
    echo "  1. Public key is correctly added to VPS ~/.ssh/authorized_keys"
    echo "  2. VPS IP address is correct"
    echo "  3. VPS username is correct"
    echo "  4. SSH port 22 is open on VPS"
fi

# Step 7: Summary
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Push your code to GitLab:"
echo "   git push gitlab main"
echo ""
echo "2. Go to GitLab → CI/CD → Pipelines"
echo "3. Click the 'play' button to trigger deployment"
echo ""
echo -e "${YELLOW}Note: The pipeline is set to manual deployment for safety.${NC}"
echo "You must click the play button each time you want to deploy."
echo ""
echo "For more details, see: GITLAB-CI-SETUP.md"
echo ""
