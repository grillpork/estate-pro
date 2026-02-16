"use client";
import { useEffect, useState } from "react";
import { getAllReports } from "@/services/admin/report";
import { ArrowRight, MessageCircleWarning } from "lucide-react";

const AnalysisReportsList = () => {
  const [reports, setReports] = useState<any[]>([]);
  useEffect(() => {
    getAllReports().then((data) => {
      setReports(data);
    });
  }, []);
  return (
    <>
      {reports.map((report) => (
        <div
          key={report.id}
          className="group flex items-center justify-between p-4 rounded-xl bg-[#202024] hover:bg-[#27272A] border border-transparent hover:border-[#3F3F46] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <MessageCircleWarning className="text-red-500" size={24} />
            <div>
              <h4 className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                {report.title}
              </h4>
              <p className="text-xs text-neutral-400">{report.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-neutral-500 font-mono">
              {new Date(report.createdAt).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              {report.user.email}
            </span>
          </div>
        </div>
      ))}
    </>
  );
};

export default AnalysisReportsList;
