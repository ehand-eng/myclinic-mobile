import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { getBookingSummary } from '../../services/apiClient';
import { addFavorite, isFavorite } from '../../services/favoriteService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import theme from '../../theme/theme';

const BookingSummaryScreen = ({ navigation, route }) => {
    const { transactionId, sourceDoctor, sourceDispensary } = route.params;
    const { user } = useAuth();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFav, setIsFav] = useState(false);
    const [addingFav, setAddingFav] = useState(false);

    useEffect(() => {
        fetchBookingSummary();
    }, []);

    useEffect(() => {
        if (booking && user?.mobile) {
            checkIfFavorite();
        }
    }, [booking, user]);

    const checkIfFavorite = async () => {
        if (!booking || !user?.mobile) return;

        const docId = sourceDoctor?._id || booking.doctor?._id || booking.doctorId;
        const dispId = sourceDispensary?._id || sourceDispensary?.dispensaryId || booking.dispensary?._id || booking.dispensaryId;

        if (docId && dispId) {
            const fav = await isFavorite(user.mobile, docId, dispId);
            setIsFav(fav);
        }
    };

    const fetchBookingSummary = async () => {
        setLoading(true);

        try {
            const result = await getBookingSummary(transactionId);

            if (result.success) {
                setBooking(result.data);
            } else {
                Alert.alert('Error', result.error || 'Failed to fetch booking summary');
            }
        } catch (error) {
            console.error('Error fetching booking summary:', error);
            Alert.alert('Error', 'An error occurred while fetching booking summary');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToFavorites = async () => {
        if (!booking || !user?.mobile) return;

        // Prioritize source keys from navigation, fall back to booking data
        // sourceDispensary typically comes from search/details which has dispensaryId aliased or _id
        const finalDocId = sourceDoctor?._id || booking.doctor?._id || booking.doctorId;
        const finalDispId = sourceDispensary?.dispensaryId || sourceDispensary?._id || booking.dispensary?._id || booking.dispensaryId;

        console.log('Adding to favorites with IDs:', {
            docId: finalDocId,
            dispId: finalDispId,
            sourceDoc: sourceDoctor,
            sourceDisp: sourceDispensary
        });

        if (!finalDocId || !finalDispId) {
            Alert.alert('Error', 'Cannot add to favorites: Missing ID information');
            return;
        }

        // Construct complete objects for storage
        const doctorObj = {
            ...booking.doctor,
            ...sourceDoctor,
            _id: finalDocId
        };
        const dispensaryObj = {
            ...booking.dispensary,
            ...sourceDispensary,
            _id: finalDispId,
            // Ensure display fields are present
            dispensaryName: sourceDispensary?.dispensaryName || booking.dispensary?.name,
            dispensaryAddress: sourceDispensary?.dispensaryAddress || booking.dispensary?.address
        };

        setAddingFav(true);
        const result = await addFavorite(user.mobile, doctorObj, dispensaryObj);
        setAddingFav(false);

        if (result.success) {
            setIsFav(true);
            Alert.alert('Success', 'Added to favorites successfully');
        } else {
            Alert.alert('Error', result.message || 'Failed to add to favorites');
        }
    };

    const handleDone = () => {
        // Navigate back to home screen and reset navigation stack
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!booking) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load booking details</Text>
                <Button title="Go Home" onPress={handleDone} style={styles.button} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Success Header */}
            <View style={styles.successHeader}>
                <View style={styles.successIcon}>
                    <Text style={styles.successIconText}>✓</Text>
                </View>
                <Text style={styles.successTitle}>Booking Confirmed!</Text>
                <Text style={styles.successSubtitle}>
                    Your appointment has been successfully booked
                </Text>
            </View>

            {/* Transaction ID Card */}
            <View style={styles.transactionCard}>
                <Text style={styles.transactionLabel}>Transaction ID</Text>
                <Text style={styles.transactionId}>{booking.transactionId}</Text>
            </View>

            {/* Appointment Details */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Appointment Details</Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Appointment Number:</Text>
                    <Text style={styles.detailValueHighlight}>
                        #{booking.appointmentNumber}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                        {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time Slot:</Text>
                    <Text style={styles.detailValue}>{booking.timeSlot}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Estimated Time:</Text>
                    <Text style={styles.detailValue}>{booking.estimatedTime}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{booking.status.toUpperCase()}</Text>
                    </View>
                </View>
            </View>

            {/* Patient Information */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Patient Information</Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{booking.patient.name}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mobile:</Text>
                    <Text style={styles.detailValue}>{booking.patient.phone}</Text>
                </View>
            </View>

            {/* Doctor Information */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Doctor Information</Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Doctor:</Text>
                    <Text style={styles.detailValue}>{booking.doctor.name}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Specialization:</Text>
                    <Text style={styles.detailValue}>{booking.doctor.specialization}</Text>
                </View>
            </View>

            {/* Dispensary Information */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Dispensary Information</Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{booking.dispensary.name}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Address:</Text>
                    <Text style={styles.detailValue}>{booking.dispensary.address}</Text>
                </View>
            </View>

            {/* Fee Details */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Payment Summary</Text>

                <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Doctor Fee:</Text>
                    <Text style={styles.feeValue}>LKR {booking.fees.doctorFee}</Text>
                </View>

                {booking.fees.dispensaryFee > 0 && (
                    <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>Dispensary Fee:</Text>
                        <Text style={styles.feeValue}>LKR {booking.fees.dispensaryFee}</Text>
                    </View>
                )}

                <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Booking Commission:</Text>
                    <Text style={styles.feeValue}>LKR {booking.fees.bookingCommission}</Text>
                </View>

                <View style={[styles.feeRow, styles.totalFeeRow]}>
                    <Text style={styles.totalFeeLabel}>Total Amount:</Text>
                    <Text style={styles.totalFeeValue}>LKR {booking.fees.totalAmount}</Text>
                </View>
            </View>

            {/* Important Note */}
            <View style={styles.noteCard}>
                <Text style={styles.noteTitle}>📌 Important</Text>
                <Text style={styles.noteText}>
                    • Please arrive 10 minutes before your scheduled time{'\n'}
                    • Bring a valid ID for verification{'\n'}
                    • A confirmation SMS has been sent to your mobile number
                </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
                {!isFav && (
                    <Button
                        title="Add to Favorites"
                        onPress={handleAddToFavorites}
                        style={[styles.button]}
                        variant="secondary"
                        loading={addingFav}
                    />
                )}

                <Button
                    title="Done"
                    onPress={handleDone}
                    style={styles.button}
                />
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
        paddingBottom: theme.spacing.xl,
    },
    successHeader: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        paddingTop: theme.spacing.lg,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.success,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    successIconText: {
        fontSize: 48,
        color: theme.colors.white,
        fontWeight: theme.typography.bold,
    },
    successTitle: {
        fontSize: theme.typography['2xl'],
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    successSubtitle: {
        fontSize: theme.typography.base,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    transactionCard: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        alignItems: 'center',
    },
    transactionLabel: {
        fontSize: theme.typography.sm,
        color: theme.colors.white,
        opacity: 0.8,
        marginBottom: theme.spacing.xs,
    },
    transactionId: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        color: theme.colors.white,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    sectionTitle: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray200,
    },
    detailRow: {
        marginBottom: theme.spacing.sm,
    },
    detailLabel: {
        fontSize: theme.typography.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    detailValue: {
        fontSize: theme.typography.base,
        fontWeight: theme.typography.medium,
        color: theme.colors.textPrimary,
    },
    detailValueHighlight: {
        fontSize: theme.typography.xl,
        fontWeight: theme.typography.bold,
        color: theme.colors.primary,
    },
    statusBadge: {
        backgroundColor: theme.colors.success + '20',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.md,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.semiBold,
        color: theme.colors.success,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    feeLabel: {
        fontSize: theme.typography.base,
        color: theme.colors.textSecondary,
    },
    feeValue: {
        fontSize: theme.typography.base,
        fontWeight: theme.typography.medium,
        color: theme.colors.textPrimary,
    },
    totalFeeRow: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray200,
        paddingTop: theme.spacing.md,
        marginTop: theme.spacing.sm,
    },
    totalFeeLabel: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
    },
    totalFeeValue: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        color: theme.colors.primary,
    },
    noteCard: {
        backgroundColor: theme.colors.info + '10',
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.info,
    },
    noteTitle: {
        fontSize: theme.typography.base,
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },
    noteText: {
        fontSize: theme.typography.sm,
        color: theme.colors.textSecondary,
        lineHeight: theme.typography.relaxed * theme.typography.sm,
    },
    doneButton: {
        marginTop: theme.spacing.md,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.backgroundSecondary,
    },
    errorText: {
        fontSize: theme.typography.lg,
        color: theme.colors.error,
        marginBottom: theme.spacing.lg,
        textAlign: 'center',
    },
    button: {
        marginTop: theme.spacing.md,
    },
    actionButtonsContainer: {
        marginTop: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    secondaryButton: {
        marginTop: 0,
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
});

export default BookingSummaryScreen;
