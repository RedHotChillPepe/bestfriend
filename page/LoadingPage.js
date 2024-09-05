import {View, Image } from 'react-native';
import React, { useState } from 'react';
import Spinner from 'react-native-loading-spinner-overlay';

export default function LoadingPage({ navigation }) {
  const [spinnerVisible, setSpinnerVisible] = useState(true);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly' }}>
      <Image
        source={require('../assets/Loading.png')}
        style={{ width: 200, height: 200, resizeMode: 'cover', marginBottom: 50 }}
      />
      <Spinner
        visible={spinnerVisible}
        textContent={''}
        textStyle={{ color: "#6f9c3d", fontFamily: 'Roboto_400Regular' }}
        color='#6f9c3d'
        overlayColor="rgba(0, 0, 0, 0)"
      />
      {/* <Text style={{ color: "#6f9c3d", fontFamily: 'Roboto_500Medium', fontSize: 30 }}>Добро пожаловать</Text> */}
    </View>
  );
}