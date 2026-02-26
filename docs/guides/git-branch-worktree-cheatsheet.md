# Git Branch + Worktree Cheatsheet

Quick reference for safe parallel work without disturbing your current branch.

## Command style used in this guide

- **Full commands** are standard Git commands.
- **Git alias commands** use `git <alias>` (for example `git sw main`).
- **Shell alias commands** are direct commands from your shell profile (for example `gsw main`).

If an alias is not configured on your machine, use the full command.

## 1) One-time alias setup (optional)

Set Git aliases once:

```bash
git config --global alias.sw "switch"
git config --global alias.swn "switch -c"
git config --global alias.wta "worktree add"
git config --global alias.wtas "worktree add -b"
git config --global alias.wtl "worktree list"
git config --global alias.wtr "worktree remove"
git config --global alias.st "status -sb"
```

Optional shell alias (direct command, no `git` prefix):

```bash
echo "alias gsw='git switch'" >> ~/.zshrc
source ~/.zshrc
```

## 2) Branch-only flow (single folder)

Use this when you only need one active task at a time.

```bash
# switch to main
git switch main
git sw main
gsw main

# update local main
git pull

# create and switch to new feature branch
git switch -c feat/my-change
git swn feat/my-change

# after commits, push branch
git push -u origin feat/my-change
```

## 3) Branch + worktree flow (parallel folders)

Use this when you want to keep current work untouched and start another task in parallel.

```bash
# prepare from main
git switch main
git sw main
git pull

# create worktree + branch
git worktree add -b feat/prototype-ai ../login-app-prototype-ai
git wtas feat/prototype-ai ../login-app-prototype-ai

# list worktrees
git worktree list
git wtl

# open new folder
code ../login-app-prototype-ai
```

## 4) Return from worktree to main

From the worktree folder:

```bash
# check state
git status
git st

# save work if needed
git add -A && git commit -m "wip"
# or
git stash -u

# go back to original repo folder
cd ../login-app

# switch back to main
git switch main
git sw main
gsw main

# verify clean/expected status
git status
git st
```

## 5) Remove a worktree when done

```bash
# remove worktree folder registration
git worktree remove ../login-app-prototype-ai
git wtr ../login-app-prototype-ai

# optionally delete branch if no longer needed
git branch -d feat/prototype-ai
```

## 6) Safety check before switching branches

```bash
git status --porcelain
```

- No output = clean, safe to switch.
- If dirty and you intentionally want to discard local changes:

```bash
git reset --hard
git clean -fd
```

## 7) Optional safe shell switch guard

Add to `~/.zshrc` if you want `gsw` to block switching on dirty trees:

```bash
gsw() {
  if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
    echo "Working tree is dirty. Commit, stash, or clean before switching."
    return 1
  fi
  git switch "$@"
}
```

Reload:

```bash
source ~/.zshrc
```

## Why `switch` over `checkout`?

- `git switch` is branch-focused and clearer.
- `git checkout` mixes branch and file operations, which is easier to misuse.
- Modern split:
  - branch changes: `git switch`
  - file restore: `git restore`

Last Updated: 2026-02-23
