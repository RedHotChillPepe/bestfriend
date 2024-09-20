import React, { useEffect, useState } from 'react'
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Calendar from 'expo-calendar';



const { width, height } = Dimensions.get('window');

function AlarmPage({route, navigation}) {
    const [modalPlusVisible, setModalPlusVisible] = useState(false);
    const [alarmTitle, setAlarmTitle] = useState('')
    const [alarmSubtitle, setAlarmSubtitle] = useState('')
    const [calendars, setCalendars] = useState([])
    const [calendarId, setCalendarId] = useState('')

    const testDate = new Date().setMinutes(57)
    const endtestdate = new Date().setMinutes(59)

    console.log(testDate);
    

   /*  const createEvent = async () => {
        const response =  await Calendar.createEventAsync('1', {
            accessLevel:'default',
            title:'text',
            allDay:false,
            calendarId:'1',
            alarms:[{
                method: Calendar.AlarmMethod.ALARM,
                relativeOffset: "-1"
            }],
            startDate: testDate,
            endDate: endtestdate

        })
        console.log(response);
        
    }


    useEffect(() => {

        const obtainCalPermissions = async () => {
            const {status} = await Calendar.getCalendarPermissionsAsync()
            if (status != 'granted') {
                await Calendar.requestCalendarPermissionsAsync()
            }
        }
        obtainCalPermissions()
        
        const initialFillup = async () => {
            const getCalendars = async () => {
                await Calendar.getCalendarsAsync().then(
                    (result) => {
                        setCalendars(result)
                    }
                )
            }

            await getCalendars()

            const createCalendar = async () => {
                const defaultCalendarSource = {isLocalAccount:true, name:'Mishka Calendar'}

                await Calendar.createCalendarAsync({
                        isPrimary:true,
                        isSynced:true,
                        isVisible:false,
                        allowedReminders:[Calendar.AlarmMethod.ALARM, Calendar.AlarmMethod.ALERT],
                        title:'MishkaRaspisanie',
                        color:"#3C62DD",
                        source:defaultCalendarSource,
                        name:'MishkaAlarm',
                        ownerAccount:'personal',
                        accessLevel:Calendar.CalendarAccessLevel.OWNER
                }).then((result) => {
                    setCalendarId(result)
                })
                
            }
            
            if (Object.keys(calendars).length == 0) {
                createCalendar()
                
            }

        }
        // initialFillup()
      return () => {
        
      }
    }, []) */
    

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
                        
                        <Pressable onPress={()=>setModalPlusVisible()}>
                            <MaterialCommunityIcons name='plus-circle-outline' color="#000" size={30}/>
                        </Pressable>
                    </View>
                    <View style={{alignContent:"center"}}>
                        <View style={[styles.card4]}>
                            <Text style={styles.cardAlarmText}>
                                Расписание
                            </Text>
                            <FontAwesome5 name="plus-square" size={120} color="#FFFFFF"  style={styles.cardIcon}/>                    
                        </View>
                    </View>
            </View>
            <View style={{width: '100%', alignItems: 'center'}}>
                <View style={{width: '90%'}}>
                        <Text>
                            {JSON.stringify(calendars)}
                        </Text>
                </View>
            </View>
        </ScrollView>

        <Modal  transparent={true} animationType="slide" visible={modalPlusVisible}  onRequestClose={()=>{setModalPlusVisible(false)}} onDismiss={()=>{setModalPlusVisible(false)}}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalFolderText}>
                            Создание Нового События
                        </Text>
                        <View style={{marginBottom:'10%', marginTop:'10%', borderWidth:1,}}>
                            <TextInput onChangeText={setAlarmTitle} style={{padding:'200px'}} autoFocus={true} placeholder='Название События'></TextInput>
                            
                        </View>
                        <View style={{marginBottom:'10%', marginTop:'10%', borderWidth:1,}}>
                            <TextInput onChangeText={setAlarmSubtitle} style={{padding:'200px'}} placeholder='Описание События'></TextInput>
                        </View>
                        <View>
                            <Button buttonColor='#00B232'  mode='contained'>Выбрать Время</Button>
                        </View>
                    </View>
                </View>
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
    card4: {
        backgroundColor: '#00B232',
        width: width * 0.90,
        height: height * 0.15,
        borderRadius: 16,
        paddingTop: '5%',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cardAlarmText: {
        position: 'absolute',
        fontFamily: 'SF Pro Rounded Bold',
        fontSize: 28,
        color: "#fff",
        // width: '80%',
        left: '2%',
        top: '65%'
    },
    cardIcon: {
        opacity: 0.35,
        position: 'absolute',
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
        backgroundColor: "white",
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
        color: "#5c5c5c",
        fontSize: 14,
        textAlign: "center",
        fontFamily: 'Comfortaa_500Medium',
        borderBottomWidth:1,

    },

})

export default AlarmPage