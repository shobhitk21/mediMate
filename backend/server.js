const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/mongodb')
const { connectCloudinary } = require('./config/cloudinary');
const adminRouter = require('./routes/adminRoute');
const doctorRouter = require('./routes/doctorRoute');
const userRouter = require('./routes/userRoutes');



// app config
const app = express();
const PORT = process.env.PORT || 4000;
connectDB();
connectCloudinary();


// middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


// api end points

app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)



app.get('/', (req, res) => {
    res.send('hello')
})


app.listen(PORT, () => {
    console.log('server started!!');
})