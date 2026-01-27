import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
} from 'react-native';
import theme from '../theme/theme';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    editable = true,
    multiline = false,
    numberOfLines = 1,
    maxLength,
    style,
    inputStyle,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                    error && styles.inputContainerError,
                    !editable && styles.inputContainerDisabled,
                ]}
            >
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.gray400}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={editable}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    maxLength={maxLength}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={[styles.input, inputStyle]}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.medium,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: theme.colors.gray300,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.white,
        paddingHorizontal: theme.spacing.md,
    },
    inputContainerFocused: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    inputContainerError: {
        borderColor: theme.colors.error,
    },
    inputContainerDisabled: {
        backgroundColor: theme.colors.gray100,
    },
    input: {
        fontSize: theme.typography.base,
        color: theme.colors.textPrimary,
        paddingVertical: theme.spacing.md,
        minHeight: 48,
    },
    errorText: {
        fontSize: theme.typography.xs,
        color: theme.colors.error,
        marginTop: theme.spacing.xs,
    },
});

export default Input;
