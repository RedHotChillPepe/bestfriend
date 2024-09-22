import { Text, View, Linking, Pressable } from 'react-native'
import { StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function  AssitancePage () {
    const navigation = useNavigation();


    const pressTelegram = async () => {
        const telegramUrl = 'https://t.me/';
        const username = 'interactive_bear_bot'; // Замените на ваш username в Telegram

        const url = `${telegramUrl}${username}`;

        const supported = await Linking.canOpenURL(url);

        if (supported) {
            await Linking.openURL(url);
        } else {
            console.log("Не удалось открыть ссылку на Telegram");
        }
    };

    const pressWhatsApp = async () => {
        const whatsappUrl = 'https://chat.whatsapp.com/JLI5QLh1C5nD3g2rz8WW8T';
        const phoneNumber = '';
        const url = `${whatsappUrl}${phoneNumber}`;
    
        Alert.alert('WhatsApp URL:', url); // Добавьте эту строку для логирования URL
    
        const supported = await Linking.canOpenURL(url);
        Alert.alert('Supported:', supported); // Добавьте эту строку для логирования поддержки URL
    
        if (supported) {
            await Linking.openURL(url);
        } else {
            console.log("Не удалось открыть ссылку на WhatsApp");
            Alert.alert('Ошибка', 'Не удалось открыть ссылку на WhatsApp');
        }
    };




    return (
        <View style={styles.centeredView}>
            <View style={{ alignItems:'center', paddingRight:80}}>
                <View style={{justifyContent:'space-between', flexDirection:"row", alignItems:'center', gap:80}}>
                    <Pressable onPress={()=> navigation.goBack()}>
                        <Text style={styles.subtitleText}>
                            Назад
                        </Text>
                    </Pressable>
                </View>                
            </View>
            <View style={styles.modalView}>
                <Text style={styles.modalText}>Выберите платформу:</Text>
                    <View style={{ flexDirection: "row", width: 260, justifyContent: "space-between" }}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => pressTelegram()}
                        >
                            <FontAwesome5 name="telegram-plane" size={50} color="#3C62DD" />
                            <Text style={styles.textStyle}>Telegram</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => pressWhatsApp()}
                        >
                            <FontAwesome5 name="whatsapp" size={50} color="#3C62DD" />
                            <Text style={styles.textStyle}>WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
            </View>
        </View>
      
    )
  }

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        backgroundColor: "#3C62DD",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 4,
        marginTop: 10,
        alignItems: "center",
        width: 120
    },
    buttonClose: {
        backgroundColor: "white",
    },
    textStyle: {
        color: "#5c5c5c",
        fontSize: 16,
        textAlign: "center",
        fontFamily: 'SF Pro Rounded Regular'
    },
    modalText: {
        color: "#FFF",
        fontSize: 19,
        marginBottom: 10,
        textAlign: "center",
        fontFamily: 'SF Pro Rounded Regular'
    },
    subtitleText:{
        fontFamily:"SF Pro Rounded Semibold",
        fontSize:24,
        color:"#070600",
        opacity:0.61,
        textAlign:'left',
        marginRight:"43%"
    },
})