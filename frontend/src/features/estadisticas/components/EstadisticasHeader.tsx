import React from 'react';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { useLanguage } from '@/core/i18n';

export function EstadisticasHeader() {
    const { t } = useLanguage();
    return <ScreenHeader icon="bar-chart-outline" title={t('statsTitle')} subtitle={t('statsSubtitle')} />;
}
