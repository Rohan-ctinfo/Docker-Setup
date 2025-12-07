import { apiResponse, apiHandler } from "../utils/api.util.js";
import * as freelancerService from "../services/open-talent.service.js";
import { ADD_SUCCESS, CUSTOM_SUCCESS, FETCH, LOGIN, UPDATE_SUCCESS } from "../utils/message.util.js";

export const loginFreelancer = apiHandler(async (req, res) => {
  const { email, password } = req.body;
  const token = await freelancerService.loginFreelancerService(email, password);
  return apiResponse(LOGIN, "Admin", token.Admin, res, "object", token.token);
});

export const verifyEmailAddress = apiHandler(async (req, res) => {
  const { verification_code } = req.params;
  const user = await freelancerService.verifyEmailAddressService(verification_code);
  return res.sendFile(user);
});

export const updateTalentTypeController = apiHandler(async (req, res) => {
  const { user_id } = req.user;
  const { talent_type } = req.body;
  const data = await freelancerService.updateTalentTypeService(user_id, talent_type);
  return apiResponse(UPDATE_SUCCESS, "Talent Role", data, res);
});

export const updateStep2Controller = apiHandler(async (req, res) => {
  const { user_id } = req.user;
  const { talent_role, location, bio } = req.body;
  const data = await freelancerService.updateStep2Service({ talent_role, location, bio, user_id });
  return apiResponse(UPDATE_SUCCESS, "Talent Role", data, res);
});

export const updateStep3Controller = apiHandler(async (req, res) => {
  const { user_id } = req.user;
  const { skills, language } = req.body;
  const certificates = req.files && req.files.certificates && req.files.certificates.length > 0
    ? req.files.certificates.map(file => file.key)
    : [];
  const data = await freelancerService.updateStep3Service({ skills, language, user_id, certificates });
  return apiResponse(UPDATE_SUCCESS, "Talent Role", data, res);
});

export const updateStep4Controller = apiHandler(async (req, res) => {
  const { user_id } = req.user;
  const { website_or_portfolio } = req.body;
  const cv = req.files && req.files.cv && req.files.cv.length > 0
    ? req.files.cv.map(file => file.key).join(",")
    : null;
  const projects = req.files && req.files.projects && req.files.projects.length > 0
    ? req.files.projects.map(file => file.key)
    : [];
  const data = await freelancerService.updateStep4Service({ website_or_portfolio, cv, projects, user_id });
  return apiResponse(UPDATE_SUCCESS, "Talent Role", data, res);
});

export const updateStep5Controller = apiHandler(async (req, res) => {
  const { user_id } = req.user;
  const { search_status, salary_preference, job_type } = req.body;
  const data = await freelancerService.updateStep5Service({ search_status, salary_preference, job_type, user_id });
  return apiResponse(UPDATE_SUCCESS, "Talent Role", data, res);
});


export const openTalentProfileUpdateController = apiHandler(async (req, res) => {
  const { user_id } = req.user;
  const data = req.body;
  data.project_ids = data?.deleted_project_ids
  ? data.deleted_project_ids.split(",").map(Number).filter(id => !isNaN(id))
  : [];

  data.certificates_ids = data?.deleted_certificates_ids
  ? data.deleted_certificates_ids.split(",").map(Number).filter(id => !isNaN(id))
  : [];

  data.cvs = req.files && req.files.cv && req.files.cv.length > 0
    ? req.files.cv.map(file => file.key).join(",")
    : null;
  data.profile_image = req.files && req.files.profile_image && req.files.profile_image.length > 0
    ? req.files.profile_image.map(file => file.key).join(",")
    : null;
  data.projects = req.files && req.files.projects && req.files.projects.length > 0
    ? req.files.projects.map(file => file.key)
    : [];
  data.certificates = req.files && req.files.certificates && req.files.certificates.length > 0
    ? req.files.certificates.map(file => file.key)
    : [];
  const result = await freelancerService.openTalentProfileUpdateService(user_id, data);
  return apiResponse(UPDATE_SUCCESS, "Talent", null, res);
});