import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useComplaints } from '../../context/ComplaintContext';
import { Star, ShieldCheck } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, complaint }) => {
  const { verifyResolution } = useComplaints();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!complaint) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    verifyResolution(complaint.id, rating, comment);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Resolution & Rate Service"
      subtitle={`Complaint #${complaint.id}: ${complaint.title}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="text-center py-2">
          <p className="text-sm font-bold text-slate-800">
            Are you satisfied with the resolution?
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Your verification closes this complaint and records staff service metrics.
          </p>

          {/* 5-star rating */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-transform hover:scale-125"
              >
                <Star
                  className={`w-7 h-7 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="inline-block mt-2 font-bold text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            {rating === 5
              ? '⭐⭐⭐⭐⭐ Excellent Service'
              : rating === 4
              ? '⭐⭐⭐⭐ Very Good'
              : rating === 3
              ? '⭐⭐⭐ Satisfactory'
              : rating === 2
              ? '⭐⭐ Needs Improvement'
              : '⭐ Poor Resolution'}
          </span>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Feedback Comments (Optional)
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. The technician arrived on time and fixed the issue completely. Very polite and prompt."
            className="w-full rounded-xl border-slate-200 text-xs focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-500/20 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Resolution</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FeedbackModal;
