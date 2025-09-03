const express = require('express');
const upload = require('../middlewares/multer');
const { addDoctor, loginAdmin, allDoctors } = require('../controllers/adminControllers');
const authAdmin = require('../middlewares/authAdmin');
const { changeAvailability } = require('../controllers/doctorController');

const adminRouter = express.Router();

adminRouter.post('/login', loginAdmin)
adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor)
adminRouter.get('/all-doctors', authAdmin, allDoctors)
adminRouter.post('/change-availability', authAdmin, changeAvailability)


module.exports = adminRouter;