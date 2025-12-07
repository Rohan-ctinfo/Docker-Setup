import Joi from 'joi';
import {
    stringValidation,
    emailValidation,
    numberValidation,
    arrayObjectValidation,
    section2CardValidation,
    section4CardValidation,
    section5Validation,
    section6Validation,
    dateValidation,
} from '../utils/validator.util.js';

export const coachingPathSchema = Joi.object({
    category_id: numberValidation,
    format: stringValidation,
});

export const subscriptionPurchaseSchema = Joi.object({
    subscription_id: numberValidation,
    total_price: numberValidation,
});

export const webinarCreationSchema = Joi.object({
    section_1: Joi.object({
        title: Joi.string().required(),
        // subtitle: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
    section_2: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        cards: section2CardValidation,
    }).required(),
    // section_3: Joi.object({
    //     title: Joi.string().required(),
    //     description: Joi.string().required(),
    // }).required(),
    section_4: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        cards: section4CardValidation,
    }).required(),
    section_5: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        cards: section5Validation,
    }),
    section_6: section6Validation,
    schedule_date: Joi.date().required()
});

export const webinarUpdateSchema = Joi.object({
    section_1: Joi.object({
        title: Joi.string().required(),
        // subtitle: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
    section_2: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        cards: section2CardValidation,
    }).required(),
    // section_3: Joi.object({
    //     title: Joi.string().required(),
    //     description: Joi.string().required(),
    // }).required(),
    section_4: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        cards: section4CardValidation,
    }).required(),
    section_5: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        cards: section5Validation,
    }),
    section_6: section6Validation,
    schedule_date: Joi.date().required(),
    webinar_id: numberValidation
});


export const webinarSpeakersSchema = Joi.object({
    speakers: Joi.string().custom((value, helpers) => {
        try {
            const parsedOnce = JSON.parse(value);
            const parsed = typeof parsedOnce === 'string' ? JSON.parse(parsedOnce) : parsedOnce;


            if (!Array.isArray(parsed)) {
                return helpers.error('any.invalid', { message: 'Speakers must be a JSON array' });
            }

            const speakerSchema = Joi.object({
                webinar_id: Joi.number().required(),
                name: Joi.string().required(),
                role: Joi.string().required(),
                sub_role: Joi.string().allow('', null).optional(),
            });

            for (let i = 0; i < parsed.length; i++) {
                const { error } = speakerSchema.validate(parsed[i]);
                if (error) {
                    return helpers.error('any.invalid', {
                        message: `Invalid speaker at index ${i}: ${error.message}`,
                    });
                }
            }

            return value; // valid stringified array, return as-is
        } catch (err) {
            return helpers.error('any.invalid', { message: 'Speakers must be a valid JSON stringified array' });
        }
    })
        .required()
        .messages({
            'any.invalid': '{{#message}}',
        }),
});

export const updateWebinarSpeakersSchema = Joi.object({
    speakers: Joi.string().custom((value, helpers) => {
        try {
            const parsedOnce = JSON.parse(value);
            const parsed = typeof parsedOnce === 'string' ? JSON.parse(parsedOnce) : parsedOnce;


            if (!Array.isArray(parsed)) {
                return helpers.error('any.invalid', { message: 'Speakers must be a JSON array' });
            }

            const speakerSchema = Joi.object({
                webinar_id: Joi.number().required(),
                name: Joi.string().required(),
                role: Joi.string().required(),
                sub_role: Joi.string().allow('', null).optional(),
                image: Joi.string().allow('', null),
            });

            for (let i = 0; i < parsed.length; i++) {
                const { error } = speakerSchema.validate(parsed[i]);
                if (error) {
                    return helpers.error('any.invalid', {
                        message: `Invalid speaker at index ${i}: ${error.message}`,
                    });
                }
            }

            return value; // valid stringified array, return as-is
        } catch (err) {
            return helpers.error('any.invalid', { message: 'Speakers must be a valid JSON stringified array' });
        }
    })
        .required()
        .messages({
            'any.invalid': '{{#message}}',
        }),
});



export const workshopCreationSchema = Joi.object({
    section_1: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
    section_2: Joi.object({
        title: Joi.string().required(),
        subtitle: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
    section_3: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        cards: section2CardValidation,
    }).required(),
    section_4: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        cards: section5Validation,
    }),
    section_5: section6Validation,
    schedule_date: Joi.date().required(),
    location: stringValidation,
    language: stringValidation,
    hours: stringValidation
});

export const workshopUpdateSchema = Joi.object({
    section_1: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
    section_2: Joi.object({
        title: Joi.string().required(),
        subtitle: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
    section_3: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        cards: section2CardValidation,
    }).required(),
    section_4: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        cards: section5Validation,
    }),
    section_5: section6Validation,
    schedule_date: Joi.date().required(),
    location: stringValidation,
    language: stringValidation,
    hours: stringValidation,
    workshop_id: numberValidation
});


export const workshopSpeakersSchema = Joi.object({
    speakers: Joi.string().custom((value, helpers) => {
        try {
            const parsedOnce = JSON.parse(value);
            const parsed = typeof parsedOnce === 'string' ? JSON.parse(parsedOnce) : parsedOnce;


            if (!Array.isArray(parsed)) {
                return helpers.error('any.invalid', { message: 'Speakers must be a JSON array' });
            }

            const speakerSchema = Joi.object({
                workshop_id: Joi.number().required(),
                name: Joi.string().required(),
                role: Joi.string().required(),
                sub_role: Joi.string().allow('', null).optional(),
            });

            for (let i = 0; i < parsed.length; i++) {
                const { error } = speakerSchema.validate(parsed[i]);
                if (error) {
                    return helpers.error('any.invalid', {
                        message: `Invalid speaker at index ${i}: ${error.message}`,
                    });
                }
            }

            return value; // valid stringified array, return as-is
        } catch (err) {
            return helpers.error('any.invalid', { message: 'Speakers must be a valid JSON stringified array' });
        }
    })
        .required()
        .messages({
            'any.invalid': '{{#message}}',
        }),
});

export const updateWorkshopSpeakersSchema = Joi.object({
    speakers: Joi.string().custom((value, helpers) => {
        try {
            const parsedOnce = JSON.parse(value);
            const parsed = typeof parsedOnce === 'string' ? JSON.parse(parsedOnce) : parsedOnce;


            if (!Array.isArray(parsed)) {
                return helpers.error('any.invalid', { message: 'Speakers must be a JSON array' });
            }

            const speakerSchema = Joi.object({
                workshop_id: Joi.number().required(),
                name: Joi.string().required(),
                role: Joi.string().required(),
                sub_role: Joi.string().allow('', null).optional(),
                image: Joi.string().allow('', null),
            });

            for (let i = 0; i < parsed.length; i++) {
                const { error } = speakerSchema.validate(parsed[i]);
                if (error) {
                    return helpers.error('any.invalid', {
                        message: `Invalid speaker at index ${i}: ${error.message}`,
                    });
                }
            }

            return value; // valid stringified array, return as-is
        } catch (err) {
            return helpers.error('any.invalid', { message: 'Speakers must be a valid JSON stringified array' });
        }
    })
        .required()
        .messages({
            'any.invalid': '{{#message}}',
        }),
});

export const updateProfileSchema = Joi.object({
    full_name: stringValidation,
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
    language: stringValidation.optional().allow("", null),
    tagline: stringValidation,
    bio: stringValidation,
    reason: stringValidation,
    year_of_experience: stringValidation,
});


export const createOfferSchema = Joi.object({
    offer_title: stringValidation,
    purpose: stringValidation,
    offer_type: stringValidation.valid('Discovery Call (Free)','Clarity Boost','Growth Pro','Deep Dive','Team Coaching','Group Coaching').required(),
    offer_format: stringValidation.valid('1:1 Live','In-person','Hybrid','Group Call').required(),
    duration: numberValidation,
    price: numberValidation,
    additional_notes: stringValidation,
});

export const createContentSchema = Joi.object({
    title: stringValidation,
    short_description : stringValidation,
    content_type : stringValidation.valid("eBook","Guide","Workbook","Media","Presentation","Integration","Recording"),
    category : stringValidation.optional().allow(null),
    visibility : stringValidation.valid("Public","Private","Restricted"),
    status : stringValidation.valid("Draft","Published","Archived"),
});

export const updateContentSchema = Joi.object({
    title: stringValidation,
    short_description : stringValidation,
    content_type : stringValidation.valid("eBook","Guide","Workbook","Media","Presentation","Integration","Recording"),
    category : stringValidation.optional().allow(null),
    visibility : stringValidation.valid("Public","Private","Restricted"),
    status : stringValidation.valid("Draft","Published","Archived"),
    content_file_ids : stringValidation.optional().allow("",null),
});