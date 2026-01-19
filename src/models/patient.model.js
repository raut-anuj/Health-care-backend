import mongoose, {Schema}  from "mongoose"
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const patientSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        require:true
    },
    emailId:{
        type:String,
        // require:true
    },
    diagonsedWith:{
        type:String,
        //required:true
    }, 
    address:{
        type:String,
        // required:true
    },
    bloodgroup:{
        type:String,
        // required:true
    },
    age:{
        type:Number,
        // required:true
    },
    sex:{
        type:String,
        enum:["Male","Female","Other"],
        // required:true
    },
    addmittedIn:{
        type:mongoose.Schema.Type.ObjectId,
        ref:"hospital"
    },
    contactNumber:{
        type:Number,
        //   required:true
    },

},
{timestamps:true})

patientSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

patientSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

patientSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
        _id:this._id,
        email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {  expiresIn:process.env.ACCESS_TOKEN_EXPIRY  }       
   )
}
patientSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            id : this._id
        },
         process.env.REFRESH_TOKEN_SECRET,
         {  expiresIn:process.env.REFRESH_TOKEN_EXPIRY  }       
    )
}
export const Patient= mongoose.model("Patient",patientSchema)