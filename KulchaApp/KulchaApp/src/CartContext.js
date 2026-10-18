import React, { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  // { [menuItemId]: { item, qty } }
  const [lines, setLines] = useState({});

  const add = (item) =>
    setLines((l) => ({ ...l, [item.id]: { item, qty: (l[item.id]?.qty || 0) + 1 } }));

  const remove = (item) =>
    setLines((l) => {
      const cur = l[item.id];
      if (!cur) return l;
      const copy = { ...l };
      if (cur.qty <= 1) delete copy[item.id];
      else copy[item.id] = { ...cur, qty: cur.qty - 1 };
      return copy;
    });

  const clear = () => setLines({});

  const value = useMemo(() => {
    const list = Object.values(lines);
    return {
      lines: list,
      count: list.reduce((s, x) => s + x.qty, 0),
      subtotal: list.reduce((s, x) => s + x.qty * x.item.price, 0),
      qtyOf: (id) => lines[id]?.qty || 0,
      add, remove, clear,
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
