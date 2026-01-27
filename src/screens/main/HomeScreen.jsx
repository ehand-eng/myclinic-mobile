import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { getDoctorsNearby } from '../../services/apiClient';
import Button from '../../components/Button';
import DoctorListItem from '../../components/DoctorListItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import theme from '../../theme/theme';

const HomeScreen = ({ navigation }) => {
    const [searchMode, setSearchMode] = useState('nearMe'); // 'nearMe' or 'manual'
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const { user, logout } = useAuth();
    const { location, getLocation, isLoadingLocation } = useLocation();

    useEffect(() => {
        if (searchMode === 'nearMe') {
            fetchNearbyDoctors();
        }
    }, [searchMode]);

    const fetchNearbyDoctors = async () => {
        setLoading(true);

        try {
            // Get location
            const locationResult = await getLocation();

            if (!locationResult.success) {
                Alert.alert(
                    'Location Permission Required',
                    'Please enable location services to find doctors near you. You can switch to manual search if you prefer.',
                    [
                        { text: 'Switch to Manual Search', onPress: () => setSearchMode('manual') },
                        { text: 'Try Again', onPress: () => fetchNearbyDoctors() },
                    ]
                );
                setLoading(false);
                return;
            }

            // Fetch nearby doctors
            const result = await getDoctorsNearby(
                locationResult.coords.latitude,
                locationResult.coords.longitude,
                10,
                20
            );

            if (result.success) {
                setDoctors(result.data.doctors || []);
            } else {
                Alert.alert('Error', result.error || 'Failed to fetch nearby doctors');
                setDoctors([]);
            }
        } catch (error) {
            console.error('Error fetching nearby doctors:', error);
            Alert.alert('Error', 'An error occurred while fetching doctors');
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        if (searchMode === 'nearMe') {
            await fetchNearbyDoctors();
        }
        setRefreshing(false);
    };

    const handleDoctorPress = (doctor) => {
        navigation.navigate('DoctorDetails', { doctor });
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: logout, style: 'destructive' },
            ]
        );
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
            </View>

            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );

    const renderToggle = () => (
        <View style={styles.toggleContainer}>
            <TouchableOpacity
                style={[
                    styles.toggleButton,
                    searchMode === 'nearMe' && styles.toggleButtonActive,
                ]}
                onPress={() => setSearchMode('nearMe')}
            >
                <Text
                    style={[
                        styles.toggleText,
                        searchMode === 'nearMe' && styles.toggleTextActive,
                    ]}
                >
                    Find Doctor Near Me
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.toggleButton,
                    searchMode === 'manual' && styles.toggleButtonActive,
                ]}
                onPress={() => setSearchMode('manual')}
            >
                <Text
                    style={[
                        styles.toggleText,
                        searchMode === 'manual' && styles.toggleTextActive,
                    ]}
                >
                    Search by My Own
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmptyState = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>
                    {searchMode === 'nearMe'
                        ? 'No doctors found nearby'
                        : 'Search functionality coming soon'}
                </Text>
                <Text style={styles.emptySubtitle}>
                    {searchMode === 'nearMe'
                        ? 'Try increasing the search radius or switch to manual search'
                        : 'Manual search will be available in the next update'}
                </Text>
                {searchMode === 'nearMe' && (
                    <Button
                        title="Retry"
                        onPress={fetchNearbyDoctors}
                        style={styles.retryButton}
                    />
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderToggle()}

            {loading && !refreshing ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={doctors}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <DoctorListItem
                            doctor={item}
                            onPress={() => handleDoctorPress(item)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[theme.colors.primary]}
                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundSecondary,
    },
    headerContainer: {
        backgroundColor: theme.colors.white,
        padding: theme.spacing.md,
        paddingTop: theme.spacing.xl,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    greetingContainer: {
        flex: 1,
    },
    greeting: {
        fontSize: theme.typography.sm,
        color: theme.colors.textSecondary,
    },
    userName: {
        fontSize: theme.typography.xl,
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
    },
    logoutButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    logoutText: {
        fontSize: theme.typography.sm,
        color: theme.colors.error,
        fontWeight: theme.typography.medium,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        margin: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xs,
        ...theme.shadows.sm,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    toggleText: {
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.medium,
        color: theme.colors.textSecondary,
    },
    toggleTextActive: {
        color: theme.colors.white,
    },
    listContent: {
        padding: theme.spacing.md,
        paddingTop: 0,
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
        marginBottom: theme.spacing.lg,
    },
    retryButton: {
        marginTop: theme.spacing.md,
        minWidth: 120,
    },
});

export default HomeScreen;
