import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AdminPanel.css';

const BASE = import.meta.env.VITE_API_URL;

const emptyTree = {
  tree_id: '', botanical_name: '', common_name: '', family: '',
  area: '', latitude: '', longitude: '', age: '', notes: '', image_link: ''
};

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab,      setTab]    = useState('trees');
  const [trees,    setTrees]  = useState([]);
  const [search,   setSearch] = useState('');
  const [form,     setForm]   = useState(emptyTree);
  const [editing,  setEditing] = useState(null); // _id of tree being edited
  const [showForm, setShowForm] = useState(false);
  const [loading,  setLoading] = useState(false);
  const [msg,      setMsg]    = useState('');

  useEffect(() => {
    if (!isAdmin) navigate('/login');
  }, [isAdmin]);

  useEffect(() => { fetchTrees(); }, [search]);

  const fetchTrees = () => {
    setLoading(true);
    axios.get(`${BASE}/trees`, { params: { q: search, limit: 100 } })
      .then(r => { setTrees(r.data.trees); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${user.token}` }
  });

  const handleSave = async () => {
    setLoading(true); setMsg('');
    try {
      if (editing) {
        await axios.put(`${BASE}/admin/trees/${editing}`, form, authHeader());
        setMsg('✅ Tree updated successfully');
      } else {
        await axios.post(`${BASE}/admin/trees`, form, authHeader());
        setMsg('✅ New tree added successfully');
      }
      setForm(emptyTree); setEditing(null); setShowForm(false);
      fetchTrees();
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Error saving'}`);
    } finally { setLoading(false); }
  };

  const handleEdit = (tree) => {
    setForm({ ...emptyTree, ...tree });
    setEditing(tree._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tree? This cannot be undone.')) return;
    try {
      await axios.delete(`${BASE}/admin/trees/${id}`, authHeader());
      setMsg('✅ Tree deleted');
      fetchTrees();
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Error'}`);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (!isAdmin) return null;

  return (
    <div className="admin page-enter">
      <div className="admin-header">
        <div>
          <h1>Admin Panel</h1>
          <p>Signed in as <strong>{user?.username}</strong></p>
        </div>
        <button
          className="btn-add"
          onClick={() => { setForm(emptyTree); setEditing(null); setShowForm(true); }}
        >+ Add New Tree</button>
      </div>

      {msg && <div className={`admin-msg ${msg.startsWith('✅') ? 'success' : 'error'}`}>{msg}</div>}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="admin-form-wrap">
          <div className="admin-form-header">
            <h2>{editing ? 'Edit Tree' : 'Add New Tree'}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyTree); }}>✕ Cancel</button>
          </div>
          <div className="admin-form">
            <div className="form-grid">
              {[
                ['tree_id',       'Tree ID',        'text',   '1YBB3001'],
                ['common_name',   'Common Name',    'text',   'Neem'],
                ['botanical_name','Botanical Name', 'text',   'Azadirachta indica'],
                ['family',        'Family',         'text',   'Meliaceae'],
                ['area',          'Campus Area',    'text',   '1st Year Block'],
                ['latitude',      'Latitude',       'number', '11.678'],
                ['longitude',     'Longitude',      'number', '78.127'],
                ['age',           'Age (years)',    'number', '25'],
              ].map(([key, label, type, ph]) => (
                <div className="form-field" key={key}>
                  <label>{label}</label>
                  <input
                    type={type}
                    placeholder={ph}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                  />
                </div>
              ))}
              <div className="form-field full">
                <label>Image Link(s)</label>
                <input type="text" placeholder="Google Drive or image URL (comma-separated)" value={form.image_link} onChange={e => set('image_link', e.target.value)} />
              </div>
              <div className="form-field full">
                <label>Notes</label>
                <textarea rows={2} placeholder="Any additional notes" value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-save" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving…' : editing ? 'Save Changes' : 'Add Tree'}
              </button>
              <button className="btn-cancel" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyTree); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Trees table */}
      <div className="admin-table-wrap">
        <div className="table-toolbar">
          <h2>All Trees</h2>
          <input
            className="table-search"
            placeholder="Search trees…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading && !showForm ? (
          <div className="loading-wrap"><div className="spinner"/></div>
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tree ID</th><th>Common Name</th><th>Botanical Name</th>
                  <th>Family</th><th>Area</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trees.map(tree => (
                  <tr key={tree._id}>
                    <td className="mono">{tree.tree_id}</td>
                    <td><strong>{tree.common_name}</strong></td>
                    <td className="italic">{tree.botanical_name}</td>
                    <td>{tree.family}</td>
                    <td>{tree.area}</td>
                    <td className="table-actions">
                      <button className="btn-edit" onClick={() => handleEdit(tree)}>Edit</button>
                      <button className="btn-del"  onClick={() => handleDelete(tree._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
