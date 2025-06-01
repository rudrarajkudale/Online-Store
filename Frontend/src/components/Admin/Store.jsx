import React, { useEffect, useState } from 'react';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import StoreForm from './StoreForm';
import { toast } from 'react-toastify';

const Store = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [editingStore, setEditingStore] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const fetchStores = () => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/stores`)
      .then(res => res.json())
      .then(data => {
        console.log('Stores data:', data);
        setStores(data);
      })
      .catch(err => {
        console.error('Error fetching stores:', err);
        toast.error('Failed to fetch stores');
      });
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this store?')) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/stores/${id}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          toast.success('Store deleted');
          fetchStores();
        } else {
          toast.error(data.error || 'Delete failed');
        }
      })
      .catch(() => toast.error('Delete failed'));
  };

  const openAddForm = () => {
    setEditingStore(null);
    setShowForm(true);
  };

  const openEditForm = (store) => {
    setEditingStore(store);
    setShowForm(true);
  };

  const closeForm = (refresh = false) => {
    setShowForm(false);
    setEditingStore(null);
    if (refresh) fetchStores();
  };

  const setSort = (key, direction) => {
    setSortConfig({ key, direction });
  };

  const filteredAndSortedStores = stores
    .filter(
      (store) =>
        store.name.toLowerCase().includes(search.toLowerCase()) ||
        (store.address && store.address.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      let valA = a[sortConfig.key] ?? '';
      let valB = b[sortConfig.key] ?? '';

      if (sortConfig.key === 'id' || sortConfig.key === 'average_rating') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded shadow-md flex items-center transition"
          onClick={openAddForm}
        >
          <FaPlus className="mr-2" /> Add Store
        </button>
        <input
          type="text"
          placeholder="Search stores by name or address"
          className="border border-orange-400 focus:border-orange-600 p-2 rounded flex-grow max-w-sm transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto border-2 border-orange-400 rounded-lg shadow-lg">
        <table className="w-full border-collapse border border-orange-400">
          <thead className="bg-orange-200 text-orange-900 font-semibold">
            <tr>
              <th style={{ width: '8%' }} className="border border-orange-400 px-4 py-2 text-left">
                <div className="flex items-center space-x-1 select-none">
                  <span>ID</span>
                  <button onClick={() => setSort('id', 'asc')} className="text-sm hover:text-orange-700">▲</button>
                  <button onClick={() => setSort('id', 'desc')} className="text-sm hover:text-orange-700">▼</button>
                </div>
              </th>
              <th style={{ width: '20%' }} className="border border-orange-400 px-4 py-2 text-left">
                <div className="flex items-center space-x-1 select-none">
                  <span>Name</span>
                  <button onClick={() => setSort('name', 'asc')} className="text-sm hover:text-orange-700">▲</button>
                  <button onClick={() => setSort('name', 'desc')} className="text-sm hover:text-orange-700">▼</button>
                </div>
              </th>
              <th style={{ width: '20%' }} className="border border-orange-400 px-4 py-2 text-left">
                <div className="flex items-center space-x-1 select-none">
                  <span>Email</span>
                  <button onClick={() => setSort('email', 'asc')} className="text-sm hover:text-orange-700">▲</button>
                  <button onClick={() => setSort('email', 'desc')} className="text-sm hover:text-orange-700">▼</button>
                </div>
              </th>
              <th style={{ width: '25%' }} className="border border-orange-400 px-4 py-2 text-left">Address</th>
              <th style={{ width: '12%' }} className="border border-orange-400 px-4 py-2 text-left">
                <div className="flex items-center space-x-1 select-none">
                  <span>Rating</span>
                  <button onClick={() => setSort('average_rating', 'asc')} className="text-sm hover:text-orange-700">▲</button>
                  <button onClick={() => setSort('average_rating', 'desc')} className="text-sm hover:text-orange-700">▼</button>
                </div>
              </th>
              <th style={{ width: '15%' }} className="border border-orange-400 px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedStores.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-orange-600 font-semibold">
                  No stores found.
                </td>
              </tr>
            ) : (
              filteredAndSortedStores.map((store, index) => (
                <tr
                  key={store.id ?? `store-${index}`}
                  className="bg-white hover:bg-orange-50 transition"
                >
                  <td className="border border-orange-400 px-4 py-2">{store.id}</td>
                  <td className="border border-orange-400 px-4 py-2">{store.name}</td>
                  <td className="border border-orange-400 px-4 py-2">{store.email}</td>
                  <td className="border border-orange-400 px-4 py-2">{store.address}</td>
                  <td className="border border-orange-400 px-4 py-2">
                    {store.average_rating && store.average_rating > 0
                      ? store.average_rating
                      : '—'}
                  </td>
                  <td className="border border-orange-400 px-4 py-2 space-x-4 text-center text-xl text-orange-600">
                    <button
                      onClick={() => openEditForm(store)}
                      title="Edit Store"
                      className="hover:text-orange-800 transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(store.id)}
                      title="Delete Store"
                      className="hover:text-red-700 text-red-600 transition"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && <StoreForm store={editingStore} onClose={closeForm} />}
    </div>
  );
};

export default Store;
