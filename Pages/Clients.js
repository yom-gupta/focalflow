
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Mail, Phone, Building, Edit, Trash2, Youtube, Instagram } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Clients() {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    youtube_url: "", // New field
    instagram_url: "", // New field
    notes: ""
  });

  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
    initialData: [],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowForm(false);
      setFormData({ name: "", email: "", phone: "", company: "", youtube_url: "", instagram_url: "", notes: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowForm(false);
      setEditingClient(null);
      setFormData({ name: "", email: "", phone: "", company: "", youtube_url: "", instagram_url: "", notes: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData(client);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this client?')) {
      deleteMutation.mutate(id);
    }
  };

  const getClientStats = (clientName) => {
    const clientProjects = projects.filter(p => p.client_name === clientName);
    const totalPaid = clientProjects
      .filter(p => p.status === 'complete')
      .reduce((sum, p) => sum + (p.price || 0), 0);
    return {
      projectCount: clientProjects.length,
      totalPaid
    };
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Clients</h1>
            <p className="text-slate-400">Manage your client relationships</p>
          </div>
          <Button
            onClick={() => {
              setEditingClient(null);
              setFormData({ name: "", email: "", phone: "", company: "", youtube_url: "", instagram_url: "", notes: "" });
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>

        {showForm && (
          <div className="rounded-2xl backdrop-blur-xl bg-slate-900/50 border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingClient ? 'Edit Client' : 'New Client'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Client Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Company</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">YouTube Channel</Label>
                  <Input
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                    placeholder="https://youtube.com/@..."
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Instagram Profile</Label>
                  <Input
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="bg-slate-800/50 border-white/10 text-white"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingClient(null);
                  }}
                  className="flex-1 bg-slate-800/50 border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
                >
                  {editingClient ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => {
            const stats = getClientStats(client.name);
            return (
              <div
                key={client.id}
                className="group rounded-2xl backdrop-blur-xl bg-slate-900/50 border border-white/10 hover:border-purple-500/30 transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                    <span className="text-xl font-bold text-purple-400">
                      {client.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(client)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(client.id)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{client.name}</h3>
                {client.company && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                    <Building className="w-4 h-4" />
                    {client.company}
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </div>
                  )}
                  
                  {/* Social Links */}
                  <div className="flex gap-2 mt-3">
                    {client.youtube_url && (
                      <a
                        href={client.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
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
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                        <span className="text-xs">Instagram</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">Projects</span>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {stats.projectCount}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Total Paid</span>
                    <span className="font-bold text-white">₹{stats.totalPaid.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {clients.length === 0 && (
          <div className="text-center py-12 rounded-2xl backdrop-blur-xl bg-slate-900/50 border border-white/10">
            <p className="text-slate-400">No clients yet. Add your first client to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
