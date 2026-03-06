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
    nombre: '', rfc: '', curp: '', num_licencia: '',
    tipo_licencia: 'E', vigencia_licencia: '',
    calle: '', municipio: '', estado: '', codigo_postal: '',
};

export default function Operadores() {
    const [operadores, setOperadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState(INITIAL);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const res = await api.get('/operadores');
            setOperadores(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const payload = { ...form };
            if (!payload.rfc) delete payload.rfc;
            await api.post('/operadores', payload);
            setIsOpen(false);
            setForm(INITIAL);
            fetchAll();
        } catch (e) { console.error(e.response?.data || e.message); }
    };

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
                <div className="grid gap-3">
                    {operadores.map(o => (
                        <Card key={o.id}>
                            <CardContent className="p-4">
                                <p className="font-semibold">{o.nombre}</p>
                                <p className="text-sm text-muted-foreground font-mono">CURP: {o.curp}</p>
                                <p className="text-sm text-muted-foreground">
                                    Lic. {o.num_licencia} · Tipo {o.tipo_licencia} · Vence {o.vigencia_licencia}
                                </p>
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
                            <span className="hidden md:inline font-semibold">Nuevo Operador</span>
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[90vh]">
                        <DrawerHeader className="text-left">
                            <DrawerTitle className="text-xl">Nuevo Operador</DrawerTitle>
                            <DrawerDescription>Datos del conductor para el Complemento Carta Porte.</DrawerDescription>
                        </DrawerHeader>
                        <form id="operadorForm" onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto">
                            <div className="space-y-2">
                                <Label>Nombre completo *</Label>
                                <Input name="nombre" placeholder="Juan Pérez García" value={form.nombre}
                                    onChange={handleChange} required className="h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label>CURP *</Label>
                                <Input name="curp" placeholder="PEGJ800101HNLRXN09" value={form.curp}
                                    onChange={handleChange} required className="h-12 font-mono uppercase" maxLength={18} />
                            </div>
                            <div className="space-y-2">
                                <Label>RFC</Label>
                                <Input name="rfc" placeholder="PEGJ800101ABC" value={form.rfc}
                                    onChange={handleChange} className="h-12 font-mono uppercase" maxLength={13} />
                            </div>
                            <div className="space-y-2">
                                <Label>Número de Licencia *</Label>
                                <Input name="num_licencia" placeholder="LIC-123456" value={form.num_licencia}
                                    onChange={handleChange} required className="h-12" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Tipo Licencia *</Label>
                                    <select name="tipo_licencia" value={form.tipo_licencia} onChange={handleChange}
                                        className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                        {['A', 'B', 'C', 'D', 'E', 'F'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Vigencia *</Label>
                                    <Input name="vigencia_licencia" type="date" value={form.vigencia_licencia}
                                        onChange={handleChange} required className="h-12" />
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">Domicilio (requerido para Carta Porte)</p>
                            <div className="space-y-2">
                                <Label>Calle y número</Label>
                                <Input name="calle" placeholder="Av. Reforma 123" value={form.calle}
                                    onChange={handleChange} className="h-12" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Municipio</Label>
                                    <Input name="municipio" placeholder="Monterrey" value={form.municipio}
                                        onChange={handleChange} className="h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado</Label>
                                    <Input name="estado" placeholder="Nuevo León" value={form.estado}
                                        onChange={handleChange} className="h-12" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Código Postal</Label>
                                <Input name="codigo_postal" placeholder="64000" value={form.codigo_postal}
                                    onChange={handleChange} className="h-12" maxLength={5} />
                            </div>
                        </form>
                        <DrawerFooter>
                            <Button type="submit" form="operadorForm" className="h-12 text-base font-semibold">Guardar Operador</Button>
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