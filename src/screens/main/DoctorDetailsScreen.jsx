import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import Button from '../../components/Button';
import theme from '../../theme/theme';

const DoctorDetailsScreen = ({ navigation, route }) => {
    const { doctor } = route.params;

    const handleDispensaryPress = (dispensary) => {
        navigation.navigate('TimeSlotSelection', {
            doctor,
            dispensary,
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Doctor Info */}
            <View style={styles.doctorCard}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.specialization}>{doctor.specialization}</Text>

                {doctor.qualifications && doctor.qualifications.length > 0 && (
                    <View style={styles.qualificationsContainer}>
                        <Text style={styles.sectionTitle}>Qualifications</Text>
                        {doctor.qualifications.map((qual, index) => (
                            <Text key={index} style={styles.qualification}>
                                • {qual}
                            </Text>
                        ))}
                    </View>
                )}

                {doctor.contactNumber && (
                    <View style={styles.contactContainer}>
                        <Text style={styles.contactLabel}>Contact:</Text>
                        <Text style={styles.contactValue}>{doctor.contactNumber}</Text>
                    </View>
                )}
            </View>

            {/* Available Locations */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Available at ({doctor.availableAt?.length || 0} locations)</Text>

                {doctor.availableAt && doctor.availableAt.length > 0 ? (
                    doctor.availableAt.map((dispensary, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.dispensaryCard}
                            onPress={() => handleDispensaryPress(dispensary)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.dispensaryHeader}>
                                <Text style={styles.dispensaryName}>
                                    {dispensary.dispensaryName}
                                </Text>
                                {dispensary.distance !== undefined && (
                                    <Text style={styles.distance}>
                                        {dispensary.distance.toFixed(1)} km
                                    </Text>
                                )}
                            </View>

                            <Text style={styles.dispensaryAddress}>
                                {dispensary.dispensaryAddress}
                            </Text>

                            {dispensary.fees && (
                                <View style={styles.feeContainer}>
                                    <View style={styles.feeRow}>
                                        <Text style={styles.feeLabel}>Doctor Fee:</Text>
                                        <Text style={styles.feeValue}>
                                            LKR {dispensary.fees.doctorFee}
                                        </Text>
                                    </View>

                                    {dispensary.fees.dispensaryFee > 0 && (
                                        <View style={styles.feeRow}>
                                            <Text style={styles.feeLabel}>Dispensary Fee:</Text>
                                            <Text style={styles.feeValue}>
                                                LKR {dispensary.fees.dispensaryFee}
                                            </Text>
                                        </View>
                                    )}

                                    <View style={[styles.feeRow, styles.totalFeeRow]}>
                                        <Text style={styles.totalFeeLabel}>Total:</Text>
                                        <Text style={styles.totalFeeValue}>
                                            LKR {dispensary.fees.totalFee}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <View style={styles.actionContainer}>
                                <Text style={styles.actionText}>Book Appointment →</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.noDataText}>No locations available</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundSecondary,
    },
    content: {
        padding: theme.spacing.md,
    },
    doctorCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        ...theme.shadows.md,
    },
    doctorName: {
        fontSize: theme.typography['2xl'],
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    specialization: {
        fontSize: theme.typography.lg,
        color: theme.colors.secondary,
        fontWeight: theme.typography.medium,
        marginBottom: theme.spacing.md,
    },
    qualificationsContainer: {
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray200,
    },
    qualification: {
        fontSize: theme.typography.base,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    contactContainer: {
        flexDirection: 'row',
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray200,
    },
    contactLabel: {
        fontSize: theme.typography.base,
        color: theme.colors.textSecondary,
        marginRight: theme.spacing.sm,
    },
    contactValue: {
        fontSize: theme.typography.base,
        fontWeight: theme.typography.medium,
        color: theme.colors.textPrimary,
    },
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
    },
    dispensaryCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    dispensaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.xs,
    },
    dispensaryName: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.semiBold,
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
    dispensaryAddress: {
        fontSize: theme.typography.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    feeContainer: {
        backgroundColor: theme.colors.gray50,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xs,
    },
    feeLabel: {
        fontSize: theme.typography.sm,
        color: theme.colors.textSecondary,
    },
    feeValue: {
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.medium,
        color: theme.colors.textPrimary,
    },
    totalFeeRow: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray200,
        paddingTop: theme.spacing.sm,
        marginTop: theme.spacing.xs,
        marginBottom: 0,
    },
    totalFeeLabel: {
        fontSize: theme.typography.base,
        fontWeight: theme.typography.semiBold,
        color: theme.colors.textPrimary,
    },
    totalFeeValue: {
        fontSize: theme.typography.base,
        fontWeight: theme.typography.bold,
        color: theme.colors.primary,
    },
    actionContainer: {
        alignItems: 'center',
        paddingTop: theme.spacing.sm,
    },
    actionText: {
        fontSize: theme.typography.base,
        fontWeight: theme.typography.semiBold,
        color: theme.colors.primary,
    },
    noDataText: {
        fontSize: theme.typography.base,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        padding: theme.spacing.xl,
    },
});

export default DoctorDetailsScreen;
