import { comparePassword, hashPassword } from "../utils/password.util.js";
import * as commonModel from "../model/common.model.js";
import { apiError, ApiError } from "../utils/api.util.js";
import { ADD_ERROR, CUSTOM_ERROR, EXISTS, INVALID, NOT_FOUND, UPDATE_ERROR } from "../utils/message.util.js";
import { CustomImagePath, deleteImage, isEmpty } from "../utils/misc.util.js";
import { API_URL, JWT_EXPIRY, JWT_SECRET } from "../constants.js";
import { sendOtpVerificationEmail, sendVerificationEmail } from "../utils/email.util.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import jwt from 'jsonwebtoken';
import * as coachModel from "../model/coach.model.js";



export const registerUserService = async (userData) => {
  try {
    const { email } = userData;
    const [existingUser] = await commonModel.getUserByEmail(email,"COACH");

    if (!isEmpty(existingUser)) {
      throw new ApiError(EXISTS, "User");
    }


    userData.verification_code = uuidv4();
    const user = await commonModel.createCoach(userData);
    //   const mail = await sendVerificationEmail({ email, url: `${API_URL}api/common/verify?verification_code=${verification_code}` });
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in register", error, false);
  }
};

export const userVerifiedService = async (verification_code) => {
  try {
    const [user] = await commonModel.getUserByVerificationCode(verification_code);

    if (isEmpty(user)) {
      return path.join(__dirname, "../views/notverify.html");
    }

    const userVerified = await commonModel.userVerified(user.user_id);

    return path.join(__dirname, "../views/verify.html");
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in user verified", error, false);
  }
};

export const loginUserService = async (email, password,role) => {
  try {
    const [existingUser] = await commonModel.getUserByEmail(email,role);

    if (isEmpty(existingUser)) {
      throw new ApiError(NOT_FOUND, "User");
    }

    if (existingUser.status == "PENDING") {
      throw new ApiError(CUSTOM_ERROR, "User is Pending");
    }
    if (existingUser.status == "REJECT") {
      throw new ApiError(CUSTOM_ERROR, "User is Rejected");
    }

    if (!existingUser.is_verified) {
      throw new ApiError(CUSTOM_ERROR, "User is not verified");
    }

    if (!existingUser.password) {
      throw new ApiError(CUSTOM_ERROR, "Please create your password");
    }

    if (existingUser.is_disabled) {
      const enable = await commonModel.enableMyAccountModel(existingUser.user_id);
    }

    const isPasswordValid = await comparePassword(password, existingUser.password);

    if (!isPasswordValid) {
      throw new ApiError(INVALID, "Password");
    }

    const userData = {
      user_id: existingUser.user_id,
      email: existingUser.email,
      role: existingUser.role,
    };

    if (existingUser.profile_image) {
      existingUser.profile_image = CustomImagePath(existingUser.profile_image);
    }

    const token = jwt.sign(userData, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    const [existingPlan] = await coachModel.getLatestSubscriptionPlansModel(existingUser.user_id);


    delete existingUser.password;

    const [user] = await commonModel.getUserById(existingUser.user_id);
    if (user.profile_image) {
      user.profile_image = CustomImagePath(user.profile_image);
    }
    if (isEmpty(existingPlan)) {
      user.active_subscription = false;
    } else {
      user.active_subscription = existingPlan.is_active == true ? true : false;
    }

    delete user.password;


    return { token, userData: user };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in login", error, false);
  }
}

export const getUserProfileService = async (user_id) => {
  try {
    const [user] = await commonModel.getUserById(user_id);

    if (user.profile_image) {
      user.profile_image = CustomImagePath(user.profile_image);
    }

    const [existingPlan] = await coachModel.getLatestSubscriptionPlansModel(user_id);
    if (isEmpty(existingPlan)) {
      user.active_subscription = false;
    } else {
      user.active_subscription = existingPlan.is_active == true ? true : false;
    }

    delete user.password;

    // user.coach.cv = CustomImagePath(user?.coach?.cv);
    // user.coach.certificate = CustomImagePath(user?.coach?.certificate);
    if (user.role == "COACH") {
      user.coach.cv = user?.coach?.cv
        ? user.coach.cv.split(",").map(path => CustomImagePath(path))
        : [];

      user.coach.certificate = user?.coach?.certificate
        ? user.coach.certificate.split(",").map(path => CustomImagePath(path))
        : [];
    } else if (user.role == "OPEN_TALENT") {
      user.open_talent.cv = user?.open_talent?.cv
        ? user.open_talent.cv.split(",").map(path => CustomImagePath(path))
        : [];
      user.open_talent.certificates = user?.open_talent?.certificates.map(cert => {
        return {
          ...cert,
          file: CustomImagePath(cert.file)
        };
      });

      user.open_talent.projects = user?.open_talent?.projects.map(proj => {
        return {
          ...proj,
          project_url: CustomImagePath(proj.project_url)
        };
      });

    }

    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get user", error, false);
  }
}

export const forgotPasswordService = async (email,role) => {
  try {

    const [user] = await commonModel.getUserByEmail(email,role);

    if (isEmpty(user)) {
      throw new ApiError(NOT_FOUND, "User");
    }


    const forgot_code = uuidv4();
    const otp = Math.floor(1000 + Math.random() * 9000);
    const mail = await sendOtpVerificationEmail({ email, otp });
    await commonModel.forgotPasswordModel(email, forgot_code, otp,role);
    return forgot_code;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in forgot password", error, false);
  }
}

export const resendUserOTPService = async (email,role) => {
  try {
    const [user] = await commonModel.getUserByEmail(email,role);

    if (isEmpty(user)) {
      throw new ApiError(NOT_FOUND, "User");
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    const mail = await sendOtpVerificationEmail({ email, otp });
    await commonModel.resendUserOTP(email, otp);
    return mail;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in resend otp", error, false);
  }
}

export const verifyOTPService = async (email, otp,role) => {
  try {
    const [user] = await commonModel.getUserByEmail(email,role);
    if (isEmpty(user)) {
      throw new ApiError(NOT_FOUND, "User");
    }
    if (user.otp !== otp) {
      throw new ApiError(INVALID, "OTP");
    }

    const userVerified = await commonModel.forgotPasswordModel(email, user.forgot_code, null,role);

    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in verify otp", error, false);
  }
}

export const resetPasswordService = async (forgot_code, password) => {
  try {
    const [user] = await commonModel.getUserByForgotCode(forgot_code);
    if (isEmpty(user)) {
      throw new ApiError(NOT_FOUND, "User");
    }
    const hashedPassword = await hashPassword(password);
    const forgot = await commonModel.updatePassword(user.user_id, hashedPassword);
    return;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in reset password", error, false);
  }
}

export const changePasswordService = async (user_id, old_password, new_password) => {
  try {
    const [existingUser] = await commonModel.getUserById(user_id);

    if (isEmpty(existingUser)) {
      throw new ApiError(NOT_FOUND, "User");
    }

    const isPasswordValid = await comparePassword(old_password, existingUser.password ? existingUser.password : "");

    if (!isPasswordValid) {
      throw new ApiError(INVALID, "Password");
    }

    const hashedPassword = await hashPassword(new_password);
    await commonModel.updatePassword(user_id, hashedPassword);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in change password service", error, false);
  }
}


export const disableMyAccountService = async (user_id) => {
  try {
    const user = await commonModel.disabledMyAccountModel(user_id);
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in disable my account", error, false);
  }
}

export const deleteMyAccountService = async (user_id) => {
  try {
    const user = await commonModel.deleteMyAccountModel(user_id);
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in delete my account", error, false);
  }
}
