import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system';

const SoundContext = createContext()

export const SoundProvider = ({children}) => {
    const sounds = useRef([])
    const [isPlaying, setIsPlaying] = useState({})
    const [audioData, setAudioData] = useState({})
    const [positionMillis, setPositionMillis] = useState({});
    const [pausedPosition, setPausedPosition] = useState({});
    const currentIndex = useRef(null); 

    const playAudio = async (uri, index) => {
        if (sounds.current[index]) {
            await sounds.current[index].unloadAsync();
        }
        try {
            const { sound } = await Audio.Sound.createAsync({ uri: uri }, { shouldPlay: false }, status => onPlaybackStatusUpdate(status, index));
            sounds.current[index] = sound;
            setIsPlaying(prev => ({ ...prev, [index]: true }));
            await sound.playFromPositionAsync(pausedPosition[index] || 0);
            console.log(`Playing audio at index ${index}, starting from position ${pausedPosition[index] || 0}`);
            currentIndex.current = index; // Обновляем текущий индекс
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    const pauseAudio = async (index) => {
        if (sounds.current[index]) {
            await sounds.current[index].pauseAsync();
            const status = await sounds.current[index].getStatusAsync();
            setPausedPosition(prev => ({ ...prev, [index]: status.positionMillis }));
            setIsPlaying(prev => ({ ...prev, [index]: false }));
            console.log(`Paused audio at index ${index}, position saved: ${status.positionMillis}`);
            currentIndex.current = index; // Обновляем текущий индекс
        }
    };

    useEffect(() => {
        const interval = setInterval(async () => {
            const index = currentIndex.current;
            if (isPlaying[index]) {
                const status = await sounds.current[index].getStatusAsync();
                onPlaybackStatusUpdate(status, index);
                setPositionMillis((prev => ({ ...prev, [index]: status.positionMillis })));
            }
        }, 1000);
    
        return () => clearInterval(interval);
    }, [isPlaying]);
    
    const onPlaybackStatusUpdate = (status, index) => {
        console.log(`onPlaybackStatusUpdate called for index ${index} with status:`, status);
        if (status.durationMillis === status.positionMillis) {
            console.log(`Audio at index ${index} finished playing`);
            setIsPlaying(prev => ({ ...prev, [index]: false }));
            setPausedPosition(prev => ({ ...prev, [index]: 0 }));
            setPositionMillis((prev => ({ ...prev, [index]: 0 })));
        }
    };

    const formatTime = (millis) => {
        if (isNaN(millis)) {
            return '0:00';
        }
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <SoundContext.Provider value={
            {
                sounds, isPlaying, positionMillis, currentIndex, pausedPosition, 
                setPausedPosition, setIsPlaying, setPositionMillis, playAudio, pauseAudio, formatTime
        }}>
            {children}
        </SoundContext.Provider>
    );
}

export const useSound = () => useContext(SoundContext) 