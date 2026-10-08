import React, { useState, useMemo } from 'react';
import { Trophy, MapPin, Star, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { TOURISM_LEADERBOARD_DATA } from '../../data/ecosystemData';

export function BusinessLeaderboard({ businessName }: { businessName: string }) {
  const [leaderboardCategory, setLeaderboardCategory] = useState<'all' | 'Hotel' | 'Restaurant' | 'Handicraft' | 'Tour Agency' | 'Transport'>('all');

  const filteredLeaderboard = useMemo(() => {
    const filtered = leaderboardCategory === 'all'
      ? TOURISM_LEADERBOARD_DATA
      : TOURISM_LEADERBOARD_DATA.filter(e => e.category === leaderboardCategory);
    return [...filtered].sort((a, b) => a.rank - b.rank);
  }, [leaderboardCategory]);
  
  return <>
      {/* TOURISM LEADERBOARD — Category-wise rankings of tourism businesses */}
      {(
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE5DC] shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0ECE4]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D97706]">
                <Trophy className="w-3.5 h-3.5" />
                <span>Tourism Leaderboard</span>
              </div>
              <h2 className="text-lg font-extrabold text-[#191715]">Best Businesses by Category — Rated by Tourists</h2>
              <p className="text-xs text-[#665E55]">Rankings based on verified tourist ratings, quality scores, and complaint resolution rates across all tourism categories.</p>
            </div>
            <div className="text-xs font-semibold text-[#665E55]">
              {filteredLeaderboard.length} businesses ranked
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'Hotel', 'Restaurant', 'Handicraft', 'Tour Agency', 'Transport'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setLeaderboardCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  leaderboardCategory === cat
                    ? 'bg-[#191715] text-white'
                    : 'bg-[#FAF8F5] text-[#665E55] hover:bg-[#EFEAE1]'
                }`}
              >
                {cat === 'all' ? `All Categories` : `${cat}s`}
              </button>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="space-y-2">
            {filteredLeaderboard.map((entry, idx) => {
              const isCurrentBusiness = businessName === entry.name;
              const rankMedal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;
              const badgeColor = entry.badge === 'Diamond' ? 'bg-[#818CF8] text-white' : entry.badge === 'Gold' ? 'bg-[#F59E0B] text-white' : entry.badge === 'Silver' ? 'bg-[#94A3B8] text-white' : 'bg-[#EAE5DC] text-[#665E55]';
              
              return (
                <div
                  key={`${entry.category}-${entry.rank}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrentBusiness
                      ? 'bg-[#ECFDF5] border-[#34D399] ring-2 ring-[#34D399]/30'
                      : 'bg-[#FAF8F5] border-[#EAE5DC] hover:border-[#D6D0C6]'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Rank */}
                    <div className="shrink-0 w-12 text-center">
                      {rankMedal ? (
                        <span className="text-2xl leading-none">{rankMedal}</span>
                      ) : (
                        <span className="text-xl font-black text-[#665E55]">#{entry.rank}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-sm font-extrabold truncate ${isCurrentBusiness ? 'text-[#047857]' : 'text-[#191715]'}`}>
                          {entry.name}
                        </h3>
                        {isCurrentBusiness && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#059669] text-white shrink-0">
                            Your Business
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#665E55]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#059669]" />
                          {entry.city}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${badgeColor}`}>
                          {entry.badge}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-[#EAE5DC] text-[#665E55] text-[10px] font-bold">
                          {entry.category}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="shrink-0 flex items-center gap-3 sm:gap-5">
                      {/* Rating */}
                      <div className="text-center hidden sm:block">
                        <div className="flex items-center gap-1 justify-center">
                          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                          <span className="text-sm font-black text-[#191715]">{entry.rating}</span>
                        </div>
                        <div className="text-[10px] text-[#665E55]">{entry.totalReviews.toLocaleString()} reviews</div>
                      </div>

                      {/* Quality Score Bar */}
                      <div className="hidden md:block w-20">
                        <div className="text-[10px] font-bold text-[#665E55] text-right mb-0.5">{entry.qualityScore}/100</div>
                        <div className="w-full bg-[#EAE5DC] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              entry.qualityScore >= 90 ? 'bg-[#059669]' : entry.qualityScore >= 70 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                            }`}
                            style={{ width: `${entry.qualityScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Rank Change */}
                      <div className="shrink-0">
                        {entry.change === 'up' ? (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded-lg">
                            <ArrowUp className="w-3 h-3" />
                            {entry.changeAmount}
                          </span>
                        ) : entry.change === 'down' ? (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2] px-1.5 py-0.5 rounded-lg">
                            <ArrowDown className="w-3 h-3" />
                            {entry.changeAmount}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#665E55] bg-[#FAF8F5] px-1.5 py-0.5 rounded-lg">
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

          {/* Leaderboard Context Note */}
          <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-2">
            <Trophy className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <strong>How Rankings Work:</strong> Businesses are ranked within their category based on a composite score of tourist ratings (40%), quality score (30%), complaint resolution rate (20%), and review volume (10%). Rankings update weekly. Resolve complaints promptly to protect your position.
            </div>
          </div>
        </div>
      )}

  </>;
}
