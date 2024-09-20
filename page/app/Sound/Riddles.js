import { Text, View, StyleSheet, TouchableOpacity,ScrollView, Pressable, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useSound } from '../../../context/SoundProvider';
import { useSoundPanel } from '../../../context/SoundControlContext';

const { width, height } = Dimensions.get('window');

export default function Riddles({ route }) {
    const { audioData } = route.params;

    const navigation = useNavigation();

    const {isPlaying, positionMillis, pausedPosition, 
        currentIndex, setIsPlaying, setPositionMillis, 
    setPausedPosition, playAudio, pauseAudio, formatTime} = useSound()

    const {SoundControlPanel} = useSoundPanel()


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
                        <View style={[styles.card1]}>
                            <Text style={styles.cardRiddleText}>
                                Загадки
                            </Text>
                            <FontAwesome name="question" size={100} color="#FFFFFF"  style={styles.cardIcon}/>                    
                        </View>
                    </View>
                
                </View>
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <View style={{ width: '90%' }}>
                        {audioData.map((item, index) => (
                            <View key={index} style={styles.card}>
                                <View style={styles.cardText}>
                                    <Text style={styles.cardTextTitle}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.cardTime}>
                                    {
                                        isPlaying 
                                        ? formatTime( currentIndex === item._id ? positionMillis : 0)
                                        : formatTime(currentIndex === item._id ? pausedPosition : 0)
                                    } / {item.duration}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => isPlaying && currentIndex === item._id ? pauseAudio() : playAudio(item.audioFile, item._id, item.name)}>
                                    <AntDesign name={isPlaying && currentIndex === item._id ? "pausecircle" : "play"} size={30} color="#3C62DD" />
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
    card1: {
        backgroundColor:'#FF7427',
        width: width * 0.90,
        height: height * 0.15,
        marginBottom: '2%',
        borderRadius: 15,
        paddingTop: '5%',
        paddingLeft: '6%',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cardText: {
        gap: 6
    },
    cardRiddleText: {
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
        color: "#bbb"
    },
    cardIcon: {
        opacity: 0.35,
        position: 'absolute',
        bottom: "-24%",
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