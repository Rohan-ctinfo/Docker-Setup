import { comparePassword, hashPassword } from "../utils/password.util.js";
import * as openTalentModel from "../model/open-talent.model.js";
import * as commonModel from "../model/common.model.js";
import { apiError, ApiError } from "../utils/api.util.js";
import { ADD_ERROR, CUSTOM_ERROR, EXISTS, INVALID, NOT_FOUND, UPDATE_ERROR } from "../utils/message.util.js";
import { CustomImagePath, deleteImage, isEmpty } from "../utils/misc.util.js";
import { JWT_EXPIRY, JWT_SECRET } from "../constants.js";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loginFreelancerService = async (email, password) => {
    try {
        const [existingUser] = await openTalentModel.getFreelancerByEmail(email);

        if (isEmpty(existingUser)) {
            throw new ApiError(NOT_FOUND, "Admin");
        }


        const isPasswordValid = await comparePassword(password, existingUser.password);

        if (!isPasswordValid) {
            throw new ApiError(INVALID, "Password");
        }

        const userData = {
            user_id: existingUser.user_id,
            full_name: existingUser.full_name,
            email: existingUser.email,
            role: existingUser.role,
        };

        const token = jwt.sign(userData, JWT_SECRET, {
            expiresIn: JWT_EXPIRY,
        });

        return token;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in login", error, false);
    }
};

export const verifyEmailAddressService = async (verification_code) => {
    try {
        const [user] = await openTalentModel.getEmailByVerificationCode(verification_code);
        if (isEmpty(user)) throw new ApiError(NOT_FOUND, "User");

        if (user.is_verified) {
            return path.join(__dirname, "../views/already-verified.html");
        };

        const userVerified = await openTalentModel.verifyEmailAddressModel(verification_code);
        return path.join(__dirname, "../views/verify.html");
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in user verified", error, false);
    }
}

export const updateTalentTypeService = async (user_id, role) => {
    try {
        const updatedRole = await openTalentModel.updateTalentTypeModel(user_id, role);
        return updatedRole;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in update role", error, false);
    }
}

export const updateStep2Service = async (data) => {
    try {
        const updatedData = await openTalentModel.updateStep2Model(data);
        return updatedData;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in update role", error, false);
    }
}

export const updateStep3Service = async (data) => {
    try {
        const updatedData = await openTalentModel.updateStep3Model(data);
        return updatedData;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in update role", error, false);
    }
}

export const updateStep4Service = async (data) => {
    try {
        const updatedData = await openTalentModel.updateStep4Model(data);
        return updatedData;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in update role", error, false);
    }
}

export const updateStep5Service = async (data) => {
    try {
        const updatedData = await openTalentModel.updateStep5Model(data);
        return updatedData;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in update role", error, false);
    }
}

export const openTalentProfileUpdateService = async (user_id, data) => {
    try {
        const [user] = await commonModel.getUserById(user_id);

        if (isEmpty(data.profile_image)) {
            data.profile_image = user.profile_image;
        }

        // Previous CVs in DB
        const previousCv = user.open_talent.cv ? user.open_talent.cv.split(",") : [];

        // New CVs (optional)
        const newCv = data.cvs ? data.cvs.split(",") : [];

        // Deleted CV URLs (optional)
        const deletedCvUrls = (data.deleted_cvs && data.deleted_cvs.trim() !== "")
            ? data.deleted_cvs.split(",")
            : [];

        // Extract only file paths from URLs
        const deletedCvPaths = deletedCvUrls
            .map(url => {
                if (!url) return null;
                return url.includes(".com/") ? url.split(".com/")[1] : url;
            })
            .filter(Boolean);

        // REMOVE only when delete list is not empty
        const remainingCv =
            deletedCvPaths.length > 0
                ? previousCv.filter(cv => !deletedCvPaths.includes(cv))
                : previousCv;

        // Add new uploaded CVs
        const finalCvArray = [...remainingCv, ...newCv].filter(Boolean);

        // Convert to comma separated OR null
        data.cv = finalCvArray.length > 0 ? finalCvArray.join(",") : null;


        const updatedData = await openTalentModel.openTalentProfileUpdateModel(user_id, data);
        return updatedData;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in update role", error, false);
    }
}