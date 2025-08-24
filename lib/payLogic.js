function daysInMonth(year, month) {
    const nextMonth = month === 12 ? new Date(year + 1, 0, 1) : new Date(year, month, 1);
    const thisMonth = new Date(year, month - 1, 1);
    return Math.round((nextMonth - thisMonth) / (1000 * 60 * 60 * 24));
}

export function firstOfMonth(d) {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return new Date(dt.getFullYear(), dt.getMonth(), 1);
}

export function addMonths(d, months) {
    const dt = typeof d === 'string' ? new Date(d) : d;
    const total = dt.getFullYear() * 12 + dt.getMonth() + months;
    const y = Math.floor(total / 12);
    const m0 = total % 12;
    const m = m0 < 0 ? m0 + 12 : m0;
    const dim = daysInMonth(y, m + 1);
    const day = Math.min(dt.getDate(), dim);
    return new Date(y, m, day);
}

export function wholeYearsBetween(a, b) {
    const A = typeof a === 'string' ? new Date(a) : a;
    const B = typeof b === 'string' ? new Date(b) : b;
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
    const start = typeof serviceStart === 'string' ? new Date(serviceStart) : serviceStart;
    const end = typeof atDate === 'string' ? new Date(atDate) : atDate;
    let years = wholeYearsBetween(start, end);
    if (years < 0) years = 0;
    const allowed = [0,2,3,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40];
    for (let i = allowed.length - 1; i >= 0; i--) {
        if (years >= allowed[i]) return allowed[i];
    }
    return 0;
}

export function bucketForYOS(bucketLabels, yos) {
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
        if (candidates.length) return candidates.sort((a,b)=>a[0]-b[0]).at(-1)[1];
        return thresholds.sort((a,b)=>a[0]-b[0])[0][1];
    }
    return bucketLabels[0];
}

export function makeGetPay(payTableByGroupAndGrade) {
    return function getPay(paygrade, yos, isoDate) {
        const group = paygrade.startsWith('E-') ? 'Enlisted'
            : paygrade.startsWith('W-') ? 'Warrant'
                : 'Officer';
        const effectiveGroup = /^(O-1E|O-2E|O-3E)$/.test(paygrade) ? 'Officer-4plus' : group;
        const table = payTableByGroupAndGrade?.[effectiveGroup]?.[paygrade];
        if (!table) return 0;
        const bucket = bucketForYOS(Object.keys(table), yos);
        return Number(table[bucket] ?? 0);
    };
}

export function buildMonthlyTimeline({ promotions, getPay }) {
    const sorted = [...promotions].sort((a,b) => new Date(a.date) - new Date(b.date));
    const serviceStart = new Date(sorted[0].date);
    const start = firstOfMonth(serviceStart);
    const end = firstOfMonth(new Date(sorted.at(-1).date));

    const anchors = sorted.map(p => ({ at: new Date(p.date), grade: p.grade }));

    const monthly = [];
    for (let cur = new Date(start); cur <= end; cur = addMonths(cur, 1)) {
        let active = anchors[0].grade;
        for (const a of anchors) {
            if (a.at <= cur) active = a.grade; else break;
        }
        const tis = calcTimeInService(serviceStart, cur);
        const pay = getPay(active, tis, cur.toISOString().slice(0,10));
        monthly.push({
            year: cur.getFullYear(),
            month: cur.getMonth() + 1,
            iso: cur.toISOString().slice(0,10),
            pay,
            grade: active,
            tis
        });
    }

    const totalBase = monthly.reduce((s,m)=>s+m.pay, 0);
    const last36 = monthly.slice(-36);
    const avgLast36 = last36.length ? last36.reduce((s,m)=>s+m.pay,0)/last36.length : 0;

    return { monthly, totalBase, avgLast36 };
}
