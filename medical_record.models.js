import mongoose from "mongoose"

const medicalSchmea =new mongoose.Schmea({
    name:{
        type:String,
        required:true,
    },
    age:{
        type:Number,
        required:true,
    },
    reord:{
        type:mongoose.Schmea.Types.ObjectId,
        ref:"hospital"
    },
    diagonesdwith:{
        type:String,
        required:true,
    },

},{timestamps:true})

export const medical= mongoose.model("medical",medicalSchmea)