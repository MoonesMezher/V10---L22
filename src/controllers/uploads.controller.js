const uploadToCloudinary = require("../utils/uploadToCloudinary");

class UploadsController {
    local = async (req, res) => {
        const file = req.file;

        if(!file) {
            return res.status(400).json({ message: "File is required" });
        }

        const filePath = file.path;

        res.status(200).json({ path: filePath })
    }

    external = async (req, res) => {
        const file = req.file;

        if(!file) {
            return res.status(400).json({ message: "File is required" });
        }

        const path = await uploadToCloudinary(file);

        res.status(200).json({ path })
    }
}

module.exports = new UploadsController();