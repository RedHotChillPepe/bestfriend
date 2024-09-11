import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import React, { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker'
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function DynamicFolder({route, navigation}) {
    
   const [routeParams, setRouteParams] = useState([]);
   const [userFile, setUserFile] = useState([]);

    useEffect(() => {   
        setRouteParams(JSON.parse(route.params));
        //console.log(route.params);
        return () => {
        setRouteParams({})
      }
    }, []);

    const handleUserFile = async (value) => {
        setUserFile([])
        setUserFile(value)
    }

    const handleUserPick = async () => {
        await DocumentPicker.getDocumentAsync({type:"audio/*"})
        .then(async response => await response.assets)
        .then (async data => {
            handleUserFile(await data)
            console.log("respose: " + JSON.stringify(data))
            //console.log("userFile: " + JSON.stringify(userFile));
        }) 
        .catch(error => {
            console.error(error);
        })       
        
    }
    
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
                        <Pressable onPress={() => {console.log(JSON.stringify(userFile))}}>
                            <Text>
                                Magic!
                            </Text>
                        </Pressable>
                        <Pressable onPress={()=>{handleUserPick()}}  style={{paddingRight:'4%'}}>
                            <MaterialCommunityIcons name='plus-circle-outline' color="#000" size={30}/>
                        </Pressable>
                    </View>                
                </View>
                <View>
                    <Text>
                        {JSON.stringify(userFile)}
                    </Text>
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
    subtitleText:{
        fontFamily:"SF Pro Rounded Semibold",
        fontSize:24,
        color:"#070600",
        opacity:0.61,
    },
})