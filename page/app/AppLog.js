import React, {useState} from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Modal, Provider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from './ProfileScreen';
import ReadySoundsScreen from './Sound/ReadySoundsScreen';
import FairyTales from './Sound/fairyTales';
import MyRecordingScreen from './MyRecordingScreen';
import Help from './Sound/Help';
import Riddles from './Sound/Riddles';
import { Pressable, StyleSheet, Text, View, VirtualizedList } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


function ReadySoundsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ReadySoundsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="fairyTales" component={FairyTales} options={{ headerShown: false }} />
      <Stack.Screen name="Help" component={Help} options={{ headerShown: false }} />
      <Stack.Screen name="Riddles" component={Riddles} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function AppLog() {
  
  const [modalVisible, setModalVisible] = useState(false);


  return (
    <Provider>
      <Tab.Navigator
        initialRouteName="Библиотека звуков" 
        screenOptions={{
          tabBarActiveTintColor: '#6f9c3d',
          tabBarInactiveTintColor: '#5c5c5c',
          tabBarStyle: { backgroundColor: '#fff', paddingBottom: 15, paddingTop: 10, height: 75},
          headerShown: true,
          tabBarLabelStyle: { fontSize: 12, fontFamily: 'Comfortaa_600SemiBold' },
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Comfortaa_600SemiBold',
            fontSize: 18,
            color: '#FFF'
          },
          headerStyle:{
              borderBottomWidth:1,
              borderBottomColor:'#d9d9d9'
          },
          headerRight:()=>(
            <Pressable onPress={()=>setModalVisible(true)}>
              <MaterialCommunityIcons name='plus-circle-outline' color="#FFF" size={45} style={{paddingRight:25}}/>
            </Pressable>
          ),

          
        }}
      >
        <Tab.Screen
          name="Библиотека звуков"
          component={ReadySoundsStack}
          options={{
            tabBarLabel: 'Библиотека',
            headerStyle:{
              borderBottomLeftRadius:48,
              borderBottomRightRadius:48,
              backgroundColor:"#3C62DD"
            },
            tabBarIcon: ({ color }) => (
              <Ionicons name="library" size={30} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Свои записи"
          component={MyRecordingScreen}
          options={{
            headerStyle:{
              backgroundColor:"#3C62DD"
            },
            tabBarLabel: 'Свои записи',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="microphone" color={color} size={30} />
            ),
          }}
        />
        <Tab.Screen
          name="Ваш профиль"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Профиль',
            headerStyle:{
              backgroundColor:"#3C62DD"
            },
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account" color={color} size={30} />
            ),
          }}
        />
      </Tab.Navigator>

      {
        modalVisible ?

        <Modal transparent={true} animationType={'none'} visible={modalVisible}  onRequestClose={()=>{setModalVisible(false)}} onDismiss={()=>{setModalVisible(false)}}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text>RRRR</Text>
            </View>
          </View>
        </Modal>
        : <View></View>
      }
        

      


    </Provider>
  );
}

const styles = StyleSheet.create({
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
  }
})