import express from 'express';
import { validate } from '../middlewares/validation.middleware.js';
import { healthcheckSchema, loginUserSchema, settingsUpdateSchema, updateStep2Schema, updateStep3Schema, updateStep4Schema, updateStep5Schema, updateTalentRoleSchema } from '../validations/freelancer.validation.js';
import { loginFreelancer, openTalentProfileUpdateController, updateStep2Controller, updateStep3Controller, updateStep4Controller, updateStep5Controller, updateTalentTypeController, verifyEmailAddress } from '../controllers/open-talent.controller.js';
import { fieldsAWS } from '../utils/aws.util.js';

const router = express.Router();

// router.post('/login', validate(healthcheckSchema, 'body'), loginFreelancer);
router.get("/verify/:verification_code", verifyEmailAddress);
router.post("/update-talent-type", validate(updateTalentRoleSchema, 'body'), updateTalentTypeController);
router.post("/update-step-2", validate(updateStep2Schema, 'body'), updateStep2Controller);
router.post("/update-step-3", fieldsAWS('', [{ name: 'certificates', maxCount: 20 }]), validate(updateStep3Schema, 'body'), updateStep3Controller);
router.post("/update-step-4", fieldsAWS('', [{ name: 'cv', maxCount: 20 }, { name: 'projects', maxCount: 20 }]), validate(updateStep4Schema, 'body'), updateStep4Controller);
router.post("/update-step-5", validate(updateStep5Schema, 'body'), updateStep5Controller);

router.patch("/profile",fieldsAWS('', [{ name: 'certificates', maxCount: 20 },{ name: 'cv', maxCount: 20 }, { name: 'projects', maxCount: 20 },{ name: 'profile_image', maxCount: 1 }]),validate(settingsUpdateSchema, 'body'), openTalentProfileUpdateController);

export default router;
