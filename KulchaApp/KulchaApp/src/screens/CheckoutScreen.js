import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { useCart } from '../CartContext';
import { colors } from '../theme';
import { DELIVERY_FEE, FREE_DELIVERY_ABOVE } from '../config';

const PAYMENTS = [
  { key: 'CashOnDelivery', label: 'Cash on delivery' },
  { key: 'Upi', label: 'UPI (pay on delivery)' },
  { key: 'Card', label: 'Card (pay on delivery)' },
];

export default function CheckoutScreen({ navigation }) {
  const { lines, subtotal, clear } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState(null);
  const [payment, setPayment] = useState('CashOnDelivery');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: 'Home', line1: '', line2: '', landmark: '', city: 'Ludhiana', pincode: '' });
  const [busy, setBusy] = useState(false);

  const loadAddresses = async () => {
    try {
      const list = await api.addresses();
      setAddresses(list);
      if (list.length && !addressId) setAddressId(list[0].id);
      if (!list.length) setShowForm(true);
    } catch (e) { Alert.alert('Error', e.message); }
  };
  useFocusEffect(useCallback(() => { loadAddresses(); }, []));

  const saveAddress = async () => {
    try {
      const a = await api.addAddress({
        label: form.label || 'Home', line1: form.line1.trim(), line2: form.line2.trim() || null,
        landmark: form.landmark.trim() || null, city: form.city.trim(), pincode: form.pincode.trim(),
      });
      setAddresses((l) => [...l, a]);
      setAddressId(a.id);
      setShowForm(false);
    } catch (e) { Alert.alert('Invalid address', e.message); }
  };

  const fee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;

  const place = async () => {
    if (!addressId) return Alert.alert('Select an address', 'Please choose or add a delivery address.');
    try {
      setBusy(true);
      await api.placeOrder({
        addressId, paymentMethod: payment, notes: notes.trim() || null,
        items: lines.map((l) => ({ menuItemId: l.item.id, quantity: l.qty })),
      });
      clear();
      Alert.alert('Order placed 🎉', 'Your kulche are on the way soon!');
      navigation.navigate('Tabs', { screen: 'Orders' });
    } catch (e) {
      Alert.alert('Could not place order', e.message);
    } finally { setBusy(false); }
  };

  const f = (k) => (v) => setForm((x) => ({ ...x, [k]: v }));

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Text style={s.h}>Delivery address</Text>
      {addresses.map((a) => (
        <TouchableOpacity key={a.id} style={[s.opt, addressId === a.id && s.optOn]} onPress={() => setAddressId(a.id)}>
          <Text style={s.optTitle}>{a.label}</Text>
          <Text style={{ color: colors.muted }}>
            {[a.line1, a.line2, a.landmark, a.city, a.pincode].filter(Boolean).join(', ')}
          </Text>
        </TouchableOpacity>
      ))}
      {!showForm && (
        <TouchableOpacity onPress={() => setShowForm(true)}><Text style={s.link}>+ Add new address</Text></TouchableOpacity>
      )}
      {showForm && (
        <View style={s.form}>
          <TextInput style={s.input} placeholder="Label (Home / Work)" value={form.label} onChangeText={f('label')} />
          <TextInput style={s.input} placeholder="House no., street *" value={form.line1} onChangeText={f('line1')} />
          <TextInput style={s.input} placeholder="Area / colony" value={form.line2} onChangeText={f('line2')} />
          <TextInput style={s.input} placeholder="Landmark" value={form.landmark} onChangeText={f('landmark')} />
          <TextInput style={s.input} placeholder="City *" value={form.city} onChangeText={f('city')} />
          <TextInput style={s.input} placeholder="Pincode (6 digits) *" keyboardType="number-pad" maxLength={6} value={form.pincode} onChangeText={f('pincode')} />
          <TouchableOpacity style={s.saveBtn} onPress={saveAddress}><Text style={s.btnText}>Save address</Text></TouchableOpacity>
        </View>
      )}

      <Text style={s.h}>Payment</Text>
      {PAYMENTS.map((p) => (
        <TouchableOpacity key={p.key} style={[s.opt, payment === p.key && s.optOn]} onPress={() => setPayment(p.key)}>
          <Text style={s.optTitle}>{p.label}</Text>
        </TouchableOpacity>
      ))}

      <Text style={s.h}>Notes for the kitchen</Text>
      <TextInput style={[s.input, { height: 70 }]} multiline placeholder="e.g. extra butter, less spicy" value={notes} onChangeText={setNotes} />

      <View style={s.totalBox}>
        <Text style={s.total}>To pay: ₹{subtotal + fee}</Text>
        <Text style={{ color: colors.muted }}>{fee === 0 ? 'Free delivery' : `Includes ₹${fee} delivery`}</Text>
      </View>

      <TouchableOpacity style={s.btn} onPress={place} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Place order</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  h: { fontSize: 17, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  opt: { backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, marginBottom: 8 },
  optOn: { borderColor: colors.primary, backgroundColor: '#FFF1E6' },
  optTitle: { fontWeight: '700', marginBottom: 2 },
  link: { color: colors.primaryDark, fontWeight: '700', marginVertical: 6 },
  form: { backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 15 },
  saveBtn: { backgroundColor: colors.green, padding: 12, borderRadius: 10, alignItems: 'center' },
  totalBox: { marginTop: 20, alignItems: 'center' },
  total: { fontSize: 22, fontWeight: '800' },
  btn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 14, marginBottom: 30 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
