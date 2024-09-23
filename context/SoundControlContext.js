import { createContext, useContext, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, Dimensions, Pressable } from "react-native";
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

    const {sound, soundName, soundDuration, soundUri, isPlaying, isLoaded, currentIndex, positionMillis, pausedPosition, formatTime, pauseAudio, playAudio} = useSound()
    const animHight = useSharedValue(70)
    const [isRaised, setIsRaised] = useState(false)
    const flingUp = Gesture.Fling().direction(Directions.UP).onEnd(()=>{animUp()}).runOnJS(true);
    const flingDown = Gesture.Fling().direction(Directions.DOWN).onEnd(()=>{animDown()}).runOnJS(true);



    

    function animUp() {
        console.log('fling up');
            
        if (animHight.value == 70) {
                animHight.value = animHight.value + 70
                setIsRaised(true)
        }
    }

    function animDown() {
        console.log('fling down');
            
        if (animHight.value == 140) {
                animHight.value = animHight.value - 70
                setIsRaised(false)
        }
    }

    const handleSliding = async (value) => {
        console.log(value);
        
    }

    function SoundControlPanel (){

       


        return (
            <View style={styles.container}>
                {isLoaded
                ?   <GestureDetector gesture={flingUp}>
                            <GestureDetector gesture={flingDown}>
                                <Animated.View style={[styles.soundPlayerBase, {height:animHight}]} >

                                    {isRaised
                                    ? <View style={[styles.raised, {paddingTop:"4%"}]}>
                                            <View style={styles.viewTopRow}>
                                                <Pressable>
                                                    <FontAwesome6 name="repeat" size={20} color="#FFF" />
                                                </Pressable>
                                                <View>
                                                    <Text style={[styles.raisedText, {fontSize:20}]}>
                                                        {soundName}
                                                    </Text>
                                                </View>
                                                <Pressable>
                                                    <MaterialIcons name="playlist-play" size={25} color="#FFF" />
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
                                                style={{width: 200, height: 40}} 
                                                minimumValue={0} 
                                                maximumValue={soundDuration}
                                                value={ positionMillis }
                                                thumbTintColor="#F7F7FF"
                                                minimumTrackTintColor="#F7F7FF"
                                                maximumTrackTintColor="#dcdce6"/>


                                                <Text style={[styles.raisedText, {fontSize:16}]}>
                                                    {formatTime(soundDuration)}
                                                </Text>
                                            </View>
                                            <View style={styles.viewBottomRow}>
                                                <Ionicons name="play-skip-back" size={35} color="#FFF" />
                                                <Pressable style={{marginHorizontal:'5%'}} onPress={() => isPlaying ? pauseAudio() : playAudio(soundUri, currentIndex, soundName)}>
                                                    <AntDesign name={(isPlaying) ? "pausecircle" : "play"} size={30} color="#FFF" />
                                                </Pressable>
                                                <Ionicons name="play-skip-forward" size={35} color="#FFF" />
                                            </View>
                                        </View>
                                    :   <View style={[styles.unRaised, {paddingTop:'2%'}]}>
                                            <Pressable onPress={() => isPlaying ? pauseAudio() : playAudio(soundUri, currentIndex, soundName)}>
                                                <AntDesign name={(isPlaying) ? "pausecircle" : "play"} size={45} color="#FFF" />
                                            </Pressable>
                                            <View style={{paddingLeft:'5%'}}>
                                                <Text style={[styles.unRaisedText, {fontSize:16}]}>
                                                    {soundName}
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
                : <></> 
                }
                
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
        width:330
    },
    viewMiddleRow:{
        flexDirection:'row',
        alignItems:'center'
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
    }
})


export const useSoundPanel = () => useContext(SoundControlContext) 