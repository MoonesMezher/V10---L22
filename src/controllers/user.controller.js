const User = require("../models/User")
class UserController {
    getAll = async (req, res) => {
        const data = await User.find();
        res.status(200).json({ data })
    }
    getOne = async (req, res) => {
        const id = req.params.id;
        const data = await User.findById(id);
        if(!data) return res.status(404).json("Not Found");
        res.status(200).json({ data })
    }
    add = async (req, res) => {
        const { name, phone, email, password, role, address, realtimelocation } = req.body;
        const data = await User.create({ 
            name, phone, email, password, role, address, realtimelocation 
        });
        res.status(201).json({ data })
    }
    update = async (req, res) => {
        const id = req.params.id;
        const data = await User.findById(id);
        if(!data) return res.status(404).json("Not Found");
        
        const { name, phone, email, password, role, address, realtimelocation, avatar  } = req.body;
        data.name = name ?? data.name;
        data.phone = phone ?? data.phone;
        data.email = email ?? data.email;
        data.password = password ?? data.password;
        data.role = role ?? data.role;
        data.address = address ?? data.address;
        data.realtimelocation = realtimelocation ?? data.realtimelocation;
        await data.save();

        res.status(200).json({ data })
    }
    remove = async (req, res) => {
        const id = req.params.id;
        const data = await User.findById(id);
        if(!data) return res.status(404).json("Not Found");
        await User.findByIdAndDelete(id);
        res.status(200).json({ data: null })
    }
}

module.exports = new UserController();