# CollabFlow — Real-Time Team Collaboration SaaS Platform

CollabFlow is a modern, enterprise-grade real-time collaboration SaaS platform built with **React**, **Tailwind CSS**, **Node.js**, **Express.js**, **MongoDB Atlas**, and **Socket.IO**.

---

## 🌟 Key Features

### 1. ⚡ Instantaneous Real-Time Synchronization (Socket.IO)
- **Kanban Board Live Moves:** Move cards between columns (Backlog, To Do, In Progress, Review, Completed) and observe immediate synchronization across all connected clients with zero page reload.
- **Real-Time Presence:** Live indicators for online, away, and offline members in each workspace.
- **Live Typing Indicator:** Instant *"Bhavana is typing..."* status in channels and direct messages.
- **Collaborative Documents:** Concurrently draft and edit documentation with collaborator avatars, live presence, and 1-click version history rollbacks.
- **Instant Push Notifications:** Scoped real-time alerts for assigned tasks, comments, mentions, and project updates.

### 2. 📋 Full Project Management & Kanban Boards
- Dynamic columns with HTML5 Drag-and-Drop.
- Subtask checklists with instant completion toggle and progress bars.
- Priority levels (*Urgent*, *High*, *Medium*, *Low*).
- Due date tracking with automatic overdue visual alerts.
- Granular comments thread with replies, mentions, and resolution toggles.

### 3. 💬 Multi-Channel Chat & Direct Messaging
- Workspace-wide `#general` channels, dedicated project channels, and 1-on-1 direct messages.
- Message reactions with live emoji counters.
- File and image attachment previews.
- Read receipts and message edit/delete.

### 4. 📝 Real-Time Collaborative Documents
- Multi-user live collaborative document editor.
- Version history snapshotting with rollback capabilities.
- Markdown preview and drafting modes.

### 5. 📁 File & Asset Management (Cloudinary + Local Storage)
- Upload, preview, download, and delete deliverables, PDFs, code files, and mockups.
- Cloudinary integration with zero-setup safe local fallback storage.

### 6. 📊 Real-Time Analytics Dashboard (Recharts)
- Weekly team productivity & velocity area charts.
- Task status distribution donuts.
- Priority breakdown bar charts.
- Individual member workload and completion tracking.

### 7. 🛡️ Role-Based Workspace Authorization
- Roles: `Owner`, `Admin`, `Member`, `Viewer`.
- Workspace settings, member invitations, role management, and danger zone controls.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI (or embedded automatic database)

### 1. Start Backend Server
```bash
cd server
npm install
npm start
```
*The server starts on `http://localhost:5000` with the Socket.IO real-time gateway active.*

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
*The Vite frontend starts on `http://localhost:5173`.*

---

## 🔑 Demo Personas (1-Click Login Available)

| Persona | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Alex Rivera** | `alex@collabflow.io` | `Password123!` | Lead Architect & Founder |
| **Bhavana Sharma** | `bhavana@collabflow.io` | `Password123!` | Senior Frontend Engineer |
| **Tejaswi Rao** | `tejaswi@collabflow.io` | `Password123!` | Principal Backend Engineer |
| **Harsha Vardhan** | `harsha@collabflow.io` | `Password123!` | Product Designer |

> **Pro-Tip for Real-Time Testing:** Open `http://localhost:5173` in a regular browser window (e.g. logged in as Alex) and an Incognito window (logged in as Bhavana). Move a task on the Kanban board or send a message to observe instantaneous multi-client real-time synchronization!
