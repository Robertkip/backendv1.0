import express from "express";
import { sequelize } from "../config/connectDb.js";
import CartItem from "../models/cartItemModel.js";
import Market from "../models/marketModel.js";
import { Authenticated } from "../middlewares/authorizationPermission.js";
const router = express.Router();

router.use(Authenticated);

export const postCartItem = async (req, res, next) => {
  try {
    const { user } = req;
    const { productId } = req.params;
    const userId = user.dataValues.id;
    console.log("Req User Object  Controller", userId);
    //Check if the product exists;
    const product = await Market.findByPk(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if the product is already in the user's cart
    const cartItem = await CartItem.findOne({
      where: {
        userId,
        productId,
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
      productId,
      // Add other relevant details to the cart item, such as quantity, price, etc.
    });

    return res
      .status(200)
      .json({ message: "Product added to cart successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// export const getCartItems = async (req, res) => {
//   try {
//     const { user } = req;
//     const { productId } = req.params;
//     const userId = user.dataValues.id;

//     const carts = await CartItem.findAll({
//       where: {
//         userId,
//       },
//       include: Market,
//     });
//     res.status(200).send(carts);
//   } catch (err) {
//     res.status(500).send({ message: err.message });
//   }
// };

export const getCartItems = async (req, res) => {
  try {
    const { user } = req;
    const { productId } = req.params;
    const userId = user.dataValues.id;

    const query = `
  SELECT "CartItem".id, "CartItem"."userId", "CartItem"."productId", "Market"."product_quantity", "Market"."product_name", "Market"."product_description", "Market"."product_price", "Market"."type", "Market"."product_image"
  FROM "CartItems" AS "CartItem"
  INNER JOIN "Markets" AS "Market" ON "CartItem"."productId" = "Market"."id"
  WHERE "CartItem"."userId" = :userId
`;

    const carts = await sequelize.query(query, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).send(carts);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { action } = req.body;
    const { userId } = req.user; // Assuming you have user authentication and session management

    // Check if the cart item exists
    const cartItem = await CartItem.findOne({
      where: {
        id: itemId,
        userId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    // Update the quantity of the cart item based on the action
    if (action === "increment") {
      cartItem.quantity += 1;
    } else if (action === "decrement") {
      if (cartItem.quantity === 1) {
        // If the quantity is already 1 and the action is 'decrement', you can handle it as per your requirements
        // For example, you can delete the item from the cart or show an error message
        return res.status(400).json({ error: "Minimum quantity reached" });
      }
      cartItem.quantity -= 1;
    }

    await cartItem.save();

    return res
      .status(200)
      .json({ message: "Cart item quantity updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to update cart item quantity" });
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    console.log("Req User Object Is", req.user);
    const { productId } = req.params;
    const { user } = req;
    const userId = user.dataValues.id;
    console.log("Req User Object  Controller", userId);

    //Check if the product exists;
    const product = await Market.findByPk(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if the product is already in the user's cart
    const cartItem = await CartItem.findOne({
      where: {
        userId,
        productId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    // Add the product to the cart
    await cartItem.destroy();

    return res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete cart item" });
  }
};
