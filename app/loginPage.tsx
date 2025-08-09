import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
      const response = await fetch('https://expensify-api-8g94.onrender.com/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        // Store user data and token in AsyncStorage
        try {
          await AsyncStorage.setItem('authToken', data.token);
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          
          console.log('Login successful, stored token and user');
          
          // Show success message and manually navigate
          Alert.alert('Success', 'Login successful!', [
            {
              text: 'OK',
              onPress: () => {
                // Force navigation to tabs
                router.replace('/(tabs)');
              }
            }
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
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
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
    backgroundColor: "#F5E7D1", // Same beige background as signup
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  innerContainer: {
    width: '90%', // Match signup page width
    alignItems: 'center'
  },
  title: {
    fontSize: 26, // Match signup page title size
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333", // Dark text for better contrast
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  input: {
    width: "100%", // Full width within container
    backgroundColor: "white", // White background like signup
    padding: 15,
    marginVertical: 8, // Match signup spacing
    borderRadius: 10,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2, // Match signup elevation
  },
  loginButton: {
    backgroundColor: "#D4A373", // Same brown color as signup
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 15, // Match signup spacing
  },
  loginText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupText: {
    marginTop: 15, // Match signup spacing
    fontSize: 16,
    color: "#8B5E3C", // Same brown color as signup link
    textDecorationLine: "underline",
  },
});