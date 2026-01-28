import axios from 'axios';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL || 'http://192.168.8.193:5001',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            // Server responded with error
            console.error('API Error:', error.response.data);

            // Handle 401 Unauthorized
            if (error.response.status === 401) {
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('user');
                // You might want to navigate to login screen here
            }
        } else if (error.request) {
            // Request made but no response
            console.error('Network Error:', error.message);
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// ==================== Auth APIs ====================

/**
 * Check if user exists by mobile number
 */
export const checkUserByMobile = async (mobile) => {
    try {
        const response = await apiClient.get(`/api/users/mobile/${mobile}`);
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { success: true, data: null }; // User not found
        }
        return { success: false, error: error.message };
    }
};

/**
 * Register new user
 */
export const registerUser = async (userData) => {
    try {
        const payload = {
            name: userData.name,
            email: userData.email || `${userData.mobile}@temp.com`,
            password: userData.password || 'temp123',
            mobile: userData.mobile,
            role: null,
            dispensaryIds: [],
            isActive: true,
            lastLogin: null,
            nationality: 'sri_lanka',
        };
        const response = await apiClient.post('/api/mobile/auth/signup-mobile', payload);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Send OTP to mobile number
 */
export const sendOTP = async (identifier) => {
    try {
        const response = await apiClient.post('/api/util/send-otp', {
            type: 'mobile',
            identifier,
            purpose: '',
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (identifier, otp) => {
    try {
        const response = await apiClient.post('/api/util/verify-otp', {
            identifier,
            otp,
        });
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Resend OTP
 */
export const resendOTP = async (identifier) => {
    try {
        const response = await apiClient.post('/api/util/resend-otp', {
            type: 'mobile',
            identifier,
        });
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

// ==================== Doctor & Location APIs ====================

/**
 * Get all doctors (for manual search)
 */
export const getAllDoctors = async () => {
    try {
        const response = await apiClient.get('/api/doctors');
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Get all dispensaries (for calculating distances in manual search)
 */
export const getAllDispensaries = async () => {
    try {
        const response = await apiClient.get('/api/dispensaries');
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Get doctors nearby based on location
 */
export const getDoctorsNearby = async (latitude, longitude, limit = 5, maxDistance = 20) => {
    try {
        const response = await apiClient.get('/api/location/doctors-nearby', {
            params: { latitude, longitude, limit, maxDistance },
        });
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Get next available time slots for doctor at dispensary
 */
export const getNextAvailableTimeSlots = async (doctorId, dispensaryId) => {
    try {
        const response = await apiClient.get(`/api/timeslots/next-available/${doctorId}/${dispensaryId}`);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Get doctor-dispensary fees
 */
export const getDoctorDispensaryFees = async (doctorId, dispensaryId) => {
    try {
        const response = await apiClient.get(`/api/doctor-dispensaries/fees/${doctorId}/${dispensaryId}`);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

// ==================== Booking APIs ====================

/**
 * Create a new booking
 */
export const createBooking = async (bookingData) => {
    try {
        const response = await apiClient.post('/api/bookings', bookingData);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Get booking summary
 */
export const getBookingSummary = async (transactionId) => {
    try {
        const response = await apiClient.get(`/api/bookings/summary/${transactionId}`);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

export default apiClient;
