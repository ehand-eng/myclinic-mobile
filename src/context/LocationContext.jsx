import React, { createContext, useState, useContext } from 'react';
import {
    requestLocationPermission,
    checkLocationPermission,
    getCurrentLocation,
} from '../services/LocationService';

const LocationContext = createContext();

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within LocationProvider');
    }
    return context;
};

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const requestPermission = async () => {
        const result = await requestLocationPermission();
        setPermissionGranted(result.granted);
        return result;
    };

    const checkPermission = async () => {
        const result = await checkLocationPermission();
        setPermissionGranted(result.granted);
        return result;
    };

    const getLocation = async () => {
        setIsLoadingLocation(true);
        try {
            // First check permission
            const permResult = await checkLocationPermission();

            if (!permResult.granted) {
                // Request permission if not granted
                const requestResult = await requestLocationPermission();
                if (!requestResult.granted) {
                    setIsLoadingLocation(false);
                    return {
                        success: false,
                        error: 'Location permission denied',
                    };
                }
                setPermissionGranted(true);
            } else {
                setPermissionGranted(true);
            }

            // Get current location
            const result = await getCurrentLocation();

            if (result.success) {
                setLocation(result.coords);
            }

            setIsLoadingLocation(false);
            return result;
        } catch (error) {
            setIsLoadingLocation(false);
            return {
                success: false,
                error: error.message,
            };
        }
    };

    const clearLocation = () => {
        setLocation(null);
    };

    const value = {
        location,
        permissionGranted,
        isLoadingLocation,
        requestPermission,
        checkPermission,
        getLocation,
        clearLocation,
    };

    return (
        <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
    );
};
