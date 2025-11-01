import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Wallet, 
  Target,
  Menu,
  X,
  Settings as SettingsIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    url: createPageUrl("Projects"),
    icon: Briefcase,
  },
  {
    title: "Clients",
    url: createPageUrl("Clients"),
    icon: Users,
  },
  {
    title: "Finances",
    url: createPageUrl("Finances"),
    icon: Wallet,
  },
  {
    title: "Goals",
    url: createPageUrl("Goals"),
    icon: Target,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  return (
    <div className="min-h-screen bg-[#0B0B10]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        :root {
          --glass-bg: rgba(20, 20, 25, 0.6);
          --glass-border: rgba(255, 255, 255, 0.05);
          --primary: #6366F1;
          --secondary: #8B5CF6;
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative flex h-screen">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-[#1E1E23] backdrop-blur-xl bg-[#141419]/80">
          <div className="p-6 border-b border-[#1E1E23]">
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              FreelanceHub
            </h1>
            <p className="text-sm text-zinc-400 mt-1 font-medium">Video Production Studio</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white shadow-lg shadow-indigo-500/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="p-4 border-t border-[#1E1E23]">
              <Link to={createPageUrl("Profile")}>
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 backdrop-blur-sm hover:border-indigo-500/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                      {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              </Link>
              <Link to={createPageUrl("Settings")}>
                <Button variant="ghost" className="w-full mt-2 text-zinc-400 hover:text-white justify-start">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          )}
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#141419]/90 border-b border-[#1E1E23]">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              FreelanceHub
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 backdrop-blur-xl bg-[#141419]/95 border-b border-[#1E1E23] p-4">
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  );
                })}
                {user && (
                  <>
                    <Link
                      to={createPageUrl("Profile")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        {user.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="font-medium">Profile</span>
                    </Link>
                    <Link
                      to={createPageUrl("Settings")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5"
                    >
                      <SettingsIcon className="w-5 h-5" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto lg:pt-0 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}