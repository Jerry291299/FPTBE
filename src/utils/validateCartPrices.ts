import Cart from "../cart";
import Product from "../product";

export const validateCartPrices = async (userId: string) => {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
  
    if (!cart) throw new Error("Cart not found");
  
    let hasPriceChanged = false;
  
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
  
      // Find the corresponding variant in the product
      const variant = product.variants.find(
        (v) => v.size === item.size && v.price === item.price
      );
  
      if (!variant) {
        hasPriceChanged = true;
        break;
      }
    }
  
    return hasPriceChanged;
  };
