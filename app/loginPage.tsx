import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username) {
      Alert.alert('Missing info', 'Please enter email');
      return;
    }
    if (!password) {
      Alert.alert('Missing info', 'Please enter password');
      return;
    }

    try {
      const response = await fetch(
        'https://expensify-api-8g94.onrender.com/api/v1/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: username,
            password: password,
          }),
        }
      );

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        try {
          await AsyncStorage.setItem('authToken', data.token);
          await AsyncStorage.setItem('user', JSON.stringify(data.user));

          console.log('Login successful, stored token and user');

          Alert.alert('Success', 'Login successful!', [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(tabs)');
              },
            },
          ]);
        } catch (storageError) {
          console.error('Storage error:', storageError);
          Alert.alert('Error', 'Failed to save login data');
        }
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error.message);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          keyboardType="email-address"
        />

        {/* Password input with eye toggle */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        <Pressable style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/signup')}>
          <Text style={styles.signupText}>Create a new account</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E7D1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  innerContainer: {
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#D4A373',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  loginText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    marginTop: 15,
    fontSize: 16,
    color: '#8B5E3C',
    textDecorationLine: 'underline',
  },
});
