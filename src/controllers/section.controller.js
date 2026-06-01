const Section = require("../models/Section");
const Dish = require("../models/Dish");

class SectionController {
    getAll = async (req, res) => {
        const filter = {};
        if (req.query.resturantId) filter.resturantId = req.query.resturantId;

        const data = await Section.find(filter).populate("resturantId");
        res.status(200).json({ data });
    }

    getOne = async (req, res) => {
        const data = await Section.findById(req.params.id).populate("resturantId");
        if (!data) return res.status(404).json("Not Found");

        const dishes = await Dish.find({ sectionId: data._id });
        res.status(200).json({ data, dishes });
    }

    add = async (req, res) => {
        const { title, descrption, resturantId } = req.body;
        const data = await Section.create({ title, descrption, resturantId });
        res.status(201).json({ data });
    }

    update = async (req, res) => {
        const data = await Section.findById(req.params.id);
        if (!data) return res.status(404).json("Not Found");

        const { title, descrption, resturantId } = req.body;
        data.title = title ?? data.title;
        data.descrption = descrption ?? data.descrption;
        data.resturantId = resturantId ?? data.resturantId;
        await data.save();

        res.status(200).json({ data });
    }

    remove = async (req, res) => {
        const data = await Section.findById(req.params.id);
        if (!data) return res.status(404).json("Not Found");
        await Section.findByIdAndDelete(req.params.id);
        await Dish.deleteMany({ sectionId: req.params.id });
        res.status(200).json({ data: null });
    }
}

module.exports = new SectionController();
