const Item = require("../models/Item");

class ItemController {
    getAll = async (req, res) => {
        const items = await Item.find();

        res.status(200).json({ data: items });
    }

    add = async (req, res) => {
        const { title, image } = req.body;

        const item = await Item.create({ title, image })

        res.status(201).json({ data: item });
    }
}

module.exports = new ItemController();