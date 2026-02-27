const scoringService = require('../src/services/scoringService');

async function testScoring() {
    console.log('--- Testing Scoring Logic ---');

    // Mock score calculations (direct formula check)
    const mockCalculations = [
        { name: 'Low Engagement User', usage: 2, assets: 1, payments: 2, onTime: 2, engagement: 5, cancellations: 0 },
        { name: 'Regular User', usage: 10, assets: 3, payments: 10, onTime: 9, engagement: 20, cancellations: 1 },
        { name: 'Loyal User', usage: 20, assets: 5, payments: 20, onTime: 19, engagement: 50, cancellations: 0 },
        { name: 'Premium User', usage: 30, assets: 10, payments: 30, onTime: 30, engagement: 100, cancellations: 0 },
        { name: 'Problematic User', usage: 5, assets: 2, payments: 5, onTime: 2, engagement: 10, cancellations: 5 }
    ];

    for (const mock of mockCalculations) {
        const usageScore = Math.min(mock.usage * 5, 100) * 0.30;
        const repeatScore = Math.min(mock.assets * 10, 100) * 0.25;
        const paymentScore = (mock.payments > 0 ? (mock.onTime / mock.payments) * 100 : 0) * 0.25;
        const engagementScore = Math.min(mock.engagement * 2, 100) * 0.10;
        const cancellationPenalty = Math.min(mock.cancellations * 10, 100) * 0.20;

        const totalScore = Math.max(0, Math.min(100, usageScore + repeatScore + paymentScore + engagementScore - cancellationPenalty));
        const roundedScore = Math.round(totalScore);
        const segment = scoringService.getSegment(roundedScore);

        console.log(`${mock.name}: Score = ${roundedScore}, Segment = ${segment}`);
    }

    console.log('--- Verification Complete ---');
}

testScoring().catch(console.error);
