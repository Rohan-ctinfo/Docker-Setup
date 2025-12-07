import express from 'express';
import { validate } from '../middlewares/validation.middleware.js';
import { deleteMyAccountController, disableMyAccountController } from '../controllers/common.controller.js';
import { } from '../validations/common.validation.js';
import { addSubscriptionPlan, coachCreatePassword, coachVerificationController, createContentController, createOfferController, createWebinarController, createWebinarSpeakersController, createWorkshopController, createWorkshopSpeakersController, deleteOfferController, deleteWebinarController, deleteWorkshopController, getAllContentController, getAllMyWebinarController, getAllMyWorkshopController, getAllOffersController, getMySubscriptionPlanController, getMyWebinarRegisteredUserController, getOfferByIdController, getOffersCountsController, getSingleWebinarController, getSingleWorkshopController, switchMyAutoPayController, updateCoachProfileController, updateOfferController, updateWebinarSpeakersController, updateWorkshopSpeakersController, updatteWebinarController, updatteWorkshopController } from '../controllers/coach.controller.js';
import { createContentSchema, createOfferSchema, subscriptionPurchaseSchema, updateContentSchema, updateProfileSchema, updateWebinarSpeakersSchema, updateWorkshopSpeakersSchema, webinarCreationSchema, webinarSpeakersSchema, webinarUpdateSchema, workshopCreationSchema, workshopSpeakersSchema, workshopUpdateSchema } from '../validations/coach.validation.js';
import { array, fields } from '../middlewares/multer.middleware.js';
import { arrayAWS, fieldsAWS } from '../utils/aws.util.js';
import { deleteContentController, getContentBYIdController, updateContentController } from '../controllers/admin.controller.js';

const router = express.Router();

router.get("/verify/:verification_code", coachVerificationController);
router.post("/create-password/:verification_code", coachCreatePassword);
router.post("/add-subscription-plan", validate(subscriptionPurchaseSchema, 'body'), addSubscriptionPlan);
router.post("/create-webinar", validate(webinarCreationSchema, 'body'), createWebinarController);
router.post("/create-webinar-speakers", arrayAWS('', "file", 10), validate(webinarSpeakersSchema, 'body'), createWebinarSpeakersController);
router.patch("/update-webinar-speakers", arrayAWS('', "file", 10), validate(updateWebinarSpeakersSchema, 'body'), updateWebinarSpeakersController);
router.patch("/update-webinar", validate(webinarUpdateSchema, 'body'), updatteWebinarController);
router.get("/my-webinars", getAllMyWebinarController);
router.get("/webinar/:webinar_id", getSingleWebinarController);
router.delete("/webinar/:webinar_id", deleteWebinarController);
router.get("/webinar-booked-users", getMyWebinarRegisteredUserController);

router.post("/create-workshop", validate(workshopCreationSchema, 'body'), createWorkshopController);
router.post("/create-workshop-speakers", fieldsAWS('', [{ name: 'file', maxCount: 10 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), validate(workshopSpeakersSchema, 'body'), createWorkshopSpeakersController);
router.patch("/update-workshop-speakers", fieldsAWS('', [{ name: 'file', maxCount: 10 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), validate(updateWorkshopSpeakersSchema, 'body'), updateWorkshopSpeakersController);
router.patch("/update-workshop", validate(workshopUpdateSchema, 'body'), updatteWorkshopController);
router.get("/my-workshops", getAllMyWorkshopController);
router.get("/workshop/:workshop_id", getSingleWorkshopController);
router.delete("/workshop/:workshop_id", deleteWorkshopController);

router.patch("/profile", fieldsAWS('', [{ name: 'profile_image', maxCount: 1 }]), validate(updateProfileSchema, 'body'), updateCoachProfileController);
router.get("/subscriptions", getMySubscriptionPlanController);
router.post("/switch-auto-pay", switchMyAutoPayController);
router.post("/disable-account", disableMyAccountController);
router.delete("/delete-account", deleteMyAccountController);


router.post("/offer", validate(createOfferSchema, 'body'), createOfferController);
router.patch("/offer/:offer_id", validate(createOfferSchema, 'body'), updateOfferController);
router.get("/offer", getAllOffersController);
router.get("/offer/:offer_id", getOfferByIdController);
router.delete("/offer/:offer_id", deleteOfferController);
router.get("/offer-dashboard", getOffersCountsController);


router.post("/content", fieldsAWS('', [
    { name: 'files', maxCount: 20 },
    { name: 'image', maxCount: 1 }
]), validate(createContentSchema, 'body'), createContentController);

router.patch("/content/:content_id", fieldsAWS('', [
    { name: 'files', maxCount: 20 },
    { name: 'image', maxCount: 1 }
]), validate(updateContentSchema, 'body'), updateContentController);
router.get("/content", getAllContentController);
router.get("/content/:content_id", getContentBYIdController);
router.delete("/content/:content_id", deleteContentController);



export default router;