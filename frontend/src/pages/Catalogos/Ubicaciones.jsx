import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Drawer, DrawerClose, DrawerContent, DrawerDescription,
    DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer';

const INITIAL = {
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

export default function Ubicaciones() {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState(INITIAL);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const res = await api.get('/ubicaciones');
            setUbicaciones(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await api.post('/ubicaciones', form);
            setIsOpen(false);
            setForm(INITIAL);
            fetchAll();
        } catch (e) { console.error(e.response?.data || e.message); }
    };

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
                <div className="grid gap-3">
                    {ubicaciones.map(u => (
                        <Card key={u.id}>
                            <CardContent className="p-4 flex items-start justify-between">
                                <div>
                                    <p className="font-semibold">{u.alias || u.nombre_remitente || '—'}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {u.municipio}, {u.estado} — CP {u.codigo_postal}
                                    </p>
                                    {u.calle && <p className="text-sm text-muted-foreground">{u.calle}</p>}
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ml-2 ${TIPO_CLS[u.tipo]}`}>
                                    {u.tipo}
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="fixed bottom-6 right-6 z-40 md:static md:mt-8 md:flex md:justify-end">
                <Drawer open={isOpen} onOpenChange={setIsOpen}>
                    <DrawerTrigger asChild>
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg md:w-auto md:h-11 md:px-6 md:rounded-md">
                            <Plus className="h-6 w-6 md:mr-2" />
                            <span className="hidden md:inline font-semibold">Nueva Ubicación</span>
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[90vh]">
                        <DrawerHeader className="text-left">
                            <DrawerTitle className="text-xl">Nueva Ubicación</DrawerTitle>
                            <DrawerDescription>Origen, destino o punto intermedio de tus viajes.</DrawerDescription>
                        </DrawerHeader>
                        <form id="ubicacionForm" onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto">
                            <SelectNative label="Tipo" name="tipo" value={form.tipo} onChange={handleChange} required
                                options={['Origen', 'Destino', 'Intermedio'].map(v => ({ value: v, label: v }))} />
                            <div className="space-y-2">
                                <Label>Alias (nombre corto)</Label>
                                <Input name="alias" placeholder="Ej. Bodega Norte" value={form.alias} onChange={handleChange} className="h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label>Nombre del remitente / destinatario</Label>
                                <Input name="nombre_remitente" placeholder="Razón social o persona" value={form.nombre_remitente} onChange={handleChange} className="h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label>RFC</Label>
                                <Input name="rfc_remitente" placeholder="XAXX010101000" value={form.rfc_remitente}
                                    onChange={handleChange} className="h-12 font-mono uppercase" maxLength={13} />
                            </div>
                            <div className="space-y-2">
                                <Label>Calle y número</Label>
                                <Input name="calle" placeholder="Av. Industrial 123" value={form.calle} onChange={handleChange} className="h-12" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Municipio *</Label>
                                    <Input name="municipio" placeholder="Monterrey" value={form.municipio} onChange={handleChange} required className="h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado *</Label>
                                    <Input name="estado" placeholder="NL" value={form.estado} onChange={handleChange} required className="h-12" maxLength={5} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>C.P. *</Label>
                                    <Input name="codigo_postal" placeholder="64000" value={form.codigo_postal} onChange={handleChange} required className="h-12" maxLength={5} />
                                </div>
                                <div className="space-y-2">
                                    <Label>País</Label>
                                    <Input name="pais" placeholder="MEX" value={form.pais} onChange={handleChange} className="h-12" maxLength={3} />
                                </div>
                            </div>
                        </form>
                        <DrawerFooter>
                            <Button type="submit" form="ubicacionForm" className="h-12 text-base font-semibold">Guardar Ubicación</Button>
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