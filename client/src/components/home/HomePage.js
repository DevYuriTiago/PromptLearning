import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, contentService } from '../../services/supabaseService';
import FeaturedModule from './FeaturedModule';
import ModuleRow from './ModuleRow';
import SearchBar from '../common/SearchBar';
import UserProgress from '../common/UserProgress';
import ModuleCard from '../modules/ModuleCard';
import './HomePage.css';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState({
    featured: [],
    inProgress: [],
    recommended: [],
    popular: [],
    newReleases: []
  });
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data: { user } } = await authService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Carregar módulos em destaque
      const featured = await contentService.getFeaturedModules();
      
      // Carregar módulos em progresso do usuário
      const progress = await contentService.getUserProgress(user.id);
      const inProgress = progress.filter(p => !p.completed);
      
      // Carregar recomendações baseadas no histórico
      const recommended = await contentService.getRecommendedModules(user.id);
      
      // Carregar módulos populares
      const popular = await contentService.getPopularModules();
      
      // Carregar lançamentos
      const newReleases = await contentService.getNewReleases();
      
      // Carregar categorias
      const categories = await contentService.getCategories();

      setModules({
        featured,
        inProgress,
        recommended,
        popular,
        newReleases
      });
      setCategories(categories);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    
    try {
      const results = await contentService.searchModules(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro na busca:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Carregando sua experiência personalizada...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <SearchBar onSearch={handleSearch} />
        <UserProgress />
      </header>

      {searchResults ? (
        <div className="search-results">
          <h2>Resultados da Busca</h2>
          <div className="results-grid">
            {searchResults.map(module => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {modules.featured.length > 0 && (
            <FeaturedModule module={modules.featured[0]} />
          )}

          {modules.inProgress.length > 0 && (
            <ModuleRow
              title="Continue Aprendendo"
              modules={modules.inProgress}
              showProgress
            />
          )}

          <ModuleRow
            title="Recomendados para Você"
            modules={modules.recommended}
          />

          <ModuleRow
            title="Mais Populares"
            modules={modules.popular}
          />

          <ModuleRow
            title="Lançamentos"
            modules={modules.newReleases}
          />

          {categories.map(category => (
            <ModuleRow
              key={category.id}
              title={category.name}
              modules={modules[category.id] || []}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default HomePage;
