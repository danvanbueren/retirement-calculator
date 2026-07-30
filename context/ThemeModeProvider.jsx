'use client';
import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { getCookie, setCookie } from '@/lib/cookies';

const ColorModeContext = React.createContext({ mode: 'light', toggleMode: () => {} });
export const useColorMode = () => React.useContext(ColorModeContext);

export default function ThemeModeProvider({ children }) {
    const [mode, setMode] = React.useState('dark'); // safe default for SSR

    React.useEffect(() => {
        const saved = getCookie('themeMode');
        if (saved) {
            setMode(saved);
        } else if (typeof window !== 'undefined') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setMode(prefersDark ? 'dark' : 'light');
        }
    }, []);

    const toggleMode = React.useCallback(() => {
        setMode(prev => {
            const next = prev === 'light' ? 'dark' : 'light';
            setCookie('themeMode', next);
            return next;
        });
    }, []);

    const theme = React.useMemo(() => {
        const isDark = mode === 'dark';

        // Base subtle colors
        const thumb = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
        const thumbHoverArea = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';
        const thumbHoverDirect = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';

        return createTheme({
            palette: {
                mode,
                primary: { main: '#1976d2' },
                secondary: { main: '#9c27b0' },
            },
            shape: { borderRadius: 12 },
        });
    }, [mode]);

    const ctx = React.useMemo(() => ({ mode, toggleMode, setMode }), [mode, toggleMode, setMode]);

    return (
        <ColorModeContext.Provider value={ctx}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}
