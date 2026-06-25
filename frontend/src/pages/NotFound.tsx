import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, LogIn } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

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
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 0 }}></div>

      <div className="login-card animate-slide-up relative z-10 flex flex-col items-center text-center" style={{ padding: '3rem 2rem' }}>
        
        <div className="w-20 h-20 rounded-full bg-[rgba(239,68,68,0.2)] border-2 border-red-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
        
        <h1 className="text-h1 mb-2 text-white" style={{ fontSize: '4rem', lineHeight: '1' }}>404</h1>
        <h2 className="text-h2 mb-4 text-[var(--accent-color)]">Página no encontrada</h2>
        
        <p className="text-muted mb-8 max-w-[280px]">
          Parece que te has perdido en el bar. La ruta que buscas no existe o ha sido movida.
        </p>

        <button 
          onClick={() => navigate('/login')}
          className="btn-premium w-full flex items-center justify-center gap-2"
        >
          <LogIn size={20} /> Volver al Inicio
        </button>
      </div>
    </div>
  );
};
