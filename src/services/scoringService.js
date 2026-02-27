const prisma = require('../config/prisma');

async function calculateScore(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { completedBookings: true, cancelledBookings: true, role: true }
  });

  if (!user) return 0;

  let score = 0;
  const completed = user.completedBookings || 0;
  const cancelled = user.cancelledBookings || 0;

  // Usage Frequency + Repeat (Simplification for available data)
  // Max 55 from usage
  const usageScore = Math.min((completed / 10), 1) * 55;

  // Base App Engagement / On-time metrics (Assume max 35 for simplicity for completed ones)
  const reliabilityScore = Math.min((completed / 5), 1) * 35;

  // Cancellations penalty
  const cancellationPenalty = cancelled * 20;

  score = usageScore + reliabilityScore + 10 - cancellationPenalty; // 10 base score

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getSegment(score) {
  if (score <= 30) return 'NEW';
  if (score <= 60) return 'REGULAR';
  if (score <= 85) return 'LOYAL';
  return 'PREMIUM';
}

function getDiscountMultiplier(segment) {
  switch (segment) {
    case 'PREMIUM': return 0.85; // 15% off
    case 'LOYAL': return 0.90;   // 10% off
    case 'REGULAR': return 0.95; // 5% off
    case 'NEW':
    default: return 1.0;
  }
}

async function updateUserScore(userId) {
  const score = await calculateScore(userId);
  const segment = getSegment(score);

  await prisma.user.update({
    where: { id: userId },
    data: {
      behaviorScore: score,
      segment: segment
    }
  });

  return { score, segment };
}

module.exports = {
  calculateScore,
  getSegment,
  getDiscountMultiplier,
  updateUserScore
};
