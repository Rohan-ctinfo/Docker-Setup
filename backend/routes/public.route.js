import express from 'express';
import { validate } from '../middlewares/validation.middleware.js';
import {  bootcampBookings, bootcampRegistration, bootcampWaitingLists, contactUs,  getAllCoaches,  getCategories,  getGeoLocation,  getSubscriptionForOpenTalentPlans,  getSubscriptionPlans,  registerOpenTalent,  webinarRegistration } from '../controllers/public.controller.js';
import { bootcampBookingsSchema, bootcampRegistrationSchema, bootcampWaitingListsSchema, contactUsSchema, drawingSlotsSchema, geoLocationSchema, openTalentRegistrationSchema, webinarRegistrationSchema } from '../validations/common.validation.js';
import { getFutureWebinarController, getFutureWorkshopController, getSingleWebinarController, getSingleWorkshopController } from '../controllers/coach.controller.js';
import { getAllOffersByCoachController, getAllOffersController, getOfferByIdController, getSingleCoach,getAllContentPublicController, getContentByUserIdPublicController, getContentBYIdController } from '../controllers/admin.controller.js';

const router = express.Router();

router.post("/contact-us", validate(contactUsSchema, 'body'),contactUs);
router.post("/webinar-registration", validate(webinarRegistrationSchema, 'body'),webinarRegistration);
router.post("/bootcamp-registration", validate(bootcampRegistrationSchema, 'body'),bootcampRegistration);
router.get("/get-geo-location",validate(geoLocationSchema, 'query'),getGeoLocation);
router.get("/get-categories",getCategories);
router.get("/get-subscription-plans",getSubscriptionPlans);
router.get("/webinar/:webinar_id",getSingleWebinarController);
router.get("/webinar",getFutureWebinarController);
router.post("/bootcamp-booking",validate(bootcampBookingsSchema, 'body'),bootcampBookings);
router.post("/bootcamp-waiting-list",validate(bootcampWaitingListsSchema, 'body'),bootcampWaitingLists);

router.get("/workshop",getFutureWorkshopController);
router.get("/workshop/:workshop_id",getSingleWorkshopController);

router.get("/all-coaches",getAllCoaches);
router.get("/coach/:user_id", getSingleCoach);

router.post("/register-open-talent",validate(openTalentRegistrationSchema, 'body'),registerOpenTalent);
router.get("/get-subscription-plans-open-talent",getSubscriptionForOpenTalentPlans);

router.get("/all-offers",getAllOffersController);
router.get("/offer/:offer_id",getOfferByIdController);
router.get("/coach-offers/:user_id",getAllOffersByCoachController);


router.get("/contents", getAllContentPublicController);
router.get("/content-by-user/:user_id", getContentByUserIdPublicController);
router.get("/content/:content_id",getContentBYIdController);


export default router;