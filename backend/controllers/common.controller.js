import { apiResponse, apiHandler, ApiError } from "../utils/api.util.js";
import * as commonService from "../services/common.service.js";
import { ADD_SUCCESS, CUSTOM_ERROR, CUSTOM_SUCCESS, FETCH, LOGIN, UPDATE_SUCCESS } from "../utils/message.util.js";
import { isEmpty } from "../utils/misc.util.js";



export const registerUser = apiHandler(async (req, res) => {
  const userData = req.body;
    userData.profile_image = req.files["profile_image"]?.[0]?.key || null;
  // userData.cv = req.files["cv"]?.[0]?.key || null;
  // userData.certificate = req.files["certificate"]?.[0]?.key || null;
  userData.cv = req.files && req.files.cv && req.files.cv.length > 0
        ? req.files.cv.map(file => file.key).join(",")
        : null;
  userData.certificate = req.files && req.files.certificate && req.files.certificate.length > 0
        ? req.files.certificate.map(file => file.key).join(",")
        : null;

  if(isEmpty(userData.profile_image) || isEmpty( userData.cv) || isEmpty( userData.certificate)){
    throw new ApiError(CUSTOM_ERROR,"Please upload all required files: profile_image, cv, certificate");
  }

  const user = await commonService.registerUserService(userData);
  return apiResponse(CUSTOM_SUCCESS,"Thank you for submitting your coach application! It’s now under admin review. We’ll get back to you within 24 hours.", null, res);
});

export const userVerified = apiHandler(async (req, res) => {
  const { verification_code } = req.query;
  const user = await commonService.userVerifiedService(verification_code);
  return res.sendFile(user);
});

export const loginUser = apiHandler(async (req, res) => {
  const { email, password,role } = req.body;
  const data = await commonService.loginUserService(email, password,role);
  return apiResponse(LOGIN, "User", data, res);
});

export const getUserProfile = apiHandler(async (req, res) => {
  const { user_id } = req.user;
  const data = await commonService.getUserProfileService(user_id);
  return apiResponse(FETCH, "User", data, res);
});

export const forgotPassword = apiHandler(async (req, res) => {
  const { email,role } = req.body;
  const data = await commonService.forgotPasswordService(email,role);
  return apiResponse(CUSTOM_SUCCESS, "Forgot code sent successfully", data, res);
});

export const resendUserOTP = apiHandler(async (req, res) => {
  const { email,role } = req.body;
  const data = await commonService.resendUserOTPService(email,role);
  return apiResponse(CUSTOM_SUCCESS, data.message, data, res);
});

export const otpVerification = apiHandler(async (req, res) => {
  const { email, otp,role } = req.body;
  const data = await commonService.verifyOTPService(email, otp,role);
  return apiResponse(CUSTOM_SUCCESS, "OTP verified successfully", null, res);
});

export const resetPassword = apiHandler(async (req, res) => {
  const { forgot_code, newPassword } = req.body;
  const data = await commonService.resetPasswordService(forgot_code, newPassword);
  return apiResponse(CUSTOM_SUCCESS, "Password reset successfully", data, res);
});

export const changePassword = apiHandler(async (req, res) => {
  const { user_id } = req.user;
  const { old_password, new_password } = req.body;
  const data = await commonService.changePasswordService(user_id, old_password, new_password);
  return apiResponse(CUSTOM_SUCCESS, "Password changed successfully", data, res);
});


export const disableMyAccountController = apiHandler(async (req, res) => {
  const { user_id } = req.user;
  await commonService.disableMyAccountService(user_id);
  return apiResponse(CUSTOM_SUCCESS, "Account disabled successfully", null, res);
});

export const deleteMyAccountController = apiHandler(async (req, res) => {
  const { user_id } = req.user;
  await commonService.deleteMyAccountService(user_id);
  return apiResponse(CUSTOM_SUCCESS, "Account deleted successfully", null, res);
});