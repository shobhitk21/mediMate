const mongoose = require('mongoose');

const connectDB = async () => {
    mongoose.connect(process.env.MONGO_LOCAL)
        .then(() => console.log("database Connected!!"));
}

module.exports = { connectDB }