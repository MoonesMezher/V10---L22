const Order = require("../models/Order");
const DishOrder = require("../models/DishOrder");
const Dish = require("../models/Dish");
const Rate = require("../models/Rate");

class OrderController {
    getAll = async (req, res) => {
        const filter = {};

        if (req.query.available === "true" && req._user.role === "driver") {
            filter.status = "on-the-way";
            filter.$or = [{ driverId: { $exists: false } }, { driverId: null }];
        } else if (req._user.role === "customer") {
            filter.customerId = req._user._id;
        } else if (req._user.role === "driver") {
            filter.driverId = req._user._id;
        }

        if (req.query.resturantId) filter.resturantId = req.query.resturantId;
        if (req.query.status) filter.status = req.query.status;

        const data = await Order.find(filter)
            .populate("customerId", "-password")
            .populate("driverId", "-password")
            .populate("resturantId")
            .sort({ createdAt: -1 });

        res.status(200).json({ data });
    }

    getOne = async (req, res) => {
        const data = await Order.findById(req.params.id)
            .populate("customerId", "-password")
            .populate("driverId", "-password")
            .populate("resturantId");

        if (!data) return res.status(404).json("Not Found");

        const items = await DishOrder.find({ orderId: data._id }).populate("dishId");
        res.status(200).json({ data, items });
    }

    add = async (req, res) => {
        const { resturantId, items } = req.body;

        if (!items || !items.length) {
            return res.status(400).json("Order must contain at least one item");
        }

        let total = 0;
        const dishOrders = [];

        for (const item of items) {
            const dish = await Dish.findById(item.dishId);
            if (!dish || !dish.available) {
                return res.status(400).json(`Dish ${item.dishId} is not available`);
            }

            const price = parseFloat(dish.price);
            const count = item.count || 1;
            const itemTotal = price * count;
            total += itemTotal;

            dishOrders.push({
                dishId: dish._id,
                price,
                count,
                total: itemTotal,
                notes: item.notes || ""
            });
        }

        const order = await Order.create({
            resturantId,
            customerId: req._user._id,
            total,
            status: "pending"
        });

        for (const item of dishOrders) {
            await DishOrder.create({ ...item, orderId: order._id });
        }

        const data = await Order.findById(order._id)
            .populate("resturantId")
            .populate("customerId", "-password");

        res.status(201).json({ data });
    }

    update = async (req, res) => {
        const data = await Order.findById(req.params.id);
        if (!data) return res.status(404).json("Not Found");

        const { status, driverId } = req.body;

        if (status) data.status = status;
        if (driverId) data.driverId = driverId;

        await data.save();

        const updated = await Order.findById(data._id)
            .populate("customerId", "-password")
            .populate("driverId", "-password")
            .populate("resturantId");

        res.status(200).json({ data: updated });
    }

    remove = async (req, res) => {
        const data = await Order.findById(req.params.id);
        if (!data) return res.status(404).json("Not Found");

        if (data.status !== "pending" && data.status !== "canceled") {
            return res.status(400).json("Only pending orders can be canceled");
        }

        data.status = "canceled";
        await data.save();

        res.status(200).json({ data });
    }
}

module.exports = new OrderController();
