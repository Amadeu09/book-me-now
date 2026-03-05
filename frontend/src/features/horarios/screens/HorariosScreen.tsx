import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    useWindowDimensions,
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
import { useJornades } from '../hooks/useJornades';
import {
    HC, cardShadow,
    MOCK_EMPLOYEES, MOCK_HOLIDAYS,
    type TabKey,
} from '../constants/horarios.constants';

/* ═══════════════════════════════════════════
   HorariosScreen – Main screen
   ═══════════════════════════════════════════ */

export default function HorariosScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    const [activeTab, setActiveTab] = useState<TabKey>('global');
    const [searchQuery, setSearchQuery] = useState('');
    const [personalPage, setPersonalPage] = useState(0);
    const [templateModalVisible, setTemplateModalVisible] = useState(false);
    const { plantillas, loading: plantillasLoading, error: plantillasError, refetch: refetchPlantillas } = useJornades();

    const PAGE_SIZE = 3;
    const filteredEmployees = MOCK_EMPLOYEES.filter((e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const pagedEmployees = filteredEmployees.slice(
        personalPage * PAGE_SIZE,
        (personalPage + 1) * PAGE_SIZE,
    );
    const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);

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
                            <View style={styles.sectionBox}>
                                <View style={styles.sectionHeaderRow}>
                                    <View style={styles.sectionTitleRow}>
                                        <Ionicons name="layers" size={18} color={HC.primary} />
                                        <Text style={styles.sectionTitle}>Plantillas</Text>
                                    </View>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => setTemplateModalVisible(true)}>
                                        <Text style={styles.linkText}>+ Crear Nueva</Text>
                                    </TouchableOpacity>
                                </View>
                                {plantillasLoading ? (
                                    <PlantillaListLoading />
                                ) : plantillasError ? (
                                    <PlantillaListError message={plantillasError} onRetry={refetchPlantillas} />
                                ) : plantillas.length === 0 ? (
                                    <PlantillaListEmpty />
                                ) : (
                                    plantillas.map((t) => (
                                        <PlantillaCard key={t.id} template={t} />
                                    ))
                                )}
                            </View>

                            {/* Excepciones */}
                            <ExceptionSectionDesktop holidays={MOCK_HOLIDAYS} />
                        </View>

                        {/* ── Right column ── */}
                        <View style={styles.colRight}>
                            <View style={[styles.sectionBox, { flex: 1 }]}>
                                {/* Header + search */}
                                <View style={styles.sectionHeaderRow}>
                                    <View style={styles.sectionTitleRow}>
                                        <Ionicons name="people" size={18} color={HC.primary} />
                                        <Text style={styles.sectionTitle}>Horarios del Personal</Text>
                                    </View>
                                    <View style={styles.searchBox}>
                                        <Ionicons name="search-outline" size={16} color={HC.textLight} />
                                        <TextInput
                                            style={styles.searchInput}
                                            placeholder="Buscar por nombre o rol..."
                                            placeholderTextColor={HC.textLight}
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                        />
                                    </View>
                                </View>

                                {/* Table header */}
                                <View style={styles.tableHead}>
                                    <Text style={[styles.thText, { flex: 2 }]}>EMPLEADO</Text>
                                    <Text style={[styles.thText, { flex: 1.5 }]}>PLANTILLA{'\n'}ASIGNADA</Text>
                                    <Text style={[styles.thText, { flex: 1.5 }]}>ESTADO{'\n'}ACTUAL</Text>
                                    <Text style={[styles.thText, { width: 60, textAlign: 'center' }]}>ACCIONES</Text>
                                </View>

                                {/* Rows */}
                                {pagedEmployees.map((emp) => (
                                    <EmployeeShiftCard key={emp.id} employee={emp} variant="row" />
                                ))}

                                {/* Pagination */}
                                <View style={styles.paginationRow}>
                                    <Text style={styles.paginationText}>
                                        MOSTRANDO {pagedEmployees.length} DE {filteredEmployees.length} EMPLEADOS
                                    </Text>
                                    <View style={styles.paginationBtns}>
                                        <TouchableOpacity
                                            style={[styles.pageBtn, personalPage === 0 && styles.pageBtnDisabled]}
                                            disabled={personalPage === 0}
                                            onPress={() => setPersonalPage((p) => p - 1)}
                                        >
                                            <Ionicons name="chevron-back" size={16} color={HC.textMuted} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.pageBtn, personalPage >= totalPages - 1 && styles.pageBtnDisabled]}
                                            disabled={personalPage >= totalPages - 1}
                                            onPress={() => setPersonalPage((p) => p + 1)}
                                        >
                                            <Ionicons name="chevron-forward" size={16} color={HC.textMuted} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <CreateTemplateModal
                    visible={templateModalVisible}
                    onClose={() => setTemplateModalVisible(false)}
                    onSuccess={refetchPlantillas}
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
                            <Text style={styles.mobileSectionTitle}>Horario General</Text>
                            <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
                                <Ionicons name="pencil" size={14} color={HC.primary} />
                                <Text style={styles.linkText}>Editar</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Global schedule */}
                        <View style={{ paddingHorizontal: 16 }}>
                            <GlobalScheduleCard />
                        </View>

                        {/* Personal en turno */}
                        <View style={[styles.mobileSectionHeader, { marginTop: 24 }]}>
                            <Text style={styles.mobileSectionTitle}>Personal en Turno</Text>
                            <Text style={styles.countText}>12 empleados hoy</Text>
                        </View>

                        <View style={{ paddingHorizontal: 16 }}>
                            {MOCK_EMPLOYEES.slice(0, 3).map((emp) => (
                                <EmployeeShiftCard key={emp.id} employee={emp} variant="card" />
                            ))}
                        </View>

                        {/* Exception CTA */}
                        <ExceptionCardMobile />
                    </>
                )}

                {activeTab === 'plantillas' && (
                    <>
                        <View style={styles.mobileSectionHeader}>
                            <Text style={styles.mobileSectionTitle}>Plantillas de Horario</Text>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => setTemplateModalVisible(true)}>
                                <Text style={styles.linkText}>+ Crear Nueva</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ paddingHorizontal: 16 }}>
                            {plantillasLoading ? (
                                <PlantillaListLoading />
                            ) : plantillasError ? (
                                <PlantillaListError message={plantillasError} onRetry={refetchPlantillas} />
                            ) : plantillas.length === 0 ? (
                                <PlantillaListEmpty />
                            ) : (
                                plantillas.map((t) => (
                                    <PlantillaCard key={t.id} template={t} />
                                ))
                            )}
                        </View>
                    </>
                )}

                {activeTab === 'personal' && (
                    <>
                        <View style={styles.mobileSectionHeader}>
                            <Text style={styles.mobileSectionTitle}>Personal</Text>
                            <Text style={styles.countText}>{filteredEmployees.length} empleados</Text>
                        </View>
                        <View style={{ paddingHorizontal: 16 }}>
                            {filteredEmployees.map((emp) => (
                                <EmployeeShiftCard key={emp.id} employee={emp} variant="card" />
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>

            {/* FAB */}
            <FloatingAddButton onPress={() => setTemplateModalVisible(true)} />

            <CreateTemplateModal
                visible={templateModalVisible}
                onClose={() => setTemplateModalVisible(false)}
                onSuccess={refetchPlantillas}
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
        padding: 32,
        paddingBottom: 48,
        maxWidth: 1100,
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
        outlineStyle: 'none',
    } as any,

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

    /* Pagination */
    paginationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    paginationText: {
        fontSize: 11,
        fontWeight: '700',
        color: HC.textMuted,
        letterSpacing: 0.4,
    },
    paginationBtns: {
        flexDirection: 'row',
        gap: 8,
    },
    pageBtn: {
        width: 34,
        height: 34,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: HC.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: HC.white,
    },
    pageBtnDisabled: {
        opacity: 0.4,
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
