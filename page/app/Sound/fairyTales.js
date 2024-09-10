import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Pressable, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function FairyTales({ route }) {
    const { audioData } = route.params;
    
    const sounds = useRef([]);
    const [isPlaying, setIsPlaying] = useState({});
    const [positionMillis, setPositionMillis] = useState({});
    const [pausedPosition, setPausedPosition] = useState({});
    const currentIndex = useRef(null);

    const navigation = useNavigation();

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
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ width:"100%" }}>
                <View style={{padding:'4%'}}>
                    <View style={{flex:1, justifyContent:'space-between', flexDirection:"row", alignItems:'center'}}>
                        <Pressable onPress={()=> navigation.goBack()}>
                            <Text style={styles.subtitleText}>
                                Назад
                            </Text>
                        </Pressable>
                        
                        <Pressable>
                            <MaterialCommunityIcons name='plus-circle-outline' color="#000" size={30}/>
                        </Pressable>
                    </View>
                    <View style={{alignContent:"center"}}>
                        <View style={[styles.card0]}>
                            <Text style={styles.cardFairyText}>
                                Сказки
                            </Text>
                            <FontAwesome name="book" size={80} color="#FFFFFF"  style={styles.cardIcon}/>                    
                        </View>
                    </View>
                
                </View>
                
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <View style={{ marginBottom: '3%', width: '100%' }}>
                        {audioData.map((item, index) => (
                            <View key={index} style={styles.card}>
                                <View style={styles.cardText}>
                                    <Text style={styles.cardTextTitle}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.cardTime}>
                                        {formatTime(isPlaying[index] ? positionMillis[index] || 0 : pausedPosition[index] || 0)} / {item.duration}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => isPlaying[index] ? pauseAudio(index) : playAudio(item.audioFile, index)}>
                                    <AntDesign name={isPlaying[index] ? "pausecircle" : "play"} size={30} color="#777" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    card: {
        height: 60,
        paddingHorizontal: '4%',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1
    },
    card0: {
        backgroundColor: '#FEC513',
        width: width * 0.90,
        height: height * 0.17,
        marginBottom: '4%',
        borderRadius: 15,
        paddingTop: '5%',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cardText: {
        gap: 10
    },
    cardFairyText: {
        position: 'absolute',
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 20,
        color: "#fff",
        // width: '80%',
        left: '8%',
        top: '8%'
    },
    cardTextTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: "#5c5c5c"
    },
    cardTime: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: "#bbb"
    },
    cardIcon: {
        opacity: 0.35,
        position: 'absolute',
        right: '8%'
    },
    subtitleText:{
        fontFamily:"SF Pro Rounded Semibold",
        fontSize:24,
        color:"#070600",
        opacity:0.61,
        textAlign:'left',
        marginRight:"43%"
    },
});