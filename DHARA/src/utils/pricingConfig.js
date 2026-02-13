/**
 * PRICING ENGINE CONFIGURATION
 * 
 * P: Average purchase price (₹)
 * Y: Expected economic life (Years)
 * D: Expected earning days per year
 * H: Billable hours per day
 * I: Insurance per hour (₹)
 * R: Registration per hour (₹)
 * F: Permit fees per hour (₹)
 * O: Operator hourly wage (₹)
 */

export const PRICING_METRICS = {
    SOIL_PREPARATION: { p: 800000, y: 10, d: 120, h: 8, i: 20, r: 10, f: 5, o: 150 },
    SOWING: { p: 500000, y: 8, d: 90, h: 8, i: 15, r: 8, f: 4, o: 150 },
    PLANT_PROTECTION: { p: 300000, y: 5, d: 60, h: 6, i: 10, r: 5, f: 3, o: 120 },
    HARVESTING: { p: 2500000, y: 12, d: 60, h: 10, i: 50, r: 25, f: 10, o: 200 },
    TRANSPORTATION: { p: 600000, y: 15, d: 200, h: 8, i: 15, r: 10, f: 5, o: 180 },
    OTHER: { p: 400000, y: 10, d: 120, h: 8, i: 10, r: 5, f: 2, o: 150 }
};

/**
 * Calculates the base cost (B) for a category
 * purchaseDate: Date string (optional)
 */
export const calculateBaseCost = (category, purchaseDate) => {
    const m = PRICING_METRICS[category] || PRICING_METRICS.OTHER;

    // Step 2: Depreciation (Standard)
    const cDay = m.p / (m.y * m.d);
    let cHour = cDay / m.h;

    // Age Justification Layer
    if (purchaseDate) {
        const ageInYears = (new Date() - new Date(purchaseDate)) / (1000 * 60 * 60 * 24 * 365);
        if (ageInYears < 2) {
            // Premium for new machinery (0-2 years) - Higher reliability
            cHour *= 1.25;
        } else if (ageInYears > 7) {
            // Discount for older machinery (7+ years) - Higher maintenance risk
            cHour *= 0.85;
        }
    }

    // Step 3: Legal Layer
    const l = m.i + m.r + m.f;

    // Step 4 & 5: Base Cost
    const b = cHour + l + m.o;

    return Math.round(b);
};

/**
 * Calculates final price based on base cost and profit margin
 * margin: 0.10 to 0.40
 */
export const calculateFinalPrice = (baseCost, margin) => {
    return Math.round(baseCost * (1 + margin));
};
