import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { colors } from '../theme';

const STATUS_COLOR = {
  Placed: '#1971C2', Preparing: '#F08C00', OutForDelivery: '#7048E8', Delivered: colors.green, Cancelled: colors.red,
};
const STATUS_LABEL = { OutForDelivery: 'Out for delivery' };

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setOrders(await api.myOrders()); } catch (e) { Alert.alert('Error', e.message); }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
    const t = setInterval(load, 15000); // auto-refresh status
    return () => clearInterval(t);
  }, [load]));

  const cancel = (id) =>
    Alert.alert('Cancel order?', 'This cannot be undone.', [
      { text: 'No' },
      { text: 'Yes, cancel', style: 'destructive', onPress: async () => {
          try { await api.cancelOrder(id); load(); } catch (e) { Alert.alert('Cannot cancel', e.message); }
      } },
    ]);

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 12, flexGrow: 1 }}
      data={orders}
      keyExtractor={(o) => String(o.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 80, color: colors.muted }}>No orders yet</Text>}
      renderItem={({ item: o }) => (
        <View style={s.card}>
          <View style={s.top}>
            <Text style={s.id}>Order #{o.id}</Text>
            <Text style={[s.badge, { backgroundColor: STATUS_COLOR[o.status] }]}>{STATUS_LABEL[o.status] || o.status}</Text>
          </View>
          <Text style={s.date}>{new Date(o.createdAt + (o.createdAt.endsWith('Z') ? '' : 'Z')).toLocaleString()}</Text>
          {o.items.map((i) => (
            <Text key={i.menuItemId} style={s.item}>{i.quantity} × {i.itemName}  —  ₹{i.lineTotal}</Text>
          ))}
          <Text style={s.total}>Total ₹{o.total}  ·  {o.paymentMethod} ({o.paymentStatus})</Text>
          {o.status === 'Placed' && (
            <TouchableOpacity onPress={() => cancel(o.id)}><Text style={s.cancel}>Cancel order</Text></TouchableOpacity>
          )}
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontWeight: '800', fontSize: 16 },
  badge: { color: '#fff', fontWeight: '700', fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  date: { color: colors.muted, fontSize: 12, marginBottom: 8 },
  item: { marginBottom: 2 },
  total: { marginTop: 8, fontWeight: '800' },
  cancel: { color: colors.red, fontWeight: '700', marginTop: 10 },
});
