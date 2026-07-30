'use client';
import React, { useState } from 'react';
import {
    Dialog, AppBar, Toolbar, IconButton, Typography, Box, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Slide, Tooltip, Select, MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TableChartIcon from '@mui/icons-material/TableChart';

import payByYear from '@/data/pay-by-year.json';

const Transition = React.forwardRef(function Transition(props, ref) {
    const { ownerState, TransitionComponent, transitionComponent, ...other } = props;
    return <Slide direction="up" ref={ref} {...other} />;
});

const COLUMNS = [
    "2 or less", "Over 2", "Over 3", "Over 4", "Over 6", "Over 8",
    "Over 10", "Over 12", "Over 14", "Over 16", "Over 18", "Over 20",
    "Over 22", "Over 24", "Over 26", "Over 28", "Over 30", "Over 32",
    "Over 34", "Over 36", "Over 38", "Over 40"
];

const SECTIONS = [
    {
        title: "Commissioned Officers",
        categoryKey: "Officer",
        grades: ["O-10", "O-9", "O-8", "O-7", "O-6", "O-5", "O-4", "O-3", "O-2", "O-1"]
    },
    {
        title: "Commissioned Officers With Over 4 Years Enlisted Service",
        categoryKey: "Officer-4plus",
        grades: ["O-3E", "O-2E", "O-1E"]
    },
    {
        title: "Warrant Officers",
        categoryKey: "Warrant",
        grades: ["W-5", "W-4", "W-3", "W-2", "W-1"]
    },
    {
        title: "Enlisted Members",
        categoryKey: "Enlisted",
        grades: ["E-9", "E-8", "E-7", "E-6", "E-5", "E-4", "E-3", "E-2", "E-1"]
    }
];

const YEAR_OPTIONS = Object.keys(payByYear).map(Number).sort((a, b) => b - a); // 2026 down to 1986

function getColYos(colKey) {
    if (colKey === "2 or less") return 0;
    const m = colKey.match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
}

function getCellValue(selectedYearData, categoryKey, grade, colKey) {
    const colYos = getColYos(colKey);

    // Mandatory minimum YOS check matching official DFAS charts
    if (grade === 'E-8' && colYos < 8) return null;
    if (grade === 'E-9' && colYos < 10) return null;
    if (grade === 'W-5' && colYos < 20) return null;
    if (grade === 'O-9' && colYos < 20) return null;
    if (grade === 'O-10' && colYos < 20) return null;
    if ((grade === 'O-1E' || grade === 'O-2E' || grade === 'O-3E') && colYos < 4) return null;

    const catObj = selectedYearData?.[categoryKey];
    if (!catObj || !catObj[grade]) return null;

    let val = catObj[grade][colKey];
    if (val === undefined && colKey === "Over 2") {
        val = catObj[grade]["2 or less"];
    }
    return val !== undefined ? val : null;
}

const formatPayCell = (val) => {
    if (val === null || val === undefined) return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(val);
};

export default function PayTableModal({ open, onClose }) {
    const [selectedYear, setSelectedYear] = useState(2026);
    const activeYearData = payByYear[selectedYear] || payByYear[2026];

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={onClose}
            slots={{ transition: Transition }}
            sx={{
                '& .MuiDialog-paper': {
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#121212' : '#f8f9fa',
                }
            }}
        >
            <AppBar position="sticky" sx={{ bgcolor: '#1565c0' }}>
                <Toolbar>
                    <TableChartIcon sx={{ mr: 1.5 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        Reference Basic Pay Table — {selectedYear} Active Duty Pay Charts
                    </Typography>

                    {/* Year Selector Dropdown */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 3 }}>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                            Select Year:
                        </Typography>
                        <Select
                            size="small"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            sx={{
                                color: '#fff',
                                bgcolor: 'rgba(255, 255, 255, 0.15)',
                                fontWeight: 'bold',
                                '& .MuiSvgIcon-root': { color: '#fff' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' }
                            }}
                        >
                            {YEAR_OPTIONS.map((yr) => (
                                <MenuItem key={yr} value={yr}>
                                    {yr}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>

                    <Tooltip title="Close (Esc)" arrow>
                        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1800, mx: 'auto', width: '100%' }}>
                {/* Section Tables */}
                {SECTIONS.map((sec) => (
                    <Box key={sec.title} sx={{ mb: 5 }}>
                        {/* Section Title Banner */}
                        <Typography
                            variant="h6"
                            sx={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                mb: 1,
                                color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : '#1a1a1a'
                            }}
                        >
                            {sec.title}
                        </Typography>

                        {/* Table Container */}
                        <TableContainer
                            component={Paper}
                            elevation={3}
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                overflowX: 'auto',
                            }}
                        >
                            <Table size="small" sx={{ minWidth: 1200, borderCollapse: 'collapse' }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell
                                            sx={{
                                                bgcolor: '#e29158',
                                                color: '#000',
                                                fontWeight: 'bold',
                                                fontSize: '0.75rem',
                                                borderRight: '1px solid #c77b45',
                                                borderBottom: '1px solid #c77b45',
                                                width: 70,
                                                minWidth: 70,
                                                position: 'sticky',
                                                left: 0,
                                                zIndex: 3,
                                            }}
                                        />
                                        {COLUMNS.map((col) => (
                                            <TableCell
                                                key={col}
                                                align="center"
                                                sx={{
                                                    bgcolor: '#e29158',
                                                    color: '#000',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.7rem',
                                                    px: 0.5,
                                                    py: 0.75,
                                                    borderRight: '1px solid #c77b45',
                                                    borderBottom: '1px solid #c77b45',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {col}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sec.grades.map((grade, rIdx) => (
                                        <TableRow
                                            key={grade}
                                            sx={{
                                                bgcolor: (theme) =>
                                                    rIdx % 2 === 0
                                                        ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff')
                                                        : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f5f5f7'),
                                                '&:hover': {
                                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(25,118,210,0.06)'
                                                }
                                            }}
                                        >
                                            {/* Left Grade Cell */}
                                            <TableCell
                                                sx={{
                                                    bgcolor: '#e29158',
                                                    color: '#000',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.75rem',
                                                    borderRight: '1px solid #c77b45',
                                                    borderBottom: '1px solid #c77b45',
                                                    position: 'sticky',
                                                    left: 0,
                                                    zIndex: 2,
                                                    py: 0.5,
                                                    px: 1,
                                                }}
                                            >
                                                {grade}
                                            </TableCell>

                                            {/* Data Pay Cells */}
                                            {COLUMNS.map((col) => {
                                                const rawVal = getCellValue(activeYearData, sec.categoryKey, grade, col);
                                                const formatted = formatPayCell(rawVal);

                                                return (
                                                    <TableCell
                                                        key={col}
                                                        align="right"
                                                        sx={{
                                                            fontSize: '0.68rem',
                                                            fontFamily: 'monospace',
                                                            px: 0.6,
                                                            py: 0.4,
                                                            borderRight: '1px solid',
                                                            borderBottom: '1px solid',
                                                            borderColor: 'divider',
                                                            whiteSpace: 'nowrap',
                                                            color: (theme) =>
                                                                formatted
                                                                    ? (theme.palette.mode === 'dark' ? '#e0e0e0' : '#222222')
                                                                    : 'transparent'
                                                        }}
                                                    >
                                                        {formatted || '—'}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                ))}
            </Box>
        </Dialog>
    );
}
