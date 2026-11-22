import React from 'react';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { HeaderButton } from '@/ui/components/HeaderButton';
import { useLanguage } from '@/core/i18n';

interface ServicesHeaderProps {
    onNew?: () => void;
    loading?: boolean;
}

export const ServicesHeader: React.FC<ServicesHeaderProps> = ({ onNew, loading }) => {
    const { t } = useLanguage();
    return (
        <ScreenHeader
            icon="grid-outline"
            title={t('servTitle')}
            subtitle={t('servSubtitle')}
            right={onNew ? <HeaderButton label={t('servNewTitle')} onPress={onNew} disabled={loading} /> : undefined}
        />
    );
};
