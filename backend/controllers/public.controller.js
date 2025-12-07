import { apiResponse, apiHandler } from "../utils/api.util.js";
import * as publicService from "../services/public.service.js";
import { ADD_SUCCESS, CUSTOM_SUCCESS, FETCH, LOGIN, UPDATE_SUCCESS } from "../utils/message.util.js";
import { MAP_API_KEY } from "../constants.js";



export const contactUs = apiHandler(async (req, res) => {
    const { full_name, email, phone_number, address, subject, message, longitude, latitude } = req.body;
    const data = await publicService.contactUsService(full_name, email, phone_number, address, subject, message, latitude, longitude);
    return apiResponse(CUSTOM_SUCCESS, "Message Sent Successfully", data, res);
});


export const webinarRegistration = apiHandler(async (req, res) => {
    const { first_name, last_name, email, phone_number, linkedin_url, role, source,webinar_id } = req.body;
    const data = await publicService.webinarRegistrationService(first_name, last_name, email, phone_number, linkedin_url, role, source,webinar_id);
    return apiResponse(CUSTOM_SUCCESS, "Thank you! You have successfully registered for the webinar", data, res);
});

export const bootcampRegistration = apiHandler(async (req, res) => {
    const { name, email, timezone, notes } = req.body;
    const data = await publicService.bootcampRegistrationService(name, email, timezone, notes);
    return apiResponse(CUSTOM_SUCCESS, "Bootcamp registration successfully", data, res);
});

export const getGeoLocation = async (req, res) => {
    try {
        const { location } = req.query;
        const data = await publicService.getGeoLocationService(location);

        return apiResponse(CUSTOM_SUCCESS, "Location Found", data, res);
    } catch (error) {
        console.error(error.response?.data || error.message);
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
};

export const getCategories = apiHandler(async (req, res) => {
    const data = await publicService.getCategoriesService();
    return apiResponse(CUSTOM_SUCCESS, "Categories fetched successfully", data, res);
});

export const getSubscriptionPlans = apiHandler(async (req, res) => {
    const data = await publicService.getSubscriptionPlansService();
    return apiResponse(CUSTOM_SUCCESS, "Subscription plans fetched successfully", data, res);
});

export const bootcampBookings = apiHandler(async (req, res) => {
    const userData = req.body;
    const data = await publicService.bootcampBookingsService(userData);
    return apiResponse(CUSTOM_SUCCESS, "You have successfully registered for the bootcamp. All the details and information about the bootcamp will be sent to your email", null, res);
});

export const bootcampWaitingLists = apiHandler(async (req, res) => {
    const userData = req.body;
    const data = await publicService.bootcampWaitingListsService(userData);
    return apiResponse(CUSTOM_SUCCESS, "You’ve been added to the bootcamp waiting list. We’ll notify you by email when a seat becomes available or when new sessions open", null, res);
});

export const getAllCoaches = apiHandler(async (req, res) => {
  const data = await publicService.getAllCoachesServices();
  return apiResponse(FETCH, "Coaches", data, res);
});

export const registerOpenTalent = apiHandler(async (req, res) => {
    const {first_name, last_name, email, password,talent_type} = req.body;
    const data = await publicService.registerOpenTalentService({first_name, last_name, email, password,talent_type});

    return apiResponse(CUSTOM_SUCCESS, "Signup completed successfully", data, res);
});

export const getSubscriptionForOpenTalentPlans = apiHandler(async (req, res) => {
    const data = await publicService.getSubscriptionPlansForOpenTalentService();
    return apiResponse(CUSTOM_SUCCESS, "Subscription plans fetched successfully", data, res);
});