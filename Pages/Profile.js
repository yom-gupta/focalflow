import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Shield, Edit, Check, X } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: ""
  });

  const queryClient = useQueryClient();

  // Check authentication
  const { data: isAuthenticated, isLoading: authLoading } = useQuery({
    queryKey: ['isAuthenticated'],
    queryFn: () => base44.auth.isAuthenticated(),
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    enabled: isAuthenticated === true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || ""
      });
    }
  }, [user]);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = createPageUrl("Landing");
    }
  }, [isAuthenticated, authLoading]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsEditing(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">Profile</h1>
          <p className="text-zinc-400 font-medium">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-indigo-500/30">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-1">{user?.full_name}</h2>
              <p className="text-zinc-400 mb-2">{user?.email}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm">
                <Shield className="w-4 h-4" />
                <span className="capitalize">{user?.role}</span>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="bg-[#0B0B10]/50 border-white/10 hover:bg-[#0B0B10]"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-zinc-300">Full Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="bg-[#0B0B10]/50 border-[#1E1E23] text-white focus-visible:ring-indigo-500"
                  placeholder="Enter your full name"
                />
              </div>
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-medium shadow-lg shadow-indigo-500/30"
                disabled={updateMutation.isPending}
              >
                <Check className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-[#0B0B10]/50 border border-[#1E1E23]">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm text-zinc-400">Full Name</span>
                </div>
                <p className="text-white font-medium">{user?.full_name || 'Not set'}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#0B0B10]/50 border border-[#1E1E23]">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm text-zinc-400">Email</span>
                </div>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="rounded-2xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Account Actions</h3>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}