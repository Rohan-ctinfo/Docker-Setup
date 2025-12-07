import { apiResponse, apiHandler, ApiError } from "../utils/api.util.js";
import * as coachService from "../services/coach.service.js";
import * as adminService from "../services/admin.service.js";
import { ADD_SUCCESS, CUSTOM_SUCCESS, FETCH, LOGIN, UPDATE_SUCCESS } from "../utils/message.util.js";
import { LOGO_URL } from "../constants.js";
import { isEmpty } from "../utils/misc.util.js";

export const coachVerificationController = apiHandler(async (req, res) => {
    const { verification_code } = req.params;
    const user = await coachService.getCoachByVerificatiionCode(verification_code);
    return user.return == true ? res.render(user.path, { verification_code, msg: "", logo_url: LOGO_URL }) : res.sendFile(user.path);
});

export const coachCreatePassword = apiHandler(async (req, res) => {
    const { verification_code, } = req.params;
    const { password } = req.body;
    const user = await coachService.coachCreatePasswordService(verification_code, password);
    return res.sendFile(user.path);
});

export const addSubscriptionPlan = apiHandler(async (req, res) => {
    const { user_id } = req.user;
    const { subscription_id, total_price } = req.body;
    const data = await coachService.addSubscriptionPlanService({ user_id, subscription_id, total_price });
    return apiResponse(CUSTOM_SUCCESS, "Subscription plan added successfully", data, res);
});

export const createWebinarController = apiHandler(async (req, res) => {
    const data = req.body;
    const { user_id } = req.user;
    data.user_id = user_id;
    const result = await coachService.createWebinarService(data);
    return apiResponse(CUSTOM_SUCCESS, "Webinar created successfully", result, res);
});

export const updatteWebinarController = apiHandler(async (req, res) => {
    const data = req.body;
    const result = await coachService.updateWebinarService(data);
    return apiResponse(CUSTOM_SUCCESS, "Webinar updated successfully", result, res);
});


export const createWebinarSpeakersController = apiHandler(async (req, res) => {
    const { speakers } = req.body;
    const parsedOnce = JSON.parse(speakers);
    const parsed = typeof parsedOnce === 'string' ? JSON.parse(parsedOnce) : parsedOnce;
    const images = req?.files ? req.files.map(file => file.key) : [];
    const data = { speakers: parsed, images };
    const result = await coachService.createWebinarSpeakersService(data);
    return apiResponse(CUSTOM_SUCCESS, "Webinar speakers created successfully", null, res);
});

export const updateWebinarSpeakersController = apiHandler(async (req, res) => {
    const { speakers } = req.body;
    const parsedOnce = JSON.parse(speakers);
    const parsed = typeof parsedOnce === 'string' ? JSON.parse(parsedOnce) : parsedOnce;
    const images = req?.files ? req.files.map(file => file.key) : [];
    const data = { speakers: parsed, images };
    const result = await coachService.updateWebinarSpeakersService(data);
    return apiResponse(CUSTOM_SUCCESS, "Webinar speakers updated successfully", null, res);
});

export const getAllMyWebinarController = apiHandler(async (req, res) => {
    const { user_id } = req.user;
    const data = await coachService.getAllMyWebinarsService(user_id);
    return apiResponse(CUSTOM_SUCCESS, "Webinars fetched successfully", data, res);
});

export const getSingleWebinarController = apiHandler(async (req, res) => {
    const { webinar_id } = req.params;
    const data = await coachService.getWebinarByIdService(webinar_id);
    return apiResponse(CUSTOM_SUCCESS, "Webinar fetched successfully", data, res);
});

export const getFutureWebinarController = apiHandler(async (req, res) => {
    const data = await coachService.getFutureWebinarsService();
    return apiResponse(CUSTOM_SUCCESS, "Webinars fetched successfully", data, res);
});

export const deleteWebinarController = apiHandler(async (req, res) => {
    const { webinar_id } = req.params;
    const data = await coachService.deleteWebinarService(webinar_id);
    return apiResponse(CUSTOM_SUCCESS, "Webinar deleted successfully", data, res);
});

export const getMyWebinarRegisteredUserController = apiHandler(async (req, res) => {
    const { user_id } = req.user;
    const data = await coachService.getMyWebinarRegisteredUserService(user_id);
    return apiResponse(CUSTOM_SUCCESS, "Webinar registered users fetched successfully", data, res);
});

export const createWorkshopController = apiHandler(async (req, res) => {
    const data = req.body;
    const { user_id } = req.user;
    data.user_id = user_id;
    const result = await adminService.createWorkshopService(data);
    return apiResponse(CUSTOM_SUCCESS, "Workshop created successfully", result, res);
});

export const updatteWorkshopController = apiHandler(async (req, res) => {
    const data = req.body;
    const result = await adminService.updateWorkshopService(data);
    return apiResponse(CUSTOM_SUCCESS, "Workshop updated successfully", result, res);
});


export const createWorkshopSpeakersController = apiHandler(async (req, res) => {
    const { speakers } = req.body;
    const parsedOnce = JSON.parse(speakers);
    const parsed = typeof parsedOnce === 'string' ? JSON.parse(parsedOnce) : parsedOnce;
    const images = req.files?.file?.map((image) => image.key) || [];
    const image1 = req.files && req.files.image1 && req.files.image1.length > 0
        ? req.files.image1[0].key
        : null;

    const image2 = req.files && req.files.image2 && req.files.image2.length > 0
        ? req.files.image2[0].key
        : null;
    const data = { speakers: parsed, images, image1, image2 };
    const result = await adminService.createWorkshopSpeakersService(data);
    return apiResponse(CUSTOM_SUCCESS, "Workshop speakers created successfully", null, res);
});

export const updateWorkshopSpeakersController = apiHandler(async (req, res) => {
    const { speakers } = req.body;
    const parsedOnce = JSON.parse(speakers);
    const parsed = typeof parsedOnce === 'string' ? JSON.parse(parsedOnce) : parsedOnce;
    const images = req.files?.file?.map((image) => image.key) || [];
    const image1 = req.files && req.files.image1 && req.files.image1.length > 0
        ? req.files.image1[0].key
        : null;

    const image2 = req.files && req.files.image2 && req.files.image2.length > 0
        ? req.files.image2[0].key
        : null;

    const data = { speakers: parsed, images, image1, image2 };
    const result = await adminService.updateWorkshopSpeakersService(data);
    return apiResponse(CUSTOM_SUCCESS, "Workshop speakers updated successfully", null, res);
});

export const getAllMyWorkshopController = apiHandler(async (req, res) => {
    const { user_id } = req.user;
    const data = await adminService.getAllMyWorkshopsService(user_id);
    return apiResponse(CUSTOM_SUCCESS, "Workshops fetched successfully", data, res);
});

export const getSingleWorkshopController = apiHandler(async (req, res) => {
    const { workshop_id } = req.params;
    const data = await adminService.getWorkshopByIdService(workshop_id);
    return apiResponse(CUSTOM_SUCCESS, "Workshop fetched successfully", data, res);
});

export const getFutureWorkshopController = apiHandler(async (req, res) => {
    const { user_id} = req.query
    const data = await adminService.getFutureWorkshopsService(user_id);
    return apiResponse(CUSTOM_SUCCESS, "Workshops fetched successfully", data, res);
});

export const deleteWorkshopController = apiHandler(async (req, res) => {
    const { workshop_id } = req.params;
    const data = await adminService.deleteWorkshopService(workshop_id);
    return apiResponse(CUSTOM_SUCCESS, "Workshop deleted successfully", data, res);
});

export const updateCoachProfileController = apiHandler(async (req, res) => {
    const data = req.body;
    const { user_id } = req.user;
    data.profile_image = req.files && req.files.profile_image && req.files.profile_image.length > 0
        ? req.files.profile_image.map(file => file.key).join(",")
        : null;
    const result = await coachService.updateCoachProfileService(user_id, data);
    return apiResponse(CUSTOM_SUCCESS, "Coach profile updated successfully", result, res);
});

export const getMySubscriptionPlanController = apiHandler(async (req, res) => {
    const { user_id } = req.user;
    const data = await coachService.getMySubscriptionPlansService(user_id);
    return apiResponse(CUSTOM_SUCCESS, "Subscription plan fetched successfully", data, res);
});

export const switchMyAutoPayController = apiHandler(async (req, res) => {
    const { user_id } = req.user;
    const data = await coachService.switchMyAutoPayService(user_id);
    return apiResponse(CUSTOM_SUCCESS, `${data ? 'Plan subscribed successfully' : 'Plan cancel successfully'}`, data, res);
});

export const createOfferController = apiHandler(async (req, res) => {
    const { user_id } = req.user;
    const data = req.body;
    data.user_id = user_id;
    const result = await coachService.createOfferService(data);
    return apiResponse(CUSTOM_SUCCESS, "Offer created successfully", result, res);
});

export const updateOfferController = apiHandler(async (req, res) => {
    const data = req.body;
    data.offer_id = req.params.offer_id;
    const result = await coachService.updateOfferService(data);
    return apiResponse(CUSTOM_SUCCESS, "Offer updated successfully", result, res);
});

export const getAllOffersController = apiHandler(async (req, res) => {
    const { user_id } = req.user;
    const data = await coachService.getAllOffersService(user_id);
    return apiResponse(CUSTOM_SUCCESS, "Offers fetched successfully", data, res);
});

export const deleteOfferController = apiHandler(async (req, res) => {
    const { offer_id } = req.params;
    const data = await coachService.deleteOfferService(offer_id);
    return apiResponse(CUSTOM_SUCCESS, "Offer deleted successfully", data, res);
});

export const getOfferByIdController = apiHandler(async (req, res) => {
    const { offer_id } = req.params;
    const data = await coachService.getOfferByIdService(offer_id);
    return apiResponse(CUSTOM_SUCCESS, "Offer fetched successfully", data, res);
});

export const createContentController = apiHandler(async (req, res) => {
    const data = req.body;
    data.user_id = req.user.user_id;
    data.is_admin_created = false;
    data.files = req.files && req.files.files && req.files.files.length > 0
        ? req.files.files.map(file => file.key)
        : [];
    data.image = req.files && req.files.image && req.files.image.length > 0
        ? req.files.image[0].key
        : null;

    if (isEmpty(data.files)) {
        throw new ApiError(CUSTOM_ERROR, "Please upload files");
    }

    const result = await adminService.createContentService(data);
    return apiResponse(CUSTOM_SUCCESS, "Content created successfully", result, res);
});

export const getAllContentController = apiHandler(async (req, res) => {
    const { user_id } = req.user;
    const { content_type } = req.query;
    const result = await adminService.getContentByUserIdService(user_id, content_type);
    return apiResponse(CUSTOM_SUCCESS, "Content fetched successfully", result, res);
});

export const getOffersCountsController = apiHandler(async (req, res) => {
    const { user_id } = req.user;
    const result = await coachService.getOffersCountService(user_id);
    return apiResponse(CUSTOM_SUCCESS, "Content fetched successfully", result, res);
});