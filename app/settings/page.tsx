'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, Palette, Workflow, Plus, Trash2, LogOut, Sun, Moon } from 'lucide-react'
import Layout from '@/components/layout'
import { getUser, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTheme } from '@/contexts/ThemeContext'
import { toast } from 'sonner'

export default function Settings() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [userId, setUserId] = useState<string | null>(null)
  const [currency, setCurrency] = useState('INR')
  const [currencySymbol, setCurrencySymbol] = useState('₹')
  const [exchangeRate, setExchangeRate] = useState('1')
  const [themeAccent, setThemeAccent] = useState('indigo')
  const [videoWorkflow, setVideoWorkflow] = useState(['Cuts', 'Color Grade', 'Sound Design', 'Motion Graphics', 'Export'])
  const [thumbnailWorkflow, setThumbnailWorkflow] = useState(['Concept', 'Design', 'Review', 'Final'])
  const [newVideoStep, setNewVideoStep] = useState('')
  const [newThumbnailStep, setNewThumbnailStep] = useState('')

  useEffect(() => {
    getUser().then((user) => {
      if (!user) {
        router.push('/')
      } else {
        setUserId(user.id)
        // Load user preferences from local storage or Supabase
        const savedPrefs = localStorage.getItem(`user_prefs_${user.id}`)
        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs)
          setCurrency(prefs.currency || 'INR')
          setCurrencySymbol(prefs.currencySymbol || '₹')
          setExchangeRate(prefs.exchangeRate || '1')
          setThemeAccent(prefs.themeAccent || 'indigo')
          setVideoWorkflow(prefs.videoWorkflow || ['Cuts', 'Color Grade', 'Sound Design', 'Motion Graphics', 'Export'])
          setThumbnailWorkflow(prefs.thumbnailWorkflow || ['Concept', 'Design', 'Review', 'Final'])
        }
      }
    })
  }, [router])

  const saveMutation = useMutation({
    mutationFn: async (prefs: any) => {
      if (!userId) return
      localStorage.setItem(`user_prefs_${userId}`, JSON.stringify(prefs))
      // Optionally save to Supabase user metadata
      const { error } = await supabase.auth.updateUser({
        data: prefs
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Settings saved successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to save settings', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const handleSaveSettings = () => {
    const prefs = {
      currency,
      currencySymbol,
      exchangeRate,
      themeAccent,
      videoWorkflow,
      thumbnailWorkflow
    }
    saveMutation.mutate(prefs)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const addVideoStep = () => {
    if (newVideoStep.trim()) {
      setVideoWorkflow([...videoWorkflow, newVideoStep.trim()])
      setNewVideoStep('')
    }
  }

  const removeVideoStep = (index: number) => {
    setVideoWorkflow(videoWorkflow.filter((_, i) => i !== index))
  }

  const addThumbnailStep = () => {
    if (newThumbnailStep.trim()) {
      setThumbnailWorkflow([...thumbnailWorkflow, newThumbnailStep.trim()])
      setNewThumbnailStep('')
    }
  }

  const removeThumbnailStep = (index: number) => {
    setThumbnailWorkflow(thumbnailWorkflow.filter((_, i) => i !== index))
  }

  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  ]

  if (!userId) {
    return (
      <Layout>
        <div className="min-h-screen p-8 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    )
  }

  const isDark = theme === 'dark'

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'} mb-1 tracking-tight`}>Settings</h1>
              <p className={`${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'} font-normal text-sm`}>Customize your FocalFlow experience</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className={isDark ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50'}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Currency Settings */}
          <div className={`rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-gray-100 border-gray-200'} border`}>
                <DollarSign className={`w-5 h-5 ${isDark ? 'text-[#4fc3f7]' : 'text-[#6366f1]'}`} />
              </div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>Currency Settings</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Currency</Label>
                <Select value={currency} onValueChange={(value) => {
                  setCurrency(value)
                  const curr = currencies.find(c => c.code === value)
                  if (curr) setCurrencySymbol(curr.symbol)
                }}>
                  <SelectTrigger className={isDark ? 'bg-[#1f1f1f] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(curr => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.name} ({curr.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Exchange Rate from INR</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className={isDark ? 'bg-[#1f1f1f] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                  placeholder="1.00"
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-[#6e6e6e]' : 'text-gray-500'}`}>1 INR = {exchangeRate} {currency}</p>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="rounded-lg bg-card border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent/20 border border-accent/30">
                <Palette className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground mb-3 block">Theme</Label>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-4 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-foreground" />
                    ) : (
                      <Sun className="w-5 h-5 text-foreground" />
                    )}
                    <span className="text-foreground font-medium">
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">Click to toggle</span>
                </button>
              </div>

              <div>
                <Label className="text-muted-foreground mb-3 block">Accent Color</Label>
                <div className="grid grid-cols-5 gap-3">
                  {['indigo', 'blue', 'purple', 'pink', 'green'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setThemeAccent(color)}
                      className={`h-12 rounded-xl transition-all ${
                        themeAccent === color 
                          ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-105' 
                          : 'hover:scale-105'
                      }`}
                      style={{
                        background: color === 'indigo' ? '#6366F1' :
                                   color === 'blue' ? '#3B82F6' :
                                   color === 'purple' ? '#A855F7' :
                                   color === 'pink' ? '#EC4899' : '#10B981'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Video Workflow Settings */}
          <div className={`rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-gray-100 border-gray-200'} border`}>
                <Workflow className={`w-5 h-5 ${isDark ? 'text-[#4fc3f7]' : 'text-[#6366f1]'}`} />
              </div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>Video Editing Workflow</h2>
            </div>

            <div className="space-y-3 mb-4">
              {videoWorkflow.map((step, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-gray-50 border-gray-200'} border`}>
                  <span className={isDark ? 'text-[#ededed]' : 'text-[#37352f]'}>{index + 1}. {step}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVideoStep(index)}
                    className={isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newVideoStep}
                onChange={(e) => setNewVideoStep(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addVideoStep()}
                className={isDark ? 'bg-[#1f1f1f] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                placeholder="Add new step..."
              />
              <Button
                onClick={addVideoStep}
                className={isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed] border-white/[0.09]' : 'bg-gray-900 hover:bg-gray-800 text-white'}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Thumbnail Workflow Settings */}
          <div className={`rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-gray-100 border-gray-200'} border`}>
                <Workflow className={`w-5 h-5 ${isDark ? 'text-[#4fc3f7]' : 'text-[#6366f1]'}`} />
              </div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>Thumbnail Design Workflow</h2>
            </div>

            <div className="space-y-3 mb-4">
              {thumbnailWorkflow.map((step, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-gray-50 border-gray-200'} border`}>
                  <span className={isDark ? 'text-[#ededed]' : 'text-[#37352f]'}>{index + 1}. {step}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeThumbnailStep(index)}
                    className={isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newThumbnailStep}
                onChange={(e) => setNewThumbnailStep(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addThumbnailStep()}
                className={isDark ? 'bg-[#1f1f1f] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                placeholder="Add new step..."
              />
              <Button
                onClick={addThumbnailStep}
                className={isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed] border-white/[0.09]' : 'bg-gray-900 hover:bg-gray-800 text-white'}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            className={`w-full ${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed] border-white/[0.09]' : 'bg-gray-900 hover:bg-gray-800 text-white'} border font-normal py-6 text-lg`}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </div>
    </Layout>
  )
}

