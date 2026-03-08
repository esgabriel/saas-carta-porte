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

const EMPTY_FORM = {
    alias: '', tipo: 'Origen', rfc_remitente: '', nombre_remitente: '',
    calle: '', municipio: '', estado: '', codigo_postal: '', pais: 'MEX',
};

const TIPO_CLS = {
    Origen: 'bg-blue-100 text-blue-700',
    Destino: 'bg-green-100 text-green-700',
    Intermedio: 'bg-yellow-100 text-yellow-700',
};

const SelectNative = ({ label, name, value, onChange, options, required }) => (
    <div className="space-y-2">
        <Label>{label}{required && ' *'}</Label>
        <select name={name} value={value} onChange={onChange} required={required}
            className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);

const IDLE = null;

export default function Ubicaciones() {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingUbicacion, setEditingUbicacion] = useState(null); // null = crear
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    // Map<ubicacionId, estado-de-confirmacion>
    const [deleteState, setDeleteState] = useState({});

    // -------------------------------------------------------------------------
    // Data
    // -------------------------------------------------------------------------

    const fetchAll = async () => {
        try {
            setLoading(true);
            const res = await api.get('/ubicaciones');
            setUbicaciones(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    // -------------------------------------------------------------------------
    // Drawer helpers
    // -------------------------------------------------------------------------

    const openCreate = () => {
        setEditingUbicacion(null);
        setFormData(EMPTY_FORM);
        setIsDrawerOpen(true);
    };

    const openEdit = (u) => {
        setEditingUbicacion(u);
        setFormData({
            alias: u.alias ?? '',
            tipo: u.tipo ?? 'Origen',
            rfc_remitente: u.rfc_remitente ?? '',
            nombre_remitente: u.nombre_remitente ?? '',
            calle: u.calle ?? '',
            municipio: u.municipio ?? '',
            estado: u.estado ?? '',
            codigo_postal: u.codigo_postal ?? '',
            pais: u.pais ?? 'MEX',
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
            if (editingUbicacion) {
                await api.patch(`/ubicaciones/${editingUbicacion.id}`, formData);
            } else {
                await api.post('/ubicaciones', formData);
            }
            setIsDrawerOpen(false);
            fetchAll();
        } catch (e) {
            console.error('Error al guardar ubicación:', e.response?.data || e.message);
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
            await api.delete(`/ubicaciones/${id}`);
            setUbicaciones((prev) => prev.filter((u) => u.id !== id));
            setCardState(id, IDLE);
        } catch (error) {
            if (error.response?.status === 409) {
                const { message, viajes_count } = error.response.data;
                setCardState(id, { step: 'conflict', message, count: viajes_count });
            } else {
                console.error('Error eliminando ubicación:', error);
                setCardState(id, IDLE);
            }
        }
    };

    const handleDeactivate = async (id) => {
        setCardState(id, { step: 'loading' });
        try {
            await api.patch(`/ubicaciones/${id}`, { activo: false });
            setUbicaciones((prev) =>
                prev.map((u) => (u.id === id ? { ...u, activo: false } : u))
            );
        } catch (error) {
            console.error('Error desactivando ubicación:', error);
        } finally {
            setCardState(id, IDLE);
        }
    };

    const handleReactivate = async (id) => {
        try {
            await api.patch(`/ubicaciones/${id}`, { activo: true });
            setUbicaciones((prev) =>
                prev.map((u) => (u.id === id ? { ...u, activo: true } : u))
            );
        } catch (error) {
            console.error('Error reactivando ubicación:', error);
        }
    };

    const cancelDelete = (id) => setCardState(id, IDLE);

    // -------------------------------------------------------------------------
    // Render helpers
    // -------------------------------------------------------------------------

    const renderCardActions = (u) => {
        const ds = deleteState[u.id];

        if (!ds) {
            return (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(u)}
                        title="Editar ubicación"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    {u.activo !== false ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive opacity-70 hover:opacity-100 hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(u.id)}
                            title="Eliminar ubicación"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:bg-green-50"
                            onClick={() => handleReactivate(u.id)}
                            title="Reactivar ubicación"
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
                        onClick={() => handleDeleteConfirm(u.id)}
                    >
                        Sí
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => cancelDelete(u.id)}
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
            <h1 className="text-2xl font-bold mb-6">Ubicaciones</h1>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : ubicaciones.length === 0 ? (
                <p className="text-center p-8 text-muted-foreground">Sin ubicaciones registradas.</p>
            ) : (
                <div className="grid gap-4">
                    {ubicaciones.map((u) => {
                        const ds = deleteState[u.id];
                        const isInactive = u.activo === false;
                        const isConflict = ds?.step === 'conflict';

                        return (
                            <Card
                                key={u.id}
                                className={`overflow-hidden shadow-sm transition-all ${isInactive ? 'opacity-50' : 'active:scale-[0.98]'}`}
                            >
                                <CardContent className="p-4">
                                    {/* Cabecera: info + badge tipo + acciones */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold leading-tight">
                                                {u.alias || u.nombre_remitente || '—'}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                {u.municipio}, {u.estado} — CP {u.codigo_postal}
                                            </p>
                                            {u.calle && (
                                                <p className="text-sm text-muted-foreground">{u.calle}</p>
                                            )}
                                            {isInactive && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                                    Inactivo
                                                </span>
                                            )}
                                        </div>

                                        {/* Columna derecha: badge tipo + acciones */}
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${TIPO_CLS[u.tipo] ?? 'bg-muted text-muted-foreground'}`}>
                                                {u.tipo}
                                            </span>
                                            {renderCardActions(u)}
                                        </div>
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
                                                    onClick={() => handleDeactivate(u.id)}
                                                >
                                                    Desactivar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-3 text-xs"
                                                    onClick={() => cancelDelete(u.id)}
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
                            <span className="hidden md:inline font-semibold">Nueva Ubicación</span>
                        </Button>
                    </DrawerTrigger>

                    <DrawerContent className="max-h-[90vh]">
                        <DrawerHeader className="text-left">
                            <DrawerTitle className="text-xl">
                                {editingUbicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}
                            </DrawerTitle>
                            <DrawerDescription>
                                {editingUbicacion
                                    ? 'Modifica los datos de la ubicación y guarda los cambios.'
                                    : 'Origen, destino o punto intermedio de tus viajes.'}
                            </DrawerDescription>
                        </DrawerHeader>

                        <form id="ubicacionForm" onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto">
                            <SelectNative
                                label="Tipo" name="tipo" value={formData.tipo}
                                onChange={handleChange} required
                                options={['Origen', 'Destino', 'Intermedio'].map(v => ({ value: v, label: v }))}
                            />
                            <div className="space-y-2">
                                <Label>Alias (nombre corto)</Label>
                                <Input name="alias" placeholder="Ej. Bodega Norte" value={formData.alias}
                                    onChange={handleChange} className="h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label>Nombre del remitente / destinatario</Label>
                                <Input name="nombre_remitente" placeholder="Razón social o persona"
                                    value={formData.nombre_remitente} onChange={handleChange} className="h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label>RFC</Label>
                                <Input name="rfc_remitente" placeholder="XAXX010101000" value={formData.rfc_remitente}
                                    onChange={handleChange} className="h-12 font-mono uppercase" maxLength={13} />
                            </div>
                            <div className="space-y-2">
                                <Label>Calle y número</Label>
                                <Input name="calle" placeholder="Av. Industrial 123" value={formData.calle}
                                    onChange={handleChange} className="h-12" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Municipio *</Label>
                                    <Input name="municipio" placeholder="Monterrey" value={formData.municipio}
                                        onChange={handleChange} required className="h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado *</Label>
                                    <Input name="estado" placeholder="NL" value={formData.estado}
                                        onChange={handleChange} required className="h-12" maxLength={5} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>C.P. *</Label>
                                    <Input name="codigo_postal" placeholder="64000" value={formData.codigo_postal}
                                        onChange={handleChange} required className="h-12" maxLength={5} />
                                </div>
                                <div className="space-y-2">
                                    <Label>País</Label>
                                    <Input name="pais" placeholder="MEX" value={formData.pais}
                                        onChange={handleChange} className="h-12" maxLength={3} />
                                </div>
                            </div>
                        </form>

                        <DrawerFooter className="pt-2">
                            <Button
                                type="submit"
                                form="ubicacionForm"
                                className="h-12 text-lg"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Guardando…'
                                    : editingUbicacion
                                        ? 'Guardar Cambios'
                                        : 'Guardar Ubicación'}
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