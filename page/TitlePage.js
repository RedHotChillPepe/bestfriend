import { Text, View, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TitlePage({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ alignItems: 'center' }}>
        <Image
          source={require('../assets/Bear.png')}
          style={{ marginTop: 20, width: 250, height: 250, resizeMode: 'contain' }}
        />
        <Text style={{ fontFamily: 'SF Pro Rounded Bold', fontSize: 35, color: "#3C62DD"}}>
          ЛУЧШИЙ ДРУГ
        </Text>
        <Text style={{ fontFamily: 'SF Pro Rounded Bold', fontSize: 14, color: "#5c5c5c", textAlign: 'center' }}>
          Создай новую учётную запись или войди в существующую,чтобы использовать Лучшего друга
        </Text>
      </View>
      <View style={{ width: '100%', alignItems: 'center' }}>
       <View style={{ marginBottom: '5%', width: '90%' }}>
          <TouchableOpacity onPress={() => navigation.navigate('User')} style={{ height: 60, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', borderBottomColor: '#888', borderBottomWidth: 1 }}>
            <Text style={{ fontFamily: 'SF Pro Rounded Bold', fontSize: 14, color: "#888" }}>
              Пользовательское соглашение
            </Text>
            <FontAwesome5 name="arrow-right" size={16} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Confidentiality')} style={{ height: 60, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', borderBottomColor: '#888', borderBottomWidth: 1 }}>
            <Text style={{ fontFamily: 'SF Pro Rounded Bold', fontSize: 14, color: "#888" }}>
              Палитика конфеденциальности
            </Text>
            <FontAwesome5 name="arrow-right" size={16} color="#888" />
          </TouchableOpacity>
        </View> 
        <PaperButton
          mode="outlined"
          style={[styles.button, { backgroundColor: "#3C62DD", borderWidth: 0, marginBottom: '15%' }]}
          labelStyle={{ color: '#ffff', fontSize: 18, fontFamily: 'SF Pro Rounded Regular' }}
          onPress={() => navigation.navigate('Email')}
        >
          Войти по почте
        </PaperButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: '3%',
  },
  button: {
    marginBottom: '2%',
    width: '90%',
    backgroundColor: '#fff',
    borderColor: '#d9d9d9',
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 10,
  }
});