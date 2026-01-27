import * as Location from 'expo-location';

/**
 * Request location permissions
 */
export const requestLocationPermission = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return {
            granted: status === 'granted',
            status,
        };
    } catch (error) {
        console.error('Error requesting location permission:', error);
        return {
            granted: false,
            error: error.message,
        };
    }
};

/**
 * Check if location permission is granted
 */
export const checkLocationPermission = async () => {
    try {
        const { status } = await Location.getForegroundPermissionsAsync();
        return {
            granted: status === 'granted',
            status,
        };
    } catch (error) {
        console.error('Error checking location permission:', error);
        return {
            granted: false,
            error: error.message,
        };
    }
};

/**
 * Get current location
 */
export const getCurrentLocation = async () => {
    try {
        const { status } = await Location.getForegroundPermissionsAsync();

        if (status !== 'granted') {
            return {
                success: false,
                error: 'Location permission not granted',
            };
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        return {
            success: true,
            coords: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            },
        };
    } catch (error) {
        console.error('Error getting current location:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

export default {
    requestLocationPermission,
    checkLocationPermission,
    getCurrentLocation,
};
