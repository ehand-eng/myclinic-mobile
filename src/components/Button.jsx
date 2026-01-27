import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    View,
} from 'react-native';
import theme from '../theme/theme';

const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    style,
    textStyle,
}) => {
    const getButtonStyle = () => {
        const styles = [buttonStyles.base];

        // Variant styles
        if (variant === 'primary') {
            styles.push(buttonStyles.primary);
        } else if (variant === 'secondary') {
            styles.push(buttonStyles.secondary);
        } else if (variant === 'outline') {
            styles.push(buttonStyles.outline);
        }

        // Size styles
        if (size === 'small') {
            styles.push(buttonStyles.small);
        } else if (size === 'large') {
            styles.push(buttonStyles.large);
        } else {
            styles.push(buttonStyles.medium);
        }

        // Disabled style
        if (disabled || loading) {
            styles.push(buttonStyles.disabled);
        }

        return styles;
    };

    const getTextStyle = () => {
        const styles = [buttonStyles.text];

        // Variant text colors
        if (variant === 'primary') {
            styles.push(buttonStyles.textPrimary);
        } else if (variant === 'secondary') {
            styles.push(buttonStyles.textSecondary);
        } else if (variant === 'outline') {
            styles.push(buttonStyles.textOutline);
        }

        // Size text styles
        if (size === 'small') {
            styles.push(buttonStyles.textSmall);
        } else if (size === 'large') {
            styles.push(buttonStyles.textLarge);
        }

        return styles;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[...getButtonStyle(), style]}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' ? theme.colors.primary : theme.colors.white}
                    size="small"
                />
            ) : (
                <View style={buttonStyles.content}>
                    {icon && <View style={buttonStyles.icon}>{icon}</View>}
                    <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const buttonStyles = StyleSheet.create({
    base: {
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        ...theme.shadows.sm,
    },
    primary: {
        backgroundColor: theme.colors.primary,
    },
    secondary: {
        backgroundColor: theme.colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    small: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        minHeight: 36,
    },
    medium: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        minHeight: 48,
    },
    large: {
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.xl,
        minHeight: 56,
    },
    disabled: {
        opacity: 0.5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: theme.spacing.sm,
    },
    text: {
        fontWeight: theme.typography.semiBold,
        textAlign: 'center',
    },
    textPrimary: {
        color: theme.colors.white,
        fontSize: theme.typography.base,
    },
    textSecondary: {
        color: theme.colors.white,
        fontSize: theme.typography.base,
    },
    textOutline: {
        color: theme.colors.primary,
        fontSize: theme.typography.base,
    },
    textSmall: {
        fontSize: theme.typography.sm,
    },
    textLarge: {
        fontSize: theme.typography.lg,
    },
});

export default Button;
