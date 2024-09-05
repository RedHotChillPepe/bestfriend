import { Text, View, TextInput, StyleSheet} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Button as PaperButton, Appbar } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext'; // Путь к вашему AuthContext

export default function ConfirmationPage({ navigation, route }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const { email } = route.params;
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const { login } = useAuth(); // Используем функцию login из контекста аутентификации

  const handleChange = (index, value) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      setFocusedIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      setFocusedIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    setCode(['', '', '', '', '', '']);
    setFocusedIndex(0);
    inputRefs.current[0]?.focus(); // Устанавливаем фокус на первый инпут при монтировании компонента
  }, []);

  const isCodeComplete = code.every(digit => digit !== '');

  const getCodeString = () => code.join('');

  const verifyCode = async () => {
    const codeString = getCodeString();
    setIsLoading(true);
    try {
      const response = await fetch('https://mishka-l3tq.onrender.com/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: codeString }),
      });

      const responseData = await response.json();

      if (response.status === 401) {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Ошибка кода',
          text2: 'Код не совпадает. Пожалуйста, проверьте еще раз.',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 100,
          bottomOffset: 40,
        });
      } else if (response.ok) {
        const userId = responseData.userId; // Предполагаем, что сервер возвращает userId в ответе
        login({ userId, email }); // Сохраняем userId и email в контексте аутентификации
        navigation.navigate('AppLog');
      }
    } catch (error) {
      console.error('Ошибка при проверке кода:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ backgroundColor: '#fff', flex: 1 }}>
      <Spinner
        visible={isLoading}
        textContent={''}
        textStyle={styles.spinnerTextStyle}
        color='#6f9c3d'
        overlayColor='rgba(255,255,255, 0.5)'
      />
      <Appbar.Header theme={{ colors: { background: 'transparent' } }}>
        <Appbar.Action
          icon="arrow-left"
          onPress={() => navigation.goBack()}
          color="#5c5c5c"
        />
        <Appbar.Content
          title="Введите код подтверждения"
          titleStyle={{ color: '#5c5c5c', fontFamily: 'Comfortaa_500Medium', fontSize: 18 }}
        />
      </Appbar.Header>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Comfortaa_700Bold', fontSize: 35, color: "#6f9c3d", marginBottom: '1%', textAlign: 'center' }}>
            Введите код подтверждения
          </Text>
          <Text style={styles.subtitle}>
            Мы отправили письмо с кодом на почту {email} Введите этот код <Text style={{color:'#aaa'}}>(Проверьте папку Спам)</Text>
          </Text>
        </View>
        <View style={styles.inputContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              style={[styles.input, focusedIndex === index && styles.inputFocused]}
              value={digit}
              onChangeText={(value) => handleChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="numeric"
              selectionColor="#6f9c3d"
              maxLength={1}
              onFocus={() => setFocusedIndex(index)}
              ref={(ref) => (inputRefs.current[index] = ref)}
              editable={true}
              selectTextOnFocus={true}
            />
          ))}
        </View>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <PaperButton
            mode="outlined"
            style={[
              styles.button,
              { backgroundColor: "#6f9c3d", borderWidth: 0 }, !isCodeComplete && { backgroundColor: '#d3d3d3' }
            ]}
            labelStyle={[
              { color: '#ffff', fontSize: 18, fontFamily: 'Comfortaa_500Medium' },
            ]}
            onPress={verifyCode}
            disabled={!isCodeComplete}
          >
            Отправить
          </PaperButton>
        </View>
      </KeyboardAwareScrollView>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  }, subtitle: {
    fontFamily: 'Comfortaa_500Medium',
    fontSize: 14,
    color: "#5c5c5c",
    textAlign:'center'
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: '20%',
    flexGrow: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: '15%'
  },
  input: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 5,
    textAlign: 'center',
    marginHorizontal: 5,
    fontSize: 18,
  },
  inputFocused: {
    borderColor: '#6f9c3d',
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