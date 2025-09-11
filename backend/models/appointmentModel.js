const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    payment: {
        txnid: { type: String },
        amount: { type: Number },
        status: { type: String },
        mode: { type: String },
    },
})

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema)

module.exports = appointmentModel;
