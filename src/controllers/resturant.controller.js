const Resturant = require("../models/Resturant");
const Section = require("../models/Section");

class ResturantController {
    getAll = async (req, res) => {
        const data = await Resturant.find().sort({ avgRate: -1 });
        res.status(200).json({ data });
    }

    getOne = async (req, res) => {
        const data = await Resturant.findById(req.params.id);
        if (!data) return res.status(404).json("Not Found");

        const sections = await Section.find({ resturantId: data._id });
        res.status(200).json({ data, sections });
    }

    add = async (req, res) => {
        const { title, descrption, photo, location, address, hoursWork } = req.body;
        const data = await Resturant.create({ title, descrption, photo, location, address, hoursWork });
        res.status(201).json({ data });
    }

    update = async (req, res) => {
        const data = await Resturant.findById(req.params.id);
        if (!data) return res.status(404).json("Not Found");

        const { title, descrption, photo, location, address, hoursWork } = req.body;
        data.title = title ?? data.title;
        data.descrption = descrption ?? data.descrption;
        data.photo = photo ?? data.photo;
        data.location = location ?? data.location;
        data.address = address ?? data.address;
        data.hoursWork = hoursWork ?? data.hoursWork;
        await data.save();

        res.status(200).json({ data });
    }

    remove = async (req, res) => {
        const data = await Resturant.findById(req.params.id);
        if (!data) return res.status(404).json("Not Found");
        await Resturant.findByIdAndDelete(req.params.id);
        res.status(200).json({ data: null });
    }
}

module.exports = new ResturantController();
