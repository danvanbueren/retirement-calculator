'use client';
import React from 'react';
import {Box, Button, Container, Grid, Paper, Typography} from '@mui/material';
import {useStorage} from "@/context/StorageContext";

export default function ChronologicalDataDisplay() {

    const {
        retirementMultiplier,
        serviceLocalization,
        promotions,
        getRankInsigniaUrl,
        getRankFromGrade,
    } = useStorage();

    return (
        <Box sx={{ p: 1 }}>

            <Grid container spacing={2}>

                <Grid size={12}>
                    <Typography variant="h4">Year</Typography>
                </Grid>

                {/* Replace this with actual data and finish look & feel */}
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(id => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }} key={id}>
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h4" gutterBottom>
                                Month
                            </Typography>
                            <Typography variant="body1">
                                Base Pay
                            </Typography>
                            <Typography variant="body1">
                                Rank / Insignia
                            </Typography>
                        </Paper>
                    </Grid>
                ))}


            </Grid>

        </Box>
    );
}
