import mongoose from "mongoose"

const hospitalSchmea =new mongoose.Schmea({
    name:{
        type:String,
        required:true,
    },
    addressLine1:{
        type:String,
        required:true
    },
    addressLine2:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    pincode:{
        type:String,
        required:true
    },
    specialisation:[
        {
        type:String
        } ,
   ],
},{timestamps:true})

export const hospital= mongoose.model("hospital",hospitalSchmea)