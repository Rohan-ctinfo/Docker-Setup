import express from 'express';
import { validate } from '../middlewares/validation.middleware.js';
import {  loginUserSchema } from '../validations/freelancer.validation.js';
import { changePassword,   deleteMyAccountController,   disableMyAccountController,   forgotPassword, getUserProfile, loginUser, otpVerification, registerUser, resendUserOTP, resetPassword, userVerified, } from '../controllers/common.controller.js';
import { changePasswordSchema,  forgotPasswordSchema, registerUserSchema, resetPasswordSchema, verifyOTPSchema, } from '../validations/common.validation.js';
import { fields } from '../middlewares/multer.middleware.js';
import { getBootcampByIdController, getPublicBootcampController } from '../controllers/admin.controller.js';
import { fieldsAWS } from '../utils/aws.util.js';
import { addSubscriptionPlan, getMySubscriptionPlanController, switchMyAutoPayController } from '../controllers/coach.controller.js';
import { subscriptionPurchaseSchema } from '../validations/coach.validation.js';

const router = express.Router();

router.post("/register-coach", fieldsAWS('', [{ name: 'profile_image', maxCount: 1 },{ name: 'cv', maxCount: 20 },{ name: 'certificate', maxCount: 20 }]),validate(registerUserSchema, 'body'), registerUser);
router.get('/verify',  userVerified);
router.post('/login', validate(loginUserSchema, 'body'), loginUser);
router.get("/profile", getUserProfile);
router.post("/forgot-password",validate(forgotPasswordSchema, 'body'),forgotPassword);
router.post("/resend-otp", validate(forgotPasswordSchema, 'body'),resendUserOTP);
router.post("/verify-otp", validate(verifyOTPSchema, 'body'),otpVerification);
router.post("/reset-password", validate(resetPasswordSchema, 'body'),resetPassword);



router.post("/change-password", validate(changePasswordSchema, 'body'),changePassword);


router.get("/bootcamp",getPublicBootcampController);
router.get("/bootcamp/:bootcamp_id", getBootcampByIdController);

router.get("/subscriptions",getMySubscriptionPlanController);
router.post("/add-subscription-plan", validate(subscriptionPurchaseSchema, 'body'), addSubscriptionPlan);
router.post("/switch-auto-pay", switchMyAutoPayController);
router.post("/disable-account", disableMyAccountController);
router.delete("/delete-account", deleteMyAccountController);



export default router;