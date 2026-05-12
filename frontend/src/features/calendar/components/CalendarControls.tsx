import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { palette, spacing, radius, shadow } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/core/i18n';
import type { ApiTreballador, ApiServei } from '../types';

interface CalendarControlsProps {
    dateRange: string;
    onPrev: () => void;
    onNext: () => void;
    workers: ApiTreballador[];
    selectedWorkerId?: string;
    onWorkerSelect?: (workerId: string | null) => void;
    services?: ApiServei[];
    selectedServiceId?: string;
    onServiceSelect?: (serviceId: string | null) => void;
    showWorkerFilter?: boolean;
}

const FilterButton = ({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.filterButton} onPress={onPress}>
        <Ionicons name={icon} size={16} color={palette.textMuted} />
        <Text style={styles.filterText}>{label}</Text>
        <Ionicons name="chevron-down" size={14} color={palette.textSubtle} />
    </TouchableOpacity>
);

export const CalendarControls: React.FC<CalendarControlsProps> = ({
    dateRange,
    onPrev,
    onNext,
    workers = [],
    selectedWorkerId,
    onWorkerSelect,
    services = [],
    selectedServiceId,
    onServiceSelect,
    showWorkerFilter = true
}) => {
    const { t } = useLanguage();
    const { width } = useWindowDimensions();
    const isDesktop = Platform.OS === 'web' && width >= 1024;
    const [isWorkerMenuOpen, setIsWorkerMenuOpen] = useState(false);
    const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);

    const selectedWorker = workers.find(w => w.id.toString() === selectedWorkerId);
    const workerLabel = selectedWorker ? selectedWorker.nom : t('calendarAllEmployees');

    const selectedService = services.find(s => s.id.toString() === selectedServiceId);
    const serviceLabel = selectedService ? selectedService.nom : t('calendarAllServices');

    const handleWorkerSelect = (worker: ApiTreballador | null) => {
        setIsWorkerMenuOpen(false);
        if (onWorkerSelect) {
            onWorkerSelect(worker ? worker.id.toString() : null);
        }
    };

    const handleServiceSelect = (service: ApiServei | null) => {
        setIsServiceMenuOpen(false);
        if (onServiceSelect) {
            onServiceSelect(service ? service.id.toString() : null);
        }
    };

    return (
        <View style={[styles.container, !isDesktop && styles.containerMobile]}>
            <View style={styles.filters}>
                {showWorkerFilter && (
                    <View style={{ zIndex: 100 }}>
                        <FilterButton
                            icon="people-outline"
                            label={workerLabel}
                            onPress={() => {
                                setIsWorkerMenuOpen(!isWorkerMenuOpen);
                                setIsServiceMenuOpen(false);
                            }}
                        />

                        {isWorkerMenuOpen && (
                            <View style={styles.dropdownMenu}>
                                <ScrollView style={{ maxHeight: 200 }} bounces={false}>
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={() => handleWorkerSelect(null)}
                                    >
                                        <Text style={styles.menuItemText}>{t('calendarAllEmployees')}</Text>
                                    </TouchableOpacity>
                                    {workers.map(w => (
                                        <TouchableOpacity
                                            key={w.id}
                                            style={styles.menuItem}
                                            onPress={() => handleWorkerSelect(w)}
                                        >
                                            <Text style={styles.menuItemText}>{w.nom}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                )}

                <View style={{ zIndex: 99 }}>
                    <FilterButton
                        icon="shapes-outline"
                        label={serviceLabel}
                        onPress={() => {
                            setIsServiceMenuOpen(!isServiceMenuOpen);
                            setIsWorkerMenuOpen(false);
                        }}
                    />

                    {isServiceMenuOpen && (
                        <View style={styles.dropdownMenu}>
                            <ScrollView style={{ maxHeight: 200 }} bounces={false}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleServiceSelect(null)}
                                >
                                    <Text style={styles.menuItemText}>{t('calendarAllServices')}</Text>
                                </TouchableOpacity>
                                {services.map(s => (
                                    <TouchableOpacity
                                        key={s.id}
                                        style={styles.menuItem}
                                        onPress={() => handleServiceSelect(s)}
                                    >
                                        <Text style={styles.menuItemText}>{s.nom}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>

            <View style={[styles.navigation, !isDesktop && styles.navigationMobile]}>
                <TouchableOpacity onPress={onPrev} style={styles.navButton}>
                    <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
                </TouchableOpacity>

                <Text style={styles.dateRange}>{dateRange}</Text>

                <TouchableOpacity onPress={onNext} style={styles.navButton}>
                    <Ionicons name="chevron-forward" size={20} color={palette.textPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.gutterWeb,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: palette.borderSoft,
        backgroundColor: palette.background,
        zIndex: 50,
    },
    containerMobile: {
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    filters: {
        flexDirection: 'row',
        gap: spacing.md,
        zIndex: 60,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: palette.border,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: radius.md,
        gap: 8,
    },
    filterText: {
        fontSize: 14,
        color: palette.textPrimary,
        fontWeight: '500',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 45,
        left: 0,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: palette.border,
        borderRadius: radius.md,
        width: 180,
        zIndex: 1000,
        ...shadow.card,
    },
    menuItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: palette.borderSoft,
    },
    menuItemText: {
        fontSize: 14,
        color: palette.textPrimary,
    },
    navigation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    navigationMobile: {
        justifyContent: 'center',
        marginTop: 8,
    },
    navButton: {
        padding: 4,
    },
    dateRange: {
        fontSize: 16,
        fontWeight: '600',
        color: palette.textPrimary,
        minWidth: 160,
        textAlign: 'center',
    },
});
