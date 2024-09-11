import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import React, { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker'


export default function DynamicFolder({route, navigation}) {
    
   const [routeParams, setRouteParams] = useState([]);

    useEffect(() => {   
        setRouteParams(JSON.parse(route.params));
        //console.log(route.params);
        
        return () => {
        setRouteParams({})
      }
    }, []);
    
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
                        
                        <Pressable onPress={async () => (await DocumentPicker.getDocumentAsync({type:"audio/*"}))} style={{paddingRight:'4%'}}>
                            <MaterialCommunityIcons name='plus-circle-outline' color="#000" size={30}/>
                        </Pressable>
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
    subtitleText:{
        fontFamily:"SF Pro Rounded Semibold",
        fontSize:24,
        color:"#070600",
        opacity:0.61,
    },
})