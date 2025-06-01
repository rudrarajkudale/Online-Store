import React, { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function StoreOwnerDashboard() {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userId = user.id;

  useEffect(() => {
    if (!userId) {
      setError('User not logged in');
      return;
    }

    fetch(`${BACKEND_URL}/stores/user/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch stores');
        return res.json();
      })
      .then(data => {
        setStores(data);
        if (data.length > 0) {
          fetchStoreDetails(data[0].store_id);
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load stores');
      });
  }, [userId]);

  const fetchStoreDetails = async (storeId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/stores/${storeId}`);
      if (!res.ok) throw new Error('Failed to fetch store details');
      const data = await res.json();
      setSelectedStore(data);
    } catch (err) {
      console.error(err);
      setSelectedStore(null);
      setError('Error loading store details');
    }
  };

  const filteredStores = stores.filter(store =>
    store.store_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[75vh] p-4 pt-6 bg-gray-50 gap-6">
      <div className="w-64 bg-white rounded-lg border-2 border-orange-300 shadow p-4 overflow-y-auto flex flex-col">
        <h2 className="text-xl font-bold text-orange-600 mb-4">Your Shops</h2>

        <input
          type="text"
          placeholder="Search shops..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        {filteredStores.length === 0 ? (
          <p className="text-gray-500 text-sm">No shops available</p>
        ) : (
          filteredStores.map((store) => (
            <div
              key={store.store_id}
              onClick={() => fetchStoreDetails(store.store_id)}
              className={`cursor-pointer p-2 rounded-lg mb-2 break-words ${
                selectedStore?.id === store.store_id
                  ? 'bg-orange-100 text-orange-600 font-semibold'
                  : 'hover:bg-orange-50'
              }`}
            >
              {store.store_name}
            </div>
          ))
        )}
      </div>

      <div className="flex-1 bg-white rounded-lg border-2 border-orange-300 shadow p-6 overflow-y-auto">
        {selectedStore ? (
          <>
            <h2 className="text-2xl font-bold text-orange-600 mb-2">{selectedStore.name}</h2>
            <p className="text-gray-700 mb-4">{selectedStore.address || 'No address available'}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="border-2 border-orange-200 rounded p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Shop Owner</h3>
                <p className="text-sm">Name: <span className="font-medium">{selectedStore.owner_name || 'N/A'}</span></p>
                <p className="text-sm">Email: <span className="font-medium">{selectedStore.email || 'N/A'}</span></p>
              </div>

              <div className="border-2 border-orange-200 rounded p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ratings</h3>
                <p className="text-sm">Average Rating: <span className="font-bold">{selectedStore.avg_rating ?? 'N/A'}</span> / 5</p>
                <p className="text-sm">Total Reviews: <span className="font-bold">{selectedStore.review_count ?? 0}</span></p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Reviews</h3>
              {selectedStore.reviews?.length ? (
                selectedStore.reviews.map((review) => (
                  <div key={review.id} className="border border-orange-200 rounded p-4 mb-3 bg-gray-50">
                    <p className="text-sm text-gray-700"><strong>{review.user_name}</strong> rated <strong>{review.rating}</strong> ⭐</p>
                    <p className="text-gray-600">{review.message}</p>
                    <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No reviews yet.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select a store to view details</p>
        )}
      </div>
    </div>
  );
}
