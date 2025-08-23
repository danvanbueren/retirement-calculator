import * as React from 'react';
import {
    FormControl,
    InputLabel,
    Box,
    Divider,
    Typography,
    CssBaseline,
    Toolbar,
    MenuItem,
    Select,
    IconButton,
    Tooltip, Avatar
} from "@mui/material";
import {styled} from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MinimizeIcon from '@mui/icons-material/Minimize';
import GitHubIcon from '@mui/icons-material/GitHub';
import CoffeeIcon from '@mui/icons-material/Coffee';
import BugReportIcon from '@mui/icons-material/BugReport';
import {useColorMode} from "@/context/ThemeModeProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import EditableGradeTable from "@/components/EditableGradeTable";
import { format, parseISO, isDate } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {useStorage} from "@/context/StorageContext";

const drawerWidth = 400;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    variants: [
        {
            props: ({ open }) => open,
            style: {
                marginLeft: drawerWidth,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            },
        },
    ],
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({ open }) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);

const getLongPrintRetirementTypeFromValue = (value) => {
    switch (value) {
        case 0.02:
            return "Blended Retirement (BRS) - 2.0%";
        case 0.025:
            return "High-3 Legacy Retirement - 2.5%";
        default:
            return "Unknown";
    }
};

const getShortPrintRetirementTypeFromValue = (value) => {
    switch (value) {
        case 0.02:
            return "BRS";
        case 0.025:
            return "H-3";
        default:
            return "?";
    }
};

export default function Sidebar({ children }) {
    const { mode, toggleMode } = useColorMode();

    const {
        sidebarOpen,
        setSidebarOpen,
        retirementMultiplier,
        setRetirementMultiplier,
        serviceLocalization,
        setServiceLocalization,
        promotions,
        setPromotions,
        getRankInsigniaUrl,
        getRankFromGrade,
    } = useStorage();

    const formatDate = (value) => {
        const date = isDate(value) ? value : parseISO(String(value));
        if (isNaN(date)) return String(value); // fallback if unparsable
        return format(date, 'dd-MMM-yyyy', { locale: enUS }); // e.g., 23-May-2025
    };


    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <AppBar position="fixed" open={sidebarOpen}>
                <Toolbar>
                    <Tooltip title="Open sidebar" placement="right" arrow>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={() => {setSidebarOpen(true)}}
                            edge="start"
                            sx={[
                                {
                                    marginRight: 5,
                                },
                                sidebarOpen && { display: 'none' },
                            ]}
                        >
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>

                    <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        US Military Retirement Calculator
                    </Typography>

                    <IconButton onClick={toggleMode} color="inherit">
                        {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Drawer variant="permanent" open={sidebarOpen}>
                <DrawerHeader sx={{mx: 1}}>
                    <Box flexGrow={1}>
                        <Tooltip title="View project on GitHub" placement="top-start" arrow>
                            <IconButton href="https://github.com/danvanbueren" target="_blank" rel="noopener noreferrer">
                                <GitHubIcon/>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Support me on Ko-Fi" placement="top" arrow>
                            <IconButton href="https://ko-fi.com/danvanbueren" target="_blank" rel="noopener noreferrer">
                                <CoffeeIcon/>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Report a bug on GitHub" placement="top" arrow>
                            <IconButton href="https://github.com/danvanbueren" target="_blank" rel="noopener noreferrer">
                                <BugReportIcon/>
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Tooltip title="Minimize sidebar" placement="top" arrow>
                        <IconButton onClick={() => {setSidebarOpen(false)}}>
                            <MinimizeIcon />
                        </IconButton>
                    </Tooltip>
                </DrawerHeader>

                <Divider />

                { sidebarOpen &&
                    <Box sx={{ mx: 2.5, my: 3, minWidth: 120 }} display={'flex'} flexDirection={'column'} gap={2}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", minWidth: 0, whiteSpace: 'normal', overflowWrap: 'anywhere', pb: 1}}>
                            App Settings
                        </Typography>

                        <FormControl>
                            <InputLabel id="color-mode-theme-label">Color Mode Theme</InputLabel>
                            <Select
                                labelId="color-mode-theme-label"
                                id="color-mode-theme"
                                value={mode}
                                label="Color Mode Theme"
                                onChange={(event) => {
                                    if (event.target.value !== mode)
                                        toggleMode();
                                }}
                            >
                                <MenuItem value={"dark"}>Dark</MenuItem>
                                <MenuItem value={"light"}>Light</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <InputLabel id="service-localization-label">Service Localization</InputLabel>
                            <Select
                                labelId="service-localization-label"
                                id="service-localization"
                                value={serviceLocalization}
                                label="Service Localization"
                                onChange={(event) => {setServiceLocalization(event.target.value)}}
                            >
                                <MenuItem value={"USAF"}>USAF - Air Force</MenuItem>
                                <MenuItem value={"USSF"}>USSF - Space Force</MenuItem>
                                <MenuItem value={"USAR"}>USAR - Army</MenuItem>
                                <MenuItem value={"USN"}>USN - Navy</MenuItem>
                                <MenuItem value={"USMC"}>USMC - Marine Corps</MenuItem>
                                <MenuItem value={"USCG"}>USCG - Coast Guard</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <InputLabel id="retirement-type-label">Retirement Type</InputLabel>
                            <Select
                                labelId="retirement-type-label"
                                id="retirement-type"
                                value={retirementMultiplier}
                                label="Retirement Type"
                                onChange={(event) => {setRetirementMultiplier(event.target.value)}}
                            >
                                <MenuItem value={0.02}>Blended Retirement (BRS) - 2.0%</MenuItem>
                                <MenuItem value={0.025}>High-3 Legacy Retirement - 2.5%</MenuItem>
                            </Select>
                        </FormControl>

                        <Typography variant="subtitle2" sx={{ opacity: 0.5, minWidth: 0, whiteSpace: 'normal', overflowWrap: 'anywhere', textAlign: 'justify', textJustify: 'inter-word', px: 2, fontSize: '0.75rem' }}>
                            <b>Notice:</b> This calculator only supports Active-Duty component retirement calculation. National Guard and Reserve retirement calculation are not supported.
                        </Typography>

                        <Divider sx={{my: 1}}/>

                        {/* Add a list of date  */}

                        <Typography variant="h6" sx={{ fontWeight: "bold", minWidth: 0, whiteSpace: 'normal', overflowWrap: 'anywhere'}}>
                            Promotion History
                        </Typography>

                        <EditableGradeTable
                            rows={promotions}
                            onRowsChange={setPromotions}
                        />

                        <Typography variant="subtitle2" sx={{ opacity: 0.5, minWidth: 0, whiteSpace: 'normal', overflowWrap: 'anywhere', textAlign: 'justify', textJustify: 'inter-word', px: 2, fontSize: '0.75rem' }}>
                            <b>Notice:</b> Pay is calculated from the oldest to newest promotion dates. Therefore, it is likely necessary to add a duplicate promotion date for the retiring grade to ensure Time in Service is properly accounted for, extending to the correct retirement date.
                        </Typography>

                    </Box>
                }

                { !sidebarOpen &&
                    <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", gap: 2, my: 2, cursor: "pointer"}} onClick={() => {setSidebarOpen(true)}}>

                        <Tooltip title={"Service localization: " + serviceLocalization} placement="right" arrow>
                            <Avatar variant="square" alt={serviceLocalization} src={"/seals/" + serviceLocalization + ".png"}/>
                        </Tooltip>

                        <Tooltip title={"Retirement type: " + getLongPrintRetirementTypeFromValue(retirementMultiplier)} placement="right" arrow>
                            <Avatar variant="rounded" alt={getShortPrintRetirementTypeFromValue(retirementMultiplier)} sx={{fontWeight: "bold", fontSize: "1rem", bgcolor: "primary.main", color: "primary.contrastText" }}>
                                {getShortPrintRetirementTypeFromValue(retirementMultiplier)}
                            </Avatar>
                        </Tooltip>

                        {promotions.map(p => (
                            <Tooltip
                                key={p.id}
                                title={getRankFromGrade(p.grade) + " (" + formatDate(p.date) + ")"}
                                placement="right"
                                arrow
                            >
                                <Avatar
                                    variant="square"
                                    alt={p.grade}
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "1rem",
                                        '& .MuiAvatar-img': {
                                            objectFit: 'contain',  // prevent cropping
                                            width: '100%',
                                            height: '100%',
                                        },
                                    }}
                                    src={getRankInsigniaUrl(p.grade)}
                                >
                                    {p.grade}
                                </Avatar>
                            </Tooltip>
                        ))}

                    </Box>
                }

            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                { children }
            </Box>
        </Box>
    );
}
