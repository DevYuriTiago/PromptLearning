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
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }

      // Carregar módulos
      const { data: allModules, error: modulesError } = await contentService.getModules();
      if (modulesError) throw modulesError;

      // Carregar progresso do usuário
      const { data: progress, error: progressError } = await contentService.getStudentProgress(currentUser.id);
      if (progressError) throw progressError;

      // Filtrar módulos
      const featured = allModules?.filter(m => m.featured) || [];
      const inProgress = progress?.filter(p => p.status === 'in_progress').map(p => ({
        ...p.module,
        progress: p.progress
      })) || [];
      const recommended = allModules?.filter(m => m.recommended) || [];
      const popular = allModules?.sort((a, b) => b.views - a.views).slice(0, 5) || [];
      const newReleases = allModules?.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 5) || [];

      setModules({
        featured,
        inProgress,
        recommended,
        popular,
        newReleases
      });

      // Carregar categorias
      const uniqueCategories = [...new Set(allModules?.map(m => m.category))];
      setCategories(uniqueCategories);

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
              key={category}
              title={category}
              modules={modules.featured.filter(m => m.category === category)}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default HomePage;
