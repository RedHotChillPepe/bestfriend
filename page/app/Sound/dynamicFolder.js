import { ScrollView, StyleSheet, Text, View } from "react-native"
import React, { useState, useEffect } from 'react';


export default function DynamicFolder({route, navigation}) {
    
    const route_params = route.params

    useEffect(() => {
        //const {text} = route.params;
        console.log(route.params)
    
      return () => {
        
      }
    }, []);
    
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
                <Text>{JSON.stringify(route_params)}</Text>
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