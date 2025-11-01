import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const steps = [
  { key: 'cuts', label: 'Cuts' },
  { key: 'color_grade', label: 'Color Grade' },
  { key: 'sound_design', label: 'Sound Design' },
  { key: 'motion_graphics', label: 'Motion Graphics' },
  { key: 'export', label: 'Export' }
];

export default function VideoProgressTracker({ project }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleStepToggle = (stepKey, checked) => {
    const newSteps = {
      ...project.video_steps,
      [stepKey]: checked
    };
    updateMutation.mutate({
      id: project.id,
      data: { video_steps: newSteps }
    });
  };

  const completedSteps = steps.filter(step => project.video_steps?.[step.key]).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="rounded-2xl backdrop-blur-xl bg-slate-900/50 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Video Progress</h3>
        <span className="text-sm font-medium text-purple-400">{completedSteps}/{steps.length}</span>
      </div>

      <Progress value={progress} className="h-2 mb-6 bg-slate-800" />

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.key}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 transition-colors"
          >
            <Checkbox
              checked={project.video_steps?.[step.key] || false}
              onCheckedChange={(checked) => handleStepToggle(step.key, checked)}
              className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
            />
            <span className={`text-sm ${project.video_steps?.[step.key] ? 'text-white line-through' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}