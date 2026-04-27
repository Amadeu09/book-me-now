import React, { useState } from 'react';
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
import type { PlantillaSummary, JornadaPlantillaResponse } from '../types/jornades.types';
import type { TreballadorBackendItem } from '../types/treballadors.types';

/* ═══════════════════════════════════════════
   HorariosScreen – Main screen
   ═══════════════════════════════════════════ */

export default function HorariosScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();

    const [activeTab, setActiveTab] = useState<TabKey>('global');
    const [searchQuery, setSearchQuery] = useState('');
    const [personalPage, setPersonalPage] = useState(1);

    // Modal & Edit states
    const [templateModalVisible, setTemplateModalVisible] = useState(false);
    const [trabajadorModalVisible, setTrabajadorModalVisible] = useState(false);
    const [workerToEdit, setWorkerToEdit] = useState<TreballadorBackendItem | null>(null);
    const [templateToEdit, setTemplateToEdit] = useState<JornadaPlantillaResponse | undefined>(undefined);

    const { plantillas, rawPlantillas, total: plantillasTotal, page: plantillasPage, totalPages: plantillasTotalPages, loading: plantillasLoading, error: plantillasError, refetch: refetchPlantillas } = useJornades(1, 2);

    const PAGE_SIZE = 4;

    // Custom hook to fetch workers via new implementation
    const { data: treballadorsData, isLoading: treballadorsLoading, refetch: refetchTreballadors } = useTreballadors(personalPage, PAGE_SIZE);

    const backendEmployees = (treballadorsData?.data || []).map((t: TreballadorBackendItem): Employee => {
        // Find assigned template if present (we expect one active generally)
        const activeAssignment = t.jornadesPlantillaAssignacions?.[0];
        const templateName = activeAssignment?.plantilla?.nom || 'Sin jornada';
        return {
            id: String(t.id),
            name: t.nom,
            role: 'EMPLEADO',
            shift: templateName,
            status: 'available', // Petición: "estado actual pon siempre activo"
            initials: t.nom.substring(0, 2).toUpperCase(),
            avatarColor: HC.primaryLight,
            templateName: templateName,
            photoUri: t.Usuari?.fotoPerfil ?? null,
        };
    });

    const filteredEmployees = backendEmployees.filter((e: Employee) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = treballadorsData?.totalPages || 1;
    const totalItems = treballadorsData?.total || 0;

    /* ── Handlers ── */
    const handleEditTemplate = (template: PlantillaSummary) => {
        const fullData = rawPlantillas?.find(p => p.id === template.id);
        if (fullData) {
            setTemplateToEdit(fullData);
            setTemplateModalVisible(true);
        } else {
            const msg = "No se pudo extraer la información de la plantilla.";
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Error", msg);
        }
    };

    const handleDeleteTemplate = (template: PlantillaSummary) => {
        const confirmMsg = `¿Estás seguro de que deseas eliminar la plantilla "${template.nom}"?`;

        const executeDelete = async () => {
            try {
                await deleteJornada(template.id);
                refetchPlantillas(1);
                Platform.OS === 'web'
                    ? window.alert("Plantilla eliminada correctamente.")
                    : Alert.alert("Éxito", "Plantilla eliminada correctamente.");
            } catch (error: unknown) {
                const errMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
                const msg = errMsg || 'No se pudo eliminar la plantilla.';
                Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(confirmMsg)) {
                executeDelete();
            }
        } else {
            Alert.alert(
                "Eliminar Plantilla",
                confirmMsg,
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Eliminar", style: "destructive", onPress: executeDelete }
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
        const confirmMsg = `¿Estás seguro de que deseas eliminar a "${employee.name}"?`;

        const executeDelete = async () => {
            try {
                await deleteTreballador(Number(employee.id));
                setPersonalPage(1);
                refetchTreballadors(1);
                Platform.OS === 'web'
                    ? window.alert("Trabajador eliminado correctamente.")
                    : Alert.alert("Éxito", "Trabajador eliminado correctamente.");
            } catch (error: unknown) {
                const errMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
                const msg = errMsg || 'No se pudo eliminar el trabajador.';
                Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(confirmMsg)) {
                executeDelete();
            }
        } else {
            Alert.alert(
                "Eliminar Trabajador",
                confirmMsg,
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Eliminar", style: "destructive", onPress: executeDelete }
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
                                        <Text style={styles.sectionTitle}>Plantillas de Jornadas</Text>
                                    </View>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => setTemplateModalVisible(true)}>
                                        <Text style={[styles.linkText, { color: theme.primary }]}>+ Crear Nova</Text>
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
                                                    labelTemplate={(count, total) => `MOSTRANDO ${count} DE ${total} PLANTILLAS`}
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
                                        <Text style={styles.sectionTitle}>Horarios del Personal</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
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
                                        <TouchableOpacity activeOpacity={0.7} onPress={() => setTrabajadorModalVisible(true)}>
                                            <Text style={[styles.linkText, { color: theme.primary }]}>+ Crear Nou</Text>
                                        </TouchableOpacity>
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
                                {treballadorsLoading ? (
                                    <Text style={{ textAlign: 'center', padding: 20 }}>Cargando empleados...</Text>
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
                                        labelTemplate={(count, total) => `MOSTRANDO PÁGINA ${personalPage} DE ${totalPages}`}
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
                            <Text style={styles.mobileSectionTitle}>Horario General</Text>
                            <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
                                <Ionicons name="pencil" size={14} color={theme.primary} />
                                <Text style={[styles.linkText, { color: theme.primary }]}>Editar</Text>
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
                            {treballadorsLoading ? (
                                <Text style={{ padding: 16 }}>Cargando...</Text>
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
                            <Text style={styles.mobileSectionTitle}>Plantillas de Horario</Text>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => setTemplateModalVisible(true)}>
                                <Text style={[styles.linkText, { color: theme.primary }]}>+ Crear Nova</Text>
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
                                                labelTemplate={(count, total) => `MOSTRANDO ${count} DE ${total} PLANTILLAS`}
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
                                <Text style={styles.mobileSectionTitle}>Personal</Text>
                                <Text style={styles.countText}>{totalItems} empleados en total</Text>
                            </View>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => setTrabajadorModalVisible(true)}>
                                <Text style={[styles.linkText, { color: theme.primary }]}>+ Crear Nou</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ paddingHorizontal: 16 }}>
                            {treballadorsLoading ? (
                                <Text>Cargando empleados...</Text>
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
                                                labelTemplate={(count, total) => `PÁGINA ${personalPage} DE ${totalPages}`}
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
