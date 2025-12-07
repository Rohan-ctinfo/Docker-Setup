import Joi from 'joi';
import {
    stringValidation,
    emailValidation,
    numberValidation,
} from '../utils/validator.util.js';

export const registerUserSchema = Joi.object({
    email: emailValidation,
    full_name: stringValidation,
    phone_number: stringValidation,
    category_id : numberValidation,
    format: stringValidation.valid("BOTH","1:1","GROUP").required(),
    tagline: stringValidation,
    bio: stringValidation,
    reason: stringValidation,
    year_of_experience: numberValidation,
});

export const loginUserSchema = Joi.object({
    email: emailValidation,
    password: stringValidation,
});

export const verifyOTPSchema = Joi.object({
    otp: numberValidation,
    email: emailValidation,
    role : stringValidation.valid('COACH','OPEN_TALENT').required(),
});

export const resendOTPSchema = Joi.object({
    email: emailValidation,
});

export const forgotPasswordSchema = Joi.object({
    email: emailValidation,
    role : stringValidation.valid('COACH','OPEN_TALENT').required(),
});

export const resetPasswordSchema = Joi.object({
    forgot_code: stringValidation,
    newPassword: stringValidation,
});

export const changePasswordSchema = Joi.object({
    old_password: stringValidation,
    new_password: stringValidation,
});

export const updateProfileSchema = Joi.object({
    full_name: stringValidation,
});


export const contactUsSchema = Joi.object({
    full_name: stringValidation,
    email: emailValidation,
    phone_number: stringValidation,
    address: stringValidation,
    subject: stringValidation,
    message: stringValidation,
    latitude: stringValidation.optional(),
    longitude: stringValidation.optional()
});

export const drawingSlotsSchema = Joi.object({
    email: emailValidation,
    phone_code: stringValidation,
    phone_number: stringValidation,
})

export const webinarRegistrationSchema = Joi.object({
    first_name: stringValidation,
    last_name: stringValidation,
    email: emailValidation,
    phone_number: stringValidation,
    linkedin_url: stringValidation.optional(),
    role: stringValidation,
    source: stringValidation,
    webinar_id: numberValidation.optional()
});

export const bootcampRegistrationSchema = Joi.object({
    name: stringValidation,
    email: stringValidation,
    timezone: stringValidation,
    notes: stringValidation.optional(),
});


export const coachStep1Schema = Joi.object({
    category_id: numberValidation,
    format: stringValidation,
});

export const coachStep2Schema = Joi.object({
    bio: stringValidation,
    tagline: stringValidation,
});

export const geoLocationSchema = Joi.object({
    location: stringValidation,
});

export const bootcampBookingsSchema = Joi.object({
    first_name: stringValidation,
    last_name: stringValidation,
    email: emailValidation,
    phone_number: stringValidation,
    bootcamp_id: numberValidation
});

export const bootcampWaitingListsSchema = Joi.object({
    name: stringValidation,
    email: emailValidation,
    phone_number: stringValidation,
    bootcamp_id: numberValidation,
    notes: stringValidation.optional().allow('')
});


export const openTalentRegistrationSchema = Joi.object({
    first_name : stringValidation,
    last_name  : stringValidation,
    email      : emailValidation,
    password  : stringValidation,
    talent_type: stringValidation.valid('FREELANCER','JOB_SEEKER').required(),
});