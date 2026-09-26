import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  CheckCircle2,
  Users,
  FolderKanban,
  MessageSquare,
  FileText,
  Shield,
  ArrowRight,
  Radio,
  Sparkles,
  Layers,
  BarChart3,
  Check,
  ChevronDown,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { Hero3DScene } from '../components/landing/Hero3DScene';
import { HeroInteractiveDemo } from '../components/landing/HeroInteractiveDemo';
import { RealTimeSyncVisualizer } from '../components/landing/RealTimeSyncVisualizer';
import { InteractiveProductShowcase } from '../components/landing/InteractiveProductShowcase';
import { FeatureCardsSection } from '../components/landing/FeatureCardsSection';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 selection:bg-brand-500 selection:text-white relative overflow-x-hidden transition-colors duration-200">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-50 bg-white/85 dark:bg-surface-950/85 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800/80 transition-colors duration-200 shadow-sm dark:shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-surface-950 dark:text-white tracking-tight">
                Collab<span className="text-brand-600 dark:text-brand-400">Flow</span>
              </span>
              <span className="hidden sm:inline text-[10px] ml-2 font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                v2.0 Real-Time
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-surface-600 dark:text-surface-300">
            <a href="#showcase" className="hover:text-surface-950 dark:hover:text-white transition-colors">Product Demo</a>
            <a href="#realtime" className="hover:text-surface-950 dark:hover:text-white transition-colors">Real-Time Sync</a>
            <a href="#features" className="hover:text-surface-950 dark:hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-surface-950 dark:hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-surface-950 dark:hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-surface-700 dark:text-surface-300 hover:text-surface-950 dark:hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section with 3D Background & Interactive Demo */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Three.js 3D Interactive WebGL Scene in background */}
        <Hero3DScene />

        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-brand-500/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-700 dark:text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400 animate-pulse" />
            Instantaneous Multi-User Synchronization
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-surface-950 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.1] animate-slide-up">
            Work Together. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-emerald-500 to-accent-500 dark:from-brand-400 dark:via-emerald-300 dark:to-accent-400">
              In Real Time.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-surface-600 dark:text-surface-300 max-w-3xl mx-auto leading-relaxed">
            Plan projects, collaborate on documents, communicate with your team, and watch every change happen instantly — all in one workspace.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/25 transition-all hover:scale-105 text-base flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#showcase"
              className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-surface-900/90 hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-300 dark:border-surface-700 text-surface-800 dark:text-surface-200 hover:text-surface-950 dark:hover:text-white font-bold rounded-2xl transition-all text-base flex items-center justify-center gap-2 backdrop-blur-md shadow-sm dark:shadow-none"
            >
              <Play className="w-4 h-4 fill-current text-brand-600 dark:text-brand-400" />
              Explore Platform
            </a>

            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/80 border border-brand-200 dark:border-brand-500/30 text-brand-800 dark:text-brand-300 hover:text-brand-950 dark:hover:text-white font-semibold rounded-2xl transition-all text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              1-Click Demo Login
            </Link>
          </div>

          {/* Live Hero Simulation Demo */}
          <div className="mt-14 max-w-4xl mx-auto">
            <HeroInteractiveDemo />
          </div>
        </div>
      </section>

      {/* 3. Interactive Product Showcase */}
      <section id="showcase" className="py-20 bg-surface-100/70 dark:bg-surface-900/40 border-y border-surface-200 dark:border-surface-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Interactive SaaS Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-950 dark:text-white tracking-tight mt-2">
              Everything your team needs, synced to the millisecond
            </h2>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-2">
              Test out the live interactive workspace below. Switch between Kanban, Collaborative Docs, Team Chat, and Sprint Analytics.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <InteractiveProductShowcase />
          </div>
        </div>
      </section>

      {/* 4. Real-Time Collaboration Section ("Everyone stays in sync") */}
      <section id="realtime" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RealTimeSyncVisualizer />
        </div>
      </section>

      {/* 5. 8 Feature Cards Section */}
      <section id="features" className="bg-surface-100/50 dark:bg-surface-900/30 border-y border-surface-200 dark:border-surface-800/80 transition-colors duration-200">
        <FeatureCardsSection />
      </section>

      {/* 6. Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Predictable Pricing
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-surface-950 dark:text-white tracking-tight">
            Plans built for teams of all sizes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto text-left">
            {/* Free */}
            <div className="p-8 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 flex flex-col justify-between shadow-sm dark:shadow-none transition-colors duration-200">
              <div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">Starter</h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">For small teams getting started</p>
                <div className="mt-4 text-3xl font-extrabold text-surface-950 dark:text-white">$0 <span className="text-xs font-normal text-surface-500 dark:text-surface-400">/ forever</span></div>

                <ul className="mt-6 space-y-3 text-xs text-surface-700 dark:text-surface-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Up to 5 Team Members</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 dark:text-brand-400" /> 3 Active Workspaces</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Real-Time Kanban Board</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Live Chat & Presence</li>
                </ul>
              </div>

              <Link
                to="/register"
                className="mt-8 w-full py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white text-xs font-semibold text-center block transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro - Featured */}
            <div className="p-8 rounded-2xl bg-white dark:bg-surface-900 border-2 border-brand-500 shadow-xl shadow-brand-500/10 dark:shadow-brand-500/20 relative flex flex-col justify-between transition-colors duration-200">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold uppercase tracking-wider">
                Most Popular
              </span>

              <div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">Pro Team</h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">For scaling engineering teams</p>
                <div className="mt-4 text-3xl font-extrabold text-surface-950 dark:text-white">$12 <span className="text-xs font-normal text-surface-500 dark:text-surface-400">/ user / mo</span></div>

                <ul className="mt-6 space-y-3 text-xs text-surface-700 dark:text-surface-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Unlimited Team Members</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Unlimited Workspaces & Projects</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Live Document Version Rollbacks</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 dark:text-brand-400" /> 50GB Cloud Storage</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Full Productivity Analytics</li>
                </ul>
              </div>

              <Link
                to="/register"
                className="mt-8 w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold text-center block transition-colors shadow-lg shadow-brand-600/30"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 flex flex-col justify-between shadow-sm dark:shadow-none transition-colors duration-200">
              <div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">Enterprise</h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">Custom governance and security</p>
                <div className="mt-4 text-3xl font-extrabold text-surface-950 dark:text-white">$29 <span className="text-xs font-normal text-surface-500 dark:text-surface-400">/ user / mo</span></div>

                <ul className="mt-6 space-y-3 text-xs text-surface-700 dark:text-surface-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Dedicated Socket.IO Cluster</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Custom Roles & Permissions</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 dark:text-brand-400" /> SAML SSO & Audit Logs</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-brand-500 dark:text-brand-400" /> 24/7 Dedicated Support</li>
                </ul>
              </div>

              <Link
                to="/register"
                className="mt-8 w-full py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white text-xs font-semibold text-center block transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Got Questions?
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-surface-950 dark:text-white tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4 text-left">
          <div className="p-6 rounded-2xl bg-white dark:bg-surface-900/60 border border-surface-200 dark:border-surface-800 shadow-sm dark:shadow-none transition-colors duration-200">
            <h4 className="text-base font-bold text-surface-950 dark:text-white">How does real-time synchronization work in CollabFlow?</h4>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-2">
              CollabFlow uses a high-performance Socket.IO gateway with scoped workspace and project rooms. When actions (like dragging a Kanban task, posting a message, or typing in a document) occur, scoped events are broadcast instantaneously to all peers in the workspace room with sub-50ms latency.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-surface-900/60 border border-surface-200 dark:border-surface-800 shadow-sm dark:shadow-none transition-colors duration-200">
            <h4 className="text-base font-bold text-surface-950 dark:text-white">Can multiple people edit the same collaborative document simultaneously?</h4>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-2">
              Yes! The collaborative document editor broadcasts mutations live, tracks collaborator avatars and typing indicators in real time, and creates automatic version snapshots in MongoDB that can be restored with 1 click.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-surface-900/60 border border-surface-200 dark:border-surface-800 shadow-sm dark:shadow-none transition-colors duration-200">
            <h4 className="text-base font-bold text-surface-950 dark:text-white">How are files stored and delivered?</h4>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-2">
              CollabFlow supports Cloudinary cloud storage for high-speed CDN delivery and automatic fallback to secure server disk storage.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-r from-brand-50 via-white to-surface-50 dark:from-brand-950 dark:via-surface-900 dark:to-surface-950 border border-brand-200 dark:border-brand-500/30 shadow-2xl relative text-center transition-colors duration-200">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-surface-950 dark:text-white tracking-tight">
              Your team's work, connected in real time.
            </h2>
            <p className="mt-4 text-base text-surface-600 dark:text-surface-300 max-w-2xl mx-auto">
              Create a free workspace in 30 seconds and experience the future of synchronous team execution.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl shadow-xl shadow-brand-600/30 transition-all hover:scale-105 text-base flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 bg-white dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-white font-bold rounded-2xl transition-all text-base shadow-sm dark:shadow-none"
              >
                Live Demo Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SaaS Footer */}
      <footer className="py-12 border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 text-left transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-surface-500">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-surface-900 dark:text-white text-sm">CollabFlow</span> &copy; 2026. Enterprise Real-Time SaaS Platform.
          </div>
          <div className="flex items-center gap-6 text-surface-600 dark:text-surface-400">
            <a href="#showcase" className="hover:text-surface-950 dark:hover:text-white transition-colors">Product Demo</a>
            <a href="#features" className="hover:text-surface-950 dark:hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-surface-950 dark:hover:text-white transition-colors">Pricing</a>
            <Link to="/login" className="hover:text-surface-950 dark:hover:text-white transition-colors">Sign In</Link>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
};
