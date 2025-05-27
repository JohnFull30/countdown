#!/bin/bash

# Ask for a commit message
echo "Enter your commit message:"
read commit_message

# Pull latest from remote (to stay up to date)
git checkout main
git pull

# Stage, commit, and push to main
git add .
git commit -m "$commit_message"
git push

# Deploy using npm script (pushes to gh-pages automatically)
cp .env.web .env
npm run build
npm run deploy
rm .env



echo "✅ Deployed to gh-pages using npm run deploy!"