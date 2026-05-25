const bcrypt = require("bcryptjs");

/* bcrypt.hash("123", 12)
    .then(e => console.log(e))
    .catch(err => console.log("Error", err)) */

const hashed = "$2b$12$fLMDv7Pt2p89eT4YyW/GVeHAMOHzX9OXHT7Eft5MBgbbSVBhRGPQW";

bcrypt.compare("123", hashed)
    .then(e => console.log(e))
    .catch(err => console.log("Error", err))