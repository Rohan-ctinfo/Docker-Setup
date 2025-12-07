import Joi from 'joi';
import {
    stringValidation,
    emailValidation,
    numberValidation,
    programDaySchema,
} from '../utils/validator.util.js';

export const coachUpdateStatusSchema = Joi.object({
    user_id: numberValidation,
    status: Joi.string().valid("APPROVE", "REJECT").required(),
    rejected_reason : stringValidation.optional(),
});

export const bootcampCreationSchema = Joi.object({
    header_title : stringValidation,
    header_sub_title : stringValidation,
    header_description : stringValidation,
    start_date : Joi.date().iso().required(),
    end_date : Joi.date().iso().required(),
    location : stringValidation,
    price : numberValidation,
    seats : numberValidation,
    points : Joi.array(),
    footer_title : stringValidation,
    footer_sub_title : stringValidation,
    footer_description : stringValidation,
    brochure_color : stringValidation,
    footer_color : stringValidation,
    program_days : Joi.array().items(programDaySchema).min(1).required()
});


export const bootcampUpdateSessionSpeakersImagesSchema = Joi.object({
  ids: stringValidation.optional().allow('', null),
});
