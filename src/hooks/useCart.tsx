import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  title: string;
  location: string;
  accommodation?: string;
  price: number;
  deposit: number;
  image: string;
  quantity: number;
  currency: string;
  capacity: number;
  contract: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (
    item: Omit<CartItem, "quantity" | "currency" | "capacity" | "contract"> &
      Partial<Pick<CartItem, "currency" | "capacity" | "contract">>,
  ) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("edmovinn:cart:v1") || "[]");
      return Array.isArray(saved)
        ? saved.filter(
            (i) =>
              typeof i.id === "string" &&
              ["TRY", "USD", "EUR"].includes(i.currency) &&
              Number.isInteger(i.quantity) &&
              i.quantity > 0 &&
              i.quantity <= 20,
          )
        : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("edmovinn:cart:v1", JSON.stringify(items));
    } catch {
      /* Storage may be disabled. */
    }
  }, [items]);

  const addToCart: CartContextType["addToCart"] = (newItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === newItem.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.capacity) }
            : item,
        );
      }
      return [
        ...prevItems,
        { currency: "TRY", capacity: 1, contract: "Monthly", ...newItem, quantity: 1 },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (!Number.isInteger(quantity)) return;
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(quantity, item.capacity) } : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.price + item.deposit) * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
