import React from 'react';
import { FaStar, FaEdit, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Review({ reviews, currentUser, onEdit, onDelete }) {
  const handleDelete = async (id) => {
    try {
      await onDelete(id);
      toast.success('Review deleted successfully');
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleEdit = (review) => {
    onEdit(review);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
        
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => {
            const canEdit = currentUser?.id === review.user_id;
            
            return (
              <div 
                key={review.id} 
                className="relative p-4 border-2 border-orange-300 rounded shadow-sm bg-white"
              >
                {canEdit && (
                  <div className="absolute top-2 right-2 flex space-x-3">
                    <button 
                      onClick={() => handleEdit(review)}
                      className="text-gray-500 hover:text-orange-500"
                      aria-label="Edit review"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-gray-500 hover:text-red-500"
                      aria-label="Delete review"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                )}
                
                <p className="font-semibold mb-1">
                  {review.user_name || 'Anonymous'}
                </p>
                
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700">{review.message}</p>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
