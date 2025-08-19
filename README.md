

# 🖥️ Git Tracker Desktop App for Developers

An **Electron desktop application** built with **React** and **TypeScript**, seamlessly connected to the [Git Tracker Backend].

Git Tracker empowers developers to monitor Git repository activity, visualize commits status, and ensure system reliability — all from an intuitive desktop interface.
---

## ✨ Key Features

* **Cross-Platform Desktop App**: Available for Windows, macOS, and Linux.
* **Real-Time Repository Tracking**: Fetch commit data (hash, message, branch, files changed) via the backend API.
* **System Health Monitoring**: Show backend-provided health warnings for missing or unsynced repositories.
---

## 🛠️ Technologies

| Component       | Technology          | Purpose                              |
| --------------- | ------------------- | ------------------------------------ |
| Frontend        | React + TypeScript  | Desktop UI with Electron integration |
| Desktop Runtime | Electron            | Cross-platform desktop app shell     |
| Backend API     | NestJS              | Provides Git data, analytics, health |
| Database        | Sqlite             | Repository, user, and commit storage |

---

## 📂 Project Structure

```
git-tracker-desktop/
├── src/
│   ├── main/                  # Electron main process
│   │     ├── ipcHandlers/     # Communication between Electron & backend
│   ├── renderer/              # React app
│         ├── components/      # UI components
│         ├── pages/           # Dashboard, project, analytics pages
├── package.json
├── pnpm-lock.yaml
├── README.md
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) v18+
* [pnpm](https://pnpm.io/) v8.6.0+
* [Git Tracker Backend](https://github.com/goldenage-et/Git-Tracker-Team-1-backend-) running locally or remotely
  Default backend URL: `http://localhost:3001/api`

---

### 🔧 Install Dependencies

```bash
pnpm install
```

### 🖥️ Development Mode

```bash
pnpm dev
```

Launches Electron with hot-reloading React frontend.

### 📦 Build for Production

```bash
# For Windows
pnpm build:win

# For macOS
pnpm build:mac

# For Linux
pnpm build:linux
```

---

## 🎯 Project Vision

The Git Tracker Desktop app provides a **seamless UI for the backend API**, designed to:

1. **Track Repository Activity** → Commits, branches, and file changes.
2. **Provide Actionable Analytics** → Charts and metrics for clients and superadmins.
3. **Monitor System Health** → Sync warnings and repository status.
4. **Offer Multi-Role Access** → Different views for developers, clients, and admins.

---

## 🔄 Roadmap

* ✅ Core Desktop App Setup (Electron + React + TS)
* ✅ API Integration with Git Tracker Backend
* ⬜ Offline Mode with Local Storage
* ⬜ Electron Auto-Updater for desktop releases


---

## 📜 License

This project will be licensed under the MIT License (to be added).

---

## 🌟 Why Git Tracker Desktop?

Unlike traditional Git tracking tools, Git Tracker provides a **unified desktop platform** connected to a **NestJS backend** for:

* Real-time commit tracking
* Visual analytics for project progress
* Health monitoring of repositories

Making Git activity **transparent, collaborative, and actionable** 🚀

---
