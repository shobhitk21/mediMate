const crypto = require('crypto');
const appointmentModel = require("../models/appointmentModel.js");
const doctorModel = require('../models/doctorModel.js');
const userModel = require('../models/userModel.js');


// --- Hash helpers ---
const generateHash = ({ key, txnid, amount, productinfo, firstname, email, salt }) => {
    const str = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    return crypto.createHash('sha512').update(str).digest('hex');
};

const verifyHash = (response, salt) => {
    const {
        key, txnid, amount, productinfo, firstname, email, status, hash
    } = response;

    const hashStr = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calcHash = crypto.createHash('sha512').update(hashStr).digest('hex');

    return calcHash === hash;
};

// --- Controller: initiatePayment ---
const initiatePayment = async (req, res) => {

    try {
        const { appointmentId } = req.body;

        // Get appointment
        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.status(400).json({ success: false, message: 'Appointment not found' });
        }
        if (appointment.cancelled) {
            return res.status(400).json({ success: false, message: 'Appointment is cancelled' });
        }
        if (appointment.payment.status === "success" && appointment.payment.txnid) {
            return res.status(400).json({ success: false, message: 'Appointment already paid' });
        }

        // Fetch user
        const user = await userModel.findById(appointment.userId).select("name email phone");

        // Fetch doctor
        const doctor = await doctorModel.findById(appointment.docId);

        const amount = doctor.fees.toFixed(2);
        const txnid = 'TXN' + Date.now();
        const productinfo = `Consultation with Dr. ${doctor.name}`;
        const firstname = user.name;
        const email = user.email;
        const phone = user.phone;

        // 🔹 Save txnid in appointment (status = pending)
        appointment.payment = {
            txnid,
            amount,
            status: "pending"
        };
        await appointment.save();

        const hash = generateHash({
            key: process.env.PAYU_MERCHANT_KEY,
            txnid,
            amount,
            productinfo,
            firstname,
            email,
            salt: process.env.PAYU_MERCHANT_SALT
        });

        const paymentData = {
            key: process.env.PAYU_MERCHANT_KEY,
            txnid,
            amount,
            productinfo,
            firstname,
            email,
            phone,
            surl: `${process.env.BACKEND_URL}/api/user/payment/callback`,
            furl: `${process.env.BACKEND_URL}/api/user/payment/callback`,
            hash,
            service_provider: 'payu_paisa'
        };

        console.log("🚀 Payment request data:", paymentData);

        res.json({ success: true, paymentData, action: process.env.PAYU_BASE_URL });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Payment initiation failed' });
    }
};




// --- Controller: paymentCallback ---
const paymentCallback = async (req, res) => {
    try {

        const response = req.body;
        console.log("Payment Callback Response:", response);

        // Verify hash          
        // const isValid = verifyHash(response, process.env.PAYU_MERCHANT_SALT);

        // if (!isValid) {
        //     return res.status(400).send('Invalid transaction hash');
        // }

        if (response.status === 'success') {
            await appointmentModel.findOneAndUpdate(
                { "payment.txnid": response.txnid },   //  match by txnid
                {
                    $set: {
                        "payment.amount": response.amount,
                        "payment.status": response.status,
                        "payment.mode": response.mode,
                    }
                }
            );
        } else {
            await appointmentModel.findOneAndUpdate(
                { "payment.txnid": response.txnid },
                { $set: { "payment.status": response.status } }
            );
        }

        // Redirect to frontend    

        console.log(`${process.env.FRONTEND_URL}/payment-status?status=${response.status}&txnid=${response.txnid}`);

        // res.redirect(`${process.env.FRONTEND_URL}/payment-status?status=${response.status}&txnid=${response.txnid}`);
        res.status(200).send(`<html><head><meta http-equiv="refresh" content="0;url=${process.env.FRONTEND_URL}/payment-status?status=${response.status}&txnid=${response.txnid}" /></head><body>Redirecting...</body></html>`);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error processing payment callback');
    }
};


// --- Controller: getReceipt ---

const getReceipt = async (req, res) => {
    try {
        const txnid = req.params.txnid;

        const appointment = await appointmentModel.findOne({ "payment.txnid": txnid });
        if (!appointment || !appointment.payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        const doctor = await doctorModel.findById(appointment.docId);
        const user = await userModel.findById(appointment.userId);

        res.json({
            success: true,
            receipt: {
                txnid: appointment.payment.txnid,
                doctor: doctor?.name || 'N/A',
                patient: user?.name || 'N/A',
                amount: appointment.payment.amount,
                mode: appointment.payment.mode,
                status: appointment.payment.status,
                date: appointment.createdAt,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch receipt' });
    }
};


// --- Export all ---
module.exports = {
    initiatePayment,
    paymentCallback,
    getReceipt
};
