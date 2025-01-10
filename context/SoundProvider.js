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
    const refIsRepeat = useRef(false)
    const refIsRepeatOne = useRef(false)
    const currentPlaylistIndex = useRef(null)

    useEffect(() => {
      Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: 'DuckOthers', // Change as you like
        interruptionModeAndroid: 'DuckOthers', // Change as you like
        shouldDuckAndroid: true,
        // playThroughEarpieceAndroid: true,
      })
    
      return () => {
        
      }
    })
    


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
        console.log(uri);
        
        // приведение uri к одному виду для сравнения
        const replacedUri = uri.replace("https://bestfriend-back.onrender.com", "").replace("file://", "").replace("https://mishka-l3tq.onrender.com","")

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
    }



    const pauseAudio = async () => {
        await sound.current.pauseAsync()
        setIsPlaying(false)
    }


    const handleSoundStatus = async (status) => {
        if (status.durationMillis != soundDuration || soundDuration == 0) {
          setSoundDuration(await status.durationMillis)  
        }
        
       
        setPositionMillis(await status.positionMillis)
        if (status.shouldPlay != true) {
            setPausedPosition(status.positionMillis)
        }
        if (status.didJustFinish) {
            handleSoundEnd(status)
        }
    }

    const handleSoundPan = async (position) => {
        await sound.current.setPositionAsync(position)
    }

    const handlePlaylistAdd = async (gotsound) => {
        console.log("sound added: ", gotsound);
        
        
        
        if (Object.keys(playlist.current).length != 0) {
            const modifiedString = playlist.current.replace("[","").replace("]","")
            playlist.current = "[" + modifiedString + "," + JSON.stringify(gotsound) + "]"
            console.log(playlist);
            console.log(typeof(playlist.current));
            
        } 
        console.log("object keys equal 0",Object.keys(playlist.current).length == 0);
        
        if (Object.keys(playlist.current).length == 0) {            
            playlist.current = "[" + JSON.stringify(gotsound) + "]"
            currentPlaylistIndex.current = 0
            console.log("succ if curr eqls 0 : ", playlist);
            const JsonPlaylist = JSON.parse(playlist.current)
            await playAudio(JsonPlaylist[0].uri, JsonPlaylist[0].index, JsonPlaylist[0].name)
            pauseAudio()
        }
        console.log(JSON.parse(playlist.current));
        
    }

    const handlePlaylistRemove = async (index) => {
        const tempPlaylist = JSON.parse(playlist.current)

        for (let indexFor = 0; indexFor < tempPlaylist.length; indexFor++) {

            if (indexFor == index) {
                const newJson = tempPlaylist.toSpliced(indexFor, 1)

                playlist.current = JSON.stringify(newJson).replace("[", "").replace("]", "")
            }
            
        }
    }

    const handlePlaylistSkip = async (string) => {
        // await sound.current.unloadAsync()
        if (Object.keys(playlist.current).length != 0) {
            const JsonPlaylist = JSON.parse(playlist.current)

            if (currentPlaylistIndex.current != null) {
                if (string == "forward") {
                    await sound.current.unloadAsync()

                    if ((currentPlaylistIndex.current + 1) == Object.keys(JsonPlaylist).length) {
                        currentPlaylistIndex.current = 0
                        await playAudio(JsonPlaylist[0].uri, JsonPlaylist[0].index, JsonPlaylist[0].name)
                    } else {
                        currentPlaylistIndex.current += 1
                        await playAudio(JsonPlaylist[currentPlaylistIndex.current].uri, JsonPlaylist[currentPlaylistIndex.current].index, JsonPlaylist[currentPlaylistIndex.current].name)
                    }
                }

                if (string == "backward") {
                    await sound.current.unloadAsync()

                    if ((currentPlaylistIndex.current - 1) < 0) {
                        currentPlaylistIndex.current = 0
                        await playAudio(JsonPlaylist[0].uri, JsonPlaylist[0].index, JsonPlaylist[0].name)
                    } else {
                        currentPlaylistIndex.current -= 1
                        await playAudio(JsonPlaylist[currentPlaylistIndex.current].uri, JsonPlaylist[currentPlaylistIndex.current].index, JsonPlaylist[currentPlaylistIndex.current].name)
                    }
                }
            }                
            
        }        
        
         
    }

    const handleSoundEnd = async (status) => {
        console.log("sound end, full playlist:", playlist.current);
        console.log(currentPlaylistIndex.current);
        const localIsRepeat = refIsRepeat.current
        const localIsRepeatOne = refIsRepeatOne.current
        
        if (currentPlaylistIndex.current != null) {
            if (Object.keys(playlist.current).length != 0) {
                const JsonPlaylist = JSON.parse(playlist.current)

                if (Object.keys(JsonPlaylist).length != 0) {
                    console.log("status uri: ", status.uri);
                    console.log("playlist.current uri: ", JsonPlaylist[currentPlaylistIndex.current]);

                    if (localIsRepeatOne) {
                        await sound.current.unloadAsync()
                        await playAudio(JsonPlaylist[currentPlaylistIndex.current].uri, JsonPlaylist[currentPlaylistIndex.current].index, JsonPlaylist[currentPlaylistIndex.current].name)
                    } else if ((currentPlaylistIndex.current + 1) == Object.keys(JsonPlaylist).length ) {
                        console.log("isRepeat?: ", localIsRepeat);
                        
                        if (localIsRepeat) {
                            await sound.current.unloadAsync()
                            currentPlaylistIndex.current = 0
                            await playAudio(JsonPlaylist[currentPlaylistIndex.current].uri, JsonPlaylist[currentPlaylistIndex.current].index, JsonPlaylist[currentPlaylistIndex.current].name)
                        } else {
                            await sound.current.unloadAsync()
                            setIsPlaying(false)
                        }
                    } else {
                        await sound.current.unloadAsync()
                        currentPlaylistIndex.current += 1
                        await playAudio(JsonPlaylist[currentPlaylistIndex.current].uri, JsonPlaylist[currentPlaylistIndex.current].index, JsonPlaylist[currentPlaylistIndex.current].name)
                    }
                } else {
                await sound.current.unloadAsync()
                setIsPlaying(false)
                }
            } else {
                await sound.current.unloadAsync()
                setIsPlaying(false)
            }        
        } else {
            await sound.current.unloadAsync()
            setIsPlaying(false)
        }
    }

    const handleRepeat = (string) =>{
        switch (string) {
            case "no repeat":
                setIsRepeat(false)
                refIsRepeat.current = false
                setIsRepeatOne(false)
                refIsRepeatOne.current = false
                break;
            case "repeat":
                setIsRepeat(true)
                refIsRepeat.current = true
                setIsRepeatOne(false)
                refIsRepeatOne.current = false
                break;
            case "repeat one":
                setIsRepeat(false)
                refIsRepeat.current = false
                setIsRepeatOne(true)
                refIsRepeatOne.current = true
                break;
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
                sound, playlist, isPlaying, isLoaded, currentIndex, positionMillis, pausedPosition, soundName, soundDuration, soundUri, isRepeat, isRepeatOne,
                setIsPlaying, playAudio, pauseAudio, formatTime, handlePlaylistAdd, handlePlaylistSkip, handleSoundPan, handleRepeat, handlePlaylistRemove
            }
        }>
            {children}
        </SoundContext.Provider>
    );
}

export const useSound = () => useContext(SoundContext) 