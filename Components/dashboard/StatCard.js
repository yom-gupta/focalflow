import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-6 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 hover:scale-[1.02] transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
            <Icon className="w-5 h-5 text-indigo-400" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        <h3 className="text-zinc-400 text-sm font-medium mb-2 tracking-wide">{title}</h3>
        <p className="text-3xl font-semibold text-white mb-1">{value}</p>
        {subtitle && <p className="text-zinc-500 text-sm font-medium">{subtitle}</p>}
      </div>
    </div>
  );
}