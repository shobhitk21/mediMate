const validator = require('validator')
const bcrypt = require('bcrypt')
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken');
const doctorModel = require('../models/doctorModel');
const appointmentModel = require('../models/appointmentModel');
const cloudinary = require('cloudinary').v2;


//API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email and password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Enter Valid Email' })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: 'Password must be greater than 8 digit' })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData);
        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({ success: true, token, userData: user })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// API for user login 
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: 'no user found' })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token, userData: user })
        } else {
            return res.json({ success: false, message: 'Invalid Credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

// API to get user profile data

const getProfile = async (req, res) => {
    try {

        const userId = req.userId

        const userData = await userModel.findById(userId).select('-password')
        res.json({ success: true, userData })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// API to updatae user profile

const updateProfile = async (req, res) => {
    try {

        const userId = req.userId
        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file
        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "missing details" })
        }

        // console.log(req.body);

        await userModel.findByIdAndUpdate(userId, { name, phone, address, dob, gender })

        if (imageFile) {
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
            const imageURL = imageUpload.secure_url
            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: "profile updated" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

// API to book appointment
const bookAppointment = async (req, res) => {

    try {

        const userId = req.userId;
        const { docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select('-password')

        if (!docData.available) {
            res.json({ success: false, message: 'Doctor not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                res.json({ success: false, message: 'Slot not Available' })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            slotDate,
            slotTime,
            amount: docData.fees,
            date: Date.now()
        }        

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docotrs data

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment booked' })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

//API to user appointment for frontend /my-appointment page
const listAppointment = async (req, res) => {

    try {

        const userId = req.userId
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const userId = req.userId
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'unathorized access' })
        }
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot

        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment cancelled' })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

// API to make payment using payu




module.exports = { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment }