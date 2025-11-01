import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Target, Edit, Trash2, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    target_amount: "",
    deadline: ""
  });

  const queryClient = useQueryClient();

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list(),
    initialData: [],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
    initialData: [],
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowForm(false);
      setFormData({ title: "", target_amount: "", deadline: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      current_amount: 0
    };
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data: { ...data, current_amount: editingGoal.current_amount } });
    } else {
      createMutation.mutate(data);
    }
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleUpdateProgress = (goal, amount) => {
    updateMutation.mutate({
      id: goal.id,
      data: { current_amount: (goal.current_amount || 0) + parseFloat(amount) }
    });
  };

  const totalIncome = projects.filter(p => p.status === 'complete').reduce((sum, p) => sum + (p.price || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const currentSavings = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Goals</h1>
            <p className="text-slate-400">Track your savings and financial goals</p>
          </div>
          <Button
            onClick={() => {
              setEditingGoal(null);
              setFormData({ title: "", target_amount: "", deadline: "" });
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>

        {/* Current Savings */}
        <div className="rounded-2xl backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400">Current Savings</p>
              <p className="text-4xl font-bold text-white">₹{currentSavings.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Available for your goals after expenses
          </p>
        </div>

        {showForm && (
          <div className="rounded-2xl backdrop-blur-xl bg-slate-900/50 border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingGoal ? 'Edit Goal' : 'New Goal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-slate-300">Goal Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="bg-slate-800/50 border-white/10 text-white"
                  placeholder="e.g., iPhone 15 Pro"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Target Amount (₹)</Label>
                  <Input
                    type="number"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Deadline</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingGoal(null);
                  }}
                  className="flex-1 bg-slate-800/50 border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
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
            const progress = ((goal.current_amount || 0) / goal.target_amount) * 100;
            const remaining = goal.target_amount - (goal.current_amount || 0);
            const daysRemaining = goal.deadline 
              ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div
                key={goal.id}
                className="rounded-2xl backdrop-blur-xl bg-slate-900/50 border border-white/10 p-6 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Target className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{goal.title}</h3>
                      {daysRemaining !== null && (
                        <p className="text-sm text-slate-400">
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
                        setEditingGoal(goal);
                        setFormData({
                          title: goal.title,
                          target_amount: goal.target_amount,
                          deadline: goal.deadline || ""
                        });
                        setShowForm(true);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this goal?')) {
                          deleteMutation.mutate(goal.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-medium text-purple-400">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-slate-800" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">₹{(goal.current_amount || 0).toLocaleString()}</p>
                      <p className="text-sm text-slate-400">of ₹{goal.target_amount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-slate-300">₹{remaining.toLocaleString()}</p>
                      <p className="text-sm text-slate-400">remaining</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Add amount"
                    className="flex-1 bg-slate-800/50 border-white/10 text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        handleUpdateProgress(goal, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <Button
                    onClick={(e) => {
                      const input = e.target.closest('div').querySelector('input');
                      if (input.value) {
                        handleUpdateProgress(goal, input.value);
                        input.value = '';
                      }
                    }}
                    className="bg-gradient-to-r from-purple-500 to-blue-500"
                  >
                    Add
                  </Button>
                </div>

                {/* What-if Calculator */}
                {totalExpenses > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-slate-400 mb-2">💡 If you cut expenses by 20%:</p>
                    <p className="text-sm text-purple-400 font-medium">
                      You'd save ₹{(totalExpenses * 0.2).toLocaleString()} more
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {goals.length === 0 && (
          <div className="text-center py-12 rounded-2xl backdrop-blur-xl bg-slate-900/50 border border-white/10">
            <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No goals yet. Set your first financial goal!</p>
          </div>
        )}
      </div>
    </div>
  );
}