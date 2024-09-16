import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import React, { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Audio } from "expo-av";
import {useSound} from '../../../context/SoundProvider.js'


export default function DynamicFolder({route, navigation}) {
    
   const [storageFiles, setStorageFiles] = useState([]);

   const {text} = JSON.parse(route.params)

   /* const [sound, setSound] = useState([])
   const [isPlaying, setIsPlaying] = useState(false) */

   const {playAudio, pauseAudio, isPlaying} = useSound()



    /// AsyncStorage локальное хранилище на телефоне
    const fetchStorageFiles = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem(text);
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
                await AsyncStorage.setItem(text, combinedString)
            } else {
                await AsyncStorage.setItem(text,  "[" + jsonValue + "]");
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
        await FileSystem.copyAsync({from:value[0].uri, to:`${FileSystem.documentDirectory + value[0].name}`}) // Копирует файл в хранилище приложения для быстрого доступа
        const result = await FileSystem.getInfoAsync(
                        FileSystem.documentDirectory + value[0].name
                    )

        await storeStorageFiles( // Сохраняет ссылку *НА КОПИЮ* файла в AsyncStorage 
            {
                name:value[0].name,
                uri:result.uri
            })
            
        setStorageFiles(await fetchStorageFiles())        
    }

    const handleUserPick = async () => {
        await DocumentPicker.getDocumentAsync({type:"audio/*"}) //Вызывает file picker системы пользователя. Возвращает один файл
        .then(async response => await response.assets)
        .then (async data => {
            handleUserFile(await data)
        }) 
        .catch(error => {
            console.error(error);
        })       
        
    }
    ///

    useEffect(() => {
        const initialfillup = async () => {
            
            if (await fetchStorageFiles() != null) {
                setStorageFiles(await fetchStorageFiles())
            }
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
                            storageFiles.map((file, index) => (
                                <View key={index} style={styles.card}>
                                    <Text style={styles.cardTextTitle}>
                                        {file.name}
                                    </Text>
                                    <Pressable>
                                        <Text onPress={() => isPlaying[index] ? pauseAudio(index) : playAudio(`${FileSystem.documentDirectory + file.name}`, index)}>
                                            Play!
                                        </Text>
                                    </Pressable>
                                </View>
                            ))
                        }  

                    </View>
                </View>
                {/* <View>
                    <Text onPress={() => {clearAll()}}>
                        {JSON.stringify(storageFiles)}
                    </Text>
                </View> */}
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
})