import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import theme from '../../theme/theme';
import { validateSriLankanMobile, normalizeMobileNumber } from '../../utils/validation';

const MobileNumberInputScreen = ({ navigation }) => {
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { checkUser } = useAuth();

    const handleContinue = async () => {
        // Clear previous errors
        setError('');

        // Validate mobile number
        if (!mobile.trim()) {
            setError('Please enter your mobile number');
            return;
        }

        if (!validateSriLankanMobile(mobile)) {
            setError('Please enter a valid Sri Lankan mobile number');
            return;
        }

        setLoading(true);

        try {
            // Normalize mobile number
            const normalizedMobile = normalizeMobileNumber(mobile);

            // Check if user exists
            const result = await checkUser(normalizedMobile);

            if (result.success) {
                if (result.data) {
                    // User exists - navigate to OTP screen
                    navigation.navigate('OTPVerification', {
                        mobile: normalizedMobile,
                        userName: result.data.name,
                    });
                } else {
                    // User doesn't exist - navigate to registration
                    navigation.navigate('UserRegistration', {
                        mobile: normalizedMobile,
                    });
                }
            } else {
                setError(result.error || 'Failed to verify mobile number');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Error checking user:', err);
        } finally {
            setLoading(false);
        }
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
                        <Text style={styles.title}>Welcome to MyClinic</Text>
                        <Text style={styles.subtitle}>
                            Enter your mobile number to continue
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Mobile Number"
                            value={mobile}
                            onChangeText={(text) => {
                                setMobile(text);
                                setError('');
                            }}
                            placeholder="0762199100"
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                            error={error}
                            maxLength={15}
                        />

                        <Text style={styles.hint}>
                            We support formats: +94762199100, 762199100, or 0762199100
                        </Text>

                        <Button
                            title="Continue"
                            onPress={handleContinue}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </Text>
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
    },
    form: {
        marginBottom: theme.spacing.xl,
    },
    hint: {
        fontSize: theme.typography.xs,
        color: theme.colors.textSecondary,
        marginTop: -theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    button: {
        marginTop: theme.spacing.md,
    },
    footer: {
        marginTop: theme.spacing.xl,
    },
    footerText: {
        fontSize: theme.typography.xs,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: theme.typography.relaxed * theme.typography.xs,
    },
});

export default MobileNumberInputScreen;
