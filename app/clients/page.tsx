'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2, Mail, Phone, Building, Youtube, Instagram } from 'lucide-react'
import Layout from '@/components/layout'
import { getClients, createClient, updateClient, deleteClient, getProjects } from '@/lib/supabase/queries'
import { getUser } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useTheme } from '@/contexts/ThemeContext'

export default function Clients() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    youtube_url: '',
    instagram_url: '',
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

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', userId],
    queryFn: () => userId ? getClients(userId) : [],
    enabled: !!userId,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => userId ? getProjects(userId) : [],
    enabled: !!userId,
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setShowForm(false)
      setFormData({ name: '', email: '', phone: '', company: '', youtube_url: '', instagram_url: '', notes: '' })
      toast.success('Client created successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to create client', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setShowForm(false)
      setEditingClient(null)
      toast.success('Client updated successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to update client', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client deleted successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to delete client', {
        description: error?.message || 'Please try again'
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: any = {
      name: formData.name,
      email: formData.email?.trim() || null,
      phone: formData.phone?.trim() || null,
      company: formData.company?.trim() || null,
      youtube_url: formData.youtube_url?.trim() || null,
      instagram_url: formData.instagram_url?.trim() || null,
      notes: formData.notes?.trim() || null,
    }
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const getClientStats = (clientName: string) => {
    const clientProjects = projects.filter(p => p.client_name === clientName)
    const totalPaid = clientProjects
      .filter(p => p.status === 'complete')
      .reduce((sum, p) => sum + (p.price || 0), 0)
    return {
      projectCount: clientProjects.length,
      totalPaid
    }
  }

  if (!userId) return <Layout><div className="p-8">Loading...</div></Layout>

  return (
    <Layout>
      <div className="min-h-screen p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'} mb-1 tracking-tight`}>Clients</h1>
              <p className={`${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'} font-normal text-sm`}>Manage your client relationships</p>
            </div>
            <Button
              onClick={() => {
                setEditingClient(null)
                setFormData({ name: '', email: '', phone: '', company: '', youtube_url: '', instagram_url: '', notes: '' })
                setShowForm(true)
              }}
              className={`${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-900 hover:bg-gray-800 text-white'} border border-border font-normal`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </div>

          {showForm && (
            <div className={`rounded-lg ${isDark ? 'bg-[#1f1f1f] border-white/[0.09]' : 'bg-white border-gray-200'} border p-6`}>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'} mb-4`}>
                {editingClient ? 'Edit Client' : 'New Client'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Client Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                      required
                    />
                  </div>
                  <div>
                    <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                    />
                  </div>
                  <div>
                    <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                    />
                  </div>
                  <div>
                    <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Company</Label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                    />
                  </div>
                  <div>
                    <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>YouTube Channel</Label>
                    <Input
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                      className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                      placeholder="https://youtube.com/@..."
                    />
                  </div>
                  <div>
                    <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Instagram Profile</Label>
                    <Input
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                      className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
                <div>
                  <Label className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className={isDark ? 'bg-[#2e2e2e] border-white/[0.09] text-[#ededed]' : 'bg-gray-50 border-gray-200 text-[#37352f]'}
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingClient(null)
                    }}
                    className={`flex-1 ${isDark ? 'bg-[#2e2e2e] border-white/[0.09] hover:bg-[#373737] text-[#ededed]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-[#37352f]'} font-normal`}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className={`flex-1 ${isDark ? 'bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed] border-white/[0.09]' : 'bg-gray-900 hover:bg-gray-800 text-white'} font-normal`}
                  >
                    {editingClient ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => {
              const stats = getClientStats(client.name)
              return (
                <div
                  key={client.id}
                  className={`group rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border hover:border-accent transition-all p-6`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-[#37352f]' : 'bg-gray-200'} flex items-center justify-center`}>
                      <span className={`text-xl font-bold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>
                        {client.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingClient(client)
                          setFormData({
                            name: client.name,
                            email: client.email || '',
                            phone: client.phone || '',
                            company: client.company || '',
                            youtube_url: client.youtube_url || '',
                            instagram_url: client.instagram_url || '',
                            notes: client.notes || ''
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
                          if (confirm('Are you sure you want to delete this client?')) {
                            deleteMutation.mutate(client.id)
                          }
                        }}
                        className={isDark ? 'text-[#a5a5a5] hover:text-red-400 hover:bg-red-500/10' : 'text-[#787774] hover:text-red-600 hover:bg-red-50'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className={`text-xl font-semibold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'} mb-1`}>{client.name}</h3>
                  {client.company && (
                    <div className={`flex items-center gap-2 text-sm mb-3 ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
                      <Building className="w-4 h-4" />
                      {client.company}
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {client.email && (
                      <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}`}>
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3">
                      {client.youtube_url && (
                        <a
                          href={client.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Youtube className="w-4 h-4" />
                          <span className="text-xs">YouTube</span>
                        </a>
                      )}
                      {client.instagram_url && (
                        <a
                          href={client.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-pink-50 border border-pink-200 text-pink-600 hover:bg-pink-100 transition-colors"
                        >
                          <Instagram className="w-4 h-4" />
                          <span className="text-xs">Instagram</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className={`pt-4 ${isDark ? 'border-t border-white/[0.09]' : 'border-t border-gray-200'}`}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Projects</span>
                      <Badge className={isDark ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200'}>
                        {stats.projectCount}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>Total Paid</span>
                      <span className={`font-bold ${isDark ? 'text-[#ededed]' : 'text-[#37352f]'}`}>₹{stats.totalPaid.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {clients.length === 0 && (
            <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-[#2e2e2e] border-white/[0.09]' : 'bg-white border-gray-200'} border`}>
              <p className={isDark ? 'text-[#a5a5a5]' : 'text-[#787774]'}>No clients yet. Add your first client to get started!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

