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
    nombre: '', rfc: '', curp: '', num_licencia: '',
    tipo_licencia: 'E', vigencia_licencia: '',
    calle: '', municipio: '', estado: '', codigo_postal: '',
};

const IDLE = null;

export default function Operadores() {
    const [operadores, setOperadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingOperador, setEditingOperador] = useState(null); // null = crear
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    // Map<operadorId, estado-de-confirmacion>
    const [deleteState, setDeleteState] = useState({});

    // -------------------------------------------------------------------------
    // Data
    // -------------------------------------------------------------------------

    const fetchAll = async () => {
        try {
            setLoading(true);
            const res = await api.get('/operadores');
            setOperadores(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    // -------------------------------------------------------------------------
    // Drawer helpers
    // -------------------------------------------------------------------------

    const openCreate = () => {
        setEditingOperador(null);
        setFormData(EMPTY_FORM);
        setIsDrawerOpen(true);
    };

    const openEdit = (op) => {
        setEditingOperador(op);
        setFormData({
            nombre: op.nombre ?? '',
            rfc: op.rfc ?? '',
            curp: op.curp ?? '',
            num_licencia: op.num_licencia ?? '',
            tipo_licencia: op.tipo_licencia ?? 'E',
            vigencia_licencia: op.vigencia_licencia
                ? op.vigencia_licencia.split('T')[0]
                : '',
            calle: op.calle ?? '',
            municipio: op.municipio ?? '',
            estado: op.estado ?? '',
            codigo_postal: op.codigo_postal ?? '',
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
            const payload = { ...formData };
            if (!payload.rfc) delete payload.rfc;

            if (editingOperador) {
                await api.patch(`/operadores/${editingOperador.id}`, payload);
            } else {
                await api.post('/operadores', payload);
            }
            setIsDrawerOpen(false);
            fetchAll();
        } catch (e) {
            const msg = e.response?.data?.message
                || JSON.stringify(e.response?.data?.errors)
                || e.message;
            console.error('Error al guardar operador:', e.response?.data || e.message);
            alert('Error al guardar: ' + msg);
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
            await api.delete(`/operadores/${id}`);
            setOperadores((prev) => prev.filter((o) => o.id !== id));
            setCardState(id, IDLE);
        } catch (error) {
            if (error.response?.status === 409) {
                const { message, viajes_count } = error.response.data;
                setCardState(id, { step: 'conflict', message, count: viajes_count });
            } else {
                console.error('Error eliminando operador:', error);
                setCardState(id, IDLE);
            }
        }
    };

    const handleDeactivate = async (id) => {
        setCardState(id, { step: 'loading' });
        try {
            await api.patch(`/operadores/${id}`, { activo: false });
            setOperadores((prev) =>
                prev.map((o) => (o.id === id ? { ...o, activo: false } : o))
            );
        } catch (error) {
            console.error('Error desactivando operador:', error);
        } finally {
            setCardState(id, IDLE);
        }
    };

    const handleReactivate = async (id) => {
        try {
            await api.patch(`/operadores/${id}`, { activo: true });
            setOperadores((prev) =>
                prev.map((o) => (o.id === id ? { ...o, activo: true } : o))
            );
        } catch (error) {
            console.error('Error reactivando operador:', error);
        }
    };

    const cancelDelete = (id) => setCardState(id, IDLE);

    // -------------------------------------------------------------------------
    // Render helpers
    // -------------------------------------------------------------------------

    const renderCardActions = (op) => {
        const ds = deleteState[op.id];

        if (!ds) {
            return (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(op)}
                        title="Editar operador"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    {op.activo !== false ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive opacity-70 hover:opacity-100 hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(op.id)}
                            title="Eliminar operador"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:bg-green-50"
                            onClick={() => handleReactivate(op.id)}
                            title="Reactivar operador"
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
                        onClick={() => handleDeleteConfirm(op.id)}
                    >
                        Sí
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => cancelDelete(op.id)}
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
            <h1 className="text-2xl font-bold mb-6">Operadores</h1>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : operadores.length === 0 ? (
                <p className="text-center p-8 text-muted-foreground">Sin operadores registrados.</p>
            ) : (
                <div className="grid gap-4">
                    {operadores.map((op) => {
                        const ds = deleteState[op.id];
                        const isInactive = op.activo === false;
                        const isConflict = ds?.step === 'conflict';

                        return (
                            <Card
                                key={op.id}
                                className={`overflow-hidden shadow-sm transition-all ${isInactive ? 'opacity-50' : 'active:scale-[0.98]'}`}
                            >
                                <CardContent className="p-4">
                                    {/* Cabecera: nombre + acciones */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-lg font-bold leading-tight break-words pr-2">
                                                {op.nombre}
                                            </h2>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {op.curp && (
                                                    <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground text-xs font-mono rounded">
                                                        {op.curp}
                                                    </span>
                                                )}
                                                {isInactive && (
                                                    <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {renderCardActions(op)}
                                    </div>

                                    {/* Info adicional */}
                                    <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
                                        <div>
                                            Lic. <span className="font-mono">{op.num_licencia}</span>
                                            {' · '}Tipo {op.tipo_licencia}
                                            {' · '}Vence {op.vigencia_licencia}
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
                                                    onClick={() => handleDeactivate(op.id)}
                                                >
                                                    Desactivar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-3 text-xs"
                                                    onClick={() => cancelDelete(op.id)}
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
                            <span className="hidden md:inline font-semibold">Nuevo Operador</span>
                        </Button>
                    </DrawerTrigger>

                    <DrawerContent className="max-h-[90vh]">
                        <DrawerHeader className="text-left">
                            <DrawerTitle className="text-xl">
                                {editingOperador ? 'Editar Operador' : 'Nuevo Operador'}
                            </DrawerTitle>
                            <DrawerDescription>
                                {editingOperador
                                    ? 'Modifica los datos del operador y guarda los cambios.'
                                    : 'Datos del conductor para el Complemento Carta Porte.'}
                            </DrawerDescription>
                        </DrawerHeader>

                        <form id="operadorForm" onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto">
                            <div className="space-y-2">
                                <Label>Nombre completo *</Label>
                                <Input name="nombre" placeholder="Juan Pérez García" value={formData.nombre}
                                    onChange={handleChange} required className="h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label>CURP *</Label>
                                <Input name="curp" placeholder="PEGJ800101HNLRXN09" value={formData.curp}
                                    onChange={handleChange} required className="h-12 font-mono uppercase" maxLength={18} />
                            </div>
                            <div className="space-y-2">
                                <Label>RFC</Label>
                                <Input name="rfc" placeholder="PEGJ800101ABC" value={formData.rfc}
                                    onChange={handleChange} className="h-12 font-mono uppercase" maxLength={13} />
                            </div>
                            <div className="space-y-2">
                                <Label>Número de Licencia *</Label>
                                <Input name="num_licencia" placeholder="LIC-123456" value={formData.num_licencia}
                                    onChange={handleChange} required className="h-12" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Tipo Licencia *</Label>
                                    <select name="tipo_licencia" value={formData.tipo_licencia} onChange={handleChange}
                                        className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                        {['A', 'B', 'C', 'D', 'E', 'F'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Vigencia *</Label>
                                    <Input name="vigencia_licencia" type="date" value={formData.vigencia_licencia}
                                        onChange={handleChange} required className="h-12" />
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">Domicilio (requerido para Carta Porte)</p>
                            <div className="space-y-2">
                                <Label>Calle y número</Label>
                                <Input name="calle" placeholder="Av. Reforma 123" value={formData.calle}
                                    onChange={handleChange} className="h-12" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Municipio</Label>
                                    <Input name="municipio" placeholder="Monterrey" value={formData.municipio}
                                        onChange={handleChange} className="h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <Input name="estado" placeholder="Nuevo León" value={formData.estado}
                                        onChange={handleChange} className="h-12" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Código Postal</Label>
                                <Input name="codigo_postal" placeholder="64000" value={formData.codigo_postal}
                                    onChange={handleChange} className="h-12" maxLength={5} />
                            </div>
                        </form>

                        <DrawerFooter className="pt-2">
                            <Button
                                type="submit"
                                form="operadorForm"
                                className="h-12 text-lg"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Guardando…'
                                    : editingOperador
                                        ? 'Guardar Cambios'
                                        : 'Guardar Operador'}
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