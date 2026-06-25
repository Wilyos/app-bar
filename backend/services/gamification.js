/**
 * Gamification Service
 * Handles calculation of XP, Coins, and Badges per visit
 */

const BADGES_CONFIG = [
  { id: 'nuevo_cliente', name: 'Nuevo Cliente', requiredVisits: 1 },
  { id: 'cliente_frecuente', name: 'Cliente Frecuente', requiredVisits: 5 },
  {id: 'entusiasta', name: 'Entusiasta', requiredVisits:10},
  {id: 'popular', name: 'Popular', requiredVisits:15},
  {id: 'estrella_de_la_noche', name: 'Estrella de la noche', requiredVisits:20},
  {id: 'rey_de_la_noche', name: 'Rey de la noche', requiredVisits: 50 }
];

const XP_PER_VISIT = 50;
const COINS_PER_VISIT = 10;

function processVisit(user) {
  // 1. Increment base stats
  user.visits += 1;
  user.xp += XP_PER_VISIT;
  user.coins += COINS_PER_VISIT;

  // 2. Check for new badges
  const earnedBadges = new Set(user.badges);
  
  BADGES_CONFIG.forEach(badge => {
    if (user.visits >= badge.requiredVisits && !earnedBadges.has(badge.id)) {
      earnedBadges.add(badge.id);
    }
  });

  user.badges = Array.from(earnedBadges);

  return user;
}

module.exports = {
  processVisit
};
