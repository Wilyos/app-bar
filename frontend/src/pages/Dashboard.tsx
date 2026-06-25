import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, Award, Coins, QrCode, LogOut, Tag, X, Check, Zap, Sparkles, Crown } from 'lucide-react';
import { ProgressBar } from '../components/ProgressBar';
import { Badge } from '../components/Badge';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  // Promo Modal state
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      fetchUserData(user.uid);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserData = async (uid: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/users/${uid}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else if (response.status === 404) {
        navigate('/register');
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/login');
    });
  };

  const handleRedeemPromo = async () => {
    if (!selectedPromo || !userData?.id) return;
    setIsRedeeming(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/users/promos/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id, promoId: selectedPromo.id })
      });
      
      if (response.ok) {
        alert("¡Promoción validada correctamente!");
        setSelectedPromo(null);
        // Refetch user data to update the UI
        fetchUserData(userData.id);
      } else {
        const data = await response.json();
        alert(data.error || "Error al validar la promoción");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setIsRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
         <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const badges: { id: string; name: string; icon: React.ReactNode; theme: 'primary' | 'secondary' | 'accent' }[] = [
    { id: 'nuevo_cliente', name: "Nuevo Cliente", icon: <Star size={24} color="#fff" />, theme: 'primary' },
    { id: 'cliente_frecuente', name: "Cliente Frecuente", icon: <Award size={24} color="#fff" />, theme: 'secondary' },
    { id: 'entusiasta', name: "Entusiasta", icon: <Zap size={24} color="#fff" />, theme: 'accent' },
    { id: 'popular', name: "Popular", icon: <Sparkles size={24} color="#fff" />, theme: 'primary' },
    { id: 'estrella_de_la_noche', name: "Estrella de la noche", icon: <Star size={24} color="#fff" />, theme: 'secondary' },
    { id: 'rey_de_la_noche', name: "Rey de la noche", icon: <Crown size={24} color="#fff" />, theme: 'accent' },
  ];

  const activePromos = (userData?.promos || []).filter((p: any) => p.status === 'active');

  // Funciones de cálculo de Nivel
  const getLevelInfo = (totalXp: number) => {
    let level = 1;
    let currentLevelStartXp = 0;
    let nextLevelXpReq = 500; // XP needed to complete level 1
    let totalXpNeededForNextLevel = 500;

    while (totalXp >= totalXpNeededForNextLevel) {
      level++;
      currentLevelStartXp = totalXpNeededForNextLevel;
      nextLevelXpReq = Math.floor(nextLevelXpReq * 1.5); // Aumenta 50%
      totalXpNeededForNextLevel = currentLevelStartXp + nextLevelXpReq;
    }

    let title = "";
    if (level >= 1 && level <= 5) title = "Novato del Shot";
    else if (level >= 6 && level <= 10) title = "Aguanta una Prenda";
    else if (level >= 11 && level <= 15) title = "Garganta de Lata";
    else title = "Leyenda Indiscutible";

    const xpInCurrentLevel = totalXp - currentLevelStartXp;
    
    return { level, title, xpInCurrentLevel, nextLevelXpReq };
  };

  const levelInfo = getLevelInfo(userData?.xp || 0);

  // Determinar qué insignias mostrar (ganadas + 1 bloqueada para misterio)
  const visibleBadges = [];
  let foundLocked = false;

  for (const badge of badges) {
    const hasBadge = userData?.badges?.includes(badge.id);
    if (hasBadge) {
      visibleBadges.push({ ...badge, locked: false });
    } else if (!foundLocked) {
      // Si la insignia es el "rey de la noche" no le quitemos el misterio al icono real
      visibleBadges.push({ 
        ...badge, 
        locked: true,
        name: "???", // Misterio
      });
      foundLocked = true;
    }
  }

  return (
    <div className="glass-panel flex flex-col min-h-screen p-6 animate-slide-up relative">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 mt-4">
        <div>
          <h1 className="text-h2">Hola, {userData?.name || 'Amigo'}</h1>
          <p className="text-muted">¡Qué gusto verte de nuevo!</p>
        </div>
        <div 
          className="rounded-full flex items-center justify-center cursor-pointer shadow-md"
          style={{
            width: '3rem',
            height: '3rem',
            background: 'linear-gradient(to right, var(--secondary-color), var(--primary-color))',
            padding: '0.25rem',
            transition: 'transform 0.2s',
          }}
          onClick={() => navigate('/scanner')}
        >
           <QrCode size={24} color="#fff" />
        </div>
      </header>

      {/* Stats Card */}
      <section className="card mb-8" style={{ borderTop: '4px solid var(--secondary-color)' }}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Trophy size={24} className="text-[var(--secondary-color)]" />
              <span className="text-h3">Nivel {levelInfo.level}</span>
            </div>
            <span className="text-sm font-bold text-[var(--primary-color)]">{levelInfo.title}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#2b303b] px-3 py-1 rounded-full">
            <Coins size={16} className="text-[var(--accent-color)]" />
            <span className="font-semibold text-[var(--accent-color)]">{userData?.coins || 0}</span>
          </div>
        </div>

        <ProgressBar 
          current={levelInfo.xpInCurrentLevel} 
          max={levelInfo.nextLevelXpReq} 
          label={`Visitas totales: ${userData?.visits || 0}`}
          className="mb-2"
        />
        <p className="text-muted text-sm text-center mt-2">
          ¡Sigue visitándonos para subir de nivel!
        </p>
      </section>

      {/* Promos Section */}
      {activePromos.length > 0 && (
        <section className="mb-8">
          <h2 className="text-h3 mb-4 flex items-center gap-2">
            <Tag size={20} className="text-[var(--secondary-color)]" />
            Tus Promociones
          </h2>
          <div className="flex flex-col gap-3">
            {activePromos.map((promo: any) => (
              <div 
                key={promo.id} 
                onClick={() => setSelectedPromo(promo)}
                className="bg-gradient-to-r from-[rgba(102,35,131,0.2)] to-[rgba(230,0,126,0.1)] border border-[var(--secondary-color)] rounded-xl p-4 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform shadow-[0_0_15px_rgba(102,35,131,0.2)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--secondary-color)] flex items-center justify-center">
                    <Tag size={20} color="white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg leading-tight">{promo.title}</h4>
                    {promo.description && <p className="text-xs text-muted mt-1">{promo.description}</p>}
                  </div>
                </div>
                <div className="text-[var(--secondary-color)] text-sm font-semibold">
                  Usar &rarr;
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Badges Section */}
      <section>
        <h2 className="text-h3 mb-4 flex items-center gap-2">
          <Award size={20} className="text-[var(--primary-color)]" />
          Tus Insignias
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {visibleBadges.map(badge => (
            <Badge 
              key={badge.id}
              name={badge.name}
              icon={badge.locked ? <Award size={24} color="#666" /> : badge.icon}
              locked={badge.locked}
              colorTheme={badge.theme}
            />
          ))}
        </div>
      </section>

      <button 
        onClick={handleLogout}
        className="btn btn-secondary mt-8 w-full flex items-center justify-center gap-2"
      >
        <LogOut size={18} /> Cerrar Sesión
      </button>

      <div className="flex justify-center mt-6">
        <button 
          onClick={() => navigate('/admin')}
          className="text-xs font-semibold px-4 py-2 rounded-full border border-[var(--border-color)] bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors flex items-center gap-2"
        >
          Ir a Modo Mesero (Para pruebas)
        </button>
      </div>

      {/* Promo Redemption Modal */}
      {selectedPromo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-[#1a1d24] border-2 border-[var(--secondary-color)] rounded-2xl w-full max-w-sm p-6 relative flex flex-col items-center">
            <button 
              onClick={() => setSelectedPromo(null)}
              className="absolute top-4 right-4 text-muted hover:text-white"
            >
              <X size={24} />
            </button>
            
            <div className="w-16 h-16 rounded-full bg-[var(--secondary-color)] flex items-center justify-center mb-4 mt-2 shadow-[0_0_20px_rgba(102,35,131,0.5)]">
              <Tag size={32} color="white" />
            </div>
            
            <h3 className="text-2xl font-bold text-white text-center mb-2">{selectedPromo.title}</h3>
            {selectedPromo.description && (
              <p className="text-muted text-center mb-6">{selectedPromo.description}</p>
            )}
            
            <div className="w-full bg-[#0d0f12] rounded-xl p-4 mb-6 border border-[#2b303b] flex flex-col items-center justify-center gap-2">
              <span className="text-xs text-muted uppercase tracking-widest">Código Único</span>
              <span className="text-3xl font-mono font-bold text-[var(--secondary-color)] tracking-wider">
                {selectedPromo.id.substring(0, 8).toUpperCase()}
              </span>
            </div>
            
            <p className="text-center text-white font-medium mb-6">
              ¡Muestra esta pantalla al mesero!
            </p>
            
            <button 
              onClick={handleRedeemPromo}
              disabled={isRedeeming}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {isRedeeming ? 'Validando...' : <><Check size={20} /> Marcar como Usado</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
