const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');
const FileModel = require('../models/FileModel');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const Event = require('../models/Event');

const seedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('⚡ Database already contains data.');
      return;
    }

    console.log('🌱 Seeding initial CollabFlow SaaS data...');

    // 1. Create Users
    const usersToCreate = [
      {
        name: 'Alex Rivera',
        email: 'alex@collabflow.io',
        password: 'Password123!',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        position: 'Lead Architect & Founder',
        skills: ['React', 'System Design', 'Socket.IO', 'Node.js'],
        status: 'online',
      },
      {
        name: 'Bhavana Sharma',
        email: 'bhavana@collabflow.io',
        password: 'Password123!',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        position: 'Senior Frontend Engineer',
        skills: ['React.js', 'Tailwind CSS', 'TypeScript', 'UI/UX'],
        status: 'online',
      },
      {
        name: 'Tejaswi Rao',
        email: 'tejaswi@collabflow.io',
        password: 'Password123!',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        position: 'Principal Backend Engineer',
        skills: ['Node.js', 'MongoDB', 'Distributed Systems', 'Express'],
        status: 'online',
      },
      {
        name: 'Harsha Vardhan',
        email: 'harsha@collabflow.io',
        password: 'Password123!',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        position: 'Product Designer',
        skills: ['Figma', 'Prototyping', 'Design Systems', 'Motion UI'],
        status: 'away',
      },
      {
        name: 'Sarah Chen',
        email: 'sarah@collabflow.io',
        password: 'Password123!',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        position: 'Product Manager',
        skills: ['Scrum', 'Product Strategy', 'Analytics', 'Roadmapping'],
        status: 'online',
      },
    ];

    const createdUsers = [];
    for (const u of usersToCreate) {
      const user = await User.create(u);
      createdUsers.push(user);
    }

    const [alex, bhavana, tejaswi, harsha, sarah] = createdUsers;

    // 2. Create Workspaces
    const workspace1 = await Workspace.create({
      name: 'Acme Product Cloud',
      slug: 'acme-product-cloud',
      description: 'Main product engineering and design collaboration headquarters.',
      icon: '🚀',
      color: '#6366f1',
      owner: alex._id,
      members: [
        { user: alex._id, role: 'owner' },
        { user: bhavana._id, role: 'admin' },
        { user: tejaswi._id, role: 'admin' },
        { user: harsha._id, role: 'member' },
        { user: sarah._id, role: 'member' },
      ],
    });

    const workspace2 = await Workspace.create({
      name: 'Growth & Marketing',
      slug: 'growth-marketing',
      description: 'Brand campaigns, marketing sprints, and growth analytics.',
      icon: '📈',
      color: '#10b981',
      owner: alex._id,
      members: [
        { user: alex._id, role: 'owner' },
        { user: sarah._id, role: 'admin' },
        { user: harsha._id, role: 'member' },
      ],
    });

    // Set active workspace
    for (const u of createdUsers) {
      u.activeWorkspace = workspace1._id;
      await u.save();
    }

    // 3. Create Projects
    const project1 = await Project.create({
      name: 'Mobile App V2 Launch',
      description: 'Revamping the mobile client with real-time push events and streamlined navigation.',
      workspace: workspace1._id,
      status: 'active',
      priority: 'urgent',
      startDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 86400000),
      color: '#6366f1',
      coverImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&auto=format&fit=crop&q=80',
      createdBy: alex._id,
      members: [alex._id, bhavana._id, tejaswi._id, harsha._id],
      tags: ['Mobile', 'Flutter', 'Real-Time'],
    });

    const project2 = await Project.create({
      name: 'AI Agent Workflows',
      description: 'Building autonomous pair-programming tools and automated CI review agents.',
      workspace: workspace1._id,
      status: 'active',
      priority: 'high',
      startDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 86400000),
      color: '#8b5cf6',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      createdBy: tejaswi._id,
      members: [alex._id, tejaswi._id, sarah._id],
      tags: ['AI', 'LLM', 'Socket.IO'],
    });

    const project3 = await Project.create({
      name: 'Design System & UI Library',
      description: 'Tokens, accessibility guidelines, micro-animations, and high-performance React widgets.',
      workspace: workspace1._id,
      status: 'planning',
      priority: 'medium',
      startDate: new Date(),
      dueDate: new Date(Date.now() + 45 * 86400000),
      color: '#ec4899',
      coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
      createdBy: harsha._id,
      members: [bhavana._id, harsha._id],
      tags: ['Design', 'Tailwind', 'Figma'],
    });

    // 4. Create Kanban Tasks
    const tasks = [
      {
        title: 'Design high-fidelity wireframes for Task View',
        description: 'Create interactive Figma prototypes with subtask checklists and live collaborator badges.',
        workspace: workspace1._id,
        project: project1._id,
        status: 'completed',
        priority: 'high',
        assignee: harsha._id,
        reporter: alex._id,
        dueDate: new Date(Date.now() - 2 * 86400000),
        labels: [{ text: 'Design', color: '#ec4899' }],
        subtasks: [
          { title: 'User interview synthesis', completed: true },
          { title: 'Interactive prototype in Figma', completed: true },
        ],
        order: 0,
      },
      {
        title: 'Implement Socket.IO live cursor tracking',
        description: 'Broadcast pointer coordinates and active selection ranges across document rooms with 60fps throttle.',
        workspace: workspace1._id,
        project: project1._id,
        status: 'in_progress',
        priority: 'urgent',
        assignee: bhavana._id,
        reporter: alex._id,
        dueDate: new Date(Date.now() + 3 * 86400000),
        labels: [{ text: 'Frontend', color: '#3b82f6' }, { text: 'Realtime', color: '#10b981' }],
        subtasks: [
          { title: 'Throttled socket emitter hook', completed: true },
          { title: 'Avatar cursor overlay component', completed: true },
          { title: 'Collision and edge bounding test', completed: false },
        ],
        order: 0,
      },
      {
        title: 'Setup MongoDB change streams and indexing',
        description: 'Optimize compound indexes on workspace and conversation collections for sub-millisecond query responses.',
        workspace: workspace1._id,
        project: project1._id,
        status: 'in_progress',
        priority: 'high',
        assignee: tejaswi._id,
        reporter: alex._id,
        dueDate: new Date(Date.now() + 5 * 86400000),
        labels: [{ text: 'Backend', color: '#8b5cf6' }, { text: 'Database', color: '#f59e0b' }],
        subtasks: [
          { title: 'Index evaluation script', completed: true },
          { title: 'Atlas replica set change stream pipeline', completed: false },
        ],
        order: 1,
      },
      {
        title: 'Build automated end-to-end multi-client test suite',
        description: 'Simulate concurrent browser sessions validating real-time Kanban moves and instant chat delivery.',
        workspace: workspace1._id,
        project: project1._id,
        status: 'todo',
        priority: 'medium',
        assignee: alex._id,
        reporter: sarah._id,
        dueDate: new Date(Date.now() + 8 * 86400000),
        labels: [{ text: 'Testing', color: '#14b8a6' }],
        subtasks: [
          { title: 'Playwright multi-context fixtures', completed: false },
          { title: 'Socket latency benchmarking', completed: false },
        ],
        order: 0,
      },
      {
        title: 'Add Cloudinary multipart direct uploads',
        description: 'Enable progress bar and image optimization pipelines for uploaded project attachments.',
        workspace: workspace1._id,
        project: project1._id,
        status: 'backlog',
        priority: 'low',
        assignee: bhavana._id,
        reporter: alex._id,
        dueDate: new Date(Date.now() + 12 * 86400000),
        labels: [{ text: 'Storage', color: '#64748b' }],
        order: 0,
      },
      {
        title: 'Document Rollback and Version Diffing UI',
        description: 'Allow users to compare changes between versions and restore snapshots with 1 click.',
        workspace: workspace1._id,
        project: project1._id,
        status: 'review',
        priority: 'high',
        assignee: bhavana._id,
        reporter: tejaswi._id,
        dueDate: new Date(Date.now() + 2 * 86400000),
        labels: [{ text: 'Feature', color: '#6366f1' }],
        order: 0,
      },

      // Tasks for Project 2 (AI Agent Workflows)
      {
        title: 'Stream LLM reasoning token chunks via WebSockets',
        description: 'Implement backpressure handling and chunk buffer flushing at 25ms intervals.',
        workspace: workspace1._id,
        project: project2._id,
        status: 'in_progress',
        priority: 'urgent',
        assignee: tejaswi._id,
        reporter: alex._id,
        dueDate: new Date(Date.now() + 6 * 86400000),
        labels: [{ text: 'AI', color: '#8b5cf6' }],
        order: 0,
      },
      {
        title: 'Construct agentic tool execution sandbox',
        description: 'Provide secure dockerized execution runtime for user code snippets.',
        workspace: workspace1._id,
        project: project2._id,
        status: 'todo',
        priority: 'high',
        assignee: alex._id,
        reporter: sarah._id,
        dueDate: new Date(Date.now() + 10 * 86400000),
        labels: [{ text: 'Security', color: '#ef4444' }],
        order: 0,
      },

      // Tasks for Project 3 (Design System)
      {
        title: 'Publish dark mode tokens and HSL palettes',
        description: 'Harmonize contrast ratios to meet WCAG AAA standards across all dashboard cards.',
        workspace: workspace1._id,
        project: project3._id,
        status: 'completed',
        priority: 'medium',
        assignee: harsha._id,
        reporter: bhavana._id,
        dueDate: new Date(Date.now() - 4 * 86400000),
        labels: [{ text: 'Design', color: '#ec4899' }],
        order: 0,
      },
    ];

    const createdTasks = [];
    for (const t of tasks) {
      const task = await Task.create(t);
      createdTasks.push(task);
    }

    // 5. Create Comments on Task
    const taskForComments = createdTasks[1]; // Socket.IO task
    await Comment.create({
      task: taskForComments._id,
      user: tejaswi._id,
      text: 'I tested the socket emission with 20 concurrent connections. The debounce at 35ms feels ultra smooth! 🚀',
      replies: [
        {
          user: bhavana._id,
          text: 'Awesome! I am hooking up the avatar bubble with smooth CSS transition now.',
          createdAt: new Date(),
        },
      ],
    });

    // 6. Create Conversations & Messages
    const generalConv = await Conversation.create({
      workspace: workspace1._id,
      type: 'workspace',
      name: 'general',
      isChannel: true,
      participants: createdUsers.map((u) => u._id),
      lastMessage: {
        text: 'Welcome to CollabFlow! Real-time synchronization is live.',
        sender: alex._id,
        createdAt: new Date(),
      },
    });

    const projectConv = await Conversation.create({
      workspace: workspace1._id,
      project: project1._id,
      type: 'project',
      name: 'mobile-app-v2-launch',
      isChannel: true,
      participants: [alex._id, bhavana._id, tejaswi._id, harsha._id],
      lastMessage: {
        text: 'Kanban cards now sync across all connected clients without reload! ⚡',
        sender: bhavana._id,
        createdAt: new Date(),
      },
    });

    // Seed Messages
    await Message.create({
      conversation: generalConv._id,
      workspace: workspace1._id,
      sender: alex._id,
      text: 'Hey team! Welcome to CollabFlow. All updates to tasks, docs, and chat are streamed in real time.',
      reactions: [{ user: bhavana._id, emoji: '🔥' }, { user: tejaswi._id, emoji: '🚀' }],
    });

    await Message.create({
      conversation: generalConv._id,
      workspace: workspace1._id,
      sender: bhavana._id,
      text: 'Super excited to collaborate here! The Kanban drag-and-drop response time is incredible.',
      reactions: [{ user: harsha._id, emoji: '❤️' }],
    });

    await Message.create({
      conversation: generalConv._id,
      workspace: workspace1._id,
      sender: tejaswi._id,
      text: 'Backend socket pipelines are running at top performance. Ready for high concurrency.',
    });

    await Message.create({
      conversation: projectConv._id,
      workspace: workspace1._id,
      sender: bhavana._id,
      text: 'Kanban cards now sync across all connected clients without reload! ⚡',
    });

    // 7. Create Collaborative Documents
    const doc1 = await Document.create({
      workspace: workspace1._id,
      project: project1._id,
      title: 'CollabFlow Product Architecture & Vision',
      icon: '📘',
      content: `# CollabFlow Architecture & Vision

## 1. Executive Summary
CollabFlow is engineered for high-velocity software engineering and product teams who demand instantaneous real-time collaboration without page refreshes.

## 2. Core Pillars
* **Instantaneous Synchronization:** Socket.IO event channels push task reordering, comments, and document mutations with sub-50ms latency.
* **Granular Presence:** Live collaborator markers indicate who is currently online, viewing documents, or typing messages.
* **Unified Workspace Operations:** Centralized search, integrated file management, and proactive activity logging.

## 3. Real-Time Engine Details
Every state modification on the Kanban board or Document editor emits a scoped WebSocket payload to the corresponding workspace room (\`workspace:{id}\`), ensuring instant updates across all active team members.
`,
      createdBy: alex._id,
      lastModifiedBy: bhavana._id,
      activeCollaborators: [alex._id, bhavana._id],
      tags: ['Architecture', 'Core', 'Documentation'],
    });

    await DocumentVersion.create({
      document: doc1._id,
      content: doc1.content,
      title: doc1.title,
      createdBy: alex._id,
      versionNumber: 1,
      changeSummary: 'Initial architectural draft',
    });

    // 8. Create Calendar Events
    await Event.create({
      workspace: workspace1._id,
      project: project1._id,
      user: alex._id,
      title: 'Sprint Planning & Live Demo',
      description: 'Demonstrating real-time collaborative Kanban and Socket.IO presence indicators.',
      start: new Date(Date.now() + 1 * 86400000),
      end: new Date(Date.now() + 1 * 86400000 + 3600000),
      type: 'meeting',
      attendees: [alex._id, bhavana._id, tejaswi._id, harsha._id, sarah._id],
      color: '#6366f1',
    });

    await Event.create({
      workspace: workspace1._id,
      project: project1._id,
      user: sarah._id,
      title: 'Mobile App V2 Release Milestone',
      description: 'Production deployment milestone for iOS and Android clients.',
      start: new Date(Date.now() + 7 * 86400000),
      end: new Date(Date.now() + 7 * 86400000 + 7200000),
      type: 'milestone',
      attendees: [alex._id, tejaswi._id],
      color: '#10b981',
    });

    // 9. Create Activities
    const activities = [
      {
        workspace: workspace1._id,
        project: project1._id,
        user: alex._id,
        action: 'created project "Mobile App V2 Launch"',
        entityType: 'project',
        entityId: project1._id,
      },
      {
        workspace: workspace1._id,
        project: project1._id,
        user: bhavana._id,
        action: 'moved "Implement Socket.IO live cursor tracking" to IN PROGRESS',
        entityType: 'task',
        entityId: createdTasks[1]._id,
      },
      {
        workspace: workspace1._id,
        project: project1._id,
        user: harsha._id,
        action: 'completed task "Design high-fidelity wireframes for Task View"',
        entityType: 'task',
        entityId: createdTasks[0]._id,
      },
      {
        workspace: workspace1._id,
        user: tejaswi._id,
        action: 'created document "CollabFlow Product Architecture & Vision"',
        entityType: 'document',
        entityId: doc1._id,
      },
    ];

    for (const act of activities) {
      await Activity.create(act);
    }

    // 10. Create Notifications
    await Notification.create({
      recipient: alex._id,
      sender: bhavana._id,
      workspace: workspace1._id,
      type: 'comment',
      title: 'New comment on task',
      message: 'Bhavana commented on "Implement Socket.IO live cursor tracking"',
      link: `/projects/${project1._id}?task=${createdTasks[1]._id}`,
      read: false,
    });

    await Notification.create({
      recipient: alex._id,
      sender: harsha._id,
      workspace: workspace1._id,
      type: 'task_completed',
      title: 'Task Completed',
      message: 'Harsha marked "Design high-fidelity wireframes for Task View" as Completed',
      link: `/projects/${project1._id}?task=${createdTasks[0]._id}`,
      read: false,
    });

    console.log('✅ Demo Seed Data successfully created!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

module.exports = seedData;
