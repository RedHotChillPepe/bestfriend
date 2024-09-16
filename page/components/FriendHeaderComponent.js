import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

function FriendHeaderComponent() {
    const navigation = useNavigation();

  return (
    <View style={styles.headerBase}>
        <View style={styles.headerInsides}>
            <Pressable onPress={()=>navigation.toggleDrawer()}>
                <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:25, paddingTop:5}}/>
            </Pressable>
            <View style={styles.headerTextView}>
                <Text style={styles.headerText}>ЛУЧШИЙ {'\n'} ДРУГ</Text>
            </View>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    headerBase:{
        backgroundColor:'#3C62DD',
        borderBottomLeftRadius:48,
        borderBottomRightRadius:48,
    },
    headerInsides:{
        display:'flex',
        flexDirection:'row',
        alignItems:'center'
    },
    headerTextView:{
        width:'100%'
    },
    headerText:{
        paddingRight:'25%',
        textAlign:'center',
        fontSize:32,
        fontFamily:'SF Pro Rounded Black',
        color:'#FFF',
    }
})

export default FriendHeaderComponent