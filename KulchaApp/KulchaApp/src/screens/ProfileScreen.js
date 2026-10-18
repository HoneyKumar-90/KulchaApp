import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../AuthContext';
import { colors } from '../theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <View style={s.wrap}>
      <Text style={{ fontSize: 56 }}>👤</Text>
      <Text style={s.name}>{user?.fullName}</Text>
      <Text style={{ color: colors.muted }}>{user?.role}</Text>
      <TouchableOpacity style={s.btn} onPress={logout}><Text style={s.btnText}>Logout</Text></TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  name: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  btn: { marginTop: 30, backgroundColor: colors.red, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700' },
});
