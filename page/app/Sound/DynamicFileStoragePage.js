import { useNavigation } from "@react-navigation/native";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSound } from "../../../context/SoundProvider";
import * as FileSystem from 'expo-file-system';
import { AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function DynamicFileStoragePage({route}) {
    const {audioData} = route.params
    const {playAudio, pauseAudio, isPlaying, currentIndex, positionMillis, pausedPosition, formatTime} = useSound()

    const navigation = useNavigation();
    
    
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{width:'100%'}}>
                <View style={{ width:'100%'}} >
                    <View style={{flex:1, justifyContent:'space-between', flexDirection:"row", alignItems:'center'}}>
                        <Pressable style={{paddingLeft:'4%'}} onPress={()=> navigation.goBack()}>
                            <Text style={styles.subtitleText}>
                                Назад
                            </Text>
                        </Pressable >
                    </View>                
                </View>
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <View style={{  width: '90%' }}>

                        {
                            audioData.map((file) => (
                                <View key={file.uuid} style={styles.card}>
                                    <View style={styles.cardText}>
                                        <Text style={styles.cardTextTitle}>
                                            {file.name}
                                        </Text>
                                        <Text style={styles.cardTime}>
                                            {
                                                isPlaying 
                                                ? formatTime( currentIndex === file.uuid ? positionMillis : 0)
                                                : formatTime(currentIndex === file.uuid ? pausedPosition : 0)
                                            } / {formatTime(file.duration)}
                                        </Text>
                                    </View>
                                    <Pressable onPress={() => isPlaying && currentIndex == file.uuid ? pauseAudio() : playAudio(file.uri, file.uuid, file.name)}>
                                        <AntDesign name={(isPlaying && currentIndex === file.uuid) ? "pausecircle" : "play"} size={30} color="#3C62DD" />
                                    </Pressable>
                                </View>
                            ))
                        }  

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
    card: {
        height: 60,
        paddingHorizontal: '4%',
        marginTop:8,
        
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#656463',
        borderWidth: 1,
        borderRadius:16
    },
    cardTime: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 12,
        color: "#656463"
    },
    cardText: {
        gap: 6
    },
    cardTextTitle: {
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 16,
        color: "#5c5c5c"
    },
})