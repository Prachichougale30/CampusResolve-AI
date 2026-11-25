import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { detectCategory } from '../../services/aiService';
import CategoryBadge from '../../components/common/CategoryBadge';
import {
  UploadCloud,
  X,
  Bot,
  MapPin,
  Send,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PRESET_LOCATIONS = [
  'Academic Block A, Room 204',
  'Academic Block B, Computer Lab 3',
  'Lecture Hall Complex, Room 105',
  'Central Library, 2nd Floor Reading Hall',
  'Hostel Block A, Room 108',
  'Hostel Block B, 3rd Floor Common Washroom',
  'Girls Hostel Block C, 2nd Floor',
  'Science Block Canteen Plaza',
  'Campus East Gate Perimeter Road',
  'Campus Transit Station, Bus Bay 2',
];

const CreateComplaintPage = () => {
  const navigate = useNavigate();
  const locationState = useLocation();

  // Create Complaint has been moved into My Complaints modal as required
  useEffect(() => {
    navigate('/student/complaints?create=true', {
      replace: true,
      state: locationState?.state,
    });
  }, [navigate, locationState]);

  const { addComplaint } = useComplaints();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time AI categorization state
  const [detectedCategory, setDetectedCategory] = useState('Other');
  const [aiConfidence, setAiConfidence] = useState(0);
  const [aiExplanation, setAiExplanation] = useState('');

  // Prefill from AI assistant edit button if provided
  useEffect(() => {
    if (locationState?.state?.prefill) {
      const p = locationState.state.prefill;
      if (p.title) setTitle(p.title);
      if (p.description) setDescription(p.description);
      if (p.location) setLocation(p.location);
    }
  }, [locationState]);

  // Trigger real-time AI category detection on title or description change
  useEffect(() => {
    if (title.trim() || description.trim()) {
      const result = detectCategory(title, description);
      setDetectedCategory(result.category);
      setAiConfidence(result.confidence);
      setAiExplanation(result.explanation);
    } else {
      setDetectedCategory('Other');
      setAiConfidence(0);
      setAiExplanation('Enter a title or description for AI analysis.');
    }
  }, [title, description]);

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      toast.error('Please fill in Title, Description, and Location');
      return;
    }

    setIsSubmitting(true);

    const newTicket = addComplaint({
      title,
      description,
      location,
      category: detectedCategory,
      isAiDetected: true,
      imageUrl: previewImage || undefined,
      student: user,
    });

    setIsSubmitting(false);
    navigate(`/student/complaints/${newTicket.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Submit a Campus Complaint
          </h1>
          <p className="text-xs text-slate-500">
            Provide details below. CampusResolve AI will automatically classify and assign the ticket.
          </p>
        </div>

        {/* Secondary Alternative CTA */}
        <Link
          to="/student/ai-assistant"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-50 to-accent-50 text-brand-700 hover:from-brand-100 hover:to-accent-100 border border-brand-200 text-xs font-bold transition-all shadow-xs"
        >
          <Bot className="w-4 h-4 text-brand-600 animate-pulse" />
          <span>Prefer talking instead of typing?</span>
          <span className="underline font-extrabold">AI Assistant →</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
          {/* Complaint Title */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5 text-xs sm:text-sm">
              Complaint Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ceiling Fan Not Working in Room 204"
              required
              className="w-full rounded-2xl border-slate-200 text-xs sm:text-sm py-3 px-4 focus:ring-brand-500 focus:border-brand-500 placeholder:text-slate-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5 text-xs sm:text-sm">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue, symptoms, frequency, and any hazards (e.g. The fan makes a loud squeaking sound and stops after 5 minutes)."
              required
              className="w-full rounded-2xl border-slate-200 text-xs sm:text-sm py-3 px-4 focus:ring-brand-500 focus:border-brand-500 placeholder:text-slate-400 leading-relaxed"
            />
          </div>

          {/* AI Category Detection Showcase Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-brand-50/30 border-2 border-dashed border-brand-200 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      🤖 AI Category Detection
                    </span>
                    {aiConfidence > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                        {aiConfidence}% match
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    CampusResolve AI automatically analyzes your complaint and suggests the appropriate category.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CategoryBadge
                  category={detectedCategory}
                  isAiDetected={detectedCategory !== 'Other'}
                  size="md"
                />
              </div>
            </div>

            {aiExplanation && (
              <p className="mt-2 text-[11px] text-brand-800/80 font-medium pl-13">
                💡 {aiExplanation}
              </p>
            )}
          </div>

          {/* Location with Quick Chips */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5 text-xs sm:text-sm">
              Campus Location <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Academic Block A, Room 204 or Hostel Block B 3rd Floor"
                required
                className="w-full pl-10 rounded-2xl border-slate-200 text-xs sm:text-sm py-3 px-4 focus:ring-brand-500 focus:border-brand-500 placeholder:text-slate-400"
              />
            </div>

            {/* Quick location chips */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick Select:</span>
              {PRESET_LOCATIONS.slice(0, 4).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-600 font-medium transition-colors"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Image Section */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5 text-xs sm:text-sm">
              Upload Complaint Image (Optional)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Photos of damaged chairs, leaking pipes, broken switches, or dirty premises help staff arrive with the right tools.
            </p>

            {previewImage ? (
              <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                <img
                  src={previewImage}
                  alt="Upload preview"
                  className="h-44 w-auto object-cover rounded-2xl"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/70 text-white rounded-full hover:bg-rose-600 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-brand-400 hover:bg-slate-50/50 transition-colors">
                <UploadCloud className="w-8 h-8 text-brand-600 mb-2" />
                <span className="text-xs font-bold text-slate-800">
                  Click to browse or drag & drop campus photo
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  PNG, JPG, or WEBP up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>Complaints are automatically routed to campus maintenance dispatch.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/student/dashboard')}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim()}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 hover:shadow-brand-500/40 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Ticket...' : 'Submit Complaint'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaintPage;
