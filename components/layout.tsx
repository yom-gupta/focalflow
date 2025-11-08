'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Wallet, 
  Target,
  Menu,
  X,
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react'
import { Button } from './ui/button'
import { useState, useEffect } from 'react'
import { getUser } from '@/lib/auth'
import { useTheme } from '@/contexts/ThemeContext'

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    url: '/projects',
    icon: Briefcase,
  },
  {
    title: 'Clients',
    url: '/clients',
    icon: Users,
  },
  {
    title: 'Finances',
    url: '/finances',
    icon: Wallet,
  },
  {
    title: 'Goals',
    url: '/goals',
    icon: Target,
  },
  {
    title: 'Inspiration',
    url: '/inspiration',
    icon: Sparkles,
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    getUser().then(setUser)
  }, [])

  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#191919]' : 'bg-white'}`}>
      <div className="relative flex h-screen">
        {/* Sidebar - Desktop */}
        <aside className={`hidden lg:flex flex-col w-72 border-r ${isDark ? 'border-white/[0.09] bg-[#1f1f1f]' : 'border-gray-200 bg-gray-50'}`}>
          <div className={`p-6 border-b ${isDark ? 'border-white/[0.09]' : 'border-gray-200'}`}>
            <h1 className={`text-2xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'} tracking-tight`}>
              FocalFlow
            </h1>
            <p className={`text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'} mt-1 font-normal`}>Video Production Studio</p>
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            {navigationItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? `${isDark ? 'bg-[#2e2e2e] text-[#ededed]' : 'bg-gray-100 text-[#37352f]'}`
                      : `${isDark ? 'text-[#a5a5a5] hover:text-[#ededed] hover:bg-[#2e2e2e]' : 'text-[#787774] hover:text-[#37352f] hover:bg-gray-100'}`
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-normal text-sm">{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {user && (
            <div className={`p-4 border-t ${isDark ? 'border-white/[0.09]' : 'border-gray-200'}`}>
              <Link href="/profile">
                <div className={`p-3 rounded-md ${isDark ? 'hover:bg-[#2e2e2e]' : 'hover:bg-gray-100'} transition-colors cursor-pointer`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-md ${isDark ? 'bg-[#37352f]' : 'bg-gray-200'} flex items-center justify-center text-xs font-medium ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-normal ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'} truncate`}>{user.email}</p>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" className={`w-full mt-2 ${isDark ? 'text-[#a5a5a5] hover:text-[#ededed] hover:bg-[#2e2e2e]' : 'text-[#787774] hover:text-[#37352f] hover:bg-gray-100'} justify-start font-normal`}>
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          )}
        </aside>

        {/* Mobile Header */}
        <div className={`lg:hidden fixed top-0 left-0 right-0 z-50 ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-white border-gray-200'} border-b`}>
          <div className="flex items-center justify-between p-4">
            <h1 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
              FocalFlow
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={isDark ? 'text-[#a5a5a5] hover:text-[#ededed] hover:bg-[#2e2e2e]' : 'text-[#787774] hover:text-[#37352f] hover:bg-gray-100'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className={`absolute top-full left-0 right-0 ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-white border-gray-200'} border-b p-3`}>
              <nav className="space-y-0.5">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <Link
                      key={item.title}
                      href={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
                        isActive
                          ? `${isDark ? 'bg-[#2e2e2e] text-[#ededed]' : 'bg-gray-100 text-[#37352f]'}`
                          : `${isDark ? 'text-[#a5a5a5] hover:text-[#ededed] hover:bg-[#2e2e2e]' : 'text-[#787774] hover:text-[#37352f] hover:bg-gray-100'}`
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-normal text-sm">{item.title}</span>
                    </Link>
                  )
                })}
                {user && (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md ${isDark ? 'text-[#a5a5a5] hover:text-[#ededed] hover:bg-[#2e2e2e]' : 'text-[#787774] hover:text-[#37352f] hover:bg-gray-100'}`}
                    >
                      <div className={`w-7 h-7 rounded-md ${isDark ? 'bg-[#37352f]' : 'bg-gray-200'} flex items-center justify-center text-xs font-medium ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="font-normal text-sm">Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md ${isDark ? 'text-[#a5a5a5] hover:text-[#ededed] hover:bg-[#2e2e2e]' : 'text-[#787774] hover:text-[#37352f] hover:bg-gray-100'}`}
                    >
                      <SettingsIcon className="w-4 h-4" />
                      <span className="font-normal text-sm">Settings</span>
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
  )
}

