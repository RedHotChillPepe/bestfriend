import { createContext, useContext, useRef } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Directions } from 'react-native-gesture-handler';
import { useSound } from './SoundProvider.js';
import { Audio } from "expo-av";


const SoundControlContext = createContext();

export const SoundControlProvider = ({children}) => {

    const {sound, isPlaying, currentIndex, positionMillis, pausedPosition} = useSound()

    function SoundControlPanel (){

        const flingUp = Gesture.Fling().direction(Directions.UP).onEnd(()=>{animUp()}).runOnJS(true);
        const flingDown = Gesture.Fling().direction(Directions.DOWN).onEnd(()=>{animDown()}).runOnJS(true);

        const heightAnim = useRef(new Animated.Value(70)).current

        const animUp = () => {
            console.log("Fling Up")
            Animated.timing(heightAnim, {
                toValue:140,
                useNativeDriver: false
            }).start()
        }
        
        const animDown = () => {
            console.log("Fling Down")
            Animated.timing(heightAnim, {
                toValue:70,
                useNativeDriver: false
            }).start()
        }


        return (
            <View style={styles.container}>
                {
                    sound.current._loaded
                    ?   <GestureDetector gesture={flingUp}>
                            <GestureDetector gesture={flingDown}>
                                <Animated.View style={[styles.soundPlayerBase, {height:heightAnim, marginBottom:heightAnim}]} >
                                    <View style={styles.viewTopRow}>

                                    </View>
                                    <View style={styles.viewMiddleRow}>
                                        <Text>
                                            {JSON.stringify(sound.current)}
                                        </Text>
                                    </View>
                                    <View style={styles.viewBottomRow}>

                                    </View>
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
        flex:1,
        justifyContent:'center',
        alignItems:'center',      
    },
    soundPlayerBase:{
        display:'flex',
        backgroundColor:"#3C62DD",
        width:'90%',
        borderRadius:24,
        height:70, 
    },
    viewTopRow:{

    },
    viewMiddleRow:{

    },
    viewBottomRow:{
        
    }
})


export const useSoundPanel = () => useContext(SoundControlContext) 