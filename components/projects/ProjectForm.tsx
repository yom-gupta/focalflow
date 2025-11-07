'use client'

import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getClients } from '@/lib/supabase/queries'
import type { Project } from '@/lib/supabase/types'

interface ProjectFormProps {
  project?: Project | null
  onSubmit: (data: any) => void
  onCancel: () => void
  isSubmitting: boolean
  userId: string | null
}

export default function ProjectForm({ project, onSubmit, onCancel, isSubmitting, userId }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'video' as 'thumbnail' | 'video' | 'other',
    client_name: '',
    price: '',
    quantity: 1,
    link: '',
    source_link: '',
    notes: '',
    status: 'not_started' as 'not_started' | 'working' | 'delay' | 'complete' | 'cancel',
    start_date: new Date().toISOString().split('T')[0],
    deadline: '',
    delay_days: 0
  })

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        type: project.type || 'video',
        client_name: project.client_name || '',
        price: project.price?.toString() || '',
        quantity: project.quantity || 1,
        link: project.link || '',
        source_link: project.source_link || '',
        notes: project.notes || '',
        status: project.status || 'not_started',
        start_date: project.start_date || new Date().toISOString().split('T')[0],
        deadline: project.deadline || '',
        delay_days: project.delay_days || 0
      })
    }
  }, [project])

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', userId],
    queryFn: () => userId ? getClients(userId) : [],
    enabled: !!userId,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: any = {
      title: formData.title,
      type: formData.type,
      client_name: formData.client_name,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.quantity.toString()) || 1,
      delay_days: parseInt(formData.delay_days.toString()) || 0,
      status: formData.status,
      // Convert empty strings to null for optional fields
      link: formData.link?.trim() || null,
      source_link: formData.source_link?.trim() || null,
      notes: formData.notes?.trim() || null,
      start_date: formData.start_date?.trim() || null,
      deadline: formData.deadline?.trim() || null,
    }

    // Initialize workflow steps based on type
    if (formData.type === 'video' && !project) {
      data.video_steps = {
        cuts: false,
        color_grade: false,
        sound_design: false,
        motion_graphics: false,
        export: false
      }
    } else if (formData.type === 'thumbnail' && !project) {
      data.thumbnail_steps = {
        concept: false,
        design: false,
        review: false,
        final: false
      }
    } else if (project) {
      data.video_steps = project.video_steps
      data.thumbnail_steps = project.thumbnail_steps
    }

    onSubmit(data)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-lg bg-[#1f1f1f] border border-white/[0.09] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#ededed] tracking-tight">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-[#a5a5a5] hover:text-[#ededed] hover:bg-[#2e2e2e]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-[#a5a5a5]">Project Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="bg-[#2e2e2e] border-white/[0.09] text-[#ededed] placeholder:text-[#6e6e6e] focus:border-white/[0.15]"
              placeholder="Enter project title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({...formData, type: value as 'thumbnail' | 'video' | 'other'})}
              >
                <SelectTrigger className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thumbnail">Thumbnail</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-zinc-300">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value as 'not_started' | 'working' | 'delay' | 'complete' | 'cancel'})}
              >
                <SelectTrigger className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="working">Working</SelectItem>
                  <SelectItem value="delay">Delay</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="cancel">Cancel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-zinc-300">Client Name</Label>
            <div className="space-y-2">
              {clients.length > 0 && (
                <Select
                  value={formData.client_name}
                  onValueChange={(value) => setFormData({...formData, client_name: value})}
                >
                  <SelectTrigger className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500">
                    <SelectValue placeholder="Quick select from existing clients" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.name}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Input
                value={formData.client_name}
                onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500"
                placeholder={clients.length > 0 ? "Or type client name" : "Enter client name"}
                required 
              />
            </div>
            {clients.length === 0 && (
              <p className="text-xs text-amber-400 mt-1">Tip: Add clients in the Clients page to select them quickly</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Price (₹)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500"
                placeholder="0"
                required
              />
            </div>

            <div>
              <Label className="text-zinc-300">Quantity</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500"
                placeholder="1"
                min="1"
              />
            </div>
          </div>

          <div>
            <Label className="text-zinc-300">Source Link (Files from Client)</Label>
            <Input
              value={formData.source_link}
              onChange={(e) => setFormData({...formData, source_link: e.target.value})}
              className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500"
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div>
            <Label className="text-zinc-300">Project Link (Output)</Label>
            <Input
              value={formData.link}
              onChange={(e) => setFormData({...formData, link: e.target.value})}
              className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500"
              placeholder="https://youtu.be/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500"
              />
            </div>

            <div>
              <Label className="text-zinc-300">Deadline</Label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500"
              />
            </div>
          </div>

          {formData.status === 'delay' && (
            <div>
              <Label className="text-zinc-300">Delay Duration (days)</Label>
              <Input
                type="number"
                value={formData.delay_days}
                onChange={(e) => setFormData({...formData, delay_days: parseInt(e.target.value) || 0})}
                className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500"
                placeholder="0"
                min="0"
              />
            </div>
          )}

          <div>
            <Label className="text-zinc-300">Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500"
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 bg-[#2e2e2e] border-white/[0.09] hover:bg-[#373737] text-[#ededed] font-normal"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#2e2e2e] hover:bg-[#373737] text-[#ededed] border border-white/[0.09] font-normal"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (project ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

