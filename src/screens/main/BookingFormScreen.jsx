import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getDoctorDispensaryFees, createBooking } from '../../services/apiClient';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/LoadingSpinner';
import theme from '../../theme/theme';

const BookingFormScreen = ({ navigation, route }) => {
    const { doctor, dispensary, timeSlot } = route.params;
    const { user } = useAuth();

    const [patientName, setPatientName] = useState(user?.name || '');
    const [patientPhone, setPatientPhone] = useState(user?.mobile || '');
    const [feeDetails, setFeeDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchFeeDetails();
    }, []);

    const fetchFeeDetails = async () => {
        setLoading(true);

        try {
            const result = await getDoctorDispensaryFees(
                doctor._id,
                dispensary.dispensaryId
            );

            if (result.success) {
                setFeeDetails(result.data);
            } else {
                Alert.alert('Error', result.error || 'Failed to fetch fee details');
            }
        } catch (error) {
            console.error('Error fetching fee details:', error);
            Alert.alert('Error', 'An error occurred while fetching fee details');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!patientName.trim()) {
            newErrors.name = 'Patient name is required';
        } else if (patientName.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!patientPhone.trim()) {
            newErrors.phone = 'Mobile number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            const bookingData = {
                patientName: patientName.trim(),
                patientPhone: patientPhone.trim(),
                doctorId: doctor._id,
                dispensaryId: dispensary.dispensaryId,
                bookingDate: timeSlot.date,
                fees: feeDetails,
                timeSlot: `${timeSlot.startTime}-${timeSlot.endTime}`,
                appointmentNumber: timeSlot.nextAppointmentNumber,
                estimatedTime: timeSlot.startTime,
                minutesPerPatient: timeSlot.minutesPerPatient,
                bookedUser: 'online',
                bookedBy: 'ONLINE',
            };

            const result = await createBooking(bookingData);

            if (result.success) {
                // Navigate to booking summary
                navigation.navigate('BookingSummary', {
                    transactionId: result.data.transactionId,
                });
            } else {
                Alert.alert('Booking Failed', result.error || 'Failed to create booking');
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            Alert.alert('Error', 'An error occurred while creating booking');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* Booking Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.sectionTitle}>Booking Details</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Doctor:</Text>
                        <Text style={styles.detailValue}>{doctor.name}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Dispensary:</Text>
                        <Text style={styles.detailValue}>{dispensary.dispensaryName}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date:</Text>
                        <Text style={styles.detailValue}>
                            {new Date(timeSlot.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Time:</Text>
                        <Text style={styles.detailValue}>
                            {timeSlot.startTime} - {timeSlot.endTime}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Appointment #:</Text>
                        <Text style={styles.detailValue}>{timeSlot.nextAppointmentNumber}</Text>
                    </View>
                </View>

                {/* Fee Details Card */}
                {feeDetails && (
                    <View style={styles.feeCard}>
                        <Text style={styles.sectionTitle}>Fee Breakdown</Text>

                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>Doctor Fee:</Text>
                            <Text style={styles.feeValue}>LKR {feeDetails.doctorFee}</Text>
                        </View>

                        {feeDetails.dispensaryFee > 0 && (
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Dispensary Fee:</Text>
                                <Text style={styles.feeValue}>LKR {feeDetails.dispensaryFee}</Text>
                            </View>
                        )}

                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>Booking Commission:</Text>
                            <Text style={styles.feeValue}>LKR {feeDetails.bookingCommission}</Text>
                        </View>

                        <View style={[styles.feeRow, styles.totalFeeRow]}>
                            <Text style={styles.totalFeeLabel}>Total Amount:</Text>
                            <Text style={styles.totalFeeValue}>LKR {feeDetails.totalFee}</Text>
                        </View>
                    </View>
                )}

                {/* Patient Information Form */}
                <View style={styles.formCard}>
                    <Text style={styles.sectionTitle}>Patient Information</Text>

                    <Input
                        label="Patient Name *"
                        value={patientName}
                        onChangeText={(text) => {
                            setPatientName(text);
                            if (errors.name) {
                                setErrors({ ...errors, name: '' });
                            }
                        }}
                        placeholder="Enter patient name"
                        error={errors.name}
                        autoCapitalize="words"
                    />

                    <Input
                        label="Mobile Number *"
                        value={patientPhone}
                        onChangeText={(text) => {
                            setPatientPhone(text);
                            if (errors.phone) {
                                setErrors({ ...errors, phone: '' });
                            }
                        }}
                        placeholder="0762199100"
                        keyboardType="phone-pad"
                        error={errors.phone}
                    />

                    <Button
                        title="Confirm Booking"
                        onPress={handleSubmit}
                        loading={submitting}
                        disabled={submitting}
                        style={styles.submitButton}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundSecondary,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: theme.spacing.md,
    },
    summaryCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    feeCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    formCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.xl,
        ...theme.shadows.sm,
    },
    sectionTitle: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
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
    submitButton: {
        marginTop: theme.spacing.md,
    },
});

export default BookingFormScreen;
