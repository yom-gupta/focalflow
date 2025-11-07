'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2 } from 'lucide-react'
import Layout from '@/components/layout'
import TimeFilter from '@/components/TimeFilter'
import { getExpenses, createExpense, updateExpense, deleteExpense, getProjects } from '@/lib/supabase/queries'
import { getUser } from '@/lib/auth'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { toast } from 'sonner'
import { useTheme } from '@/contexts/ThemeContext'

const EXPENSE_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function Finances() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [timeFilter, setTimeFilter] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'software',
    date: new Date().toISOString().split('T')[0],
    notes: ''
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
    mutationFn: (data: any) => createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowForm(false)
      setFormData({ title: '', amount: '', category: 'software', date: new Date().toISOString().split('T')[0], notes: '' })
      toast.success('Expense created successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to create expense', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setShowForm(false)
      setEditingExpense(null)
      toast.success('Expense updated successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to update expense', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Expense deleted successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to delete expense', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      notes: formData.notes?.trim() || null,
    }
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const filterByTime = (items: any[], dateField: string) => {
    if (timeFilter === 'all') return items
    
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return items.filter(item => {
      const itemDate = new Date(item[dateField])
      switch(timeFilter) {
        case 'day':
          return itemDate >= startOfDay
        case 'week':
          return itemDate >= startOfWeek
        case 'month':
          return itemDate >= startOfMonth
        default:
          return true
      }
    })
  }

  const filteredProjects = filterByTime(projects, 'created_at')
  const filteredExpenses = filterByTime(expenses, 'date')

  const totalIncome = filteredProjects.filter(p => p.status === 'complete').reduce((sum, p) => sum + (p.price || 0), 0)
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const profit = totalIncome - totalExpenses

  const expensesByCategory = filteredExpenses.reduce((acc: Record<string, number>, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {})

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }))

  if (!userId) return <Layout><div className="p-8">Loading...</div></Layout>

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'} mb-1 tracking-tight`}>Finances</h1>
              <p className={`${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'} font-normal text-sm`}>Track your income and expenses</p>
            </div>
            <div className="flex gap-3">
              <TimeFilter activeFilter={timeFilter} onChange={setTimeFilter} />
              <Button
                onClick={() => {
                  setEditingExpense(null)
                  setFormData({ title: '', amount: '', category: 'software', date: new Date().toISOString().split('T')[0], notes: '' })
                  setShowForm(true)
                }}
                className={`${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-900 hover:bg-gray-800 text-white'} border border-border font-normal`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className={`rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-gray-100 border-gray-200'} border`}>
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className={`${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'} text-sm`}>Total Income</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>₹{totalIncome.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className={`rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-gray-100 border-gray-200'} border`}>
                  <TrendingDown className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className={`${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'} text-sm`}>Total Expenses</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>₹{totalExpenses.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className={`rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-gray-100 border-gray-200'} border`}>
                  <DollarSign className={`w-6 h-6 ${isDark ? 'text-[#4fc3f7]' : 'text-[#6366f1]'}`} />
                </div>
                <div>
                  <p className={`${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'} text-sm`}>Net Profit</p>
                  <p className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    ₹{profit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {showForm && (
            <div className={`rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6`}>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'} mb-4`}>
                {editingExpense ? 'Edit Expense' : 'New Expense'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                      required
                    />
                  </div>
                  <div>
                    <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Amount (₹)</Label>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                      required
                    />
                  </div>
                  <div>
                    <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gear">Gear</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                    rows={2}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingExpense(null)
                    }}
                    className={`flex-1 ${isDark ? 'bg-[#2e2e2e] border-white/[0.09] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-[#37352f]'} font-normal`}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className={`flex-1 ${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed] border-white/[0.09]' : 'bg-gray-900 hover:bg-gray-800 text-white'} font-normal`}
                  >
                    {editingExpense ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {pieData.length > 0 && (
              <div className={`rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'} mb-4`}>Expense Breakdown</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? 'rgba(31, 31, 31, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
                        borderRadius: '12px',
                        color: isDark ? '#ededed' : '#37352f',
                        backdropFilter: 'blur(12px)',
                      }}
                      formatter={(value) => `₹${value}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className={`rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6`}>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'} mb-4`}>Recent Expenses</h2>
              <div className="space-y-3">
                {filteredExpenses.slice(0, 5).map((expense) => (
                  <div
                    key={expense.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09] hover:bg-[#2e2e2e]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} border transition-colors`}
                  >
                    <div className="flex-1">
                      <h3 className={`font-medium ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>{expense.title}</h3>
                      <div className={`flex items-center gap-2 mt-1 ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
                        <span className="text-xs">{expense.category}</span>
                        <span className="text-xs">•</span>
                        <span className="text-xs">{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>₹{expense.amount?.toLocaleString()}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingExpense(expense)
                            setFormData({ 
                              ...expense,
                              date: new Date(expense.date).toISOString().split('T')[0]
                            })
                            setShowForm(true)
                          }}
                          className={isDark ? 'text-[#a5a5a5] hover:text-[#ededed] hover:bg-[#2e2e2e] h-8 w-8' : 'text-[#787774] hover:text-[#37352f] hover:bg-gray-100 h-8 w-8'}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Delete this expense?')) {
                              deleteMutation.mutate(expense.id)
                            }
                          }}
                          className={isDark ? 'text-[#a5a5a5] hover:text-red-400 hover:bg-red-500/10 h-8 w-8' : 'text-[#787774] hover:text-red-600 hover:bg-red-50 h-8 w-8'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredExpenses.length === 0 && (
                  <p className={`text-center py-4 ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>No expenses found for the selected period.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

