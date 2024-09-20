import React from 'react'
import {DrawerContentScrollView,DrawerItem,DrawerItemList,} from '@react-navigation/drawer';
import {StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { Button } from 'react-native-paper';




function CustomDrawerComponent(props) {
    const navigation = useNavigation();
  return (
        <DrawerContentScrollView style={{marginTop:'15%'}} {...props}>
            <View style={{backgroundColor:'#3C62DD', height:600, borderBottomRightRadius:25, flexDirection:'column', justifyContent:'space-between'}}>
                <View>
                    <DrawerItem  icon={() => <FontAwesome name='user' size={24} color={"#FFF"}/>} label={"Профиль"} labelStyle={styles.styledLabel}/>
                    <DrawerItem  icon={() => <FontAwesome name='book' size={24} color={"#FFF"}/>} label={"Библиотека"} labelStyle={styles.styledLabel} onPress={() => {navigation.navigate("ЛУЧШИЙ ДРУГ")}}/>
                    <DrawerItem  icon={() => <FontAwesome name='paper-plane' size={24} color={"#FFF"}/>} label={"Мессенджеры"} labelStyle={styles.styledLabel}/>
                    <DrawerItem  icon={() => <FontAwesome name='question' size={40} color={"#FFF"}/>} label={"Помощь"} labelStyle={styles.styledLabel}/>
                    <DrawerItem  icon={() => <FontAwesome name='info' size={40} color={"#FFF"}/>} label={"О приложении"} labelStyle={styles.styledLabel} onPress={() => {navigation.navigate("AboutUs")}} />
                </View>
                <View style={{alignItems:'center', paddingBottom:'10%'}}>
                    <Button onPress={() => navigation.goBack()} style={{borderRadius:8, width:115}} textColor='#3C62DD' buttonColor='#FFF' mode='contained'>Закрыть</Button>
                </View>
            </View>        
        </DrawerContentScrollView>
        
  )
}

const styles = StyleSheet.create({
    styledLabel:{
        color:"#FFF", 
        fontFamily:"SF Pro Rounded Regular",
        fontSize:20

    }
})

export default CustomDrawerComponent