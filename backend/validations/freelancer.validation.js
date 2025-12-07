import Joi from 'joi';
import {
  stringValidation,
  emailValidation,
  numberValidation,
  dateValidation,
} from '../utils/validator.util.js';
import e from 'express';

export const registerUserSchema = Joi.object({
  email: emailValidation,
  password: stringValidation,
  username: stringValidation,
});

export const loginUserSchema = Joi.object({
  email: emailValidation,
  password: stringValidation,
  role: stringValidation.valid('COACH', 'OPEN_TALENT').required(),
});

export const healthcheckSchema = Joi.object({
  hi: stringValidation,
});

export const forgotPasswordSchema = Joi.object({
  email: emailValidation,
});

export const updateTalentRoleSchema = Joi.object({
  talent_type: stringValidation.valid('FREELANCER', 'JOB_SEEKER').required(),
});

export const updateStep2Schema = Joi.object({
  talent_role: stringValidation,
  location: stringValidation,
  bio: stringValidation,
});

export const updateStep3Schema = Joi.object({
  skills: stringValidation,
  language: stringValidation,
});

export const updateStep4Schema = Joi.object({
  website_or_portfolio: stringValidation,
});

export const updateStep5Schema = Joi.object({
  search_status: stringValidation.valid('AVAILABLE', 'WORKING').required(),
  salary_preference: stringValidation,
  job_type: stringValidation.valid('full_time', 'freelancer', 'open_to_both').required(),
});

export const settingsUpdateSchema = Joi.object({
  first_name: stringValidation,
  last_name: stringValidation,
  talent_role: stringValidation,
  location: stringValidation,
  bio: stringValidation,
  skills: stringValidation,
  language: stringValidation.optional().allow("", null),
  website_or_portfolio: stringValidation,
  search_status: stringValidation.valid('AVAILABLE', 'WORKING').required(),
  salary_preference: stringValidation,
  job_type: stringValidation.valid('full_time', 'freelancer', 'open_to_both').required(),
  phone_number: stringValidation,
  dob: dateValidation.optional().allow(null),
  gender: stringValidation.valid('Male', 'Female', 'Other').optional().allow(null),
  country: stringValidation.optional().allow("", null),
  city: stringValidation.optional().allow("", null),
  state: stringValidation.optional().allow("", null),
  address_1: stringValidation.optional().allow("", null),
  address_2: stringValidation.optional().allow("", null),
  zip_code: stringValidation.optional().allow("", null),
  time_zone: stringValidation.optional().allow("", null),
  deleted_certificates_ids: stringValidation.optional().allow(null),
  deleted_project_ids: stringValidation.optional().allow(null),
  deleted_cvs : stringValidation.optional().allow(null),
});


