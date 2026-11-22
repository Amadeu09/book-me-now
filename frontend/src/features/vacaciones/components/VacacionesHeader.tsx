import React from 'react';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { useLanguage } from '@/core/i18n';

export function VacacionesHeader() {
    const { t } = useLanguage();
    return <ScreenHeader icon="sunny-outline" title={t('vacTitle')} subtitle={t('vacSubtitle')} />;
}
