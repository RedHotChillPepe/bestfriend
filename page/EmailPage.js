import { Text, View, TextInput, StyleSheet } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Button as PaperButton, Appbar } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-toast-message';

export default function EmailPage({ navigation }) {
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const emailInputRef = useRef(null);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(email));
  }, [email]);

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const sendEmailToServer = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://mishka-l3tq.onrender.com/auth/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        navigation.navigate('Confirm', { email });
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Ошибка',
          text2: 'Произошла ошибка при отправке email. Пожалуйста, попробуйте позже.',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 100,
          bottomOffset: 40,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Ошибка',
        text2: 'Произошла ошибка при отправке email. Пожалуйста, попробуйте позже.',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 100,
        bottomOffset: 40,
      });
      // console.error('Ошибка при отправке email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
          title="Введите свою почту"
          titleStyle={styles.appbarTitle}
        />
      </Appbar.Header>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Введите свою почту
          </Text>
          <Text style={styles.subtitle}>
            Мы вышлем вам код для проверки почты.
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            ref={emailInputRef}
            selectionColor="#6f9c3d"
            style={[
              styles.input,
              isFocused && styles.inputFocused
            ]}
            placeholder="Email"
            placeholderTextColor="#a9a9a9"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <PaperButton
            mode="outlined"
            style={[
              styles.button,
              !isValidEmail && styles.buttonInvalid
            ]}
            labelStyle={styles.buttonLabel}
            onPress={sendEmailToServer}
            disabled={!isValidEmail}
          >
            Получить код
          </PaperButton>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    paddingTop: 30,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  appbarTitle: {
    color: '#5c5c5c',
    fontFamily: 'Comfortaa_500Medium',
    fontSize: 18,
    marginLeft: '9%',
  },
  textContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: '20%'
  },
  title: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 35,
    color: "#6f9c3d",
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Comfortaa_500Medium',
    fontSize: 14,
    color: "#5c5c5c",
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: '70%'
  },
  input: {
    width: '90%',
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingBottom: 10,
    borderWidth: 0,
    fontSize: 18,
    color: '#5c5c5c',
    borderBottomWidth: 1,
    borderColor: '#d3d3d3',
    marginBottom: '10%'
  },
  inputFocused: {
    borderColor: '#6f9c3d',
  },
  button: {
    width: '90%',
    backgroundColor: '#6f9c3d',
    borderWidth: 0,
    borderRadius: 10,
  },
  buttonInvalid: {
    backgroundColor: '#d3d3d3',
  },
  buttonLabel: {
    color: '#ffff',
    fontSize: 18,
    fontFamily: 'Comfortaa_500Medium',
  },
  spinnerTextStyle: {
    color: '#FFF'
  }
});