import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Plus, Trash2, Pencil, RotateCcw, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Drawer, DrawerClose, DrawerContent, DrawerDescription,
    DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer';

const EMPTY_FORM = { placa: '', subtipo_rem: '' };

const IDLE = null;

export default function Remolques() {
    const [remolques, setRemolques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingRemolque, setEditingRemolque] = useState(null); // null = crear
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    // Map<remolqueId, estado-de-confirmacion>
    const [deleteState, setDeleteState] = useState({});

    // -------------------------------------------------------------------------
    // Data
    // -------------------------------------------------------------------------

    const fetchAll = async () => {
        try {
            setLoading(true);
            const res = await api.get('/remolques');
            setRemolques(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    // -------------------------------------------------------------------------
    // Drawer helpers
    // -------------------------------------------------------------------------

    const openCreate = () => {
        setEditingRemolque(null);
        setFormData(EMPTY_FORM);
        setIsDrawerOpen(true);
    };

    const openEdit = (r) => {
        setEditingRemolque(r);
        setFormData({
            placa: r.placa ?? '',
            subtipo_rem: r.subtipo_rem ?? '',
        });
        setIsDrawerOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingRemolque) {
                await api.patch(`/remolques/${editingRemolque.id}`, formData);
            } else {
                await api.post('/remolques', formData);
            }
            setIsDrawerOpen(false);
            fetchAll();
        } catch (e) {
            console.error('Error al guardar remolque:', e.response?.data || e.message);
        } finally {
            setSaving(false);
        }
    };

    // -------------------------------------------------------------------------
    // Delete / Deactivate flow
    // -------------------------------------------------------------------------

    const setCardState = (id, state) =>
        setDeleteState((prev) => ({ ...prev, [id]: state }));

    const handleDeleteClick = (id) => {
        setCardState(id, { step: 'confirm' });
    };

    const handleDeleteConfirm = async (id) => {
        setCardState(id, { step: 'loading' });
        try {
            await api.delete(`/remolques/${id}`);
            setRemolques((prev) => prev.filter((r) => r.id !== id));
            setCardState(id, IDLE);
        } catch (error) {
            if (error.response?.status === 409) {
                const { message, viajes_count } = error.response.data;
                setCardState(id, { step: 'conflict', message, count: viajes_count });
            } else {
                console.error('Error eliminando remolque:', error);
                setCardState(id, IDLE);
            }
        }
    };

    const handleDeactivate = async (id) => {
        setCardState(id, { step: 'loading' });
        try {
            await api.patch(`/remolques/${id}`, { activo: false });
            setRemolques((prev) =>
                prev.map((r) => (r.id === id ? { ...r, activo: false } : r))
            );
        } catch (error) {
            console.error('Error desactivando remolque:', error);
        } finally {
            setCardState(id, IDLE);
        }
    };

    const handleReactivate = async (id) => {
        try {
            await api.patch(`/remolques/${id}`, { activo: true });
            setRemolques((prev) =>
                prev.map((r) => (r.id === id ? { ...r, activo: true } : r))
            );
        } catch (error) {
            console.error('Error reactivando remolque:', error);
        }
    };

    const cancelDelete = (id) => setCardState(id, IDLE);

    // -------------------------------------------------------------------------
    // Render helpers
    // -------------------------------------------------------------------------

    const renderCardActions = (r) => {
        const ds = deleteState[r.id];

        if (!ds) {
            return (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(r)}
                        title="Editar remolque"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    {r.activo !== false ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive opacity-70 hover:opacity-100 hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(r.id)}
                            title="Eliminar remolque"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:bg-green-50"
                            onClick={() => handleReactivate(r.id)}
                            title="Reactivar remolque"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            );
        }

        if (ds.step === 'loading') {
            return (
                <div className="h-8 w-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground" />
                </div>
            );
        }

        if (ds.step === 'confirm') {
            return (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">¿Eliminar?</span>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleDeleteConfirm(r.id)}
                    >
                        Sí
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => cancelDelete(r.id)}
                    >
                        No
                    </Button>
                </div>
            );
        }

        return null; // conflict se renderiza en la card
    };

    // -------------------------------------------------------------------------
    // JSX
    // -------------------------------------------------------------------------

    return (
        <div className="pb-24">
            <h1 className="text-2xl font-bold mb-6">Remolques</h1>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : remolques.length === 0 ? (
                <p className="text-center p-8 text-muted-foreground">Sin remolques registrados.</p>
            ) : (
                <div className="grid gap-4">
                    {remolques.map((r) => {
                        const ds = deleteState[r.id];
                        const isInactive = r.activo === false;
                        const isConflict = ds?.step === 'conflict';

                        return (
                            <Card
                                key={r.id}
                                className={`overflow-hidden shadow-sm transition-all ${isInactive ? 'opacity-50' : 'active:scale-[0.98]'}`}
                            >
                                <CardContent className="p-4">
                                    {/* Cabecera: placa + acciones */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-lg font-bold font-mono leading-tight break-words pr-2">
                                                {r.placa}
                                            </h2>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                                                    {r.subtipo_rem}
                                                </span>
                                                {isInactive && (
                                                    <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {renderCardActions(r)}
                                    </div>

                                    {/* Banner de conflicto (409) */}
                                    {isConflict && (
                                        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex items-start gap-2 mb-3">
                                                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                                <p className="text-xs text-amber-800 leading-snug">
                                                    {ds.message}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="h-8 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                                                    onClick={() => handleDeactivate(r.id)}
                                                >
                                                    Desactivar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-3 text-xs"
                                                    onClick={() => cancelDelete(r.id)}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* FAB + Drawer (crear / editar) */}
            <div className="fixed bottom-6 right-6 z-40 md:static md:mt-8 md:flex md:justify-end">
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                        <Button
                            size="icon"
                            className="h-14 w-14 rounded-full shadow-lg md:w-auto md:h-11 md:px-6 md:rounded-md"
                            onClick={openCreate}
                        >
                            <Plus className="h-6 w-6 md:mr-2" />
                            <span className="hidden md:inline font-semibold">Nuevo Remolque</span>
                        </Button>
                    </DrawerTrigger>

                    <DrawerContent className="max-h-[90vh]">
                        <DrawerHeader className="text-left">
                            <DrawerTitle className="text-xl">
                                {editingRemolque ? 'Editar Remolque' : 'Nuevo Remolque'}
                            </DrawerTitle>
                            <DrawerDescription>
                                {editingRemolque
                                    ? 'Modifica los datos del remolque y guarda los cambios.'
                                    : 'Caja o plataforma del vehículo articulado.'}
                            </DrawerDescription>
                        </DrawerHeader>

                        <form id="remolqueForm" onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto">
                            <div className="space-y-2">
                                <Label>Placa *</Label>
                                <Input name="placa" placeholder="XYZ-7890" value={formData.placa} onChange={handleChange}
                                    required className="h-12 font-mono uppercase" />
                            </div>
                            <div className="space-y-2">
                                <Label>Subtipo (clave SAT) *</Label>
                                <Input name="subtipo_rem" placeholder="CTR001" value={formData.subtipo_rem} onChange={handleChange}
                                    required className="h-12" maxLength={10} />
                            </div>
                        </form>

                        <DrawerFooter className="pt-2">
                            <Button
                                type="submit"
                                form="remolqueForm"
                                className="h-12 text-lg"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Guardando…'
                                    : editingRemolque
                                        ? 'Guardar Cambios'
                                        : 'Guardar Remolque'}
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="outline" className="h-12">Cancelar</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    );
}