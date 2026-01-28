import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    TextInput,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { getDoctorsNearby, getAllDoctors, getAllDispensaries } from '../../services/apiClient';
import { getFavorites } from '../../services/favoriteService';
import Button from '../../components/Button';
import DoctorListItem from '../../components/DoctorListItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import theme from '../../theme/theme';
import { calculateDistance } from '../../utils/geoUtils';


const HomeScreen = ({ navigation }) => {
    const [searchMode, setSearchMode] = useState('nearMe'); // 'nearMe' or 'manual'

    // Near Me State
    const [doctorsNearMe, setDoctorsNearMe] = useState([]);
    const [loadingNearMe, setLoadingNearMe] = useState(false);

    // Manual Search State
    const [searchText, setSearchText] = useState('');
    const [manualDoctors, setManualDoctors] = useState([]);
    const [loadingManual, setLoadingManual] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Cache for manual search
    const allDoctorsRef = useRef([]);
    const allDispensariesRef = useRef([]);

    const [refreshing, setRefreshing] = useState(false);

    const { user, logout } = useAuth();
    const { location, getLocation } = useLocation();

    // Initial load for "Near Me"
    useEffect(() => {
        if (searchMode === 'nearMe') {
            fetchNearbyDoctors();
        }
    }, [searchMode]);

    // Handle Manual Search Debounce
    useEffect(() => {
        if (searchMode === 'manual') {
            const delayDebounceFn = setTimeout(() => {
                if (searchText.length >= 2) {
                    performManualSearch();
                } else {
                    setManualDoctors([]);
                }
            }, 300);

            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchText, searchMode, location]);

    const fetchNearbyDoctors = async () => {
        setLoadingNearMe(true);
        try {
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
                setLoadingNearMe(false);
                return;
            }

            const result = await getDoctorsNearby(
                locationResult.coords.latitude,
                locationResult.coords.longitude,
                10,
                20
            );

            if (result.success) {
                setDoctorsNearMe(result.data.doctors || []);
            } else {
                setDoctorsNearMe([]);
                if (result.error) Alert.alert('Error', result.error);
            }
        } catch (error) {
            console.error('Error fetching nearby doctors:', error);
            setDoctorsNearMe([]);
        } finally {
            setLoadingNearMe(false);
        }
    };

    const performManualSearch = async () => {
        setLoadingManual(true);
        try {
            // 1. Fetch data if not loaded
            if (!isDataLoaded) {
                const [doctorsRes, dispensariesRes] = await Promise.all([
                    getAllDoctors(),
                    getAllDispensaries()
                ]);

                if (doctorsRes.success && dispensariesRes.success) {
                    allDoctorsRef.current = doctorsRes.data;
                    allDispensariesRef.current = dispensariesRes.data;
                    setIsDataLoaded(true);
                } else {
                    Alert.alert('Error', 'Failed to load data for search.');
                    setLoadingManual(false);
                    return;
                }
            }

            // 2. Filter Doctors
            const query = searchText.toLowerCase();
            const filteredDoctors = allDoctorsRef.current.filter(doc =>
                doc.name.toLowerCase().includes(query)
            );

            // 3. Enrich with Location Data
            const enrichedDoctors = filteredDoctors.map(doc => {
                const availableAt = [];

                // Map doctor's dispensaries to actual dispensary objects
                if (doc.dispensaries && doc.dispensaries.length > 0) {
                    doc.dispensaries.forEach(docDisp => {
                        // docDisp might be an ID or an object depending on population
                        const dispId = typeof docDisp === 'object' ? docDisp._id : docDisp;

                        const fullDisp = allDispensariesRef.current.find(d => d._id === dispId);

                        if (fullDisp) {
                            let dist = null;
                            if (location && location.coords && fullDisp.location) {
                                dist = calculateDistance(
                                    location.coords.latitude,
                                    location.coords.longitude,
                                    fullDisp.location.latitude,
                                    fullDisp.location.longitude
                                );
                            }

                            availableAt.push({
                                dispensaryId: fullDisp._id,
                                dispensaryName: fullDisp.name,
                                dispensaryAddress: fullDisp.address,
                                distance: dist,
                                location: fullDisp.location,
                                fees: null // Fees are not available in this view
                            });
                        }
                    });
                }

                // Sort dispensaries by distance if available
                if (location && location.coords) {
                    availableAt.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
                }

                return {
                    ...doc,
                    availableAt,
                    nearestDistance: availableAt.length > 0 ? availableAt[0].distance : null
                };
            });

            // 4. Sort Doctors
            // If location is enabled, prioritize nearby doctors
            if (location && location.coords) {
                enrichedDoctors.sort((a, b) => {
                    const distA = a.nearestDistance !== null ? a.nearestDistance : 99999;
                    const distB = b.nearestDistance !== null ? b.nearestDistance : 99999;
                    return distA - distB;
                });
            }

            setManualDoctors(enrichedDoctors);

        } catch (error) {
            console.error('Error in manual search:', error);
            Alert.alert('Error', 'An error occurred while searching');
        } finally {
            setLoadingManual(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        if (searchMode === 'nearMe') {
            await fetchNearbyDoctors();
        } else {
            // Reload manual data if currently searching
            setIsDataLoaded(false);
            if (searchText.length >= 2) {
                await performManualSearch();
            }
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

    // Favorites Logic
    const [favorites, setFavorites] = useState([]);
    const [loadingFavorites, setLoadingFavorites] = useState(false);

    const fetchFavorites = useCallback(async () => {
        if (user?.mobile) {
            setLoadingFavorites(true);
            const favs = await getFavorites(user.mobile);
            // Filter out broken favorites
            const validFavs = favs.filter(f => {
                const [kDoc, kDisp] = f.id ? f.id.split('_') : [];
                const hasDocId = f.doctor?._id || f.doctor?.doctorId || kDoc;
                const hasDispId = f.dispensary?._id || f.dispensary?.dispensaryId || kDisp;
                return hasDocId && hasDispId && hasDocId !== 'undefined' && hasDispId !== 'undefined';
            });
            setFavorites(validFavs);
            setLoadingFavorites(false);
        }
    }, [user]);

    // Fetch favorites when screen focuses
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchFavorites();
        });
        return unsubscribe;
    }, [navigation, fetchFavorites]);

    const handleFavoritePress = (fav) => {
        // Attempt to recover IDs from the composite key if missing in objects
        // fav.id format is "doctorId_dispensaryId"
        const [idFromKeyDoc, idFromKeyDisp] = fav.id ? fav.id.split('_') : [null, null];

        const rawDisp = fav.dispensary;
        const targetDispId = rawDisp._id || rawDisp.dispensaryId || idFromKeyDisp;
        const targetDocId = fav.doctor._id || fav.doctor.doctorId || idFromKeyDoc;

        // Ensure we preserve the display info
        const displayDispensary = {
            ...rawDisp,
            dispensaryName: rawDisp.dispensaryName || rawDisp.name,
            dispensaryAddress: rawDisp.dispensaryAddress || rawDisp.address,
        };

        const displayDoctor = {
            ...fav.doctor,
            _id: targetDocId // Ensure ID is attached
        };

        console.log('Navigating to TimeSlot from Fav:', {
            docId: targetDocId,
            dispId: targetDispId
        });

        navigation.navigate('TimeSlotSelection', {
            doctor: displayDoctor,
            doctorId: targetDocId, // Pass explicit ID
            dispensary: displayDispensary,
            dispensaryId: targetDispId // Pass explicit ID
        });
    };

    const renderFavorites = () => {
        if (searchMode !== 'nearMe' || favorites.length === 0) return null;

        return (
            <View style={styles.favoritesSection}>
                <Text style={styles.sectionTitle}>Your Favorites</Text>
                <FlatList
                    data={favorites}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.favoriteCard}
                            onPress={() => handleFavoritePress(item)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.favIconContainer}>
                                <Text style={styles.favIcon}>❤️</Text>
                            </View>
                            <Text style={styles.favDoctorName} numberOfLines={1}>
                                {item.doctor.name}
                            </Text>
                            <Text style={styles.favDispensaryName} numberOfLines={1}>
                                {item.dispensary.dispensaryName || item.dispensary.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.favoritesList}
                />
            </View>
        );
    };

    const renderToggle = () => (
        <View style={styles.toggleContainer}>
            <TouchableOpacity
                style={[
                    styles.toggleButton,
                    searchMode === 'nearMe' && styles.toggleButtonActive,
                ]}
                onPress={() => {
                    setSearchMode('nearMe');
                    setSearchText('');
                    Keyboard.dismiss();
                }}
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

    const renderSearchBar = () => {
        if (searchMode !== 'manual') return null;

        return (
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Type doctor's name (min 2 chars)..."
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {loadingManual && (
                    <ActivityIndicator
                        size="small"
                        color={theme.colors.primary}
                        style={styles.searchLoader}
                    />
                )}
            </View>
        );
    };

    const renderEmptyState = () => {
        if (loadingNearMe || loadingManual) return null;

        if (searchMode === 'manual' && searchText.length < 2) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptySubtitle}>
                        Start typing to search for doctors...
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>
                    No doctors found
                </Text>
                <Text style={styles.emptySubtitle}>
                    {searchMode === 'nearMe'
                        ? 'Try increasing the search radius or switch to manual search'
                        : 'No doctors found matching your search.'}
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

    const currentData = searchMode === 'nearMe' ? doctorsNearMe : manualDoctors;
    const isLoading = searchMode === 'nearMe' ? loadingNearMe : false; // Manual loading is handled in search bar

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderFavorites()}
            {renderToggle()}
            {renderSearchBar()}

            {isLoading && !refreshing ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={currentData}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <DoctorListItem
                            doctor={item}
                            onPress={() => handleDoctorPress(item)}
                            showDispensaryInfo={false}
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
                    keyboardShouldPersistTaps="handled"
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
    searchContainer: {
        margin: theme.spacing.md,
        marginTop: 0,
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.sm,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
    },
    searchInput: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        fontSize: theme.typography.base,
        color: theme.colors.textPrimary,
    },
    searchLoader: {
        marginLeft: theme.spacing.sm,
    },
    listContent: {
        padding: theme.spacing.md,
        paddingTop: 0,
        flexGrow: 1,
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
    favoritesSection: {
        marginTop: theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
    },
    sectionTitle: {
        fontSize: theme.typography.lg,
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
        marginLeft: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    favoritesList: {
        paddingHorizontal: theme.spacing.md,
    },
    favoriteCard: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginRight: theme.spacing.md,
        width: 140,
        ...theme.shadows.sm,
        alignItems: 'center',
    },
    favIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.error + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    favIcon: {
        fontSize: 20,
        color: theme.colors.error,
    },
    favDoctorName: {
        fontSize: theme.typography.sm,
        fontWeight: theme.typography.bold,
        color: theme.colors.textPrimary,
        marginBottom: 2,
        textAlign: 'center',
    },
    favDispensaryName: {
        fontSize: theme.typography.xs,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});

export default HomeScreen;
