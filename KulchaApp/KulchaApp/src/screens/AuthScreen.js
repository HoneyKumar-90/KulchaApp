import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../AuthContext';
import { colors } from '../theme';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    try {
      setBusy(true);
      if (mode === 'login') await login(email.trim(), password);
      else await register(name.trim(), phone.trim(), email.trim(), password);
    } catch (e) {
      Alert.alert('Oops', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <Text style={s.logo}>🫓</Text>
        <Text style={s.title}>Kulcha Delivery</Text>
        <Text style={s.sub}>Hot Amritsari kulche, at your door</Text>

        {mode === 'register' && (
          <>
            <TextInput style={s.input} placeholder="Full name" value={name} onChangeText={setName} />
            <TextInput style={s.input} placeholder="Mobile number (10 digits)" keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} />
          </>
        )}
        <TextInput style={s.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={s.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

        <TouchableOpacity style={s.btn} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{mode === 'login' ? 'Login' : 'Create account'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={s.link}>{mode === 'login' ? "New here? Create an account" : 'Already have an account? Login'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 64, textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', color: colors.primaryDark },
  sub: { textAlign: 'center', color: colors.muted, marginBottom: 24, marginTop: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16 },
  btn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', color: colors.primaryDark, marginTop: 18, fontWeight: '600' },
});
