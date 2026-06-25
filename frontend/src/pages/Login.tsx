import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';

export const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/dashboard');
      }
    });

    // We need to set up the Recaptcha Verifier once the component mounts
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }

    return () => unsubscribe();
  }, [navigate]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const appVerifier = window.recaptchaVerifier;
      // Strip any spaces the user might have typed
      const cleanPhone = phone.replace(/\s+/g, '');
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+57${cleanPhone}`; 
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setShowCodeInput(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al enviar SMS.');
      // Reset recaptcha if error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId: any) => {
          if ((window as any).grecaptcha) {
            (window as any).grecaptcha.reset(widgetId);
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    
    setIsLoading(true);
    setError('');
    try {
      await confirmationResult.confirm(code);
      // User is logged in!
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Código inválido. Intenta de nuevo.');
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
      {/* Overlay para oscurecer la imagen de fondo y dar profundidad */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 0 }}></div>

      <div id="recaptcha-container" style={{ position: 'relative', zIndex: 10 }}></div>
      
      {/* Contenedor Principal (Tarjeta de Cristal) */}
      <div className="login-card animate-slide-up">
        
        {/* Logo */}
        <div className="mb-6 flex justify-center w-full">
          <img 
            src="/logo.png" 
            alt="Logo del Bar" 
            style={{ 
              height: '140px', 
              width: 'auto', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 15px var(--primary-color))' 
            }}
          />
        </div>
        
        <h1 className="text-h1 mb-2 text-center" style={{ color: 'white', letterSpacing: '-0.5px' }}>Bienvenido</h1>
        <p className="text-muted text-center mb-6" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
          Ingresa con tu número de celular para empezar a ganar recompensas y puntos con cada compra.
        </p>

        {error && (
          <div style={{ width: '100%', padding: '1rem', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', borderRadius: '0.75rem', fontSize: '0.875rem', textAlign: 'center', fontWeight: '500' }}>
            {error}
          </div>
        )}

        {!showCodeInput ? (
          <form onSubmit={handleSendCode} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#9ca3af', marginLeft: '0.25rem' }}>Número de Celular</label>
              <input 
                type="tel" 
                id="phone"
                placeholder="+57 300 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-premium"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-premium"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div style={{ width: '1.25rem', height: '1.25rem', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Enviando...
                </span>
              ) : (
                <>
                  Enviar Código SMS <LogIn size={20} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="code" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#9ca3af', marginLeft: '0.25rem' }}>Código SMS de 6 dígitos</label>
              <input 
                type="text" 
                id="code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input-premium input-code"
                required
                maxLength={6}
              />
            </div>

            <button 
              type="submit" 
              className="btn-premium btn-premium-code"
              disabled={isLoading || code.length < 6}
            >
              {isLoading ? 'Verificando...' : 'Confirmar Código'}
            </button>
            
            <button 
              type="button"
              onClick={() => setShowCodeInput(false)}
              className="text-link"
            >
              Cambiar número de teléfono
            </button>
          </form>
        )}
      </div>
      
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
