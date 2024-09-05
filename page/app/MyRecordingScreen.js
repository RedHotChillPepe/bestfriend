import React, { useState, useRef, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Modal, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { AntDesign } from '@expo/vector-icons';
import { Button as PaperButton } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useAuth } from '../../context/AuthContext';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-toast-message';

export default function MyRecordingScreen({ navigation }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordings, setRecordings] = useState([]);
    const recording = useRef(null);
    const [isPlaying, setIsPlaying] = useState({});
    const [pausedPosition, setPausedPosition] = useState({});
    const [positionMillis, setPositionMillis] = useState({});
    const sounds = useRef([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newRecordingName, setNewRecordingName] = useState('');
    const [uri, setUri] = useState('');
    const [durationMillis, setDurationMillis] = useState(0);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimer = useRef(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [recordingToDelete, setRecordingToDelete] = useState(null);
    const { user } = useAuth();
    const [shouldFetchRecords, setShouldFetchRecords] = useState(true);

    useEffect(() => {
        fetchUserRecords();
    }, [shouldFetchRecords]);

    const fetchUserRecords = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('https://mishka-l3tq.onrender.com/record/user-records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: user.userId })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Fetching records failed: ${errorText}`);
            }

            const records = await response.json();
            setRecordings(records);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching user records:', error);
        }
    };

    useEffect(() => {
        return () => {
            if (recordingTimer.current) {
                clearInterval(recordingTimer.current);
            }
            sounds.current.forEach(sound => {
                if (sound) {
                    sound.unloadAsync();
                }
            });
        };
    }, []);

    const startRecording = async () => {
        try {
            console.log('Requesting permissions..');
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            console.log('Starting recording..');
            recording.current = new Audio.Recording();
            await recording.current.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
            await recording.current.startAsync();
            setIsRecording(true);
            setIsPaused(false);
            startRecordingTimer();
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        if (!recording.current) {
            console.error('Recording is not started');
            return;
        }

        console.log('Stopping recording..');
        setIsRecording(false);
        await recording.current.stopAndUnloadAsync();
        const uri = recording.current.getURI();
        const status = await recording.current.getStatusAsync();
        const durationMillis = status.durationMillis;
        recording.current = null;
        setUri(uri);
        setDurationMillis(durationMillis);
        setModalVisible(true);
        stopRecordingTimer();
        console.log('Recording stopped and stored at', uri);
    };

    const pauseRecording = async () => {
        if (!recording.current) {
            console.error('Recording is not started');
            return;
        }

        console.log('Pausing recording..');
        await recording.current.pauseAsync();
        setIsPaused(true);
        stopRecordingTimer();
    };

    const resumeRecording = async () => {
        if (!recording.current) {
            console.error('Recording is not started');
            return;
        }

        console.log('Resuming recording..');
        await recording.current.startAsync();
        setIsPaused(false);
        startRecordingTimer();
    };

    const saveRecording = async () => {
        if (newRecordingName.trim() === '') {
            alert('Please enter a recording name');
            return;
        }

        const formData = new FormData();
        formData.append('audioFile', {
            uri: uri,
            type: 'audio/x-wav',
            name: newRecordingName + '.wav'
        });
        setIsLoading(true);
        try {
            const uploadResponse = await fetch('https://mishka-l3tq.onrender.com/audio/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                throw new Error(`Upload failed: ${errorText}`);
            }

            const uploadData = await uploadResponse.json();
            const { audioFile } = uploadData;

            const createResponse = await fetch('https://mishka-l3tq.onrender.com/record/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newRecordingName,
                    audioFile: audioFile,
                    duration: durationMillis,
                    user: user.userId
                })
            });
            const createData = await createResponse.text();
            console.log('Server response:', createData);

            setRecordings((prev) => [...prev, { uri: uri, name: newRecordingName, duration: durationMillis }]);
            setModalVisible(false);
            setNewRecordingName('');
            setRecordingTime(0);
            setShouldFetchRecords(true); // Устанавливаем флаг для обновления записей
        } catch (error) {
            console.error('Error uploading or creating record:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentIndex = useRef(null);

    const playAudio = async (uri, index) => {
        if (sounds.current[index]) {
            await sounds.current[index].unloadAsync();
        }
        try {
            const { sound } = await Audio.Sound.createAsync({ uri: uri }, { shouldPlay: false }, status => onPlaybackStatusUpdate(status, index));
            sounds.current[index] = sound;
            setIsPlaying(prev => ({ ...prev, [index]: true }));
            await sound.playFromPositionAsync(pausedPosition[index] || 0);
            console.log(`Playing audio at index ${index}, starting from position ${pausedPosition[index] || 0}`);
            currentIndex.current = index; // Обновляем текущий индекс
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    const pauseAudio = async (index) => {
        if (sounds.current[index]) {
            await sounds.current[index].pauseAsync();
            const status = await sounds.current[index].getStatusAsync();
            setPausedPosition(prev => ({ ...prev, [index]: status.positionMillis }));
            setIsPlaying(prev => ({ ...prev, [index]: false }));
            console.log(`Paused audio at index ${index}, position saved: ${status.positionMillis}`);
            currentIndex.current = index; // Обновляем текущий индекс
        }
    };

    useEffect(() => {
        const interval = setInterval(async () => {
            const index = currentIndex.current;
            if (isPlaying[index]) {
                const status = await sounds.current[index].getStatusAsync();
                onPlaybackStatusUpdate(status, index);
                setPositionMillis((prev => ({ ...prev, [index]: status.positionMillis })));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying]);

    const onPlaybackStatusUpdate = (status, index) => {
        console.log(`onPlaybackStatusUpdate called for index ${index} with status:`, status);
        if (status.durationMillis === status.positionMillis) {
            console.log(`Audio at index ${index} finished playing`);
            setIsPlaying(prev => ({ ...prev, [index]: false }));
            setPausedPosition(prev => ({ ...prev, [index]: 0 }));
            setPositionMillis((prev => ({ ...prev, [index]: 0 })));
        }
    };

    const formatTime = (millis) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const startRecordingTimer = () => {
        recordingTimer.current = setInterval(() => {
            setRecordingTime((prevTime) => prevTime + 1000);
        }, 1000);
    };

    const stopRecordingTimer = () => {
        clearInterval(recordingTimer.current);
    };

    const confirmDeleteRecording = (index) => {
        setRecordingToDelete(index);
        setDeleteModalVisible(true);
    };

    const deleteRecording = async () => {
        if (recordingToDelete !== null && recordings[recordingToDelete]?._id) {
            try {
                const response = await fetch(`https://mishka-l3tq.onrender.com/record/delete/${recordings[recordingToDelete]._id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Deleting record failed: ${errorText}`);
                }

                const data = await response.text();
                console.log(data);

                setRecordings((prev) => prev.filter((_, i) => i !== recordingToDelete));
                setDeleteModalVisible(false);
                Toast.show({
                    type: 'success',
                    position: 'top',
                    text1: 'Запись удалена',
                    text2: '',
                    visibilityTime: 4000,
                    autoHide: true,
                    topOffset: 100,
                    bottomOffset: 40,
                });
                setRecordingToDelete(null);
            } catch (error) {
                console.error('Error deleting record:', error);
            }
        } else {
            console.error('Recording to delete is not valid');
        }
    };

    const renderRightActions = (progress, dragX, index) => {
        return (
            <TouchableOpacity style={styles.backRightBtn} onPress={() => confirmDeleteRecording(index)}>
                <FontAwesome5 name="trash" size={25} color="#fff" />
            </TouchableOpacity>
        );
    };
    return (
        <View style={styles.container}>

            <ScrollView contentContainerStyle={{ width: "100%" }}>
                <Spinner
                    visible={isLoading}
                    textContent={''}
                    textStyle={styles.spinnerTextStyle}
                    color='#6f9c3d'
                    overlayColor='rgba(255,255,255, 0.5)'
                />
                <View style={styles.recordings}>
                        {
                            recordings.length === 0 ? (
                                <Text style={styles.noRecordingsText}>Вы ничего не записали</Text>
                            ) : (
                                recordings.slice().reverse().map((item, index) => (
                                    <Swipeable
                                        key={index}
                                        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, index)}
                                    >
                                        <View style={styles.card}>
                                            <View style={styles.cardText}>
                                                <Text style={styles.cardTextTitle}>
                                                    {item.name}
                                                </Text>
                                                <Text style={styles.cardTime}>
                                                    {formatTime(isPlaying[index] ? positionMillis[index] || 0 : pausedPosition[index] || 0)} / {formatTime(item.duration)}
                                                </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => isPlaying[index] ? pauseAudio(index) : playAudio(item.audioFile, index)}>
                                                <AntDesign name={isPlaying[index] ? "pausecircle" : "play"} size={30} color="#777" />
                                            </TouchableOpacity>
                                        </View>
                                    </Swipeable>
                                ))
                            )
                        }
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <TextInput
                                selectionColor="#6f9c3d"
                                style={[
                                    styles.input,
                                    isFocused && styles.inputFocused
                                ]}
                                placeholder="Название"
                                placeholderTextColor="#a9a9a9"
                                value={newRecordingName}
                                onChangeText={setNewRecordingName}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                            />
                            <View style={styles.buttonContainer}>
                                <PaperButton
                                    mode="outlined"
                                    style={[styles.button, { backgroundColor: "#6f9c3d", borderWidth: 0, marginBottom: '2%' }]}
                                    labelStyle={{ color: '#ffff', fontSize: 16, fontFamily: 'Comfortaa_400Regular' }}
                                    onPress={saveRecording}>
                                    Сохранить
                                </PaperButton>
                                <PaperButton
                                    mode="outlined"
                                    style={[styles.button, { borderWidth: 0, marginBottom: '2%' }]}
                                    labelStyle={{ color: '#6f9c3d', fontSize: 16, fontFamily: 'Comfortaa_400Regular' }}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setRecordingTime(0); // Сброс recordingTime в 0 при нажатии кнопки "Отмена"
                                    }}>
                                    Отмена
                                </PaperButton>
                            </View>
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={deleteModalVisible}
                    onRequestClose={() => {
                        setDeleteModalVisible(!deleteModalVisible);
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Вы уверены, что хотите удалить эту запись?</Text>
                            <View style={styles.buttonContainer}>
                                <PaperButton
                                    mode="outlined"
                                    style={[styles.button, { backgroundColor: "#6f9c3d", borderWidth: 0, marginBottom: '2%' }]}
                                    labelStyle={{ color: '#ffff', fontSize: 18, fontFamily: 'Comfortaa_400Regular' }}
                                    onPress={deleteRecording}>
                                    Да
                                </PaperButton>
                                <PaperButton
                                    mode="outlined"
                                    style={[styles.button, { borderWidth: 0, marginBottom: '2%' }]}
                                    labelStyle={{ color: '#6f9c3d', fontSize: 18, fontFamily: 'Comfortaa_400Regular' }}
                                    onPress={() => setDeleteModalVisible(false)}>
                                    Нет
                                </PaperButton>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
            <View style={styles.bottomBar}>
                {isRecording ? (
                    isPaused ? (
                        <TouchableOpacity onPress={resumeRecording} style={styles.buttonBar}>
                            <FontAwesome5 name="play" size={30} color="#777" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={pauseRecording} style={styles.buttonBar}>
                            <FontAwesome5 name="pause" size={30} color="#777" />
                        </TouchableOpacity>
                    )
                ) : (
                    <TouchableOpacity onPress={startRecording} style={styles.buttonBar}>
                        <FontAwesome5 name="microphone" size={30} color="#777" />
                    </TouchableOpacity>
                )}
                {isRecording && (
                    <TouchableOpacity onPress={stopRecording} style={styles.buttonBar}>
                        <FontAwesome5 name="stop-circle" size={30} color="#777" />
                    </TouchableOpacity>
                )}
                {isRecording && <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>}
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 20,
    },
    recordings: {
        flex: 1,
        width: '100%',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        marginHorizontal: 5,
        backgroundColor: '#fff',
        borderColor: '#d9d9d9',
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 10,
        padding: 0,
    },
    input: {
        minWidth: 200,
        width: '100%',
        backgroundColor: '#fff',
        marginTop: 10,
        marginBottom: 20,
        marginHorizontal: 10,
        paddingBottom: 10,
        borderWidth: 0,
        fontSize: 16,
        color: '#5c5c5c',
        borderBottomWidth: 1,
        borderColor: '#d3d3d3',
        fontFamily: 'Comfortaa_400Regular',
    },
    inputFocused: {
        borderColor: '#6f9c3d',
    },
    buttonBar: {
        marginHorizontal: 10,
        width: 60,
        height: 60,
        backgroundColor: '#fff',
        borderColor: '#d9d9d9',
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '4%',
        height: 60,
        width: '100%',
        borderBottomWidth: 1,
        borderColor: '#d3d3d3',
    },
    cardText: {
        flex: 1,
    },
    cardTextTitle: {
        fontSize: 16,
        color: '#5c5c5c',
        fontFamily: 'Comfortaa_400Regular',
    },
    noRecordingsText: {
        marginTop: '3%',
        fontSize: 20,
        color: '#5c5c5c',
        fontFamily: 'Comfortaa_400Regular',
        width: "100%",
        textAlign: 'center'
    },
    cardTime: {
        fontSize: 14,
        color: '#a9a9a9',
        fontFamily: 'Comfortaa_400Regular',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        color: '#5c5c5c',
        fontFamily: 'Comfortaa_400Regular',
    },
    backRightBtn: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 75,
        height: 60,
    },
    recordingTime: {
        fontSize: 18,
        color: '#5c5c5c',
        marginLeft: 10,
        fontFamily: 'Comfortaa_400Regular',
    },
});