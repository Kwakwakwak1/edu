# Git Workflow Guide

This document outlines the standard steps for updating the repository with new changes.

## Basic Workflow

### 1. Check Repository Status
First, check what files have been modified:
```bash
git status
```
This will show:
- Modified files
- Untracked files
- Current branch status

### 2. Stage Changes
Add the modified files to staging:
```bash
git add <file_path>
```
For example:
```bash
git add client/src/components/layout/GameLayout.css
```
To add all modified files:
```bash
git add .
```

### 3. Commit Changes
Commit the staged changes with a descriptive message:
```bash
git commit -m "type: brief description of changes"
```
Message format:
- `fix:` for bug fixes
- `feat:` for new features
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code restructuring
- `test:` for adding tests
- `chore:` for maintenance tasks

Example:
```bash
git commit -m "fix: properly hide navigation and settings panels when collapsed"
```

### 4. Verify Commit
Check that the commit was successful:
```bash
git status
```
You should see a message indicating your branch is ahead of the remote branch.

### 5. Push Changes
Push your committed changes to the remote repository:
```bash
git push
```
If you're pushing a new branch:
```bash
git push -u origin <branch_name>
```

### 6. Final Verification
Verify that everything is synchronized:
```bash
git status
```
You should see:
- "Your branch is up to date with 'origin/main'"
- "nothing to commit, working tree clean"

## Audio File Management

### Generating Sound Files
The repository now includes tools for generating sound files:

#### Using the Command Line Utility
```bash
cd client
npm run generate-sounds "word1,word2,word3" [outputDir] [voice] [prefix]
```

Example:
```bash
npm run generate-sounds "apple,banana,cherry" "sounds/fruits" "Samantha" "fruit"
```

#### Using the Sound Generation Server
1. Start the server:
```bash
cd client
npm run server
```

2. Use the web interface or API endpoint:
```
POST http://localhost:3001/api/generate-sounds
```
with JSON body:
```json
{
  "words": "cat,dog,house",
  "voice": "Alex", 
  "outputDir": "sounds/words",
  "prefix": ""
}
```

### Committing Sound Files
When adding new sound files to the repository:

1. Ensure the files are correctly generated and placed in the appropriate directory
2. Stage only the necessary sound files:
```bash
git add client/public/sounds/specific-file.mp3
```
3. Create a descriptive commit:
```bash
git commit -m "feat: add sound files for animals vocabulary"
```

## Additional Tips

### View Recent Commits
To see recent commits:
```bash
git log --oneline -n 5
```

### Undo Staged Changes
To unstage changes (before committing):
```bash
git reset <file_path>
```

### Discard Changes
To discard changes in a file (before staging):
```bash
git restore <file_path>
```

### Branch Management
Create a new branch:
```bash
git checkout -b <branch_name>
```

Switch branches:
```bash
git checkout <branch_name>
```

### Pulling Latest Changes
Before starting work, always pull the latest changes:
```bash
git pull
```

### Resolving Conflicts
If you encounter merge conflicts:
1. Open the conflicted files and resolve the conflicts
2. Stage the resolved files: `git add <file_path>`
3. Complete the merge: `git commit` 