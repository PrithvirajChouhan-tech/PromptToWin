import React from 'react';
import { 
  X, 
  IndianRupee, 
  Train, 
  Landmark, 
  Utensils, 
  ShoppingBag, 
  Sparkles, 
  Users,
  PieChart,
  ArrowDownToLine
} from 'lucide-react';
import { Trip, ItineraryItem } from '../types/travel';

interface BudgetBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  allItems: ItineraryItem[];
}

export const BudgetBreakdownModal: React.FC<BudgetBreakdownModalProps> = ({
  isOpen,
  onClose,
  trip,
  allItems,
}) => {
  if (!isOpen) return null;

  // Calculate totals by category
  const categoriesCost: Record<string, number> = {
    transit: 0,
    cultural_sight: 0,
    culinary: 0,
    cultural_buy: 0,
    festival: 0,
  };

  allItems.forEach(item => {
    if (categoriesCost[item.category] !== undefined) {
      categoriesCost[item.category] += item.cost;
    }
  });

  const totalCost = Object.values(categoriesCost).reduce((a, b) => a + b, 0);
  const travelersCount = trip.travelers.length || 1;
  const costPerPerson = Math.round(totalCost / travelersCount);

  const breakdown = [
    { 
      key: 'transit', 
      label: 'Local Transit & High-Speed Rail', 
      cost: categoriesCost.transit, 
      color: 'bg-[#0284C7]', 
      textColor: 'text-[#0284C7]',
      icon: <Train className="w-4 h-4" /> 
    },
    { 
      key: 'cultural_sight', 
      label: 'Monuments & Cultural Sights', 
      cost: categoriesCost.cultural_sight, 
      color: 'bg-[#EA580C]', 
      textColor: 'text-[#EA580C]',
      icon: <Landmark className="w-4 h-4" /> 
    },
    { 
      key: 'culinary', 
      label: 'Regional Food, Thalis & Street Food', 
      cost: categoriesCost.culinary, 
      color: 'bg-[#D97706]', 
      textColor: 'text-[#D97706]',
      icon: <Utensils className="w-4 h-4" /> 
    },
    { 
      key: 'cultural_buy', 
      label: 'GI Tagged Crafts & Souvenirs', 
      cost: categoriesCost.cultural_buy, 
      color: 'bg-[#7E22CE]', 
      textColor: 'text-[#7E22CE]',
      icon: <ShoppingBag className="w-4 h-4" /> 
    },
    { 
      key: 'festival', 
      label: 'Festivals & Special Cultural Access', 
      cost: categoriesCost.festival, 
      color: 'bg-[#BE185D]', 
      textColor: 'text-[#BE185D]',
      icon: <Sparkles className="w-4 h-4" /> 
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="budget-breakdown-modal"
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#EAE5DC]"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-[#FFFDF9] border-b border-[#EAE5DC] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#ECFDF5] text-[#10B981] uppercase tracking-wide">
              Trip Financials
            </span>
            <h3 className="text-lg font-bold text-[#1F1C18] font-display">
              Itinerary Budget Tracker
            </h3>
          </div>
          <button
            id="close-budget-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F1EB] hover:bg-[#EAE5DC] text-[#1F1C18] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Main Total & Per Person Card */}
          <div className="p-4 rounded-2xl bg-[#F8F6F2] border border-[#EAE5DC] flex items-center justify-between">
            <div>
              <div className="text-xs text-[#8C827A] font-medium">Total Trip Estimate</div>
              <div className="text-2xl font-black text-[#1F1C18] flex items-center font-display">
                <IndianRupee className="w-5 h-5 text-[#2E7D32]" />
                <span>{totalCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-[#8C827A] font-medium flex items-center justify-end gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>Per Traveler ({travelersCount})</span>
              </div>
              <div className="text-lg font-bold text-[#2E7D32]">
                ₹{costPerPerson.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#8C827A]">
              <span>Expense Allocation</span>
              <span>100% Calculated</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden flex bg-[#EAE5DC]">
              {breakdown.map(b => {
                const percentage = totalCost > 0 ? (b.cost / totalCost) * 100 : 0;
                if (percentage === 0) return null;
                return (
                  <div
                    key={b.key}
                    style={{ width: `${percentage}%` }}
                    className={`${b.color} transition-all duration-500`}
                    title={`${b.label}: ₹${b.cost}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Category Itemized Breakdown */}
          <div className="space-y-2.5">
            {breakdown.map(b => {
              const percentage = totalCost > 0 ? Math.round((b.cost / totalCost) * 100) : 0;
              return (
                <div 
                  key={b.key} 
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#EAE5DC] text-xs hover:bg-[#FAF8F5] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg bg-[#FAF8F5] ${b.textColor}`}>
                      {b.icon}
                    </div>
                    <div>
                      <div className="font-bold text-[#1F1C18]">{b.label}</div>
                      <div className="text-[10px] text-[#8C827A]">{percentage}% of total</div>
                    </div>
                  </div>

                  <div className="font-bold text-[#1F1C18]">
                    ₹{b.cost.toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Currency Advisory note */}
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] text-[11px] text-[#6B635B]">
            💡 <strong>Tourist Cash Advisory:</strong> India's UPI (Unified Payments Interface) is accepted almost everywhere, but international credit cards work best at hotels and large restaurants. Carry around ₹2,000–₹3,000 in cash notes (₹100, ₹200) for auto-rickshaws, chai stalls, and temple shoe-keepers.
          </div>

        </div>

      </div>
    </div>
  );
};
