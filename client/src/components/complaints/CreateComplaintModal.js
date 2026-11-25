import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { analyzeComplaint } from '../../services/aiService';
import CategoryBadge from '../common/CategoryBadge';
import { CATEGORIES } from '../../data/mockData';
import {
  X,
  UploadCloud,
  Bot,
  MapPin,
  Send,
  Sparkles,
  Info,
  AlertCircle,
  ShieldAlert,
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
];

const CreateComplaintModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const { addComplaint } = useComplaints();
  const { user } = useAuth();
  const locationState = useLocation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Gemini classification state
  const [aiExplanation, setAiExplanation] = useState('');
  const [isAiDetected, setIsAiDetected] = useState(true);
  const [isPotentiallySpam, setIsPotentiallySpam] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('idle');
  const [analyzedInput, setAnalyzedInput] = useState('');
  const analysisRequestId = useRef(0);

  const currentAnalysisInput = `${title.trim()}\n${description.trim()}`;
  const hasCurrentAnalysis =
    analysisStatus === 'complete' && analyzedInput === currentAnalysisInput;

  // Prefill from props or location state
  useEffect(() => {
    const prefill = initialData || locationState?.state?.prefill;
    if (prefill) {
      if (prefill.title) setTitle(prefill.title);
      if (prefill.description) setDescription(prefill.description);
      if (prefill.location) setLocation(prefill.location);
      if (prefill.category) setCategory(prefill.category);
    }
  }, [initialData, locationState]);

  const invalidateAnalysis = () => {
    analysisRequestId.current += 1;
    setAnalyzedInput('');
    setIsPotentiallySpam(false);
    setAnalysisStatus('idle');
    setAiExplanation('Complaint changed. Analyze it again to refresh the result.');
  };

  const handleAnalyzeComplaint = async () => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !cleanDescription) {
      setErrorMessage('Enter both a complaint title and description before analysis.');
      return;
    }

    if (`${cleanTitle} ${cleanDescription}`.length < 10) {
      setErrorMessage('Add a little more detail before AI analysis.');
      return;
    }

    const input = `${cleanTitle}\n${cleanDescription}`;
    const requestId = analysisRequestId.current + 1;
    analysisRequestId.current = requestId;
    setErrorMessage('');
    setAnalysisStatus('loading');
    setAnalyzedInput('');
    setIsPotentiallySpam(false);
    setAiExplanation('Analyzing complaint with Gemini AI...');

    try {
      const result = await analyzeComplaint(cleanTitle, cleanDescription);
      if (analysisRequestId.current !== requestId) return;

      setCategory(result.category);
      setAiExplanation(result.explanation);
      setIsAiDetected(true);
      setIsPotentiallySpam(!result.isCampusRelated || result.isPotentiallySpam);
      setAnalyzedInput(input);
      setAnalysisStatus('complete');
    } catch (error) {
      if (analysisRequestId.current !== requestId) return;
      setAnalysisStatus('error');
      setAiExplanation(error.message || 'AI analysis failed. Please try again.');
      setIsPotentiallySpam(false);
    }
  };

  // Clean form when modal closes or opens
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Other');
    setLocation('');
    setPriority('Medium');
    setPreviewImage(null);
    setAiExplanation('');
    setErrorMessage('');
    analysisRequestId.current += 1;
    setIsSubmitting(false);
    setIsPotentiallySpam(false);
    setAnalysisStatus('idle');
    setAnalyzedInput('');
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be under 5MB');
        return;
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!hasCurrentAnalysis) {
      setErrorMessage(
        analysisStatus === 'error'
          ? aiExplanation
          : 'Wait for Gemini AI to finish analyzing this complaint before submitting.'
      );
      return;
    }

    if (isPotentiallySpam) {
      setErrorMessage(
        'The complaint may be unrelated to campus or potentially spam. AI can make mistakes; review the text and edit it if this was flagged incorrectly.'
      );
      toast.error('Please review the AI classification before submitting');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please provide a complaint title');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please provide a detailed description of the issue');
      return;
    }
    if (!location.trim()) {
      setErrorMessage('Please specify the campus location');
      return;
    }

    setIsSubmitting(true);

    try {
      const newTicket = await addComplaint({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        category,
        priority,
        isAiDetected,
        imageUrl: previewImage || undefined,
        student: user || {
          name: 'Student',
          email: 'student@campus.edu',
        },
      });

      if (onSuccess) {
        onSuccess(newTicket);
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit complaint. Please try again.');
      toast.error(err.message || 'Error creating complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div
          className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-2xl border border-slate-200/90 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Create Campus Complaint
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Auto-categorized by AI and dispatched to the designated campus technician
                </p>
              </div>
            </div>

            <button
              type="button"
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="px-6 py-5 max-h-[82vh] overflow-y-auto">
            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Complaint Title */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Complaint Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    invalidateAnalysis();
                  }}
                  placeholder="e.g. Ceiling Fan Not Working in Room 204 or Water Leakage"
                  required
                  className="w-full rounded-xl border-slate-200 text-xs sm:text-sm py-2.5 px-3.5 focus:ring-brand-500 focus:border-brand-500 placeholder:text-slate-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    invalidateAnalysis();
                  }}
                  placeholder="Describe the issue, symptoms, frequency, and hazards (e.g. Fan makes squeaking noise and stops rotating after 5 minutes)."
                  required
                  className="w-full rounded-xl border-slate-200 text-xs sm:text-sm py-2.5 px-3.5 focus:ring-brand-500 focus:border-brand-500 placeholder:text-slate-400 leading-relaxed"
                />
              </div>

              {/* On-demand Gemini analysis and manual category override */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border space-y-2.5 transition-colors ${
                  isPotentiallySpam
                    ? 'bg-rose-50/70 border-rose-300'
                    : 'bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-brand-50/40 border-brand-200/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs ${
                        isPotentiallySpam
                          ? 'bg-rose-600'
                          : 'bg-gradient-to-tr from-brand-600 to-accent-600'
                      }`}
                    >
                      {isPotentiallySpam ? <ShieldAlert className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-black uppercase tracking-wider ${
                            isPotentiallySpam ? 'text-rose-900' : 'text-slate-900'
                          }`}
                        >
                          {isPotentiallySpam
                            ? 'Potentially Spam / Unrelated'
                            : 'Gemini AI Complaint Analysis'}
                        </span>
                        {analysisStatus === 'loading' && (
                          <span className="text-[10px] font-bold text-indigo-700">Analyzing...</span>
                        )}
                        {analysisStatus === 'complete' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Analyzed
                          </span>
                        )}
                        {analysisStatus === 'error' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Unavailable
                          </span>
                        )}
                        {isPotentiallySpam && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-200 text-rose-900">
                            Review needed
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] ${isPotentiallySpam ? 'text-rose-700 font-semibold' : 'text-slate-500'}`}>
                        {aiExplanation || 'Gemini analyzes campus relevance and suggests a category.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CategoryBadge category={category} isAiDetected={isAiDetected} size="sm" />
                  </div>
                </div>

                {/* Category Dropdown (allowing user confirmation or adjustment) */}
                <div className="flex items-center gap-2 pt-1 border-t border-brand-100/80">
                  <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">
                    Category:
                  </span>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setIsAiDetected(false);
                    }}
                    className="flex-1 rounded-xl border-slate-200 bg-white text-xs py-1.5 px-3 focus:ring-brand-500 focus:border-brand-500 font-semibold text-slate-800"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} — {cat.description.slice(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-500">
                  AI flags are estimates, not proof of fraud. Review the result if your genuine complaint is flagged.
                </p>
                <button
                  type="button"
                  onClick={handleAnalyzeComplaint}
                  disabled={
                    analysisStatus === 'loading' ||
                    !title.trim() ||
                    !description.trim()
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-3 py-2 text-[11px] font-bold text-brand-700 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Bot className="h-3.5 w-3.5" />
                  {analysisStatus === 'loading'
                    ? 'Analyzing...'
                    : analysisStatus === 'complete'
                    ? 'Analyze Again'
                    : 'Analyze Complaint'}
                </button>
              </div>

              {/* Location & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-900 mb-1">
                    Campus Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Block A, Room 204 or Hostel Washroom"
                      required
                      className="w-full pl-9 pr-3 rounded-xl border-slate-200 text-xs sm:text-sm py-2.5 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>

                  {/* Quick location chips */}
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Quick:
                    </span>
                    {PRESET_LOCATIONS.slice(0, 3).map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocation(loc)}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600 font-medium transition-colors"
                      >
                        {loc.split(',')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border-slate-200 text-xs sm:text-sm py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500 font-semibold text-slate-800"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical Priority</option>
                  </select>
                </div>
              </div>

              {/* Upload Image / Attachment */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Supporting Photo / Attachment (Optional)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Attaching a photo helps the maintenance team identify the defect and bring appropriate replacement parts.
                </p>

                {previewImage ? (
                  <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                    <img
                      src={previewImage}
                      alt="Attachment preview"
                      className="h-36 w-auto max-w-full object-cover rounded-2xl"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/70 text-white rounded-full hover:bg-rose-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-brand-400 hover:bg-slate-50/50 transition-colors">
                    <UploadCloud className="w-6 h-6 text-brand-600 mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      Click to browse or drop complaint photo
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
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

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                  <span>Complaints are automatically queued for admin dispatch.</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !title.trim() ||
                      !description.trim() ||
                      analysisStatus === 'loading' ||
                      !hasCurrentAnalysis ||
                      isPotentiallySpam
                    }
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 hover:shadow-brand-500/40 transition-all hover:scale-[1.01] disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isSubmitting
                        ? 'Submitting...'
                        : analysisStatus === 'loading'
                        ? 'Analyzing...'
                        : 'Submit Complaint'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateComplaintModal;
