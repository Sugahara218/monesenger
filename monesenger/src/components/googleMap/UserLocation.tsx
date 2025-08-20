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

// 1. 名前を 'use' で始める
export function useUserLocation() {
    const [location, setLocation] = useState<LocationState>({
        loading: true, // 初期状態はローディング
    });

    // useCallbackで関数をメモ化し、不要な再生成を防ぐ
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
                // console.error("Geolocation Error:", error); 
                setLocation(prev => ({
                    ...prev,
                    loading: false,
                    error: `位置情報の取得に失敗しました: ${error.message}`,
                }));
            },
            options,
        );
    }, []); // 依存配列が空なので、この関数は一度しか生成されない

    // 2. useEffectでコンポーネントマウント時に一度だけ実行
    useEffect(() => {
        getLocation();
    }, [getLocation]); // getLocationは不変なので、実質一度だけ実行

    // 3. location state と、手動で再取得するための getLocation 関数を返す
    return { location, getLocation };
}