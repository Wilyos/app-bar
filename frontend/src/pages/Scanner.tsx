import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { auth } from '../firebase';

export const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const [scanned, setScanned] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (scanned) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        handleScan(decodedText);
      },
      (_error) => {
        // Ignorar errores de escaneo continuo
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [scanned]);

  const handleScan = async (text: string) => {
    if (scanned || !text) return;
    
    try {
      const data = JSON.parse(text);
      if (data.type === 'claim_points' && data.token) {
        setScanned(true);
        
        const user = auth.currentUser;
        if (!user) {
          alert('Debes iniciar sesión para reclamar puntos.');
          navigate('/login');
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/qr/claim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrId: data.token, userId: user.uid })
        });
        
        const result = await response.json();

        if (response.ok) {
          setSuccessMessage(result.message);
          setTimeout(() => {
            navigate('/dashboard');
          }, 2500);
        } else {
          setSuccessMessage('Error: ' + result.error);
          setTimeout(() => {
            setScanned(false);
          }, 3000);
        }
      } else {
        alert('Código QR no válido para esta aplicación.');
        setScanned(false);
      }
    } catch (e) {
      // Ignore non-JSON parsing errors if scanner reads something else
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
          Apunta con la cámara o sube una foto del código QR generado por el mesero.
        </p>

        {!scanned ? (
          <div className="relative w-full max-w-sm rounded-xl overflow-hidden shadow-[0_0_30px_rgba(230,0,126,0.3)] border-2 border-[var(--primary-color)] bg-white">
            {/* HTML5 QR Code injects its own UI here, including file upload */}
            <div id="reader" className="w-full"></div>
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
