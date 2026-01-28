import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { getNextAvailableTimeSlots } from '../../services/apiClient';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import theme from '../../theme/theme';

const TimeSlotSelectionScreen = ({ navigation, route }) => {
    const { doctor, dispensary, dispensaryId, doctorId } = route.params;
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        fetchTimeSlots();
    }, []);

    const fetchTimeSlots = async () => {
        setLoading(true);

        // Determine the correct Dispensary ID
        const targetDispensaryId = dispensaryId || dispensary?.dispensaryId || dispensary?._id;
        const targetDoctorId = doctorId || doctor?._id;

        console.log('Fetching Time Slots for:', {
            doctorId: targetDoctorId,
            dispensaryId: targetDispensaryId,
            rawDispensary: dispensary,
            paramDispensaryId: dispensaryId
        });

        if (!targetDispensaryId || !targetDoctorId) {
            Alert.alert('Error', 'Invalid Doctor or Dispensary ID. Please try again.');
            setLoading(false);
            return;
        }

        try {
            const result = await getNextAvailableTimeSlots(
                targetDoctorId,
                targetDispensaryId
            );

            if (result.success) {
                setTimeSlots(result.data.availableDays || []);
            } else {
                Alert.alert('Error', result.error || 'Failed to fetch time slots');
            }
        } catch (error) {
            console.error('Error fetching time slots:', error);
            Alert.alert('Error', 'An error occurred while fetching time slots');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleSlotSelect = (slot) => {
        if (slot.isFullyBooked) {
            Alert.alert('Fully Booked', 'This time slot is fully booked. Please select another slot.');
            return;
        }
        setSelectedSlot(slot);
    };

    const handleContinue = () => {
        if (!selectedSlot) {
            Alert.alert('No Slot Selected', 'Please select a time slot to continue');
            return;
        }

        navigation.navigate('BookingForm', {
            doctor,
            dispensary,
            timeSlot: selectedSlot,
        });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
            >
                {/* Header Info */}
                <View style={styles.headerCard}>
                    <Text style={styles.doctorName}>{doctor.name}</Text>
                    <Text style={styles.dispensaryName}>{dispensary.dispensaryName}</Text>
                </View>

                {/* Time Slots */}
                {timeSlots.length > 0 ? (
                    <>
                        <Text style={styles.sectionTitle}>Select a Time Slot</Text>
                        {timeSlots.map((slot, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.slotCard,
                                    selectedSlot?.date === slot.date && styles.slotCardSelected,
                                    slot.isFullyBooked && styles.slotCardDisabled,
                                ]}
                                onPress={() => handleSlotSelect(slot)}
                                disabled={slot.isFullyBooked}
                                activeOpacity={0.7}
                            >
                                <View style={styles.slotHeader}>
                                    <View>
                                        <Text style={[
                                            styles.slotDate,
                                            slot.isFullyBooked && styles.textDisabled,
                                        ]}>
                                            {formatDate(slot.date)}
                                        </Text>
                                        <Text style={[
                                            styles.slotDay,
                                            slot.isFullyBooked && styles.textDisabled,
                                        ]}>
                                            {slot.dayName}
                                        </Text>
                                    </View>

                                    {slot.isFullyBooked ? (
                                        <View style={styles.fullyBookedBadge}>
                                            <Text style={styles.fullyBookedText}>Fully Booked</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.availableBadge}>
                                            <Text style={styles.availableText}>
                                                {slot.remainingSlots} slots left
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.slotInfo}>
                                    <Text style={[
                                        styles.slotTime,
                                        slot.isFullyBooked && styles.textDisabled,
                                    ]}>
                                        ⏰ {slot.startTime} - {slot.endTime}
                                    </Text>
                                    <Text style={[
                                        styles.slotDetails,
                                        slot.isFullyBooked && styles.textDisabled,
                                    ]}>
                                        {slot.minutesPerPatient} min per patient • Next: #{slot.nextAppointmentNumber}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>No Available Slots</Text>
                        <Text style={styles.emptySubtitle}>
                            There are no available time slots at the moment. Please try again later.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Fixed Bottom Button */}
            {timeSlots.length > 0 && (
                <View style={styles.bottomContainer}>
                    <Button
                        title="Continue"
                        onPress={handleContinue}
                        disabled={!selectedSlot}
                    />
                </View>
            )}
        </View>
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
        paddingBottom: 100, // Space for bottom button
    },
    headerCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.sm,
    },
    doctorName: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    dispensaryName: {
        fontSize: theme.typography.base,
        color: theme.colors.textSecondary,
    },
    sectionTitle: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
    },
    slotCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderWidth: 2,
        borderColor: 'transparent',
        ...theme.shadows.sm,
    },
    slotCardSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight + '10',
    },
    slotCardDisabled: {
        opacity: 0.5,
    },
    slotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    slotDate: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
    },
    slotDay: {
        fontSize: theme.typography.sm,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    availableBadge: {
        backgroundColor: theme.colors.success + '20',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.md,
    },
    availableText: {
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.medium,
        color: theme.colors.success,
    },
    fullyBookedBadge: {
        backgroundColor: theme.colors.error + '20',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.md,
    },
    fullyBookedText: {
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.medium,
        color: theme.colors.error,
    },
    slotInfo: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray200,
        paddingTop: theme.spacing.sm,
    },
    slotTime: {
        fontSize: theme.typography.base,
        fontWeight: theme.typography.medium,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    slotDetails: {
        fontSize: theme.typography.sm,
        color: theme.colors.textSecondary,
    },
    textDisabled: {
        color: theme.colors.textDisabled,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
        marginTop: theme.spacing['3xl'],
    },
    emptyTitle: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.semiBold,
        color: theme.colors.textPrimary,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
        fontSize: theme.typography.base,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.white,
        padding: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray200,
        ...theme.shadows.lg,
    },
});

export default TimeSlotSelectionScreen;
