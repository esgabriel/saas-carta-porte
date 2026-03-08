import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Plus, Trash2, Pencil, RotateCcw, AlertTriangle, ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Drawer, DrawerClose, DrawerContent, DrawerDescription,
    DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer';

const EMPTY_V = {
    placa: '', anio_modelo: '', config_vehicular: '', peso_bruto_vehicular: '',
    tipo_permiso_sct: '', num_permiso_sct: '', num_serie: '',
};

const IDLE = null;

export default function Vehiculos() {
    const [vehiculos, setVehiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingVehiculo, setEditingVehiculo] = useState(null); // null = crear
    const [vForm, setVForm] = useState(EMPTY_V);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    // Map<vehiculoId, estado-de-confirmacion>
    const [deleteState, setDeleteState] = useState({});

    // -------------------------------------------------------------------------
    // Data
    // -------------------------------------------------------------------------

    const fetchAll = async () => {
        try {
            setLoading(true);
            const res = await api.get('/vehiculos');
            setVehiculos(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    // -------------------------------------------------------------------------
    // Drawer helpers
    // -------------------------------------------------------------------------

    const openCreate = () => {
        setEditingVehiculo(null);
        setVForm(EMPTY_V);
        setFormError('');
        setIsDrawerOpen(true);
    };

    const openEdit = (v) => {
        setEditingVehiculo(v);
        setVForm({
            placa: v.placa ?? '',
            anio_modelo: v.anio_modelo ?? '',
            config_vehicular: v.config_vehicular ?? '',
            peso_bruto_vehicular: v.peso_bruto_vehicular ?? '',
            tipo_permiso_sct: v.tipo_permiso_sct ?? '',
            num_permiso_sct: v.num_permiso_sct ?? '',
            num_serie: v.num_serie ?? '',
        });
        setFormError('');
        setIsDrawerOpen(true);
    };

    const handleV = (e) => setVForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError('');
        try {
            const payload = {
                ...vForm,
                anio_modelo: parseInt(vForm.anio_modelo),
                peso_bruto_vehicular: parseFloat(vForm.peso_bruto_vehicular),
            };
            if (editingVehiculo) {
                await api.patch(`/vehiculos/${editingVehiculo.id}`, payload);
            } else {
                await api.post('/vehiculos', payload);
            }
            setIsDrawerOpen(false);
            fetchAll();
        } catch (err) {
            const msg = err.response?.data?.message
                || JSON.stringify(err.response?.data?.errors)
                || err.message;
            setFormError(msg);
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
            await api.delete(`/vehiculos/${id}`);
            setVehiculos((prev) => prev.filter((v) => v.id !== id));
            setCardState(id, IDLE);
        } catch (error) {
            if (error.response?.status === 409) {
                const { message, viajes_count } = error.response.data;
                setCardState(id, { step: 'conflict', message, count: viajes_count });
            } else {
                console.error('Error eliminando vehículo:', error);
                setCardState(id, IDLE);
            }
        }
    };

    const handleDeactivate = async (id) => {
        setCardState(id, { step: 'loading' });
        try {
            await api.patch(`/vehiculos/${id}`, { activo: false });
            setVehiculos((prev) =>
                prev.map((v) => (v.id === id ? { ...v, activo: false } : v))
            );
        } catch (error) {
            console.error('Error desactivando vehículo:', error);
        } finally {
            setCardState(id, IDLE);
        }
    };

    const handleReactivate = async (id) => {
        try {
            await api.patch(`/vehiculos/${id}`, { activo: true });
            setVehiculos((prev) =>
                prev.map((v) => (v.id === id ? { ...v, activo: true } : v))
            );
        } catch (error) {
            console.error('Error reactivando vehículo:', error);
        }
    };

    const cancelDelete = (id) => setCardState(id, IDLE);

    // -------------------------------------------------------------------------
    // Render helpers
    // -------------------------------------------------------------------------

    const renderCardActions = (v) => {
        const ds = deleteState[v.id];

        if (!ds) {
            return (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(v)}
                        title="Editar vehículo"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    {v.activo !== false ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive opacity-70 hover:opacity-100 hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(v.id)}
                            title="Eliminar vehículo"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:bg-green-50"
                            onClick={() => handleReactivate(v.id)}
                            title="Reactivar vehículo"
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
                        onClick={() => handleDeleteConfirm(v.id)}
                    >
                        Sí
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => cancelDelete(v.id)}
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
            <h1 className="text-2xl font-bold mb-6">Vehículos</h1>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : vehiculos.length === 0 ? (
                <p className="text-center p-8 text-muted-foreground">Sin vehículos registrados.</p>
            ) : (
                <div className="grid gap-4">
                    {vehiculos.map((v) => {
                        const ds = deleteState[v.id];
                        const isInactive = v.activo === false;
                        const isConflict = ds?.step === 'conflict';
                        const hasRC = Array.isArray(v.seguros) &&
                            v.seguros.some((s) => s.tipo === 'responsabilidad_civil');

                        return (
                            <Card
                                key={v.id}
                                className={`overflow-hidden shadow-sm transition-all ${isInactive ? 'opacity-50' : 'active:scale-[0.98]'}`}
                            >
                                <CardContent className="p-4">
                                    {/* Cabecera: placa + acciones */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-lg font-bold font-mono leading-tight break-words pr-2">
                                                {v.placa}
                                            </h2>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                                                    {v.anio_modelo} · {v.config_vehicular}
                                                </span>
                                                {!hasRC && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
                                                        <ShieldAlert className="h-3 w-3" />
                                                        Sin póliza RC
                                                    </span>
                                                )}
                                                {isInactive && (
                                                    <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {renderCardActions(v)}
                                    </div>

                                    {/* Info adicional */}
                                    <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                                        <div>{v.peso_bruto_vehicular} kg · Permiso SCT: {v.num_permiso_sct}</div>
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
                                                    onClick={() => handleDeactivate(v.id)}
                                                >
                                                    Desactivar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-3 text-xs"
                                                    onClick={() => cancelDelete(v.id)}
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
                <Drawer open={isDrawerOpen} onOpenChange={(v) => { setIsDrawerOpen(v); if (!v) setFormError(''); }}>
                    <DrawerTrigger asChild>
                        <Button
                            size="icon"
                            className="h-14 w-14 rounded-full shadow-lg md:w-auto md:h-11 md:px-6 md:rounded-md"
                            onClick={openCreate}
                        >
                            <Plus className="h-6 w-6 md:mr-2" />
                            <span className="hidden md:inline font-semibold">Nuevo Vehículo</span>
                        </Button>
                    </DrawerTrigger>

                    <DrawerContent className="max-h-[90vh]">
                        <DrawerHeader className="text-left">
                            <DrawerTitle className="text-xl">
                                {editingVehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
                            </DrawerTitle>
                            <DrawerDescription>
                                {editingVehiculo
                                    ? 'Modifica los datos de la unidad y guarda los cambios.'
                                    : 'Datos de la unidad. Registra el seguro RC desde la pantalla de Seguros.'}
                            </DrawerDescription>
                        </DrawerHeader>

                        <form id="vehiculoForm" onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto">
                            {/* Datos del vehículo */}
                            <div className="space-y-2">
                                <Label>Placa *</Label>
                                <Input name="placa" placeholder="ABC-1234" value={vForm.placa} onChange={handleV} required className="h-12 font-mono uppercase" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Año modelo *</Label>
                                    <Input name="anio_modelo" type="number" placeholder="2020" value={vForm.anio_modelo} onChange={handleV} required className="h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Config. vehicular *</Label>
                                    <Input name="config_vehicular" placeholder="C3" value={vForm.config_vehicular} onChange={handleV} required className="h-12" maxLength={10} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Peso bruto vehicular (kg) *</Label>
                                <Input name="peso_bruto_vehicular" type="number" min="0" step="0.01" placeholder="15000" value={vForm.peso_bruto_vehicular} onChange={handleV} required className="h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo permiso SCT *</Label>
                                <Input name="tipo_permiso_sct" placeholder="TPAF01" value={vForm.tipo_permiso_sct} onChange={handleV} required className="h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label>Número permiso SCT *</Label>
                                <Input name="num_permiso_sct" placeholder="SCT-NL-12345" value={vForm.num_permiso_sct} onChange={handleV} required className="h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label>Número de serie (opcional)</Label>
                                <Input name="num_serie" placeholder="1HGBH41JXMN109186" value={vForm.num_serie} onChange={handleV} className="h-12 font-mono" />
                            </div>

                            {formError && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                                    {formError}
                                </div>
                            )}
                        </form>

                        <DrawerFooter className="pt-2">
                            <Button
                                type="submit"
                                form="vehiculoForm"
                                className="h-12 text-lg"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Guardando…'
                                    : editingVehiculo
                                        ? 'Guardar Cambios'
                                        : 'Guardar Vehículo'}
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