import express from 'express';
import { validate } from '../middlewares/validation.middleware.js';
import { changePasswordSchema, forgotPasswordSchema, loginUserSchema, resetPasswordSchema, verifyOTPSchema, } from '../validations/common.validation.js';
import { changePassword, createAdminWebinarController, createAdminWorkshopController, createBootcampController, createContentController, deleteBootcampController, deleteContentController, forgotPassword, getAdminProfile, getAllBootcampController, getAllBootcampRegistration, getAllCoaches, getAllContactUs, getAllContentController, getAllOffersController, getAllOpenTalentController, getAllWebinarController, getAllWebinarRegistration, getAllWorkshopController, getBootcampByIdController, getBootcampHistoryController, getBootcampWatingListController, getCoachSubscriptionHistoryController, getContentBYIdController, getContentByUserIdController, getOfferByIdController, getOpenTalentByIdController, getSigleBootcampRegistration, getSigleWebinarRegistration, getSingleCoach, loginAdmin, otpVerification, resendAdminOTP, resetPassword, switchBlockUnblockController, updateBootcampController, updateBootcampImageController, updateBootcampSessionSpeakersImagesController, updateCoachStatus, updateContentController } from '../controllers/admin.controller.js';
import { bootcampCreationSchema, bootcampUpdateSessionSpeakersImagesSchema, coachUpdateStatusSchema } from '../validations/admin.validaton.js';
import { createContentSchema, updateContentSchema, updateWebinarSpeakersSchema, updateWorkshopSpeakersSchema, webinarCreationSchema, webinarSpeakersSchema, webinarUpdateSchema, workshopCreationSchema, workshopSpeakersSchema, workshopUpdateSchema } from '../validations/coach.validation.js';
import { createWebinarSpeakersController, createWorkshopSpeakersController, deleteWebinarController, deleteWorkshopController, getSingleWebinarController, getSingleWorkshopController, updateWebinarSpeakersController, updateWorkshopSpeakersController, updatteWebinarController, updatteWorkshopController } from '../controllers/coach.controller.js';
import { array, fields } from '../middlewares/multer.middleware.js';
import { arrayAWS, fieldsAWS } from '../utils/aws.util.js';


const router = express.Router();

router.post('/login', validate(loginUserSchema, 'body'), loginAdmin);
router.get("/profile", getAdminProfile);
router.post("/forgot-password", validate(forgotPasswordSchema, 'body'), forgotPassword);
router.post("/resend-otp", validate(forgotPasswordSchema, 'body'), resendAdminOTP);
router.post("/verify-otp", validate(verifyOTPSchema, 'body'), otpVerification);
router.post("/reset-password", validate(resetPasswordSchema, 'body'), resetPassword);


router.post("/change-password", validate(changePasswordSchema, 'body'), changePassword);

router.get("/all-coaches", getAllCoaches);
router.get("/coach/:user_id", getSingleCoach);
router.post("/update-coach-status", validate(coachUpdateStatusSchema, 'body'), updateCoachStatus);

//registration form
router.get("/webinar-registration-form", getAllWebinarRegistration);
router.get("/webinar-registration-form/:webinar_id", getSigleWebinarRegistration);
router.get("/bootcamp-registration-form", getAllBootcampRegistration);
router.get("/bootcamp-registration-form/:bootcamp_id", getSigleBootcampRegistration);
router.get("/contact-us", getAllContactUs);
router.post("/create-webinar", validate(webinarCreationSchema, 'body'), createAdminWebinarController);
router.patch("/update-webinar", validate(webinarUpdateSchema, 'body'), updatteWebinarController);
router.post("/create-webinar-speakers", arrayAWS('', "file", 10), validate(webinarSpeakersSchema, 'body'), createWebinarSpeakersController);
router.patch("/update-webinar-speakers", arrayAWS('', "file", 10), validate(updateWebinarSpeakersSchema, 'body'), updateWebinarSpeakersController);
router.get("/all-webinar", getAllWebinarController);
router.get("/webinar/:webinar_id", getSingleWebinarController);
router.delete("/webinar/:webinar_id", deleteWebinarController);


router.post("/create-bootcamp", validate(bootcampCreationSchema, 'body'), createBootcampController);
router.post(
    "/update-bootcamp-image/:bootcamp_id",
    fieldsAWS('', [
        { name: 'header_image', maxCount: 1 },
        { name: 'footer_image', maxCount: 1 },
        { name: 'brochure', maxCount: 1 },
        { name: 'file', maxCount: 100 }
    ]),
    validate(bootcampUpdateSessionSpeakersImagesSchema, 'body'),
    updateBootcampImageController
);

router.post("/update-bootcamp-session-speakers-images",
    fieldsAWS('', [{ name: 'file', maxCount: 100 }]), validate(bootcampUpdateSessionSpeakersImagesSchema, 'body'),
    updateBootcampSessionSpeakersImagesController
);

router.patch("/bootcamp/:bootcamp_id", validate(bootcampCreationSchema, 'body'), updateBootcampController);

router.get("/bootcamp", getAllBootcampController);
router.get("/bootcamp/:bootcamp_id", getBootcampByIdController);
router.delete("/bootcamp/:bootcamp_id", deleteBootcampController);

router.get("/bootcamp-booking-history", getBootcampHistoryController);
router.get("/coach-subscription-history", getCoachSubscriptionHistoryController);
router.get("/bootcamp-waitinglist-history", getBootcampWatingListController);

router.post("/create-workshop", validate(workshopCreationSchema, 'body'), createAdminWorkshopController);
router.patch("/update-workshop", validate(workshopUpdateSchema, 'body'), updatteWorkshopController);
router.post("/create-workshop-speakers", fieldsAWS('', [{ name: 'file', maxCount: 10 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), validate(workshopSpeakersSchema, 'body'), createWorkshopSpeakersController);
router.patch("/update-workshop-speakers", fieldsAWS('', [{ name: 'file', maxCount: 10 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), validate(updateWorkshopSpeakersSchema, 'body'), updateWorkshopSpeakersController);
router.get("/all-workshop", getAllWorkshopController);
router.get("/workshop/:workshop_id", getSingleWorkshopController);
router.delete("/workshop/:workshop_id", deleteWorkshopController);

router.get("/all-open-talent", getAllOpenTalentController);
router.get("/open-talent/:user_id", getOpenTalentByIdController);

router.get("/all-offers",getAllOffersController);
router.get("/offer/:offer_id",getOfferByIdController);

router.post("/block-unblock/:user_id",switchBlockUnblockController);


router.post("/content", fieldsAWS('', [
    { name: 'files', maxCount: 20 },
    { name: 'image', maxCount: 1 }
]),validate(createContentSchema, 'body'),  createContentController);

router.get("/contents", getAllContentController);
router.patch("/content/:content_id", fieldsAWS('', [
    { name: 'files', maxCount: 20 },
    { name: 'image', maxCount: 1 }
]),validate(updateContentSchema, 'body'),  updateContentController);
router.get("/content-by-user/:user_id", getContentByUserIdController);
router.get("/content/:content_id",getContentBYIdController);
router.delete("/content/:content_id",deleteContentController);


export default router;