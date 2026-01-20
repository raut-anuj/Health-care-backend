import mongoose, {Schema} from "mongoose";

const appointmentSchema = new mongoose.Schema({
        patientId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: "true"
        },
        doctorId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: "true"
        },
        date:{
            type: Date,
            default: Date.now
            },
        time:{
            type: String, // "10:30 AM"
            required: true
        },
        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled"],
            default: "scheduled"
            },
        amount: {
            type: Number,
            required: true
        }
}, {timestamps: true});

export const Appointment = mongoose.model("Appointment", appointmentSchema);