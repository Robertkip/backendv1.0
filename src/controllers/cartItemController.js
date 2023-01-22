import CartItem from "../models/cartItemModel";
import Order from "../models/orderModel";
import Market from "../models/marketModel";
import { request } from "express";
import router from "../routers/apartmentRoute";

export const getCartItem = async (req, res, next) => {
    try {
        let order;
        if(req.user) {
            order = await Order.findOne({
                where: {
                    userId: req.user.id,
                }
            })
        } else {
            order = await Order.findOne({
                where: {
                    id: req.session.activeOrder.id,
                    isActive: true
                }
            })
        }
        const currentOrder = await CartItem.findAll({
            where: {orderId: order.id},
            order: [['product_name', 'ASC']],
            include: [Market]
        })
  
         let totalQuantity = 0;
         let totalPrice = 0;

         currentOrder.map(eachProduct => {
            totalQuantity += eachProduct.product_quantity
            totalPrice += eachProduct.product_price * eachProduct.product_quantity
            return eachProduct
         })

         res.json({currentOrder: currentOrder, totalQuantity, totalPrice})

    } catch (error) {
        next(error)
    }
}


export const postCartItem = async (req, res, next) => {
    if(!req.user){
        return res.status(403).send({error: "Not Authorized."});
    }
    CartItem.findAll({
        where: {
            userId: req.user.id,
            product_id: req.body.id,

        }
    })
    try {
        await CartItem.create({
            UserId: req.user.id,
            product_id: request.params.id,
            product_quantity: req.body.product_quantity,
            product_price: req.body.product_price
        })
        .then(data => res.json(data))
        .catch(err => res.status(400).send({error: err.message}));
    } catch (error) {
        res.status(400).send({error: error.message})
    }
}

export const deleteCartItem = async (req, res, next) => {
    try {
        let order
        if(req.user) {
            order = await Order.findOne({
                where: {
                    userId: req.user.id,
                    isActive: true
                }
            })
        } else {
            order = await Order.findOne({
                where: {
                    id: req.session.activeOrder.id,
                    isActive: true
                }
            })
        }

        const deletedProduct = await CartItem.findOne({
            where: {
                product_id: req.params.id
            }
        })

        await deletedProduct.destroy()
        res.send(req.params.id)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

