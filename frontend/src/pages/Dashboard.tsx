import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, Award, Coins, QrCode, LogOut } from 'lucide-react';
import { ProgressBar } from '../components/ProgressBar';
import { Badge } from '../components/Badge';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Fetch user data from our backend
        const response = await fetch(`http://localhost:3001/api/users/${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else if (response.status === 404) {
          // If user doesn't exist yet, we can show a welcome state or register them via a visit
          setUserData({
            id: user.uid,
            name: "Nuevo Usuario",
            xp: 0,
            coins: 0,
            visits: 0,
            badges: []
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/login');
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
         <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const badges = [
    { id: 'nuevo_cliente', name: "Nuevo Cliente", icon: <Star size={24} color="#fff" /> },
    { id: 'cliente_frecuente', name: "Cliente Frecuente", icon: <Award size={24} color="#fff" /> },
    { id: 'leyenda_del_bar', name: "Leyenda del Bar", icon: <Trophy size={24} color="#fff" /> },
  ];

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
      <section className="card mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Trophy size={24} className="text-primary" />
            <span className="text-h3">Nivel Actual</span>
          </div>
          <div className="flex items-center gap-2 bg-[#2b303b] px-3 py-1 rounded-full">
            <Coins size={16} className="text-[#94C11F]" />
            <span className="font-semibold text-[#94C11F]">{userData?.coins || 0}</span>
          </div>
        </div>

        <ProgressBar 
          current={userData?.xp || 0} 
          max={500} 
          label={`Visitas totales: ${userData?.visits || 0}`}
          className="mb-2"
        />
        <p className="text-muted text-sm text-center mt-2">
          ¡Sigue visitándonos para subir de nivel!
        </p>
      </section>

      {/* Badges Section */}
      <section>
        <h2 className="text-h3 mb-4 flex items-center gap-2">
          <Award size={20} className="text-primary" />
          Tus Insignias
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {badges.map(badge => {
            const hasBadge = userData?.badges?.includes(badge.id);
            return (
              <Badge 
                key={badge.id}
                name={badge.name}
                icon={badge.icon}
                locked={!hasBadge}
              />
            );
          })}
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
          className="text-xs text-muted hover:text-white"
        >
          Ir a Modo Mesero (Para pruebas)
        </button>
      </div>
    </div>
  );
};
