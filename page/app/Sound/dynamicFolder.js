import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native"
import React, { useState, useEffect, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Audio } from "expo-av";
import {useSound} from '../../../context/SoundProvider.js';
import uuid from 'react-native-uuid';
import { Button, TextInput } from "react-native-paper";


export default function DynamicFolder({route, navigation}) {
    
   const [storageFiles, setStorageFiles] = useState([]);

   const {text, Fileuuid} = JSON.parse(route.params)

   const {playAudio, pauseAudio, isPlaying, currentIndex, positionMillis, pausedPosition, formatTime, handlePlaylistAdd} = useSound()
   const [pressedIn, setPressedIn] = useState(null)
   const [isModalFile, setIsModalFile] = useState(false)
   const [isRename, setIsRename] = useState(false)

   const [fileName, setFileName] = useState('')

   const refModalFile = useRef(null)



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
            
            const jsonValue = JSON.stringify(value).replace("[","").replace("]","");
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

    const handlePressIn = (index) => {
        setPressedIn(index)
    }
    const handlePressOut = () => {
        setPressedIn(null)
    }

    const handleModalFile = async (file) => {
        setIsModalFile(true)
        refModalFile.current = file
    }

    const handleFileDelete = async () => {
        if (refModalFile.current != null) {
            const tempStorageFiles = await fetchStorageFiles()

            for (let index = 0; index < tempStorageFiles.length; index++) {
                const element = tempStorageFiles[index].uuid

                if (element == refModalFile.current.uuid) {
                    const newJsonObject = tempStorageFiles.toSpliced(index, 1)
                    console.log(newJsonObject);
                    await AsyncStorage.removeItem(Fileuuid)
                    await storeStorageFiles(newJsonObject)
                    setStorageFiles(await fetchStorageFiles())
                    setIsRename(false)
                    setIsModalFile(false)
                }
                
            }
        }
    }

    const toggleRenameButton = () => {
        setIsRename(!isRename)
    }

    const handleFileRename = async () => {
        if (fileName == "") {
            alert("Введите Имя")
        } else if (refModalFile.current != null) {
            const tempStorageFiles = await fetchStorageFiles()

            for (let index = 0; index < tempStorageFiles.length; index++) {
                const element = tempStorageFiles[index].uuid
                
                if (element == refModalFile.current.uuid) {
                    const newJsonObject = tempStorageFiles.toSpliced(index, 1, {name:fileName, duration:tempStorageFiles[index].duration, uri:tempStorageFiles[index].uri, uuid:tempStorageFiles[index].uuid})
                    await AsyncStorage.removeItem(Fileuuid)
                    await storeStorageFiles(newJsonObject)
                    setStorageFiles(await fetchStorageFiles())
                    
                    setIsRename(false)
                    setIsModalFile(false)
                }
            }
        }
        
    }
    
    const localHandlePlalistAdd = () => {
        if (refModalFile.current != null) {
            handlePlaylistAdd({
                uri:refModalFile.current.uri,
                index:refModalFile.current.uuid,
                name:refModalFile.current.name,
                duration:refModalFile.current.duration
            })
        }
       
    }

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
                <View>
                  <Pressable 
                    onPress={()=>{handleUserPick()}} 
                    style={{backgroundColor: '#3C62DD', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 , marginTop: 32}}>
               
                    <Text style={styles.subtitleText}>
                      Добавить запись
                    </Text>
                        {/* <MaterialCommunityIcons name='plus-circle-outline' color="#646463" size={32}/> */}
                  </Pressable>
                                 
                </View>
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <View style={{  width: '90%' }}>

                        {
                            storageFiles.map((file, index) => (
                                <Pressable
                                onPressIn={()=> handlePressIn(index)}
                                onPressOut={() => handlePressOut()}
                                onLongPress={() => handleModalFile(file)}>
                                    <View key={file.uuid} style={[styles.card, pressedIn == index && {backgroundColor:"#dedede"}]}>
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
                                </Pressable>
                            ))
                        }  

                    </View>
                </View>
            </ScrollView>
            <Modal  transparent={true} animationType="slide" visible={isModalFile}  onRequestClose={()=>setIsModalFile(false)} onDismiss={()=>setIsModalFile(false)}>
                <Pressable style={styles.centeredView} onPress={()=> setIsModalFile(false)}>
                    <View>
                    <TouchableWithoutFeedback>
                        
                            <View style={styles.modalView}>
                                {
                                    isRename 
                                    ? <View>
                                            <View style={{marginBottom:'10%', marginTop:'10%', backgroundColor:'#FFF', borderRadius:16}}>
                                                <TextInput placeholderTextColor={"#848484"} onChangeText={setFileName} style={{fontSize:20, height:48, width:240, fontFamily:'SF Pro Rounded Regular', paddingLeft:15}} autoFocus={true} placeholder='Название'></TextInput>
                                            </View>
                                            <View>
                                                <Button onPress={() => handleFileRename()} style={{borderRadius:8, width:220, fontSize:20, marginBottom:16}} textColor='#3C62DD'  buttonColor='#FFF' mode='contained'>Сменить имя</Button>
                                            </View>
                                            <View>
                                                <Button onPress={()=> toggleRenameButton()} style={{borderRadius:8, width:220, fontSize:20, marginBottom:16}} textColor='#3C62DD'  buttonColor='#FFF' mode='contained'>Отмена</Button>
                                            </View>
                                        </View>
                                    : <View>
                                    <View>
                                        <Button onPress={() => localHandlePlalistAdd()} style={{borderRadius:8, width:220, fontSize:20, marginBottom:16}} textColor='#3C62DD'  buttonColor='#FFF' mode='contained'>Добавить в плейлист</Button>
                                    </View>

                                    <View>
                                        <Button onPress={() => toggleRenameButton()} style={{borderRadius:8, width:220, fontSize:20, marginBottom:16}} textColor='#3C62DD'  buttonColor='#FFF' mode='contained'>Переименовать</Button>
                                    </View>
                                    
                                    <View>
                                        <Button onPress={() => handleFileDelete()} style={{borderRadius:8, width:220, fontSize:20}} textColor='#3C62DD'  buttonColor='#FFF' mode='contained'>Удалить</Button>
                                    </View>
                                </View>
                               
                                }
                                
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </Pressable>
            </Modal>
                  
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
        fontSize:18,
        color:"#fff",

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
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(255,255, 255, 0.15)', // Полупрозрачный фон
        justifyContent: "center",
        alignItems: "center",
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalView: {
        margin: 20,
        backgroundColor: "#3C62DD",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
})