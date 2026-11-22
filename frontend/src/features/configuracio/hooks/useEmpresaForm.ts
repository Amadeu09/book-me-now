import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getEmpresa, updateEmpresa } from '@/features/empresas/services/empresas.service';
import { patchStoredEmpresa } from '@/utils/session';
import { useLanguage } from '@/core/i18n';

export interface EmpresaForm {
    nom: string;
    tipo: string;
    ubicacio: string;
    capacitat: string;
    descripcio: string;
    diasAntesReserva: string;
}

const BUIT: EmpresaForm = { nom: '', tipo: '', ubicacio: '', capacitat: '', descripcio: '', diasAntesReserva: '14' };

/** Dades de l'empresa, el formulari editable i el desat. */
export function useEmpresaForm(empresaId: number | null) {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ['empresa', empresaId],
        queryFn: () => getEmpresa(empresaId!),
        enabled: empresaId !== null,
    });

    const [form, setForm] = useState<EmpresaForm>(BUIT);
    const [errors, setErrors] = useState<Partial<Record<keyof EmpresaForm, string>>>({});
    const [desant, setDesant] = useState(false);
    const [missatge, setMissatge] = useState<string | null>(null);

    const desDeServidor = (): EmpresaForm => {
        const e = query.data;
        if (!e) return BUIT;
        return {
            nom: e.nom ?? '',
            tipo: e.tipo ?? '',
            ubicacio: e.ubicacio ?? '',
            capacitat: e.capacitat ? String(e.capacitat) : '',
            descripcio: e.descripcio ?? '',
            diasAntesReserva: e.diasAntesReserva ? String(e.diasAntesReserva) : '14',
        };
    };

    useEffect(() => {
        if (query.data) setForm(desDeServidor());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query.data]);

    const canviar = (camp: keyof EmpresaForm, valor: string) => {
        setForm((f) => ({ ...f, [camp]: valor }));
        setErrors((e) => ({ ...e, [camp]: undefined }));
        setMissatge(null);
    };

    const validar = (): boolean => {
        const e: Partial<Record<keyof EmpresaForm, string>> = {};
        if (!form.nom.trim()) e.nom = t('nameRequired');
        if (!form.ubicacio.trim()) e.ubicacio = t('locationRequired');
        if (form.capacitat.trim() && isNaN(Number(form.capacitat))) e.capacitat = t('mustBeNumber');
        const dies = Number(form.diasAntesReserva);
        if (!form.diasAntesReserva.trim() || isNaN(dies) || dies < 1) e.diasAntesReserva = t('mustBePositiveNumber');
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const desar = async () => {
        if (empresaId === null || !validar()) return;
        const payload = {
            nom: form.nom.trim(),
            ubicacio: form.ubicacio.trim(),
            capacitat: form.capacitat.trim() ? Number(form.capacitat) : null,
            descripcio: form.descripcio.trim(),
            ...(form.tipo ? { tipo: form.tipo } : {}),
            diasAntesReserva: Number(form.diasAntesReserva),
        };
        setDesant(true);
        try {
            await updateEmpresa(empresaId, payload);
            await patchStoredEmpresa({ ...payload, capacitat: payload.capacitat });
            await queryClient.invalidateQueries({ queryKey: ['empresa', empresaId] });
            setMissatge(t('configDesat'));
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            setMissatge(Array.isArray(msg) ? msg.join(', ') : msg || t('empresaUpdateError'));
        } finally {
            setDesant(false);
        }
    };

    return {
        empresa: query.data,
        carregant: query.isLoading,
        form,
        errors,
        canviar,
        desar,
        descartar: () => { setForm(desDeServidor()); setErrors({}); setMissatge(null); },
        desant,
        missatge,
    };
}
