import mongoose, {Schema, Types} from "mongoose";

const billSchema = new mongoose.Schema({
    patientId:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"Appointment" ,
       required:true
    },
    appointmentId:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"Appointment" ,
       required:true
    },
    totalAmount:{
       type:Number,
       required:true
    },
    paidAmount:{
        type:Number,
        required:true
    },
    dueAmount:{
        type:Number,
        required:true
    },
    billStatus:{
        enum:["UNPAID", "PAID"],
        required:true
    }
}, {timestamps:true})

export const Bill = mongoose.model("Bill", billSchema);