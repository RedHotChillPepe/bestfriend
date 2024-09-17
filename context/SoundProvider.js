import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system';

const SoundContext = createContext()

export const SoundProvider = ({children}) => {
    const sound = useRef(new Audio.Sound())
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioData, setAudioData] = useState([])
    const [currentIndex, setCurrentIndex] = useState('')

    const [positionMillis, setPositionMillis] = useState(0)



    const playAudio = async (uri, index) => {
        // Первая загрузка Sound
        const initialStatus = await sound.current.getStatusAsync()
        
        if (initialStatus.isLoaded != true) {
            try {
                await sound.current.loadAsync({uri:uri})
            } catch (error) {
                console.error('Error loading sound file:', error);
            }

            setIsPlaying(true)
            setCurrentIndex(index)
            await sound.current.playAsync()
            
            sound.current.setOnPlaybackStatusUpdate((status) => {
                handleSoundStatus(status)
            })

        }

        const status = await sound.current.getStatusAsync()
        const replacedUri = uri.replace("https://mishka-l3tq.onrender.com", "") // приведение uri к одному виду для сравнения
        

        // Нажатие на новый Sound
        if (isPlaying && status.uri != replacedUri) {
            await sound.current.unloadAsync()

            try {
                await sound.current.loadAsync({uri:uri})
                
            } catch (error) {
                console.error('Error loading sound file:', error);
            }

                setIsPlaying(true)
                setCurrentIndex(index)
                await sound.current.playAsync()

                sound.current.setOnPlaybackStatusUpdate((status) => {
                    handleSoundStatus(status)
                })
        }

        // Нажатие на тот же Sound
        if (!isPlaying && status.uri == replacedUri) {         
            await sound.current.playAsync()
            setIsPlaying(true)
            setCurrentIndex(index)
        }

        // Нажатие на Sound из паузы
        if (!isPlaying && status.uri != replacedUri) {
            await sound.current.unloadAsync()
            try {
                await sound.current.loadAsync({uri:uri})
                console.log('should have loaded again!');
                
            } catch (error) {
                console.error('Error loading sound file:', error);
            }

                setIsPlaying(true)
                setCurrentIndex(index)
                await sound.current.playAsync()

                sound.current.setOnPlaybackStatusUpdate((status) => {
                    handleSoundStatus(status)
                })
        }
    };



    const pauseAudio = async (index) => {
        await sound.current.pauseAsync()
        setIsPlaying(false)
        setCurrentIndex('')
    };


    const handleSoundStatus = async (status) => {
        console.log("current sound status: ", status);
    }
    


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
                sound, isPlaying, currentIndex, 
                setIsPlaying, playAudio, pauseAudio, formatTime
            }
        }>
            {children}
        </SoundContext.Provider>
    );
}

export const useSound = () => useContext(SoundContext) 