import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Store() {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userId = user.id;

  useEffect(() => {
    if (!userId) {
      setError('User not logged in');
      return;
    }

    fetch(`${BACKEND_URL}/stores`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setStores(data);
        setFilteredStores(data);
        setError(null);
      })
      .catch(err => {
        console.error('Failed to fetch stores:', err);
        setError('Failed to fetch stores');
      });
  }, [userId]);

  const handleSearch = (term) => {
    const lowerTerm = term.toLowerCase();
    const filtered = stores.filter(store =>
      store.name.toLowerCase().includes(lowerTerm) ||
      (store.address && store.address.toLowerCase().includes(lowerTerm))
    );
    setFilteredStores(filtered);
  };

  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  return (
    <div>
      <div className="absolute top-0 z-10 h-20 flex items-center px-4 -mt-1 max-w-md mx-auto left-0 right-0">
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search stores by name or address..."
          className="p-2 border-2 border-orange-500 text-orange-600 placeholder-orange-300 rounded w-full max-w-md mx-auto focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div className="pt-24 px-6">
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 -mt-20">
          {filteredStores.length === 0 ? (
            <p className="text-center col-span-full">No stores found.</p>
          ) : (
            filteredStores.map((store) => {
              const reviews = store.reviews || [];
              const reviewCount = store.review_count;
              const avgRating = store.rating !== null && store.rating !== undefined ? store.rating : 'No rating';

              return (
                <div
                  key={store.id}
                  className="bg-white border-2 border-orange-500 rounded-lg shadow p-4 flex flex-col justify-between hover:shadow-lg transition cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/store/${store.id}`)}
                >
                  <div className="break-words whitespace-normal">
                    <h2 className="text-xl font-semibold text-orange-600 mb-1">{store.name}</h2>
                    <p className="text-sm text-gray-600">{store.address || 'No address'}</p>
                  </div>
                  <div className="break-words whitespace-normal mt-4">
                    <p className="text-sm text-orange-600 mb-1">
                      <strong>Average Rating:</strong> {avgRating} / 5
                    </p>
                    <p className="text-sm text-orange-600">
                      <strong>Total Reviews:</strong> {reviewCount}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
