import React, { useState, useMemo } from 'react';
import { Trophy, MapPin, Star, ArrowUp, ArrowDown, Minus, TrendingUp, AlertTriangle, Shield, BarChart3, CheckCircle2, Users } from 'lucide-react';
import { AUTHORITY_BUSINESS_PERFORMANCE_DATA } from '../../data/ecosystemData';

export function AuthorityPerformance() {
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'excellent' | 'good' | 'warning' | 'critical'>('all');

  const filteredPerformance = useMemo(() => {
    if (performanceFilter === 'all') return AUTHORITY_BUSINESS_PERFORMANCE_DATA;
    return AUTHORITY_BUSINESS_PERFORMANCE_DATA.filter(b => b.performanceStatus === performanceFilter);
  }, [performanceFilter]);

  const topPerformer = useMemo(() => {
    return [...AUTHORITY_BUSINESS_PERFORMANCE_DATA].sort((a, b) => b.qualityScore - a.qualityScore)[0];
  }, []);

  const mostComplained = useMemo(() => {
    return [...AUTHORITY_BUSINESS_PERFORMANCE_DATA].sort((a, b) => b.totalComplaints - a.totalComplaints)[0];
  }, []);

  const avgResolutionRate = useMemo(() => {
    const total = AUTHORITY_BUSINESS_PERFORMANCE_DATA.reduce((acc, b) => acc + (b.totalComplaints > 0 ? (b.resolvedComplaints / b.totalComplaints) * 100 : 100), 0);
    return Math.round(total / AUTHORITY_BUSINESS_PERFORMANCE_DATA.length);
  }, []);

  return <>
      {/* BUSINESS PERFORMANCE & COMPLAINTS BOARD */}
      {(
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Top Performer */}
            <div className="bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] rounded-3xl p-5 border border-[#A7F3D0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#065F46]">Top Performer</span>
                <div className="p-2 rounded-xl bg-white/80 text-[#059669]">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-sm font-extrabold text-[#064E3B] truncate">{topPerformer.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#047857]">
                <span className="inline-flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                  {topPerformer.rating}
                </span>
                <span>•</span>
                <span>Quality: {topPerformer.qualityScore}/100</span>
              </div>
              <div className="text-[10px] text-[#065F46] mt-1 font-semibold">{topPerformer.category} • {topPerformer.city}</div>
            </div>

            {/* Most Complained */}
            <div className="bg-gradient-to-br from-[#FEF2F2] to-[#FEE2E2] rounded-3xl p-5 border border-[#FCA5A5]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#991B1B]">Most Complaints</span>
                <div className="p-2 rounded-xl bg-white/80 text-[#DC2626]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-sm font-extrabold text-[#7F1D1D] truncate">{mostComplained.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#991B1B]">
                <span>{mostComplained.totalComplaints} total complaints</span>
                <span>•</span>
                <span className="font-bold text-[#DC2626]">{mostComplained.pendingComplaints} pending</span>
              </div>
              <div className="text-[10px] text-[#991B1B] mt-1 font-semibold">{mostComplained.category} • {mostComplained.city}</div>
            </div>

            {/* Resolution Rate */}
            <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-3xl p-5 border border-[#93C5FD]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E40AF]">Avg Resolution Rate</span>
                <div className="p-2 rounded-xl bg-white/80 text-[#2563EB]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-[#1E3A8A]">{avgResolutionRate}%</div>
              <div className="text-xs text-[#1E40AF] mt-1">
                Across {AUTHORITY_BUSINESS_PERFORMANCE_DATA.length} monitored businesses
              </div>
              <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${avgResolutionRate >= 80 ? 'bg-[#059669]' : avgResolutionRate >= 60 ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'}`}
                  style={{ width: `${avgResolutionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Performance Board */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0ECE4]">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#991B1B]">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Business Performance & Complaints Board</span>
                </div>
                <h2 className="text-lg font-extrabold text-[#191715]">Which Businesses Are Performing Well & Who Has Most Complaints</h2>
                <p className="text-xs text-[#665E55]">Monitoring across all registered tourism businesses — auto-updated from tourist feedback, complaint resolution, and compliance audits.</p>
              </div>
              <div className="text-xs font-semibold text-[#665E55]">
                {filteredPerformance.length} businesses
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {([
                { key: 'all', label: 'All', color: 'bg-[#191715] text-white' },
                { key: 'excellent', label: '🟢 Excellent', color: 'bg-[#059669] text-white' },
                { key: 'good', label: '🔵 Good', color: 'bg-[#2563EB] text-white' },
                { key: 'warning', label: '🟡 Warning', color: 'bg-[#D97706] text-white' },
                { key: 'critical', label: '🔴 Critical', color: 'bg-[#DC2626] text-white' },
              ] as const).map(f => (
                <button
                  key={f.key}
                  onClick={() => setPerformanceFilter(f.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    performanceFilter === f.key
                      ? f.color
                      : 'bg-[#FAF8F5] text-[#665E55] hover:bg-[#EFEAE1]'
                  }`}
                >
                  {f.label} ({AUTHORITY_BUSINESS_PERFORMANCE_DATA.filter(b => f.key === 'all' ? true : b.performanceStatus === f.key).length})
                </button>
              ))}
            </div>

            {/* Performance Cards */}
            <div className="space-y-2">
              {filteredPerformance.map(biz => {
                const statusConfig = {
                  excellent: { bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', text: 'text-[#065F46]', badge: 'bg-[#059669] text-white', label: 'Excellent' },
                  good: { bg: 'bg-[#EFF6FF]', border: 'border-[#BFDBFE]', text: 'text-[#1E40AF]', badge: 'bg-[#2563EB] text-white', label: 'Good' },
                  warning: { bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', text: 'text-[#92400E]', badge: 'bg-[#D97706] text-white', label: 'Warning' },
                  critical: { bg: 'bg-[#FEF2F2]', border: 'border-[#FCA5A5]', text: 'text-[#991B1B]', badge: 'bg-[#DC2626] text-white', label: 'Critical' },
                }[biz.performanceStatus];

                const resolutionRate = biz.totalComplaints > 0
                  ? Math.round((biz.resolvedComplaints / biz.totalComplaints) * 100)
                  : 100;

                return (
                  <div
                    key={biz.id}
                    className={`p-4 rounded-2xl border ${statusConfig.bg} ${statusConfig.border} transition-all`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Business Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-extrabold text-[#191715] truncate">{biz.name}</h3>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${statusConfig.badge}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#665E55]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#BE123C]" />
                            {biz.city}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-white/70 border border-[#EAE5DC] text-[10px] font-bold">
                            {biz.category}
                          </span>
                          <span className="inline-flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                            <span className="font-bold text-[#191715]">{biz.rating}</span>
                          </span>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                        {/* Quality Score */}
                        <div className="text-center">
                          <div className={`text-lg font-black ${
                            biz.qualityScore >= 80 ? 'text-[#059669]' : biz.qualityScore >= 50 ? 'text-[#D97706]' : 'text-[#DC2626]'
                          }`}>
                            {biz.qualityScore}
                          </div>
                          <div className="text-[9px] font-bold uppercase text-[#665E55]">Quality</div>
                        </div>

                        {/* Complaints */}
                        <div className="text-center">
                          <div className="text-lg font-black text-[#191715]">{biz.totalComplaints}</div>
                          <div className="text-[9px] font-bold uppercase text-[#665E55]">Complaints</div>
                        </div>

                        {/* Pending */}
                        <div className="text-center">
                          <div className={`text-lg font-black ${biz.pendingComplaints > 5 ? 'text-[#DC2626]' : biz.pendingComplaints > 0 ? 'text-[#D97706]' : 'text-[#059669]'}`}>
                            {biz.pendingComplaints}
                          </div>
                          <div className="text-[9px] font-bold uppercase text-[#665E55]">Pending</div>
                        </div>

                        {/* Resolution Rate */}
                        <div className="hidden sm:block w-16">
                          <div className={`text-xs font-extrabold text-right ${
                            resolutionRate >= 80 ? 'text-[#059669]' : resolutionRate >= 50 ? 'text-[#D97706]' : 'text-[#DC2626]'
                          }`}>
                            {resolutionRate}%
                          </div>
                          <div className="w-full bg-white/80 h-1.5 rounded-full overflow-hidden mt-0.5">
                            <div
                              className={`h-full rounded-full ${
                                resolutionRate >= 80 ? 'bg-[#059669]' : resolutionRate >= 50 ? 'bg-[#D97706]' : 'bg-[#DC2626]'
                              }`}
                              style={{ width: `${resolutionRate}%` }}
                            />
                          </div>
                          <div className="text-[8px] font-bold text-[#665E55] text-right mt-0.5">Resolved</div>
                        </div>

                        {/* Trend */}
                        <div className="shrink-0">
                          {biz.trend === 'up' ? (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded-lg">
                              <ArrowUp className="w-3 h-3" />
                            </span>
                          ) : biz.trend === 'down' ? (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.5 rounded-lg">
                              <ArrowDown className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#665E55] bg-white/70 px-1.5 py-0.5 rounded-lg">
                              <Minus className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Authority Note */}
            <div className="p-3 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-xs text-[#9F1239] flex items-start gap-2">
              <Shield className="w-4 h-4 text-[#BE123C] shrink-0 mt-0.5" />
              <div>
                <strong>Automated Enforcement Triggers:</strong> Businesses in "Critical" status for 7+ consecutive days are automatically flagged for enforcement review. "Warning" status businesses receive compliance notices. Excellent performers receive "Verified Partner" badges on the Tourist App.
              </div>
            </div>
          </div>
        </div>
      )}

  </>;
}
