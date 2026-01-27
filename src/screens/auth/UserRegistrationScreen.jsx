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

const UserRegistrationScreen = ({ navigation, route }) => {
    const { mobile } = route.params;
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [nameError, setNameError] = useState('');

    const { register } = useAuth();

    const handleRegister = async () => {
        // Clear previous errors
        setNameError('');

        // Validate name
        if (!name.trim()) {
            setNameError('Please enter your name');
            return;
        }

        if (name.trim().length < 2) {
            setNameError('Name must be at least 2 characters');
            return;
        }

        setLoading(true);

        try {
            const result = await register({
                name: name.trim(),
                mobile,
            });

            if (result.success) {
                Alert.alert(
                    'Registration Successful',
                    'Your account has been created. Please login to continue.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Navigate back to mobile number input for login
                                navigation.navigate('MobileNumberInput');
                            },
                        },
                    ]
                );
            } else {
                Alert.alert('Registration Failed', result.error || 'Please try again');
            }
        } catch (err) {
            Alert.alert('Error', 'An error occurred. Please try again.');
            console.error('Error registering user:', err);
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
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>
                            We need a few details to set up your account
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Full Name"
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                setNameError('');
                            }}
                            placeholder="Enter your full name"
                            autoCapitalize="words"
                            error={nameError}
                        />

                        <Input
                            label="Mobile Number"
                            value={mobile}
                            editable={false}
                            style={styles.disabledInput}
                        />

                        <Button
                            title="Register"
                            onPress={handleRegister}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                        />

                        <Button
                            title="Back to Login"
                            onPress={() => navigation.goBack()}
                            variant="outline"
                            disabled={loading}
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
    },
    form: {
        marginBottom: theme.spacing.xl,
    },
    disabledInput: {
        marginBottom: theme.spacing.xl,
    },
    button: {
        marginTop: theme.spacing.md,
    },
    backButton: {
        marginTop: theme.spacing.md,
    },
});

export default UserRegistrationScreen;
