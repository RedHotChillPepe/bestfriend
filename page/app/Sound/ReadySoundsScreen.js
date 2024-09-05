import { Text, View, TouchableOpacity, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Modal, Linking, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ReadySoundsScreen({ navigation }) {
    const [pressedCard, setPressedCard] = useState(null);
    const [audioData, setAudioData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetch('https://mishka-l3tq.onrender.com/audio/all')
            .then(response => response.json())
            .then(data => {
                setAudioData(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }, []);

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

    const handlePressIn = (index) => {
        setPressedCard(index);
    };

    const handlePressOut = () => {
        setPressedCard(null);
    };

    const getFilteredData = (category) => {
        return audioData.filter(item => item.category === category);
    };

    const cards = [
        { text: 'Сказки', icon: <FontAwesome name="book" size={200} color="#a4ca79" style={styles.cardIcon} />, onPress: () => navigation.navigate('fairyTales', { audioData: getFilteredData('сказка') }) },
        { text: 'Загадки', icon: <FontAwesome name="question" size={240} color="#a4ca79" style={styles.cardIcon} />, onPress: () => navigation.navigate('Riddles', { audioData: getFilteredData('загадка') }) },
        { text: 'Фразы помощники', icon: <FontAwesome5 name="hands-helping" size={170} color="#a4ca79"  style={styles.cardIcon}/>, onPress: () => navigation.navigate('Help', { audioData: getFilteredData('помощь') }) },
    ];

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#a4ca79" />
            ) : (
                <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
                    <View style={{ marginVertical: '3%' }}>
                        {cards.map((card, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={card.onPress}
                                onPressIn={() => handlePressIn(index)}
                                onPressOut={handlePressOut}
                                activeOpacity={1}
                                style={[styles.card, pressedCard === index && styles.cardPressed]}
                            >
                                <Text style={styles.cardText}>
                                    {card.text}
                                </Text>
                                {card.icon}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            activeOpacity={1}
                            style={[styles.card, pressedCard === cards.length && styles.cardPressed]}
                        >
                                <Text style={styles.cardText}>
                                    Остальные звуки
                                </Text>
                            <FontAwesome5 name="telegram-plane" size={200} color="#a4ca79"  style={styles.cardIcon}/>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Выберите платформу:</Text>
                            <View style={{ flexDirection: "row", width: 260, justifyContent: "space-between" }}>
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={pressTelegram}
                                >
                                    <FontAwesome5 name="telegram-plane" size={50} color="#6f9c3d" />
                                    <Text style={styles.textStyle}>Telegram</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={pressWhatsApp}
                                >
                                    <FontAwesome5 name="whatsapp" size={50} color="#6f9c3d" />
                                    <Text style={styles.textStyle}>WhatsApp</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center'
    },
    card: {
        backgroundColor: '#6f9c3d',
        width: width * 0.90,
        height: height * 0.22,
        marginBottom: '4%',
        borderRadius: 15,
        paddingTop: '5%',
        paddingLeft: '6%',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    cardPressed: {
        backgroundColor: '#608c2f',
    },
    cardText: {
        position: 'absolute',
        fontFamily: 'Comfortaa_700Bold',
        fontSize: 20,
        color: "#fff",
        // width: '80%',
        left: '8%',
        top: '8%'
    },
    cardTextBot: {
        fontFamily: 'Comfortaa_500Medium',
        fontSize: 14,
        color: "#ddd",
        width: '80%'
    },
    cardIcon: {
        position: 'absolute',
        bottom: "-24%",
        right: '8%'
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(255,255, 255, 0.15)', // Полупрозрачный фон
        justifyContent: "center",
        alignItems: "center",
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
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
        fontFamily: 'Comfortaa_700Bold'
    },
    modalText: {
        color: "#5c5c5c",
        fontSize: 19,
        marginBottom: 10,
        textAlign: "center",
        fontFamily: 'Comfortaa_500Medium'
    }
});