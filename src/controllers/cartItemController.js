import CartItem from "../models/cartItemModel.js";
import Order from "../models/orderModel.js";
import Market from "../models/marketModel.js";

export const getCartItems = async (req, res) => {
  try {
    const carts = await CartItem.findAll();
    res.status(200).send(carts);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const postCartItem = async (req, res, next) => {
  try {
    console.log("Req User Object Is", req.user);
    const { product_id } = req.params.id;
    const { userId } = req.user;
    //Check if the product exists;
    const product = await Market.findByPk(product_id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if the product is already in the user's cart
    const cartItem = await CartItem.findOne({
      where: {
        userId,
        product_id,
      },
    });

    if (cartItem) {
      // If the product is already in the cart, you can handle it as per your requirements
      // For example, you can update the quantity or show an error message
      return res.status(400).json({ error: "Product already in the cart" });
    }

    // Add the product to the cart
    await CartItem.create({
      userId,
      product_id,
      // Add other relevant details to the cart item, such as quantity, price, etc.
    });

    return res
      .status(200)
      .json({ message: "Product added to cart successfully" });
  } catch (error) {
    return res.status(500).json({ msg });
  }
};

export const updateQuantity = async (marketId, quantityToSubtract) => {
  try {
    const market = await Market.findByPk(marketId);

    if (!market) {
      throw new Error("Market not found");
    }

    const newQuantity = market.quantity - quantityToSubtract;

    if (newQuantity < 0) {
      throw new Error("Insufficient quantity");
    }

    market.quantity = newQuantity;
    await market.save();

    return market;
  } catch (error) {
    throw new Error("Failed to update Market quantity");
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    console.log("Req User Object Is", req.user);
    const { product_id } = req.params.id;
    const { userId } = req.user;
    //Check if the product exists;
    const product = await Market.findByPk(product_id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if the product is already in the user's cart
    const cartItem = await CartItem.findOne({
      where: {
        userId,
        product_id,
      },
    });

    if (cartItem) {
      // If the product is already in the cart, you can handle it as per your requirements
      // For example, you can update the quantity or show an error message
      return res.status(400).json({ error: "Product already in the cart" });
    }

    // Add the product to the cart
    await CartItem.destroy();

    return res
      .status(200)
      .json({ message: "Product added to cart successfully" });
  } catch (error) {
    return res.status(500).json({ msg });
  }
};
