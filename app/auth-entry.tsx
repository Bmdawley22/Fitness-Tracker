import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuthStore } from '@/store/auth';

export default function AuthEntryScreen() {
  const router = useRouter();
  const signIn = useAuthStore(state => state.signIn);

  const [loginVisible, setLoginVisible] = useState(false);
  const [signupVisible, setSignupVisible] = useState(false);

  const completeSignIn = () => {
    signIn();
    setLoginVisible(false);
    setSignupVisible(false);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fitness Tracker</Text>
      <Text style={styles.tagline}>
        “We are what we repeatedly do. Excellence then is not an act but a habit.” –Aristotle
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setLoginVisible(true)}>
          <Text style={styles.actionButtonText}>login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setSignupVisible(true)}>
          <Text style={styles.actionButtonText}>sign up</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={loginVisible} transparent animationType="fade" onRequestClose={() => setLoginVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setLoginVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Login</Text>
            <TextInput placeholder="username" placeholderTextColor="#777" style={styles.input} />
            <TextInput placeholder="password" placeholderTextColor="#777" style={styles.input} secureTextEntry />
            <TouchableOpacity style={styles.submitButton} onPress={completeSignIn}>
              <Text style={styles.submitButtonText}>Continue</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={signupVisible} transparent animationType="fade" onRequestClose={() => setSignupVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSignupVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Sign Up</Text>
            <TextInput placeholder="username" placeholderTextColor="#777" style={styles.input} />
            <TextInput placeholder="email" placeholderTextColor="#777" style={styles.input} keyboardType="email-address" autoCapitalize="none" />
            <TextInput placeholder="password" placeholderTextColor="#777" style={styles.input} secureTextEntry />
            <TouchableOpacity style={styles.submitButton} onPress={completeSignIn}>
              <Text style={styles.submitButtonText}>Create Account</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  tagline: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    maxWidth: 360,
  },
  buttonRow: {
    marginTop: 28,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 130,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    gap: 10,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
