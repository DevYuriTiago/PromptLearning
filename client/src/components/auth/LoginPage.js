import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/supabaseService';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Erro de login:', err);
      setError(
        err.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos. Se você é um novo usuário, registre-se primeiro.'
          : 'Ocorreu um erro durante o login. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const initializeAdmin = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await authService.initializeDefaultAdmin();
      
      if (result.existing) {
        setSuccess('Usuário admin já existe. Use as credenciais abaixo para fazer login:');
      } else {
        setSuccess('Usuário admin criado com sucesso! Use as credenciais abaixo para fazer login:');
      }

      setEmail(result.email);
      setPassword(result.password);
    } catch (err) {
      console.error('Erro ao criar admin:', err);
      setError('Não foi possível criar o usuário admin. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            <p>{success}</p>
            <p>Email: {email}</p>
            <p>Senha: {password}</p>
            <p className="warning">Por favor, altere a senha após o primeiro login.</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-links">
          <button 
            className="link-button"
            onClick={() => navigate('/register')}
            disabled={loading}
          >
            Não tem uma conta? Registre-se
          </button>
          <button 
            className="link-button admin-button"
            onClick={initializeAdmin}
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Criar Usuário Admin Inicial'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
