const cartKey = "wavedo.cart.v1";
export const cartSizes = ["XS", "S", "M", "L", "XL", "XXL"];
export type CartItem = { size: string; quantity: number };
export type SavedCart = CartItem & { items: CartItem[] };
function validItem(value: CartItem) {
  return value && cartSizes.includes(value.size) && Number.isSafeInteger(value.quantity) && value.quantity > 0;
}
export function readCart(): SavedCart | null {
  try {
    const value = JSON.parse(localStorage.getItem(cartKey) ?? "null");
    if (!value) return null;
    const items: CartItem[] = Array.isArray(value.items) ? value.items : [value];
    if (!items.every(validItem) || new Set(items.map((item) => item.size)).size !== items.length) return null;
    if (!items.length) return { size: "M", quantity: 0, items: [] };
    const selected = items.find((item) => item.size === value.size) ?? items[0];
    return { ...selected, items };
  } catch { return null; }
}
export function saveCart(cart: SavedCart) {
  try {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    window.dispatchEvent(new Event("wavedo:cart-updated"));
  } catch { /* Storage may be blocked. */ }
}
export function addToCart(size: string): SavedCart {
  const selectedSize = cartSizes.includes(size) ? size : "M";
  const items = (readCart()?.items ?? []).map((item) => ({ ...item }));
  let selected = items.find((item) => item.size === selectedSize);
  if (selected) selected.quantity += 1;
  else { selected = { size: selectedSize, quantity: 1 }; items.push(selected); }
  const next = { ...selected, items };
  saveCart(next);
  return next;
}
