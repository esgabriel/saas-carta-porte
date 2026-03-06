import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Drawer, DrawerClose, DrawerContent, DrawerDescription,
    DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer';

const INITIAL_V = {
    placa: '', anio_modelo: '', config_vehicular: '', peso_bruto_vehicular: '',
    tipo_permiso_sct: '', num_permiso_sct: '', num_serie: '',
};
const INITIAL_S = {
    aseguradora: '', num_poliza: '', vigencia_inicio: '', vigencia_fin: '',
};

export default function Vehiculos() {
    const [vehiculos, setVehiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [vForm, setVForm] = useState(INITIAL_V);
    const [sForm, setSForm] = useState(INITIAL_S);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchAll = async () => {
        try {
            setLoading(true);
            const res = await api.get('/vehiculos');
            setVehiculos(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleV = e => setVForm(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleS = e => setSForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            // 1. Crear vehículo
            const vRes = await api.post('/vehiculos', {
                ...vForm,
                anio_modelo: parseInt(vForm.anio_modelo),
                peso_bruto_vehicular: parseFloat(vForm.peso_bruto_vehicular),
            });
            const vehiculoId = vRes.data.data.id;

            // 2. Crear seguro RC inmediatamente
            await api.post('/seguros', {
                vehiculo_id: vehiculoId,
                tipo: 'responsabilidad_civil',
                aseguradora: sForm.aseguradora,
                num_poliza: sForm.num_poliza,
                vigencia_inicio: sForm.vigencia_inicio,
                vigencia_fin: sForm.vigencia_fin,
            });

            setIsOpen(false);
            setVForm(INITIAL_V);
            setSForm(INITIAL_S);
            fetchAll();
        } catch (e) {
            const msg = e.response?.data?.message || JSON.stringify(e.response?.data?.errors) || e.message;
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

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
                <div className="grid gap-3">
                    {vehiculos.map(v => (
                        <Card key={v.id}>
                            <CardContent className="p-4">
                                <p className="font-semibold font-mono text-lg">{v.placa}</p>
                                <p className="text-sm text-muted-foreground">
                                    {v.anio_modelo} · {v.config_vehicular} · {v.peso_bruto_vehicular} kg
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Permiso SCT: {v.num_permiso_sct}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="fixed bottom-6 right-6 z-40 md:static md:mt-8 md:flex md:justify-end">
                <Drawer open={isOpen} onOpenChange={v => { setIsOpen(v); if (!v) setError(''); }}>
                    <DrawerTrigger asChild>
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg md:w-auto md:h-11 md:px-6 md:rounded-md">
                            <Plus className="h-6 w-6 md:mr-2" />
                            <span className="hidden md:inline font-semibold">Nuevo Vehículo</span>
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[90vh]">
                        <DrawerHeader className="text-left">
                            <DrawerTitle className="text-xl">Nuevo Vehículo</DrawerTitle>
                            <DrawerDescription>Datos de la unidad y su póliza de seguro RC (requerida por el SAT).</DrawerDescription>
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

                            {/* Seguro RC — requerido por SAT */}
                            <div className="border-t pt-4 mt-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <p className="font-semibold text-sm">Seguro de Responsabilidad Civil</p>
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Requerido SAT</span>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="space-y-2">
                                        <Label>Aseguradora *</Label>
                                        <Input name="aseguradora" placeholder="Ej. GNP Seguros" value={sForm.aseguradora} onChange={handleS} required className="h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Número de póliza *</Label>
                                        <Input name="num_poliza" placeholder="POL-123456" value={sForm.num_poliza} onChange={handleS} required className="h-12" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Inicio vigencia *</Label>
                                            <Input name="vigencia_inicio" type="date" value={sForm.vigencia_inicio} onChange={handleS} required className="h-12" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Fin vigencia *</Label>
                                            <Input name="vigencia_fin" type="date" value={sForm.vigencia_fin} onChange={handleS} required className="h-12" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                                    {error}
                                </div>
                            )}
                        </form>
                        <DrawerFooter>
                            <Button type="submit" form="vehiculoForm" className="h-12 text-base font-semibold" disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar Vehículo'}
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