import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import theme from '../theme/theme';

const LoadingSpinner = ({ size = 'large', color = theme.colors.primary, style }) => {
    return (
        <View style={[styles.container, style]}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
});

export default LoadingSpinner;
