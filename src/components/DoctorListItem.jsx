import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import theme from '../theme/theme';

const DoctorListItem = ({ doctor, onPress, showDispensaryInfo = true }) => {
    const nearestDispensary = doctor.availableAt?.[0] || null;
    const distance = doctor.nearestDistance !== undefined ? doctor.nearestDistance : null;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <Text style={styles.name}>{doctor.name}</Text>
                {distance !== null && (
                    <Text style={styles.distance}>{distance.toFixed(1)} km</Text>
                )}
            </View>

            <Text style={styles.specialization}>{doctor.specialization}</Text>

            {doctor.qualifications && doctor.qualifications.length > 0 && (
                <Text style={styles.qualifications}>
                    {doctor.qualifications.join(', ')}
                </Text>
            )}

            {showDispensaryInfo && nearestDispensary && (
                <View style={styles.dispensaryInfo}>
                    <Text style={styles.dispensaryName}>
                        {nearestDispensary.dispensaryName}
                    </Text>
                    <Text style={styles.dispensaryAddress} numberOfLines={1}>
                        {nearestDispensary.dispensaryAddress}
                    </Text>
                </View>
            )}

            {showDispensaryInfo && nearestDispensary?.fees && (
                <View style={styles.feeContainer}>
                    <Text style={styles.feeLabel}>Consultation Fee:</Text>
                    <Text style={styles.feeAmount}>
                        LKR {nearestDispensary.fees.totalFee}
                    </Text>
                </View>
            )}

            <View style={styles.footer}>
                <Text style={styles.availableText}>
                    {doctor.availableAt?.length > 0
                        ? `Available at ${doctor.availableAt.length} locations`
                        : 'View Details'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.xs,
    },
    name: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
        flex: 1,
    },
    distance: {
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.medium,
        color: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight + '20',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
        marginLeft: theme.spacing.sm,
    },
    specialization: {
        fontSize: theme.typography.base,
        color: theme.colors.secondary,
        fontWeight: theme.typography.medium,
        marginBottom: theme.spacing.xs,
    },
    qualifications: {
        fontSize: theme.typography.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    dispensaryInfo: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray200,
        paddingTop: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    dispensaryName: {
        fontSize: theme.typography.base,
        fontWeight: theme.typography.medium,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    dispensaryAddress: {
        fontSize: theme.typography.sm,
        color: theme.colors.textSecondary,
    },
    feeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.gray50,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
    },
    feeLabel: {
        fontSize: theme.typography.sm,
        color: theme.colors.textSecondary,
    },
    feeAmount: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        color: theme.colors.primary,
    },
    footer: {
        alignItems: 'center',
    },
    availableText: {
        fontSize: theme.typography.sm,
        color: theme.colors.primary,
        fontWeight: theme.typography.medium,
    },
});

export default DoctorListItem;
