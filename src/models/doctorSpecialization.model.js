import mongoose, { Schema} from "mongoose";
import jwt from "jsonwebtoken";

const doctorSpecializationSchema = new mongoose.Schema({
    drname:{
        type: mongoose.Schema.Types.ObjectId ,
        ref: "Doctor"
    },
    qualification:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor"
    },
    experince:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor"
    },
    specialization:{
        types:mongoose.Schema.Types.ObjectId,
        ref:"Doctor"
    }
}, {timestamps:true})

export const DoctorSpecialization = mongoose.model("DoctorSpecialization", doctorSpecializationSchema)