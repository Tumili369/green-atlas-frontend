import { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, placeholder = 'Search trees, species, areas…', initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <span className="search-icon">🔍</span>
      <input
        type="text"
        value={value}
        onChange={e => { setValue(e.target.value); if (!e.target.value) onSearch(''); }}
        placeholder={placeholder}
        className="search-input"
      />
      {value && (
        <button type="button" className="search-clear" onClick={handleClear}>✕</button>
      )}
      <button type="submit" className="search-btn">Search</button>
    </form>
  );
}
