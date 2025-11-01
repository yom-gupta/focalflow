import React from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Wallet, 
  Target, 
  Sparkles,
  TrendingUp,
  Zap,
  ArrowRight,
  Check
} from "lucide-react";

export default function Landing() {
  const { data: isAuthenticated, isLoading } = useQuery({
    queryKey: ['isAuthenticated'],
    queryFn: () => base44.auth.isAuthenticated(),
  });

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      window.location.href = createPageUrl("Dashboard");
    } else {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B10] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative border-b border-[#1E1E23] backdrop-blur-xl bg-[#141419]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                FreelanceHub
              </h1>
            </div>
            
            {!isLoading && (
              <div className="flex items-center gap-4">
                {isAuthenticated ? (
                  <Link to={createPageUrl("Dashboard")}>
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-medium shadow-lg shadow-indigo-500/30">
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={handleLogin}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-medium shadow-lg shadow-indigo-500/30"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Professional Freelance Management</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
            Manage Your Video Editing Business Like a Pro
          </h1>
          
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-medium">
            Track projects, manage clients, monitor finances, and hit your goals—all in one beautiful dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-semibold shadow-2xl shadow-indigo-500/40 text-lg px-8 py-6"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-white/10 hover:bg-white/5 text-lg px-8 py-6"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B10] via-transparent to-transparent z-10"></div>
          <div className="rounded-2xl overflow-hidden border border-[#1E1E23] shadow-2xl shadow-indigo-500/10">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop" 
              alt="Dashboard Preview" 
              className="w-full h-auto opacity-70"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-xl text-zinc-400">Powerful features designed for video editors and content creators</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Briefcase,
              title: "Project Management",
              description: "Track all your thumbnail and video projects with custom workflows, deadlines, and progress indicators."
            },
            {
              icon: Users,
              title: "Client Directory",
              description: "Manage client relationships with contact info, social links, and complete project history."
            },
            {
              icon: Wallet,
              title: "Financial Tracking",
              description: "Monitor income, expenses, and profit with beautiful charts and real-time analytics."
            },
            {
              icon: Target,
              title: "Goal Setting",
              description: "Set earning goals, track progress, and visualize your path to success with what-if scenarios."
            },
            {
              icon: TrendingUp,
              title: "Smart Analytics",
              description: "Get insights on monthly trends, top clients, project types, and business growth metrics."
            },
            {
              icon: Zap,
              title: "Custom Workflows",
              description: "Personalize video editing and thumbnail design steps to match your unique process."
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="group rounded-2xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-6 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-zinc-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="rounded-3xl backdrop-blur-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Why Freelancers Love FreelanceHub</h2>
              <div className="space-y-4">
                {[
                  "Save 10+ hours per week on admin work",
                  "Never miss a deadline with smart tracking",
                  "Increase revenue with better project visibility",
                  "Make data-driven decisions with analytics",
                  "Professional client management system"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-lg text-zinc-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=800&fit=crop" 
                  alt="Analytics" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Level Up Your Freelance Game?</h2>
        <p className="text-xl text-zinc-400 mb-10">Join thousands of video editors managing their business smarter.</p>
        <Button 
          onClick={handleGetStarted}
          size="lg"
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-semibold shadow-2xl shadow-indigo-500/40 text-lg px-8 py-6"
        >
          Start For Free
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-[#1E1E23] backdrop-blur-xl bg-[#141419]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold">FreelanceHub</span>
            </div>
            <p className="text-zinc-500 text-sm">© 2024 FreelanceHub. Built for creators, by creators.</p>
          </div>
        </div>
      </footer>

      <style>{`
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
    </div>
  );
}