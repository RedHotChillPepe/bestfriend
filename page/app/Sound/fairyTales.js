import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Pressable, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {useSound} from '../../../context/SoundProvider.js'

const { width, height } = Dimensions.get('window');

export default function FairyTales({ route }) {
    const { audioData } = route.params;
    const navigation = useNavigation();

    const { sound,  isPlaying, positionMillis, pausedPosition, 
        currentIndex, setIsPlaying, setPositionMillis, setPausedPosition, 
        playAudio, pauseAudio, formatTime 
        } = useSound()
    
    

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ width:"100%" }}>
                <View style={{paddingHorizontal:'4%', alignItems:'center'}}>
                    <View style={{flex:1, justifyContent:'space-between', flexDirection:"row", alignItems:'center', gap:80}}>
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
                            <FontAwesome name="book" size={100} color="#FFFFFF"  style={styles.cardIcon}/>                    
                        </View>
                    </View>
                
                </View>
                
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <View style={{  width: '90%' }}>
                        {audioData.map((item, index) => (
                            <View key={index} style={styles.card}>
                                <View style={styles.cardText}>
                                    <Text style={styles.cardTextTitle}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.cardTime}>
                                        {/* {formatTime(isPlaying ? positionMillis[item._id] || 0 : pausedPosition[item._id] || 0)} / {item.duration} */}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => isPlaying && currentIndex === item._id ? pauseAudio(item._id) : playAudio(item.audioFile, item._id)}>
                                    <AntDesign name={(isPlaying && currentIndex === item._id) ? "pausecircle" : "play"} size={30} color="#777" />
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
        marginTop:8,
        
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#656463',
        borderWidth: 1,
        borderRadius:16
    },
    card0: {
        backgroundColor: '#FEC513',
        width: width * 0.90,
        height: height * 0.15,
        borderRadius: 16,
        paddingTop: '5%',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cardText: {
        gap: 6
    },
    cardFairyText: {
        position: 'absolute',
        fontFamily: 'SF Pro Rounded Bold',
        fontSize: 28,
        color: "#fff",
        // width: '80%',
        left: '2%',
        top: '65%'
    },
    cardTextTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: "#5c5c5c"
    },
    cardTime: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: "#656463"
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