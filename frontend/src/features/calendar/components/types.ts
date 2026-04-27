import type { ApiReserva } from '../types';

export type EventType = 'appointment' | 'blocking' | 'maintenance';

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: EventType;
    color?: string;
    client?: string;
    clientInitials?: string;
    badges?: string[];
    icon?: string; // name of icon from feather/material
    isVip?: boolean;
    estat?: ApiReserva['estat'];
    rawReserva?: ApiReserva;
}

export type ViewMode = 'day' | 'week' | 'month';
