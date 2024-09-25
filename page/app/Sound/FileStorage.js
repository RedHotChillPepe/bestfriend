import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { useEffect, useRef, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');




export default function FileStorage({route}) {

    const {Fileuuid} = JSON.parse(route.params)

    const [pressedIn, setPressedIn] = useState(null)
    const [audioData, setAudioData] = useState([])
    const isFocused = useIsFocused()
    const navigation = useNavigation();


    /// AsyncStorage локальное хранилище на телефоне
    const fetchStorageFiles = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem(Fileuuid);
          return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
          // error reading value
        }
    };

    useEffect(() => {
        const initialFillup = async () => {        
            
            if (await fetchStorageFiles() != null) {
                setAudioData ( await fetchStorageFiles() )
                
            }
        }
        initialFillup()
      return () => {
        
      }
    }, [isFocused])
    

    const handlePressIn = (index) => {
        setPressedIn(index)
    }
    const handlePressOut = () => {
        setPressedIn(null)
    }

    const getFilteredData = (category) => {
        return {audioData: audioData.filter(item => item.category === category)}
    };

    const cards = [
        {text:'Сказки', onPressPayload:{audioData:"сказка"}},
        {text:'Загадки', onPressPayload:{audioData:"загадка"}},
        {text:'Фразы Помощники', onPressPayload:{audioData:"помощь"}}
    ]

    return(
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{width:'100%'}}>
                <View style={{paddingHorizontal:'4%', alignItems:'center'}} >
                    <View style={{ width:"100%", flex:1, justifyContent:'space-between', flexDirection:"row", alignItems:'center'}}>
                        <Pressable style={{paddingLeft:'4%'}} onPress={()=> navigation.goBack()}>
                            <Text style={styles.subtitleText}>
                                Назад
                            </Text>
                        </Pressable >
                        <Pressable style={{paddingRight:'4%'}}>
                            <MaterialCommunityIcons name='plus-circle-outline' color="#656463" size={30}/>
                        </Pressable>
                    </View>

                    <View style={{alignContent:"center"}}>
                        <View style={styles.card2}>
                            <Text style={styles.cardStorageText}>
                                Хранилище
                            </Text>
                            <FontAwesome name="cloud" size={100} color="#FFFFFF"  style={styles.cardIcon}/>                    
                        </View>
                    </View>                
                </View>
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <View style={{ width: '90%' }}>
                        {
                            cards.map((item, index) => (
                                <Pressable key={index} style={[styles.card, pressedIn === index && styles.pressedCard]}
                                onPressIn={() => handlePressIn(index)}
                                onPressOut={() => handlePressOut()}
                                onPress={() => {navigation.navigate("DynamicStorage", getFilteredData(item.onPressPayload.audioData))}}>
                                    <Feather name="folder" size={30} color={"#656463"}/>
                                    <Text style={[styles.cardTextTitle, {paddingLeft:15}]}>{item.text}</Text>
                                </Pressable>
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
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#656463',
        borderWidth: 1,
        borderRadius:16
    },
    card2: {
        backgroundColor: '#3C62DD',
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
    cardStorageText: {
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
    cardIcon: {
        opacity: 0.35,
        position: 'absolute',
        bottom: "-2%",
        right: '8%'
    },
    pressedCard:{
        backgroundColor:'#dedede'
    },
})