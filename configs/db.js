const mongoose = require('mongoose');


require('dotenv').config({
    path: './.env'
});

const connectDB = async () => {
    try {
        const conn = process.env.NODE_ENV === "development"
            ? await mongoose.connect(process.env.MONGO_URL_DEV)
            : await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoBD : connected ", conn.connections[0].host);
    } catch (error) {
        console.log("error checked Db", error);
        process.exit(1);
    }
};


module.exports = connectDB;

