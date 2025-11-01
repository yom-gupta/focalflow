import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ProjectForm({ project, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(project || {
    title: "",
    type: "video",
    client_name: "",
    price: "",
    quantity: 1,
    link: "",
    source_link: "",
    notes: "",
    status: "not_started",
    start_date: new Date().toISOString().split('T')[0],
    deadline: "",
    delay_days: 0
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
    initialData: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.quantity) || 1,
      delay_days: parseInt(formData.delay_days) || 0,
    };

    // Initialize workflow steps based on type
    if (formData.type === 'video' && !project) {
      data.video_steps = {
        cuts: false,
        color_grade: false,
        sound_design: false,
        motion_graphics: false,
        export: false
      };
    } else if (formData.type === 'thumbnail' && !project) {
      data.thumbnail_steps = {
        concept: false,
        design: false,
        review: false,
        final: false
      };
    } else if (project) {
      data.video_steps = formData.video_steps;
      data.thumbnail_steps = formData.thumbnail_steps;
    }

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-2xl backdrop-blur-xl bg-[#141419] border border-[#1E1E23] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-zinc-300">Project Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500"
              placeholder="Enter project title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141419] border-[#1E1E23] text-white">
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
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141419] border-[#1E1E23] text-white">
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
            <Label className="text-zinc-300">Select Client</Label>
            <Select
              value={formData.client_name}
              onValueChange={(value) => setFormData({...formData, client_name: value})}
            >
              <SelectTrigger className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500">
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent className="bg-[#141419] border-[#1E1E23] text-white max-h-60">
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.name}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {clients.length === 0 && (
              <p className="text-xs text-amber-400 mt-1">No clients yet. Add a client first!</p>
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
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
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
                onChange={(e) => setFormData({...formData, delay_days: e.target.value})}
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
              className="flex-1 bg-[#0B0B10]/50 border-[#1E1E23] hover:bg-[#0B0B10] font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-medium shadow-lg shadow-indigo-500/30"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (project ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}