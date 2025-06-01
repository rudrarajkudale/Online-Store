import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function ReviewForm({ onClose, onSubmit, initialData }) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [message, setMessage] = useState(initialData?.message || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter a review message');
      return;
    }
    onSubmit(rating, message.trim());
    toast.success(initialData ? 'Review updated successfully!' : 'Review added successfully!');
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md border-2 border-orange-400">
        <h2 className="text-xl font-bold mb-4 text-orange-600">
          {initialData ? 'Edit Review' : 'Write a Review'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-orange-700 mb-1">
              Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-orange-400' : 'text-orange-200'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.975a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.784.57-1.838-.197-1.54-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.045 9.402c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.975z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-orange-700 mb-1">
              Review
            </label>
            <textarea
              className="w-full border border-orange-300 p-2 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-400"
              rows="4"
              placeholder="Share your experience..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-orange-400 text-orange-600 rounded hover:bg-orange-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
            >
              {initialData ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
