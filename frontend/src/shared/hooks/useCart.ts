import { useSessionStorage } from "@mantine/hooks";

interface CartItem {
  item: {
    id: string;
    title: string;
  };
  type: "extend" | "buyout";
  deadline?: Date | undefined;
  price?: number | undefined;
}

export default function useCart() {
  const [cart, setCart, clearCart] = useSessionStorage<CartItem[]>({
    key: "cart",
    defaultValue: [],
  });
  function addToCart(cartItem: CartItem) {
    removeFromCart(cartItem.item.id);
    setCart((prev) => [...prev, cartItem]);
  }
  function removeFromCart(itemId: string) {
    setCart((prev) => prev.filter((cartItem) => cartItem.item.id !== itemId));
  }
  function findItemInCart(searchCartItem: CartItem | { item: { id: string } }) {
    return cart.find(
      (cartItem) =>
        cartItem.item.id === searchCartItem.item.id &&
        ("type" in searchCartItem
          ? cartItem.type === searchCartItem.type
          : true),
    );
  }
  function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price ?? 0), 0);
  }
  return {
    cart,
    findItemInCart,
    addToCart,
    removeFromCart,
    clearCart,
    calculateTotal,
  };
}
