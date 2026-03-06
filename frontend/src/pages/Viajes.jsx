import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Plus, Truck, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Drawer, DrawerClose, DrawerContent,
    DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer';

// ─── Constantes ──────────────────────────────────────────────────────────────

const STATUS = {
    borrador: { label: 'Borrador', cls: 'bg-gray-100 text-gray-600' },
    en_proceso: { label: 'En proceso', cls: 'bg-blue-100 text-blue-700' },
    timbrado: { label: 'Timbrado ✓', cls: 'bg-green-100 text-green-700' },
    cancelado: { label: 'Cancelado', cls: 'bg-red-100 text-red-600' },
};

const INITIAL_FORM = {
    cliente_id: '', ubicacion_origen_id: '', ubicacion_destino_id: '',
    fecha_hora_salida: '', fecha_hora_llegada_est: '', distancia_recorrida: '',
    vehiculo_id: '', operador_id: '', remolque_id: '',
};

const INITIAL_MERC = {
    clave_prod_stcc: '', descripcion: '', cantidad: '1',
    clave_unidad: 'KGM', unidad: 'Kilogramo', peso_en_kg: '',
    valor_mercancia: '', moneda: 'MXN', material_peligroso: false, cve_material_peligroso: '',
};

// ─── Helper: select nativo con estilo consistente ─────────────────────────────

function Sel({ label, name, value, onChange, options, placeholder, required }) {
    return (
        <div className="space-y-2">
            <Label>{label}{required && ' *'}</Label>
            <select name={name} value={value} onChange={onChange} required={required}
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">{placeholder ?? 'Selecciona...'}</option>
                {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
        </div>
    );
}

// ─── Pasos del wizard (definidos fuera para evitar re-montaje) ────────────────

function Paso1({ form, onChange, cats }) {
    return (
        <div className="flex flex-col gap-4">
            <Sel label="Cliente" name="cliente_id" value={form.cliente_id} onChange={onChange} required
                options={cats.clientes.map(c => ({ v: c.id, l: c.nombre_razon_social }))} />
            <Sel label="Origen" name="ubicacion_origen_id" value={form.ubicacion_origen_id} onChange={onChange} required
                options={cats.ubicaciones.map(u => ({ v: u.id, l: u.alias || `${u.municipio}, ${u.estado}` }))} />
            <Sel label="Destino" name="ubicacion_destino_id" value={form.ubicacion_destino_id} onChange={onChange} required
                options={cats.ubicaciones.map(u => ({ v: u.id, l: u.alias || `${u.municipio}, ${u.estado}` }))} />
            <div className="space-y-2">
                <Label>Fecha y hora de salida *</Label>
                <Input name="fecha_hora_salida" type="datetime-local" value={form.fecha_hora_salida}
                    onChange={onChange} required className="h-12" />
            </div>
            <div className="space-y-2">
                <Label>Fecha estimada de llegada</Label>
                <Input name="fecha_hora_llegada_est" type="datetime-local" value={form.fecha_hora_llegada_est}
                    onChange={onChange} className="h-12" />
            </div>
            <div className="space-y-2">
                <Label>Distancia recorrida (km)</Label>
                <Input name="distancia_recorrida" type="number" min="0" placeholder="350"
                    value={form.distancia_recorrida} onChange={onChange} className="h-12" />
            </div>
        </div>
    );
}

function Paso2({ form, onChange, cats }) {
    return (
        <div className="flex flex-col gap-4">
            <Sel label="Vehículo" name="vehiculo_id" value={form.vehiculo_id} onChange={onChange} required
                options={cats.vehiculos.map(v => ({ v: v.id, l: `${v.placa} — ${v.config_vehicular}` }))} />
            <Sel label="Operador" name="operador_id" value={form.operador_id} onChange={onChange} required
                options={cats.operadores.map(o => ({ v: o.id, l: o.nombre }))} />
            <Sel label="Remolque (opcional)" name="remolque_id" value={form.remolque_id} onChange={onChange}
                placeholder="Sin remolque"
                options={cats.remolques.map(r => ({ v: r.id, l: `${r.placa} — ${r.subtipo_rem}` }))} />
        </div>
    );
}

function Paso3({ mercs, onMercChange, onAdd, onRemove }) {
    return (
        <div className="flex flex-col gap-4">
            {mercs.map((m, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">Mercancía {i + 1}</p>
                        {mercs.length > 1 && (
                            <button type="button" onClick={() => onRemove(i)}
                                className="text-xs text-red-500 hover:text-red-700 font-medium">
                                Quitar
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Clave STCC / Prod. *</Label>
                        <Input name="clave_prod_stcc" placeholder="10101500" value={m.clave_prod_stcc}
                            onChange={e => onMercChange(i, e)} required className="h-12" />
                    </div>
                    <div className="space-y-2">
                        <Label>Descripción *</Label>
                        <Input name="descripcion" placeholder="Materiales de construcción" value={m.descripcion}
                            onChange={e => onMercChange(i, e)} required className="h-12" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Cantidad *</Label>
                            <Input name="cantidad" type="number" min="0" step="0.001" value={m.cantidad}
                                onChange={e => onMercChange(i, e)} required className="h-12" />
                        </div>
                        <div className="space-y-2">
                            <Label>Clave Unidad *</Label>
                            <Input name="clave_unidad" placeholder="KGM" value={m.clave_unidad}
                                onChange={e => onMercChange(i, e)} required className="h-12" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Peso kg *</Label>
                            <Input name="peso_en_kg" type="number" min="0" step="0.001" value={m.peso_en_kg}
                                onChange={e => onMercChange(i, e)} required className="h-12" />
                        </div>
                        <div className="space-y-2">
                            <Label>Valor (MXN)</Label>
                            <Input name="valor_mercancia" type="number" min="0" step="0.01" value={m.valor_mercancia}
                                onChange={e => onMercChange(i, e)} className="h-12" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                        <input type="checkbox" id={`mp-${i}`} name="material_peligroso" checked={m.material_peligroso}
                            onChange={e => onMercChange(i, e)} className="w-5 h-5 rounded" />
                        <Label htmlFor={`mp-${i}`}>Material peligroso</Label>
                    </div>
                    {m.material_peligroso && (
                        <div className="space-y-2">
                            <Label>Clave material peligroso *</Label>
                            <Input name="cve_material_peligroso" placeholder="Ej. 1234" value={m.cve_material_peligroso}
                                onChange={e => onMercChange(i, e)} required className="h-12" />
                        </div>
                    )}
                </div>
            ))}
            <Button type="button" variant="outline" onClick={onAdd} className="h-12">
                + Agregar mercancía
            </Button>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Viajes() {
    const [viajes, setViajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cats, setCats] = useState({ clientes: [], ubicaciones: [], vehiculos: [], operadores: [], remolques: [] });
    const [wizardOpen, setWizardOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(INITIAL_FORM);
    const [mercs, setMercs] = useState([{ ...INITIAL_MERC }]);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [detalle, setDetalle] = useState(null);
    const [timbrando, setTimbrando] = useState(false);
    const [tResult, setTResult] = useState(null);

    const fetchViajes = async () => {
        try {
            setLoading(true);
            const res = await api.get('/viajes');
            setViajes(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchCats = useCallback(async () => {
        try {
            const [c, u, v, o, r] = await Promise.all([
                api.get('/clientes'), api.get('/ubicaciones'), api.get('/vehiculos'),
                api.get('/operadores'), api.get('/remolques'),
            ]);
            setCats({ clientes: c.data.data, ubicaciones: u.data.data, vehiculos: v.data.data, operadores: o.data.data, remolques: r.data.data });
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchViajes(); fetchCats(); }, [fetchCats]);

    const handleFormChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleMercChange = (i, e) => {
        const { name, value, type, checked } = e.target;
        setMercs(prev => prev.map((m, idx) => idx === i ? { ...m, [name]: type === 'checkbox' ? checked : value } : m));
    };

    const resetWizard = () => {
        setStep(1);
        setForm(INITIAL_FORM);
        setMercs([{ ...INITIAL_MERC }]);
        setSaveError('');
    };

    const handleGuardarViaje = async () => {
        setSaving(true);
        setSaveError('');
        try {
            const payload = { ...form, mercancias: mercs };
            if (!payload.remolque_id) delete payload.remolque_id;
            if (!payload.fecha_hora_llegada_est) delete payload.fecha_hora_llegada_est;
            if (!payload.distancia_recorrida) delete payload.distancia_recorrida;

            await api.post('/viajes', payload);
            setWizardOpen(false);
            resetWizard();
            fetchViajes();
        } catch (e) {
            const msg = e.response?.data?.message || JSON.stringify(e.response?.data?.errors) || e.message;
            setSaveError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleTimbrar = async () => {
        setTimbrando(true);
        setTResult(null);
        try {
            const res = await api.post('/cartas-porte', { viaje_id: detalle.id });
            setTResult({ ok: true, msg: res.data.message, uuid: res.data.data?.uuid_timbrado });
            fetchViajes();
        } catch (e) {
            const msg = e.response?.data?.error_detalle || e.response?.data?.message || 'Error desconocido';
            setTResult({ ok: false, msg });
        } finally {
            setTimbrando(false);
        }
    };

    // Validaciones por paso
    const ok1 = form.cliente_id && form.ubicacion_origen_id && form.ubicacion_destino_id && form.fecha_hora_salida;
    const ok2 = form.vehiculo_id && form.operador_id;
    const ok3 = mercs.every(m => m.clave_prod_stcc && m.descripcion && m.cantidad && m.clave_unidad && m.peso_en_kg);

    const STEP_TITLES = ['', 'Cliente, origen y destino', 'Vehículo y operador', 'Mercancías'];

    return (
        <div className="pb-24">
            <h1 className="text-2xl font-bold mb-6">Viajes</h1>

            {/* ── Lista de viajes ── */}
            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : viajes.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-3 opacity-25" />
                    <p className="font-medium">Sin viajes registrados</p>
                    <p className="text-sm mt-1">Crea el primero con el botón +</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {viajes.map(v => {
                        const st = STATUS[v.estatus] ?? STATUS.borrador;
                        return (
                            <Card key={v.id} className="cursor-pointer active:scale-[0.98] transition-transform"
                                onClick={() => { setDetalle(v); setTResult(null); }}>
                                <CardContent className="p-4 flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{v.cliente?.nombre_razon_social}</p>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            {v.ubicacion_origen?.alias || v.ubicacion_origen?.municipio}
                                            {' → '}
                                            {v.ubicacion_destino?.alias || v.ubicacion_destino?.municipio}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {v.vehiculo?.placa} · {v.operador?.nombre}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* ── Drawer: Detalle + Timbrar ── */}
            <Drawer open={!!detalle} onOpenChange={open => { if (!open) { setDetalle(null); setTResult(null); } }}>
                <DrawerContent className="max-h-[90vh]">
                    {detalle && (() => {
                        const st = STATUS[detalle.estatus] ?? STATUS.borrador;
                        const puedeTimbrar = !['timbrado', 'cancelado'].includes(detalle.estatus);
                        return (
                            <>
                                <DrawerHeader className="text-left">
                                    <div className="flex items-center justify-between">
                                        <DrawerTitle className="text-xl">Detalle del Viaje</DrawerTitle>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                                    </div>
                                </DrawerHeader>
                                <div className="p-4 overflow-y-auto space-y-3">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                        {[
                                            ['Cliente', detalle.cliente?.nombre_razon_social],
                                            ['Operador', detalle.operador?.nombre],
                                            ['Origen', detalle.ubicacion_origen?.alias || detalle.ubicacion_origen?.municipio],
                                            ['Destino', detalle.ubicacion_destino?.alias || detalle.ubicacion_destino?.municipio],
                                            ['Vehículo', detalle.vehiculo?.placa],
                                            ['Mercancías', `${detalle.mercancias?.length ?? 0} ítem(s)`],
                                        ].map(([k, val]) => (
                                            <div key={k}>
                                                <p className="text-muted-foreground text-xs">{k}</p>
                                                <p className="font-medium">{val ?? '—'}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {tResult && (
                                        <div className={`p-3 rounded-lg text-sm border ${tResult.ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                            <p className="font-semibold">{tResult.ok ? '✓ Timbrado exitosamente' : '✗ Error al timbrar'}</p>
                                            <p className="mt-0.5">{tResult.msg}</p>
                                            {tResult.uuid && <p className="font-mono text-xs mt-1 break-all">UUID: {tResult.uuid}</p>}
                                        </div>
                                    )}
                                </div>
                                <DrawerFooter>
                                    {puedeTimbrar && (
                                        <Button onClick={handleTimbrar} disabled={timbrando}
                                            className="h-14 text-base font-semibold bg-green-600 hover:bg-green-700">
                                            {timbrando ? 'Timbrando con el SAT...' : '🖨  Timbrar Carta Porte'}
                                        </Button>
                                    )}
                                    <DrawerClose asChild>
                                        <Button variant="outline" className="h-12">Cerrar</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </>
                        );
                    })()}
                </DrawerContent>
            </Drawer>

            {/* ── FAB + Wizard de creación ── */}
            <div className="fixed bottom-6 right-6 z-40 md:static md:mt-8 md:flex md:justify-end">
                <Drawer open={wizardOpen} onOpenChange={open => { setWizardOpen(open); if (!open) resetWizard(); }}>
                    <DrawerTrigger asChild>
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg md:w-auto md:h-11 md:px-6 md:rounded-md">
                            <Plus className="h-6 w-6 md:mr-2" />
                            <span className="hidden md:inline font-semibold">Nuevo Viaje</span>
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[92vh] flex flex-col">
                        <DrawerHeader className="text-left pb-2 shrink-0">
                            <DrawerTitle className="text-xl">Nuevo Viaje — Paso {step} de 3</DrawerTitle>
                            {/* Barra de progreso */}
                            <div className="flex gap-1.5 mt-3">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{STEP_TITLES[step]}</p>
                        </DrawerHeader>

                        <div className="p-4 overflow-y-auto flex-1">
                            {step === 1 && <Paso1 form={form} onChange={handleFormChange} cats={cats} />}
                            {step === 2 && <Paso2 form={form} onChange={handleFormChange} cats={cats} />}
                            {step === 3 && (
                                <Paso3
                                    mercs={mercs}
                                    onMercChange={handleMercChange}
                                    onAdd={() => setMercs(p => [...p, { ...INITIAL_MERC }])}
                                    onRemove={i => setMercs(p => p.filter((_, idx) => idx !== i))}
                                />
                            )}
                            {saveError && (
                                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                                    {saveError}
                                </div>
                            )}
                        </div>

                        <DrawerFooter className="shrink-0 border-t pt-3">
                            <div className="flex gap-2">
                                {step > 1 && (
                                    <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(s => s - 1)}>
                                        <ChevronLeft className="h-4 w-4 mr-1" /> Atrás
                                    </Button>
                                )}
                                {step < 3 ? (
                                    <Button className="flex-1 h-12"
                                        disabled={(step === 1 && !ok1) || (step === 2 && !ok2)}
                                        onClick={() => setStep(s => s + 1)}>
                                        Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                ) : (
                                    <Button className="flex-1 h-12 font-semibold"
                                        disabled={!ok3 || saving}
                                        onClick={handleGuardarViaje}>
                                        {saving ? 'Guardando...' : 'Guardar Viaje'}
                                    </Button>
                                )}
                            </div>
                            {step === 1 && (
                                <DrawerClose asChild>
                                    <Button variant="ghost" className="h-10 text-muted-foreground text-sm">Cancelar</Button>
                                </DrawerClose>
                            )}
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    );
}