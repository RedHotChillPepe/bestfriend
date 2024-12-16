// App.js
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, StatusBar, Pressable} from 'react-native';
import { useFonts } from 'expo-font';
import { Comfortaa_300Light, Comfortaa_400Regular, Comfortaa_500Medium, Comfortaa_600SemiBold, Comfortaa_700Bold } from '@expo-google-fonts/comfortaa';
import { DefaultTheme, NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoadingPage from './page/LoadingPage';
import TitlePage from './page/TitlePage';
import EmailPage from './page/EmailPage';
import ConfirmationPage from './page/ConfirmationPage';
import Confidentiality from './page/documents/Confidentiality';
import User from './page/documents/User';
import AppLog from './page/app/AppLog';
import AboutUs from './page/app/Profile/AboutUs';
import { Audio } from 'expo-av';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from './context/AuthContext';

import { SoundProvider } from './context/SoundProvider';
import { SoundControlProvider } from './context/SoundControlContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
//import * as Calendar from 'expo-calendar';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReadySoundsScreen from './page/app/Sound/ReadySoundsScreen';
import FairyTales from './page/app/Sound/fairyTales';
import Riddles from './page/app/Sound/Riddles';
import UserRecords from './page/app/Sound/UserRecords';
import Help from './page/app/Sound/Help';
import DynamicFolder from './page/app/Sound/dynamicFolder';
import AlarmPage from './page/app/Sound/alarmpage';
import FileStorage from './page/app/Sound/FileStorage';
import DynamicFileStoragePage from './page/app/Sound/DynamicFileStoragePage';
import FriendHeaderComponent from './page/components/FriendHeaderComponent';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';



const Stack = createStackNavigator();
const SecondStack = createStackNavigator()
const BACKGROUND_FETCH_TASK = 'background-fetch';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = Date.now();
  console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);
  return BackgroundFetch.Result.NewData;
});

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

function AllPages() {
  const navigation = useNavigation()

   return (
    <SecondStack.Navigator initialRouteName="AppLog">
      <SecondStack.Screen name="AppLog" component={AppLog} options={{ headerShown: false }} />
      <SecondStack.Screen name="fairyTales" component={FairyTales} options={{ 
      title:"Сказки",
      headerTitleStyle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
      headerStyle:{
      backgroundColor:"#3C62DD",
      },
      headerTintColor: '#fff',
      headerLeft:()=>(
        <Pressable onPress={()=>navigation.goBack()}>
          {/* <MaterialCommunityIcons name="menu" color="#FFF" size={32} style={{paddingLeft:16, }}/> */}
          <Ionicons name="arrow-back-outline" size={32} color="white" style={{paddingLeft: 16}} />
        </Pressable>
      )
      }} />
      <SecondStack.Screen name="Riddles" component={Riddles} options={{ 
        title:"Загадки",
        headerTitleStyle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
        headerStyle:{
          backgroundColor:"#3C62DD"
        },
        headerLeft:()=>(
          <Pressable onPress={()=>navigation.goBack()}>
            {/* <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:16, paddingBottom:8}}/> */}
            <Ionicons name="arrow-back-outline" size={32} color="white" style={{paddingLeft: 16}} />
          </Pressable>
        )
      }} />
      <SecondStack.Screen name="MyRecording" component={UserRecords} options={{ 
        title:"Голосовые записи",
        headerTitleStyle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },

        headerStyle:{
          backgroundColor:"#3C62DD"
        },
        headerLeft:()=>(
          <Pressable onPress={()=>navigation.goBack()}>
            {/* <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:16, paddingBottom:8}}/> */}
            <Ionicons name="arrow-back-outline" size={32} color="white" style={{paddingLeft: 16}} />
          </Pressable>
        )
      }} />
      <SecondStack.Screen name="Help" component={Help} options={{ 
        title:"Фразы помощники",
        headerTitleStyle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },

        headerStyle:{
          backgroundColor:"#3C62DD"
        },
        headerLeft:()=>(
          <Pressable onPress={()=>navigation.goBack()}>
            {/* <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:16, paddingBottom:8}}/> */}
            <Ionicons name="arrow-back-outline" size={32} color="white" style={{paddingLeft: 16}} />
          </Pressable>
        )
      }}/>
      <SecondStack.Screen name="DynamicFolder" component={DynamicFolder} options={{
        title:"",
        headerTintColor:"#FFF",
        headerStyle:{
          backgroundColor:"#3C62DD",
        },
        headerLeft:()=>(
          <Pressable onPress={()=>navigation.goBack()}>
            {/* <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:16, paddingBottom:8}}/> */}
            <Ionicons name="arrow-back-outline" size={32} color="white" style={{paddingLeft: 16}} />
          </Pressable>
        ) 
        }} />
        <SecondStack.Screen name='AlarmPage' component={AlarmPage} options={{
          title:"",
          headerTintColor:"#FFF",
          headerStyle:{
            backgroundColor:"#3C62DD",
          },
          headerLeft:()=>(
            <Pressable onPress={()=>navigation.goBack()}>
              <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:16, paddingBottom:8}}/>
            </Pressable>
          ) 
        }}/>
        <SecondStack.Screen name='StoragePage' component={FileStorage} options={{
          title:"",
          headerTintColor:"#FFF",
          headerStyle:{
            backgroundColor:"#3C62DD",
          },
          headerLeft:()=>(
            <Pressable onPress={()=>navigation.goBack()}>
              <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:16, paddingBottom:8}}/>
            </Pressable>
          ) 
        }}/>
        <SecondStack.Screen name='DynamicStorage' component={DynamicFileStoragePage} options={{
          title:"",
          headerTintColor:"#FFF",
          headerStyle:{
            backgroundColor:"#3C62DD",
          },
          headerLeft:()=>(
            <Pressable onPress={()=>navigation.goBack()}>
              <MaterialCommunityIcons name="menu" color="#FFF" size={30} style={{paddingLeft:8, paddingBottom:8}}/>
            </Pressable>
          ) 
        }}/>
    </SecondStack.Navigator>
    
   )
}




const AppContent = () => {
  /* const { user, checkStoredUser } = useAuth(); */
  const [isLoading, setIsLoading] = useState(true);
  

  //const [calendarStatus, requestCalendarPermission] = Calendar.useCalendarPermissions();

   

  useEffect(() => {
    const initialize = async () => {
      // Initialize other app settings if needed
      setIsLoading(false);
      /* if (!user) {
        checkStoredUser()
      }  */

      /* if (!calendarStatus.granted) {
        requestCalendarPermission()
      } */
    };

    initialize();
  }, []);

 

  let [fontsLoaded, error] = useFonts({
    Comfortaa_300Light,
    Comfortaa_400Regular,
    Comfortaa_500Medium,
    Comfortaa_600SemiBold,
    Comfortaa_700Bold,
    'SF Pro Rounded Black':require('./assets/fonts/SFProRoundedBlack.otf'),
    'SF Pro Rounded Semibold':require('./assets/fonts/SFProRoundedSemibold.otf'),
    'SF Pro Rounded Bold':require('./assets/fonts/SFProRoundedBold.otf'),
    'SF Pro Rounded Regular':require('./assets/fonts/SFProRoundedRegular.otf')
  });

  

  useEffect(() => {
    

    const registerBackgroundFetchAsync = async () => {
      return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60 * 15, // 15 minutes
        stopOnTerminate: false, // android only
        startOnBoot: true, // android only
      });
    };

    const checkStatusAsync = async () => {
      const status = await BackgroundFetch.getStatusAsync();
      switch (status) {
        case BackgroundFetch.Status.Restricted:
        case BackgroundFetch.Status.Denied:
          console.log("Background execution is disabled");
          break;
        default:
          console.log("Background execution is enabled");
          await registerBackgroundFetchAsync();
          break;
      }
    };

    const setAudioMode = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
    };

    checkStatusAsync();
    setAudioMode();

    return () => {
      BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    };
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <Text>Error loading fonts</Text>;
  }

  if (!fontsLoaded) {
    return <LoadingPage />;
  }
  

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ detachPreviousScreen: true, presentation: 'transparentModal' }} 
      /* initialRouteName={"Title"} */ initialRouteName={"SecondStack"}>
        {/* <Stack.Screen name="Title" component={TitlePage} options={{ headerShown: false }} />
        <Stack.Screen name="Email" component={EmailPage} options={{ headerShown: false }} />
        <Stack.Screen name="Confirm" component={ConfirmationPage} options={{ headerShown: false }} />
        <Stack.Screen name="User" component={User} options={{ headerShown: false }} />
        <Stack.Screen name="Confidentiality" component={Confidentiality} options={{ headerShown: false }} /> */}
        
        <Stack.Screen name="AboutUs" component={AboutUs} options={{ headerShown: false }} />
        
        <Stack.Screen name="SecondStack" component={AllPages} options={{ headerShown: false }}/>
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  
  return (
    
      <GestureHandlerRootView style={{flex:1}}>
        <SoundProvider>
          <SoundControlProvider>
            {/* <AuthProvider> */}
              <StatusBar backgroundColor="#3C62DD" hidden={false} barStyle={'light-content'}/>
              <AppContent />
            {/* </AuthProvider> */}
          </SoundControlProvider> 
        </SoundProvider>  
      </GestureHandlerRootView>
    
      
        
   
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});