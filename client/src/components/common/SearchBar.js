import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setIsExpanded(false);
    }
  };

  return (
    <div className={`search-bar ${isExpanded ? 'expanded' : ''}`}>
      <form onSubmit={handleSubmit}>
        <button
          type="button"
          className="search-icon"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <i className="fas fa-search"></i>
        </button>
        
        <input
          type="search"
          placeholder="Buscar módulos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onBlur={() => !query && setIsExpanded(false)}
        />
        
        {query && (
          <button
            type="button"
            className="clear-button"
            onClick={() => {
              setQuery('');
              setIsExpanded(false);
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
