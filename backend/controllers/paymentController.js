const Razorpay = require('razorpay');
const crypto = require("crypto");
const appointmentModel = require('../models/appointmentModel');

let razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const createOrder = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await appointmentModel.findById(appointmentId);

        const options = {
            amount: appointment.amount * 100,
            currency: process.env.currency || "INR",
        };

        const order = await razorpayInstance.orders.create(options);

        await appointmentModel.findByIdAndUpdate(appointment._id, {
            razorpayOrderId: order.id,
            paymentStatus: "created",
        });

        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating RazorPay order");
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            appointmentId,
        } = req.body;

        // Step 1: generate signature
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        // Step 2: compare signature
        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // Step 3: update DB
        await appointmentModel.findByIdAndUpdate(appointmentId, {
            isPayed: true,
            razorpayOrderId: razorpay_order_id,
        });

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
        });

    } catch (error) {
        console.log("Verify error:", error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
        });
    }
};


module.exports = { createOrder, verifyPayment };