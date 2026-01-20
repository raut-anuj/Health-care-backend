import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Staff } from "../models/staff.model.js";
import jwt from "jsonwebtoken"
import { Doctor } from "../models/doctor.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Admin } from "../models/admin.model.js";
import { Patient } from "../models/patient.model.js"
import { Payment } from "../models/payment.model.js";

const payBill = asyncHandler(async(req,res)=>{
    const { billid } = req.body
    const bill = await Patient.findById(billid)
    if(!bill)
        throw new ApiError(400, "Bill not fonund")



})