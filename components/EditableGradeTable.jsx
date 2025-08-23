'use client';
import React from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableRow,
    IconButton, Select, MenuItem, FormControl, InputLabel, Typography, FormHelperText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from "@mui/icons-material/Add";

const GRADE_OPTIONS = [
    'E-1','E-2','E-3','E-4','E-5','E-6','E-7','E-8','E-9',
    'W-1','W-2','W-3','W-4','W-5',
    'O-1E','O-2E','O-3E',
    'O-1','O-2','O-3','O-4','O-5','O-6','O-7','O-8','O-9','O-10'
];

const newId = (() => {
    let n = 0;
    return () =>
        (typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `row_${++n}`);
})();

// --- helpers ---
const ymd = (d) => {
    if (!d) return null;
    const dt = (d instanceof Date) ? d : new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
};

const sortByDateAsc = (arr) => {
    const copy = [...arr];
    copy.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        const aa = new Date(a.date).setHours(0,0,0,0);
        const bb = new Date(b.date).setHours(0,0,0,0);
        return aa - bb;
    });
    return copy;
};

function Row({ row, draft, isEditing, onStartEdit, onChangeDraft, onSaveEdit, onDelete, errors, disableActions }) {
    const hasErrors = !!errors && Object.values(errors).some(Boolean);

    return (
        <TableRow
            hover={!disableActions}
            onClick={() => !isEditing && onStartEdit(row.id)}
            sx={{ cursor: isEditing || disableActions ? 'default' : 'pointer' }}
        >
            {/* Date */}
            <TableCell sx={{ pl: 2, pr: 0, mx: 0 }}>
                {isEditing ? (
                    <DatePicker
                        label="Date"
                        value={draft?.date ?? null}
                        onChange={(v) => onChangeDraft(row.id, { date: v })}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: 'small',
                                error: Boolean(errors?.date),
                                helperText: errors?.date || ''
                            }
                        }}
                        sx={{ width: '9rem' }}
                    />
                ) : (
                    <Typography variant="body2">
                        {row.date ? new Date(row.date).toLocaleDateString() : '—'}
                    </Typography>
                )}
            </TableCell>

            {/* Grade */}
            <TableCell sx={{ px: 0, mx: 0 }}>
                {isEditing ? (
                    <FormControl fullWidth size="small" sx={{ my: 1 }} error={Boolean(errors?.grade)}>
                        <InputLabel id={`grade-${row.id}`}>Grade</InputLabel>
                        <Select
                            labelId={`grade-${row.id}`}
                            label="Grade"
                            value={draft?.grade ?? ''}
                            onChange={(e) => onChangeDraft(row.id, { grade: e.target.value })}
                            MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                            sx={{ width: '6rem' }}
                        >
                            {GRADE_OPTIONS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                        </Select>
                        {errors?.grade ? <FormHelperText>{errors.grade}</FormHelperText> : null}
                    </FormControl>
                ) : (
                    <Typography variant="body2">{row.grade || '—'}</Typography>
                )}
            </TableCell>

            {/* Actions */}
            <TableCell align="right" onClick={(e) => e.stopPropagation()} sx={{ px: 0, mx: 0 }}>
                {isEditing ? (
                    <Box display="flex" flexDirection="column" alignItems="flex-end">
                        <IconButton size="small" color="success" onClick={() => onSaveEdit(row.id)} aria-label="save row">
                            <CheckCircleIcon />
                        </IconButton>

                        {hasErrors && (
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => onDelete(row.id)}
                                aria-label="delete row (has errors)"
                                sx={{ mt: 0.5 }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Box>
                ) : (
                    <IconButton color="error" onClick={() => onDelete(row.id)} aria-label="delete row" disabled={disableActions}>
                        <DeleteIcon />
                    </IconButton>
                )}
            </TableCell>
        </TableRow>
    );
}

export default function EditableGradeTable({ rows, onRowsChange }) {
    const [editingId, setEditingId] = React.useState(null);
    const [pendingId, setPendingId] = React.useState(null);   // NEW: local-only, not yet committed row
    const [drafts, setDrafts] = React.useState({});           // { [id]: {date, grade} }
    const [errors, setErrors] = React.useState({});           // { [id]: { date?: '...', grade?: '...' } }

    // Display rows = committed rows + (optional) pending local row for UI
    const displayRows = React.useMemo(() => {
        if (pendingId && !rows.some(r => r.id === pendingId)) {
            return [...rows, { id: pendingId, date: null, grade: '' }];
        }
        return rows;
    }, [rows, pendingId]);

    const changeDraft = (id, patch) => {
        setDrafts(d => ({ ...d, [id]: { ...d[id], ...patch } }));
        setErrors(e => {
            const cur = e[id] || {};
            const cleared = { ...cur, ...Object.fromEntries(Object.keys(patch).map(k => [k, undefined])) };
            return { ...e, [id]: cleared };
        });
    };

    const validateDraft = (id, draft) => {
        const out = {};
        if (!draft?.date) out.date = 'Date is required';
        if (!draft?.grade) out.grade = 'Grade is required';
        if (draft?.date) {
            const key = ymd(draft.date);
            const dup = rows.some(r => r.id !== id && r.date && ymd(r.date) === key);
            if (dup) out.date = 'Date already used';
        }
        return out;
    };

    // Commit current editing row if valid; otherwise show errors and block.
    const tryCommitCurrent = () => {
        if (!editingId) return true;
        const draft = drafts[editingId];
        if (!draft) return true; // nothing to commit

        const v = validateDraft(editingId, draft);
        if (Object.keys(v).length) {
            setErrors(e => ({ ...e, [editingId]: v }));
            return false;
        }

        let next;
        if (editingId === pendingId) {
            // Add new (now valid) row
            next = sortByDateAsc([...rows, { id: editingId, date: draft.date, grade: draft.grade }]);
            setPendingId(null);
        } else {
            // Update existing row
            next = sortByDateAsc(rows.map(r => r.id === editingId ? { ...r, date: draft.date, grade: draft.grade } : r));
        }
        onRowsChange(next);

        setDrafts(d => { const { [editingId]: _, ...rest } = d; return rest; });
        setErrors(e => { const { [editingId]: _, ...rest } = e; return rest; });
        setEditingId(null);
        return true;
    };

    const startEdit = async (id) => {
        // Guard leaving current row
        if (editingId && editingId !== id) {
            const ok = tryCommitCurrent();
            if (!ok) return; // block switching if invalid
        }
        const r = rows.find(x => x.id === id) || (id === pendingId ? { id, date: null, grade: '' } : null);
        setDrafts(d => ({ ...d, [id]: { date: r?.date ?? null, grade: r?.grade ?? '' } }));
        setErrors(e => ({ ...e, [id]: {} }));
        setEditingId(id);
    };

    const saveEdit = (id) => {
        if (editingId !== id) return; // ignore stray saves
        tryCommitCurrent(); // handles validation + commit + sort
    };

    const deleteRow = (id) => {
        if (id === pendingId) {
            // Cancel a never-committed new row
            setPendingId(null);
            setDrafts(d => { const { [id]: _, ...rest } = d; return rest; });
            setErrors(e => { const { [id]: _, ...rest } = e; return rest; });
            if (editingId === id) setEditingId(null);
            return;
        }
        const filtered = rows.filter(r => r.id !== id);
        onRowsChange(sortByDateAsc(filtered));
        if (editingId === id) setEditingId(null);
        setDrafts(d => { const { [id]: _, ...rest } = d; return rest; });
        setErrors(e => { const { [id]: _, ...rest } = e; return rest; });
    };

    const addRow = () => {
        // Guard: if current edit invalid, block adding
        if (!tryCommitCurrent()) return;

        const id = newId();
        setPendingId(id); // local-only; DO NOT commit to parent yet
        setDrafts(d => ({ ...d, [id]: { date: null, grade: '' } }));
        setErrors(e => ({ ...e, [id]: {} }));
        setEditingId(id);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Paper elevation={3}>
                <Box py={2} px={1}>
                    <TableContainer>
                        <Table size="small" aria-label="editable grade table">
                            <TableBody>
                                {displayRows.map(r => (
                                    <Row
                                        key={r.id}
                                        row={r}
                                        draft={drafts[r.id]}
                                        isEditing={editingId === r.id}
                                        onStartEdit={startEdit}
                                        onChangeDraft={changeDraft}
                                        onSaveEdit={saveEdit}
                                        onDelete={deleteRow}
                                        errors={errors[r.id]}
                                        disableActions={Boolean(editingId) && editingId !== r.id}
                                    />
                                ))}

                                {rows.length === 0 && !pendingId && (
                                    <TableRow>
                                        <TableCell colSpan={3}>
                                            <Typography variant="body2" color="text.secondary" sx={{ display: "flex", justifySelf: "center", pt: 1, pb: 2 }}>
                                                Add at least two promotions to get started!
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {rows.length === 1 && !pendingId && (
                                    <TableRow>
                                        <TableCell colSpan={3}>
                                            <Typography variant="body2" color="text.secondary" sx={{ display: "flex", justifySelf: "center", py: 2 }}>
                                                Add at least one more promotion to get started!
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box display="flex" justifyContent="center" mt={2}>
                        <IconButton variant="contained" size="small" onClick={addRow} disabled={Boolean(editingId)}><AddIcon/></IconButton>
                    </Box>
                </Box>
            </Paper>
        </LocalizationProvider>
    );
}
