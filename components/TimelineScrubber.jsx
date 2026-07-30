'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Tooltip, IconButton, Avatar, Typography } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { formatDateMonthYear } from '@/lib/payLogic';

export default function TimelineScrubber({ items = [], monthlyTimeline = [] }) {
    const scrubberRef = useRef(null);
    const trackRef = useRef(null);
    const isPointerDownRef = useRef(false);
    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);

    const [isAnalyticsActive, setIsAnalyticsActive] = useState(true);
    const [scrollLinePct, setScrollLinePct] = useState(0);
    const [itemPositions, setItemPositions] = useState({});

    // Hover & Snap-back states
    const [isHovered, setIsHovered] = useState(false);
    const [hoverLinePct, setHoverLinePct] = useState(null);
    const [isSnappingBack, setIsSnappingBack] = useState(false);

    // Calculate layout heights and positions immediately
    const calculatePositions = useCallback(() => {
        const mainContainer = document.getElementById('main-content-column');
        if (!mainContainer) return;

        const mainRect = mainContainer.getBoundingClientRect();
        const containerTop = mainRect.top + window.pageYOffset;
        const maxDocScrollY = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const startScrollY = containerTop - 80;
        const scrollableRange = Math.max(1, maxDocScrollY - startScrollY);

        // 1. Calculate horizontal blue line position percentage based on actual scrollable document range
        const currentScrollY = window.scrollY;
        const currentRatio = Math.max(0, Math.min(1, (currentScrollY - startScrollY) / scrollableRange));
        setScrollLinePct(currentRatio * 100);

        // 2. Check if Retirement Analytics section is currently active
        const analyticsEl = document.getElementById('retirement-analytics-section');
        if (analyticsEl) {
            const analyticsBottom = analyticsEl.offsetTop + analyticsEl.offsetHeight;
            setIsAnalyticsActive((currentScrollY + 80) < analyticsBottom);
        }

        // 3. Compute relative vertical percentage position for each scrubber item based on scrollable range
        const positions = {};
        items.forEach((item) => {
            const el = document.getElementById(item.id);
            if (el) {
                const elTop = (el.getBoundingClientRect().top + window.pageYOffset) - startScrollY;
                const pct = Math.max(0, Math.min(100, (elTop / scrollableRange) * 100));
                positions[item.id] = pct;
            }
        });
        setItemPositions(positions);
    }, [items]);

    useEffect(() => {
        calculatePositions();
        window.addEventListener('scroll', calculatePositions, { passive: true });
        window.addEventListener('resize', calculatePositions, { passive: true });

        const timer = setTimeout(calculatePositions, 300);

        return () => {
            window.removeEventListener('scroll', calculatePositions);
            window.removeEventListener('resize', calculatePositions);
            clearTimeout(timer);
        };
    }, [calculatePositions]);

    // Handle mouse move over scrubber track only (excludes Analytics button)
    const handleMouseMove = (e) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const relativeY = e.clientY - rect.top;
        const ratio = Math.max(0, Math.min(1, relativeY / rect.height));
        setHoverLinePct(ratio * 100);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        setIsSnappingBack(false);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setHoverLinePct(null);
        setIsSnappingBack(true);
        setTimeout(() => {
            setIsSnappingBack(false);
        }, 180);
    };

    // Pointer move listener for dragging along the scrubber track
    useEffect(() => {
        const updateScrollFromPointer = (clientY) => {
            if (!trackRef.current) return;
            const rect = trackRef.current.getBoundingClientRect();
            const relativeY = clientY - rect.top;
            const ratio = Math.max(0, Math.min(1, relativeY / rect.height));

            const mainContainer = document.getElementById('main-content-column');
            if (!mainContainer) return;
            const mainRect = mainContainer.getBoundingClientRect();
            const containerTop = mainRect.top + window.pageYOffset;
            const maxDocScrollY = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            const startScrollY = containerTop - 80;
            const scrollableRange = Math.max(1, maxDocScrollY - startScrollY);

            const targetY = startScrollY + (ratio * scrollableRange);
            window.scrollTo({ top: targetY, behavior: 'instant' });
        };

        const handlePointerMove = (e) => {
            if (!isPointerDownRef.current) return;
            const dist = Math.abs(e.clientY - startYRef.current);
            if (dist > 5) {
                isDraggingRef.current = true;
                updateScrollFromPointer(e.clientY);
            }
        };

        const handlePointerUp = (e) => {
            if (isPointerDownRef.current && !isDraggingRef.current) {
                updateScrollFromPointer(e.clientY);
            }
            isPointerDownRef.current = false;
            isDraggingRef.current = false;
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
        };
    }, []);

    // Calculate active percentage and Month/Year string for persistent pill indicator
    const activeLinePct = (isHovered && hoverLinePct !== null) ? hoverLinePct : scrollLinePct;

    const activeMonthYear = React.useMemo(() => {
        if (!monthlyTimeline || monthlyTimeline.length === 0) return '';
        const ratio = activeLinePct / 100;
        const idx = Math.min(monthlyTimeline.length - 1, Math.max(0, Math.round(ratio * (monthlyTimeline.length - 1))));
        const item = monthlyTimeline[idx];
        if (!item || !item.iso) return '';
        return formatDateMonthYear(item.iso);
    }, [activeLinePct, monthlyTimeline]);

    // Calculate percentage position of the first rank item
    const firstRankPct = React.useMemo(() => {
        const firstPromo = items.find(item => item.type === 'promotion');
        if (firstPromo && itemPositions[firstPromo.id] !== undefined) {
            return itemPositions[firstPromo.id];
        }
        return 5;
    }, [items, itemPositions]);

    const isBeforeFirstRank = activeLinePct < (firstRankPct - 0.5);

    if (!items || items.length === 0) return null;

    const handlePointerDown = (e) => {
        isPointerDownRef.current = true;
        isDraggingRef.current = false;
        startYRef.current = e.clientY;
    };

    const scrollToItem = (targetId) => {
        if (targetId === 'analytics') {
            const el = document.getElementById('retirement-analytics-section');
            if (el) {
                el.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
            return;
        }

        const el = document.getElementById(targetId);
        if (el) {
            const yOffset = -80;
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'instant' });
        }
    };

    return (
        <Box
            ref={scrubberRef}
            sx={{
                height: 'calc(100vh - 108px)',
                py: 1,
                px: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxSizing: 'border-box',
                userSelect: 'none',
                touchAction: 'none',
            }}
        >
            {/* 1. Retirement Analytics Icon (TOP - Excluded from track hover area) */}
            <Tooltip title="Retirement Analytics" placement="left" arrow>
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        scrollToItem('analytics');
                    }}
                    sx={{
                        p: 0.75,
                        color: isAnalyticsActive ? 'primary.main' : 'text.secondary',
                        bgcolor: isAnalyticsActive ? 'action.selected' : 'transparent',
                        '&:hover': { color: 'primary.main', bgcolor: 'action.hover' }
                    }}
                >
                    <AnalyticsIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            {/* Generous Space Between Analytics Button & Scrubber Track */}
            <Box sx={{ width: '100%', height: '1px', bgcolor: 'divider', mt: 2, mb: 2.5 }} />

            {/* 2. Proportional Scrubber Track Container (Hover and drag area) */}
            <Box
                ref={trackRef}
                onPointerDown={handlePointerDown}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                sx={{
                    flexGrow: 1,
                    width: '100%',
                    position: 'relative',
                    cursor: 'row-resize',
                }}
            >
                {/* Vertical Lines Connecting Consecutive Rank Promotions (Where space permits padding) */}
                {(() => {
                    const promotionItems = items.filter(item => item.type === 'promotion');
                    if (!promotionItems.length) return null;

                    const lines = [];
                    const paddingPct = 2.5; // Padding above and below rank avatars

                    // 1. Vertical Line ABOVE the First Rank
                    const firstPct = itemPositions[promotionItems[0].id];
                    if (firstPct !== undefined) {
                        const lineEnd = firstPct - paddingPct;
                        if (lineEnd > 1.5) {
                            lines.push(
                                <Box
                                    key="line-above-first"
                                    sx={{
                                        position: 'absolute',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        top: '0%',
                                        height: `${lineEnd}%`,
                                        width: 2,
                                        bgcolor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.2)'
                                                : 'rgba(0, 0, 0, 0.15)',
                                        borderRadius: 1,
                                        zIndex: 1,
                                        pointerEvents: 'none',
                                    }}
                                />
                            );
                        }
                    }

                    // 2. Vertical Lines BETWEEN Ranks
                    for (let i = 0; i < promotionItems.length - 1; i++) {
                        const itemA = promotionItems[i];
                        const itemB = promotionItems[i + 1];
                        const pctA = itemPositions[itemA.id];
                        const pctB = itemPositions[itemB.id];

                        if (pctA !== undefined && pctB !== undefined) {
                            const lineStart = pctA + paddingPct;
                            const lineEnd = pctB - paddingPct;
                            const lineHeight = lineEnd - lineStart;

                            if (lineHeight > 1.5) {
                                lines.push(
                                    <Box
                                        key={`line-${itemA.id}-${itemB.id}`}
                                        sx={{
                                            position: 'absolute',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            top: `${lineStart}%`,
                                            height: `${lineHeight}%`,
                                            width: 2,
                                            bgcolor: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.2)'
                                                    : 'rgba(0, 0, 0, 0.15)',
                                            borderRadius: 1,
                                            zIndex: 1,
                                            pointerEvents: 'none',
                                        }}
                                    />
                                );
                            }
                        }
                    }

                    // 3. Vertical Line BELOW the Last Rank
                    const lastPct = itemPositions[promotionItems[promotionItems.length - 1].id];
                    if (lastPct !== undefined) {
                        const lineStart = lastPct + paddingPct;
                        const lineHeight = 100 - lineStart;
                        if (lineHeight > 1.5) {
                            lines.push(
                                <Box
                                    key="line-below-last"
                                    sx={{
                                        position: 'absolute',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        top: `${lineStart}%`,
                                        height: `${lineHeight}%`,
                                        width: 2,
                                        bgcolor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.2)'
                                                : 'rgba(0, 0, 0, 0.15)',
                                        borderRadius: 1,
                                        zIndex: 1,
                                        pointerEvents: 'none',
                                    }}
                                />
                            );
                        }
                    }

                    return lines;
                })()}

                {/* Standard Blue Line Scroll Position Indicator */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: -4,
                        right: -4,
                        top: `${scrollLinePct}%`,
                        height: 2,
                        bgcolor: 'primary.main',
                        opacity: 0.6,
                        borderRadius: 1,
                        zIndex: 4,
                        pointerEvents: 'none',
                    }}
                />

                {/* Persistent Thicker Line + Month/Year Pill Element */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: -8,
                        right: -8,
                        top: `${activeLinePct}%`,
                        height: 4,
                        bgcolor: 'primary.main',
                        boxShadow: (theme) => `0 0 10px ${theme.palette.primary.main}`,
                        borderRadius: 2,
                        zIndex: 10,
                        transition: isSnappingBack ? 'top 0.18s ease-out' : 'none',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {activeMonthYear && !isBeforeFirstRank && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: '6px',
                                whiteSpace: 'nowrap',
                                bgcolor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(18, 18, 18, 0.92)'
                                        : 'rgba(255, 255, 255, 0.95)',
                                color: 'text.primary',
                                border: '1px solid',
                                borderColor: 'divider',
                                px: 1,
                                py: 0.25,
                                borderRadius: 4,
                                boxShadow: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? '0 2px 10px rgba(0,0,0,0.6)'
                                        : '0 2px 10px rgba(0,0,0,0.15)',
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: '0.68rem',
                                    letterSpacing: 0.3,
                                    lineHeight: 1,
                                }}
                            >
                                {activeMonthYear}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Scrubber Items (Rank Insignia Images & Spaced Year Milestone Dots) */}
                {items.map((item, index) => {
                    const topPct = itemPositions[item.id];
                    if (topPct === undefined) return null;

                    // De-crowding filter: skip year-dots if too close (< 4.5%) to a rank promotion icon or previous dot
                    if (item.type === 'year-dot') {
                        const isTooClose = items.some((other, oIdx) => {
                            if (oIdx === index) return false;
                            const otherPct = itemPositions[other.id];
                            if (otherPct === undefined) return false;
                            if (other.type === 'promotion' && Math.abs(otherPct - topPct) < 4.5) return true;
                            if (other.type === 'year-dot' && oIdx < index && Math.abs(otherPct - topPct) < 4) return true;
                            return false;
                        });
                        if (isTooClose) return null;
                    }

                    return (
                        <Tooltip key={item.id} title={item.label} placement="left" arrow>
                            <Box
                                onClick={(e) => {
                                    e.stopPropagation();
                                    scrollToItem(item.id);
                                }}
                                sx={{
                                    position: 'absolute',
                                    top: `${topPct}%`,
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    cursor: 'row-resize',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: item.type === 'promotion' ? 3 : 2,
                                    transition: 'transform 0.15s ease',
                                    '&:hover': {
                                        transform: 'translate(-50%, -50%) scale(1.3)',
                                    },
                                }}
                            >
                                {item.type === 'promotion' ? (
                                    <Avatar
                                        variant="rounded"
                                        src={item.insigniaUrl}
                                        alt={item.grade}
                                        slotProps={{
                                            img: {
                                                draggable: false,
                                            }
                                        }}
                                        sx={{
                                            width: item.insigniaUrl ? 18 : 22,
                                            height: item.insigniaUrl ? 18 : 16,
                                            fontSize: '0.55rem',
                                            fontWeight: 'bold',
                                            bgcolor: item.insigniaUrl ? 'transparent' : 'primary.main',
                                            color: item.insigniaUrl ? 'text.primary' : 'primary.contrastText',
                                            borderRadius: item.insigniaUrl ? 0 : 0.75,
                                            pointerEvents: 'none',
                                            userSelect: 'none',
                                            '& .MuiAvatar-img': {
                                                objectFit: 'contain',
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                                WebkitUserDrag: 'none',
                                            },
                                        }}
                                    >
                                        {item.grade}
                                    </Avatar>
                                ) : (
                                    <Box
                                        sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            bgcolor: 'text.disabled',
                                            transition: 'all 0.15s ease',
                                            '&:hover': {
                                                bgcolor: 'primary.main',
                                            },
                                        }}
                                    />
                                )}
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>
        </Box>
    );
}
