import React from 'react';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
import { HeaderButton } from '@/ui/components/HeaderButton';
import { useLanguage } from '@/core/i18n';
import { ViewMode } from './types';

interface CalendarHeaderProps {
    viewMode: ViewMode;
    onViewChange: (mode: ViewMode) => void;
    onQuickCreate: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ onQuickCreate }) => {
    const { t } = useLanguage();
    return (
        <ScreenHeader
            icon="calendar-outline"
            title={t('calendarTitle')}
            subtitle={t('calendarSubtitle')}
            right={<HeaderButton label={t('calendarNewBooking')} onPress={onQuickCreate} />}
        />
    );
};
