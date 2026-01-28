
import AsyncStorage from '@react-native-async-storage/async-storage';

const getFavoritesKey = (mobile) => `favorites_${mobile}`;

export const getFavorites = async (mobile) => {
    try {
        const jsonValue = await AsyncStorage.getItem(getFavoritesKey(mobile));
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Error reading favorites', e);
        return [];
    }
};

export const addFavorite = async (mobile, doctor, dispensary) => {
    try {
        const favorites = await getFavorites(mobile);
        const newFavorite = {
            id: `${doctor._id}_${dispensary._id}`, // Unique ID
            doctor,
            dispensary,
            addedAt: new Date().toISOString()
        };

        // Check if already exists
        const exists = favorites.some(fav => fav.id === newFavorite.id);
        if (exists) return { success: false, message: 'Already in favorites' };

        const updatedFavorites = [newFavorite, ...favorites];
        await AsyncStorage.setItem(getFavoritesKey(mobile), JSON.stringify(updatedFavorites));
        return { success: true };
    } catch (e) {
        console.error('Error adding favorite', e);
        return { success: false, message: 'Failed to add favorite' };
    }
};

export const removeFavorite = async (mobile, favoriteId) => {
    try {
        const favorites = await getFavorites(mobile);
        const updatedFavorites = favorites.filter(fav => fav.id !== favoriteId);
        await AsyncStorage.setItem(getFavoritesKey(mobile), JSON.stringify(updatedFavorites));
        return { success: true };
    } catch (e) {
        console.error('Error removing favorite', e);
        return { success: false, message: 'Failed to remove favorite' };
    }
};

export const isFavorite = async (mobile, doctorId, dispensaryId) => {
    try {
        const favorites = await getFavorites(mobile);
        const id = `${doctorId}_${dispensaryId}`;
        return favorites.some(fav => fav.id === id);
    } catch (e) {
        return false;
    }
};
