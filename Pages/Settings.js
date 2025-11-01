import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, DollarSign, Palette, Workflow, Plus, Trash2 } from "lucide-react";

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [themeAccent, setThemeAccent] = useState('indigo');
  const [videoWorkflow, setVideoWorkflow] = useState(['Cuts', 'Color Grade', 'Sound Design', 'Motion Graphics', 'Export']);
  const [thumbnailWorkflow, setThumbnailWorkflow] = useState(['Concept', 'Design', 'Review', 'Final']);
  const [newVideoStep, setNewVideoStep] = useState('');
  const [newThumbnailStep, setNewThumbnailStep] = useState('');

  useEffect(() => {
    if (user) {
      setCurrency(user.currency || 'INR');
      setCurrencySymbol(user.currency_symbol || '₹');
      setExchangeRate(user.exchange_rate || 1);
      setThemeAccent(user.theme_accent || 'indigo');
      setVideoWorkflow(user.video_workflow || ['Cuts', 'Color Grade', 'Sound Design', 'Motion Graphics', 'Export']);
      setThumbnailWorkflow(user.thumbnail_workflow || ['Concept', 'Design', 'Review', 'Final']);
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const handleSaveSettings = () => {
    updateMutation.mutate({
      currency,
      currency_symbol: currencySymbol,
      exchange_rate: parseFloat(exchangeRate),
      theme_accent: themeAccent,
      video_workflow: videoWorkflow,
      thumbnail_workflow: thumbnailWorkflow
    });
  };

  const addVideoStep = () => {
    if (newVideoStep.trim()) {
      setVideoWorkflow([...videoWorkflow, newVideoStep.trim()]);
      setNewVideoStep('');
    }
  };

  const removeVideoStep = (index) => {
    setVideoWorkflow(videoWorkflow.filter((_, i) => i !== index));
  };

  const addThumbnailStep = () => {
    if (newThumbnailStep.trim()) {
      setThumbnailWorkflow([...thumbnailWorkflow, newThumbnailStep.trim()]);
      setNewThumbnailStep('');
    }
  };

  const removeThumbnailStep = (index) => {
    setThumbnailWorkflow(thumbnailWorkflow.filter((_, i) => i !== index));
  };

  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">Settings</h1>
          <p className="text-zinc-400 font-medium">Customize your FreelanceHub experience</p>
        </div>

        {/* Currency Settings */}
        <div className="rounded-2xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
              <DollarSign className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Currency Settings</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Currency</Label>
              <Select value={currency} onValueChange={(value) => {
                setCurrency(value);
                const curr = currencies.find(c => c.code === value);
                if (curr) setCurrencySymbol(curr.symbol);
              }}>
                <SelectTrigger className="bg-[#0B0B10]/50 border-[#1E1E23] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141419] border-[#1E1E23] text-white">
                  {currencies.map(curr => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.name} ({curr.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-zinc-300">Exchange Rate from INR</Label>
              <Input
                type="number"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="bg-[#0B0B10]/50 border-[#1E1E23] text-white"
                placeholder="1.00"
              />
              <p className="text-xs text-zinc-500 mt-1">1 INR = {exchangeRate} {currency}</p>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="rounded-2xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <Palette className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Theme</h2>
          </div>

          <div>
            <Label className="text-zinc-300 mb-3 block">Accent Color</Label>
            <div className="grid grid-cols-5 gap-3">
              {['indigo', 'blue', 'purple', 'pink', 'green'].map((color) => (
                <button
                  key={color}
                  onClick={() => setThemeAccent(color)}
                  className={`h-12 rounded-xl transition-all ${
                    themeAccent === color 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#141419] scale-105' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: color === 'indigo' ? '#6366F1' :
                               color === 'blue' ? '#3B82F6' :
                               color === 'purple' ? '#A855F7' :
                               color === 'pink' ? '#EC4899' : '#10B981'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Video Workflow Settings */}
        <div className="rounded-2xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Workflow className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Video Editing Workflow</h2>
          </div>

          <div className="space-y-3 mb-4">
            {videoWorkflow.map((step, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-[#0B0B10]/50 border border-[#1E1E23]">
                <span className="text-white">{index + 1}. {step}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVideoStep(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newVideoStep}
              onChange={(e) => setNewVideoStep(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addVideoStep()}
              className="bg-[#0B0B10]/50 border-[#1E1E23] text-white"
              placeholder="Add new step..."
            />
            <Button
              onClick={addVideoStep}
              className="bg-gradient-to-r from-indigo-500 to-purple-500"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Thumbnail Workflow Settings */}
        <div className="rounded-2xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-pink-500/20 border border-pink-500/30">
              <Workflow className="w-5 h-5 text-pink-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Thumbnail Design Workflow</h2>
          </div>

          <div className="space-y-3 mb-4">
            {thumbnailWorkflow.map((step, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-[#0B0B10]/50 border border-[#1E1E23]">
                <span className="text-white">{index + 1}. {step}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeThumbnailStep(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newThumbnailStep}
              onChange={(e) => setNewThumbnailStep(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addThumbnailStep()}
              className="bg-[#0B0B10]/50 border-[#1E1E23] text-white"
              placeholder="Add new step..."
            />
            <Button
              onClick={addThumbnailStep}
              className="bg-gradient-to-r from-indigo-500 to-purple-500"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSaveSettings}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-medium shadow-lg shadow-indigo-500/30 py-6 text-lg"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}