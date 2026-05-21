/**
 * Points Formula calculation utility for e-TrashHub.
 *
 * basePoints = weightKg × 50
 * bonusPoints = Math.floor(weightKg / 5) × 50
 * totalPoints = basePoints + bonusPoints
 * 1 point = Rp 100
 */

export function calculatePoints(weightKg: number): number {
  if (weightKg <= 0) return 0;
  
  const basePoints = weightKg * 50;
  const bonusPoints = Math.floor(weightKg / 5) * 50;
  
  return basePoints + bonusPoints;
}

export function pointsToRupiah(points: number): number {
  return points * 100;
}
