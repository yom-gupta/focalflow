'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
  Check,
  Play,
  Star,
  Shield,
  Clock,
  Quote
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useTheme } from '@/contexts/ThemeContext'

export default function Landing() {
  const router = useRouter()
  const { theme } = useTheme()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
      setIsLoading(false)
    })
  }, [])

  // Scroll animation observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, observerOptions)

    const elements = document.querySelectorAll('.fade-in-on-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      handleLogin()
    }
  }

  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#191919]' : 'bg-white'} text-foreground overflow-hidden`}>
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 border-b ${isDark ? 'border-white/[0.09] bg-[#1f1f1f]/95 backdrop-blur-sm' : 'border-gray-200 bg-white/95 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-[#2e2e2e]' : 'bg-gray-100'} flex items-center justify-center`}>
                <Sparkles className={`w-5 h-5 ${isDark ? 'text-[#4fc3f7]' : 'text-[#6366f1]'}`} />
              </div>
              <div>
                <h1 className={`text-2xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
                  FocalFlow
                </h1>
                <p className={`text-xs ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'} font-normal`}>
                  Your Creative OS
                </p>
              </div>
            </div>
            
            {!isLoading && (
              <div className="flex items-center gap-4">
                {isAuthenticated ? (
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className={`${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-900 hover:bg-gray-800 text-white'} border border-border font-normal`}
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleLogin}
                      variant="ghost"
                      className="text-foreground"
                    >
                      Sign In
                    </Button>
                    <Button 
                      onClick={handleGetStarted}
                      className={`${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-900 hover:bg-gray-800 text-white'} font-normal`}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-gray-100 border-gray-200'} border text-foreground text-sm font-medium mb-6`}>
            <Sparkles className="w-4 h-4" />
            <span>For Modern Creators 🚀</span>
          </div>
          
          <h1 className={`text-5xl md:text-7xl font-bold tracking-tight mb-6 text-left ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
            Manage Your Creative Business
            <br />
            <span className={isDark ? 'text-[#8B5CF6]' : 'text-[#8B5CF6]'}>Like a Pro</span>
          </h1>
          
          <p className={`text-xl ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'} mb-10 max-w-2xl text-left font-normal`}>
            Track projects, manage clients, organize inspiration, and hit your goals — all in one clean dashboard made for creators.
          </p>
          
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="w-full sm:w-auto font-normal text-lg px-8 py-6"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className={`w-full sm:w-auto ${isDark ? 'border-white/20 bg-transparent hover:bg-white/5 text-white' : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-900'} text-lg px-8 py-6`}
            >
              <Play className="w-4 h-4 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${isDark ? 'text-[#8B5CF6]' : 'text-[#8B5CF6]'}`} />
              <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isDark ? 'text-[#8B5CF6]' : 'text-[#8B5CF6]'}`} />
              <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${isDark ? 'text-[#8B5CF6]' : 'text-[#8B5CF6]'}`} />
              <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Loved by Creators</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-24 relative fade-in-on-scroll">
          <div className="relative">
            <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-white/[0.09]' : 'border-gray-200'} shadow-2xl transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300`}>
              <div className={`w-full h-[500px] ${isDark ? 'bg-gradient-to-br from-[#2e2e2e] via-[#1f1f1f] to-[#2e2e2e]' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'} relative overflow-hidden`}>
                {/* Blurred dashboard preview */}
                <div className="absolute inset-0 backdrop-blur-sm">
                  <div className="grid grid-cols-3 gap-4 p-6 h-full">
                    <div className={`${isDark ? 'bg-[#1f1f1f]/50' : 'bg-white/50'} rounded-lg border ${isDark ? 'border-white/5' : 'border-gray-200/50'} p-4 backdrop-blur-md`}>
                      <div className={`h-3 w-20 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded mb-3`}></div>
                      <div className={`h-2 w-32 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded mb-2`}></div>
                      <div className={`h-2 w-24 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded`}></div>
                    </div>
                    <div className={`${isDark ? 'bg-[#1f1f1f]/50' : 'bg-white/50'} rounded-lg border ${isDark ? 'border-white/5' : 'border-gray-200/50'} p-4 backdrop-blur-md`}>
                      <div className={`h-3 w-24 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded mb-3`}></div>
                      <div className={`h-2 w-28 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded mb-2`}></div>
                      <div className={`h-2 w-20 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded`}></div>
                    </div>
                    <div className={`${isDark ? 'bg-[#1f1f1f]/50' : 'bg-white/50'} rounded-lg border ${isDark ? 'border-white/5' : 'border-gray-200/50'} p-4 backdrop-blur-md`}>
                      <div className={`h-3 w-18 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded mb-3`}></div>
                      <div className={`h-2 w-30 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded mb-2`}></div>
                      <div className={`h-2 w-22 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className={`text-center mt-6 text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'} font-medium`}>
              Dashboard Preview – Clean. Fast. Powerful.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 fade-in-on-scroll ${isDark ? 'bg-[#1f1f1f]' : 'bg-gray-50'}`}>
        <div className="text-center mb-20">
          <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
            Everything You Need
          </h2>
          <p className={`text-xl ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
            Powerful features designed for video editors and content creators
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Briefcase,
              title: 'Project Hub',
              description: 'Manage every edit from idea to delivery with custom workflows and progress tracking.'
            },
            {
              icon: Users,
              title: 'Client Directory',
              description: 'Manage client relationships with contact info, social links, and complete project history.'
            },
            {
              icon: Wallet,
              title: 'Financial Tracking',
              description: 'Monitor income, expenses, and profit with beautiful charts and real-time analytics.'
            },
            {
              icon: Target,
              title: 'Goal Setting',
              description: 'Set earning goals, track progress, and visualize your path to success with what-if scenarios.'
            },
            {
              icon: TrendingUp,
              title: 'Smart Analytics',
              description: 'Track your business like a boss with insights on trends, top clients, and growth metrics.'
            },
            {
              icon: Zap,
              title: 'Custom Workflows',
              description: 'Personalize video editing and thumbnail design steps to match your unique process.'
            },
            {
              icon: Sparkles,
              title: 'Inspiration Library',
              description: 'Organize references, screenshots, links, and ideas in beautiful folders with auto-thumbnails.',
              isNew: true
            }
          ].map((feature, index) => (
            <div
              key={index}
              className={`group relative rounded-xl ${
                isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'
              } ${
                feature.isNew 
                  ? (isDark ? 'border-[#8B5CF6]/50 bg-gradient-to-br from-[#2e2e2e] to-[#1f1f1f]' : 'border-[#8B5CF6]/30 bg-gradient-to-br from-white to-gray-50')
                  : ''
              } border p-6 hover:border-accent transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isDark ? 'hover:shadow-purple-500/10' : 'hover:shadow-gray-900/10'
              }`}
            >
              {feature.isNew && (
                <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-[#8B5CF6] text-white' : 'bg-[#8B5CF6] text-white'}`}>
                  NEW
                </div>
              )}
              <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-[#1f1f1f]' : 'bg-gray-100'} border border-border flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${isDark ? 'text-[#8B5CF6]' : 'text-[#8B5CF6]'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>{feature.title}</h3>
              <p className={`${isDark ? 'text-[#A1A1AA]' : 'text-[#787774]'}`}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Creators Love Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 fade-in-on-scroll">
        <div className={`rounded-xl ${isDark ? 'bg-gradient-to-br from-[#2e2e2e] via-[#1f1f1f] to-[#2e2e2e] border-white/[0.09]' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 border-gray-200'} border p-12`}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className={`${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-white border-gray-200'} border rounded-xl p-8`}>
                <Quote className={`w-8 h-8 ${isDark ? 'text-[#8B5CF6]' : 'text-[#8B5CF6]'} mb-4`} />
                <p className={`text-xl ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'} mb-6 font-medium italic`}>
                  "I finally stopped using 5 different spreadsheets to manage my freelance work."
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-[#2e2e2e]' : 'bg-gray-100'} flex items-center justify-center`}>
                    <span className={`text-lg ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>🎥</span>
                  </div>
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>A Creator from Delhi</p>
                    <p className={`text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>Video Editor</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className={`text-4xl font-bold mb-8 ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
                Why Creators Love FocalFlow
              </h2>
              <div className="space-y-4">
                {[
                  'Save 10+ hours per week on admin work',
                  'Never miss a deadline with smart tracking',
                  'Organize inspiration and references in one place',
                  'Increase revenue with better project visibility',
                  'Make data-driven decisions with analytics',
                  'Professional client management system'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-gray-100 border-gray-200'} border flex items-center justify-center flex-shrink-0`}>
                      <Check className={`w-4 h-4 ${isDark ? 'text-[#81c784]' : 'text-green-600'}`} />
                    </div>
                    <span className={`text-lg ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center fade-in-on-scroll ${isDark ? 'bg-[#1f1f1f]' : 'bg-gray-50'}`}>
        <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
          Ready to Level Up Your Creative Career?
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="font-normal text-lg px-8 py-6"
          >
            Start for Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            onClick={() => router.push('/dashboard')}
            size="lg"
            variant="outline"
            className={`${isDark ? 'border-white/20 bg-transparent hover:bg-white/5 text-white' : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-900'} text-lg px-8 py-6`}
          >
            Explore Dashboard
          </Button>
        </div>
        <p className={`text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
          Free forever. Built for creators, by creators.
        </p>
      </div>

      {/* Footer */}
      <footer className={`border-t ${isDark ? 'border-white/[0.09] bg-[#1f1f1f]' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-[#2e2e2e]' : 'bg-gray-100'} flex items-center justify-center`}>
                <Sparkles className={`w-4 h-4 ${isDark ? 'text-[#4fc3f7]' : 'text-[#6366f1]'}`} />
              </div>
              <span className={`text-lg font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>FocalFlow</span>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className={`text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
                © 2024 FocalFlow. Built for creators, by creators.
              </p>
              <a 
                href="https://yomgupta.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`text-sm ${isDark ? 'text-[#4fc3f7] hover:text-[#81c9e3]' : 'text-[#6366f1] hover:text-[#818cf8]'} transition-colors font-medium`}
              >
                Made by yomgupta.in
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
