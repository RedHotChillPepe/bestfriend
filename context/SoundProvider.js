import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system';

const SoundContext = createContext()

export const SoundProvider = ({children}) => {
    const sound = useRef(new Audio.Sound())
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentIndex, setCurrentIndex] = useState('')

    const [positionMillis, setPositionMillis] = useState(0);
    const [pausedPosition, setPausedPosition] = useState(0);

    const [isLoaded, setIsLoaded] = useState(false);            // используется для выгрузки
    const [soundName, setSoundName] = useState('')              // в контекст панели 
    const [soundDuration, setSoundDuration] = useState(0) // проигрывателя
    const [soundUri, setSoundUri] = useState('')                    // (SoundControlContext)

    const playlist = useRef([])
    const [isRepeat, setIsRepeat] = useState(false)
    const [isRepeatOne, setIsRepeatOne] = useState(false)
    const currentPlaylistIndex = useRef(null)


    const playAudio = async (uri, index, name) => {
        const initialStatus = await sound.current.getStatusAsync()
        
        // Первая загрузка Sound
        if (initialStatus.isLoaded != true) {
            try {
                await sound.current.loadAsync({uri:uri})
            } catch (error) {
                console.error('Error loading sound file:', error);
            }

            setIsPlaying(true)
            setIsLoaded(true)
            setCurrentIndex(index)
            await sound.current.playAsync()
            
            sound.current.setOnPlaybackStatusUpdate((status) => {
                handleSoundStatus(status)
            })
            await sound.current.setProgressUpdateIntervalAsync(1000)
        }

        const status = await sound.current.getStatusAsync()

        // приведение uri к одному виду для сравнения
        const replacedUri = uri.replace("https://mishka-l3tq.onrender.com", "").replace("file://", "") 

        setSoundDuration(status.durationMillis); // присваивание значений 
        setSoundName(name);                                // для панели 
        setSoundUri(uri)                                        // контроля звука

        // Нажатие на новый Sound
        if (isPlaying && status.uri != replacedUri) {
            await sound.current.unloadAsync()
            setPausedPosition(0)
            setPositionMillis(0)
            setSoundDuration(status.durationMillis);

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
                await sound.current.setProgressUpdateIntervalAsync(1000)
        }
        
        
        // Нажатие на тот же Sound
        if (!isPlaying && status.uri == replacedUri) {         
            await sound.current.playAsync()
            setIsPlaying(true)
            setCurrentIndex(index)
        }

        // Нажатие на новый Sound из паузы
        if (!isPlaying && status.uri != replacedUri) {
            await sound.current.unloadAsync()
            setPausedPosition(0)
            setPositionMillis(0)
            setSoundDuration(status.durationMillis);

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
                await sound.current.setProgressUpdateIntervalAsync(1000)
        }
    };



    const pauseAudio = async () => {
        await sound.current.pauseAsync()
        setIsPlaying(false)
    };


    const handleSoundStatus = async (status) => {
        setSoundDuration(status.durationMillis)
       
        setPositionMillis(status.positionMillis)
        if (status.shouldPlay != true) {
            setPausedPosition(status.positionMillis)
        }
        if (status.didJustFinish) {
            handleSoundEnd()
        }
    }

    const handlePlaylistAdd = async (sound) => {
        console.log("sound added: ", sound);
        
        console.log(playlist);
        
        /* if (Object.keys(playlist.current).length != 0) {
            playlist.current[playlist.current.length] = sound
        } */
        console.log("object keys equal 0",Object.keys(playlist.current).length == 0);
        
        if (Object.keys(playlist.current).length == 0) {
            
            
            playlist.current[0] = sound
            currentPlaylistIndex.current = 0
            console.log("succ if curr eqls 0 : ", playlist);
        }
    }

    const handlePlaylistRemove = async (index) => {

    }

    const handlePlaylistSkip = async (number) => {

    }

    const handleSoundEnd = async () => {
        console.log("sound end, full playlist:", playlist.current);
        
        await sound.current.unloadAsync()

        if (Object.keys(playlist.current).length == 0) {
            setIsPlaying(false)
        }
        if (Object.keys(playlist.current).length != 0) {
            if (Object.keys(playlist.current).length == 1) {
                if (currentPlaylistIndex.current != null) {
                    console.log(playlist);
                    console.log(currentPlaylistIndex);
                    console.log(playlist.current[currentPlaylistIndex.current]);
                
                    try {
                        await playAudio(playlist.current[currentPlaylistIndex.current].uri, playlist.current[currentPlaylistIndex.current].index, playlist.current[currentPlaylistIndex.current].name)
                    } catch (error) {
                        console.error(error);
                    }
                    
                } 

            } else {

                    try {
                        currentPlaylistIndex.current = currentPlaylistIndex.current + 1
                        await playAudio(playlist.current[currentPlaylistIndex.current].uri, playlist.current[currentPlaylistIndex.current].index, playlist.current[currentPlaylistIndex.current].name)
                    } catch (error) {
                        console.error(error);
                        
                    }
                
                
                }

        }
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
                sound, isPlaying, isLoaded, currentIndex, positionMillis, pausedPosition, soundName, soundDuration, soundUri,
                setIsPlaying, playAudio, pauseAudio, formatTime, handlePlaylistAdd
            }
        }>
            {children}
        </SoundContext.Provider>
    );
}

export const useSound = () => useContext(SoundContext) 