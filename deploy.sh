#!/bin/bash
npm run build
git add dist/
git commit -m "Deploy: Update build files"
git push