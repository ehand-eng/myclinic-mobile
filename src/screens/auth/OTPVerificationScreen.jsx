import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import theme from '../../theme/theme';

const OTPVerificationScreen = ({ navigation, route }) => {
    const { mobile, userName } = route.params;
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(300); // 5 minutes
    const [remainingAttempts, setRemainingAttempts] = useState(3);
    const [canResend, setCanResend] = useState(false);

    const { requestOTP, verifyUserOTP, resendUserOTP } = useAuth();
    const timerRef = useRef(null);

    useEffect(() => {
        // Send OTP when component mounts
        sendInitialOTP();

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Start countdown timer
        if (timer > 0) {
            timerRef.current = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [timer]);

    const sendInitialOTP = async () => {
        const result = await requestOTP(mobile);

        if (result.success) {
            setTimer(result.data.expiresIn || 300);
            setRemainingAttempts(result.data.remainingAttempts || 3);
        } else {
            Alert.alert('Error', result.error || 'Failed to send OTP');
        }
    };

    const handleVerify = async () => {
        // Clear previous errors
        setOtpError('');

        // Validate OTP
        if (!otp.trim()) {
            setOtpError('Please enter the OTP');
            return;
        }

        if (otp.length !== 6 && otp.length !== 5) {
            setOtpError('OTP must be 5 or 6 digits');
            return;
        }

        setLoading(true);

        try {
            const result = await verifyUserOTP(mobile, otp);

            if (result.success && result.data.valid) {
                // OTP verified successfully - navigation handled by AuthContext
                // User will be redirected to home screen automatically
            } else {
                setOtpError(result.data?.message || result.error || 'Invalid OTP');
                setOtp(''); // Clear OTP input on error
            }
        } catch (err) {
            setOtpError('An error occurred. Please try again.');
            console.error('Error verifying OTP:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (remainingAttempts <= 0) {
            Alert.alert('Limit Reached', 'You have reached the maximum number of OTP requests.');
            return;
        }

        setResendLoading(true);
        setOtpError('');

        try {
            const result = await resendUserOTP(mobile);

            if (result.success) {
                setTimer(result.data.expiresIn || 300);
                setRemainingAttempts(result.data.remainingAttempts || 3);
                setCanResend(false);
                setOtp(''); // Clear OTP input
                Alert.alert('Success', 'OTP has been resent to your mobile number');
            } else {
                Alert.alert('Error', result.error || 'Failed to resend OTP');
            }
        } catch (err) {
            Alert.alert('Error', 'An error occurred. Please try again.');
            console.error('Error resending OTP:', err);
        } finally {
            setResendLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Verify OTP</Text>
                        <Text style={styles.subtitle}>
                            {userName ? `Welcome back, ${userName}!` : 'Enter the OTP sent to'}
                        </Text>
                        <Text style={styles.mobile}>{mobile}</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Enter OTP"
                            value={otp}
                            onChangeText={(text) => {
                                setOtp(text.replace(/[^0-9]/g, ''));
                                setOtpError('');
                            }}
                            placeholder="000000"
                            keyboardType="number-pad"
                            autoCapitalize="none"
                            error={otpError}
                            maxLength={6}
                        />

                        {timer > 0 && (
                            <Text style={styles.timer}>
                                OTP expires in: {formatTime(timer)}
                            </Text>
                        )}

                        {remainingAttempts > 0 && (
                            <Text style={styles.attempts}>
                                Remaining attempts: {remainingAttempts}
                            </Text>
                        )}

                        <Button
                            title="Verify OTP"
                            onPress={handleVerify}
                            loading={loading}
                            disabled={loading || resendLoading}
                            style={styles.button}
                        />

                        {canResend && remainingAttempts > 0 && (
                            <TouchableOpacity
                                onPress={handleResend}
                                disabled={resendLoading}
                                style={styles.resendContainer}
                            >
                                <Text style={styles.resendText}>
                                    {resendLoading ? 'Resending...' : 'Resend OTP'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <Button
                            title="Back"
                            onPress={() => navigation.goBack()}
                            variant="outline"
                            disabled={loading || resendLoading}
                            style={styles.backButton}
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: theme.spacing.xl,
        justifyContent: 'center',
    },
    header: {
        marginBottom: theme.spacing['3xl'],
        alignItems: 'center',
    },
    title: {
        fontSize: theme.typography['3xl'],
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: theme.typography.base,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
    },
    mobile: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.semiBold,
        color: theme.colors.primary,
        textAlign: 'center',
    },
    form: {
        marginBottom: theme.spacing.xl,
    },
    timer: {
        fontSize: theme.typography.sm,
        color: theme.colors.textSecondary,
        marginTop: -theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
    },
    attempts: {
        fontSize: theme.typography.sm,
        color: theme.colors.warning,
        marginBottom: theme.spacing.lg,
        textAlign: 'center',
    },
    button: {
        marginTop: theme.spacing.md,
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: theme.spacing.lg,
        padding: theme.spacing.sm,
    },
    resendText: {
        fontSize: theme.typography.base,
        color: theme.colors.primary,
        fontWeight: theme.typography.semiBold,
    },
    backButton: {
        marginTop: theme.spacing.md,
    },
});

export default OTPVerificationScreen;
