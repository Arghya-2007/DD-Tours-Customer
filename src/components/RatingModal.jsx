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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-[#1c1917] border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <h3 className="text-xl font-header text-white mb-1 text-center">
            Rate Your Experience
          </h3>
          <p className="text-sm text-gray-400 text-center mb-6">
            How was the{" "}
            <span className="text-primary font-bold">{tripTitle}</span>?
          </p>

          {/* Star Input */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  size={32}
                  className={`${
                    star <= (hover || rating)
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-600"
                  } transition-colors duration-200`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your favorite moments... (Optional)"
            className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-primary outline-none resize-none h-32 mb-6"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Submit Review"}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RatingModal;
