import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut, RefreshCcw } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export const AdminPanel: React.FC = () => {
  const [invoiceValue, setInvoiceValue] = useState<string>('');
  const [qrData, setQrData] = useState<string | null>(null);
  const navigate = useNavigate();

  // Calcula XP y Monedas basado en el valor facturado
  const numericValue = parseFloat(invoiceValue) || 0;
  const xpAmount = Math.floor(numericValue * 0.001);
  const coinsAmount = Math.floor(numericValue * 0.0001);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericValue <= 0) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/qr/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: xpAmount, coins: coinsAmount })
      });
      const data = await response.json();
      
      if (response.ok) {
        const payload = JSON.stringify({ type: 'claim_points', token: data.qrId });
        setQrData(payload);
      } else {
        alert("Error al generar QR: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="glass-panel flex flex-col min-h-screen p-6 animate-slide-up relative">
      <header className="flex justify-between items-center mb-8 mt-4">
        <div>
          <h2 className="text-h2 text-white">Panel de Mesero</h2>
          <p className="text-muted">Genera un QR para el cliente</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {!qrData ? (
          <form onSubmit={handleGenerate} className="w-full max-w-sm flex flex-col gap-4">
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-body font-medium text-muted">Valor de la Factura ($)</label>
              <input 
                type="number" 
                value={invoiceValue}
                onChange={(e) => setInvoiceValue(e.target.value)}
                placeholder="Ej. 200000"
                className="w-full p-4 text-xl font-bold rounded-md border border-[#2b303b] bg-[#1a1d24] text-[var(--accent-color)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                required
              />
              {numericValue > 0 && (
                <p className="text-sm text-white mt-2 bg-white/10 p-3 rounded-md">
                  Otorgará: <strong className="text-[var(--primary-color)]">{xpAmount} XP</strong> y <strong className="text-[var(--accent-color)]">{coinsAmount} Monedas</strong>
                </p>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={numericValue <= 0}>
              Generar Código QR
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-6 mt-8">
            <div className="bg-white p-4 rounded-2xl shadow-[0_0_30px_var(--primary-transparent)] animate-slide-up">
              <QRCodeSVG value={qrData} size={250} includeMargin={true} />
            </div>
            <p className="text-center text-lg text-white font-medium">
              Muestra este código al cliente
            </p>
            <p className="text-center text-sm text-muted">
              Por una compra de ${numericValue.toLocaleString()}
            </p>
            <div className="flex gap-4 mb-4">
              <span className="bg-[#2b303b] px-3 py-1 rounded-full text-[var(--primary-color)] font-bold">{xpAmount} XP</span>
              <span className="bg-[#2b303b] px-3 py-1 rounded-full text-[var(--accent-color)] font-bold">{coinsAmount} Monedas</span>
            </div>
            <button 
              onClick={() => {
                setQrData(null);
                setInvoiceValue('');
              }}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCcw size={18} /> Nueva Factura
            </button>
          </div>
        )}
      </main>

      <button 
        onClick={handleLogout}
        className="btn btn-secondary mt-8 w-full flex items-center justify-center gap-2"
        style={{ borderColor: 'var(--secondary-color)', color: 'var(--text-main)' }}
      >
        <LogOut size={18} /> Cerrar Sesión
      </button>
    </div>
  );
};
