import { ScrollView, StyleSheet, Text, View } from "react-native"
import React, { useState, useEffect } from 'react';


export default function DynamicFolder({route, navigation}) {
    
    const route_params = route.params
    const { text } = route.params

    useEffect(() => {
        //const {text} = route.params;
        const route_params = JSON.parse(route.params)
        console.log(route_params)
        //navigation.setOptions({title:`${route_params.text}`})
    
      return () => {
        
      }
    }, []);
    
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
                <Text>{route_params}</Text>
            </ScrollView>        
        </View>
    )
   
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center'
    }
})