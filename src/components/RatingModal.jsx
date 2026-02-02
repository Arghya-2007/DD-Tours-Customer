import React, { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "../services/api";

const RatingModal = ({ isOpen, onClose, tripId, tripTitle, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return toast.error("Please select a star rating!");

    setLoading(true);
    try {
      await api.post("/reviews/add", {
        tripId,
        rating,
        comment,
      });
      toast.success("Review posted successfully!");
      if (onSuccess) onSuccess(); // Callback to refresh data
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Container - Responsive Wrapper */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-[90%] max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#1c1917] border border-white/10 rounded-3xl shadow-2xl z-10 flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/5">
            <h3 className="text-xl font-header text-white uppercase tracking-wide">
              Mission Report
            </h3>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 pt-2">
            <p className="text-sm text-gray-400 mb-8 mt-2 text-center leading-relaxed">
              Rate your experience for <br />
              <span className="text-primary font-bold text-base block mt-1">
                {tripTitle}
              </span>
            </p>

            {/* Star Input */}
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-110 active:scale-90 focus:outline-none p-1"
                >
                  <Star
                    size={36} // Bigger stars for touch
                    className={`${
                      star <= (hover || rating)
                        ? "fill-yellow-500 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                        : "text-gray-700 stroke-[1.5px]"
                    } transition-all duration-200`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your favorite moments... (Optional)"
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:border-primary/50 focus:bg-white/5 outline-none resize-none h-32 mb-6 transition-all text-sm"
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary hover:bg-orange-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Publishing...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RatingModal;
