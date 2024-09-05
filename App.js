// App.js
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { Comfortaa_300Light, Comfortaa_400Regular, Comfortaa_500Medium, Comfortaa_600SemiBold, Comfortaa_700Bold } from '@expo-google-fonts/comfortaa';
import { NavigationContainer } from '@react-navigation/native';
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
import { AuthProvider, useAuth } from './context/AuthContext';

const Stack = createStackNavigator();
const BACKGROUND_FETCH_TASK = 'background-fetch';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = Date.now();
  console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);
  return BackgroundFetch.Result.NewData;
});

const AppContent = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      // Initialize other app settings if needed
      setIsLoading(false);
    };

    initialize();
  }, []);

  let [fontsLoaded, error] = useFonts({
    Comfortaa_300Light,
    Comfortaa_400Regular,
    Comfortaa_500Medium,
    Comfortaa_600SemiBold,
    Comfortaa_700Bold,
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
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "AppLog" : "Title"}>
        <Stack.Screen name="Title" component={TitlePage} options={{ headerShown: false }} />
        <Stack.Screen name="Email" component={EmailPage} options={{ headerShown: false }} />
        <Stack.Screen name="Confirm" component={ConfirmationPage} options={{ headerShown: false }} />
        <Stack.Screen name="User" component={User} options={{ headerShown: false }} />
        <Stack.Screen name="Confidentiality" component={Confidentiality} options={{ headerShown: false }} />
        <Stack.Screen name="AppLog" component={AppLog} options={{ headerShown: false }} />
        <Stack.Screen name="AboutUs" component={AboutUs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
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