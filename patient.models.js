import mongoose from "mongoose"

const patientSchmea =new mongoose.Schmea({
    name:{
        type:String,
        required:true,
    },
    diagonsedWith:{
        type:String,
        required:true
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
    addmittedIn:{
        type:mongoose.Schema.Type.ObjectId,
        ref:"hospital"
    },
    number:{
      type:Number,
      required:true
    }
},{timestamps:true})

export const patient= mongoose.model("patient",patientSchmea)