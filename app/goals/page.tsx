'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Target, Edit, Trash2, TrendingUp } from 'lucide-react'
import Layout from '@/components/layout'
import { Progress } from '@/components/ui/progress'
import { getGoals, createGoal, updateGoal, deleteGoal, getProjects, getExpenses } from '@/lib/supabase/queries'
import { getUser } from '@/lib/auth'
import { toast } from 'sonner'
import { useTheme } from '@/contexts/ThemeContext'

export default function Goals() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    deadline: ''
  })
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    getUser().then((user) => {
      if (!user) {
        router.push('/')
      } else {
        setUserId(user.id)
      }
    })
  }, [router])

  const { data: goals = [] } = useQuery({
    queryKey: ['goals', userId],
    queryFn: () => userId ? getGoals(userId) : [],
    enabled: !!userId,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => userId ? getProjects(userId) : [],
    enabled: !!userId,
  })

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', userId],
    queryFn: () => userId ? getExpenses(userId) : [],
    enabled: !!userId,
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      setShowForm(false)
      setFormData({ title: '', target_amount: '', deadline: '' })
      toast.success('Goal created successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to create goal', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Goal updated successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to update goal', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Goal deleted successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to delete goal', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      title: formData.title,
      target_amount: parseFloat(formData.target_amount),
      deadline: formData.deadline?.trim() || null,
    }
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data: { ...data, current_amount: editingGoal.current_amount } })
    } else {
      createMutation.mutate(data)
    }
    setShowForm(false)
    setEditingGoal(null)
  }

  const handleUpdateProgress = (goal: any, amount: string) => {
    const newAmount = parseFloat(amount)
    if (isNaN(newAmount) || newAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    updateMutation.mutate({
      id: goal.id,
      data: { current_amount: (goal.current_amount || 0) + newAmount }
    })
    toast.success(`Added ₹${newAmount.toLocaleString()} to goal`)
  }

  const totalIncome = projects.filter(p => p.status === 'complete').reduce((sum, p) => sum + (p.price || 0), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const currentSavings = totalIncome - totalExpenses

  if (!userId) return <Layout><div className="p-8">Loading...</div></Layout>

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'} mb-1 tracking-tight`}>Goals</h1>
              <p className={`${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'} font-normal text-sm`}>Track your savings and financial goals</p>
            </div>
            <Button
              onClick={() => {
                setEditingGoal(null)
                setFormData({ title: '', target_amount: '', deadline: '' })
                setShowForm(true)
              }}
              className={`${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-900 hover:bg-gray-800 text-white'} border border-border font-normal`}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </div>

          {/* Current Savings */}
          <div className={`rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border p-8`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-gray-100 border-gray-200'} border`}>
                <TrendingUp className={`w-6 h-6 ${isDark ? 'text-[#4fc3f7]' : 'text-[#6366f1]'}`} />
              </div>
              <div>
                <p className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Current Savings</p>
                <p className={`text-4xl font-bold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>₹{currentSavings.toLocaleString()}</p>
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
              Available for your goals after expenses
            </p>
          </div>

          {showForm && (
            <div className={`rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6`}>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'} mb-4`}>
                {editingGoal ? 'Edit Goal' : 'New Goal'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Goal Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                    placeholder="e.g., iPhone 15 Pro"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Target Amount (₹)</Label>
                    <Input
                      type="number"
                      value={formData.target_amount}
                      onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                      className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                      required
                    />
                  </div>
                  <div>
                    <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Deadline</Label>
                    <Input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                      className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingGoal(null)
                    }}
                    className={`flex-1 ${isDark ? 'bg-[#2e2e2e] border-white/[0.09] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-[#37352f]'} font-normal`}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className={`flex-1 ${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed] border-white/[0.09]' : 'bg-gray-900 hover:bg-gray-800 text-white'} font-normal`}
                  >
                    {editingGoal ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Goals Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const progress = ((goal.current_amount || 0) / goal.target_amount) * 100
              const remaining = goal.target_amount - (goal.current_amount || 0)
              const daysRemaining = goal.deadline 
                ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : null

              return (
                <div
                  key={goal.id}
                  className={`rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6 hover:border-accent transition-all`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-gray-100 border-gray-200'} border flex items-center justify-center`}>
                        <Target className={`w-6 h-6 ${isDark ? 'text-[#4fc3f7]' : 'text-[#6366f1]'}`} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>{goal.title}</h3>
                        {daysRemaining !== null && (
                          <p className={`text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
                            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Deadline passed'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingGoal(goal)
                          setFormData({
                            title: goal.title,
                            target_amount: goal.target_amount.toString(),
                            deadline: goal.deadline || ''
                          })
                          setShowForm(true)
                        }}
                        className={isDark ? 'text-[#a5a5a5] hover:text-[#ededed] hover:bg-[#2e2e2e]' : 'text-[#787774] hover:text-[#37352f] hover:bg-gray-100'}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Delete this goal?')) {
                            deleteMutation.mutate(goal.id)
                          }
                        }}
                        className={isDark ? 'text-[#a5a5a5] hover:text-red-400 hover:bg-red-500/10' : 'text-[#787774] hover:text-red-600 hover:bg-red-50'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Progress</span>
                      <span className={`font-medium ${isDark ? 'text-[#4fc3f7]' : 'text-[#6366f1]'}`}>{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-2xl font-bold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>₹{(goal.current_amount || 0).toLocaleString()}</p>
                        <p className={`text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>of ₹{goal.target_amount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-medium ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>₹{remaining.toLocaleString()}</p>
                        <p className={`text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>remaining</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Add amount"
                      className={`flex-1 ${isDark ? 'bg-[#1f1f1f] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                          handleUpdateProgress(goal, (e.target as HTMLInputElement).value)
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }}
                    />
                    <Button
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).closest('div')?.querySelector('input') as HTMLInputElement
                        if (input?.value) {
                          handleUpdateProgress(goal, input.value)
                          input.value = ''
                        }
                      }}
                      className={`${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed] border-white/[0.09]' : 'bg-gray-900 hover:bg-gray-800 text-white'} font-normal`}
                    >
                      Add
                    </Button>
                  </div>

                  {totalExpenses > 0 && (
                    <div className={`mt-4 pt-4 ${isDark ? 'border-t border-white/[0.09]' : 'border-t border-gray-200'}`}>
                      <p className={`text-xs mb-2 ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>💡 If you cut expenses by 20%:</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-[#4fc3f7]' : 'text-[#6366f1]'}`}>
                        You'd save ₹{(totalExpenses * 0.2).toLocaleString()} more
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {goals.length === 0 && (
            <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border`}>
              <Target className={`w-16 h-16 ${isDark ? 'text-[#6e6e6e]' : 'text-gray-400'} mx-auto mb-4`} />
              <p className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>No goals yet. Set your first financial goal!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

