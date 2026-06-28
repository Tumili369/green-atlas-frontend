import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import SearchBar from '../components/SearchBar';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { data: stats } = useApi('/trees/stats');

  const handleSearch = (q) => {
    if (q) navigate(`/explore?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="home page-enter">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-circle c1" />
          <div className="hero-circle c2" />
          <div className="hero-circle c3" />
        </div>
        <div className="hero-content">
          <span className="hero-eyebrow">Campus Living Heritage</span>
          <h1 className="hero-title">Every tree.<br /><em>Every story.</em></h1>
          <p className="hero-sub">
            Discover and explore all {stats?.totalTrees?.toLocaleString() || '1,200+'} trees across
            our campus — mapped, identified, and documented for the curious.
          </p>
          <div className="hero-search">
            <SearchBar onSearch={handleSearch} placeholder="Search by name, family, area…" />
          </div>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/explore')}>Browse All Trees</button>
            <button className="btn-ghost"   onClick={() => navigate('/map')}>Open Map</button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      {stats && (
        <section className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{stats.totalTrees?.toLocaleString()}</span>
            <span className="stat-label">Individual Trees</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">{stats.totalSpecies}</span>
            <span className="stat-label">Unique Species</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">{stats.totalAreas}</span>
            <span className="stat-label">Campus Areas</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">{stats.totalFamilies}</span>
            <span className="stat-label">Plant Families</span>
          </div>
        </section>
      )}

      {/* Browse by area */}
      {stats?.areaCounts && (
        <section className="home-section">
          <div className="section-head">
            <h2>Browse by Area</h2>
            <button className="link-btn" onClick={() => navigate('/explore')}>View all →</button>
          </div>
          <div className="area-grid">
            {stats.areaCounts.slice(0, 12).map(a => (
              <button
                key={a._id}
                className="area-chip"
                onClick={() => navigate(`/explore?area=${encodeURIComponent(a._id)}`)}
              >
                <span className="area-name">{a._id}</span>
                <span className="area-count">{a.count}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Top species */}
      {stats?.speciesCounts && (
        <section className="home-section alt-bg">
          <div className="section-head">
            <h2>Most Common Species</h2>
            <button className="link-btn" onClick={() => navigate('/explore')}>See all →</button>
          </div>
          <div className="species-list">
            {stats.speciesCounts.slice(0, 8).map((s, i) => (
              <button
                key={s._id}
                className="species-row"
                onClick={() => navigate(`/explore?q=${encodeURIComponent(s._id)}`)}
              >
                <span className="species-rank">{String(i + 1).padStart(2, '0')}</span>
                <div className="species-names">
                  <span className="species-common">{s._id}</span>
                  <span className="species-botanical">{s.botanical}</span>
                </div>
                <span className="species-count-pill">{s.count} trees</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="home-cta">
        <h2>See them all on the map</h2>
        <p>Every geo-tagged tree visualised in one interactive view.</p>
        <button className="btn-primary" onClick={() => navigate('/map')}>Open Campus Map →</button>
      </section>
    </div>
  );
}
