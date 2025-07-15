import React, { useState } from 'react';
import { StyleSheet, View, AppState, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'; // Added TextInput, TouchableOpacity, ActivityIndicator
import { supabase } from '../../lib/supabase'; // Ensure this path is correct
// REMOVED: import { Button, Input } from '@rneui/themed'; // This line is removed
import { useRouter } from 'expo-router'; // Import useRouter for navigation

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // State for custom messages
  const router = useRouter(); // Initialize the router hook

  // Function to display messages to the user
  const showMessage = (msg: string, type: 'error' | 'success' = 'error') => {
    setMessage(msg);
    // Optionally clear message after a few seconds
    setTimeout(() => setMessage(''), 5000);
  };

  async function signInWithEmail() {
    setLoading(true);
    setMessage(''); // Clear previous messages
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      showMessage(error.message);
    } else {
      // On successful sign-in, navigate to the home screen
      router.replace('/(home)'); // Use replace to prevent going back to login
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    setMessage(''); // Clear previous messages
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      showMessage(error.message);
    } else if (!session) {
      // If no session but no error, it likely means email verification is required
      showMessage('Please check your inbox for email verification!', 'success');
    } else {
      // On successful sign-up (and if email verification is not required or already done), navigate
      router.replace('/(home)'); // Use replace to prevent going back to login
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      {message ? (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          keyboardType="email-address"
          editable={!loading} // Disable input when loading
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          editable={!loading} // Disable input when loading
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity
          onPress={signInWithEmail}
          disabled={loading}
          style={[styles.button, loading && styles.buttonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.verticallySpaced}>
        <TouchableOpacity
          onPress={signUpWithEmail}
          disabled={loading}
          style={[styles.button, loading && styles.buttonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign up</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  messageContainer: {
    backgroundColor: '#ffe0b2', // Light orange background for messages
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  messageText: {
    color: '#e65100', // Darker orange text
    textAlign: 'center',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333', // Dark grey for label
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff', // White background for input
  },
  button: {
    backgroundColor: '#007AFF', // Blue color for buttons
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 45, // Ensure consistent height
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0', // Grey for disabled state
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
