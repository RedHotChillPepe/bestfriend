import React, {useState} from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Modal, Provider } from 'react-native-paper';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from './ProfileScreen';
import ReadySoundsScreen from './Sound/ReadySoundsScreen';
import FairyTales from './Sound/fairyTales';
import MyRecordingScreen from './MyRecordingScreen';
import Help from './Sound/Help';
import Riddles from './Sound/Riddles';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DynamicFolder from './Sound/dynamicFolder';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import FriendHeaderComponent from '../components/FriendHeaderComponent';
import { useSoundPanel } from '../../context/SoundControlContext';
import AlarmPage from './Sound/alarmpage';
import UserRecords from './Sound/UserRecords';
import CustomDrawerComponent from '../components/CustomDrawerComponent.js';
import AssitancePage from './AssitancePage';
import FileStorage from './Sound/FileStorage.js';
import DynamicFileStoragePage from './Sound/DynamicFileStoragePage.js';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();



function ReadySoundsStack() {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation()


  return (
    <Stack.Navigator screenOptions={{ detachPreviousScreen: true, presentation: 'transparentModal' }}>
      <Stack.Screen name='ЛУЧШИЙ ДРУГ' component={ReadySoundsScreen} options={{
        headerTransparent:true,
        headerStyle:{
          backgroundColor:'transparent'
        },
        header:()=>(
          <FriendHeaderComponent/>
        )
      }}/>
      <Stack.Screen name="fairyTales" component={FairyTales} options={{ 
        title:"",
        headerStyle:{
          backgroundColor:"#3C62DD"
        },
        headerLeft:()=>(
          <Pressable onPress={()=>navigation.toggleDrawer()}>
            <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:16, paddingBottom:8}}/>
          </Pressable>
        )
      }} />
      <Stack.Screen name="Riddles" component={Riddles} options={{ 
        title:"",
        headerStyle:{
          backgroundColor:"#3C62DD"
        },
        headerLeft:()=>(
          <Pressable onPress={()=>navigation.toggleDrawer()}>
            <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:16, paddingBottom:8}}/>
          </Pressable>
        )
      }} />
      <Stack.Screen name="MyRecording" component={UserRecords} options={{ 
        title:"",
        headerStyle:{
          backgroundColor:"#3C62DD"
        },
        headerLeft:()=>(
          <Pressable onPress={()=>navigation.toggleDrawer()}>
            <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:16, paddingBottom:8}}/>
          </Pressable>
        )
      }} />
      <Stack.Screen name="Help" component={Help} options={{ 
        title:"",
        headerStyle:{
          backgroundColor:"#3C62DD"
        },
        headerLeft:()=>(
          <Pressable onPress={()=>navigation.toggleDrawer()}>
            <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:16, paddingBottom:8}}/>
          </Pressable>
        )
      }}/>
      <Stack.Screen name="DynamicFolder" component={DynamicFolder} options={{
        title:"",
        headerTintColor:"#FFF",
        headerStyle:{
          backgroundColor:"#3C62DD",
        },
        headerLeft:()=>(
          <Pressable onPress={()=>navigation.toggleDrawer()}>
            <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:16, paddingBottom:8}}/>
          </Pressable>
        ) 
        }} />
        <Stack.Screen name='AlarmPage' component={AlarmPage} options={{
          title:"",
          headerTintColor:"#FFF",
          headerStyle:{
            backgroundColor:"#3C62DD",
          },
          headerLeft:()=>(
            <Pressable onPress={()=>navigation.toggleDrawer()}>
              <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:16, paddingBottom:8}}/>
            </Pressable>
          ) 
        }}/>
        <Stack.Screen name='StoragePage' component={FileStorage} options={{
          title:"",
          headerTintColor:"#FFF",
          headerStyle:{
            backgroundColor:"#3C62DD",
          },
          headerLeft:()=>(
            <Pressable onPress={()=>navigation.toggleDrawer()}>
              <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:16, paddingBottom:8}}/>
            </Pressable>
          ) 
        }}/>
        <Stack.Screen name='DynamicStorage' component={DynamicFileStoragePage} options={{
          title:"",
          headerTintColor:"#FFF",
          headerStyle:{
            backgroundColor:"#3C62DD",
          },
          headerLeft:()=>(
            <Pressable onPress={()=>navigation.toggleDrawer()}>
              <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:8, paddingBottom:8}}/>
            </Pressable>
          ) 
        }}/>
    </Stack.Navigator>
  );
} 

export default function AppLog() {
  const navigation = useNavigation()
  const {SoundControlPanel} = useSoundPanel()

  return (
    <Provider style={{backgroundColor:'transparent'}}>
      
      <Drawer.Navigator screenOptions={{
       drawerStyle:{
        backgroundColor:'transparent'
       },
       overlayColor:'transparent'
      }} drawerContent={props => <CustomDrawerComponent {...props} />}>
        <Drawer.Screen name="Библиотека Звуков" component={ReadySoundsStack} options={{ headerShown: false }}/>
        <Drawer.Screen name="Профиль" component={ProfileScreen} options={{
          headerLeft:()=>(
            <Pressable onPress={()=>navigation.dispatch(DrawerActions.toggleDrawer())}>
              <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:25, paddingTop:5}}/>
            </Pressable>
          ),
          headerStyle:{
            backgroundColor:"#3C62DD"
          },
          headerTitleAlign:"center",
          headerTitleStyle:{
            color:"#FFF"
          }}} />
          <Drawer.Screen name="HelpPage" component={AssitancePage} options={{
          headerLeft:()=>(
            <Pressable onPress={()=>navigation.dispatch(DrawerActions.toggleDrawer())}>
              <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:25, paddingTop:5}}/>
            </Pressable>
          ),
          title:"",
          headerStyle:{
            backgroundColor:"#3C62DD"
          },
          headerTitleAlign:"center",
          headerTitleStyle:{
            color:"#FFF"
          }
          }}/>
      </Drawer.Navigator>

      <SoundControlPanel />         
    </Provider>
  );
}

const styles = StyleSheet.create({
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
    modalText: {
      marginBottom: 15,
      textAlign: 'center',
      fontSize: 18,
      color: '#3f3f3f',
      fontFamily: 'Comfortaa_400Regular',
    },
})