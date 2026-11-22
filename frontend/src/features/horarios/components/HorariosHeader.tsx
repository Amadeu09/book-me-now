import React from 'react';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { useLanguage } from '@/core/i18n';

export const HorariosHeader: React.FC = () => {
    const { t } = useLanguage();
    return <ScreenHeader icon="time-outline" title={t('horariosTitle')} subtitle={t('horariosSubtitle')} />;
};
