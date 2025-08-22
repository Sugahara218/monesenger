"use client"

import { useState, useEffect, useCallback } from 'react'

interface LocationState {
    lat?: number;
    lng?: number;
    error?: string;
    loading: boolean;
}

const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};

export function useUserLocation() {
    const [location, setLocation] = useState<LocationState>({
        loading: true, 
    });

    const getLocation = useCallback(() => {
        setLocation(prev => ({ ...prev, loading: true }));
        
        if (!navigator.geolocation) {
            setLocation(prev => ({
                ...prev,
                loading: false,
                error: 'お使いのブラウザは位置情報取得に対応していません。',
            }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({
                    lat: latitude,
                    lng: longitude,
                    loading: false,
                });
            },
            (error) => {
                setLocation(prev => ({
                    ...prev,
                    loading: false,
                    error: `位置情報の取得に失敗しました: ${error.message}`,
                }));
            },
            options,
        );
    }, []); 

    useEffect(() => {
        getLocation();
    }, [getLocation]);

    return { location, getLocation };
}