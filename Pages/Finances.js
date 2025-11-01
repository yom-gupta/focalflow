
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import TimeFilter from "../components/TimeFilter";

const EXPENSE_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Finances() {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "software",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
    initialData: [],
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list("-date"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowForm(false);
      setFormData({ title: "", amount: "", category: "software", date: new Date().toISOString().split('T')[0], notes: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Expense.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowForm(false);
      setEditingExpense(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      amount: parseFloat(formData.amount)
    };
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filterByTime = (items, dateField) => {
    if (timeFilter === 'all') return items;
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    startOfDay.setHours(0, 0, 0, 0); // Set to start of day

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Adjust to Sunday (0)
    startOfWeek.setHours(0, 0, 0, 0); // Set to start of day

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0); // Set to start of day

    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      // Set itemDate to start of its day for consistent comparison
      itemDate.setHours(0, 0, 0, 0); 

      switch(timeFilter) {
        case 'day':
          return itemDate.getTime() === startOfDay.getTime();
        case 'week':
          return itemDate >= startOfWeek;
        case 'month':
          return itemDate >= startOfMonth;
        default:
          return true;
      }
    });
  };

  const filteredProjects = filterByTime(projects, 'created_date');
  const filteredExpenses = filterByTime(expenses, 'date');

  const totalIncome = filteredProjects.filter(p => p.status === 'complete').reduce((sum, p) => sum + (p.price || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const profit = totalIncome - totalExpenses;

  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Finances</h1>
            <p className="text-slate-400">Track your income and expenses</p>
          </div>
          <div className="flex gap-3">
            <TimeFilter activeFilter={timeFilter} onChange={setTimeFilter} />
            <Button
              onClick={() => {
                setEditingExpense(null);
                setFormData({ title: "", amount: "", category: "software", date: new Date().toISOString().split('T')[0], notes: "" });
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl backdrop-blur-xl bg-slate-900/50 border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Income</p>
                <p className="text-2xl font-bold text-white">₹{totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl backdrop-blur-xl bg-slate-900/50 border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold text-white">₹{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl backdrop-blur-xl bg-slate-900/50 border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Net Profit</p>
                <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{profit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="rounded-2xl backdrop-blur-xl bg-slate-900/50 border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingExpense ? 'Edit Expense' : 'New Expense'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Amount (₹)</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                      <SelectItem value="gear">Gear</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="bg-slate-800/50 border-white/10 text-white"
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingExpense(null);
                  }}
                  className="flex-1 bg-slate-800/50 border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
                >
                  {editingExpense ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Expense Breakdown */}
          {pieData.length > 0 && (
            <div className="rounded-2xl backdrop-blur-xl bg-slate-900/50 border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Expense Breakdown</h2>
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
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    formatter={(value) => `₹${value}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Expenses */}
          <div className="rounded-2xl backdrop-blur-xl bg-slate-900/50 border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Expenses</h2>
            <div className="space-y-3">
              {filteredExpenses.slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{expense.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{expense.category}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">₹{expense.amount?.toLocaleString()}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingExpense(expense);
                          setFormData({ 
                            ...expense,
                            date: new Date(expense.date).toISOString().split('T')[0] // Format date for input type="date"
                          });
                          setShowForm(true);
                        }}
                        className="text-slate-400 hover:text-white h-8 w-8"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Delete this expense?')) {
                            deleteMutation.mutate(expense.id);
                          }
                        }}
                        className="text-slate-400 hover:text-red-400 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredExpenses.length === 0 && (
                <p className="text-center text-slate-500 py-4">No expenses found for the selected period.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
