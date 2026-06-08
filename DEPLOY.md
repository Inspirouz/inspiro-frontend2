# Inspiro — Deploy Guide for Claude

This file tells Claude exactly how to deploy changes to production without asking the user.

---

## Architecture Overview

| Part | Stack | Hosting | Repo |
|---|---|---|---|
| Frontend | React + Vite + TypeScript | DigitalOcean (PM2, `npm run preview`) | `github.com/Inspirouz/inspiro-frontend2` |
| Backend | NestJS + TypeORM + PostgreSQL | DigitalOcean (PM2) | `github.com/farzot/inspiro-backend` |
| Admin | React + Vite | DigitalOcean (PM2) | separate repo |

---

## Local Paths

| Project | Local path |
|---|---|
| Frontend | `/Users/aleksandr/Desktop/inspiro-frontend2` |
| Backend | `/tmp/inspiro-backend` (also `/private/tmp/inspiro-backend`) |
| Admin | `/Users/aleksandr/Desktop/insipro-admin` |

---

## 1. Deploy Frontend → DigitalOcean

Frontend is **not** on Vercel. It runs on DigitalOcean via PM2 (`npm run preview` serves the Vite build).

### Server details

| Field | Value |
|---|---|
| Server path | `/root/inspiro/frontend/landing/prod` |
| PM2 process name | `inspiro-landing-prod` |
| GitHub repo | `github.com/Inspirouz/inspiro-frontend2` |
| Branch | `main` |

### Step 1 — Commit and push local changes

```bash
cd /Users/aleksandr/Desktop/inspiro-frontend2
git add <files>
git commit -m "your message"
git push origin main
```

If push fails (HTTPS auth error), use token from user:

```bash
git remote set-url origin https://TOKEN@github.com/Inspirouz/inspiro-frontend2.git
git push origin main
git remote set-url origin https://github.com/Inspirouz/inspiro-frontend2.git  # restore clean URL
```

### Step 2 — Build locally and rsync to server

> **IMPORTANT:** The server path `/root/inspiro/frontend/landing/prod` does NOT have a git repo.  
> Build locally and upload dist via rsync — same as admin panel.

```bash
cd /Users/aleksandr/Desktop/inspiro-frontend2
npm run build
rsync -az -e "ssh -i ~/.ssh/id_ed25519" dist/ root@164.92.231.138:/root/inspiro/frontend/landing/prod/dist/
ssh -i ~/.ssh/id_ed25519 root@164.92.231.138 "pm2 restart inspiro-landing-prod"
```

---

## 2. Deploy Backend → DigitalOcean

### Server details

| Field | Value |
|---|---|
| IP | `164.92.231.138` |
| User | `root` |
| SSH | `ssh root@164.92.231.138` |
| Backend prod path | `/root/inspiro/backend/prod/inspiro-backend` |
| PM2 process name | `inspiro-backend-prod` |
| Backend GitHub repo | `github.com/farzot/inspiro-backend` |

### Step 1 — Push local backend changes to GitHub

```bash
cd /tmp/inspiro-backend
git add <files>
git commit -m "your message"
git push origin master
```

If push fails, use token in URL (same pattern as frontend above).

### Step 2 — Deploy on server

```bash
ssh root@164.92.231.138 "cd /root/inspiro/backend/prod/inspiro-backend && git pull && npm run build && pm2 restart inspiro-backend-prod"
```

### If `git pull` fails on server (expired token in remote URL)

Update the token on the server first, then pull:

```bash
ssh root@164.92.231.138 "cd /root/inspiro/backend/prod/inspiro-backend && \
  git remote set-url origin https://TOKEN@github.com/farzot/inspiro-backend.git && \
  git pull && npm run build && pm2 restart inspiro-backend-prod"
```

### Verify deploy

```bash
ssh root@164.92.231.138 "pm2 list"
```

`inspiro-backend-prod` should show `online` status.

---

## 3. Full Deploy (both frontend and backend)

When changes touch both frontend and backend:

```bash
# 1. Push frontend
cd /Users/aleksandr/Desktop/inspiro-frontend2
git add <files> && git commit -m "..." && git push origin main

# 2. Push backend
cd /tmp/inspiro-backend
git add <files> && git commit -m "..." && git push origin master

# 3. Deploy backend on server
ssh root@164.92.231.138 "cd /root/inspiro/backend/prod/inspiro-backend && git pull && npm run build && pm2 restart inspiro-backend-prod"
```

---

## 4. PM2 Reference

```bash
# List all processes
ssh root@164.92.231.138 "pm2 list"

# View backend logs
ssh root@164.92.231.138 "pm2 logs inspiro-backend-prod --lines 50"

# Restart manually
ssh root@164.92.231.138 "pm2 restart inspiro-backend-prod"
```

---

## 5. GitHub Token

The user may provide a GitHub personal access token (format: `ghp_...`).  
**Use it, then remind the user to revoke it** — tokens shared in chat are a security risk.

The same token usually works for both `Inspirouz/inspiro-frontend2` and `farzot/inspiro-backend`.

---

## 6. SSH Access to Server

SSH key is at `~/.ssh/id_ed25519`. The server (`164.92.231.138`) accepts it.  
GitHub does **not** — always use HTTPS + token for GitHub, SSH only for the DigitalOcean server.
