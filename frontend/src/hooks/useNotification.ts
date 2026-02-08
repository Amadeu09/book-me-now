import { useState } from 'react';
import { Alert, AlertButton } from 'react-native';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

export function useNotification() {
    const [notification, setNotification] = useState<{
        type: NotificationType;
        message: string;
        title?: string;
    } | null>(null);

    const show = (title: string, message: string, type: NotificationType = 'info', buttons?: AlertButton[]) => {
        Alert.alert(title, message, buttons);
        setNotification({ type, message, title });
    };

    const showSuccess = (title: string, message: string) => show(title, message, 'success');
    const showError = (title: string, message: string) => show(title, message, 'error');
    const showWarning = (title: string, message: string) => show(title, message, 'warning');
    const showInfo = (title: string, message: string) => show(title, message, 'info');

    const clear = () => setNotification(null);

    return {
        notification,
        show,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        clear,
    };
}
