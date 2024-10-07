import { createContext, useContext, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, Dimensions, Pressable, ScrollView, FlatList } from "react-native";
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Directions } from 'react-native-gesture-handler';
import { useSound } from './SoundProvider.js';
import { Audio } from "expo-av";
import Animated from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';
import { AntDesign, FontAwesome6 , MaterialIcons, Ionicons } from '@expo/vector-icons';
import Slider from "@react-native-community/slider";

const { width, height } = Dimensions.get('window');


const SoundControlContext = createContext();

export const SoundControlProvider = ({children}) => {

    const {sound, playlist, soundName, soundDuration, soundUri, isPlaying, isLoaded, isRepeat, isRepeatOne, currentIndex, positionMillis, pausedPosition, 
        formatTime, pauseAudio, playAudio, handleSoundPan, handlePlaylistSkip, handleRepeat, handlePlaylistRemove} = useSound()
    const animHight = useSharedValue(70)
    const [isRaised, setIsRaised] = useState(false)
    const [isPlaylist, setIsPlaylist] = useState(false)
    const flingUp = Gesture.Fling().direction(Directions.UP).onEnd(()=>{animUp()}).runOnJS(true);
    const flingDown = Gesture.Fling().direction(Directions.DOWN).onEnd(()=>{animDown()}).runOnJS(true);

    
    

    function animUp() {
        console.log('fling up');
            
        if (animHight.value == 70) {
                animHight.value = animHight.value + 120
                setIsRaised(true)
        }
    }

    function animDown() {
        console.log('fling down');
            
        if (animHight.value == 140) {
                animHight.value = animHight.value - 120
                setIsRaised(false)
                setIsPlaylist(false)
        }
    }

    const handleSliding = async (value) => {
        handleSoundPan(value)
        
    }

    const togglePlaylist = () => {
        setIsPlaylist(!isPlaylist)
    }

    const localHandlePlaylistRemove = (index) => {
        togglePlaylist()
        handlePlaylistRemove(index)
    }


    function SoundControlPanel (){

       


        return (
            <View style={styles.container}>
                
                <GestureDetector gesture={flingUp}>
                            <GestureDetector gesture={flingDown}>
                                <Animated.View style={[styles.soundPlayerBase, isPlaylist ? {height:600} : {height:animHight}]} >

                                    {isRaised
                                    ? <View style={[styles.raised, {paddingTop:"4%"}]}>
                                        
                                            {isPlaylist
                                            &&  <View style={styles.playlist}>
                                                    <Text style={styles.playlistTitle}>
                                                        Плейлист
                                                    </Text>
                                                    {
                                                        Object.keys(playlist.current).length != 0
                                                        ?   <FlatList 
                                                                data={JSON.parse(playlist.current)}
                                                                renderItem={({item, index}) => (
                                                                    <View style={{paddingHorizontal:16}} key={item.index}>
                                                                        <Pressable onLongPress={() => localHandlePlaylistRemove(index)}>
                                                                        <View style={styles.playlistCard}>
                                                                            <Text style={styles.playlistSoundName}>
                                                                                {item.name}
                                                                            </Text>
                                                                            <Text style={styles.playlistSoundDuration}>
                                                                                {formatTime(item.duration)}
                                                                            </Text>
                                                                        </View>
                                                                        </Pressable>
                                                                    </View>
                                                                )}
                                                            />
                                                        : <Text style={styles.playlistTitle}>В плейлисте ничего нет!</Text>
                                                    }

                                                    
                                                </View>
                                            }
                                        
                                            <View style={styles.viewTopRow}>
                                                {
                                                    !isRepeat && !isRepeatOne
                                                    ?   <Pressable onPress={() => {handleRepeat("repeat")}}>
                                                            <MaterialIcons name="repeat" size={32} color="#FFF" />
                                                        </Pressable>
                                                    :   
                                                        isRepeat && !isRepeatOne
                                                        ? <Pressable onPress={() => {handleRepeat("repeat one")}}>
                                                                <MaterialIcons name="repeat-on" size={32} color="#FFF" />
                                                            </Pressable>
                                                        : 
                                                            !isRepeat && isRepeatOne
                                                            &&<Pressable onPress={() => {handleRepeat("no repeat")}}>
                                                                    <MaterialIcons name="repeat-one" size={32} color="#FFF" />
                                                                </Pressable>

                                                }
                                                
                                                <View>
                                                    <Text style={[styles.raisedText, {fontSize:20}]}>
                                                        {
                                                            isLoaded
                                                            ? soundName
                                                            :   "Звук не загружен"
                                                        }
                                                    </Text>
                                                </View>
                                                <Pressable onPress={() => {togglePlaylist()}}>
                                                    <MaterialIcons name="playlist-play" size={35} color="#FFF" />
                                                </Pressable>
                                            </View>
                                            <View style={styles.viewMiddleRow}>
                                                <Text style={[styles.raisedText, {fontSize:16}]}>
                                                    {
                                                        isPlaying 
                                                        ? formatTime(positionMillis || 0)
                                                        : formatTime( pausedPosition || 0)
                                                    }
                                                </Text>


                                                <Slider onSlidingComplete={(value) => {handleSliding(value)}}
                                                style={{width: '75%', height: 32}} 
                                                minimumValue={0} 
                                                maximumValue={soundDuration }
                                                value={ positionMillis }
                                                thumbTintColor="#F7F7FF"
                                                minimumTrackTintColor="#F7F7FF"
                                                maximumTrackTintColor="#dcdce6"/>


                                                <Text style={[styles.raisedText, {fontSize:16}]}>
                                                    {formatTime(soundDuration)}
                                                </Text>
                                            </View>
                                            <View style={styles.viewBottomRow}>
                                                <Pressable onPress={() => {handlePlaylistSkip("backward")}}>
                                                    <Ionicons name="play-skip-back" size={35} color="#FFF" />
                                                </Pressable>
                                                
                                                <Pressable style={{marginHorizontal:'5%'}} onPress={() => isPlaying ? pauseAudio() : playAudio(soundUri, currentIndex, soundName)}>
                                                    <AntDesign name={(isPlaying) ? "pausecircle" : "play"} size={40} color="#FFF" />
                                                </Pressable>

                                                <Pressable onPress={() => {handlePlaylistSkip("forward")}}>
                                                    <Ionicons name="play-skip-forward" size={35} color="#FFF" />
                                                </Pressable>                                                
                                            </View>
                                        </View>
                                    :   <View style={[styles.unRaised, {paddingTop:'2%'}]}>
                                            <Pressable onPress={() => isPlaying ? pauseAudio() : playAudio(soundUri, currentIndex, soundName)}>
                                                <AntDesign name={(isPlaying) ? "pausecircle" : "play"} size={45} color="#FFF" />
                                            </Pressable>
                                            <View style={{paddingLeft:'5%'}}>
                                                <Text style={[styles.unRaisedText, {fontSize:16}]}>
                                                    {
                                                        isLoaded
                                                        ? soundName
                                                        : "Звук не загружен"
                                                    }
                                                </Text>
                                                <Text style={[styles.unRaisedText, {fontSize:12}]}>
                                                    {
                                                        isPlaying 
                                                        ? formatTime(positionMillis || 0)
                                                        : formatTime( pausedPosition || 0)
                                                    } / {formatTime(soundDuration)}
                                                </Text>
                                            </View>
                                        </View>    
                                    }

                                    
                                </Animated.View>                        
                            </GestureDetector>
                        </GestureDetector>
                              
            </View>
        )
    }
    
    

    return (
        <SoundControlContext.Provider value={{SoundControlPanel}}>
            {children}
        </SoundControlContext.Provider>
    )
}

const styles = StyleSheet.create({
    container:{
        width:width,
        backgroundColor:'#3C62DD',
        borderRadius:24,
        justifyContent:'center',
        alignItems:'center',      
    },
    soundPlayerBase:{
        display:'flex',
        backgroundColor:"#3C62DD",
        width:'90%',
        height:70, 
    },
    viewTopRow:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        width: '100%',
        paddingHorizontal: 24,
        paddingBottom: 16
    },
    viewMiddleRow:{
        flexDirection:'row',
        alignItems:'center',
        width:'100%',
        justifyContent:'space-between',
        paddingHorizontal: 12
    },
    viewBottomRow:{
        flexDirection:'row',
        alignItems:'center'
    },
    unRaised:{
        display:'flex',
        flexDirection:'row',
        alignItems:'center'
    },
    unRaisedText:{
        fontFamily:'SF Pro Rounded Regular',
        color:'#FFF'
    },
    raised:{
        display:'flex',
        flexDirection:'column',
        alignItems:'center'
    },
    raisedText:{
        fontFamily:'SF Pro Rounded Regular',
        color:'#FFF'
    },
    playlist:{
        flexDirection:'column',
        alignItems:'center',
        height:'78%'
    },
    playlistTitle:{
        color:"#FFF",
        fontSize:20,
        fontFamily:"SF Pro Rounded Regular",
    },
    playlistSoundName:{
        color:"#FFF",
        fontSize:14,
        fontFamily:"SF Pro Rounded Regular",
    },
    playlistSoundDuration:{
        color:"#FFF",
        fontSize:12,
        fontFamily:"SF Pro Rounded Regular",
    },
    playlistCard:{
        flexDirection:'row',
        justifyContent:'space-between',
        width:'100%',

        borderBottomWidth:1, 
        borderBottomColor:"#99ACEE"
    }
})


export const useSoundPanel = () => useContext(SoundControlContext) 