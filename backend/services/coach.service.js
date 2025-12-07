import * as coachModel from "../model/coach.model.js";
import * as commonModel from "../model/common.model.js";
import { apiError, ApiError } from "../utils/api.util.js";
import { ADD_ERROR, CUSTOM_ERROR, EXISTS, INVALID, NOT_FOUND, UPDATE_ERROR } from "../utils/message.util.js";
import { CustomImagePath, isEmpty } from "../utils/misc.util.js";
import { __dirname } from "../constants.js"
import path from "path";
import { hashPassword } from "../utils/password.util.js";


export const getCoachByVerificatiionCode = async (verification_code) => {
    try {
        const [coach] = await coachModel.getCoachByVerificationCode(verification_code);
        if (isEmpty(coach)) {
            return { return: false, path: path.join(__dirname, '/views/forgotPasswordError.html') };
        }

        return { return: true, path: "forgetPassword.ejs" };

    } catch (error) {
        throw new ApiError(CUSTOM_ERROR, "get coach by verification code", error, false);
    }
};

export const coachCreatePasswordService = async (verification_code, password) => {
    try {
        const [coach] = await coachModel.getCoachByVerificationCode(verification_code);
        if (isEmpty(coach)) {
            return { return: false, path: path.join(__dirname, '/views/forgotPasswordError.html') };
        }
        const user_id = coach.user_id;
        const hashedPassword = await hashPassword(password);

        await coachModel.updateUserPasswordModel(user_id, hashedPassword);

        return { return: true, path: path.join(__dirname, "/views/password-reset-success.html") };
    } catch (error) {
        throw new ApiError(CUSTOM_ERROR, "Create coach by verification code", error, false);
    }
};

export const addSubscriptionPlanService = async ({ user_id, subscription_id, total_price }) => {
    try {
        const [subscriptionPlan] = await coachModel.getSubscriptionPlansByIdModel(subscription_id);
        if (isEmpty(subscriptionPlan)) throw new ApiError(NOT_FOUND, "Subscription Plan");

        const existingPlan = await coachModel.getLatestSubscriptionPlansModel(user_id);
        if (!isEmpty(existingPlan) && new Date(existingPlan[0].expiry_date) >= new Date()) throw new ApiError(CUSTOM_ERROR, "You already have an active subscription plan");

        const purchase_date = new Date();
        const expiry_date = new Date(purchase_date);

        expiry_date.setDate(expiry_date.getDate() + subscriptionPlan.subscription_days);

        return await coachModel.addSubscriptionPlanModel({ user_id, subscription_id, purchase_date, expiry_date, total_price });
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in add subscription plan", error, false);
    }
}

export const createWebinarService = async (data) => {
    try {
        data.section_1 = JSON.stringify(data.section_1);
        data.section_2 = JSON.stringify(data.section_2);
        data.section_3 = JSON.stringify(data.section_3);
        data.section_4 = JSON.stringify(data.section_4);
        data.section_5 = JSON.stringify(data.section_5);
        data.section_6 = JSON.stringify(data.section_6);
        return await coachModel.createWebinarModel(data);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in create webinar", error, false);
    }
}

export const updateWebinarService = async (data) => {
    try {
        data.section_1 = JSON.stringify(data.section_1);
        data.section_2 = JSON.stringify(data.section_2);
        data.section_3 = JSON.stringify(data.section_3);
        data.section_4 = JSON.stringify(data.section_4);
        data.section_5 = JSON.stringify(data.section_5);
        data.section_6 = JSON.stringify(data.section_6);
        return await coachModel.updateWebinarModel(data);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, "Error in create webinar", error, false);
    }
}

export const createWebinarSpeakersService = async ({ speakers, images }) => {
    try {

        if (speakers.length !== images.length) {
            throw new ApiError(CUSTOM_ERROR, 'Speakers count and images count do not match');
        }

        const [webinar] = await coachModel.getWebinarByIdModel(speakers[0].webinar_id);
        if (isEmpty(webinar)) throw new ApiError(NOT_FOUND, 'Webinar');

        const speakersWithImages = speakers.map((speaker, idx) => ({
            ...speaker,
            image: images[idx] || null,
        }));


        // Pass the array to your model for bulk insert/update
        return await coachModel.createWebinarSpeakersModel(speakersWithImages);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in create webinar speakers', error, false);
    }
};

export const updateWebinarSpeakersService = async ({ speakers, images }) => {
    try {
        if (!Array.isArray(speakers) || !Array.isArray(images)) {
            throw new ApiError(CUSTOM_ERROR, 'Speakers and images must be arrays');
        }

        // Ensure webinar exists
        const [webinar] = await coachModel.getWebinarByIdModel(speakers[0].webinar_id);
        if (isEmpty(webinar)) {
            throw new ApiError(NOT_FOUND, 'Webinar not found');
        }

        // Count null images in speakers
        const nullImageCount = speakers.filter(speaker => speaker.image === null).length;

        // Validate number of images matches number of nulls
        if (images.length !== nullImageCount) {
            throw new ApiError(CUSTOM_ERROR, `Mismatch: ${nullImageCount} speaker(s) need images, but ${images.length} image(s) provided`);
        }

        // Replace null speaker.image with corresponding image from images[]
        let imageIndex = 0;
        const updatedSpeakers = speakers.map((speaker) => {
            if (speaker.image === null && imageIndex < images.length) {
                const updatedSpeaker = {
                    ...speaker,
                    image: images[imageIndex]
                };
                imageIndex++;
                return updatedSpeaker;
            }
            return speaker;
        });


        // Pass updated speakers to model
        return await coachModel.updateWebinarSpeakersModel(updatedSpeakers);
        return null;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error updating webinar speakers', error, false);
    }
};


export const getAllMyWebinarsService = async (user_id) => {
    try {
        const webinars = await coachModel.getWebinarByUserIdModel(user_id);

        if (!isEmpty(webinars)) {
            webinars.forEach((webinar) => {
                webinar.section_1 = JSON.parse(webinar.section_1);
                webinar.section_2 = JSON.parse(webinar.section_2);
                webinar.section_3 = JSON.parse(webinar.section_3);
                webinar.section_4 = JSON.parse(webinar.section_4);
                webinar.section_5 = JSON.parse(webinar.section_5);
                webinar.section_6 = JSON.parse(webinar.section_6);
                webinar?.speakers?.forEach((speaker) => {
                    speaker.image = CustomImagePath(speaker.image);
                });
            });

        }

        return webinars
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in get all my webinars', error, false);
    }
};

export const getWebinarByIdService = async (webinar_id) => {
    try {
        const webinars = await coachModel.getWebinarByIdModel(webinar_id);

        if (isEmpty(webinars)) throw new ApiError(NOT_FOUND, 'Webinar');

        for (const webinar of webinars) {
            // Safely parse JSON sections
            webinar.section_1 = JSON.parse(webinar.section_1 || {});
            webinar.section_2 = JSON.parse(webinar.section_2 || {});
            webinar.section_3 = JSON.parse(webinar.section_3 || {});
            webinar.section_4 = JSON.parse(webinar.section_4 || {});
            webinar.section_5 = JSON.parse(webinar.section_5 || {});
            webinar.section_6 = JSON.parse(webinar.section_6 || {});

            // Format speaker images
            webinar?.speakers?.forEach((speaker) => {
                speaker.image = CustomImagePath(speaker.image);
            });

            // Fetch and attach coach info if not admin
            if (webinar.is_admin == 0) {
                const [speakers] = await coachModel.getSingleCoacheModel(webinar.user_id);

                speakers.profile_image = CustomImagePath(speakers.profile_image);
                // speakers.cv = CustomImagePath(speakers.cv);
                // speakers.certificate = CustomImagePath(speakers.certificate);
                speakers.cv = speakers?.cv
                    ? speakers.cv.split(",").map(path => CustomImagePath(path))
                    : [];
                speakers.certificate = speakers?.certificate
                    ? speakers.certificate.split(",").map(path => CustomImagePath(path))
                    : [];

                webinar.coach = speakers;
            }
        }

        return webinars[0];
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in get webinar by id', error, false);
    }
};


export const getFutureWebinarsService = async () => {
    try {
        const webinars = await coachModel.getFutureWebinarModel();

        if (!isEmpty(webinars)) {
            webinars.forEach((webinar) => {
                webinar.section_1 = JSON.parse(webinar.section_1);
                webinar.section_2 = JSON.parse(webinar.section_2);
                webinar.section_3 = JSON.parse(webinar.section_3);
                webinar.section_4 = JSON.parse(webinar.section_4);
                webinar.section_5 = JSON.parse(webinar.section_5);
                webinar.section_6 = JSON.parse(webinar.section_6);
                webinar?.speakers?.forEach((speaker) => {
                    speaker.image = CustomImagePath(speaker.image);
                });
            });

        }

        return webinars
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in get all my webinars', error, false);
    }
};


export const getAllWebinarsAdminService = async () => {
    try {
        const webinars = await coachModel.getAllWebinarModel();

        if (!isEmpty(webinars)) {
            for (const webinar of webinars) {
                webinar.section_1 = JSON.parse(webinar.section_1);
                webinar.section_2 = JSON.parse(webinar.section_2);
                webinar.section_3 = JSON.parse(webinar.section_3);
                webinar.section_4 = JSON.parse(webinar.section_4);
                webinar.section_5 = JSON.parse(webinar.section_5);
                webinar.section_6 = JSON.parse(webinar.section_6);

                webinar?.speakers?.forEach((speaker) => {
                    speaker.image = CustomImagePath(speaker.image);
                });

                if (webinar.is_admin == 0) {
                    const [speakers] = await coachModel.getSingleCoacheModel(webinar.user_id);

                    speakers.profile_image = CustomImagePath(speakers.profile_image);
                    // speakers.cv = CustomImagePath(speakers.cv);
                    // speakers.certificate = CustomImagePath(speakers.certificate);
                    speakers.cv = speakers?.cv
                        ? speakers.cv.split(",").map(path => CustomImagePath(path))
                        : [];
                    speakers.certificate = speakers?.certificate
                        ? speakers.certificate.split(",").map(path => CustomImagePath(path))
                        : [];
                    webinar.coach = speakers;
                }
            }
        }


        return webinars
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in get all my webinars', error, false);
    }
};

export const deleteWebinarService = async (webinar_id) => {
    try {
        const webinar = await coachModel.getWebinarByIdModel(webinar_id);
        if (isEmpty(webinar)) throw new ApiError(NOT_FOUND, 'Webinar');

        return await coachModel.deleteWebinarModel(webinar_id);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in delete webinar', error, false);
    }
};

export const getMyWebinarRegisteredUserService = async (user_id) => {
    try {
        return await coachModel.getWebinarRegisteredUser(user_id);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in get my webinar registered user', error, false);
    }
}

export const updateCoachProfileService = async (user_id, data) => {
    try {

        const [user] = await coachModel.getCoachByUserId(user_id);
        if (isEmpty(user)) throw new ApiError(NOT_FOUND, 'Coach');

        if (isEmpty(data.profile_image)) {
            data.profile_image = user.profile_image;
        }

        return await coachModel.updateCoachProfileModel(user_id, data);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in update coach profile', error, false);
    }
}

export const getMySubscriptionPlansService = async (user_id) => {
    try {
        return await coachModel.getMySubscriptionPlansModel(user_id);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in get my subscription plans', error, false);
    }
}

export const switchMyAutoPayService = async (user_id) => {
    try {
        const [user] = await commonModel.getUserById(user_id);
        if (isEmpty(user)) throw new ApiError(NOT_FOUND, 'Coach');
        const auto_pay = !user.auto_pay

        await coachModel.switchMyAutoPayModel(user_id, auto_pay);
        return auto_pay;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in switch my auto pay', error, false);
    }
}

export const createOfferService = async (data) => {
    try {
        return await coachModel.createOfferModel(data);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in create offer', error, false);
    }
}

export const updateOfferService = async (data) => {
    try {
        const [offer] = await coachModel.getOfferByIdModel(data.offer_id);
        if (isEmpty(offer)) throw new ApiError(NOT_FOUND, 'Offer');

        return await coachModel.updateOfferModel(data);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in update offer', error, false);
    }
}

export const getAllOffersService = async (user_id) => {
    try {
        return await coachModel.getOffersByUserIdModel(user_id);;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in get all offers', error, false);
    }
}

export const deleteOfferService = async (offer_id) => {
    try {
        const [offer] = await coachModel.getOfferByIdModel(offer_id);
        if (isEmpty(offer)) throw new ApiError(NOT_FOUND, 'Offer');

        return await coachModel.deleteOfferModel(offer_id);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in delete offer', error, false);
    }
}

export const getOfferByIdService = async (offer_id) => {
    try {
        const [offer] = await coachModel.getOfferByIdModel(offer_id);
        if (isEmpty(offer)) throw new ApiError(NOT_FOUND, 'Offer');

        return offer;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in get offer by id', error, false);
    }
}

export const getOffersCountService = async (user_id) => {
    try {
        return await coachModel.getOffersCountModel(user_id);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(CUSTOM_ERROR, 'Error in get offers count', error, false);
    }
}