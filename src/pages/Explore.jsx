import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import TreeCard from '../components/TreeCard';
import './Explore.css';

const BASE = import.meta.env.VITE_API_URL;

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trees,   setTrees]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [areas,   setAreas]   = useState([]);

  const q      = searchParams.get('q')    || '';
  const area   = searchParams.get('area') || '';
  const family = searchParams.get('family') || '';
  const page   = Number(searchParams.get('page') || 1);

  // Load areas for filter sidebar
  useEffect(() => {
    axios.get(`${BASE}/areas`).then(r => setAreas(r.data)).catch(() => {});
  }, []);

  // Load trees whenever filters change
  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 60 };
    if (q)      params.q      = q;
    if (area)   params.area   = area;
    if (family) params.family = family;

    axios.get(`${BASE}/trees`, { params })
      .then(r => {
        setTrees(r.data.trees);
        setTotal(r.data.total);
        setPages(r.data.pages);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(() => setLoading(false));
  }, [q, area, family, page]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});

  return (
    <div className="explore page-enter">
      {/* Header */}
      <div className="explore-header">
        <div className="explore-header-inner">
          <h1>Explore Trees</h1>
          <p>{total > 0 ? `${total.toLocaleString()} trees found` : 'Search our campus collection'}</p>
          <SearchBar onSearch={(v) => setFilter('q', v)} initialValue={q} />
        </div>
      </div>

      <div className="explore-body">
        {/* Sidebar */}
        <aside className="explore-sidebar">
          <div className="sidebar-section">
            <h3>Filter by Area</h3>
            <button
              className={`sidebar-opt ${!area ? 'active' : ''}`}
              onClick={() => setFilter('area', '')}
            >All areas</button>
            {areas.map(a => (
              <button
                key={a._id}
                className={`sidebar-opt ${area === a.area ? 'active' : ''}`}
                onClick={() => setFilter('area', a.area)}
              >{a.area}</button>
            ))}
          </div>
          {(q || area || family) && (
            <button className="clear-filters" onClick={clearAll}>✕ Clear all filters</button>
          )}
        </aside>

        {/* Results */}
        <main className="explore-main">
          {/* Active filters */}
          {(q || area || family) && (
            <div className="active-filters">
              {q      && <span className="filter-tag">"{q}" <button onClick={() => setFilter('q','')}>✕</button></span>}
              {area   && <span className="filter-tag">Area: {area} <button onClick={() => setFilter('area','')}>✕</button></span>}
              {family && <span className="filter-tag">Family: {family} <button onClick={() => setFilter('family','')}>✕</button></span>}
            </div>
          )}

          {loading ? (
            <div className="loading-wrap"><div className="spinner" /><p>Loading trees…</p></div>
          ) : trees.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🌱</span>
              <h3>No trees found</h3>
              <p>Try a different search term or clear your filters.</p>
              <button className="btn-primary" onClick={clearAll}>Clear filters</button>
            </div>
          ) : (
            <>
              <div className="tree-grid">
                {trees.map(tree => <TreeCard key={tree._id} tree={tree} />)}
              </div>
              {pages > 1 && (
                <div className="pagination">
                  <button disabled={page <= 1} onClick={() => setFilter('page', page - 1)}>← Prev</button>
                  <span>Page {page} of {pages}</span>
                  <button disabled={page >= pages} onClick={() => setFilter('page', page + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
