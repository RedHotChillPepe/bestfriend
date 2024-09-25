import { Text, View, TouchableOpacity, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Modal, Linking, Alert, Pressable, TextInput, TouchableWithoutFeedback } from 'react-native';
import React, { useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function ReadySoundsScreen() {
    const [pressedCard, setPressedCard] = useState(null);
    const [audioData, setAudioData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalPlusVisible, setModalPlusVisible] = useState(false);
    const [isModalFolder, setIsModalFolder] = useState(false)

    const [userFolders, setUserFolders] = useState([])// изменяется после рендера чтобы отображать новые папки
    const [userFolderName, setUserFolderName] = useState('')

    const isFocused = useIsFocused()
    
    const navigation = useNavigation();

    

    /// AsyncStorage локальное хранилище на телефоне
    const getFolderData = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('userFolder');
          return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
          // error reading value
        }
      };



    const storeFolderData = async (value) => {
        try {
            
            const jsonValue = JSON.stringify(value);
            if (await getFolderData() != null) {

                const replacedFolderData =  JSON.stringify(await getFolderData()).replace("[","").replace("]","")

                const combinedString = "[" + replacedFolderData + ',' + jsonValue + "]"
                await AsyncStorage.setItem('userFolder', combinedString)
                
               
                console.log("Combined string:" +  combinedString)
            } else {
                await AsyncStorage.setItem('userFolder',  "[" + jsonValue + "]");
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
        setUserFolders([])
      
        console.log('Done.')
    }
      ///
    const createUserFolder = async() => {
        if (userFolderName == '') {
            alert("Заполните Имя Папки")
        } else {
            const newUUID = uuid.v4()

            await storeFolderData({
            "text":`${userFolderName}`,
            "Fileuuid":`${newUUID}`, 
            "name": "card3", 
            "cardTextStyle":"card3Text" , 
            "cardTextPressedStyle":"card3Pressed",
            "onPressDestination": "DynamicFolder", 
            "onPressPayload":`{"text": "${userFolderName}", "Fileuuid":"${newUUID}"}`
            }) // темплейт для JSON файла пользовательской папки
            console.log("Create User Folder:" + userFolderName)
            setUserFolders([...await getFolderData()])
            setModalPlusVisible(false)
            setUserFolderName('')
        }
        
    }

    useEffect(() => {

        
        
        
        const initialFillup = async () =>{
            if (await getFolderData() != null) { // проверка на пустоту localstorage
                setUserFolders([...await getFolderData()])// изначальное заполненеие State с Local Storage папками
                
            } 
          //console.log("initilafillup:" + JSON.stringify(await getFolderData()) )
          
          
        }
          initialFillup();
        return () => {
        }
    }, [isFocused])

    useEffect(() => {
        const fetchmedata = async () => {
           await fetch('https://bestfriend-back.onrender.com/audio/all')
            .then(response => response.json())
            .then (data => {
                setAudioData(data);
            }).then(() => {
                //console.log(audioData)
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setLoading(false);
            }); 
        }

        fetchmedata()

    }, []);


    const handlePressIn = (index) => {
        setPressedCard(index);
    };

    const handlePressOut = () => {
        setPressedCard(null);
    };

    const getFilteredData = (category) => {
        return audioData.filter(item => item.category === category);
    };

    // функция вызывается во время рендера чтобы передавать data между страницами
    const handlePayload = (payload) => { 
        if (payload.audioData != undefined) { // проверка на статичные cards которые получают data с сервера
            return {audioData: getFilteredData(payload.audioData)} 
        } else {
            return payload
        }
    }

    const handleModalFolder = async (folder) => {
        setIsModalFolder(true)
    }

   


    const cards = [
        { text: 'Сказки', name:'card0', icon: <FontAwesome name="book" size={130} color="#FFFFFF" style={styles.cardIcon} />,"cardTextStyle":"cardText" , "cardTextPressedStyle":"cardPressed", 'onPressDestination': `fairyTales`,  'onPressPayload':{ "audioData": 'сказка' } },
        { text: 'Загадки', name:'card1', icon: <FontAwesome name="question" size={150} color="#FFFFFF" style={styles.cardIcon} />,"cardTextStyle":"cardText" , "cardTextPressedStyle":"cardPressed", 'onPressDestination': `Riddles`, 'onPressPayload':{ "audioData": 'загадка' } },
        { text: 'Фразы помощники', name:'card2', icon: <FontAwesome5 name="hands-helping" size={110} color="#FFFFFF"  style={styles.cardIcon}/>,"cardTextStyle":"cardText" , "cardTextPressedStyle":"cardPressed", 'onPressDestination': 'Help', 'onPressPayload':{ "audioData": 'помощь'} },
    ];


    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#a4ca79" />
            ) : (
                <ScrollView  contentContainerStyle={{ alignItems: 'center'}}>
                    <View style={{flex:1, justifyContent:'space-between', flexDirection:"row", alignItems:'center', paddingTop:115, paddingBottom: 24}}>
                        <Pressable style={{paddingRight:50}} onPress={()=> clearAll()}>
                            <Text style={styles.subtitleText}>
                                Библиотека
                            </Text>
                        </Pressable>
                        
                        <Pressable onPress={()=>setModalPlusVisible(true)}>
                            <MaterialCommunityIcons name='plus-circle-outline' color="#646463" size={30}/>
                        </Pressable>
                    </View>
                    <View style={styles.userFoldersBumper}>
                        {cards.map((card, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => navigation.navigate(card.onPressDestination, handlePayload(card.onPressPayload))}
                                onPressIn={() => handlePressIn(index)}
                                onPressOut={handlePressOut}
                                activeOpacity={1}
                                setUserFolders={setUserFolders}
                                style={[styles[card.name] , pressedCard === index && styles[card.cardTextPressedStyle]]}
                            >
                                <Text style={styles[card.cardTextStyle]}>
                                    {card.text}
                                </Text>
                                {card.icon}
                            </TouchableOpacity>
                        ))}

                        {/* <TouchableOpacity
                            onPress={() => navigation.navigate('AlarmPage')}
                            onPressIn={() => handlePressIn(cards.length)}
                            onPressOut={handlePressOut}
                            activeOpacity={1}
                            style={[styles.card4, pressedCard === cards.length && styles.cardPressed]}
                        >
                                <Text style={styles.cardText}>
                                    Расписание
                                </Text>
                            <FontAwesome5 name="plus-square" size={120} color="#FFFFFF"  style={styles.cardIcon}/>
                        </TouchableOpacity> */}


                        <TouchableOpacity
                            onPress={() => navigation.navigate('MyRecording')}
                            onPressIn={() => handlePressIn(cards.length)}
                            onPressOut={handlePressOut}
                            
                            activeOpacity={1}
                            style={[styles.card3, pressedCard === cards.length && styles.card3Pressed]}
                        >
                                <Text style={styles.card3Text}>
                                    Мои Записи
                                </Text>
                        </TouchableOpacity>

                        
                            {userFolders.map((card, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => navigation.navigate(card.onPressDestination, handlePayload(card.onPressPayload))}
                                    onPressIn={() => handlePressIn(index + cards.length+1)}
                                    onPressOut={handlePressOut}
                                    onLongPress={()=>handleModalFolder(card)}
                                    activeOpacity={1}
                                    
                                    style={[styles[card.name] , pressedCard === (index + cards.length+1)  && styles[card.cardTextPressedStyle]]}
                                    >
                                        <Text style={styles[card.cardTextStyle]}>
                                            {card.text}
                                        </Text>
                                    {card.icon}
                                </TouchableOpacity>
                            ))}
                       
                        
                    </View>
                </ScrollView>
            )}

            <Modal  transparent={true} animationType="slide" visible={modalPlusVisible}  onRequestClose={()=>setModalPlusVisible(false)} onDismiss={()=>setModalPlusVisible(false)}>
                <Pressable onPress={() => setModalPlusVisible(false)} style={styles.centeredView}>
                    <View >
                        <TouchableWithoutFeedback>
                            <View style={styles.modalView}>
                                <Text style={styles.modalFolderText}>
                                    Введите название папки:
                                </Text>
                                <View style={{marginBottom:'10%', marginTop:'10%', backgroundColor:'#FFF', borderRadius:16}}>
                                    <TextInput placeholderTextColor={"#848484"} onChangeText={setUserFolderName} style={{fontSize:20, height:48, width:240, fontFamily:'SF Pro Rounded Regular', paddingLeft:15}} autoFocus={true} placeholder='Название'></TextInput>
                                </View>
                                <View>
                                    <Button style={{borderRadius:8, width:115, fontSize:20}} textColor='#3C62DD' onPress={()=>createUserFolder()} buttonColor='#FFF' mode='contained'>Создать</Button>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </Pressable>
            </Modal>

            <Modal  transparent={true} animationType="slide" visible={isModalFolder}  onRequestClose={()=>setIsModalFolder(false)} onDismiss={()=>setIsModalFolder(false)}>
                <Pressable style={styles.centeredView} onPress={()=> setIsModalFolder(false)}>
                    <View>
                    <TouchableWithoutFeedback>
                            <View style={styles.modalView}>
                                <View>
                                    <Button style={{borderRadius:8, width:220, fontSize:20, marginBottom:16}} textColor='#3C62DD'  buttonColor='#FFF' mode='contained'>Переименовать</Button>
                                </View>
                                
                                <View>
                                    <Button style={{borderRadius:8, width:220, fontSize:20}} textColor='#3C62DD'  buttonColor='#FFF' mode='contained'>Удалить</Button>
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
        justifyContent: 'center',
    },
    card0: {
        backgroundColor: '#FEC513',
        width: width * 0.9,
        height: height * 0.15,
        marginBottom: 8,
        borderRadius: 24,
        paddingBottom: 0,
        paddingLeft: '6%',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    card1: {
        backgroundColor:'#FF7427',
        width: width * 0.90,
        height: height * 0.15,
        marginBottom: 8,
        borderRadius: 24,
        paddingTop: '5%',
        paddingLeft: '6%',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    card2: {
        backgroundColor: '#3C62DD',
        width: width * 0.90,
        height: height * 0.15,
        marginBottom: 8,
        borderRadius: 24,
        paddingTop: '5%',
        paddingLeft: '6%',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'space-between'
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
    card4: {
        backgroundColor: '#00B232',
        width: width * 0.90,
        height: height * 0.15,
        marginBottom: '2%',
        borderRadius: 24,
        paddingTop: '5%',
        paddingLeft: '6%',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardPressed: {
        backgroundColor: '#608c2f',
    },
    card3Pressed: {
        backgroundColor: '#dbd7d7',
    },
    cardText: {
        position: 'absolute',
        fontFamily: 'SF Pro Rounded Bold',
        fontSize: 28,
        color: "#fff",
        // width: '80%',
        left: 8,
        top: 50
    },
    subtitleText:{
        fontFamily:"SF Pro Rounded Semibold",
        fontSize:24,
        color:"#070600",
        opacity:0.61,
        textAlign:'left',
        marginRight:"43%"
    },
    card3Text: {
        position: 'absolute',
        fontFamily: 'SF Pro Rounded Bold',
        fontSize: 28,
        color: "#656463",
        // width: '80%',
        left: 8,
        top: 50
    },
    cardTextBot: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 14,
        color: "#ddd",
        width: '80%'
    },
    cardIcon: {
        opacity: 0.35,
        position: 'absolute',
        bottom: "-22%",
        right: '8%'
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
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 4,
        marginTop: 10,
        alignItems: "center",
        width: 120
    },
    buttonClose: {
        backgroundColor: "white",
    },
    textStyle: {
        color: "#5c5c5c",
        fontSize: 16,
        textAlign: "center",
        fontFamily: 'Comfortaa_700Bold'
    },
    userFoldersBumper:{
        
    },
    modalText: {
        color: "#5c5c5c",
        fontSize: 19,
        marginBottom: 10,
        textAlign: "center",
        fontFamily: 'Comfortaa_500Medium'
    },
    modalFolderText: {
        color: "#FFF",
        fontSize: 20,
        textAlign: "center",
        fontFamily: 'SF Pro Rounded Regular',

    }
});