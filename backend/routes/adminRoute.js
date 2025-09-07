const express = require('express');
const upload = require('../middlewares/multer');
const { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, adminDashboard } = require('../controllers/adminControllers');
const authAdmin = require('../middlewares/authAdmin');
const { changeAvailability } = require('../controllers/doctorController');
const { cancelAppointment } = require('../controllers/userController');

const adminRouter = express.Router();

adminRouter.post('/login', loginAdmin)
adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor)
adminRouter.get('/all-doctors', authAdmin, allDoctors)
adminRouter.post('/change-availability', authAdmin, changeAvailability)
adminRouter.get('/appointments', authAdmin, appointmentsAdmin)
adminRouter.post('/cancel-appointment', authAdmin, cancelAppointment)
adminRouter.get('/dashboard', authAdmin, adminDashboard)



module.exports = adminRouter;