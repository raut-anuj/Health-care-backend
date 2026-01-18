import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Patient } from "../models/patient.model.js";
import jwt from "jsonwebtoken"
import { Doctor } from "../models/doctor.model.js";
import { Appointment } from "../models/appointment.model.js";
import { get } from "http";

const generateAccessAndRefreshToken = async(patientId)=>{
    try{
        const patient = await Patient.findById(patientId)
        if(!patient)
            throw new ApiError(400, "patient not found")

            const accessToken = Patient.generateAccessToken()
            const refreshToken = Patient.generateRefreshToken()

        patient.refreshToken=refreshToken;

        await patient.save( {validation:false} )
        
        return { accessToken, refreshToken }
    }
    catch(error){
    throw new ApiError(500, "Error occur while generating Access and Refresh Token.")
}
}
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get refresh token from [cookies or body]
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET );
            
        const patient = await Patient.findById(decodedToken?._id);
        if (!patient) throw new ApiError(401, "Invalid refresh token");

        // Check if the stored refresh token matches
        if (incomingRefreshToken !== patient.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or invalid");
        }

        // Generate new tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(patient._id);

        // Cookie options
        const options = {
            httpOnly: true,
            secure: true,
        }; 

        // Send response with new tokens
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});
const registerUser = asyncHandler(async(req,res)=>{
    //yha pr aur bhi fields dena ha toh yaad rakhna. 
    const { name, age, password } = req.body

    if(!name || !password || age === undefined)
        throw new ApiError(400, "Fill all the fields")

    if(name.trim() === "" || age <= 0)
        throw new ApiError(400, "Enter the valid Input")

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new ApiError(400, "Invalid email format");
        }

    const patient= await Patient.create({ 
            name:name.trim(),
            age,
            password
        })

        console.log(patient);

  res
  .status(201)
  .json(new ApiResponse(201, patient, "successfull registered"))

})

const loginUser = asyncHandler(async(req,res)=>{
    const { password, name, email } = req.body

    if( !password || !name || !email )
        throw new ApiError(400, "All fields are required.")

    if( name.trim() === "" || email.trim() === "" )
        throw new ApiError(400, "Enter valid input.")

     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) 
          throw new ApiError(400, "Invalid email format");

    const isPasswordCorrect = await Patient.isPasswordCorrect(password)
    if(!isPasswordCorrect)
        throw new ApiError("Password is invalid.")

    const patient = await Patient.findOne( { email } )

   const { accessToken, refreshToken } = generateAccessandRefreshToken(patient._id)

   const loggedInUser = await Patient.findById(patient._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true, }; 

    res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200, 
        { 
           patient: loggedInUser, accessToken, refreshToken  
        },
         "Logged in Successfull"))

})

const logout = asyncHandler(async(req,res)=>{
    Patient.findByIdAndDelete(
        req.patient._id,
        {
            $unset:{
            refreshToken:1}
        },
        {new:true}
    )

    const options={
    httpOnly:true,
    secure:true
  }

    res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"Patient logged out"))
})

const appointment = asyncHandler(async(req,res)=>{
    const { name, email, drname, date, time }= req.body

    if( [ name, email, drname, date, time ].some(fields => !fields || fields.trim() === "") ) {
        throw new ApiError(400, "All fields are required");  }

       const patient = await Patient.findOne({ email })

       if(!patient)
        throw new ApiError(404, "No data found about this patient.")
      
       const doctorperson = await Doctor.findOne({ drname }) 

       if(!doctorperson)
        throw new ApiError(404, "No data found about this Doctor.")

        const existingAppointment = await Appointment.findOne({
            doctorId: doctorperson._id,
            date,
            time });

        if (existingAppointment) {
           throw new ApiError(400, "Doctor already booked at this time");}

       const anotherAppointment = await Appointment.findOne({
            patientId: patient._id,
            doctorId: doctorperson._id,
            date
        })

        if(anotherAppointment)
            throw new ApiError(400, "Two appointment are not allowed in a day.");

        res
        .status(201)
        .json(new ApiResponse(201, {}, "Appointment is booked with this Doctor."))
})

const getProfile = asyncHandler(async(req,res)=>{
    const { email } = req.body

    if(!email || email.trim()==="" )
        throw new ApiError(400, "Email is required")

    const patient = await Patient.findOne({email}).select("-password -refreshToken");

    if(!patient)
        throw new ApiError(400, " Patient not found.") 

    res
    .status(200)
    .json(new ApiResponse(200, patient, {}))
})

const updateProfile = asyncHandler(async(req,res)=>{
    const{ email, contactNumber, age, address }=req.body

   const patient = await Patient.findOne({email})

    if(!patient)
        throw new ApiError(400, "patient not found")

        contactNumber: patient.contactNumber;
        age: patient.age;
        address: patient.address;
        await Patient.save();

   res.status(200).json(new ApiResponse(200, {
        contactNumber: patient.contactNumber,
        age: patient.age,
        address: patient.address
    }, "Details Updated"));
})

const getAppointments =asyncHandler(async(req,res)=>{
    const{ email } = req.body
    
    if(!email || email.trim() === "")
        throw new ApiError (400, "Email is required")
    const patient = await Patient.findOne({email})
   
    if(!patient)
         throw new ApiError (400, "Patient is not found.")
       const getApp = await Appointment.find({patientId: patient._id})
       
       if(getApp.length === 0){
        return res
        .status(201)
        .json(new ApiResponse(201, [], "No Appointments found."))
       }
       
       else {
        return res
        .status(200)
        .json(new ApiResponse(201, getApp, "Appointments fetched successfully.")) }
})

const cancelAppointment =asyncHandler(async(req,res)=>{
    const { email }=req.body

    if(!email || email.trim() === "")
        throw new ApiError(400, "Email is required")

   const patient = await Patient.findOne({ email })
   if(!patient)
     throw new ApiError(400, "No patient found")

    // Agar tum all appointments delete karna chahte ho
   const cancelApp = await Appointment.deleteMany({ patientId : patient._id })

    //    Agar tum sirf ek appointment delete karna chahte ho
    //    const cancelApp = await Appointment.findByIdAndDelete(appointmentId)

    if(cancelApp.deletedCount === 0)
    {
        return res.status(200).json({
            status: 200,
            message: "No appointments to cancel",
            data: {}
        })
    }

            else {
                return res
                .status(200)
                .json(new ApiResponse(200, {}, "Appointments canceled."))
            }
});

const changeCurrentPassword = asyncHandler(async(req, res)=>{
  const { oldPassword, newPassword }= req.body

  const patient = await Patient.findById(req.user?._id)
  const isPasswordCorrect=await patient.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid old password")
  }
  patient.password = newPassword
  await patient.save( {validateBeforeSave:false} )

  return res
  .status(200)
  .json(new ApiResponse(200,{},"Password changed successfully"))

})

export {
    generateAccessAndRefreshToken,
    refreshAccessToken,
    registerUser,
    changeCurrentPassword,
    loginUser,
    logout,
    cancelAppointment,
    getAppointments,
    getProfile,
    appointment,
    updateProfile
}