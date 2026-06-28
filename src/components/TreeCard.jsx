import { Link } from 'react-router-dom';
import './TreeCard.css';

export default function TreeCard({ tree }) {
  const img = tree.image_link?.split(',')[0]?.trim();
  const isGDrive = img?.includes('drive.google.com');
  // Convert drive share link to direct embed
  const imgSrc = isGDrive
    ? img.replace('/open?id=', '/uc?id=').replace('open?id=', 'uc?id=')
    : img;

  return (
    <Link to={`/tree/${tree._id}`} className="tree-card">
      <div className="tree-card-img">
        {imgSrc
          ? <img src={imgSrc} alt={tree.common_name} loading="lazy" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
          : null
        }
        <div className="tree-card-placeholder" style={{ display: imgSrc ? 'none' : 'flex' }}>🌳</div>
      </div>
      <div className="tree-card-body">
        <span className="tree-card-id">{tree.tree_id}</span>
        <h3 className="tree-card-name">{tree.common_name}</h3>
        <p className="tree-card-botanical">{tree.botanical_name}</p>
        <div className="tree-card-meta">
          <span className="badge badge-family">{tree.family}</span>
          <span className="tree-card-area">📍 {tree.area}</span>
        </div>
      </div>
    </Link>
  );
}
