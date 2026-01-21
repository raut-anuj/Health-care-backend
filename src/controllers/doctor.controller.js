import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Doctor } from "../models/doctor.model.js";
import jwt from "jsonwebtoken"
import { Patient } from "../models/patient.model.js"
import { Appointment } from "../models/appointment.model.js";
import { get } from "http";

const generateAccessAndRefreshToken = async(doctorId)=>{
    try{
        const doctor = await Doctor.findById(doctorId)
        if(!doctor)
            throw new ApiError(400, "Doctor not found")

            const accessToken = Doctor.generateAccessToken()
            const refreshToken = Doctor.generateRefreshToken()

        doctor.refreshToken=refreshToken;

        await doctor.save( {validation:false} )
        
        return { accessToken, refreshToken }
    }
    catch(error){
    throw new ApiError(500, "Error occur while generating Access and Refresh Token.")
}
};

const getProfile = asyncHandler(async(req,res)=>{
    const { email } = req.body

    if(!email || email.trim()==="" )
        throw new ApiError(400, "Email is required")

    const doctor = await Doctor.findOne({email}).select("-password -refreshToken");

    if(!doctor)
        throw new ApiError(400, " Doctor not found.") 

    res
    .status(200)
    .json(new ApiResponse(200, doctor, {}))
});

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
            
        const doctor = await Doctor.findById(decodedToken?._id);
        if (!doctor) throw new ApiError(401, "Invalid refresh token");

        // Check if the stored refresh token matches
        if (incomingRefreshToken !== doctor.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or invalid");
        }

        // Generate new tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(doctor._id);

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
    // specialization, experience, salary, workedIn, education
    const { name, age, password } = req.body

    if(!name || !password || age === undefined)
        throw new ApiError(400, "Fill all the fields")

    if(name.trim() === "" || age <= 0)
        throw new ApiError(400, "Enter the valid Input")

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new ApiError(400, "Invalid email format");
        }

    const doctor= await Doctor.create({ 
            name:name.trim(),
            age,
            password
        })

        //console.log(doctor);

  res
  .status(201)
  .json(new ApiResponse(201, doctor, "successfull registered"))

});

const updateProfile = asyncHandler(async(req,res)=>{
    const{ email, contactNumber, age, address }=req.body

   const doctor = await Doctor.findOne({email})

// Agar email mil gaya,
// 👉 Toh doctor ka poora data aa jata hai (jo bhi fields model me hain).

    if(!doctor)
        throw new ApiError(400, "Doctor not found")

        contactNumber: doctor.contactNumber;
        age: doctor.age;
        address: doctor.address;
        await Doctor.save();

   res.status(200).json(new ApiResponse(200, {
        contactNumber: doctor.contactNumber,
        age: doctor.age,
        address: doctor.address
    }, "Details Updated"));
});

const loginUser = asyncHandler(async(req,res)=>{
    const { password, name, email } = req.body

    if( !password || !name || !email )
        throw new ApiError(400, "All fields are required.")

    if( name.trim() === "" || email.trim() === "" )
        throw new ApiError(400, "Enter valid input.")

     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) 
          throw new ApiError(400, "Invalid email format");

    const isPasswordCorrect = await Doctor.isPasswordCorrect(password)
    if(!isPasswordCorrect)
        throw new ApiError("Password is invalid.")

    const doctor = await Doctor.findOne( { email } )

   const { accessToken, refreshToken } = generateAccessAndRefreshToken(doctor._id)

   const loggedInUser = await Doctor.findById(doctor._id).select("-password -refreshToken")

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
           doctor: loggedInUser, accessToken, refreshToken  
        },
         "Logged in Successfull"))

});

const logout = asyncHandler(async(req,res)=>{
    Doctor.findByIdAndDelete(
        req.doctor._id,
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
    .json(new ApiResponse(200,{},"Doctor logged out"))
});

const gettAllpatient = asyncHandler(async(req,res)=>{
    const doctorid = await Doctor.findById(req.doctor.id)

    if(!doctorid)
        throw new ApiError (400, "Invalid Doctor Id.")

    const allPatient = await MedicalRecord.find({
        doctor_id : doctorid._id

    })
    if( allPatient.length === 0 )
       {
        return res
        .status(201)
        .json(new ApiResponse(200, {}, "No record found"))
       }

        return res
        .status(201)
        .json(new ApiResponse(200, allPatient, "All Records."))
        
});

const changeCurrentPassword = asyncHandler(async(req, res)=>{
  const { oldPassword, newPassword }= req.body

  const doctor = await Doctor.findById(req.user?._id)
  const isPasswordCorrect = await doctor.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid old password")
  }
  doctor.password = newPassword
  await doctor.save( {validateBeforeSave:false} )

  return res
  .status(200)
  .json(new ApiResponse(200,{},"Password changed successfully"))

});

const getPatientProfile = asyncHandler(async(req,res)=>{
    const { emailId } = req.body

    if( !emailId )
        throw new ApiError(400, "All fields are required.")

    if( emailId.trim() === "" )
        throw new ApiError(400, "Enter valid input.")

    const doctorid = await Doctor.findById(req.doctor.id)

    if(!doctorid)
        throw new ApiError (400, "Invalid Doctor Id.")

    const patient = await Patient.findOne({ emailId }).select("-password, -refreshToken")

    if(!patient)
       throw new ApiError (400, "Invalid EmailId.")

        return res
        .status(201)
        .json(new ApiResponse(200, patient, "Patient Records."))
        
});

const getTodayAppointments = asyncHandler(async(req,res)=>{
    const doctor = await Doctor.findById(req.params.id)
    if(!doctor)
        throw new ApiError(400, "No doctor found.")

    const appointment = await Appointment.find({
        doctorId: doctor._id
    })
    if( appointment.length == 0)
        throw new ApiError(400, "No Appointment for today.");
    return res
    .status(200)
    .json(new ApiResponse(200, appointment, "All Appointment of today."))

});

export{
    logout,
    loginUser,
    registerUser,
    updateProfile,
    getProfile,
    refreshAccessToken,
    changeCurrentPassword,
    generateAccessAndRefreshToken,

    getPatientProfile,
    gettAllpatient,
    getTodayAppointments
}