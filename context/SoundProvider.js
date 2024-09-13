import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system';

const SoundContext = createContext()

export const SoundProvider = ({children}) => {
    const [sound, setSound] = useState([])
    const playbackObj = new Audio.Sound()
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioData, setAudioData] = useState([])
    const [positionMillis, setPositionMillis] = useState({});
    const [pausedPosition, setPausedPosition] = useState({});

    const handlePlay = async (audio) => {
        const status = await playbackObj.loadAsync(
            {uri:`${FileSystem.documentDirectory + audio.name}`},
        )
        if (Object.keys(sound).length === 0) {
            if (status.isLoaded) {
                await playbackObj.playAsync()
                setSound(playbackObj)
                console.log(await playbackObj.getStatusAsync());
                setIsPlaying(true)
            }
        }
    }
    
/*     const handlePause = async () => {

    } */

    return (
        <SoundContext.Provider value={{sound, handlePlay}}>
            {children}
        </SoundContext.Provider>
    );
}

export const useSound = () => useContext(SoundContext) 