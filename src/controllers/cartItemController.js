import CartItem from "../models/cartItemModel.js";
import Order from "../models/orderModel.js";
import Market from "../models/marketModel.js";

export const getCartItem = async (req, res, next) => {
  try {
    let order;
    if (req.user) {
      order = await Order.findOne({
        where: {
          userId: req.user.id,
        },
      });
    } else {
      order = await Order.findOne({
        where: {
          id: req.session.activeOrder.id,
          isActive: true,
        },
      });
    }
    const currentOrder = await CartItem.findAll({
      where: { orderId: order.id },
      order: [["product_name", "ASC"]],
      include: [Market],
    });

    let totalQuantity = 0;
    let totalPrice = 0;

    currentOrder.map((eachProduct) => {
      totalQuantity += eachProduct.product_quantity;
      totalPrice += eachProduct.product_price * eachProduct.product_quantity;
      return eachProduct;
    });

    res.json({ currentOrder: currentOrder, totalQuantity, totalPrice });
  } catch (error) {
    next(error);
  }
};

export const postCartItem = async (req, res, next) => {
  // if(!req.user){
  //     return res.status(403).send({error: "Not Authorized."});
  // }
  // CartItem.findAll({
  //     where: {
  //         userId: req.user.id,
  //         product_id: req.body.id,

  //     }
  // })
  try {
    const { product_id } = req.body;
    const { userId } = req.user;
    //Check if the product exists;
    const product = await Market.findByPk(product_id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if the product is already in the user's cart
    const cartItem = await Cart.findOne({
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
    await Cart.create({
      userId,
      product_id,
      // Add other relevant details to the cart item, such as quantity, price, etc.
    });

    return res
      .status(200)
      .json({ message: "Product added to cart successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to add product to cart" });
  }
};

export const deleteCartItem = async (req, res, next) => {
  try {
    let order;
    if (req.user) {
      order = await Order.findOne({
        where: {
          userId: req.user.id,
          isActive: true,
        },
      });
    } else {
      order = await Order.findOne({
        where: {
          id: req.session.activeOrder.id,
          isActive: true,
        },
      });
    }

    const deletedProduct = await CartItem.findOne({
      where: {
        product_id: req.params.id,
      },
    });

    await deletedProduct.destroy();
    res.send(req.params.id);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
