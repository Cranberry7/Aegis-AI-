#!/bin/bash

set -e

echo "Starting SSH connection to $SSH_USER@$SSH_HOST"
ssh $SSH_USER@$SSH_HOST <<EOF
  set -e  # Ensure script stops on error

  echo "Changing to working directory: $WORK_DIR/agent-frontend"
  cd "$WORK_DIR/agent-frontend"

  echo "Stashing changes"
  git stash

  echo "Checking out branch: $MAIN_BRANCH"
  git checkout "$MAIN_BRANCH"

  echo "Pulling latest changes"
  git pull --rebase

  echo "Checking if there are stash entries to apply"
  if git stash list | grep -q .; then
    echo "Applying changes"
    git stash pop
  else
    echo "No stash entries found, skipping stash pop"
  fi

  echo "Triggering docker compose build"
  docker-compose up --build -d

EOF

echo "Deployment script finished"

