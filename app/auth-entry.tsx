import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuthStore } from '@/store/auth';

type AuthMode = 'entry' | 'login' | 'signup';

type SignupErrors = {
  firstName?: string;
  email?: string;
  username?: string;
  password?: string;
  reenterPassword?: string;
  form?: string;
};

type LoginErrors = {
  username?: string;
  password?: string;
  form?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[A-Za-z0-9_.]+$/;

export default function AuthEntryScreen() {
  const router = useRouter();

  const isSignedIn = useAuthStore(state => state.isSignedIn);
  const hasHydrated = useAuthStore(state => state.hasHydrated);
  const createLocalAccount = useAuthStore(state => state.createLocalAccount);
  const loginWithCredentials = useAuthStore(state => state.loginWithCredentials);
  const consumePostSignupMessage = useAuthStore(state => state.consumePostSignupMessage);

  const [mode, setMode] = useState<AuthMode>('entry');
  const [showPostSignupMessage, setShowPostSignupMessage] = useState(false);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});

  const [firstName, setFirstName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [reenterPassword, setReenterPassword] = useState('');
  const [signupErrors, setSignupErrors] = useState<SignupErrors>({});

  useEffect(() => {
    if (!hasHydrated) return;
    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [hasHydrated, isSignedIn, router]);

  useEffect(() => {
    if (mode === 'login') {
      setShowPostSignupMessage(consumePostSignupMessage());
    }
  }, [consumePostSignupMessage, mode]);

  const validateSignup = (): boolean => {
    const errors: SignupErrors = {};
    const trimmedFirstName = firstName.trim();
    const trimmedEmail = signupEmail.trim();
    const trimmedUsername = signupUsername.trim();

    if (!trimmedFirstName) {
      errors.firstName = 'First name is required.';
    }

    if (!trimmedEmail) {
      errors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!trimmedUsername) {
      errors.username = 'Username is required.';
    } else if (trimmedUsername.length < 3 || trimmedUsername.length > 24) {
      errors.username = 'Username must be 3–24 characters.';
    } else if (!USERNAME_REGEX.test(trimmedUsername)) {
      errors.username = 'Username can only use letters, numbers, underscore, or period.';
    }

    if (!signupPassword) {
      errors.password = 'Password is required.';
    } else if (signupPassword.length < 8 || signupPassword.length > 64) {
      errors.password = 'Password must be 8–64 characters.';
    }

    if (!reenterPassword) {
      errors.reenterPassword = 'Please reenter your password.';
    } else if (signupPassword !== reenterPassword) {
      errors.reenterPassword = 'Passwords must match.';
    }

    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLogin = (): boolean => {
    const errors: LoginErrors = {};

    if (!loginUsername.trim()) {
      errors.username = 'Username is required.';
    }

    if (!loginPassword) {
      errors.password = 'Password is required.';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = () => {
    if (!validateSignup()) return;

    const result = createLocalAccount({
      firstName,
      email: signupEmail,
      username: signupUsername,
      password: signupPassword,
    });

    if (!result.ok) {
      setSignupErrors(prev => ({ ...prev, form: result.error ?? 'Unable to create account.' }));
      return;
    }

    setFirstName('');
    setSignupEmail('');
    setSignupUsername('');
    setSignupPassword('');
    setReenterPassword('');
    setSignupErrors({});
    setMode('login');
  };

  const handleLogin = () => {
    if (!validateLogin()) return;

    const result = loginWithCredentials(loginUsername, loginPassword);
    if (!result.ok) {
      setLoginErrors({ form: result.error ?? 'Login failed.' });
      return;
    }

    setLoginErrors({});
    setLoginPassword('');
    router.replace('/(tabs)');
  };

  const showCard = mode === 'login' || mode === 'signup';

  const titleText = useMemo(() => {
    if (mode === 'signup') return 'Create Account';
    if (mode === 'login') return 'Login';
    return '';
  }, [mode]);

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Fitness-Tracker</Text>

      {mode === 'entry' ? (
        <View style={styles.entryButtons}>
          <TouchableOpacity style={styles.entryButton} onPress={() => setMode('login')}>
            <Text style={styles.entryButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.entryButton} onPress={() => setMode('signup')}>
            <Text style={styles.entryButtonText}>Signup</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {showCard ? (
        <View style={styles.authCard}>
          <Text style={styles.cardTitle}>{titleText}</Text>

          {mode === 'login' && showPostSignupMessage ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>Account created.</Text>
              <Text style={styles.successText}>Login to enter Fitness Tracker</Text>
            </View>
          ) : null}

          {mode === 'login' ? (
            <>
              <Text style={styles.label}>Username</Text>
              <TextInput
                value={loginUsername}
                onChangeText={text => {
                  setLoginUsername(text);
                  if (loginErrors.username || loginErrors.form) setLoginErrors({});
                }}
                autoCapitalize="none"
                placeholder="Enter username"
                placeholderTextColor="#9a9a9a"
                style={styles.input}
              />
              {loginErrors.username ? <Text style={styles.errorText}>{loginErrors.username}</Text> : null}

              <Text style={styles.label}>Password</Text>
              <TextInput
                value={loginPassword}
                onChangeText={text => {
                  setLoginPassword(text);
                  if (loginErrors.password || loginErrors.form) setLoginErrors({});
                }}
                placeholder="Enter password"
                placeholderTextColor="#9a9a9a"
                secureTextEntry
                style={styles.input}
              />
              {loginErrors.password ? <Text style={styles.errorText}>{loginErrors.password}</Text> : null}
              {loginErrors.form ? <Text style={styles.errorText}>{loginErrors.form}</Text> : null}

              <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
                <Text style={styles.submitButtonText}>Login</Text>
              </TouchableOpacity>

              <Pressable onPress={() => setMode('signup')}>
                <Text style={styles.switchLink}>Need an account? Signup</Text>
              </Pressable>
            </>
          ) : null}

          {mode === 'signup' ? (
            <>
              <Text style={styles.label}>First name</Text>
              <TextInput
                value={firstName}
                onChangeText={text => {
                  setFirstName(text);
                  if (signupErrors.firstName || signupErrors.form) setSignupErrors({});
                }}
                placeholder="Enter first name"
                placeholderTextColor="#9a9a9a"
                style={styles.input}
              />
              {signupErrors.firstName ? <Text style={styles.errorText}>{signupErrors.firstName}</Text> : null}

              <Text style={styles.label}>Email</Text>
              <TextInput
                value={signupEmail}
                onChangeText={text => {
                  setSignupEmail(text);
                  if (signupErrors.email || signupErrors.form) setSignupErrors({});
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Enter email"
                placeholderTextColor="#9a9a9a"
                style={styles.input}
              />
              {signupErrors.email ? <Text style={styles.errorText}>{signupErrors.email}</Text> : null}

              <Text style={styles.label}>Username</Text>
              <TextInput
                value={signupUsername}
                onChangeText={text => {
                  setSignupUsername(text);
                  if (signupErrors.username || signupErrors.form) setSignupErrors({});
                }}
                autoCapitalize="none"
                placeholder="Enter username"
                placeholderTextColor="#9a9a9a"
                style={styles.input}
              />
              {signupErrors.username ? <Text style={styles.errorText}>{signupErrors.username}</Text> : null}

              <Text style={styles.label}>Password</Text>
              <TextInput
                value={signupPassword}
                onChangeText={text => {
                  setSignupPassword(text);
                  if (signupErrors.password || signupErrors.form) setSignupErrors({});
                }}
                placeholder="Create password"
                placeholderTextColor="#9a9a9a"
                secureTextEntry
                style={styles.input}
              />
              {signupErrors.password ? <Text style={styles.errorText}>{signupErrors.password}</Text> : null}

              <Text style={styles.label}>Reenter password</Text>
              <TextInput
                value={reenterPassword}
                onChangeText={text => {
                  setReenterPassword(text);
                  if (signupErrors.reenterPassword || signupErrors.form) setSignupErrors({});
                }}
                placeholder="Reenter password"
                placeholderTextColor="#9a9a9a"
                secureTextEntry
                style={styles.input}
              />
              {signupErrors.reenterPassword ? <Text style={styles.errorText}>{signupErrors.reenterPassword}</Text> : null}
              {signupErrors.form ? <Text style={styles.errorText}>{signupErrors.form}</Text> : null}

              <TouchableOpacity style={styles.submitButton} onPress={handleSignup}>
                <Text style={styles.submitButtonText}>Create Account</Text>
              </TouchableOpacity>

              <Pressable onPress={() => setMode('login')}>
                <Text style={styles.switchLink}>Already have an account? Login</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 72,
  },
  pageTitle: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
  },
  entryButtons: {
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    gap: 12,
  },
  entryButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  entryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  authCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1d1d1d',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fff',
    padding: 16,
    marginTop: 20,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  successBox: {
    marginBottom: 14,
  },
  successText: {
    color: '#a7f3d0',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 2,
  },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  switchLink: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    textDecorationLine: 'underline',
  },
});
