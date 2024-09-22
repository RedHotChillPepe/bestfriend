import { Text, View, StyleSheet, TouchableOpacity,ScrollView, Pressable, Dimensions, Modal } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useSound } from '../../../context/SoundProvider';
import * as FileSystem from 'expo-file-system';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { Audio } from "expo-av";

const { width, height } = Dimensions.get('window');

export default function Riddles({ route }) {
    const { audioData } = route.params;

    const navigation = useNavigation();

    const {isPlaying, positionMillis, pausedPosition, 
        currentIndex, setIsPlaying, setPositionMillis, 
    setPausedPosition, playAudio, pauseAudio, formatTime} = useSound()

    const [pressedIn, setPressedIn] = useState(null)
    const [modalDownloadVisible, setModalDownloadVisible] = useState(false)
    const [modalFilename, setModalFilename] = useState('')
    const [modalUri, setModalUri] = useState('')
    const [downloadPercent, setDownloadPercent] = useState(0)

    const [fileuuid, setFileuuid] = useState("")

    /// AsyncStorage локальное хранилище на телефоне
    const getFolderData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('userFolder');
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            // error reading value
        }
    };

    const fetchStorageFiles = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem(fileuuid);
          return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
          // error reading value
          console.error(e);
        }
    };
    
    
    const storeFolderData = async (value) => {
        try {  
            const jsonValue = JSON.stringify(value);
                
            console.log("jsonValue: " + jsonValue)
            console.log(await getFolderData() != null)
            if (await getFolderData() != null) {
    
                const replacedFolderData =  JSON.stringify(await getFolderData()).replace("[","").replace("]","")
                console.log("replacedFolderData: " + replacedFolderData)
    
                const combinedString = "[" + replacedFolderData + ',' + jsonValue + "]"
                await AsyncStorage.setItem('userFolder', combinedString)
                    
                   
                console.log("Combined string:" +  combinedString)
            } else {
                await AsyncStorage.setItem('userFolder',  "[" + jsonValue + "]");
                console.log("storeFolderData 1: " + "[" + jsonValue + "]")
            }
                
                        
        } catch (e) {
            // saving error
            console.error(e);
        }
    };

    const storeStorageFiles = async (value) => {
        try {
            
            const jsonValue = JSON.stringify(value);
            console.log("file data: ", jsonValue);
            if (await fetchStorageFiles() != null) {
                const replacedFileData =  JSON.stringify(await fetchStorageFiles()).replace("[","").replace("]","")
                const combinedString = "[" + replacedFileData + ',' + jsonValue + "]"
                await AsyncStorage.setItem(fileuuid, combinedString)
            } else {
                await AsyncStorage.setItem(fileuuid,  "[" + jsonValue + "]");
            }
            console.log("fileuuid: ",fileuuid);
                    
        } catch (e) {
          // saving error
          console.error(e);
        }
    };
    
    clearAll = async () => {
        try {
            await AsyncStorage.clear()
        } catch(e) {
            // clear error
        }
            setUserFolders([])
          
            console.log('Done.')
    }
    ///

    const createUserFolder = async() => {
        const newUUID = uuid.v4()
        await storeFolderData({
            "text":`Скачанные Файлы`,
            "Fileuuid":`${newUUID}`, 
            "name": "card3", 
            "cardTextStyle":"card3Text" , 
            "cardTextPressedStyle":"card3Pressed",
            "onPressDestination": "DynamicFolder", 
            "onPressPayload":`{"text": "Скачанные Файлы", "Fileuuid":"${newUUID}"}`
        }) // темплейт для JSON файла пользовательской папки
        setFileuuid(newUUID)
    }


    const handlePressIn = (index) => {
        setPressedIn(index)
    }
    const handlePressOut = () => {
        setPressedIn(null)
    }

    const handleSaveToAsync = async (result) => {
        const folderData = await getFolderData()
        let isThereDownloadFolder = false
        let downloadFolderUUID = ""
        if (folderData != null) {
            for (let index = 0; index < folderData.length; index++) {
                const element = folderData[index].text;
                if (element == 'Скачанные Файлы') {
                    isThereDownloadFolder = true
                    downloadFolderUUID = folderData[index].Fileuuid
                    setFileuuid(downloadFolderUUID)
                    console.log(typeof(downloadFolderUUID));
                }
            }
        }

        if (folderData == null || isThereDownloadFolder != true) {
            await createUserFolder()
        }

        
        if (isThereDownloadFolder) {
            if (result.uri != undefined) {
                console.log(downloadFolderUUID);
                console.log(result.uri);
                console.log(modalFilename);


                const newUUID = uuid.v4()
                
                const tempAudio = new Audio.Sound()                         // #FIXME
                await tempAudio.loadAsync({uri:result.uri})         // Должен быть способ получать Duration из файла 
                const status = await tempAudio.getStatusAsync()             // без загрузки его в переменную

                await storeStorageFiles({
                    name:modalFilename,
                    uri:result.uri,
                    uuid:`${newUUID}`,
                    duration: status.durationMillis
                })
            
                await tempAudio.unloadAsync() // Выгрузка из переменной для очистки памяти  
            }
        }

    }

    const handleStatus = async (status) => {
        if (status.totalBytesWritten != 0 && status.totalBytesExpectedToWrite != 0) {
            const downloadPercent = Math.trunc((status.totalBytesWritten/status.totalBytesExpectedToWrite) * 100)
            setDownloadPercent(downloadPercent)
        }
    }

    const handleDownload = async (uri) => {
        const cutName = modalUri.replace("https://mishka-l3tq.onrender.com/uploads/","")
        const toUri = FileSystem.documentDirectory + cutName
        console.log(cutName);

        const downloadResumable = FileSystem.createDownloadResumable(
            uri,
            toUri,
            {},
            (status) => {handleStatus(status)}
        )
        await downloadResumable.downloadAsync()
        .then(
            (result)=>{
                console.log("downloadresult:", result);
                handleSaveToAsync(result)
            })
            
        

    }

    const handleModalOpen = async (uri, name) => {
        setModalDownloadVisible(true)
        setModalFilename(name)
        setModalUri(uri)
    }

    const handleModalClose = async() => {
        setModalDownloadVisible(false)
        setDownloadPercent(0)
        setModalFilename("")
        setModalUri("")
    }

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
                            <Pressable
                            onPressIn={() => handlePressIn(index)}
                            onPressOut={() => handlePressOut()}
                            onLongPress={() => handleModalOpen(item.audioFile, item.name)}
                            key={index} 
                            style={[styles.card, pressedIn === index && styles.pressedCard]}>
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
                            </Pressable>
                        ))}
                    </View>
                </View>
            </ScrollView>
            <Modal  transparent={true} animationType="slide" visible={modalDownloadVisible}  onRequestClose={()=>{handleModalClose()}} onDismiss={()=>{handleModalClose()}}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalFolderText}>
                            Скачать {modalFilename}?
                        </Text>
                        <Text style={styles.modalFolderText}>
                            {
                                downloadPercent == 0
                                ? ""
                                : downloadPercent == 100
                                    ? "Скачивание Завершено!"
                                    : downloadPercent+"%"
                            }
                        </Text>
                        <View>
                            {
                                downloadPercent != 100
                                ? downloadPercent > 0 
                                    ? <></>
                                    : <Button style={{borderRadius:8, width:115, fontSize:20}} textColor='#3C62DD' onPress={()=>handleDownload(modalUri)} buttonColor='#FFF' mode='contained'>Скачать</Button>
                                : <Button style={{borderRadius:8, width:115, fontSize:20}} textColor='#3C62DD' onPress={()=>handleModalClose()} buttonColor='#FFF' mode='contained'>Закрыть</Button>
                            }
                            
                        </View>
                    </View>
                </View>
            </Modal>
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
    pressedCard:{
        backgroundColor:'#dedede'
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

    }
});