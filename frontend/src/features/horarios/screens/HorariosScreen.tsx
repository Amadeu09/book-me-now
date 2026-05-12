import React, { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    useWindowDimensions,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HorariosHeader } from '../components/HorariosHeader';
import { HorariosTabs } from '../components/HorariosTabs';
import { GlobalScheduleCard } from '../components/GlobalScheduleCard';
import { PlantillaCard, PlantillaListLoading, PlantillaListEmpty, PlantillaListError } from '../components/PlantillaCard';
import { EmployeeShiftCard } from '../components/EmployeeShiftCard';
import { ExceptionCardMobile, ExceptionSectionDesktop } from '../components/ExceptionCard';
import { FloatingAddButton } from '../components/FloatingAddButton';
import { CreateTemplateModal } from '../components/modal/CreateTemplateModal';
import { CreateTrabajadorModal } from '../components/modal/CreateTrabajadorModal';
import { PaginationRow } from '../components/PaginationRow';
import { useTreballadors } from '../hooks/useTreballadors';
import { useJornades } from '../hooks/useJornades';
import { deleteJornada } from '../services/jornades.service';
import { deleteTreballador } from '../services/treballadors.service';
import {
    HC, cardShadow,
    MOCK_HOLIDAYS,
    type TabKey,
    type Employee,
} from '../constants/horarios.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import type { PlantillaSummary, JornadaPlantillaResponse } from '../types/jornades.types';
import type { TreballadorBackendItem } from '../types/treballadors.types';

/* ═══════════════════════════════════════════
   HorariosScreen – Main screen
   ═══════════════════════════════════════════ */

export default function HorariosScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();
    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState<TabKey>('global');
    const [searchQuery, setSearchQuery] = useState('');
    const [personalPage, setPersonalPage] = useState(1);

    // Modal & Edit states
    const [templateModalVisible, setTemplateModalVisible] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [trabajadorModalVisible, setTrabajadorModalVisible] = useState(false);
    const [workerToEdit, setWorkerToEdit] = useState<TreballadorBackendItem | null>(null);
    const [templateToEdit, setTemplateToEdit] = useState<JornadaPlantillaResponse | undefined>(undefined);

    const { plantillas, rawPlantillas, total: plantillasTotal, page: plantillasPage, totalPages: plantillasTotalPages, loading: plantillasLoading, error: plantillasError, refetch: refetchPlantillas } = useJornades(1, 2);

    const PAGE_SIZE = 4;

    // Custom hook to fetch workers via new implementation
    const { data: treballadorsData, isLoading: treballadorsLoading, refetch: refetchTreballadors } = useTreballadors(personalPage, PAGE_SIZE);

    const backendEmployees = (treballadorsData?.data || []).map((worker: TreballadorBackendItem): Employee => {
        const templateName = worker.plantilla?.nom || t('horariosNoJornada');
        return {
            id: String(worker.id),
            name: worker.nom,
            role: 'EMPLEADO',
            shift: templateName,
            status: 'available',
            initials: worker.nom.substring(0, 2).toUpperCase(),
            avatarColor: HC.primaryLight,
            templateName: templateName,
            photoUri: worker.Usuari?.fotoPerfil ?? null,
        };
    });

    const filteredEmployees = backendEmployees.filter((e: Employee) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = treballadorsData?.totalPages || 1;
    const totalItems = treballadorsData?.total || 0;

    const _isFirstFocus = useRef(true);
    useFocusEffect(useCallback(() => {
        if (_isFirstFocus.current) { _isFirstFocus.current = false; return; }
        refetchPlantillas(1);
        refetchTreballadors(1);
    }, [refetchPlantillas, refetchTreballadors]));

    /* ── Handlers ── */
    const handleEditTemplate = (template: PlantillaSummary) => {
        const fullData = rawPlantillas?.find(p => p.id === template.id);
        if (fullData) {
            setTemplateToEdit(fullData);
            setTemplateModalVisible(true);
        } else {
            const msg = t('horariosCannotExtractTemplate');
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert(t('error'), msg);
        }
    };

    const handleDeleteTemplate = (template: PlantillaSummary) => {
        const confirmMsg = t('horariosDeleteTemplateConfirm').replace('{name}', template.nom);

        const executeDelete = async () => {
            try {
                await deleteJornada(template.id);
                refetchPlantillas(1);
                Platform.OS === 'web'
                    ? window.alert(t('horariosDeleteTemplateSuccess'))
                    : Alert.alert(t('success'), t('horariosDeleteTemplateSuccess'));
            } catch (error: unknown) {
                const errMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
                const msg = errMsg || t('horariosDeleteTemplateError');
                Platform.OS === 'web' ? window.alert(msg) : Alert.alert(t('error'), msg);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(confirmMsg)) {
                executeDelete();
            }
        } else {
            Alert.alert(
                t('horariosDeleteTemplateTitle'),
                confirmMsg,
                [
                    { text: t('cancel'), style: "cancel" },
                    { text: t('delete'), style: "destructive", onPress: executeDelete }
                ]
            );
        }
    };

    const handleEditWorker = (employee: Employee) => {
        // Encontraremos el trabajador original en treballadorsData
        const originalWorker = (treballadorsData?.data || []).find((t: TreballadorBackendItem) => String(t.id) === employee.id);
        if (originalWorker) {
            setWorkerToEdit(originalWorker);
            setTrabajadorModalVisible(true);
        }
    };

    const handleDeleteWorker = (employee: Employee) => {
        const confirmMsg = t('horariosDeleteWorkerConfirm').replace('{name}', employee.name);

        const executeDelete = async () => {
            try {
                await deleteTreballador(Number(employee.id));
                setPersonalPage(1);
                refetchTreballadors(1);
                Platform.OS === 'web'
                    ? window.alert(t('horariosDeleteWorkerSuccess'))
                    : Alert.alert(t('success'), t('horariosDeleteWorkerSuccess'));
            } catch (error: unknown) {
                const errMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
                const msg = errMsg || t('horariosDeleteWorkerError');
                Platform.OS === 'web' ? window.alert(msg) : Alert.alert(t('error'), msg);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(confirmMsg)) {
                executeDelete();
            }
        } else {
            Alert.alert(
                t('horariosDeleteWorkerTitle'),
                confirmMsg,
                [
                    { text: t('cancel'), style: "cancel" },
                    { text: t('delete'), style: "destructive", onPress: executeDelete }
                ]
            );
        }
    };

    /* ── Desktop layout ─────────────────── */
    if (isDesktop) {
        return (
            <View style={styles.safe}>
                <HorariosHeader />
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.desktopContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Global schedule card – full width */}
                    <GlobalScheduleCard />

                    {/* Two-column area */}
                    <View style={styles.columnsRow}>
                        {/* ── Left column ── */}
                        <View style={styles.colLeft}>
                            {/* Plantillas */}
                            <View style={[styles.sectionBox, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
                                <View style={styles.sectionHeaderRow}>
                                    <View style={styles.sectionTitleRow}>
                                        <Text style={styles.sectionTitle}>{t('horariosSectionPlantilles')}</Text>
                                    </View>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => setTemplateModalVisible(true)}>
                                        <Text style={[styles.linkText, { color: theme.primary }]}>{t('horariosCreateNova')}</Text>
                                    </TouchableOpacity>
                                </View>
                                {plantillasLoading ? (
                                    <PlantillaListLoading />
                                ) : plantillasError ? (
                                    <PlantillaListError message={plantillasError} onRetry={() => refetchPlantillas()} />
                                ) : plantillas.length === 0 ? (
                                    <PlantillaListEmpty />
                                ) : (
                                    <>
                                        {plantillas.map((t) => (
                                            <PlantillaCard
                                                key={t.id}
                                                template={t}
                                                onEdit={handleEditTemplate}
                                                onDelete={handleDeleteTemplate}
                                                isMenuOpen={openMenuId === t.id}
                                                onMenuOpen={() => setOpenMenuId(t.id)}
                                                onMenuClose={() => setOpenMenuId(null)}
                                            />
                                        ))}
                                        {plantillasTotalPages > 1 && (
                                            <View style={{ marginTop: 8 }}>
                                                <PaginationRow
                                                    currentPage={plantillasPage}
                                                    totalPages={plantillasTotalPages}
                                                    totalItems={plantillasTotal}
                                                    itemsPerPage={2}
                                                    onPageChange={(p) => refetchPlantillas(p)}
                                                    labelTemplate={(count, total) => `${t('paginationShowing')} ${count} ${t('paginationOf')} ${total} ${t('paginationPlantilles')}`}
                                                />
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>

                            {/* Excepciones */}
                            <ExceptionSectionDesktop holidays={MOCK_HOLIDAYS} />
                        </View>

                        {/* ── Right column ── */}
                        <View style={styles.colRight}>
                            <View style={[styles.sectionBox, { flex: 1, backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
                                {/* Header + search */}
                                <View style={styles.sectionHeaderRow}>
                                    <View style={styles.sectionTitleRow}>
                                        <Text style={styles.sectionTitle}>{t('horariosSectionPersonal')}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                        <View style={styles.searchBox}>
                                            <Ionicons name="search-outline" size={16} color={HC.textLight} />
                                            <TextInput
                                                style={styles.searchInput}
                                                placeholder={t('horariosSearchPh')}
                                                placeholderTextColor={HC.textLight}
                                                value={searchQuery}
                                                onChangeText={setSearchQuery}
                                            />
                                        </View>
                                        <TouchableOpacity activeOpacity={0.7} onPress={() => setTrabajadorModalVisible(true)}>
                                            <Text style={[styles.linkText, { color: theme.primary }]}>{t('horariosCreateNou')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Table header */}
                                <View style={styles.tableHead}>
                                    <Text style={[styles.thText, { flex: 2 }]}>{t('horariosColEmployee')}</Text>
                                    <Text style={[styles.thText, { flex: 1.5 }]}>{t('horariosColTemplate')}</Text>
                                    <Text style={[styles.thText, { flex: 1.5 }]}>{t('horariosColStatus')}</Text>
                                    <Text style={[styles.thText, { width: 60, textAlign: 'center' }]}>{t('horariosColActions')}</Text>
                                </View>

                                {/* Rows */}
                                {treballadorsLoading ? (
                                    <Text style={{ textAlign: 'center', padding: 20 }}>{t('horariosLoadingEmployees')}</Text>
                                ) : filteredEmployees.map((emp: Employee) => (
                                    <EmployeeShiftCard
                                        key={emp.id}
                                        employee={emp}
                                        variant="row"
                                        onEdit={handleEditWorker}
                                        onDelete={handleDeleteWorker}
                                    />
                                ))}

                                {/* Pagination */}
                                <View style={{ marginTop: 'auto' }}>
                                    <PaginationRow
                                        currentPage={personalPage}
                                        totalPages={totalPages}
                                        totalItems={totalItems}
                                        itemsPerPage={PAGE_SIZE}
                                        onPageChange={setPersonalPage}
                                        labelTemplate={(count, total) => `${t('paginationPage')} ${personalPage} ${t('paginationOf')} ${totalPages}`}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <CreateTemplateModal
                    visible={templateModalVisible}
                    initialData={templateToEdit}
                    onClose={() => {
                        setTemplateModalVisible(false);
                        setTemplateToEdit(undefined);
                    }}
                    onSuccess={() => refetchPlantillas(1)}
                />

                <CreateTrabajadorModal
                    visible={trabajadorModalVisible}
                    initialData={workerToEdit}
                    onClose={() => {
                        setTrabajadorModalVisible(false);
                        setWorkerToEdit(null);
                    }}
                    onSuccess={() => {
                        setPersonalPage(1);
                        refetchTreballadors(1);
                    }}
                />
            </View>
        );
    }

    /* ── Mobile layout ──────────────────── */
    return (
        <View style={styles.safe}>
            <HorariosHeader />
            <HorariosTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.mobileContent}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'global' && (
                    <>
                        {/* Section header */}
                        <View style={styles.mobileSectionHeader}>
                            <Text style={styles.mobileSectionTitle}>{t('horariosGeneralTitle')}</Text>
                            <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
                                <Ionicons name="pencil" size={14} color={theme.primary} />
                                <Text style={[styles.linkText, { color: theme.primary }]}>{t('edit')}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Global schedule */}
                        <View style={{ paddingHorizontal: 16 }}>
                            <GlobalScheduleCard />
                        </View>

                        {/* Personal en turno */}
                        <View style={[styles.mobileSectionHeader, { marginTop: 24 }]}>
                            <Text style={styles.mobileSectionTitle}>{t('horariosMobilePersonalTitle')}</Text>
                            <Text style={styles.countText}>12 empleados hoy</Text>
                        </View>

                        <View style={{ paddingHorizontal: 16 }}>
                            {treballadorsLoading ? (
                                <Text style={{ padding: 16 }}>{t('loading')}</Text>
                            ) : (
                                filteredEmployees.slice(0, 3).map((emp: Employee) => (
                                    <EmployeeShiftCard
                                        key={emp.id}
                                        employee={emp}
                                        variant="card"
                                        onEdit={handleEditWorker}
                                        onDelete={handleDeleteWorker}
                                    />
                                ))
                            )}
                        </View>

                        {/* Exception CTA */}
                        <ExceptionCardMobile />
                    </>
                )}

                {activeTab === 'plantillas' && (
                    <>
                        <View style={styles.mobileSectionHeader}>
                            <Text style={styles.mobileSectionTitle}>{t('horariosMobilePlantillesTitle')}</Text>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => setTemplateModalVisible(true)}>
                                <Text style={[styles.linkText, { color: theme.primary }]}>{t('horariosCreateNova')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ paddingHorizontal: 16 }}>
                            {plantillasLoading ? (
                                <PlantillaListLoading />
                            ) : plantillasError ? (
                                <PlantillaListError message={plantillasError} onRetry={() => refetchPlantillas(plantillasPage)} />
                            ) : plantillas.length === 0 ? (
                                <PlantillaListEmpty />
                            ) : (
                                <>
                                    {plantillas.map((t) => (
                                        <PlantillaCard
                                            key={t.id}
                                            template={t}
                                            onEdit={handleEditTemplate}
                                            onDelete={handleDeleteTemplate}
                                        />
                                    ))}
                                    {plantillasTotalPages > 1 && (
                                        <View style={{ marginTop: 8 }}>
                                            <PaginationRow
                                                currentPage={plantillasPage}
                                                totalPages={plantillasTotalPages}
                                                totalItems={plantillasTotal}
                                                itemsPerPage={2}
                                                onPageChange={(p) => refetchPlantillas(p)}
                                                labelTemplate={(count, total) => `${t('paginationShowing')} ${count} ${t('paginationOf')} ${total} ${t('paginationPlantilles')}`}
                                            />
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    </>
                )}

                {activeTab === 'personal' && (
                    <>
                        <View style={styles.mobileSectionHeader}>
                            <View>
                                <Text style={styles.mobileSectionTitle}>{t('tabPersonal')}</Text>
                                <Text style={styles.countText}>{totalItems} {t('horariosEmployeesTotal')}</Text>
                            </View>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => setTrabajadorModalVisible(true)}>
                                <Text style={[styles.linkText, { color: theme.primary }]}>{t('horariosCreateNou')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ paddingHorizontal: 16 }}>
                            {treballadorsLoading ? (
                                <Text>{t('horariosLoadingEmployees')}</Text>
                            ) : (
                                <>
                                    {filteredEmployees.map((emp: Employee) => (
                                        <EmployeeShiftCard
                                            key={emp.id}
                                            employee={emp}
                                            variant="card"
                                            onEdit={handleEditWorker}
                                            onDelete={handleDeleteWorker}
                                        />
                                    ))}
                                    {totalPages > 1 && (
                                        <View style={{ marginTop: 8 }}>
                                            <PaginationRow
                                                currentPage={personalPage}
                                                totalPages={totalPages}
                                                totalItems={totalItems}
                                                itemsPerPage={PAGE_SIZE}
                                                onPageChange={setPersonalPage}
                                                labelTemplate={(count, total) => `${t('paginationPage')} ${personalPage} ${t('paginationOf')} ${totalPages}`}
                                            />
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>

            {/* FAB */}
            <FloatingAddButton onPress={() => setTemplateModalVisible(true)} />

            <CreateTemplateModal
                visible={templateModalVisible}
                initialData={templateToEdit}
                onClose={() => {
                    setTemplateModalVisible(false);
                    setTemplateToEdit(undefined);
                }}
                onSuccess={() => refetchPlantillas(1)}
            />

            <CreateTrabajadorModal
                visible={trabajadorModalVisible}
                initialData={workerToEdit}
                onClose={() => {
                    setTrabajadorModalVisible(false);
                    setWorkerToEdit(null);
                }}
                onSuccess={() => {
                    setPersonalPage(1);
                    refetchTreballadors(1);
                }}
            />
        </View>
    );
}

/* ═══════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════ */
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: HC.screenBg,
    },
    scrollView: {
        flex: 1,
    },

    /* ── Desktop ─────────────────────────── */
    desktopContent: {
        paddingTop: 70,
        paddingHorizontal: 30,
        paddingBottom: 30,
        maxWidth: 1600,
        alignSelf: 'center',
        width: '100%',
    },
    columnsRow: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 28,
    },
    colLeft: {
        flex: 1,
        gap: 20,
    },
    colRight: {
        flex: 1.4,
    },
    sectionBox: {
        backgroundColor: HC.white,
        borderRadius: 14,
        padding: 20,
        ...cardShadow,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.primary,
    },

    /* Search box */
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
        minWidth: 200,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: HC.textPrimary,
        outlineStyle: 'none', // web-only CSS — cast needed, not in RN types
    } as object,

    /* Table head */
    tableHead: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: HC.border,
    },
    thText: {
        fontSize: 11,
        fontWeight: '700',
        color: HC.textMuted,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },



    /* ── Mobile ──────────────────────────── */
    mobileContent: {
        paddingBottom: 100,
    },
    mobileSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 12,
    },
    mobileSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    countText: {
        fontSize: 13,
        color: HC.textMuted,
    },
});
