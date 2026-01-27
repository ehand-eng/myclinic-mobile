import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkUserByMobile, registerUser, sendOTP, verifyOTP, resendOTP } from '../services/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from storage
    useEffect(() => {
        loadAuthState();
    }, []);

    const loadAuthState = async () => {
        try {
            const [storedToken, storedUser] = await Promise.all([
                AsyncStorage.getItem('authToken'),
                AsyncStorage.getItem('user'),
            ]);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkUser = async (mobile) => {
        try {
            const result = await checkUserByMobile(mobile);
            return result;
        } catch (error) {
            console.error('Error checking user:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const result = await registerUser(userData);
            return result;
        } catch (error) {
            console.error('Error registering user:', error);
            return { success: false, error: error.message };
        }
    };

    const requestOTP = async (mobile) => {
        try {
            const result = await sendOTP(mobile);
            return result;
        } catch (error) {
            console.error('Error sending OTP:', error);
            return { success: false, error: error.message };
        }
    };

    const verifyUserOTP = async (mobile, otp) => {
        try {
            const result = await verifyOTP(mobile, otp);

            if (result.success && result.data.valid) {
                // Get user details after successful OTP verification
                const userResult = await checkUserByMobile(mobile);

                if (userResult.success && userResult.data) {
                    // In a real app, you'd get a JWT token from the backend
                    // For now, we'll create a simple token
                    const authToken = `token-${Date.now()}`;

                    await AsyncStorage.setItem('authToken', authToken);
                    await AsyncStorage.setItem('user', JSON.stringify(userResult.data));

                    setToken(authToken);
                    setUser(userResult.data);
                    setIsAuthenticated(true);

                    return { success: true, data: userResult.data };
                }
            }

            return result;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            return { success: false, error: error.message };
        }
    };

    const resendUserOTP = async (mobile) => {
        try {
            const result = await resendOTP(mobile);
            return result;
        } catch (error) {
            console.error('Error resending OTP:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const value = {
        user,
        token,
        isAuthenticated,
        isLoading,
        checkUser,
        register,
        requestOTP,
        verifyUserOTP,
        resendUserOTP,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
