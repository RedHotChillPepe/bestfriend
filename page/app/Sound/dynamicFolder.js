import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import React, { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Audio } from "expo-av";
import {useSound} from '../../../context/SoundProvider.js';
import { useSoundPanel } from '../../../context/SoundControlContext';
import uuid from 'react-native-uuid';


export default function DynamicFolder({route, navigation}) {
    
   const [storageFiles, setStorageFiles] = useState([]);

   const {text, Fileuuid} = JSON.parse(route.params)

   const {playAudio, pauseAudio, isPlaying, currentIndex, positionMillis, pausedPosition, formatTime} = useSound()
   const {SoundControlPanel} = useSoundPanel()



    /// AsyncStorage локальное хранилище на телефоне
    const fetchStorageFiles = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem(Fileuuid);
          return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
          // error reading value
        }
    };



    const storeStorageFiles = async (value) => {
        try {
            
            const jsonValue = JSON.stringify(value);
            if (await fetchStorageFiles() != null) {
                const replacedFileData =  JSON.stringify(await fetchStorageFiles()).replace("[","").replace("]","")
                const combinedString = "[" + replacedFileData + ',' + jsonValue + "]"
                await AsyncStorage.setItem(Fileuuid, combinedString)
            } else {
                await AsyncStorage.setItem(Fileuuid,  "[" + jsonValue + "]");
            }
            
                    
        } catch (e) {
          // saving error
        }
    };

    clearAll = async () => {
        try {
          await AsyncStorage.clear()
        } catch(e) {
          // clear error
        }
        setStorageFiles([])
      
        console.log('Done.')
    }
    ///

    /// Single Audio File Handling
    const handleUserFile = async (value) => {
        // Проверка на отмену выбора пользователем
        if (value != null) {
            // Копирует файл в хранилище приложения для быстрого доступа
            await FileSystem.copyAsync({from:value[0].uri, to:`${FileSystem.documentDirectory + value[0].name}`}) 
            const result = await FileSystem.getInfoAsync(
                            FileSystem.documentDirectory + value[0].name
                        )
            const newUUID = uuid.v4()

            const tempAudio = new Audio.Sound()                        // #FIXME
            await tempAudio.loadAsync({uri:result.uri})             // Должен быть способ получать Duration из файла 
            const status = await tempAudio.getStatusAsync()   // без загрузки его в переменную

            await storeStorageFiles( // Сохраняет ссылку *НА КОПИЮ* файла в AsyncStorage 
                {
                    name:value[0].name,
                    uri:result.uri,
                    uuid:`${newUUID}`,
                    duration: status.durationMillis
                })
                
            setStorageFiles(await fetchStorageFiles())        
            await tempAudio.unloadAsync() // Выгрузка из переменной для очистки памяти
        }

        
    }

    const handleUserPick = async () => {
        // Вызывает file picker системы пользователя. Возвращает один файл
        await DocumentPicker.getDocumentAsync({type:"audio/*"}) 
        .then(async response => await response.assets) // возвращает null если запрос отменен
        .then (async data => {
            handleUserFile(data)
        }) 
        .catch(error => {
            console.error(error);
        })       
        
    }
    ///

    useEffect(() => {
        // Заполнение динамической папки из хранилища перед рендером
        const initialfillup = async () => {
            
            if (await fetchStorageFiles() != null) {
                setStorageFiles(await fetchStorageFiles())
            }
            console.log(await fetchStorageFiles());
        }
        initialfillup()
        
      return () => {        
      }
    }, [])
    
    
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
                <View style={{ width:'100%'}} >
                    <View style={{flex:1, justifyContent:'space-between', flexDirection:"row", alignItems:'center'}}>
                        <Pressable style={{paddingLeft:'4%'}} onPress={()=> navigation.goBack()}>
                            <Text style={styles.subtitleText}>
                                Назад
                            </Text>
                        </Pressable >
                        <Pressable onPress={()=>{handleUserPick()}}  style={{paddingRight:'4%'}}>
                            <MaterialCommunityIcons name='plus-circle-outline' color="#000" size={30}/>
                        </Pressable>
                    </View>                
                </View>
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <View style={{  width: '90%' }}>

                        {
                            storageFiles.map((file) => (
                                <View key={file.uuid} style={styles.card}>
                                    <View style={styles.cardText}>
                                        <Text style={styles.cardTextTitle}>
                                            {file.name}
                                        </Text>
                                        <Text style={styles.cardTime}>
                                            {
                                                isPlaying 
                                                ? formatTime( currentIndex === file.uuid ? positionMillis : 0)
                                                : formatTime(currentIndex === file.uuid ? pausedPosition : 0)
                                            } / {formatTime(file.duration)}
                                        </Text>
                                    </View>
                                    <Pressable onPress={() => isPlaying && currentIndex == file.uuid ? pauseAudio() : playAudio(`${FileSystem.documentDirectory + file.name}`, file.uuid, file.name)}>
                                        <AntDesign name={(isPlaying && currentIndex === file.uuid) ? "pausecircle" : "play"} size={30} color="#3C62DD" />
                                    </Pressable>
                                </View>
                            ))
                        }  

                    </View>
                </View>
            </ScrollView>
                  
        </View>
    )
   
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center'
    },
    cardText: {
        gap: 6
    },
    cardTextTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: "#5c5c5c"
    },
    subtitleText:{
        fontFamily:"SF Pro Rounded Semibold",
        fontSize:24,
        color:"#070600",
        opacity:0.61,
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
    cardTime: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: "#656463"
    },
})