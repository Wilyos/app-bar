import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle } from 'lucide-react';
import { Scanner as ReactQRScanner } from '@yudiel/react-qr-scanner';

export const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const [scanned, setScanned] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleScan = (text: string) => {
    if (scanned || !text) return;
    
    try {
      const data = JSON.parse(text);
      if (data.type === 'claim_points' && data.token) {
        setScanned(true);
        // Simulate API validation
        setSuccessMessage('¡Puntos y Monedas reclamados con éxito!');
        
        // Wait and redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2500);
      } else {
        alert('Código QR no válido para esta aplicación.');
      }
    } catch (e) {
      alert('Formato de QR inválido.');
    }
  };

  return (
    <div className="glass-panel flex flex-col min-h-screen p-6 animate-slide-up relative overflow-hidden">
      <header className="flex justify-end mb-8 relative z-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-full bg-[#1a1d24] border border-[#2b303b] flex items-center justify-center text-muted hover:text-white"
        >
          <X size={20} />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        <h2 className="text-h2 mb-4 text-center">Escanear Código</h2>
        <p className="text-muted text-center mb-8 max-w-[280px]">
          Apunta con la cámara al código QR generado por el mesero para recibir tus XP y Monedas.
        </p>

        {!scanned ? (
          <div className="relative w-full max-w-sm rounded-xl overflow-hidden shadow-[0_0_30px_rgba(230,0,126,0.3)] border-2 border-[var(--primary-color)]">
            <ReactQRScanner
              onScan={(result) => {
                if (result && result.length > 0) {
                  handleScan(result[0].rawValue);
                }
              }}
              onError={(error) => console.error(error)}
              components={{
                finder: false
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-[#1a1d24] border border-[var(--accent-color)] p-8 rounded-2xl animate-scale-in">
            <CheckCircle size={64} className="text-[var(--accent-color)] mb-4" />
            <h3 className="text-h3 text-white text-center mb-2">¡Éxito!</h3>
            <p className="text-[var(--accent-color)] text-center font-medium">
              {successMessage}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
