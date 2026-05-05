import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '../constants/horarios.constants';
import { useLanguage } from '@/core/i18n';

interface PaginationRowProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (newPage: number) => void;
    labelTemplate?: (count: number, total: number) => string;
}

export function PaginationRow({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    labelTemplate,
}: PaginationRowProps) {
    const { t } = useLanguage();
    const showingCount = Math.min(itemsPerPage, totalItems - (currentPage - 1) * itemsPerPage);
    const defaultLabelText = `${t('paginationShowing')} ${showingCount > 0 ? showingCount : 0} ${t('paginationOf')} ${totalItems}`;
    const labelText = labelTemplate ? labelTemplate(showingCount, totalItems) : defaultLabelText;

    const isFirstPage = currentPage <= 1;
    const isLastPage = currentPage >= totalPages || totalPages === 0;

    return (
        <View style={styles.paginationRow}>
            <Text style={styles.paginationText}>
                {labelText}
            </Text>
            <View style={styles.paginationBtns}>
                <TouchableOpacity
                    style={[styles.pageBtn, isFirstPage && styles.pageBtnDisabled]}
                    disabled={isFirstPage}
                    onPress={() => onPageChange(currentPage - 1)}
                >
                    <Ionicons name="chevron-back" size={16} color={HC.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.pageBtn, isLastPage && styles.pageBtnDisabled]}
                    disabled={isLastPage}
                    onPress={() => onPageChange(currentPage + 1)}
                >
                    <Ionicons name="chevron-forward" size={16} color={HC.textMuted} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
        textTransform: 'uppercase',
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
});
