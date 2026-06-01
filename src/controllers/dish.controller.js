const Dish = require("../models/Dish");

class DishController {
    getAll = async (req, res) => {
        const filter = {};
        if (req.query.sectionId) filter.sectionId = req.query.sectionId;

        const data = await Dish.find(filter).populate("sectionId");
        res.status(200).json({ data });
    }

    getOne = async (req, res) => {
        const data = await Dish.findById(req.params.id).populate("sectionId");
        if (!data) return res.status(404).json("Not Found");
        res.status(200).json({ data });
    }

    add = async (req, res) => {
        const { title, descrption, photo, price, available, sectionId } = req.body;
        const data = await Dish.create({ title, descrption, photo, price, available, sectionId });
        res.status(201).json({ data });
    }

    update = async (req, res) => {
        const data = await Dish.findById(req.params.id);
        if (!data) return res.status(404).json("Not Found");

        const { title, descrption, photo, price, available, sectionId } = req.body;
        data.title = title ?? data.title;
        data.descrption = descrption ?? data.descrption;
        data.photo = photo ?? data.photo;
        data.price = price ?? data.price;
        data.available = available ?? data.available;
        data.sectionId = sectionId ?? data.sectionId;
        await data.save();

        res.status(200).json({ data });
    }

    remove = async (req, res) => {
        const data = await Dish.findById(req.params.id);
        if (!data) return res.status(404).json("Not Found");
        await Dish.findByIdAndDelete(req.params.id);
        res.status(200).json({ data: null });
    }
}

module.exports = new DishController();
