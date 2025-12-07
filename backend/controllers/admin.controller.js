import { apiResponse, apiHandler, ApiError } from "../utils/api.util.js";
import * as adminService from "../services/admin.service.js";
import { ADD_SUCCESS, CUSTOM_ERROR, CUSTOM_SUCCESS, FETCH, LOGIN, UPDATE_SUCCESS } from "../utils/message.util.js";
import * as coachService from "../services/coach.service.js";
import { cleanSpeakers, isEmpty } from "../utils/misc.util.js";

export const loginAdmin = apiHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await adminService.loginAdminService(email.toLowerCase(), password);
  return apiResponse(LOGIN, "Admin", data, res);
});

export const getAdminProfile = apiHandler(async (req, res) => {
  const { admin_id } = req.user;
  const data = await adminService.getAdminProfileService(admin_id);
  return apiResponse(FETCH, "Admin", data, res);
});

export const forgotPassword = apiHandler(async (req, res) => {
  const { email } = req.body;
  const data = await adminService.forgotPasswordService(email);
  return apiResponse(CUSTOM_SUCCESS, "Forgot code sent successfully", data, res);
});

export const resendAdminOTP = apiHandler(async (req, res) => {
  const { email } = req.body;
  const data = await adminService.resendAdminOTPService(email);
  return apiResponse(CUSTOM_SUCCESS, data.message, data, res);
});

export const otpVerification = apiHandler(async (req, res) => {
  const { email, otp } = req.body;
  const data = await adminService.verifyOTPService(email, otp);
  return apiResponse(CUSTOM_SUCCESS, "OTP verified successfully", null, res);
});

export const resetPassword = apiHandler(async (req, res) => {
  const { forgot_code, newPassword } = req.body;
  const data = await adminService.resetPasswordService(forgot_code, newPassword);
  return apiResponse(CUSTOM_SUCCESS, "Password reset successfully", data, res);
});

export const changePassword = apiHandler(async (req, res) => {
  const { admin_id } = req.user;
  const { old_password, new_password } = req.body;
  const data = await adminService.changePasswordService(admin_id, old_password, new_password);
  return apiResponse(CUSTOM_SUCCESS, "Password changed successfully", data, res);
});

export const getAllCoaches = apiHandler(async (req, res) => {
  const data = await adminService.getAllCoachesServices();
  return apiResponse(FETCH, "Coaches", data, res);
});

export const getSingleCoach = apiHandler(async (req, res) => {
  const { user_id } = req.params;
  const data = await adminService.getSingleCoachService(user_id);
  return apiResponse(FETCH, "Coach", data, res);
});

export const updateCoachStatus = apiHandler(async (req, res) => {
  const { status, user_id, rejected_reason } = req.body;
  const data = await adminService.updateCoachStatusService(user_id, status, rejected_reason);
  return apiResponse(CUSTOM_SUCCESS, status == "APPROVE" ? "Coach approved successfully" : `Coach rejected successfully`, data, res);
});

export const getAllWebinarRegistration = apiHandler(async (req, res) => {
  const data = await adminService.getAllWebinarRegistrationService();
  return apiResponse(FETCH, "Webinar registration", data, res);
});

export const getSigleWebinarRegistration = apiHandler(async (req, res) => {
  const { webinar_id } = req.params;
  const data = await adminService.getSingleBootcampRegistrationService(webinar_id);
  return apiResponse(FETCH, "Webinar registration", data, res);
});

export const getAllBootcampRegistration = apiHandler(async (req, res) => {
  const data = await adminService.getAllBootcampRegistrationService();
  return apiResponse(FETCH, "Bootcamp registration", data, res);
});

export const getSigleBootcampRegistration = apiHandler(async (req, res) => {
  const { bootcamp_id } = req.params;
  const data = await adminService.getSingleBootcampRegistrationService(bootcamp_id);
  return apiResponse(FETCH, "Bootcamp registration", data, res);
});

export const getAllContactUs = apiHandler(async (req, res) => {
  const data = await adminService.getAllContactUsService();
  return apiResponse(FETCH, "Contact-Us", data, res);
});


export const createAdminWebinarController = apiHandler(async (req, res) => {
  const data = req.body;
  const { admin_id } = req.user;
  data.user_id = null;
  data.admin_id = admin_id;
  data.is_admin = 1;
  const result = await coachService.createWebinarService(data);
  return apiResponse(CUSTOM_SUCCESS, "Webinar created successfully", result, res);
});

export const getAllWebinarController = apiHandler(async (req, res) => {
  const { admin_id } = req.user;
  const result = await coachService.getAllWebinarsAdminService();
  return apiResponse(CUSTOM_SUCCESS, "Webinar fetched successfully", result, res);
});

export const createBootcampController = apiHandler(async (req, res) => {
  let data = req.body;
  data = cleanSpeakers(data);
  const result = await adminService.createBootcampService(data);
  return apiResponse(CUSTOM_SUCCESS, "Bootcamp created successfully", result, res);
});

export const getAllBootcampController = apiHandler(async (req, res) => {
  const result = await adminService.getAllBootcampService();
  return apiResponse(CUSTOM_SUCCESS, "Bootcamp fetched successfully", result, res);
});

export const updateBootcampSessionSpeakersImagesController = apiHandler(async (req, res) => {
  const { ids } = req.body;
  const images = req.files?.file?.map((image) => image.key) || [];
  const session_speaker_ids = ids?.split(',');
  const result = await adminService.updateBootacmpSessionSpeakersImagesService({ images, session_speaker_ids });
  return apiResponse(CUSTOM_SUCCESS, "Bootcamp session speakers images updated successfully", result, res);
});

export const updateBootcampImageController = apiHandler(async (req, res) => {
  const { bootcamp_id, } = req.params;
  const { ids } = req.body;
  const header_image = req.files?.header_image?.[0].key || null;
  const footer_image = req.files?.footer_image?.[0].key || null;
  const brochure = req.files?.brochure?.[0].key || null;

  const images = req.files?.file?.map((image) => image.key) || [];
  const session_speaker_ids = ids?.split(',');

  const result = await adminService.updateBootcampImagesService({ bootcamp_id, header_image, footer_image, brochure, images, session_speaker_ids });
  return apiResponse(CUSTOM_SUCCESS, "Bootcamp images updated successfully", result, res);
});

export const updateBootcampController = apiHandler(async (req, res) => {
  const { bootcamp_id } = req.params;
  let data = req.body;
  data = cleanSpeakers(data);
  const result = await adminService.updateBootcampService(bootcamp_id, data);
  return apiResponse(CUSTOM_SUCCESS, "Bootcamp updated successfully", result, res);
});

export const getBootcampByIdController = apiHandler(async (req, res) => {
  const { bootcamp_id } = req.params;
  const result = await adminService.getSingleBootcampService(bootcamp_id);
  return apiResponse(CUSTOM_SUCCESS, "Bootcamp fetched successfully", result, res);
});

export const deleteBootcampController = apiHandler(async (req, res) => {
  const { bootcamp_id } = req.params;
  const result = await adminService.deleteBootcampService(bootcamp_id);
  return apiResponse(CUSTOM_SUCCESS, "Bootcamp deleted successfully", null, res);
});

export const getPublicBootcampController = apiHandler(async (req, res) => {
  const result = await adminService.getPublicBootcampService();
  return apiResponse(CUSTOM_SUCCESS, "Bootcamp fetched successfully", result, res);
});

export const getBootcampHistoryController = apiHandler(async (req, res) => {
  const { bootcamp_id } = req.query;
  const result = await adminService.getBootcampHistoryService(bootcamp_id);
  return apiResponse(CUSTOM_SUCCESS, "Bootcamp booking history fetched successfully", result, res);
});

export const getCoachSubscriptionHistoryController = apiHandler(async (req, res) => {
  const result = await adminService.getCoachSubscriptionHistoryService();
  return apiResponse(CUSTOM_SUCCESS, "Subscription history fetched successfully", result, res);
});

export const getBootcampWatingListController = apiHandler(async (req, res) => {
  const result = await adminService.getBootcampWatingListService();
  return apiResponse(CUSTOM_SUCCESS, "Bootcamp booking history fetched successfully", result, res);
});

export const createAdminWorkshopController = apiHandler(async (req, res) => {
  const data = req.body;
  const { admin_id } = req.user;
  data.user_id = null;
  data.admin_id = admin_id;
  data.is_admin = 1;
  const result = await adminService.createWorkshopService(data);
  return apiResponse(CUSTOM_SUCCESS, "Workshop created successfully", result, res);
});

export const getAllWorkshopController = apiHandler(async (req, res) => {
  const { admin_id } = req.user;
  const result = await adminService.getAllWorkshopsAdminService();
  return apiResponse(CUSTOM_SUCCESS, "Workshop fetched successfully", result, res);
});

export const uploadSocketFilesController = apiHandler(async (req, res) => {
  const file_url = req?.files ? req.files.map(file => file.key).join(",") : "";

  console.log("file_url", req?.files);

  if (isEmpty(file_url)) {
    throw new ApiError(CUSTOM_ERROR, "Please upload files");
  }

  return apiResponse(CUSTOM_SUCCESS, "Image Upload successfully", file_url, res);
})

export const getAllOpenTalentController = apiHandler(async (req, res) => {
  const data = await adminService.getAllOpenTalentServices();
  return apiResponse(FETCH, "Open Talent", data, res);
});

export const getOpenTalentByIdController = apiHandler(async (req, res) => {
  const { user_id } = req.params;
  const data = await adminService.getOpenTalentByIdServices(user_id);
  return apiResponse(FETCH, "Open Talent", data, res);
});

export const getAllOffersController = apiHandler(async (req, res) => {
  const data = await adminService.getAllOffersServices();
  return apiResponse(FETCH, "Offers", data, res);
});

export const getOfferByIdController = apiHandler(async (req, res) => {
  const { offer_id } = req.params;
  const data = await adminService.getOffersByIdServices(offer_id);
  return apiResponse(FETCH, "Offer", data, res);
});

export const switchBlockUnblockController = apiHandler(async (req, res) => {
  const { user_id } = req.params;
  const data = await adminService.switchBlockUnblockService(user_id);
  return apiResponse(CUSTOM_SUCCESS, `${data ? "Unblocked successfully" : "Blocked successfully"}`, data, res);
});

export const getAllOffersByCoachController = apiHandler(async (req, res) => {
  const { user_id } = req.params;
  const data = await coachService.getAllOffersService(user_id);
  return apiResponse(CUSTOM_SUCCESS, "Offers fetched successfully", data, res);
});

export const createContentController = apiHandler(async (req, res) => {
  const data = req.body;
  data.user_id = null;
  data.is_admin_created = true;
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
  const { content_type, category_id } = req.query;
  const result = await adminService.getAllContentService(content_type, category_id, "admin");
  return apiResponse(CUSTOM_SUCCESS, "Content fetched successfully", result, res);
});

export const getAllContentPublicController = apiHandler(async (req, res) => {
  const { content_type, category_id } = req.query;
  const result = await adminService.getAllContentService(content_type, category_id, "public");
  return apiResponse(CUSTOM_SUCCESS, "Content fetched successfully", result, res);
});

export const updateContentController = apiHandler(async (req, res) => {
  const { content_id } = req.params;
  const data = req.body;
  data.content_file_ids = data.content_file_ids ? data.content_file_ids.split(',') : [];
  data.files = req.files && req.files.files && req.files.files.length > 0
    ? req.files.files.map(file => file.key)
    : [];

  data.image = req.files && req.files.image && req.files.image.length > 0
    ? req.files.image[0].key
    : null;

  const result = await adminService.updateContentService(content_id, data);
  return apiResponse(CUSTOM_SUCCESS, "Content updated successfully", result, res);
});

export const getContentByUserIdController = apiHandler(async (req, res) => {
  const { user_id } = req.params;
  const { content_type } = req.query;
  const result = await adminService.getContentByUserIdService(user_id, content_type, "admin");
  return apiResponse(CUSTOM_SUCCESS, "Content fetched successfully", result, res);
});

export const getContentByUserIdPublicController = apiHandler(async (req, res) => {
  const { user_id } = req.params;
  const { content_type } = req.query;
  const result = await adminService.getContentByUserIdService(user_id, content_type, "public");
  return apiResponse(CUSTOM_SUCCESS, "Content fetched successfully", result, res);
});

export const getContentBYIdController = apiHandler(async (req, res) => {
  const { content_id } = req.params;
  const result = await adminService.getContentByContentIdService(content_id);
  return apiResponse(CUSTOM_SUCCESS, "Content fetched successfully", result, res);
});

export const deleteContentController = apiHandler(async (req, res) => {
  const { content_id } = req.params;
  const result = await adminService.deleteContentService(content_id);
  return apiResponse(CUSTOM_SUCCESS, "Content deleted successfully", result, res);
});