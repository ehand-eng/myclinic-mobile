import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Auth Screens
import MobileNumberInputScreen from '../screens/auth/MobileNumberInputScreen';
import UserRegistrationScreen from '../screens/auth/UserRegistrationScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import DoctorDetailsScreen from '../screens/main/DoctorDetailsScreen';
import TimeSlotSelectionScreen from '../screens/main/TimeSlotSelectionScreen';
import BookingFormScreen from '../screens/main/BookingFormScreen';
import BookingSummaryScreen from '../screens/main/BookingSummaryScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#2563EB',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="MobileNumberInput"
                component={MobileNumberInputScreen}
                options={{ title: 'Login', headerShown: false }}
            />
            <Stack.Screen
                name="UserRegistration"
                component={UserRegistrationScreen}
                options={{ title: 'Register' }}
            />
            <Stack.Screen
                name="OTPVerification"
                component={OTPVerificationScreen}
                options={{ title: 'Verify OTP' }}
            />
        </Stack.Navigator>
    );
};

const MainNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#2563EB',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'MyClinic11' }}
            />
            <Stack.Screen
                name="DoctorDetails"
                component={DoctorDetailsScreen}
                options={{ title: 'Doctor Details' }}
            />
            <Stack.Screen
                name="TimeSlotSelection"
                component={TimeSlotSelectionScreen}
                options={{ title: 'Select Time Slot' }}
            />
            <Stack.Screen
                name="BookingForm"
                component={BookingFormScreen}
                options={{ title: 'Confirm Booking' }}
            />
            <Stack.Screen
                name="BookingSummary"
                component={BookingSummaryScreen}
                options={{
                    title: 'Booking Confirmed',
                    headerLeft: null, // Prevent going back
                    gestureEnabled: false,
                }}
            />
        </Stack.Navigator>
    );
};

const AppNavigator = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default AppNavigator;
