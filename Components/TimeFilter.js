import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";

export default function TimeFilter({ activeFilter, onChange }) {
  const filters = [
    { value: 'day', label: 'Today', icon: Calendar },
    { value: 'week', label: 'This Week', icon: CalendarDays },
    { value: 'month', label: 'This Month', icon: CalendarRange },
    { value: 'all', label: 'All Time', icon: CalendarRange }
  ];

  return (
    <div className="inline-flex rounded-xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-1 shadow-lg">
      {filters.map((filter) => {
        const Icon = filter.icon;
        return (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(filter.value)}
            className={`gap-2 font-medium transition-all duration-200 ${
              activeFilter === filter.value
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden md:inline">{filter.label}</span>
          </Button>
        );
      })}
    </div>
  );
}