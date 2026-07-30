/**
 * Safely parse a date string or Date object into a local Date at 00:00:00
 * avoiding UTC timezone offset shifts (e.g. "2010-06-01" -> 2010-06-01 local).
 */
export function parseDate(input) {
    if (!input) return new Date();
    if (input instanceof Date) return new Date(input.getFullYear(), input.getMonth(), input.getDate());
    const str = String(input).slice(0, 10);
    const parts = str.split('-').map(Number);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const y = parts[0];
        const m = parts[1] - 1;
        const d = parts[2] || 1;
        return new Date(y, m, d);
    }
    const fallback = new Date(input);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
}

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatDateShort(input) {
    if (!input) return '—';
    const dt = parseDate(input);
    return `${MONTH_NAMES_SHORT[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

export function formatDateMonthYear(input) {
    if (!input) return '';
    const dt = parseDate(input);
    return `${MONTH_NAMES_SHORT[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function formatDateLongMonthYear(input) {
    if (!input) return '';
    const dt = parseDate(input);
    return `${MONTH_NAMES_LONG[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function firstOfMonth(d) {
    const dt = parseDate(d);
    return new Date(dt.getFullYear(), dt.getMonth(), 1);
}

export function addMonths(d, months) {
    const dt = parseDate(d);
    const totalMonths = dt.getFullYear() * 12 + dt.getMonth() + months;
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    return new Date(y, m < 0 ? m + 12 : m, 1);
}

export function wholeYearsBetween(a, b) {
    const A = parseDate(a);
    const B = parseDate(b);
    if (A.getTime() === B.getTime()) return 0;
    const sign = A <= B ? 1 : -1;
    const start = sign === 1 ? A : B;
    const end = sign === 1 ? B : A;
    let years = end.getFullYear() - start.getFullYear();
    if ((end.getMonth() < start.getMonth()) ||
        (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())) {
        years -= 1;
    }
    return sign * years;
}

export function calcTimeInService(serviceStart, atDate) {
    const start = parseDate(serviceStart);
    const end = parseDate(atDate);
    let years = wholeYearsBetween(start, end);
    if (years < 0) years = 0;
    const allowed = [0, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40];
    for (let i = allowed.length - 1; i >= 0; i--) {
        if (years >= allowed[i]) return allowed[i];
    }
    return 0;
}

export function bucketForYOS(bucketLabels, yos) {
    if (!bucketLabels || !bucketLabels.length) return '';
    let le2 = null;
    const thresholds = [];
    for (const b of bucketLabels) {
        const bn = String(b).trim();
        if (/(\b2\s*or\s*less\b)/i.test(bn)) le2 = bn;
        const m = /\bOver\s+(\d+)\b/i.exec(bn);
        if (m) thresholds.push([parseInt(m[1], 10), bn]);
    }
    if (le2 && yos <= 2) return le2;
    if (thresholds.length) {
        const candidates = thresholds.filter(([n]) => yos >= n);
        if (candidates.length) return candidates.sort((a, b) => a[0] - b[0]).at(-1)[1];
        return thresholds.sort((a, b) => a[0] - b[0])[0][1];
    }
    return bucketLabels[0];
}

export function makeGetPay(payDataOrTablesByYear) {
    return function getPay(paygrade, yos, isoDate) {
        if (!paygrade) return 0;

        let year = 2026;
        if (isoDate) {
            const dt = parseDate(isoDate);
            if (dt && !isNaN(dt.getFullYear())) {
                year = dt.getFullYear();
            }
        }

        let yearlyData = payDataOrTablesByYear;

        // If payDataOrTablesByYear is a master object keyed by year (e.g. { "1986": {...}, "2026": {...} })
        if (payDataOrTablesByYear && payDataOrTablesByYear[year] !== undefined) {
            yearlyData = payDataOrTablesByYear[year];
        } else if (payDataOrTablesByYear && typeof payDataOrTablesByYear === 'object') {
            const availableYears = Object.keys(payDataOrTablesByYear).map(Number).filter(n => !isNaN(n) && n > 1900).sort((a, b) => a - b);
            if (availableYears.length) {
                const clampedYear = Math.max(availableYears[0], Math.min(availableYears[availableYears.length - 1], year));
                yearlyData = payDataOrTablesByYear[clampedYear] || payDataOrTablesByYear[2026] || payDataOrTablesByYear;
            }
        }

        const group = paygrade.startsWith('E-') ? 'Enlisted'
            : paygrade.startsWith('W-') ? 'Warrant'
                : 'Officer';
        const effectiveGroup = /^(O-1E|O-2E|O-3E)$/.test(paygrade) ? 'Officer-4plus' : group;

        // Special handling for prior-enlisted officers with < 4 YOS: fallback to standard officer grade
        let targetGrade = paygrade;
        let targetGroup = effectiveGroup;
        if (/^(O-1E|O-2E|O-3E)$/.test(paygrade) && yos < 4) {
            targetGrade = paygrade.replace('E', '');
            targetGroup = 'Officer';
        }

        const table = yearlyData?.[targetGroup]?.[targetGrade];
        if (!table) return 0;
        const bucket = bucketForYOS(Object.keys(table), yos);
        return Number(table[bucket] ?? 0);
    };
}

export function buildMonthlyTimeline({ promotions, getPay }) {
    if (!promotions || !Array.isArray(promotions)) {
        return { monthly: [], totalBase: 0, avgLast36: 0 };
    }

    const validPromotions = promotions.filter(p => p && p.date && p.grade);
    if (!validPromotions.length) {
        return { monthly: [], totalBase: 0, avgLast36: 0 };
    }

    const sorted = [...validPromotions].sort((a, b) => parseDate(a.date) - parseDate(b.date));
    const serviceStart = parseDate(sorted[0].date);
    const start = firstOfMonth(serviceStart);
    const end = firstOfMonth(parseDate(sorted.at(-1).date));

    const anchors = sorted.map(p => ({
        at: firstOfMonth(parseDate(p.date)),
        grade: p.grade
    }));

    const monthly = [];
    for (let cur = new Date(start); cur <= end; cur = addMonths(cur, 1)) {
        let active = anchors[0].grade;
        for (const a of anchors) {
            if (a.at <= cur) active = a.grade; else break;
        }
        const tis = calcTimeInService(serviceStart, cur);
        const iso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-01`;
        const pay = getPay(active, tis, iso);

        monthly.push({
            year: cur.getFullYear(),
            month: cur.getMonth() + 1,
            iso,
            pay,
            grade: active,
            tis
        });
    }

    const totalBase = monthly.reduce((s, m) => s + m.pay, 0);

    // Calculate highest contiguous 36-month average (High-3)
    let highest36Avg = 0;
    if (monthly.length >= 36) {
        for (let i = 0; i <= monthly.length - 36; i++) {
            const window36 = monthly.slice(i, i + 36);
            const sum36 = window36.reduce((s, m) => s + m.pay, 0);
            const avg = sum36 / 36;
            if (avg > highest36Avg) {
                highest36Avg = avg;
            }
        }
    } else if (monthly.length > 0) {
        highest36Avg = totalBase / monthly.length;
    }

    const last36 = monthly.slice(-36);
    const last36Avg = last36.length ? last36.reduce((s, m) => s + m.pay, 0) / last36.length : 0;

    const avgLast36 = Math.max(highest36Avg, last36Avg);

    return { monthly, totalBase, avgLast36 };
}
