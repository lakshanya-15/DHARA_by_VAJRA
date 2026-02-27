const prisma = require('../config/prisma');

async function calculateScore(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      Booking: {
        include: {
          Payment: true,
          Review: true,
          Asset: true
        }
      },
      Engagement: true,
      Asset: {
        include: {
          Booking: {
            include: {
              Review: true
            }
          }
        }
      }
    }
  });

  if (!user) return 0;

  if (user.role === 'FARMER') {
    return calculateFarmerScore(user);
  } else if (user.role === 'OPERATOR') {
    return calculateOperatorScore(user);
  }

  return 0;
}

function calculateFarmerScore(user) {
  // 1. Usage Frequency (30) - number of COMPLETED bookings
  const completedBookings = user.Booking.filter(b => b.status === 'COMPLETED').length;
  const usageScore = Math.min(completedBookings / 5, 1) * 30; // 5 bookings for max score

  // 2. Repeat Purchases (25) - number of unique assets booked
  const uniqueAssets = new Set(user.Booking.map(b => b.assetid)).size;
  const repeatScore = Math.min(uniqueAssets / 3, 1) * 25; // 3 unique assets for max score

  // 3. On-time Payments (25) - ratio of on-time payments
  const payments = user.Booking.flatMap(b => b.Payment);
  const onTimePayments = payments.filter(p => !p.late).length;
  const totalPayments = payments.length;
  const paymentScore = (totalPayments > 0 ? (onTimePayments / totalPayments) : 0) * 25;

  // 4. App Engagement (10) - frequency of interactions
  const engagementCount = user.Engagement.length;
  const engagementScore = Math.min(engagementCount / 20, 1) * 10; // 20 interactions for max score

  // 5. Cancellations (-20) - penalty for cancellations
  const cancellations = user.Booking.filter(b => b.status === 'CANCELLED').length;
  const cancellationPenalty = cancellations * 20;

  const totalScore = usageScore + repeatScore + paymentScore + engagementScore - cancellationPenalty;

  return Math.max(0, Math.min(100, Math.round(totalScore)));
}

async function calculateOperatorScore(user) {
  // 1. Service Frequency (30) - bookings of their assets completed
  const allAssetBookings = user.Asset.flatMap(a => a.Booking);
  const completedServices = allAssetBookings.filter(b => b.status === 'COMPLETED').length;
  const serviceScore = Math.min(completedServices / 10, 1) * 30; // 10 services for max score

  // 2. Client Diversity (25) - unique farmers served
  const uniqueFarmers = new Set(allAssetBookings.map(b => b.farmerid)).size;
  const diversityScore = Math.min(uniqueFarmers / 5, 1) * 25; // 5 unique farmers for max score

  // 3. Asset Reliability / Ratings (25) - avg rating of their assets
  const allReviews = allAssetBookings.flatMap(b => b.Review);
  const avgRating = allReviews.length > 0
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    : 0;
  const ratingScore = (avgRating / 5) * 25; // Scale 0-5 to 0-25

  // 4. App Engagement (10) - logins/interactions
  const engagementCount = user.Engagement.length;
  const engagementScore = Math.min(engagementCount / 20, 1) * 10;

  // 5. Cancellations (-20) - penalty for operator-side or high cancellation rates
  // Note: Currently cancellations are generic, but we can track if operator caused it
  const cancellations = allAssetBookings.filter(b => b.status === 'CANCELLED').length;
  const cancellationPenalty = cancellations * 10; // Slighly lower penalty maybe? or keep -20

  const totalScore = serviceScore + diversityScore + ratingScore + engagementScore - cancellationPenalty;

  return Math.max(0, Math.min(100, Math.round(totalScore)));
}

function getSegment(score) {
  if (score <= 30) return 'NEW';
  if (score <= 60) return 'REGULAR';
  if (score <= 85) return 'LOYAL';
  return 'PREMIUM';
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
  updateUserScore
};
