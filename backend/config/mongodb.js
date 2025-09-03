const mongoose = require('mongoose');

const connectDB = async () => {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("database Connected!!"));
}

module.exports = { connectDB }