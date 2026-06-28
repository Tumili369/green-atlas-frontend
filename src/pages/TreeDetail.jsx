import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TreeDetail.css';

const BASE = import.meta.env.VITE_API_URL;

function InfoRow({ label, value }) {
  if (!value || value === 'N/A' || value === 'NA') return null;
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}

function Section({ title, icon, children, isEmpty }) {
  if (isEmpty) return null;
  return (
    <div className="detail-section">
      <h3 className="section-title"><span className="section-icon">{icon}</span>{title}</h3>
      <div className="section-body">{children}</div>
    </div>
  );
}

export default function TreeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tree,    setTree]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx,  setImgIdx]  = useState(0);

  useEffect(() => {
    setLoading(true);
    axios.get(`${BASE}/trees/${id}`)
      .then(r => { setTree(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-wrap"><div className="spinner"/><p>Loading tree…</p></div>;
  if (!tree)   return <div className="loading-wrap"><p>Tree not found.</p></div>;

  const sp = tree.species_data;

  const imgs = (tree.image_link || '').split(',').map(s => {
    const url = s.trim();
    if (!url) return null;
    return url.includes('drive.google.com')
      ? url.replace('/open?id=', '/uc?id=').replace('open?id=', 'uc?id=')
      : url;
  }).filter(Boolean);

  const hasGrowth   = sp && (sp.avg_height || sp.lifespan || sp.growth_rate || sp.flowering_season || sp.fruiting_season || sp.pollination_method);
  const hasEcology  = sp && (sp.wildlife_supported || sp.ecological_importance || sp.environmental_benefits || sp.conservation_status);
  const hasUses     = sp && (sp.medicinal_uses || sp.economic_uses || sp.cultural_significance);
  const hasTaxonomy = sp && (sp.kingdom || sp.division || sp.class || sp.order || sp.genus || sp.species || sp.origin);

  const openMapLocation = () => {
    if (tree.latitude && tree.longitude) {
      navigate(`/map?lat=${tree.latitude}&lng=${tree.longitude}&id=${tree._id}`);
    }
  };

  return (
    <div className="tree-detail page-enter">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="detail-layout">
        {/* ── LEFT ── */}
        <div className="detail-left">
          {/* Image gallery */}
          <div className="gallery">
            <div className="gallery-main">
              {imgs.length > 0
                ? <img src={imgs[imgIdx]} alt={tree.common_name}
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}/>
                : null}
              <div className="gallery-placeholder" style={{ display: imgs.length > 0 ? 'none' : 'flex' }}>🌳</div>
            </div>
            {imgs.length > 1 && (
              <div className="gallery-thumbs">
                {imgs.map((src, i) => (
                  <button key={i} className={`thumb ${i === imgIdx ? 'active' : ''}`} onClick={() => setImgIdx(i)}>
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick facts */}
          <div className="quick-facts">
            {tree.area       && <div className="fact"><span>📍</span><span>{tree.area}</span></div>}
            {tree.family     && <div className="fact"><span>🌿</span><span>{tree.family}</span></div>}
            {tree.age        && <div className="fact"><span>🕰</span><span>{tree.age} yrs old</span></div>}
            {sp?.native_exotic && (
              <div className="fact">
                <span className={`badge ${sp.native_exotic.toLowerCase().includes('native') ? 'badge-native' : 'badge-exotic'}`}>
                  {sp.native_exotic}
                </span>
              </div>
            )}
            {sp?.conservation_status && (
              <div className="fact"><span>🛡</span><span>{sp.conservation_status}</span></div>
            )}
          </div>

          {/* Map button */}
          {tree.latitude && tree.longitude && (
            <button className="map-location-btn" onClick={openMapLocation}>
              <span className="map-btn-icon">🗺</span>
              <div>
                <span className="map-btn-title">View on Campus Map</span>
                <span className="map-btn-coords">{Number(tree.latitude).toFixed(5)}, {Number(tree.longitude).toFixed(5)}</span>
              </div>
              <span className="map-btn-arrow">→</span>
            </button>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className="detail-right">
          <div className="detail-header">
            <span className="detail-tree-id">{tree.tree_id}</span>
            <h1 className="detail-common">{tree.common_name}</h1>
            {sp?.tamil_name && sp.tamil_name !== 'N/A' && (
              <p className="detail-tamil">{sp.tamil_name}</p>
            )}
            <p className="detail-botanical">{tree.botanical_name}</p>
          </div>

          {sp?.general_description && sp.general_description !== 'N/A' && (
            <p className="detail-description">{sp.general_description}</p>
          )}

          {!sp && (
            <div className="no-species-note">
              ℹ️ Detailed species information is not yet available for this tree.
            </div>
          )}

          {/* Taxonomy */}
          <Section title="Taxonomy" icon="🔬" isEmpty={!hasTaxonomy}>
            <InfoRow label="Kingdom"    value={sp?.kingdom} />
            <InfoRow label="Division"   value={sp?.division} />
            <InfoRow label="Class"      value={sp?.class} />
            <InfoRow label="Order"      value={sp?.order} />
            <InfoRow label="Family"     value={tree.family} />
            <InfoRow label="Genus"      value={sp?.genus} />
            <InfoRow label="Species"    value={sp?.species} />
            <InfoRow label="Origin"     value={sp?.origin} />
            <InfoRow label="Name means" value={sp?.name_breakdown} />
          </Section>

          {/* Growth */}
          <Section title="Growth & Lifecycle" icon="🌿" isEmpty={!hasGrowth}>
            <InfoRow label="Average Height"   value={sp?.avg_height} />
            <InfoRow label="Lifespan"         value={sp?.lifespan} />
            <InfoRow label="Growth Rate"      value={sp?.growth_rate} />
            <InfoRow label="Flowering Season" value={sp?.flowering_season} />
            <InfoRow label="Fruiting Season"  value={sp?.fruiting_season} />
            <InfoRow label="Pollination"      value={sp?.pollination_method} />
          </Section>

          {/* Ecology */}
          <Section title="Ecology & Wildlife" icon="🐦" isEmpty={!hasEcology}>
            <InfoRow label="Wildlife Supported"      value={sp?.wildlife_supported} />
            <InfoRow label="Ecological Importance"   value={sp?.ecological_importance} />
            <InfoRow label="Environmental Benefits"  value={sp?.environmental_benefits} />
            <InfoRow label="Conservation Status"     value={sp?.conservation_status} />
          </Section>

          {/* Uses */}
          <Section title="Uses & Significance" icon="🌾" isEmpty={!hasUses}>
            <InfoRow label="Medicinal Uses"        value={sp?.medicinal_uses} />
            <InfoRow label="Economic Uses"         value={sp?.economic_uses} />
            <InfoRow label="Cultural Significance" value={sp?.cultural_significance} />
          </Section>

          {sp?.interesting_facts && sp.interesting_facts !== 'N/A' && (
            <div className="interesting-facts">
              <h3>✨ Did you know?</h3>
              <p>{sp.interesting_facts}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}