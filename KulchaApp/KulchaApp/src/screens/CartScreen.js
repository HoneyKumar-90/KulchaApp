import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from '../CartContext';
import { colors } from '../theme';
import { DELIVERY_FEE, FREE_DELIVERY_ABOVE } from '../config';

export default function CartScreen({ navigation }) {
  const { lines, subtotal, add, remove } = useCart();
  const fee = subtotal >= FREE_DELIVERY_ABOVE || subtotal === 0 ? 0 : DELIVERY_FEE;

  if (lines.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={{ fontSize: 48 }}>🛒</Text>
        <Text style={s.emptyText}>Your cart is empty</Text>
        <Text style={{ color: colors.muted }}>Add some hot kulche from the menu</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={lines}
        keyExtractor={(l) => String(l.item.id)}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item: { item, qty } }) => (
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{item.name}</Text>
              <Text style={{ color: colors.muted }}>₹{item.price} × {qty}</Text>
            </View>
            <View style={s.stepper}>
              <TouchableOpacity onPress={() => remove(item)}><Text style={s.stepBtn}>−</Text></TouchableOpacity>
              <Text style={s.qty}>{qty}</Text>
              <TouchableOpacity onPress={() => add(item)}><Text style={s.stepBtn}>+</Text></TouchableOpacity>
            </View>
            <Text style={s.line}>₹{item.price * qty}</Text>
          </View>
        )}
      />
      <View style={s.footer}>
        <View style={s.sum}><Text>Subtotal</Text><Text>₹{subtotal}</Text></View>
        <View style={s.sum}><Text>Delivery</Text><Text>{fee === 0 ? 'FREE' : `₹${fee}`}</Text></View>
        {fee > 0 && <Text style={s.hint}>Add ₹{FREE_DELIVERY_ABOVE - subtotal} more for free delivery</Text>}
        <View style={s.sum}><Text style={s.total}>Total</Text><Text style={s.total}>₹{subtotal + fee}</Text></View>
        <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Checkout')}>
          <Text style={s.btnText}>Proceed to checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  emptyText: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  name: { fontWeight: '700', fontSize: 15 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 8, marginHorizontal: 10 },
  stepBtn: { color: '#fff', fontSize: 20, fontWeight: '700', paddingHorizontal: 10 },
  qty: { color: '#fff', fontWeight: '800', minWidth: 16, textAlign: 'center' },
  line: { width: 60, textAlign: 'right', fontWeight: '800' },
  footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderColor: colors.border },
  sum: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  total: { fontSize: 18, fontWeight: '800' },
  hint: { color: colors.green, fontSize: 12, marginBottom: 6 },
  btn: { backgroundColor: colors.primary, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
