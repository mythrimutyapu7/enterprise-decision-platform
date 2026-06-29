import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiCpu, 
  FiDatabase, 
  FiShield, 
  FiActivity,
  FiTrendingUp, 
  FiPercent, 
  FiSearch, 
  FiTerminal,
  FiZap,
  FiBriefcase
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import Card from '../components/common/Card';

// Dummy dataset tracking daily trends over a 10-day timeline
const DAILY_METRICS_DATA = [
  { date: 'Jun 20', incidents: 12, highSeverity: 3, approvalRate: 88, plannerAccuracy: 91, knowledgeSuccess: 14, memoryReuse: 8, avgConfidence: 91.5, avgResolutionTime: 42 },
  { date: 'Jun 21', incidents: 15, highSeverity: 4, approvalRate: 92, plannerAccuracy: 93, knowledgeSuccess: 18, memoryReuse: 10, avgConfidence: 92.8, avgResolutionTime: 38 },
  { date: 'Jun 22', incidents: 9, highSeverity: 2, approvalRate: 90, plannerAccuracy: 90, knowledgeSuccess: 11, memoryReuse: 6, avgConfidence: 90.2, avgResolutionTime: 45 },
  { date: 'Jun 23', incidents: 18, highSeverity: 7, approvalRate: 94, plannerAccuracy: 95, knowledgeSuccess: 22, memoryReuse: 13, avgConfidence: 94.1, avgResolutionTime: 30 },
  { date: 'Jun 24', incidents: 22, highSeverity: 9, approvalRate: 96, plannerAccuracy: 96, knowledgeSuccess: 27, memoryReuse: 17, avgConfidence: 95.3, avgResolutionTime: 24 },
  { date: 'Jun 25', incidents: 14, highSeverity: 3, approvalRate: 91, plannerAccuracy: 92, knowledgeSuccess: 16, memoryReuse: 11, avgConfidence: 92.0, avgResolutionTime: 35 },
  { date: 'Jun 26', incidents: 16, highSeverity: 5, approvalRate: 93, plannerAccuracy: 94, knowledgeSuccess: 19, memoryReuse: 12, avgConfidence: 93.4, avgResolutionTime: 32 },
  { date: 'Jun 27', incidents: 25, highSeverity: 11, approvalRate: 97, plannerAccuracy: 98, knowledgeSuccess: 31, memoryReuse: 20, avgConfidence: 96.8, avgResolutionTime: 18 },
  { date: 'Jun 28', incidents: 21, highSeverity: 8, approvalRate: 95, plannerAccuracy: 96, knowledgeSuccess: 25, memoryReuse: 16, avgConfidence: 95.0, avgResolutionTime: 22 },
  { date: 'Jun 29', incidents: 19, highSeverity: 6, approvalRate: 94, plannerAccuracy: 95, knowledgeSuccess: 23, memoryReuse: 15, avgConfidence: 94.5, avgResolutionTime: 25 }
];

const CATEGORY_DATA = [
  { name: 'Auth Failures', value: 38 },
  { name: 'Credential Phishing', value: 29 },
  { name: 'Ransomware Payloads', value: 18 },
  { name: 'DDoS Spikes', value: 14 },
  { name: 'Privilege Escalation', value: 8 }
];

const AnalyticsPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.45 }} 
      className="space-y-6 max-w-7xl mx-auto pb-10 text-left"
    >
      {/* Title Header */}
      <div>
        <span className="glass-pill text-[#4f8cff] font-semibold">System Analytics</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">AI Analytics Console</h1>
        <p className="mt-1 text-sm text-slate-400">
          Monitor platform-wide AI performance, classification confidence, knowledge retrievability, and automated remediation triggers.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
        
        {/* KPI 1 */}
        <div className="rounded-[20px] border border-white/10 bg-[#0B1120] p-4.5 shadow-xl flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Total Analyses</span>
            <span className="text-[#4f8cff] bg-[#4f8cff]/10 p-1.5 rounded-lg border border-[#4f8cff]/20">
              <FiActivity className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <h4 className="text-xl font-black text-white font-mono">156</h4>
            <span className="text-[10px] text-green-400 font-bold font-sans">+18% this week</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-[20px] border border-white/10 bg-[#0B1120] p-4.5 shadow-xl flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Avg Confidence</span>
            <span className="text-purple-400 bg-purple-400/10 p-1.5 rounded-lg border border-purple-400/20">
              <FiPercent className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <h4 className="text-xl font-black text-white font-mono">94.2%</h4>
            <span className="text-[10px] text-purple-400 font-bold font-sans">Optimal classification</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-[20px] border border-white/10 bg-[#0B1120] p-4.5 shadow-xl flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Planner Decisions</span>
            <span className="text-indigo-400 bg-indigo-400/10 p-1.5 rounded-lg border border-indigo-400/20">
              <FiCpu className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <h4 className="text-xl font-black text-white font-mono">427</h4>
            <span className="text-[10px] text-indigo-400 font-bold font-sans">Path optimizations</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-[20px] border border-white/10 bg-[#0B1120] p-4.5 shadow-xl flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Threat Matches</span>
            <span className="text-red-400 bg-red-400/10 p-1.5 rounded-lg border border-red-400/20">
              <FiShield className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <h4 className="text-xl font-black text-white font-mono">1,024</h4>
            <span className="text-[10px] text-red-400 font-bold font-sans">IOC signatures blocked</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="rounded-[20px] border border-white/10 bg-[#0B1120] p-4.5 shadow-xl flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Knowledge Hits</span>
            <span className="text-teal-400 bg-teal-400/10 p-1.5 rounded-lg border border-teal-400/20">
              <FiSearch className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <h4 className="text-xl font-black text-white font-mono">682</h4>
            <span className="text-[10px] text-teal-400 font-bold font-sans">RAG retrieval hits</span>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="rounded-[20px] border border-white/10 bg-[#0B1120] p-4.5 shadow-xl flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Memory Hits</span>
            <span className="text-amber-400 bg-amber-400/10 p-1.5 rounded-lg border border-amber-400/20">
              <FiDatabase className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <h4 className="text-xl font-black text-white font-mono">319</h4>
            <span className="text-[10px] text-green-400 font-bold font-sans">93% reuse consensus</span>
          </div>
        </div>

      </div>

      {/* Charts Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">

        {/* Chart 1: Incidents per Day & High Severity Trend (Row 1, span 3) */}
        <div className="lg:col-span-3">
          <Card title="Incidents & High Severity Trend">
            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DAILY_METRICS_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incidentsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f8cff" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f8cff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="severityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <Area type="monotone" name="Total Incidents" dataKey="incidents" stroke="#4f8cff" strokeWidth={2} fillOpacity={1} fill="url(#incidentsGrad)" />
                  <Area type="monotone" name="High Severity" dataKey="highSeverity" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#severityGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Chart 2: Average AI Confidence (Row 1, span 3) */}
        <div className="lg:col-span-3">
          <Card title="Average AI Confidence Trend">
            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DAILY_METRICS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis domain={[80, 100]} stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <Area type="monotone" name="Confidence (%)" dataKey="avgConfidence" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#confidenceGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Chart 3: Knowledge Retrieval & Memory Reuse Success (Row 2, span 3) */}
        <div className="lg:col-span-3">
          <Card title="Knowledge Retrieval & Memory Reuse Success">
            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DAILY_METRICS_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <Bar name="Knowledge Hits" dataKey="knowledgeSuccess" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  <Bar name="Memory Reuse Matches" dataKey="memoryReuse" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Chart 4: Top Incident Categories (Row 2, span 3) */}
        <div className="lg:col-span-3">
          <Card title="Top Incident Categories (Distribution)">
            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={CATEGORY_DATA}
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                >
                  <XAxis type="number" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} width={110} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <Bar name="Count" dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Chart 5: Planner Accuracy & Approval Rate (Row 3, span 3) */}
        <div className="lg:col-span-3">
          <Card title="Planner Accuracy vs Approval Rate">
            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DAILY_METRICS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis domain={[75, 100]} stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <Line type="monotone" name="Planner Accuracy" dataKey="plannerAccuracy" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Approval Rate" dataKey="approvalRate" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Chart 6: Average Resolution Time (Row 3, span 3) */}
        <div className="lg:col-span-3">
          <Card title="Average Resolution Time (Minutes)">
            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DAILY_METRICS_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <Bar name="Duration (min)" dataKey="avgResolutionTime" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

      </div>
    </motion.div>
  );
};

export default AnalyticsPage;
