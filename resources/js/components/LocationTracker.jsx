import React, { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const LocationTracker = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        let lastUpdate = 0;
        let lastCoords = { lat: 0, lng: 0 };
        const UPDATE_INTERVAL = 20000; // 20 detik
        const MIN_DISTANCE = 0.00005; // Sekitar 5-10 meter

        const sendLocation = async (lat, lng) => {
            try {
                await axios.post('/api/profile/location', {
                    latitude: lat,
                    longitude: lng
                });
                console.log('Location updated successfully:', lat, lng);
            } catch (err) {
                console.error('Failed to update location', err);
            }
        };

        if ("geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const now = Date.now();
                    
                    // Hitung perbedaan waktu dan jarak
                    const timeDiff = now - lastUpdate;
                    const distDiff = Math.sqrt(
                        Math.pow(latitude - lastCoords.lat, 2) + 
                        Math.pow(longitude - lastCoords.lng, 2)
                    );

                    // Kirim jika sudah 20 detik ATAU pindah lebih dari 5 meter
                    if (timeDiff >= UPDATE_INTERVAL || distDiff >= MIN_DISTANCE) {
                        sendLocation(latitude, longitude);
                        lastUpdate = now;
                        lastCoords = { lat: latitude, lng: longitude };
                    }
                },
                (error) => {
                    console.warn('Geolocation error:', error.message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0
                }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [user]);

    return null; 
};

export default LocationTracker;
