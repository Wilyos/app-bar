import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut, RefreshCcw, Tag, DollarSign } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'points' | 'promo'>('points');
  const [invoiceValue, setInvoiceValue] = useState<string>('');
  const [promoTitle, setPromoTitle] = useState<string>('');
  const [promoDesc, setPromoDesc] = useState<string>('');
  const [qrData, setQrData] = useState<string | null>(null);
  const [qrMeta, setQrMeta] = useState<any>(null);
  const navigate = useNavigate();

  // Calcula XP y Monedas basado en el valor facturado
  const numericValue = parseFloat(invoiceValue) || 0;
  const xpAmount = Math.floor(numericValue * 0.001);
  const coinsAmount = Math.floor(numericValue * 0.0001);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'points' && numericValue <= 0) return;
    if (activeTab === 'promo' && promoTitle.length === 0) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      let endpoint = '';
      let body = {};
      
      if (activeTab === 'points') {
        endpoint = '/api/qr/generate';
        body = { xp: xpAmount, coins: coinsAmount };
      } else {
        endpoint = '/api/qr/generate/promo';
        body = { title: promoTitle, description: promoDesc };
      }
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      
      if (response.ok) {
        if (activeTab === 'points') {
          setQrData(JSON.stringify({ type: 'claim_points', token: data.qrId }));
          setQrMeta({ type: 'points', xp: xpAmount, coins: coinsAmount, value: numericValue });
        } else {
          setQrData(JSON.stringify({ type: 'claim_promo', token: data.qrId }));
          setQrMeta({ type: 'promo', title: promoTitle, description: promoDesc });
        }
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
      <header className="flex justify-between items-center mb-6 mt-4">
        <div>
          <h2 className="text-h2 text-white">Panel de Mesero</h2>
          <p className="text-muted">Genera un QR para el cliente</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {!qrData ? (
          <div className="w-full max-w-sm">
            <div className="flex bg-[#1a1d24] rounded-full p-1.5 mb-8 border border-[#2b303b] shadow-inner w-full max-w-sm mx-auto">
              <button 
                onClick={() => setActiveTab('points')}
                className={`flex-1 py-3 text-sm font-bold rounded-full flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'points' ? 'bg-gradient-to-r from-[#e6007e] to-[#662383] text-white shadow-[0_0_15px_rgba(230,0,126,0.4)] scale-[1.02]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <DollarSign size={18} /> Generar Puntos
              </button>
              <button 
                onClick={() => setActiveTab('promo')}
                className={`flex-1 py-3 text-sm font-bold rounded-full flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'promo' ? 'bg-gradient-to-r from-[#662383] to-[#94c11f] text-white shadow-[0_0_15px_rgba(148,193,31,0.4)] scale-[1.02]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Tag size={18} /> Crear Promo
              </button>
            </div>

            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              {activeTab === 'points' ? (
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
                    <p className="text-sm text-white mt-2 bg-white/10 p-3 rounded-md animate-scale-in">
                      Otorgará: <strong className="text-[var(--primary-color)]">{xpAmount} XP</strong> y <strong className="text-[var(--accent-color)]">{coinsAmount} Monedas</strong>
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-body font-medium text-muted">Título de la Promoción</label>
                    <input 
                      type="text" 
                      value={promoTitle}
                      onChange={(e) => setPromoTitle(e.target.value)}
                      placeholder="Ej. 10% Dcto en Cocteles"
                      className="w-full p-4 text-lg font-bold rounded-md border border-[#2b303b] bg-[#1a1d24] text-white focus:outline-none focus:border-[var(--secondary-color)] transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-body font-medium text-muted">Descripción (Opcional)</label>
                    <input 
                      type="text" 
                      value={promoDesc}
                      onChange={(e) => setPromoDesc(e.target.value)}
                      placeholder="Valido solo hoy"
                      className="w-full p-3 text-sm rounded-md border border-[#2b303b] bg-[#1a1d24] text-white focus:outline-none focus:border-[var(--secondary-color)] transition-colors"
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full" disabled={activeTab === 'points' ? numericValue <= 0 : promoTitle.length === 0}>
                Generar Código QR
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 mt-4">
            <div className={`p-4 rounded-2xl shadow-[0_0_30px_var(--primary-transparent)] animate-slide-up ${qrMeta?.type === 'promo' ? 'bg-gradient-to-br from-[#1a1d24] to-[#2b303b] border-2 border-[var(--secondary-color)]' : 'bg-white'}`}>
              <QRCodeSVG value={qrData} size={250} includeMargin={true} fgColor={qrMeta?.type === 'promo' ? "#ffffff" : "#000000"} bgColor={qrMeta?.type === 'promo' ? "transparent" : "#ffffff"} />
            </div>
            
            <p className="text-center text-lg text-white font-medium">
              Muestra este código al cliente
            </p>
            
            {qrMeta?.type === 'points' ? (
              <>
                <p className="text-center text-sm text-muted">
                  Por una compra de ${qrMeta.value.toLocaleString()}
                </p>
                <div className="flex gap-4 mb-4">
                  <span className="bg-[#2b303b] px-3 py-1 rounded-full text-[var(--primary-color)] font-bold">{qrMeta.xp} XP</span>
                  <span className="bg-[#2b303b] px-3 py-1 rounded-full text-[var(--accent-color)] font-bold">{qrMeta.coins} Monedas</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 mb-4">
                <span className="bg-[var(--secondary-color)] bg-opacity-20 border border-[var(--secondary-color)] px-4 py-2 rounded-full text-white font-bold text-center">
                  🎁 {qrMeta?.title}
                </span>
                {qrMeta?.description && (
                  <p className="text-sm text-muted text-center max-w-[250px]">{qrMeta.description}</p>
                )}
              </div>
            )}
            
            <button 
              onClick={() => {
                setQrData(null);
                setInvoiceValue('');
                setPromoTitle('');
                setPromoDesc('');
              }}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCcw size={18} /> Generar Otro
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
