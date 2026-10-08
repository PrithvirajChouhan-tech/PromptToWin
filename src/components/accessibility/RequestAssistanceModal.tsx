import { mutate } from "../../services/journey";
import React, { useState } from 'react';
import { 
  Accessibility, 
  X, 
  MapPin, 
  CheckCircle2, 
  PhoneCall, 
  Radio, 
  Clock, 
  ShieldCheck,
  Send
} from 'lucide-react';

interface RequestAssistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  city?: string;
}

export const RequestAssistanceModal: React.FC<RequestAssistanceModalProps> = ({
  isOpen,
  onClose,
  city = 'Delhi'
}) => {
  const [assistanceType, setAssistanceType] = useState('wheelchair_ramp');
  const [stationOrMonument, setStationOrMonument] = useState('New Delhi Railway Station / Red Fort');
  const [notes, setNotes] = useState('');
  const [isDispatched, setIsDispatched] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [error,setError]=useState('');

  if (!isOpen) return null;

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();setError('');try{const request=await mutate('/assistance',{place:stationOrMonument,type:assistanceType,notes});setTicketId(request.id);setIsDispatched(true);}catch(error){setError(error.message);}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#BAE6FD] animate-in fade-in zoom-in-95">
        
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#0284C7] flex items-center justify-center">
              <Accessibility className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1F1C18]">Request On-Ground Assistance</h3>
              <p className="text-[11px] text-[#8C827A]">Shared assistance request · demo coordination</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-[#8C827A] hover:bg-[#FAF8F5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <p role="alert">{error}</p>}
        {!isDispatched ? (
          <form onSubmit={handleRequest} className="space-y-3.5 mt-4 text-xs">
            <div>
              <label className="block font-bold text-[#1F1C18] mb-1">Type of Support Needed *</label>
              <select
                value={assistanceType}
                onChange={(e) => setAssistanceType(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl px-3 py-2 font-medium"
              >
                <option value="wheelchair_ramp">Wheelchair Ramp Deployment / Train Boarding</option>
                <option value="station_sahayak">Dedicated Station Sahayak (Luggage & Escort)</option>
                <option value="step_free_escort">ASI Monument Step-Free Entrance Escort</option>
                <option value="accessible_toilet">Accessible Restroom Guidance</option>
                <option value="visual_audio_help">Visual / Audio Guidance Assistance</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#1F1C18] mb-1">Current Monument / Station / Platform *</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-[#0284C7] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={stationOrMonument}
                  onChange={(e) => setStationOrMonument(e.target.value)}
                  placeholder="e.g. Agra Cantt Platform 1 or Taj Mahal East Gate"
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl pl-8 pr-3 py-2 text-[#1F1C18]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#1F1C18] mb-1">Specific Need or Details</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Arriving on 12002 Shatabdi Express coach C2, manual wheelchair user..."
                className="w-full bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl p-2.5 text-[#1F1C18]"
              />
            </div>

            <div className="bg-[#EFF6FF] border border-[#BAE6FD] p-2.5 rounded-xl text-[11px] text-[#0369A1] space-y-0.5">
              <span className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Assistance availability</span>
              </span>
              <p>This prototype sends a request to the authority workspace. It does not dispatch station staff.</p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#8C827A] hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit assistance request</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-3 mt-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div>
              <h4 className="text-base font-bold text-[#1F1C18]">Assistance request saved</h4>
              <p className="text-xs text-[#5A524C] mt-0.5">
                Awaiting review for <strong>{stationOrMonument}</strong>
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE5DC] text-left text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-[#8C827A]">Assistance Ref:</span>
                <span className="font-bold text-[#0284C7]">{ticketId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C827A]">Estimated ETA:</span>
                <span className="font-bold text-[#10B981]">Not confirmed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C827A]">Assistance Officer:</span>
                <span className="font-bold text-[#1F1C18]">Not assigned</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 bg-[#0284C7] text-white text-xs font-bold rounded-xl"
            >
              Done & Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
