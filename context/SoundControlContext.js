import { createContext, useContext, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Directions } from 'react-native-gesture-handler';
import { useSound } from './SoundProvider.js';
import { Audio } from "expo-av";


const SoundControlContext = createContext();

export const SoundControlProvider = ({children}) => {

    const {sound, soundName, soundDuration, isPlaying, isLoaded, currentIndex, positionMillis, pausedPosition} = useSound()

    function SoundControlPanel (){

        const flingUp = Gesture.Fling().direction(Directions.UP).onEnd(()=>{animUp()}).runOnJS(true);
        const flingDown = Gesture.Fling().direction(Directions.DOWN).onEnd(()=>{animDown()}).runOnJS(true);


        const [isRaised, setIsRaised] = useState(false)

        


        /// Анимация подъема
        const heightAnim = useRef(new Animated.Value(70)).current

        const animUp = () => {
            console.log("Fling Up")


            Animated.timing(heightAnim, {
                toValue:140,
                useNativeDriver: false
            }).start(()=>{
                setIsRaised(true)
            })
            
        }
        
        const animDown = () => {
            console.log("Fling Down")
            Animated.timing(heightAnim, {
                toValue:70,
                useNativeDriver: false
            }).start(()=> {
                setIsRaised(false)
            })
            
        }
        
        ///

        return (
            <View style={styles.container}>
                {isLoaded
                ?   <GestureDetector gesture={flingUp}>
                            <GestureDetector gesture={flingDown}>
                                <Animated.View style={[styles.soundPlayerBase, {height:heightAnim}]} >

                                    {isRaised
                                    ? <View>
                                            <View style={styles.viewTopRow}>

                                            </View>
                                            <View style={styles.viewMiddleRow}>
                                                <Text>
                                                    {soundName}
                                                </Text>
                                            </View>
                                            <View style={styles.viewBottomRow}>

                                            </View>
                                        </View>
                                    : <Text>Not Raised</Text>
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
        backgroundColor:'transparent',
        justifyContent:'center',
        alignItems:'center',      
    },
    soundPlayerBase:{

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