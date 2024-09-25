import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Audio } from "expo-av";
import {useSound} from '../../../context/SoundProvider.js';
import uuid from 'react-native-uuid';
import { Button } from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');


function UserRecords({navigation}) {

    const {playAudio, pauseAudio, isPlaying, currentIndex, positionMillis, pausedPosition, formatTime} = useSound()

    const [storageFiles, setStorageFiles] = useState([]);
    const [isModalShown, setIsModalShown] = useState(false)
    const [recordingTitle, setRecordingTitle] = useState('')

    const [recordingPositionMillis, setRecordingPositionMillis] = useState(0)                           // Локальные стейты
    const [recordingPausedPositionMillis, setRecordingPausedPositionMillis] = useState(0)   // используемые
    const [isRecording, setIsRecording] = useState(false)                                                      // только
    const [isPaused, setIsPaused] = useState(false)                                                               // в рендере модального окна записи

    const recording = useRef(new Audio.Recording)

    /// AsyncStorage локальное хранилище на телефоне
    const fetchStorageFiles = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem("userRecords");
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
                await AsyncStorage.setItem("userRecords", combinedString)
            } else {
                await AsyncStorage.setItem("userRecords",  "[" + jsonValue + "]");
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

    useEffect(() => {
        // Заполнение страницы из хранилища перед рендером
        const initialfillup = async () => {
            
            if (await fetchStorageFiles() != null) {
                setStorageFiles(await fetchStorageFiles())
            }
        }
        initialfillup()
      return () => {        
      }
    }, [])

    const handleRecordingUpdate = async (status) => {
        console.log("recording status update:",status);

        // Запись стейта данными из записи для демонстрации прогресса записи юзеру
        if (status.isRecording) {
            setIsRecording(true)
            setRecordingPositionMillis(status.durationMillis)
        }

        if (!status.isRecording && status.durationMillis != 0) {
            setRecordingPausedPositionMillis(status.durationMillis)
        }
        
    }

    // Сохранение файла из кэша (где он может быть удален) в хранилище приложения (где он будет безопасно хранится)
    const handleRecordingFile = async (uri) => {
       
            if (uri != null) {

                const filePath = FileSystem.documentDirectory + recordingTitle + ".mp3"
                console.log(recordingTitle);
                
                
                await FileSystem.copyAsync({from:uri, to:filePath})
                const result = await FileSystem.getInfoAsync(
                    filePath
                )
                const newUUID = uuid.v4()

                const tempAudio = new Audio.Sound()                        // #FIXME
                await tempAudio.loadAsync({uri:result.uri})             // Должен быть способ получать Duration из файла 
                const status = await tempAudio.getStatusAsync()   // без загрузки его в переменную

                await storeStorageFiles( // Сохраняет ссылку *НА КОПИЮ* файла в AsyncStorage 
                    {
                        name:recordingTitle,
                        uri:result.uri,
                        uuid:`${newUUID}`,
                        duration: status.durationMillis
                    })
                    
                setStorageFiles(await fetchStorageFiles())        
                await tempAudio.unloadAsync() // Выгрузка из переменной для очистки памяти
                setRecordingPausedPositionMillis(0)
                setRecordingPositionMillis(0)
                setRecordingTitle('')

            }
        

    }

    /// Функции взаимодействия с записью
    const recordStart = async () => {
        if (!(await Audio.getPermissionsAsync()).granted) {
            await Audio.requestPermissionsAsync()
        }

        // Инициализация Recording объекта. 
        if (!(await recording.current.getStatusAsync()).canRecord) {
            // После того как Recording был завершен через stopAndUnload необходимо создать новый объект Recording
            recording.current = new Audio.Recording

            await recording.current.prepareToRecordAsync({android:{extension:'.mp3'}, ios:{extension:'.mp3'}})
            
        }

        
        if ((await recording.current.getStatusAsync()).canRecord) {
            try {
                await recording.current.startAsync()
                await recording.current.setOnRecordingStatusUpdate((status) => {
                    handleRecordingUpdate(status)
                })

                setIsRecording(true)
                setIsPaused(false)
            } catch (error) {
                console.error('Error occured while trying to record:',error);
            }  
        }
    }

    const recordPause = async () => {
        setIsPaused(true)
        setIsRecording(false)
        await recording.current.pauseAsync()
    }

    const recordStop = async () => {

        // Проверка на то, что юзер дал имя записи
        if (recordingTitle == '') {
            alert("Введите название записи")
        } else {
            setIsPaused(false)
            setIsRecording(false)
            await recording.current.stopAndUnloadAsync()    // Останавливает объект Recording целиком. После этого чтобы записывать нужен новый объект Recording
            const recordingUri = recording.current.getURI() // Вернет null если объект Recording по какой-то причине не имеет uri 
            handleRecordingFile(recordingUri)
            setIsModalShown(false)
        }

        
    }
    ///
    
  return (
    <View>
        <ScrollView>
            <View style={{paddingHorizontal:'4%', alignItems:'center'}}>
                <View style={{flex:1, justifyContent:'space-between', flexDirection:"row", alignItems:'center', gap:80}}>
                    <Pressable onPress={()=> navigation.goBack()}>
                        <Text style={styles.subtitleText}>
                            Назад
                        </Text>
                    </Pressable>
                        
                    <Pressable onPress={()=>setIsModalShown(true)}>
                        <MaterialCommunityIcons name='plus-circle-outline' color="#646463" size={30}/>
                    </Pressable>
                </View>
                <View style={{alignContent:"center"}}>
                    <View style={[styles.card3]}>
                        <Text style={styles.cardRecordsText}>
                            Мои Записи
                        </Text>             
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
                                    <Pressable onPress={() => isPlaying && currentIndex == file.uuid ? pauseAudio() : playAudio(`${file.uri}`, file.uuid, file.name)}>
                                        <AntDesign name={(isPlaying && currentIndex === file.uuid) ? "pausecircle" : "play"} size={30} color="#3C62DD" />
                                    </Pressable>
                                </View>
                            ))
                        }
                    </View>
                </View>
            </View>
        </ScrollView>
        <Modal  transparent={true} animationType="slide" visible={isModalShown}  onRequestClose={()=>{setIsModalShown(false)}} onDismiss={()=>{setIsModalShown(false)}}>
            <Pressable onPress={()=> setIsModalShown(false) } style={styles.centeredView}>
                <View >
                    <TouchableWithoutFeedback>
                    <View style={styles.modalView}>
                        <Text style={[styles.modalFolderText]}>
                            Создание Новой Записи
                        </Text>
                        <View style={{marginBottom:'10%', marginTop:'10%' ,alignItems:'center'}}>
                            <Text style={[styles.cardTime, {color:"#FFF", fontSize:14}]}>
                                {
                                    isRecording
                                    ? formatTime(recordingPositionMillis || 0)
                                    : formatTime( recordingPausedPositionMillis || 0)
                                }
                            </Text>

                            {
                            isPaused ? <TextInput style={{borderRadius:16 ,width:240, height:48, backgroundColor:"#FFF", fontFamily:"SF Pro Rounded Bold", paddingLeft:16}} placeholder='Название Записи' onChangeText={setRecordingTitle}></TextInput>
                            : <></>
                            }
                            
                        </View>
                        <View>
                            <Button style={{marginBottom:16}} labelStyle={{fontFamily:'SF Pro Rounded Bold', color:"#3C62DD"}} onPress={() => isRecording ? recordPause() : recordStart() } buttonColor='#FFF'  mode='contained'>
                                {
                                    isRecording ? "Пауза" : 
                                        isPaused ? "Продолжить Запись" : "Начать Запись"
                                    
                                }
                            </Button>
                            {
                                isPaused ? <Button labelStyle={{fontFamily:'SF Pro Rounded Bold', color:"#3C62DD"}} onPress={() => {recordStop()}}  buttonColor='#FFF'  mode='contained'>
                                    Сохранить Запись
                                </Button> : <></>
                            }
                        </View>
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
    },
    subtitleText:{
        fontFamily:"SF Pro Rounded Semibold",
        fontSize:24,
        color:"#070600",
        opacity:0.61,
        textAlign:'left',
        marginRight:"43%"
    },
    card3: {
        backgroundColor: '#FFF',
        width: width * 0.90,
        height: height * 0.15,
        marginBottom: '2%',
        borderRadius: 15,
        paddingTop: '5%',
        paddingLeft: '6%',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth:1,
        borderColor:"#656463"
    },
    cardRecordsText: {
        position: 'absolute',
        fontFamily: 'SF Pro Rounded Bold',
        fontSize: 28,
        color: "#656463",
        // width: '80%',
        left: '2%',
        top: '65%'
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
    modalFolderText: {
        color: "#FFF",
        fontSize: 20,
        textAlign: "center",
        fontFamily: 'SF Pro Rounded Regular',

    },
    cardText: {
        gap: 6
    },
    cardTextTitle: {
        fontFamily: 'SF Pro Rounded Bold',
        fontSize: 16,
        color: "#5c5c5c"
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
        fontFamily: 'SF Pro Rounded Regular',
        fontSize: 12,
        color: "#656463"
    }
})

export default UserRecords