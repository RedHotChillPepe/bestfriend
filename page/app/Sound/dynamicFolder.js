import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import React, { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker'
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function DynamicFolder({route, navigation}) {
    
   //const [routeParams, setRouteParams] = useState([]);
   const [storageFiles, setStorageFiles] = useState([]);

   const {text} = JSON.parse(route.params)

    /* useEffect(() => {   
        setRouteParams(JSON.parse(route.params));
        console.log(route.params);
        return () => {
        setRouteParams([])
      }
    }, []); */


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
            
            console.log("jsonValue: " + jsonValue)
            console.log(await fetchStorageFiles() != null)
            if (await fetchStorageFiles() != null) {

                const replacedFileData =  JSON.stringify(await fetchStorageFiles()).replace("[","").replace("]","")
                console.log("replacedFileData: " + replacedFileData)

                const combinedString = "[" + replacedFileData + ',' + jsonValue + "]"
                await AsyncStorage.setItem(text, combinedString)
                
               
                console.log("Combined string:" +  combinedString)
            } else {
                await AsyncStorage.setItem(text,  "[" + jsonValue + "]");
                console.log("storeFolderData 1: " + "[" + jsonValue + "]")
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


    const handleUserFile = async (value) => {
        await storeStorageFiles({
            name:`${value[0].name}`,
            uri:`${value[0].uri}`
        })
        setStorageFiles(await fetchStorageFiles())        
    }




    const handleUserPick = async () => {
        await DocumentPicker.getDocumentAsync({type:"audio/*", copyToCacheDirectory:false})
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
                <View>
                    <Text onPress={() => {clearAll()}}>
                        {JSON.stringify(storageFiles)}
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