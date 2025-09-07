const validator = require('validator');
const bcrypt = require('bcrypt');
const doctorModel = require('../models/doctorModel');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary');
const appointmentModel = require('../models/appointmentModel');
const userModel = require('../models/userModel');


//api for adding doctor

const addDoctor = async (req, res) => {

    try {

        const { name, email, password, speciality, degree, experience, about, available, fees, address } = req.body
        const imageFile = req.file;

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "missing details" })
        }

        console.log({ speciality, name, email, password, degree, experience, about, available, fees, address });


        // validating email
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "invalid email" })
        }

        // validating password
        if (password.length < 8) {
            return res.json({ success: false, message: "password must be greater than 8 characters" })
        }

        // hashing doctor password 
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const iamgeUpload = await cloudinary.uploader.upload(imageFile.path, { resouce_type: "image" })
        const imageUrl = iamgeUpload.secure_url

        const doctorData = {
            name,
            email,
            password: hashedPassword,
            image: imageUrl,
            speciality,
            degree,
            experience,
            about,
            available,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        res.json({ success: true, message: 'new doctor added' })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {

            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })

        } else {
            res.json({ success: false, message: "invalid credentials" })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// API ti get all doctors list to admin panel
const allDoctors = async (req, res) => {

    try {
        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

// API to get all appointment list
const appointmentsAdmin = async (req, res) => {

    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

// API for admin cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

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

//API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})
        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

module.exports = { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard };