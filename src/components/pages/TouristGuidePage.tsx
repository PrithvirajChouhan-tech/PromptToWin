import React, { useState, useEffect, useRef } from 'react';
import { 
  EMERGENCY_CONTACTS, 
  OFFICIAL_TOURIST_GUIDES, 
  ESSENTIAL_TRAVEL_RULES 
} from '../../data/indiaTrips';
import { 
  ShieldCheck, 
  PhoneCall, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Plus, 
  AlertCircle, 
  ExternalLink,
  BookOpen,
  MapPin,
  Sparkles,
  Wifi,
  CreditCard,
  Eye,
  FileCheck,
  FolderOpen,
  ArrowLeft
} from 'lucide-react';

interface UploadedGuideDoc {
  id: string;
  name: string;
  category: string;
  size: string;
  uploadedAt: string;
  type: 'pdf' | 'image' | 'note';
  previewUrl?: string;
  notes?: string;
  region?: string;
}

const INITIAL_UPLOADED_DOCS: UploadedGuideDoc[] = [
  {
    id: 'doc-delhi-metro-map',
    name: 'Delhi NCR High-Speed Airport Express Network.pdf',
    category: 'Transit Guide',
    size: '1.4 MB',
    uploadedAt: 'Preloaded Guide',
    type: 'pdf',
    notes: 'Official route map from IGI Airport Terminal 3 to New Delhi Railway Station (19 mins) with QR WhatsApp ticketing instructions.',
    region: 'Delhi NCR'
  },
  {
    id: 'doc-varanasi-boat-etiquette',
    name: 'Ganges Dawn Boatman & Aarti Guidelines.note',
    category: 'Cultural Etiquette',
    size: '280 KB',
    uploadedAt: 'Preloaded Guide',
    type: 'note',
    notes: 'Negotiate fixed rate of ₹300-500/hr for rowboats before boarding at Assi Ghat. Bring small coins for flower Diya offerings.',
    region: 'Varanasi'
  }
];

interface TouristGuidePageProps {
  onBack?: () => void;
}

export const TouristGuidePage: React.FC<TouristGuidePageProps> = ({ onBack }) => {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedGuideDoc[]>(() => {
    try {
      const saved = localStorage.getItem('tourist_uploaded_guides');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_UPLOADED_DOCS;
  });

  const [activeTab, setActiveTab] = useState<'official' | 'upload' | 'safety'>('official');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<UploadedGuideDoc | null>(null);

  // Custom Guide Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteRegion, setNoteRegion] = useState('Delhi NCR');
  const [noteCategory, setNoteCategory] = useState('Transit Guide');
  const [noteContent, setNoteContent] = useState('');

  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tourist_uploaded_guides', JSON.stringify(uploadedDocs));
    } catch (e) {
      console.error(e);
    }
  }, [uploadedDocs]);

  const showToast = (msg: string) => {
    setUploadSuccessToast(msg);
    setTimeout(() => setUploadSuccessToast(null), 3500);
  };

  // Handle file uploads (PDF, Images, Text documents)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];

    // Format size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeInMB} MB`;

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type.includes('pdf');
    const isImage = file.type.includes('image');

    const newDoc: UploadedGuideDoc = {
      id: 'doc_' + Date.now(),
      name: file.name,
      category: isPdf ? 'Transit / Visa PDF' : isImage ? 'Photo Voucher' : 'Custom Guide',
      size: sizeStr,
      uploadedAt: 'Just now',
      type: isPdf ? 'pdf' : isImage ? 'image' : 'note',
      notes: `Uploaded travel file (${file.type || 'document'}). Available for offline viewing during trip.`,
      region: 'India Regional'
    };

    // If image, create temporary blob preview
    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        newDoc.previewUrl = reader.result as string;
        setUploadedDocs(prev => [newDoc, ...prev]);
        setIsUploading(false);
        showToast(`Successfully uploaded "${file.name}" to your Tourist Guide!`);
      };
      reader.readAsDataURL(file);
    } else {
      setTimeout(() => {
        setUploadedDocs(prev => [newDoc, ...prev]);
        setIsUploading(false);
        showToast(`Successfully uploaded "${file.name}" to your Tourist Guide!`);
      }, 500);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle adding custom manual guide note
  const handleAddCustomNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const newDoc: UploadedGuideDoc = {
      id: 'note_' + Date.now(),
      name: noteTitle.trim(),
      category: noteCategory,
      size: 'Custom Tip',
      uploadedAt: 'Just now',
      type: 'note',
      notes: noteContent.trim() || 'Custom tourist travel tip saved for trip.',
      region: noteRegion
    };

    setUploadedDocs(prev => [newDoc, ...prev]);
    setIsNoteModalOpen(false);
    setNoteTitle('');
    setNoteContent('');
    showToast(`Added custom guide note: "${newDoc.name}"`);
  };

  const handleDeleteDoc = (id: string) => {
    setUploadedDocs(prev => prev.filter(d => d.id !== id));
    showToast('Guide document removed');
    if (selectedDocPreview?.id === id) {
      setSelectedDocPreview(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E8E2D9] text-xs font-bold text-[#665E55] hover:text-[#191715] hover:bg-[#FAF8F5] shadow-xs cursor-pointer transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Explore</span>
        </button>
      )}

      {/* Toast Notification */}
      {uploadSuccessToast && (
        <div className="fixed top-20 right-5 z-50 bg-[#1F1C18] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>{uploadSuccessToast}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE5DC] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#F0ECE4]">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
              <BookOpen className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0284C7] bg-[#E0F2FE] px-2.5 py-0.5 rounded-full">
                  India Tourist Guide & Information Center
                </span>
                <span className="text-[11px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                  Verified 24/7 Helplines
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-[#1F1C18]">
                Tourist Guide Information & Document Vault
              </h1>
              <p className="text-xs sm:text-sm text-[#6B635B] mt-1 max-w-2xl">
                Access official emergency contacts, e-Visa protocols, and download travel guides. Upload your own local guide documents, ticket vouchers, and custom tips.
              </p>
            </div>
          </div>

          {/* Quick Action to Upload or Add Note */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Guide File</span>
            </button>
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] hover:border-[#0284C7] text-[#1F1C18] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Tip</span>
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
              className="hidden" 
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* 24x7 Pan-India Emergency Contacts Bar */}
        <div className="mt-8 space-y-3">
          <h2 className="text-xs font-bold text-[#8C827A] uppercase tracking-wider">
            Verified 24/7 Pan-India Emergency Contacts
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EMERGENCY_CONTACTS.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#BE185D] bg-[#FCE7F3] px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                  <span className="text-sm font-black text-[#0284C7]">{item.number}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#1F1C18]">
                  {item.service}
                </h3>
                <p className="text-[11px] text-[#524B44] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-10 flex items-center gap-2 border-b border-[#F0ECE4] pb-3">
          <button
            onClick={() => setActiveTab('official')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'official'
                ? 'bg-[#1F1C18] text-white shadow-xs'
                : 'text-[#6B635B] hover:text-[#1F1C18] hover:bg-[#FAF8F5]'
            }`}
          >
            Official Downloadable Guides ({OFFICIAL_TOURIST_GUIDES.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'text-[#6B635B] hover:text-[#0284C7] hover:bg-[#FAF8F5]'
            }`}
          >
            <span>My Uploaded Guides & Notes</span>
            <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] flex items-center justify-center">
              {uploadedDocs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'safety'
                ? 'bg-[#1F1C18] text-white shadow-xs'
                : 'text-[#6B635B] hover:text-[#1F1C18] hover:bg-[#FAF8F5]'
            }`}
          >
            Essential Travel Rules & UPI
          </button>
        </div>

        {/* TAB 1: OFFICIAL VERIFIED GUIDES */}
        {activeTab === 'official' && (
          <div className="mt-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {OFFICIAL_TOURIST_GUIDES.map(guide => (
                <div key={guide.id} className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] hover:border-[#0284C7] transition-all space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2.5 py-0.5 rounded-full">
                        {guide.category}
                      </span>
                      <span className="text-xs text-[#8C827A]">{guide.size} • {guide.format}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1F1C18]">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-[#524B44] leading-relaxed">
                      {guide.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F0ECE4] flex items-center justify-between">
                    <span className="text-[11px] text-[#10B981] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{guide.author}</span>
                    </span>
                    <button
                      onClick={() => {
                        showToast(`Opened verified guide: "${guide.title}"`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#EAE5DC] hover:border-[#0284C7] text-xs font-bold text-[#1F1C18] transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>Read Guide</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD & MANAGE GUIDE INFORMATION */}
        {activeTab === 'upload' && (
          <div className="mt-6 space-y-6">
            
            {/* Upload Dropzone Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#BAE6FD] hover:border-[#0284C7] bg-[#F0F9FF]/60 hover:bg-[#F0F9FF] rounded-3xl p-8 text-center cursor-pointer transition-all space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mx-auto shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#1F1C18]">
                  Drag & Drop or Click to Upload Guide Documents
                </h3>
                <p className="text-xs text-[#6B635B] mt-1 max-w-md mx-auto">
                  Upload PDF transit timetables, visa approvals, offline attraction maps, or local guide contact photos. Files are kept safely in your browser for offline reference.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0284C7] bg-white px-3.5 py-1.5 rounded-full border border-[#BAE6FD] shadow-2xs">
                <span>Supports PDF, JPG, PNG, DOCX (Max 25MB)</span>
              </div>
            </div>

            {/* Uploaded Documents List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#8C827A] uppercase tracking-wider">
                  Your Uploaded Guides & Travel Notes ({uploadedDocs.length})
                </h3>
                <button
                  onClick={() => setIsNoteModalOpen(true)}
                  className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Text Tip</span>
                </button>
              </div>

              {uploadedDocs.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs text-[#8C827A]">
                  No custom documents uploaded yet. Tap "Upload Guide File" or "Add Custom Tip" above to save your first travel notes.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {uploadedDocs.map(doc => (
                    <div 
                      key={doc.id} 
                      className="p-4 rounded-2xl bg-[#FAF8F5] hover:bg-white border border-[#EAE5DC] hover:border-[#0284C7] transition-all space-y-3 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                            {doc.type === 'pdf' ? <FileText className="w-5 h-5" /> : <FolderOpen className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-[#1F1C18] line-clamp-1">
                              {doc.name}
                            </h4>
                            <div className="text-[11px] text-[#8C827A] flex items-center gap-2 mt-0.5">
                              <span>{doc.category}</span>
                              <span>•</span>
                              <span>{doc.region || 'India'}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 text-[#8C827A] hover:text-[#E11D48] hover:bg-[#FFE4E6] rounded-lg transition-colors"
                          title="Delete guide doc"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {doc.notes && (
                        <p className="text-xs text-[#524B44] leading-relaxed line-clamp-2 bg-white/70 p-2.5 rounded-xl border border-[#F0ECE4]">
                          {doc.notes}
                        </p>
                      )}

                      {doc.previewUrl && (
                        <div className="h-32 w-full rounded-xl overflow-hidden border border-[#EAE5DC]">
                          <img src={doc.previewUrl} alt={doc.name} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#F0ECE4] flex items-center justify-between text-[11px] text-[#8C827A]">
                        <span>{doc.uploadedAt}</span>
                        <button
                          onClick={() => setSelectedDocPreview(doc)}
                          className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: ESSENTIAL TRAVEL RULES */}
        {activeTab === 'safety' && (
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {ESSENTIAL_TRAVEL_RULES.map((rule, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-2.5">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#EAE5DC] text-[#0284C7] flex items-center justify-center shadow-2xs">
                  {idx === 0 && <Wifi className="w-4 h-4 text-[#0284C7]" />}
                  {idx === 1 && <CreditCard className="w-4 h-4 text-[#10B981]" />}
                  {idx === 2 && <Sparkles className="w-4 h-4 text-[#BE185D]" />}
                  {idx === 3 && <ShieldCheck className="w-4 h-4 text-[#D97706]" />}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#1F1C18]">
                  {rule.title}
                </h3>
                <p className="text-xs text-[#524B44] leading-relaxed">
                  {rule.tip}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal: Add Custom Tip / Note */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#EAE5DC] shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <h3 className="text-base font-bold text-[#1F1C18] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0284C7]" />
                <span>Add Custom Tourist Tip / Local Guide Note</span>
              </h3>
              <button 
                onClick={() => setIsNoteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] text-[#8C827A] hover:text-[#1F1C18] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1F1C18] mb-1">
                  Title or Landmark Name *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Reliable Auto Driver in Jaipur or Secret Rooftop in Varanasi"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DC] text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F1C18] mb-1">
                    Region / City
                  </label>
                  <select
                    value={noteRegion}
                    onChange={e => setNoteRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DC] text-xs focus:outline-none focus:border-[#0284C7] bg-white"
                  >
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Rajasthan">Rajasthan (Jaipur / Udaipur)</option>
                    <option value="Uttar Pradesh">Uttar Pradesh (Varanasi / Agra)</option>
                    <option value="Kerala">Kerala (Kochi / Alleppey)</option>
                    <option value="Kashmir">Kashmir (Srinagar)</option>
                    <option value="All India">All India</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1C18] mb-1">
                    Category
                  </label>
                  <select
                    value={noteCategory}
                    onChange={e => setNoteCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DC] text-xs focus:outline-none focus:border-[#0284C7] bg-white"
                  >
                    <option value="Transit Guide">Transit Guide</option>
                    <option value="Food & Water">Food & Water</option>
                    <option value="Cultural Etiquette">Cultural Etiquette</option>
                    <option value="Shopping & Craft">Shopping & Craft</option>
                    <option value="Emergency Note">Emergency Note</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1C18] mb-1">
                  Guide Notes & Practical Advice *
                </label>
                <textarea 
                  required
                  rows={3}
                  placeholder="e.g. Phone number, landmark directions, bargaining price, or temple entrance tips..."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DC] text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#8C827A] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-xs"
                >
                  Save Guide Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Selected Doc Details */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#EAE5DC] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <div>
                <span className="text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2.5 py-0.5 rounded-full">
                  {selectedDocPreview.category}
                </span>
                <h3 className="text-base font-bold text-[#1F1C18] mt-1">
                  {selectedDocPreview.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedDocPreview(null)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] text-[#8C827A] hover:text-[#1F1C18] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#524B44]">
              <div className="flex items-center justify-between text-[11px] text-[#8C827A] p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC]">
                <span>Region: <strong>{selectedDocPreview.region}</strong></span>
                <span>Size: <strong>{selectedDocPreview.size}</strong></span>
                <span>Date: <strong>{selectedDocPreview.uploadedAt}</strong></span>
              </div>

              {selectedDocPreview.previewUrl && (
                <div className="h-48 w-full rounded-2xl overflow-hidden border border-[#EAE5DC]">
                  <img src={selectedDocPreview.previewUrl} alt={selectedDocPreview.name} className="w-full h-full object-contain bg-black/5" />
                </div>
              )}

              <p className="leading-relaxed bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EAE5DC]">
                {selectedDocPreview.notes}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleDeleteDoc(selectedDocPreview.id)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#E11D48] hover:bg-[#FFE4E6] flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Document</span>
              </button>
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-1.5 rounded-xl bg-[#1F1C18] text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
