import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { api } from '../api';
import { useCart } from '../CartContext';
import { colors } from '../theme';

const CATS = ['All', 'Kulcha', 'Combo', 'Side', 'Beverage', 'Dessert'];

export default function MenuScreen() {
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { add, remove, qtyOf } = useCart();

  const load = useCallback(async () => {
    try {
      setError(null);
      setItems(await api.menu());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const data = cat === 'All' ? items : items.filter((i) => i.category === cat);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={s.chips}>
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
          data={CATS} keyExtractor={(c) => c}
          renderItem={({ item: c }) => (
            <TouchableOpacity onPress={() => setCat(c)} style={[s.chip, cat === c && s.chipOn]}>
              <Text style={[s.chipText, cat === c && { color: '#fff' }]}>{c}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      {error && <Text style={s.error}>{error}{'\n'}Pull down to retry.</Text>}
      <FlatList
        data={data}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        renderItem={({ item }) => {
          const q = qtyOf(item.id);
          return (
            <View style={s.card}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={s.name}>🟢 {item.name}</Text>
                <Text style={s.desc}>{item.description}</Text>
                <Text style={s.price}>₹{item.price}</Text>
              </View>
              {q === 0 ? (
                <TouchableOpacity style={s.addBtn} onPress={() => add(item)}>
                  <Text style={s.addText}>ADD</Text>
                </TouchableOpacity>
              ) : (
                <View style={s.stepper}>
                  <TouchableOpacity onPress={() => remove(item)}><Text style={s.stepBtn}>−</Text></TouchableOpacity>
                  <Text style={s.qty}>{q}</Text>
                  <TouchableOpacity onPress={() => add(item)}><Text style={s.stepBtn}>+</Text></TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  chips: { paddingVertical: 10, paddingLeft: 12 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', marginRight: 8 },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  desc: { color: colors.muted, marginTop: 4, fontSize: 13 },
  price: { marginTop: 6, fontWeight: '800', color: colors.primaryDark, fontSize: 16 },
  addBtn: { borderWidth: 1.5, borderColor: colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  addText: { color: colors.primary, fontWeight: '800' },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 10 },
  stepBtn: { color: '#fff', fontSize: 22, fontWeight: '700', paddingHorizontal: 12, paddingVertical: 2 },
  qty: { color: '#fff', fontWeight: '800', minWidth: 18, textAlign: 'center' },
  error: { color: colors.red, textAlign: 'center', padding: 10 },
});
