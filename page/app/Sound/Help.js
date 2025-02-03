import { Text, View, StyleSheet, TouchableOpacity,ScrollView, Pressable, Dimensions, Modal, TouchableWithoutFeedback } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSound } from '../../../context/SoundProvider';
import * as FileSystem from 'expo-file-system';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { Audio } from "expo-av";

const { width, height } = Dimensions.get('window');

export default function Training({ route }) {
    const { audioData } = route.params;
   
    const {isPlaying, positionMillis, pausedPosition, 
        currentIndex, setIsPlaying, setPositionMillis, setPausedPosition, 
    playAudio, pauseAudio, formatTime, handlePlaylistAdd} = useSound()

    const navigation = useNavigation();

    const [pressedIn, setPressedIn] = useState(null)
    const [modalDownloadVisible, setModalDownloadVisible] = useState(false)
    const [modalFilename, setModalFilename] = useState('')
    const [modalUri, setModalUri] = useState('')
    const [downloadPercent, setDownloadPercent] = useState(0)
    const [isDownload, setIsDownload] = useState(false)

    const folderuuid = useRef("")
    const refModalFile = useRef(null)

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
          const jsonValue = await AsyncStorage.getItem(folderuuid.current);
          return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
          // error reading value
          console.error(e);
        }
    };
    
    
    const storeFolderData = async (value) => {
        try {  
            const jsonValue = JSON.stringify(value);
                
            //console.log("jsonValue: " + jsonValue)
            console.log(await getFolderData() != null)
            if (await getFolderData() != null) {
    
                const replacedFolderData =  JSON.stringify(await getFolderData()).replace("[","").replace("]","")
                //console.log("replacedFolderData: " + replacedFolderData)
    
                const combinedString = "[" + replacedFolderData + ',' + jsonValue + "]"
                await AsyncStorage.setItem('userFolder', combinedString)
                    
                   
                //console.log("Combined string:" +  combinedString)
            } else {
                await AsyncStorage.setItem('userFolder',  "[" + jsonValue + "]");
                //console.log("storeFolderData 1: " + "[" + jsonValue + "]")
            }
                
                        
        } catch (e) {
            // saving error
            console.error(e);
        }
    };

    const storeStorageFiles = async (value) => {
        try {
            
            const jsonValue = JSON.stringify(value);
            //console.log("file data: ", jsonValue);
            if (await fetchStorageFiles() != null) {
                const replacedFileData =  JSON.stringify(await fetchStorageFiles()).replace("[","").replace("]","")
                const combinedString = "[" + replacedFileData + ',' + jsonValue + "]"
                await AsyncStorage.setItem(folderuuid.current, combinedString).then((result) => {console.log("riddle result",result);
                })
            } else {
                await AsyncStorage.setItem(folderuuid.current,  "[" + jsonValue + "]");
            }
            console.log(" storeStorage folder uuid: ",folderuuid.current);
                    
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
            "onPressDestination": "StoragePage", 
            "onPressPayload":`{"text": "Скачанные Файлы", "Fileuuid":"${newUUID}"}`
        })
        folderuuid.current = newUUID
        console.log("create folder current uuid:", folderuuid.current);
        
    }

    const handleSaveToAsync = async (result) => {
        const folderData = await getFolderData()
        let isThereDownloadFolder = false
        if (folderData != null) {
            for (let index = 0; index < folderData.length; index++) {
                const element = folderData[index].text;
                if (element == 'Скачанные Файлы') {
                    isThereDownloadFolder = true
                    folderuuid.current = folderData[index].Fileuuid
                }
            }
        }

        if (folderData == null || isThereDownloadFolder != true) {
            
                await createUserFolder()

                const newFolderData = await getFolderData()
                for (let index = 0; index < newFolderData.length; index++) {
                    const element = newFolderData[index].text;
                    if (element == 'Скачанные Файлы') {
                        isThereDownloadFolder = true
                    }
                }
            }

        
        if (isThereDownloadFolder) {
            if (result.uri != undefined) {
                //console.log(result.uri);
                //console.log(modalFilename);

                if (folderuuid.current != undefined) {
                    const newUUID = uuid.v4()
                    
                    const tempAudio = new Audio.Sound()                         // #FIXME
                    await tempAudio.loadAsync({uri:result.uri})               // Должен быть способ получать Duration из файла 
                    const status = await tempAudio.getStatusAsync()     // без загрузки его в переменную

                    await storeStorageFiles({
                        name:modalFilename,
                        category:"помощь",
                        uri:result.uri,
                        uuid:`${newUUID}`,
                        duration: status.durationMillis
                    })
            
                    await tempAudio.unloadAsync() // Выгрузка из переменной для очистки памяти
                }


                
                
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
        const cutName = modalUri.replace("https://bestfriend-back-bastit.amvera.io/uploads/","").replace("https://mishka-l3tq.onrender.com/uploads/","")
        const toUri = FileSystem.documentDirectory + cutName
        console.log("cutname: ", cutName);

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

    const handleModalOpen = async (uri, name, file) => {
        setModalDownloadVisible(true)
        setModalFilename(name)
        setModalUri(uri)
        refModalFile.current = file
    }

    const handleModalClose = async() => {
        setModalDownloadVisible(false)
        setDownloadPercent(0)
        setModalFilename("")
        setModalUri("")
        setIsDownload(false)
        refModalFile.current = null
    }

    const toggleDownload = () => {
        setIsDownload(!isDownload)
    }

    const localHandlePlalistAdd = () => {
        if (refModalFile.current != null) {
            handlePlaylistAdd({
                uri:refModalFile.current.audioFile,
                index:refModalFile.current._id,
                name:refModalFile.current.name,
                duration:refModalFile.current.duration
            })
        }
       
    }


    const handlePressIn = (index) => {
        setPressedIn(index)
    }
    const handlePressOut = () => {
        setPressedIn(null)
    }

    
    return (
        <View style={styles.container}>
            {/* <View style={{paddingHorizontal:16, alignItems:'center'}}>
            <View style={{flexDirection: 'row', width: '100%', justifyContent:'space-between', marginBottom: 16}}>
                        <Pressable onPress={()=> navigation.goBack()}>
                            <Text style={styles.subtitleText}>
                                Назад
                            </Text>
                        </Pressable>
                        
                    </View>
                    <View style={{alignContent:"center"}}>
                        <View style={[styles.card2]}>
                            <Text style={styles.cardHelpText}>
                                Фразы Помощники
                            </Text>
                            <FontAwesome5 name="hands-helping" size={100} color="#FFFFFF"  style={styles.cardIcon}/>                    
                        </View>
                    </View>
                
                </View> */}
            <ScrollView contentContainerStyle={{ width:"100%" }}>

                <View style={{ width: '100%', alignItems: 'center' }}>
                    <View style={{ width: width - 32 }}>
                        {audioData.map((item, index) => (
                            <Pressable
                            onPressIn={() => handlePressIn(index)}
                            onPressOut={() => handlePressOut()}
                            key={index}
                            onLongPress={()=>handleModalOpen(item.audioFile, item.name, item)} 
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
            <Pressable onPress={() => handleModalClose()} style={styles.centeredView}>
                <View >
                    <TouchableWithoutFeedback>
                    <View style={styles.modalView}>
                        {
                            !isDownload
                            ?  <View >
                                    <Button onPress={() => localHandlePlalistAdd()} style={{borderRadius:8, width:220, fontSize:20, marginBottom:16}} textColor='#3C62DD'  buttonColor='#FFF' mode='contained'>Добавить в плейлист</Button>
                                    <Button onPress={() => toggleDownload()} style={{borderRadius:8, width:220, fontSize:20, marginBottom:16}} textColor='#3C62DD'  buttonColor='#FFF' mode='contained'>Скачать</Button>
                                </View>
                            :   <View style={{alignItems:'center', flexDirection:"column"}}>
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
                        }
                        
                        
                    </View>
                    </TouchableWithoutFeedback>
                </View> 
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7FF',
        paddingTop: 32,
    },
    card: {
        height: 60,
        paddingHorizontal: 8,
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
    card2: {
        backgroundColor: '#3C62DD',
        width: width - 32,
        height: 96,
        borderRadius: 16,
        paddingTop: 16,
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cardHelpText: {
        position: 'absolute',
        fontFamily: 'SF Pro Rounded Bold',
        fontSize: 28,
        color: "#fff",
        // width: '80%',
        left: '2%',
        top: '65%'
    },
    cardText: {
        gap: 6
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
    subtitleText:{
        fontFamily:"SF Pro Rounded Semibold",
        fontSize:24,
        color:"#070600",
        opacity:0.61,
        textAlign:'left',
        marginRight:"43%"
    },
    cardIcon: {
        opacity: 0.35,
        position: 'absolute',
        bottom: "-24%",
        right: '8%'
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