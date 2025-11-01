import React from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  working: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  delay: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  complete: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancel: "bg-red-500/20 text-red-400 border-red-500/30"
};

export default function RecentProjects({ projects }) {
  return (
    <div className="rounded-2xl backdrop-blur-xl bg-[#141419]/80 border border-[#1E1E23] p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
        <Link 
          to={createPageUrl("Projects")}
          className="group flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="space-y-3">
        {projects.slice(0, 5).map((project) => (
          <div
            key={project.id}
            className="group p-4 rounded-xl bg-[#0B0B10]/50 hover:bg-[#0B0B10]/80 border border-[#1E1E23] hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-white truncate">{project.title}</h3>
                  <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                    {project.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-400 font-medium">
                  <span>{project.client_name}</span>
                  <span>•</span>
                  <span className="font-semibold text-white">₹{project.price?.toLocaleString()}</span>
                </div>
              </div>
              <Badge className={`${statusColors[project.status]} border font-medium`}>
                {project.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}