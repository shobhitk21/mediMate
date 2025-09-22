const express = require('express');
const userRouter = express()
const { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment } = require('../controllers/userController');
const authUser = require('../middlewares/authUser');
const upload = require('../middlewares/multer');
// const { initiatePayment } = require('../controllers/paymentController');
const { initiatePayment, paymentCallback, getReceipt } = require('../controllers/paymentController');


userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile)
userRouter.post('/book-appointment', authUser, bookAppointment)
userRouter.get('/appointments', authUser, listAppointment)
userRouter.post('/cancel-appointment', authUser, cancelAppointment)
// payment routes
userRouter.post("/payment/initiate", initiatePayment);
userRouter.post("/payment/callback", paymentCallback);
userRouter.get("/payment/callback", paymentCallback);
userRouter.get("/payment/receipt/:txnid", getReceipt);


module.exports = userRouter;