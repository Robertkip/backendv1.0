import { sequelize } from "../config/connectDb.js";
import CartItem from "../models/cartItemModel.js";
import Market from "../models/marketModel.js";

export const postCartItem = async (req, res) => {
  const userId = req.user.id;
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: "productId must be a number" });
  }

  if (!(await Market.findByPk(productId))) {
    return res.status(404).json({ error: "Product not found" });
  }
  if (await CartItem.findOne({ where: { userId, productId } })) {
    return res.status(400).json({ error: "Product already in the cart" });
  }

  await CartItem.create({ userId, productId });
  return res.status(200).json({ message: "Product added to cart successfully" });
};

export const getCartItems = async (req, res) => {
  const carts = await sequelize.query(
    `
    SELECT c.id, c."userId", c."productId", c.quantity,
           m.product_quantity, m.product_name, m.product_description, m.product_price, m.type, m.product_image
    FROM cartitems c
    INNER JOIN markets m ON c."productId" = m.id
    WHERE c."userId" = :userId
    ORDER BY c.id
    `,
    { replacements: { userId: req.user.id }, type: sequelize.QueryTypes.SELECT }
  );
  return res.status(200).send(carts);
};

// PUT /cart/:id with { action: "increment" | "decrement" }; :id is the cart item's id.
export const updateQuantity = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "id must be a number" });
  }
  const { action } = req.body;
  if (action !== "increment" && action !== "decrement") {
    return res.status(400).json({ error: 'action must be "increment" or "decrement"' });
  }

  const cartItem = await CartItem.findOne({ where: { id, userId: req.user.id } });
  if (!cartItem) {
    return res.status(404).json({ error: "Cart item not found" });
  }

  if (action === "increment") {
    cartItem.quantity += 1;
  } else {
    if (cartItem.quantity <= 1) {
      return res.status(400).json({ error: "Minimum quantity reached" });
    }
    cartItem.quantity -= 1;
  }
  await cartItem.save();

  return res.status(200).json({ message: "Cart item quantity updated successfully", quantity: cartItem.quantity });
};

export const removeCartItem = async (req, res) => {
  const productId = Number(req.params.productId);
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: "productId must be a number" });
  }
  const cartItem = await CartItem.findOne({ where: { userId: req.user.id, productId } });
  if (!cartItem) {
    return res.status(404).json({ error: "Cart item not found" });
  }
  await cartItem.destroy();
  return res.status(200).json({ message: "Cart item deleted successfully" });
};
