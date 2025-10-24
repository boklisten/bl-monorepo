import { CartItem } from "@boklisten/backend/shared/cart_item";
import { useSessionStorage } from "@mantine/hooks";

export default function useCart() {
  const [cart, setCart, clear] = useSessionStorage<CartItem[]>({
    key: "cart",
    defaultValue: [],
  });
  function add(cartItem: CartItem) {
    remove(cartItem.id);
    setCart((prev) =>
      [...prev, cartItem].sort((a, b) => a.title.localeCompare(b.title)),
    );
  }
  function remove(itemId: string) {
    setCart((prev) => prev.filter((cartItem) => cartItem.id !== itemId));
  }
  function calculateTotal() {
    return Math.ceil(
      cart.reduce(
        (total, cartItem) => total + (getSelectedOption(cartItem).price ?? 0),
        0,
      ),
    );
  }
  function getSelectedOption(cartItem: CartItem) {
    const selectedOption = cartItem.options[cartItem.selectedOptionIndex];
    if (!selectedOption) {
      clear();
      throw new Error("Invalid selected option in cart!");
    }
    return selectedOption;
  }
  return {
    get: () => cart,
    size: () => cart.length,
    isEmpty: () => cart.length === 0,
    add,
    remove,
    clear,
    getSelectedOption,
    calculateTotal,
  };
}
