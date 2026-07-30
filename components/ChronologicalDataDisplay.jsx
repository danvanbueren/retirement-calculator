'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Box, Grid, Paper, Typography, Divider, Avatar, Card, CardContent,
    Accordion, AccordionSummary, AccordionDetails, Chip, Stack, Tooltip,
    Alert, AlertTitle
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PercentIcon from '@mui/icons-material/Percent';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FunctionsIcon from '@mui/icons-material/Functions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import TimelineIcon from '@mui/icons-material/Timeline';
import SecurityIcon from '@mui/icons-material/Security';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useStorage } from '@/context/StorageContext';
import { buildMonthlyTimeline, calcTimeInService, makeGetPay, formatDateShort, formatDateMonthYear, formatDateLongMonthYear } from '@/lib/payLogic';
import TimelineScrubber from '@/components/TimelineScrubber';

import payByYear from '@/data/pay-by-year.json';

const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val || 0);

const formatCompactCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

export default function ChronologicalDataDisplay() {
    const {
        retirementMultiplier,
        promotions,
        getRankFromGrade,
        getRankInsigniaUrl,
        serviceLocalization
    } = useStorage();

    const getPay = useMemo(() => makeGetPay(payByYear), []);
    const [timeline, setTimeline] = useState({ monthly: [], totalBase: 0, avgLast36: 0 });

    useEffect(() => {
        if (!promotions?.length) return;
        const t = buildMonthlyTimeline({ promotions, getPay });
        setTimeline(t);
    }, [promotions, getPay]);

    const yearsOfService = useMemo(() => {
        if (!promotions?.length) return 0;
        const start = promotions[0].date;
        const end = promotions.at(-1).date;
        return calcTimeInService(start, end);
    }, [promotions]);

    const isEligibleForRetirement = yearsOfService >= 20;
    const yearsNeeded = Math.max(0, 20 - yearsOfService);

    const retirementPay = useMemo(
        () => (isEligibleForRetirement ? timeline.avgLast36 * yearsOfService * (retirementMultiplier ?? 0) : 0),
        [isEligibleForRetirement, timeline.avgLast36, yearsOfService, retirementMultiplier]
    );

    const projected20YrPay = useMemo(
        () => timeline.avgLast36 * 20 * (retirementMultiplier ?? 0),
        [timeline.avgLast36, retirementMultiplier]
    );

    // Group timeline entries by Year
    const timelineByYear = useMemo(() => {
        const acc = {};
        timeline.monthly.forEach((m) => {
            if (!acc[m.year]) acc[m.year] = [];
            acc[m.year].push(m);
        });
        return acc;
    }, [timeline.monthly]);

    const sortedYearEntries = useMemo(() => {
        return Object.entries(timelineByYear).sort(([a], [b]) => Number(a) - Number(b));
    }, [timelineByYear]);

    // Timeline Scrubber Items
    const scrubberItems = useMemo(() => {
        const items = [];
        let lastGrade = null;

        timeline.monthly.forEach((r) => {
            if (r.grade !== lastGrade) {
                lastGrade = r.grade;
                const rankTitle = getRankFromGrade ? getRankFromGrade(r.grade) : r.grade;
                const insigniaUrl = getRankInsigniaUrl ? getRankInsigniaUrl(r.grade) : null;
                const dateStr = formatDateMonthYear(r.iso);

                items.push({
                    id: `month-section-${r.year}-${r.month}`,
                    type: 'promotion',
                    grade: r.grade,
                    rankTitle,
                    insigniaUrl,
                    label: `${rankTitle} (${r.grade}) — ${dateStr}`,
                });
            }
        });

        return items;
    }, [sortedYearEntries, timeline.monthly, getRankFromGrade, getRankInsigniaUrl]);

    // Derived Statistics
    const monthlyPension = retirementPay;
    const annualPension = monthlyPension * 12;
    const finalMonthlyPay = timeline.monthly.length ? timeline.monthly[timeline.monthly.length - 1].pay : 0;
    const multiplierRatePct = ((retirementMultiplier ?? 0) * 100).toFixed(1);
    const pensionMultiplierPct = (yearsOfService * (retirementMultiplier ?? 0) * 100).toFixed(1);
    const replacementRatio = finalMonthlyPay > 0 ? ((monthlyPension / finalMonthlyPay) * 100).toFixed(1) : 0;
    const nestEggEquivalent = annualPension / 0.04; // 4% SWR Rule equivalent
    const tenYearPension = annualPension * 10;
    const twentyYearPension = annualPension * 20;
    const thirtyYearPension = annualPension * 30;

    const startDateStr = promotions[0]?.date ? formatDateShort(promotions[0].date) : '—';
    const endDateStr = promotions[promotions.length - 1]?.date ? formatDateShort(promotions[promotions.length - 1].date) : '—';

    const totalMonths = timeline.monthly.length;
    const yearsDisplay = Math.floor((totalMonths - 1) / 12);
    const monthsDisplay = (totalMonths - 1) % 12;

    const planName = retirementMultiplier === 0.02
        ? 'Blended Retirement System (BRS)'
        : 'High-3 Legacy Retirement System';

    return (
        <>
            { promotions.length > 1 ?
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                    {/* Main Content Column */}
                    <Box id="main-content-column" sx={{ flexGrow: 1, minWidth: 0 }}>
                        {/* Extended Retirement Statistics Section (Top) */}
                        <Box id="retirement-analytics-section" sx={{ pb: 3, scrollMarginTop: '80px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <MilitaryTechIcon color="primary" sx={{ fontSize: 32 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                    Retirement & Career Pay Analytics
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Comprehensive analysis of your estimated pension, career earnings, income replacement, and long-term lifetime retirement wealth.
                            </Typography>

                            {/* Retirement Authorization & Eligibility Alert Banner */}
                            {!isEligibleForRetirement ? (
                                <Alert
                                    severity="warning"
                                    icon={<WarningAmberIcon fontSize="inherit" />}
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'warning.main',
                                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.15)' : 'rgba(237, 108, 2, 0.08)'
                                    }}
                                >
                                    <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                        Not Authorized for Pension (&lt; 20 Years Active Service)
                                    </AlertTitle>
                                    Under 10 U.S.C. Chapter 71, active duty military members are <strong>not authorized to retire and take a pension</strong> until completing at least <strong>20 years of time in service (20 YOS)</strong>.
                                    <Box sx={{ mt: 1, fontWeight: 'medium' }}>
                                        • Current Active Duty Duration: <strong>{yearsOfService} Years</strong> ({totalMonths} Months)<br />
                                        • Service Needed for Pension Eligibility: <strong>{yearsNeeded} More {yearsNeeded === 1 ? 'Year' : 'Years'}</strong> to reach 20 YOS.<br />
                                        • Projected Pension at 20 YOS: <strong>{formatCurrency(projected20YrPay)} / mo</strong>
                                    </Box>
                                </Alert>
                            ) : (
                                <Alert
                                    severity="success"
                                    icon={<CheckCircleIcon fontSize="inherit" />}
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'success.main',
                                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.08)'
                                    }}
                                >
                                    <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                        Authorized for Active Duty Retirement ({yearsOfService} Years Service)
                                    </AlertTitle>
                                    You have completed at least 20 years of active duty service and qualify for immediate active duty retirement pension benefits.
                                </Alert>
                            )}

                            {/* Top KPI Cards Grid */}
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                {/* Monthly Pension KPI */}
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Card elevation={3} sx={{ height: '100%', borderTop: 4, borderColor: isEligibleForRetirement ? 'primary.main' : 'warning.main' }}>
                                        <CardContent sx={{ p: 2.5 }}>
                                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                    Monthly Pension
                                                </Typography>
                                                <AccountBalanceIcon color={isEligibleForRetirement ? 'primary' : 'warning'} fontSize="small" />
                                            </Stack>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: isEligibleForRetirement ? 'primary.main' : 'warning.main', mb: 0.5 }}>
                                                {formatCurrency(monthlyPension)}
                                            </Typography>
                                            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                                                {isEligibleForRetirement ? (
                                                    <>Annual: <strong>{formatCurrency(annualPension)}</strong> / yr</>
                                                ) : (
                                                    <Chip label="Ineligible (<20 YOS)" size="small" color="warning" sx={{ fontWeight: 'bold', height: 20, fontSize: '0.65rem' }} />
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* High-36 Base Pay KPI */}
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Card elevation={3} sx={{ height: '100%', borderTop: 4, borderColor: 'secondary.main' }}>
                                        <CardContent sx={{ p: 2.5 }}>
                                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                    High-36 Base Pay
                                                </Typography>
                                                <TrendingUpIcon color="secondary" fontSize="small" />
                                            </Stack>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 0.5 }}>
                                                {formatCurrency(timeline.avgLast36)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Average of last 36 service months
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Pension Multiplier KPI */}
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Card elevation={3} sx={{ height: '100%', borderTop: 4, borderColor: 'info.main' }}>
                                        <CardContent sx={{ p: 2.5 }}>
                                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                    Pension Multiplier
                                                </Typography>
                                                <PercentIcon color="info" fontSize="small" />
                                            </Stack>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main', mb: 0.5 }}>
                                                {pensionMultiplierPct}%
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {isEligibleForRetirement ? `${yearsOfService} YOS × ${multiplierRatePct}% / yr` : `${yearsOfService} YOS (Requires 20 YOS)`}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Equivalent Nest Egg KPI */}
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Card elevation={3} sx={{ height: '100%', borderTop: 4, borderColor: isEligibleForRetirement ? 'success.main' : 'action.disabled' }}>
                                        <CardContent sx={{ p: 2.5 }}>
                                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                    401(k) / IRA Value
                                                </Typography>
                                                <AttachMoneyIcon color={isEligibleForRetirement ? 'success' : 'action'} fontSize="small" />
                                            </Stack>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: isEligibleForRetirement ? 'success.main' : 'text.disabled', mb: 0.5 }}>
                                                {formatCompactCurrency(nestEggEquivalent)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                4% SWR Lump-Sum Equivalent
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Detailed Metrics Cards Grid */}
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                {/* Service & Income Metrics */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 2 }}>
                                            <TimelineIcon color="primary" />
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                Career & Income Metrics
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 2 }} />

                                        <Stack spacing={1.5}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">Retirement Plan:</Typography>
                                                <Chip label={planName} size="small" color="primary" variant="outlined" />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">Retirement Authorization:</Typography>
                                                <Chip
                                                    label={isEligibleForRetirement ? "Authorized (20+ YOS)" : "Not Authorized (<20 YOS)"}
                                                    size="small"
                                                    color={isEligibleForRetirement ? "success" : "warning"}
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </Box>
                                            {!isEligibleForRetirement && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary">Required Service Remaining:</Typography>
                                                    <Typography variant="body2" color="warning.main" sx={{ fontWeight: 'bold' }}>
                                                        {yearsNeeded} More {yearsNeeded === 1 ? 'Year' : 'Years'} Needed
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">Active Duty Service Span:</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {startDateStr} — {endDateStr}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">Total Active Duty Duration:</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {totalMonths} Months ({yearsDisplay} yrs, {monthsDisplay} mos)
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">Pay Bucket Years of Service (YOS):</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {yearsOfService} Years
                                                </Typography>
                                            </Box>
                                            <Divider />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">Final Active-Duty Basic Pay:</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    {formatCurrency(finalMonthlyPay)} / mo
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">High-36 Month Average Base Pay:</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    {formatCurrency(timeline.avgLast36)} / mo
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">Income Replacement Ratio:</Typography>
                                                <Chip
                                                    label={isEligibleForRetirement ? `${replacementRatio}% of final base pay` : '0.0% (Ineligible)'}
                                                    size="small"
                                                    color={isEligibleForRetirement ? 'success' : 'default'}
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">Total Active Base Pay Paid (Career):</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    {formatCurrency(timeline.totalBase)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Lifetime Pension Value Projections */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 2 }}>
                                            <SecurityIcon color="success" />
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                Lifetime Pension Wealth Projections
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 2 }} />

                                        <Stack spacing={2}>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Cumulative Pension Payout (Unadjusted Nominal):
                                                </Typography>
                                                <Grid container spacing={1}>
                                                    <Grid size={4}>
                                                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'background.default' }}>
                                                            <Typography variant="caption" color="text.secondary" display="block">10 Years</Typography>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                                {formatCompactCurrency(tenYearPension)}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid size={4}>
                                                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'background.default' }}>
                                                            <Typography variant="caption" color="text.secondary" display="block">20 Years</Typography>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                                {formatCompactCurrency(twentyYearPension)}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid size={4}>
                                                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'background.default' }}>
                                                            <Typography variant="caption" color="text.secondary" display="block">30 Years</Typography>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                                {formatCompactCurrency(thirtyYearPension)}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Box>

                                            <Divider />

                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                                    Equivalent Retirement Lump-Sum Value
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    At a standard 4% Safe Withdrawal Rate (SWR), generating <strong>{formatCurrency(annualPension)}/year</strong> requires a private 401(k) / IRA investment portfolio of:
                                                </Typography>
                                                <Box sx={{ p: 2, bgcolor: 'success.soft', borderRadius: 2, border: '1px solid', borderColor: 'success.main', textStyle: 'center' }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main', textAlign: 'center' }}>
                                                        {formatCurrency(nestEggEquivalent)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Collapsible Formulas & Explanations Accordion */}
                            <Accordion elevation={3} defaultExpanded sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                                        <FunctionsIcon color="primary" />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            Calculation Formulas & Methodology
                                        </Typography>
                                    </Stack>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={3}>
                                        {/* Left Column Formulas */}
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Stack spacing={3}>
                                                {/* Estimated Monthly Pension Formula (Blue) */}
                                                <Paper variant="outlined" sx={{ p: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                                                        Estimated Monthly Pension Formula
                                                    </Typography>
                                                    <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.9rem', mb: 1 }}>
                                                        Monthly Pension = High-36 Avg × Multiplier %
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Gross monthly pension before taxes, Survivor Benefit Plan (SBP) elections, or VA disability offsets. ({formatCurrency(timeline.avgLast36)} × {pensionMultiplierPct}% = {formatCurrency(monthlyPension)}/mo).
                                                    </Typography>
                                                </Paper>

                                                {/* High-36 Formula (Purple) */}
                                                <Paper variant="outlined" sx={{ p: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'secondary.main' }}>
                                                        High-36 Average Base Pay Formula
                                                    </Typography>
                                                    <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.9rem', mb: 1 }}>
                                                        High-36 Avg = (Sum of Base Pay for Last 36 Months) / 36
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Calculates the average monthly basic pay across your final 36 active-duty service months ({timeline.monthly.length >= 36 ? '36 months evaluated' : `evaluated across available ${timeline.monthly.length} months`}).
                                                    </Typography>
                                                </Paper>
                                            </Stack>
                                        </Grid>

                                        {/* Right Column Formulas */}
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Stack spacing={3}>
                                                {/* Pension Multiplier Formula (Cyan) */}
                                                <Paper variant="outlined" sx={{ p: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'info.main' }}>
                                                        Pension Multiplier Percentage Formula
                                                    </Typography>
                                                    <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.9rem', mb: 1 }}>
                                                        Multiplier % = Years of Service (YOS) × Rate Per Year
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Rate is <strong>2.0% per year</strong> under the Blended Retirement System (BRS) or <strong>2.5% per year</strong> under High-3 Legacy. (Your current selection: {yearsOfService} YOS × {multiplierRatePct}% = {pensionMultiplierPct}%).
                                                    </Typography>
                                                </Paper>

                                                {/* 4% SWR Nest Egg Formula (Green) */}
                                                <Paper variant="outlined" sx={{ p: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'success.main' }}>
                                                        Equivalent 401(k) / IRA Nest Egg Formula (4% Rule)
                                                    </Typography>
                                                    <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.9rem', mb: 1 }}>
                                                        Nest Egg Equivalent = (Monthly Pension × 12) / 0.04
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Based on Trinity Study Safe Withdrawal Rate (SWR) of 4%. Multiplying annual pension by 25 yields the lump-sum portfolio needed to produce equivalent lifelong income.
                                                    </Typography>
                                                </Paper>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        </Box>

                        <Divider sx={{ my: 5 }} />

                        {/* Pay History Section (Bottom) */}
                        <Box id="pay-history-section" sx={{ scrollMarginTop: '80px' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                                Monthly Pay History
                            </Typography>

                            {sortedYearEntries.map(([year, rows]) => (
                                <Box key={year} id={`year-section-${year}`} sx={{ mb: 4, scrollMarginTop: '80px' }}>
                                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>{year}</Typography>
                                    <Grid container spacing={2}>
                                        {rows.map((r) => (
                                            <Grid key={`${r.year}-${r.month}`} id={`month-section-${r.year}-${r.month}`} size={{xs: 12, sm: 12, md: 6, lg: 4, xl: 3}} sx={{ scrollMarginTop: '80px' }}>
                                                <Paper elevation={3} sx={{ p: 2 }}>
                                                    <Grid container spacing={1}>
                                                        <Grid size="auto" sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar
                                                                variant="square"
                                                                alt={r.grade}
                                                                slotProps={{
                                                                    img: {
                                                                        draggable: false,
                                                                    }
                                                                }}
                                                                sx={{
                                                                    mx: 2,
                                                                    fontWeight: "bold",
                                                                    fontSize: "1rem",
                                                                    userSelect: 'none',
                                                                    '& .MuiAvatar-img': {
                                                                        objectFit: 'contain',
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        userSelect: 'none',
                                                                        WebkitUserDrag: 'none',
                                                                    },
                                                                }}
                                                                src={getRankInsigniaUrl(r.grade)}
                                                            >
                                                                {r.grade}
                                                            </Avatar>
                                                        </Grid>
                                                        <Grid size="grow">
                                                            <Typography variant="subtitle2" gutterBottom>
                                                                {formatDateLongMonthYear(r.iso)}
                                                            </Typography>
                                                            <Typography variant="body1">Base Pay: {formatCompactCurrency(r.pay)}</Typography>
                                                            <Typography variant="body2">
                                                                {getRankFromGrade ? getRankFromGrade(r.grade) : ''} ({r.grade})
                                                            </Typography>
                                                            <Typography variant="caption">Time in Service: {r.tis} Years</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Timeline Scrubber Column (Full vertical height at same z-level) */}
                    <Box sx={{ position: 'sticky', top: 84, height: 'calc(100vh - 108px)', flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
                        <TimelineScrubber items={scrubberItems} monthlyTimeline={timeline.monthly} />
                    </Box>
                </Box>
                :
                <Typography variant="h6" sx={{ textAlign: 'center', mt: '40vh', fontWeight: 'bold' }}>Add at least two promotions to get started!</Typography>
            }
        </>
    );
}

