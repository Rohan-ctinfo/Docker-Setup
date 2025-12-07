import { comparePassword, hashPassword } from "../utils/password.util.js";
import * as publicModel from "../model/public.model.js";
import * as commonModel from "../model/common.model.js";
import { apiError, ApiError } from "../utils/api.util.js";
import { ADD_ERROR, CUSTOM_ERROR, EXISTS, INVALID, NOT_FOUND, UPDATE_ERROR } from "../utils/message.util.js";
import { CustomImagePath, deleteImage, isEmpty } from "../utils/misc.util.js";
import { API_URL, JWT_EXPIRY, JWT_SECRET, MAP_API_KEY } from "../constants.js";
import { adminWebinarRegistrationNotification, sendAdminBootcampBookingsEmail, sendAdminBootcampWaitingListEmail, sendBootcampBookingsEmail, sendBootcampWaitingListEmail, sendContactFormNotification, sendOpenTalentVerificationEmail, sendOtpVerificationEmail, sendRegistrationEmail, sendVerificationEmail } from "../utils/email.util.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import jwt from 'jsonwebtoken';
import moment from "moment";
import axios from "axios";
import * as coachModel from "../model/coach.model.js";
import * as adminModel from "../model/admin.model.js";

export const webinarRegistrationService = async (first_name, last_name, email, phone_number, linkedin_url, role, source, webinar_id) => {
    try {
        let webinarRegistration = [];
        let webinars = [];

        if (webinar_id) {
            webinarRegistration = await publicModel.getWebinarRegistrationByEmailAndWebinarId(email, webinar_id);
            webinars = await coachModel.getWebinarByIdModel(webinar_id);

            if (isEmpty(webinars)) throw new ApiError(NOT_FOUND, 'Webinar');
        } else {
            webinarRegistration = await publicModel.getWebinarRegistrationByEmail(email);
        }

        if (!isEmpty(webinarRegistration)) throw new ApiError(CUSTOM_ERROR, "Email already registered for this webinar");

        await publicModel.webinarRegistrationModel(first_name, last_name, email, phone_number, linkedin_url, role, source, webinar_id);
        await sendRegistrationEmail({ email, first_name, date_time: webinar_id ? moment(webinars.schedule_date).format("YYYY-MM-DD HH:mm:ss") : moment(process.env.EVENT_DATE).format("YYYY-MM-DD HH:mm:ss"), res: null });
        return adminWebinarRegistrationNotification({ full_name: `${first_name} ${last_name}`, email, phone_number, linkedin_url, role, source });
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in webinar registration", error, false);
    }
}


export const contactUsService = async (full_name, email, phone_number, address, subject, message, latitude, longitude) => {
    try {
        await publicModel.contactUs(full_name, email, phone_number, address, subject, message, latitude, longitude);

        return sendContactFormNotification({ full_name, email, phone_number, address, subject, message });
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in contact us", error, false);
    }
}

export const bootcampRegistrationService = async (name, email, timezone, notes) => {
    try {
        const bootcampRegistration = await publicModel.getbootcampRegistrationByEmail(email);

        if (!isEmpty(bootcampRegistration)) throw new ApiError(EXISTS, "Email");


        await publicModel.bootcampRegistrationModel(name, email, timezone, notes);

        return sendRegistrationEmail({ email, name, date_time: moment(process.env.EVENT_DATE).format("YYYY-MM-DD HH:mm:ss"), res: null });
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in bootcamp registration", error, false);
    }
}

export const getGeoLocationService = async (location) => {
    try {
        const apiKey = MAP_API_KEY;
        const autoCompleteRes = await axios.post(
            `https://places.googleapis.com/v1/places:autocomplete`,
            { input: location },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                    "X-Goog-FieldMask":
                        "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
                },
            }
        );

        if (
            !autoCompleteRes.data.suggestions ||
            autoCompleteRes.data.suggestions.length === 0
        ) {
            return [];
        }
        const suggestions = await Promise.all(
            autoCompleteRes.data.suggestions.map(async (s) => {
                const placeId = s.placePrediction.placeId;

                const detailsRes = await axios.get(
                    `https://places.googleapis.com/v1/places/${placeId}`,
                    {
                        params: { key: apiKey },
                        headers: {
                            "X-Goog-FieldMask":
                                "id,displayName,formattedAddress,location,addressComponents",
                        },
                    }
                );

                const place = detailsRes.data;

                return {
                    name: place.displayName?.text,
                    formatted: place.formattedAddress,
                    latitude: place.location?.latitude,
                    longitude: place.location?.longitude,
                    components: place.addressComponents,
                };
            })
        );

        return suggestions;
    } catch (error) {
        console.log(error);
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in get geo location", error, false);
    }
}

export const getCategoriesService = async () => {
    try {
        const categories = await publicModel.getCategoriesModel();
        return categories;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in get categories", error, false);
    }
}

export const getSubscriptionPlansService = async () => {
    try {
        const plans = await publicModel.getSubscriptionPlansModel();
        return plans;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in get subscription plans", error, false);
    }
}

export const bootcampBookingsService = async (data) => {
    try {
        const [bootcamp] = await adminModel.getBootcampByIdModel(data.bootcamp_id);

        if (isEmpty(bootcamp)) throw new ApiError(NOT_FOUND, "Bootcamp");

        // const bootcampRegistration = await publicModel.getbootcampBookingsByEmail(data.email, data.bootcamp_id);

        // if (!isEmpty(bootcampRegistration)) throw new ApiError(CUSTOM_ERROR, "Email already registered for this bootcamp.");

        data.total_price = bootcamp.price;


        await publicModel.bootcampBookingsModel(data);

        await sendBootcampBookingsEmail({ email: data.email, first_name: data.first_name, bootcamp_title: bootcamp.header_title, start_date: moment(bootcamp.start_date).format("YYYY-MM-DD"), end_date: moment(bootcamp.end_date).format("YYYY-MM-DD"), price: data.total_price, res: null });
        return sendAdminBootcampBookingsEmail({ email: data.email, first_name: data.first_name, bootcamp_title: bootcamp.header_title, start_date: moment(bootcamp.start_date).format("YYYY-MM-DD"), end_date: moment(bootcamp.end_date).format("YYYY-MM-DD"), price: data.total_price, last_name: data.last_name, res: null })
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in bootcamp registration", error, false);
    }
}

export const bootcampWaitingListsService = async (data) => {
    try {
        const [bootcamp] = await adminModel.getBootcampByIdModel(data.bootcamp_id);

        if (isEmpty(bootcamp)) throw new ApiError(NOT_FOUND, "Bootcamp");

        // const bootcampRegistration = await publicModel.getBootcampWaitinglistByEmail(data.email, data.bootcamp_id);

        // if (!isEmpty(bootcampRegistration)) throw new ApiError(CUSTOM_ERROR, "Email already registered for this bootcamp");


        await publicModel.bootcampWaitinglistModel(data);

        await sendBootcampWaitingListEmail({ email: data.email, first_name: data.name, bootcamp_title: bootcamp.header_title, start_date: moment(bootcamp.start_date).format("YYYY-MM-DD"), end_date: moment(bootcamp.end_date).format("YYYY-MM-DD"), notes: data.notes, res: null });
        return sendAdminBootcampWaitingListEmail({ email: data.email, first_name: data.name, bootcamp_title: bootcamp.header_title, start_date: moment(bootcamp.start_date).format("YYYY-MM-DD"), end_date: moment(bootcamp.end_date).format("YYYY-MM-DD"), notes: data.notes, last_name: data.last_name, res: null })
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in bootcamp registration", error, false);
    }
}

export const getAllCoachesServices = async () => {
    try {
        const coaches = await publicModel.getAllCoachesModel();
        if (isEmpty(coaches)) return coaches;

        coaches.map((coach) => {
            coach.profile_image = CustomImagePath(coach.profile_image);
            // coach.cv = CustomImagePath(coach.cv);
            // coach.certificate = CustomImagePath(coach.certificate);
            coach.cv = coach?.cv
                ? coach.cv.split(",").map(path => CustomImagePath(path))
                : [];
            coach.certificate = coach?.certificate
                ? coach.certificate.split(",").map(path => CustomImagePath(path))
                : [];
        })

        return coaches;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in get all coaches", error, false);
    }
};


export const registerOpenTalentService = async ({first_name, last_name, email, password,talent_type}) => {
    try {
        const user = await commonModel.getUserByEmail(email,"OPEN_TALENT");
        if (!isEmpty(user)) throw new ApiError(EXISTS, "Email");
        const hashedPassword = await hashPassword(password);
        await publicModel.registerOpenTalentModel({ first_name, last_name, email, password : hashedPassword,talent_type });
        return sendOpenTalentVerificationEmail({ email,talent_type });
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in register open talent", error, false);
    }
}

export const getSubscriptionPlansForOpenTalentService = async () => {
    try {
        const plans = await publicModel.getSubscriptionPlansForOpenTalentModel();
        return plans;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in get subscription plans", error, false);
    }
}