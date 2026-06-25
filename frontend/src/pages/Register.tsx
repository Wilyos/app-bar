import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { UserCheck } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
    } else {
      setPhone(user.phoneNumber || '');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          name: name.trim(),
          phone: phone
        })
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        const data = await response.json();
        // Si el usuario ya existe, lo mandamos al dashboard
        if (response.status === 400 && data.error === "El usuario ya existe.") {
            navigate('/dashboard');
            return;
        }
        setError(data.error || 'Error al registrar usuario');
      }
    } catch (err: any) {
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden"
      style={{
        width: '100%',
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 0 }}></div>

      <div className="login-card animate-slide-up relative z-10" style={{ padding: '2.5rem' }}>
        
        <div className="mb-4 flex justify-center w-full">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', boxShadow: '0 0 20px var(--primary-transparent)' }}>
            <UserCheck size={32} color="white" />
          </div>
        </div>
        
        <h1 className="text-h2 mb-2 text-center" style={{ color: 'white', letterSpacing: '-0.5px' }}>¡Casi Listo!</h1>
        <p className="text-muted text-center mb-8" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
          Para completar tu perfil y empezar a acumular recompensas, dinos cómo te llamas.
        </p>

        {error && (
          <div style={{ width: '100%', padding: '1rem', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', borderRadius: '0.75rem', fontSize: '0.875rem', textAlign: 'center', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#9ca3af', marginLeft: '0.25rem' }}>Tu Nombre</label>
            <input 
              type="text" 
              id="name"
              placeholder="Ej. Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-premium"
              required
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="phone" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#9ca3af', marginLeft: '0.25rem' }}>Tu Celular</label>
            <input 
              type="text" 
              id="phone"
              value={phone}
              className="input-premium"
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
              disabled
            />
          </div>

          <button 
            type="submit" 
            className="btn-premium"
            disabled={isLoading || name.length < 2}
          >
            {isLoading ? 'Guardando...' : 'Completar Registro'}
          </button>
        </form>
      </div>
    </div>
  );
};
