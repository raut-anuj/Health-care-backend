import mongoose from "mongoose"

const doctorSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    salary:{
        type:Number,
        required:true,
    },
    qualification:{
        type:String,
        required:true,
    },
    experinceinYears:{
        type:Number,
        default:0
    },
    worksinHospital:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Hospital"
        },
    address:{
        type:String,
        required:true
    },
    bloodgroup:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    sex:{
        type:String,
        enum:["Male","Female","Other"],
        required:true
    },
    number:{
      type:Number,
      required:true
    }
},{timestamps:true})

export const doctor=mongoose.model("doctor",doctorSchema)