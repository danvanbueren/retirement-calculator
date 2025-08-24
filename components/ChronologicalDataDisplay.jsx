'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {Box, Grid, Paper, Typography, Divider, CardMedia, Card, Avatar} from '@mui/material';
import { useStorage } from '@/context/StorageContext';
import {buildMonthlyTimeline, calcTimeInService, makeGetPay} from '@/lib/payLogic';

import payTable2025 from '@/data/pay-2025.json';

export default function ChronologicalDataDisplay() {
    const {
        retirementMultiplier,
        promotions,
        getRankFromGrade,
        getRankInsigniaUrl,
        serviceLocalization
    } = useStorage();

    const getPay = useMemo(() => makeGetPay(payTable2025), []);
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

    const retirementPay = useMemo(
        () => timeline.avgLast36 * yearsOfService * (retirementMultiplier ?? 0),
        [timeline.avgLast36, yearsOfService, retirementMultiplier]
    );

    // group by year for display
    const byYear = useMemo(() => {
        const m = new Map();
        for (const row of timeline.monthly) {
            if (!m.has(row.year)) m.set(row.year, []);
            m.get(row.year).push(row);
        }
        return m;
    }, [timeline.monthly]);

    return (

        <>
            { promotions.length > 1 ?
                <>
                    {[...byYear.entries()].sort(([a],[b]) => a - b).map(([year, rows]) => (
                        <Box key={year} sx={{ mb: 4 }}>
                            <Typography variant="h5" sx={{ mb: 2 }}>{year}</Typography>
                            <Grid container spacing={2}>
                                {rows.map((r) => (
                                    <Grid key={`${r.year}-${r.month}`} size={{xs: 12, sm: 12, md: 6, lg: 4, xl: 3}}>
                                        <Paper elevation={3} sx={{ p: 2 }}>

                                            <Grid container spacing={1}>
                                                <Grid size="auto" sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar
                                                        variant="square"
                                                        alt={r.grade}
                                                        sx={{
                                                            mx: 2,
                                                            fontWeight: "bold",
                                                            fontSize: "1rem",
                                                            '& .MuiAvatar-img': {
                                                                objectFit: 'contain',
                                                                width: '100%',
                                                                height: '100%',
                                                            },
                                                        }}
                                                        src={getRankInsigniaUrl(r.grade)}
                                                    >
                                                        {r.grade}
                                                    </Avatar>
                                                </Grid>
                                                <Grid size="grow">
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        {new Date(r.iso).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                                                    </Typography>
                                                    <Typography variant="body1">Base Pay: ${r.pay.toLocaleString(undefined, {maximumFractionDigits: 0})}</Typography>
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

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{py: 2}}>
                        <Typography variant="h6">Total base pay paid out over timeline: ${timeline.totalBase.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})}</Typography>
                        <Typography variant="h6">Averaged base pay of last {Math.min(36, timeline.monthly.length)} months: ${timeline.avgLast36.toFixed(2)}</Typography>
                        <Typography variant="h6">Monthly retirement estimate from base pay: ${retirementPay.toFixed(2)}</Typography>
                    </Box>
                </>
                :
                <Typography variant={"h6"} sx={{ justifySelf: "center", mt: "40vh", fontWeight: "bold" }}>Add at least two promotions to get started!</Typography>
            }
        </>
    );
}
