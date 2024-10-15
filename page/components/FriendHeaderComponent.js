import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FriendHeaderComponent() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

  return (
    <View style={{ backgroundColor:'#3C62DD', paddingTop: insets.top,}}>
        <View style={styles.headerBase}>
        <View style={styles.headerInsides}>
            <Pressable onPress={()=>navigation.toggleDrawer()}>
                <MaterialCommunityIcons name="menu" color="#FFF" size={36}/>
            </Pressable>
            
                <Text style={styles.headerText}>ЛУЧШИЙ{'\n'}ДРУГ</Text>

            <View style={{width:36, height:36, backgroundColor: '#3C62DD'}} />
        </View>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    headerBase:{
        backgroundColor:'#3C62DD',
        alignItems:'flex-end',
        width:'100%',
        marginBottom: 12
        
    },
    headerInsides:{
        width:'100%',
        flexDirection:'row',
        justifyContent: 'space-between',
        alignItems:'flex-end',
        paddingHorizontal: 16
    },

    headerText:{
    
        textAlign:'center',
        fontSize:28,
        fontFamily:'SF Pro Rounded Black',
        color:'#FFF',
    }
})

export default FriendHeaderComponent