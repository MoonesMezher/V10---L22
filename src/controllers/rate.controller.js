const Rate = require("../models/Rate");
const Order = require("../models/Order");
const Resturant = require("../models/Resturant");

class RateController {
    getAll = async (req, res) => {
        const filter = {};
        if (req.query.resturantId) filter.resturantId = req.query.resturantId;

        const data = await Rate.find(filter)
            .populate("userId", "-password")
            .populate("resturantId")
            .sort({ createdAt: -1 });

        res.status(200).json({ data });
    }

    getOne = async (req, res) => {
        const data = await Rate.findById(req.params.id)
            .populate("userId", "-password")
            .populate("resturantId");
        if (!data) return res.status(404).json("Not Found");
        res.status(200).json({ data });
    }

    add = async (req, res) => {
        const { stars, comment, resturantId, orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json("Order not found");
        if (order.status !== "completed") {
            return res.status(400).json("You can only rate completed orders");
        }
        if (order.customerId.toString() !== req._user._id.toString()) {
            return res.status(403).json("You can only rate your own orders");
        }

        const existing = await Rate.findOne({ orderId });
        if (existing) return res.status(400).json("This order has already been rated");

        const data = await Rate.create({
            stars,
            comment,
            resturantId,
            orderId,
            userId: req._user._id
        });

        const rates = await Rate.find({ resturantId });
        const avgRate = rates.reduce((sum, r) => sum + r.stars, 0) / rates.length;
        await Resturant.findByIdAndUpdate(resturantId, { avgRate: Math.round(avgRate * 10) / 10 });

        res.status(201).json({ data });
    }

    remove = async (req, res) => {
        const data = await Rate.findById(req.params.id);
        if (!data) return res.status(404).json("Not Found");
        await Rate.findByIdAndDelete(req.params.id);
        res.status(200).json({ data: null });
    }
}

module.exports = new RateController();
