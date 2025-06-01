import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Review from './Review';
import ReviewForm from './ReviewForm';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function StoreDetails() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editReviewData, setEditReviewData] = useState(null);

  const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null');

  const fetchStoreDetails = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/stores/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch store details: ${res.status}`);
      const data = await res.json();
      setStore(data);
      setError(null);
    } catch (error) {
      console.error('Error loading store details:', error);
      setError(error.message);
      setStore(null);
    }
  };

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  const handleAddReview = async (rating, message) => {
    try {
      const res = await fetch(`${BACKEND_URL}/stores/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, rating, message }),
      });
      if (!res.ok) throw new Error(`Failed to add review: ${res.status}`);
      await fetchStoreDetails();
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert('Error adding review');
    }
  };

  const handleEditReview = async (reviewId, rating, message) => {
    try {
      const res = await fetch(`${BACKEND_URL}/stores/${id}/review/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, message }),
      });
      if (!res.ok) throw new Error(`Failed to edit review: ${res.status}`);
      await fetchStoreDetails();
      setShowModal(false);
      setEditReviewData(null);
    } catch (error) {
      console.error(error);
      alert('Error editing review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/stores/${id}/review/${reviewId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Failed to delete review: ${res.status}`);
      await fetchStoreDetails();
    } catch (error) {
      console.error(error);
      alert('Error deleting review');
    }
  };

  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>;
  if (!store) return <p className="text-center mt-20">Store not found</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-2xl space-y-6 border-2 border-orange-300">
      <div className="border-b border-orange-300 pb-4">
        <h1 className="text-3xl font-bold text-orange-600">{store.name}</h1>
        <p className="text-gray-700 text-sm">{store.address || 'No address available'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow border-2 border-orange-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Shop Owner</h2>
          <p className="text-sm text-gray-700">Name: <span className="font-medium">{store.owner_name || 'N/A'}</span></p>
          <p className="text-sm text-gray-700">Email: <span className="font-medium">{store.email || 'N/A'}</span></p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-2 border-orange-300">
          <h2 className="text-xl font-semibold text-orange-600 mb-2">Ratings</h2>
          <p className="text-gray-800 text-sm">Average Rating: <span className="font-bold">{store.avg_rating ?? 'N/A'}</span> / 5</p>
          <p className="text-gray-800 text-sm">Total Reviews: <span className="font-bold">{store.review_count ?? 0}</span></p>
        </div>
      </div>

      {currentUser?.id && currentUser.id !== store.user_id && (
        <div className="text-right">
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow"
          >
            Add Review
          </button>
        </div>
      )}

      <div className="border-t border-orange-300 pt-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Reviews</h2>
        <Review 
          reviews={store.reviews || []} 
          currentUser={currentUser}
          onEdit={(review) => {
            setEditReviewData(review);
            setShowModal(true);
          }}
          onDelete={handleDeleteReview}
        />
      </div>

      {showModal && (
        <ReviewForm
          onClose={() => {
            setShowModal(false);
            setEditReviewData(null);
          }}
          onSubmit={editReviewData
            ? (rating, message) => handleEditReview(editReviewData.id, rating, message)
            : handleAddReview
          }
          initialData={editReviewData}
        />
      )}
    </div>
  );
}
