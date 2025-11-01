import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, ExternalLink, Trash2, Calendar, Clock, AlertCircle, Link as LinkIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const statusColors = {
  not_started: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  working: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  delay: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  complete: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancel: "bg-red-500/20 text-red-400 border-red-500/30"
};

const typeColors = {
  thumbnail: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  video: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  other: "bg-purple-500/20 text-purple-400 border-purple-500/30"
};

export default function ProjectCard({ project, onEdit }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(project.id);
    }
  };

  const getDaysInProgress = () => {
    if (!project.start_date) return null;
    const start = new Date(project.start_date);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  };

  const getProgress = () => {
    if (project.type === 'video' && project.video_steps) {
      const steps = ['cuts', 'color_grade', 'sound_design', 'motion_graphics', 'export'];
      const completed = steps.filter(step => project.video_steps[step]).length;
      return (completed / steps.length) * 100;
    }
    if (project.type === 'thumbnail' && project.thumbnail_steps) {
      const steps = ['concept', 'design', 'review', 'final'];
      const completed = steps.filter(step => project.thumbnail_steps[step]).length;
      return (completed / steps.length) * 100;
    }
    return project.status === 'complete' ? 100 : project.status === 'working' ? 50 : 0;
  };

  const daysInProgress = getDaysInProgress();
  const progress = getProgress();

  return (
    <div className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10 hover:scale-[1.02] transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">{project.title}</h3>
              <Badge className={`${typeColors[project.type]} border text-xs`}>
                {project.type}
              </Badge>
            </div>
            <p className="text-slate-400 text-sm">{project.client_name}</p>
          </div>
          <Badge className={`${statusColors[project.status]} border`}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Price</span>
            <span className="font-bold text-white">₹{project.price?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Quantity</span>
            <span className="text-white">{project.quantity}</span>
          </div>
          
          {project.start_date && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>Started: {new Date(project.start_date).toLocaleDateString()}</span>
            </div>
          )}
          
          {daysInProgress !== null && (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Clock className="w-4 h-4" />
              <span>{daysInProgress} days in progress</span>
            </div>
          )}
          
          {project.status === 'delay' && project.delay_days > 0 && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>Delayed by {project.delay_days} days</span>
            </div>
          )}
          
          {project.deadline && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Deadline</span>
              <span className="text-white">{new Date(project.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {project.notes && (
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">{project.notes}</p>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(project)}
            className="flex-1 bg-slate-800/50 border-white/10 hover:bg-slate-800 hover:border-purple-500/30"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          {project.source_link && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(project.source_link, '_blank')}
              className="bg-slate-800/50 border-white/10 hover:bg-slate-800 hover:border-blue-500/30 text-blue-400"
              title="Source Files"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          )}
          {project.link && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(project.link, '_blank')}
              className="bg-slate-800/50 border-white/10 hover:bg-slate-800 hover:border-purple-500/30"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="bg-slate-800/50 border-white/10 hover:bg-red-500/20 hover:border-red-500/30 text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}