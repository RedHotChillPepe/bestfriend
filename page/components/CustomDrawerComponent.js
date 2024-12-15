import React from 'react'
import {DrawerContentScrollView,DrawerItem,DrawerItemList,} from '@react-navigation/drawer';
import {StyleSheet, Text, View, Dimensions } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


function CustomDrawerComponent(props) {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { width, height } = Dimensions.get('window');
    

  return (
        <DrawerContentScrollView style={{flex: 1, paddingTop: insets.top,
            paddingBottom: insets.bottom,}} {...props}>
            <View style={{backgroundColor:'#3C62DD', borderBottomRightRadius:24, flexDirection:'column', justifyContent:'space-between', paddingTop: 40}}>
                <View>
                    {/* <DrawerItem  icon={() => <FontAwesome name='user' size={24} color={"#FFF"}/>} label={"Профиль"} labelStyle={styles.styledLabel}/> */}
                    <DrawerItem  icon={() => <View style={styles.iconView}><Ionicons name="library" size={24} color="#fff" /></View>} label={"Библиотека"} labelStyle={styles.styledLabel} contentStyle={{alignItems:'center'}} onPress={() => {navigation.navigate("ЛУЧШИЙ ДРУГ")}}/>
                    <DrawerItem  icon={() => <View style={styles.iconView}><Entypo name="help" size={24} color="#fff" /></View>} label={"Помощь"} labelStyle={styles.styledLabel} contentStyle={{alignItems:'center'}} onPress={() => {navigation.navigate("HelpPage")}}/>
                    <DrawerItem  icon={() => <View style={styles.iconView}><FontAwesome6 name="info" size={24} color="#fff" /></View>} label={"О приложении"} labelStyle={styles.styledLabel} onPress={() => {navigation.navigate("AboutUs")}} />
                </View>
                <View style={{alignItems:'center', paddingBottom:'10%', paddingTop:'10%'}}>
                    <Button onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={{borderRadius:12, width:115}} textColor='#3C62DD' buttonColor='#FFF' mode='contained'>Закрыть</Button>
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
    },
    iconView: {
        width: 32, 
        alignItems:'center'
    }
})

export default CustomDrawerComponent