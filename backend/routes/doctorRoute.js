const express = require('express')
const doctorRouter = express()
const { doctorList, loginDoctor, appointmentDoctor, appointmentComplete, appointmentCancel } = require('../controllers/doctorController')
const authDoctor = require('../middlewares/authDoctor')

doctorRouter.get('/list', doctorList)
doctorRouter.post('/login', loginDoctor)
doctorRouter.get('/appointments', authDoctor, appointmentDoctor)
doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete)
doctorRouter.post('/cancel-appointment', authDoctor, appointmentCancel)



module.exports = doctorRouter;