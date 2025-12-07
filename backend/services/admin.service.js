import { comparePassword, hashPassword } from "../utils/password.util.js";
import * as adminModel from "../model/admin.model.js";
import * as commonModel from "../model/common.model.js";
import { apiError, ApiError } from "../utils/api.util.js";
import { ADD_ERROR, CUSTOM_ERROR, EXISTS, INVALID, NOT_FOUND, UPDATE_ERROR } from "../utils/message.util.js";
import { CustomImagePath, deleteImage, isEmpty } from "../utils/misc.util.js";
import { API_URL, JWT_EXPIRY, JWT_SECRET } from "../constants.js";
import { sendAccountApproveEmail, sendAccountRejectionEmail, sendOtpVerificationEmail, sendVerificationEmail } from "../utils/email.util.js";
import jwt from 'jsonwebtoken';

import { v4 as uuidv4 } from "uuid";


export const loginAdminService = async (email, password) => {
  try {
    const [existingAdmin] = await adminModel.getAdminByEmail(email);

    if (isEmpty(existingAdmin)) {
      throw new ApiError(NOT_FOUND, "Admin");
    }


    const isPasswordValid = await comparePassword(password, existingAdmin.password);

    if (!isPasswordValid) {
      throw new ApiError(INVALID, "Password");
    }

    const adminData = {
      admin_id: existingAdmin.admin_id,
      email: existingAdmin.email,
      role: "ADMIN"
    };

    if (existingAdmin.profile_image) {
      existingAdmin.profile_image = CustomImagePath(existingAdmin.profile_image);
    }

    const token = jwt.sign(adminData, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    return { token, adminData: existingAdmin };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in login", error, false);
  }
}

export const getAdminProfileService = async (admin_id) => {
  try {
    const [Admin] = await adminModel.getAdminById(admin_id);

    if (Admin.profile_image) {
      Admin.profile_image = CustomImagePath(Admin.profile_image);
    }

    if (Admin?.coach) {
      Admin.coach.video = CustomImagePath(Admin?.coach?.video);
    }

    return Admin;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get Admin", error, false);
  }
}

export const forgotPasswordService = async (email) => {
  try {

    const [Admin] = await adminModel.getAdminByEmail(email);

    if (isEmpty(Admin)) {
      throw new ApiError(NOT_FOUND, "Admin");
    }


    const forgot_code = uuidv4();
    const otp = Math.floor(1000 + Math.random() * 9000);
    const mail = await sendOtpVerificationEmail({ email, otp });
    await adminModel.forgotADMINPasswordModel(email, forgot_code, otp);
    return forgot_code;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in forgot password", error, false);
  }
}

export const resendAdminOTPService = async (email) => {
  try {
    const [Admin] = await adminModel.getAdminByEmail(email);

    if (isEmpty(Admin)) {
      throw new ApiError(NOT_FOUND, "Admin");
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    const mail = await sendOtpVerificationEmail({ email, otp });
    await adminModel.resendAdminOTP(email, otp);
    return mail;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in resend otp", error, false);
  }
}

export const verifyOTPService = async (email, otp) => {
  try {
    const [Admin] = await adminModel.getAdminByEmail(email);
    if (isEmpty(Admin)) {
      throw new ApiError(NOT_FOUND, "Admin");
    }
    if (Admin.otp != otp) {
      throw new ApiError(INVALID, "OTP");
    }

    const AdminVerified = await adminModel.forgotADMINPasswordModel(email, Admin.forgot_code, null);

    return Admin;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in verify otp", error, false);
  }
}

export const resetPasswordService = async (forgot_code, password) => {
  try {
    const [Admin] = await adminModel.getAdminByForgotCode(forgot_code);
    if (isEmpty(Admin)) {
      throw new ApiError(NOT_FOUND, "Admin");
    }
    const hashedPassword = await hashPassword(password);
    const forgot = await adminModel.updateAdminPassword(Admin.admin_id, hashedPassword);
    return;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in reset password", error, false);
  }
}

export const changePasswordService = async (admin_id, old_password, new_password) => {
  try {
    const [existingAdmin] = await adminModel.getAdminById(admin_id);

    if (isEmpty(existingAdmin)) {
      throw new ApiError(NOT_FOUND, "Admin");
    }

    const isPasswordValid = await comparePassword(old_password, existingAdmin.password);

    if (!isPasswordValid) {
      throw new ApiError(INVALID, "Password");
    }

    const hashedPassword = await hashPassword(new_password);
    await adminModel.updateAdminPassword(admin_id, hashedPassword);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in change password service", error, false);
  }
}

export const getAllCoachesServices = async () => {
  try {
    const coaches = await adminModel.getAllCoachesModel();

    if (isEmpty(coaches)) return coaches;

    coaches.map((coach) => {
      coach.profile_image = CustomImagePath(coach.profile_image);
      coach.cv = coach?.cv
        ? coach.cv.split(",").map(path => CustomImagePath(path))
        : [];
      coach.certificate = coach?.certificate
        ? coach.certificate.split(",").map(path => CustomImagePath(path))
        : [];
    })

    return coaches;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get all coaches", error, false);
  }
}

export const getSingleCoachService = async (user_id) => {
  try {
    const [coach] = await adminModel.getSingleCoacheModel(user_id);

    if (isEmpty(coach)) throw new ApiError(NOT_FOUND, "Coach");

    coach.profile_image = CustomImagePath(coach.profile_image);
    // coach.cv = CustomImagePath(coach.cv);
    // coach.certificate = CustomImagePath(coach.certificate);
    coach.cv = coach?.cv
      ? coach.cv.split(",").map(path => CustomImagePath(path))
      : [];
    coach.certificate = coach?.certificate
      ? coach.certificate.split(",").map(path => CustomImagePath(path))
      : [];

    return coach;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get single coach", error, false);
  }
}

export const updateCoachStatusService = async (user_id, status, rejected_reason) => {
  try {
    const [coach] = await adminModel.getSingleCoacheModel(user_id);

    if (isEmpty(coach)) throw new ApiError(NOT_FOUND, "Coach");

    const verification_code = uuidv4();;

    await adminModel.updateCoachStatusModel(user_id, status, rejected_reason, verification_code);

    if (status == "APPROVE") {
      await sendAccountApproveEmail({ email: coach.email, verification_code });
    } else {
      await sendAccountRejectionEmail({ email: coach.email, res: null, rejected_reason });
    }


    return null;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in update coach status", error, false);
  }
}

export const getAllWebinarRegistrationService = async () => {
  try {
    return await adminModel.getAllWebinarRegistrationModel();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get all webinar registration", error, false);
  }
}

export const getSingleWebinarRegistrationService = async (webinar_id) => {
  try {
    const [webinar] = await adminModel.getSingleWebinarRegistrationModel(webinar_id);

    if (isEmpty(webinar)) throw new ApiError(NOT_FOUND, "Webinar Registration");

    return webinar;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get single webinar registration", error, false);
  }
}

export const getAllBootcampRegistrationService = async () => {
  try {
    return await adminModel.getAllBootcampRegistrationModel();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get all bootcamp registration", error, false);
  }
}

export const getSingleBootcampRegistrationService = async (bootcamp_id) => {
  try {
    const [bootcamp] = await adminModel.getSingleBootcampRegistrationModel(bootcamp_id);

    if (isEmpty(bootcamp)) throw new ApiError(NOT_FOUND, "Bootcamp Registration");

    return bootcamp;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get single bootcamp registration", error, false);
  }
}

export const getAllContactUsQueryService = async () => {
  try {
    return await adminModel.getAllContactUsQueryModel();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get all contact us query", error, false);
  }
}


export const createBootcampService = async (data) => {
  try {
    data.points = JSON.stringify(data.points);
    return await adminModel.createBootcampModel(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in create bootcamp", error, false);
  }
}

export const updateBootacmpSessionSpeakersImagesService = async (data) => {
  try {
    const { session_speaker_ids = [], images = [] } = data;

    if (isEmpty(session_speaker_ids) || isEmpty(images)) throw new ApiError(NOT_FOUND, "Session Speaker Ids or Images");

    if (session_speaker_ids.length !== images.length) throw new ApiError(NOT_FOUND, "Session Speaker Ids and Images");

    return await adminModel.updateBootcampSessionSpeakersImagesModel(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in update bootcamp session images", error, false);
  }
}

export const updateBootcampImagesService = async (data) => {
  try {
    const [bootcamp] = await adminModel.getBootcampByIdModel(data.bootcamp_id);

    if (isEmpty(bootcamp)) throw new ApiError(NOT_FOUND, "Bootcamp");

    data.header_image = data.header_image ? data.header_image : bootcamp.header_image;
    data.footer_image = data.footer_image ? data.footer_image : bootcamp.footer_image;
    data.brochure = data.brochure ? data.brochure : bootcamp.brochure;

    let { session_speaker_ids = [], images = [] } = data;

    session_speaker_ids = session_speaker_ids.filter(id => id && id.trim() !== "");


    if (session_speaker_ids.length !== images.length) throw new ApiError(NOT_FOUND, "Session Speaker Ids and Images");

    if (session_speaker_ids.length > 0 && images.length > 0) {
      await adminModel.updateBootcampSessionSpeakersImagesModel(data);
    }

    return await adminModel.updateBootcapImagesModel(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in update bootcamp images", error, false);
  }
}



export const getAllBootcampService = async () => {
  try {
    const bootcamp = await adminModel.getAllBootcampModel();

    if (isEmpty(bootcamp)) return [];

    for (let i = 0; i < bootcamp.length; i++) {
      bootcamp[i].points = JSON.parse(bootcamp[i].points);
      bootcamp[i].header_image = CustomImagePath(bootcamp[i].header_image);
      bootcamp[i].footer_image = CustomImagePath(bootcamp[i].footer_image);
      bootcamp[i].brochure = CustomImagePath(bootcamp[i].brochure);

      const camp = bootcamp[i];

      if (Array.isArray(camp.program_days)) {
        camp.program_days.forEach((day) => {
          if (Array.isArray(day.sessions)) {
            day.sessions.forEach((session) => {
              if (Array.isArray(session.speakers)) {
                session.speakers.forEach((speaker) => {
                  speaker.image = CustomImagePath(speaker.image);
                });
              }
            });
          }
        });
      }
    }

    return bootcamp;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get all bootcamp", error, false);
  }
};


export const getSingleBootcampService = async (bootcamp_id) => {
  try {
    const [bootcamp] = await adminModel.getBootcampByIdModel(bootcamp_id);

    if (isEmpty(bootcamp)) throw new ApiError(NOT_FOUND, "Bootcamp");

    bootcamp.points = JSON.parse(bootcamp.points);
    bootcamp.header_image = CustomImagePath(bootcamp.header_image);
    bootcamp.footer_image = CustomImagePath(bootcamp.footer_image);
    bootcamp.brochure = CustomImagePath(bootcamp.brochure);


    if (Array.isArray(bootcamp.program_days)) {
      bootcamp.program_days.forEach((day) => {
        if (Array.isArray(day.sessions)) {
          day.sessions.forEach((session) => {
            if (Array.isArray(session.speakers)) {
              session.speakers.forEach((speaker) => {
                speaker.image = CustomImagePath(speaker.image);
              });
            }
          });
        }
      });
    }

    return bootcamp;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get single bootcamp", error, false);
  }
}


export const updateBootcampService = async (bootcamp_id, data) => {
  try {
    const [bootcamp] = await adminModel.getBootcampByIdModel(bootcamp_id);

    if (isEmpty(bootcamp)) throw new ApiError(NOT_FOUND, "Bootcamp");


    data.points = JSON.stringify(data.points);


    const { program_days = [] } = data;

    // 1️⃣ Collect only valid speaker IDs (non-null, non-undefined)
    const allSpeakerIds = program_days.flatMap(day =>
      day.sessions.flatMap(session =>
        session.speakers
          .map(speaker => speaker.session_speaker_id)
          .filter(id => id !== null && id !== undefined)
      )
    );

    // 2️⃣ Fetch images only if IDs exist
    let imageMap = new Map();
    if (allSpeakerIds.length > 0) {
      const sessionSpeakers = await adminModel.getBootcampSessionSpeakerByIdsModel(allSpeakerIds);

      // build lookup map { session_speaker_id → image }
      imageMap = new Map(sessionSpeakers.map(s => [s.session_speaker_id, s.image]));
    }

    // 3️⃣ Map images or set null if ID missing / not found
    program_days.forEach(day => {
      day.sessions.forEach(session => {
        session.speakers.forEach(speaker => {
          if (speaker.session_speaker_id && imageMap.has(speaker.session_speaker_id)) {
            speaker.image = imageMap.get(speaker.session_speaker_id);
          } else {
            speaker.image = null;
          }
        });
      });
    });

    // console.log(
    //   'Updated program_days with images:',
    //   JSON.stringify(program_days, null, 2)
    // );



    return await adminModel.updateBootcampModel(bootcamp_id, data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in update bootcamp", error, false);
  }
};

export const deleteBootcampService = async (bootcamp_id) => {
  try {
    const [bootcamp] = await adminModel.getBootcampByIdModel(bootcamp_id);

    if (isEmpty(bootcamp)) throw new ApiError(NOT_FOUND, "Bootcamp");

    return await adminModel.deleteBootcampModel(bootcamp_id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in delete bootcamp", error, false);
  }
}

export const getPublicBootcampService = async () => {
  try {
    const bootcamp = await adminModel.getPublicBootcampModel();

    if (isEmpty(bootcamp)) return [];

    for (let i = 0; i < bootcamp.length; i++) {
      bootcamp[i].points = JSON.parse(bootcamp[i].points);
      bootcamp[i].header_image = CustomImagePath(bootcamp[i].header_image);
      bootcamp[i].footer_image = CustomImagePath(bootcamp[i].footer_image);
      bootcamp[i].brochure = CustomImagePath(bootcamp[i].brochure);

      const camp = bootcamp[i];

      if (Array.isArray(camp.program_days)) {
        camp.program_days.forEach((day) => {
          if (Array.isArray(day.sessions)) {
            day.sessions.forEach((session) => {
              if (Array.isArray(session.speakers)) {
                session.speakers.forEach((speaker) => {
                  speaker.image = CustomImagePath(speaker.image);
                });
              }
            });
          }
        });
      }


    }

    return bootcamp;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get all bootcamp", error, false);
  }
};

export const getBootcampHistoryService = async (bootcamp_id) => {
  try {
    return await adminModel.getBootcampBookingHistoryModel(bootcamp_id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get bootcamp history", error, false);
  }
}

export const getCoachSubscriptionHistoryService = async () => {
  try {
    return await adminModel.getCoachPurchaseSubscriptionHistoryModel();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get coach subscription history", error, false);
  }
}

export const getBootcampWatingListService = async () => {
  try {
    return await adminModel.getBootcampBookingWaitinglistModel();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get bootcamp history", error, false);
  }
}


export const createWorkshopService = async (data) => {
  try {
    data.section_1 = JSON.stringify(data.section_1);
    data.section_2 = JSON.stringify(data.section_2);
    data.section_3 = JSON.stringify(data.section_3);
    data.section_4 = JSON.stringify(data.section_4);
    data.section_5 = JSON.stringify(data.section_5);
    data.section_6 = JSON.stringify(data.section_6);
    return await adminModel.createWorkshopModel(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in create Workshop", error, false);
  }
}

export const updateWorkshopService = async (data) => {
  try {
    data.section_1 = JSON.stringify(data.section_1);
    data.section_2 = JSON.stringify(data.section_2);
    data.section_3 = JSON.stringify(data.section_3);
    data.section_4 = JSON.stringify(data.section_4);
    data.section_5 = JSON.stringify(data.section_5);
    data.section_6 = JSON.stringify(data.section_6);
    return await adminModel.updateWorkshopModel(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in create workshop", error, false);
  }
}

export const createWorkshopSpeakersService = async ({ speakers, images, image1, image2 }) => {
  try {

    if (speakers.length !== images.length) {
      throw new ApiError(CUSTOM_ERROR, 'Speakers count and images count do not match');
    }

    const [workshop] = await adminModel.getWorkshopByIdModel(speakers[0].workshop_id);
    if (isEmpty(workshop)) throw new ApiError(NOT_FOUND, 'Workshop');

    const speakersWithImages = speakers.map((speaker, idx) => ({
      ...speaker,
      image: images[idx] || null,
    }));

    const images2 = await adminModel.updateWorkshop2ImagesModel({ workshop_id: speakers[0].workshop_id, image1, image2 });


    // Pass the array to your model for bulk insert/update
    return await adminModel.createWorkshopSpeakersModel(speakersWithImages);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, 'Error in create workshop speakers', error, false);
  }
};

export const updateWorkshopSpeakersService = async ({ speakers, images, image1, image2 }) => {
  try {
    if (!Array.isArray(speakers) || !Array.isArray(images)) {
      throw new ApiError(CUSTOM_ERROR, 'Speakers and images must be arrays');
    }

    // Ensure workshop exists
    const [workshop] = await adminModel.getWorkshopByIdModel(speakers[0].workshop_id);
    if (isEmpty(workshop)) {
      throw new ApiError(NOT_FOUND, 'Workshop not found');
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

    const images2 = await adminModel.updateWorkshop2ImagesModel({ workshop_id: speakers[0].workshop_id, image1: image1 ? image1 : workshop.image1, image2: image2 ? image2 : workshop.image2 });


    // Pass updated speakers to model
    return await adminModel.updateWorkshopSpeakersModel(updatedSpeakers);
    return null;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, 'Error updating workshop speakers', error, false);
  }
};


export const getAllMyWorkshopsService = async (user_id) => {
  try {
    const workshops = await adminModel.getWorkshopByUserIdModel(user_id);

    if (!isEmpty(workshops)) {
      workshops.forEach((workshop) => {
        workshop.section_1 = typeof workshop?.section_1 === "string" ? JSON.parse(workshop.section_1) : workshop.section_1 || {};
        workshop.section_2 = typeof workshop?.section_2 === "string" ? JSON.parse(workshop.section_2) : workshop.section_2 || {};
        workshop.section_3 = typeof workshop?.section_3 === "string" ? JSON.parse(workshop.section_3) : workshop.section_3 || {};
        workshop.section_4 = typeof workshop?.section_4 === "string" ? JSON.parse(workshop.section_4) : workshop.section_4 || {};
        workshop.section_5 = typeof workshop?.section_5 === "string" ? JSON.parse(workshop.section_5) : workshop.section_5 || {};
        workshop.section_6 = typeof workshop?.section_6 === "string" ? JSON.parse(workshop.section_6) : workshop.section_6 || {};

        workshop?.speakers?.forEach((speaker) => {
          speaker.image = CustomImagePath(speaker.image);
        });

        workshop.image1 = CustomImagePath(workshop.image1);
        workshop.image2 = CustomImagePath(workshop.image2);
      });

    }

    return workshops
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, 'Error in get all my workshops', error, false);
  }
};

export const getWorkshopByIdService = async (workshop_id) => {
  try {
    const workshops = await adminModel.getWorkshopByIdModel(workshop_id);

    if (isEmpty(workshops)) throw new ApiError(NOT_FOUND, 'Workshop');

    for (const workshop of workshops) {
      // Safely parse JSON sections
      workshop.section_1 = typeof workshop?.section_1 === "string" ? JSON.parse(workshop.section_1) : workshop.section_1 || {};
      workshop.section_2 = typeof workshop?.section_2 === "string" ? JSON.parse(workshop.section_2) : workshop.section_2 || {};
      workshop.section_3 = typeof workshop?.section_3 === "string" ? JSON.parse(workshop.section_3) : workshop.section_3 || {};
      workshop.section_4 = typeof workshop?.section_4 === "string" ? JSON.parse(workshop.section_4) : workshop.section_4 || {};
      workshop.section_5 = typeof workshop?.section_5 === "string" ? JSON.parse(workshop.section_5) : workshop.section_5 || {};
      workshop.section_6 = typeof workshop?.section_6 === "string" ? JSON.parse(workshop.section_6) : workshop.section_6 || {};


      // Format speaker images
      workshop?.speakers?.forEach((speaker) => {
        speaker.image = CustomImagePath(speaker.image);
      });

      workshop.image1 = CustomImagePath(workshop.image1);
      workshop.image2 = CustomImagePath(workshop.image2);

      // Fetch and attach coach info if not admin
      if (workshop.is_admin == 0) {
        const [speakers] = await adminModel.getSingleCoacheModel(workshop.user_id);

        speakers.profile_image = CustomImagePath(speakers.profile_image);
        // speakers.cv = CustomImagePath(speakers.cv);
        // speakers.certificate = CustomImagePath(speakers.certificate);
        speakers.cv = speakers?.cv
          ? speakers.cv.split(",").map(path => CustomImagePath(path))
          : [];
        speakers.certificate = speakers?.certificate
          ? speakers.certificate.split(",").map(path => CustomImagePath(path))
          : [];

        workshop.coach = speakers;
      }
    }

    return workshops[0];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, 'Error in get workshop by id', error, false);
  }
};


export const getFutureWorkshopsService = async (user_id) => {
  try {
    const workshops = await adminModel.getFutureWorkshopModel(user_id);

    if (!isEmpty(workshops)) {
      workshops.forEach((workshop) => {
        workshop.section_1 = typeof workshop?.section_1 === "string" ? JSON.parse(workshop.section_1) : workshop.section_1 || {};
        workshop.section_2 = typeof workshop?.section_2 === "string" ? JSON.parse(workshop.section_2) : workshop.section_2 || {};
        workshop.section_3 = typeof workshop?.section_3 === "string" ? JSON.parse(workshop.section_3) : workshop.section_3 || {};
        workshop.section_4 = typeof workshop?.section_4 === "string" ? JSON.parse(workshop.section_4) : workshop.section_4 || {};
        workshop.section_5 = typeof workshop?.section_5 === "string" ? JSON.parse(workshop.section_5) : workshop.section_5 || {};
        workshop.section_6 = typeof workshop?.section_6 === "string" ? JSON.parse(workshop.section_6) : workshop.section_6 || {};

        workshop?.speakers?.forEach((speaker) => {
          speaker.image = CustomImagePath(speaker.image);
        });

        workshop.image1 = CustomImagePath(workshop.image1);
        workshop.image2 = CustomImagePath(workshop.image2);
      });

    }

    return workshops
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, 'Error in get all my workshops', error, false);
  }
};


export const getAllWorkshopsAdminService = async () => {
  try {
    const workshops = await adminModel.getAllWorkshopModel();

    if (!isEmpty(workshops)) {
      for (const workshop of workshops) {
        workshop.section_1 = typeof workshop?.section_1 === "string" ? JSON.parse(workshop.section_1) : workshop.section_1 || {};
        workshop.section_2 = typeof workshop?.section_2 === "string" ? JSON.parse(workshop.section_2) : workshop.section_2 || {};
        workshop.section_3 = typeof workshop?.section_3 === "string" ? JSON.parse(workshop.section_3) : workshop.section_3 || {};
        workshop.section_4 = typeof workshop?.section_4 === "string" ? JSON.parse(workshop.section_4) : workshop.section_4 || {};
        workshop.section_5 = typeof workshop?.section_5 === "string" ? JSON.parse(workshop.section_5) : workshop.section_5 || {};
        workshop.section_6 = typeof workshop?.section_6 === "string" ? JSON.parse(workshop.section_6) : workshop.section_6 || {};


        workshop?.speakers?.forEach((speaker) => {
          speaker.image = CustomImagePath(speaker.image);
        });
        workshop.image1 = CustomImagePath(workshop.image1);
        workshop.image2 = CustomImagePath(workshop.image2);

        if (workshop.is_admin == 0) {
          const [speakers] = await adminModel.getSingleCoacheModel(workshop.user_id);

          speakers.profile_image = CustomImagePath(speakers.profile_image);
          // speakers.cv = CustomImagePath(speakers.cv);
          // speakers.certificate = CustomImagePath(speakers.certificate);
          speakers.cv = speakers?.cv
            ? speakers.cv.split(",").map(path => CustomImagePath(path))
            : [];
          speakers.certificate = speakers?.certificate
            ? speakers.certificate.split(",").map(path => CustomImagePath(path))
            : [];
          workshop.coach = speakers;
        }
      }
    }


    return workshops
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, 'Error in get all my workshops', error, false);
  }
};

export const deleteWorkshopService = async (workshop_id) => {
  try {
    const workshop = await adminModel.getWorkshopByIdModel(workshop_id);
    if (isEmpty(workshop)) throw new ApiError(NOT_FOUND, 'Workshop');

    return await adminModel.deleteWorkshopModel(workshop_id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, 'Error in delete workshop', error, false);
  }
};


export const getAllOpenTalentServices = async () => {
  try {
    const coaches = await adminModel.getAllOpenTalentModel();

    if (isEmpty(coaches)) return coaches;

    coaches.map((coach) => {
      coach.profile_image = CustomImagePath(coach.profile_image);
      coach.cv = coach?.cv
        ? coach.cv.split(",").map(path => CustomImagePath(path))
        : [];
      coach.certificates = coach?.certificates
        ? coach.certificates.map(item => ({
          ...item,
          file: CustomImagePath(item.file)
        }))
        : [];


      coach.projects = coach?.projects
        ? coach.projects.map(item => ({
          ...item,
          project_url: CustomImagePath(item.project_url)
        }))
        : [];
    })

    return coaches;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get all coaches", error, false);
  }
}

export const getOpenTalentByIdServices = async (user_id) => {
  try {
    const coaches = await adminModel.getOpenTalentByIdModel(user_id);

    if (isEmpty(coaches)) {
      throw new ApiError(NOT_FOUND, "User");
    }

    coaches.map((coach) => {
      coach.profile_image = CustomImagePath(coach.profile_image);
      coach.cv = coach?.cv
        ? coach.cv.split(",").map(path => CustomImagePath(path))
        : [];
      coach.certificates = coach?.certificates
        ? coach.certificates.map(item => ({
          ...item,
          file: CustomImagePath(item.file)
        }))
        : [];


      coach.projects = coach?.projects
        ? coach.projects.map(item => ({
          ...item,
          project_url: CustomImagePath(item.project_url)
        }))
        : [];
    })

    return coaches[0];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get all coaches", error, false);
  }
}

export const getAllOffersServices = async () => {
  try {
    const offers = await adminModel.getAllOffersModel();

    if (isEmpty(offers)) return offers;

    offers.map((offer) => {
      offer.profile_image = CustomImagePath(offer.profile_image);
    });

    return offers;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get all offers", error, false);
  }
}

export const getOffersByIdServices = async (offer_id) => {
  try {
    const offers = await adminModel.getOffersByIdModel(offer_id);

    if (isEmpty(offers)) {
      throw new ApiError(NOT_FOUND, "Offer");
    };

    offers.map((offer) => {
      offer.profile_image = CustomImagePath(offer.profile_image);
    });

    return offers[0];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in get all offers", error, false);
  }
}

export const switchBlockUnblockService = async (user_id) => {
  try {

    const [user] = await commonModel.getUserById(user_id);
    if (isEmpty(user)) throw new ApiError(NOT_FOUND, "User");

    const is_active = !user.is_active

    const result = await adminModel.switchBlockUnblockModel(is_active, user_id);

    return is_active;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in switch block unblock", error, false);
  }
}

export const createContentService = async (data) => {
  try {
    return await adminModel.createContentModel(data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, 'Error in create content', error, false);
  }
}

export const getAllContentService = async (content_type,category_id,view) => {
  try {
    const contents = await adminModel.getAllContentsModel(content_type,category_id,view);

    contents?.forEach((content) => {
      if (Array.isArray(content.files) && content.files.length > 0) {
        content.files = content.files.map((file) => ({
          ...file,
          file: CustomImagePath(file.file) // ✅ map full file path
        }));
      }
      content.image = CustomImagePath(content.image);
    });

    return contents;

  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      CUSTOM_ERROR,
      "Error in get all contents",
      error,
      false
    );
  }
};

export const updateContentService = async (content_id, data) => {
  try {
    const content = await adminModel.getContentByIdModel(content_id);
    if (isEmpty(content)) throw new ApiError(NOT_FOUND, "Content");

    if(isEmpty(data.image)){
      data.image = content.image
    }

    return await adminModel.updateContentModel(content_id, data);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in update content", error, false);
  }
};

export const getContentByUserIdService = async (user_id,content_type, view) => {
  try {
    const contents = await adminModel.getContentByUserIdModel(user_id,content_type, view);

    contents?.forEach((content) => {
      if (Array.isArray(content.files) && content.files.length > 0) {
        content.files = content.files.map((file) => ({
          ...file,
          file: CustomImagePath(file.file) // ✅ map full file path
        }));
      }
       content.image = CustomImagePath(content.image);
    });

    return contents;

  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      CUSTOM_ERROR,
      "Error in get all contents",
      error,
      false
    );
  }
};

export const getContentByContentIdService = async (content_id) => {
  try {
    const contents = await adminModel.getContentByIdModel(content_id);

    if(isEmpty(contents)) throw new ApiError(NOT_FOUND, "Content");

      if (Array.isArray(contents.files) && contents.files.length > 0) {
        contents.files = contents.files.map((file) => ({
          ...file,
          file: CustomImagePath(file.file) // ✅ map full file path
        }));
      }

       contents.image = CustomImagePath(contents.image);

    return contents;

  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      CUSTOM_ERROR,
      "Error in get all contents",
      error,
      false
    );
  }
};

export const deleteContentService = async (content_id) => {
  try {
    const content = await adminModel.getContentByIdModel(content_id);
    if (isEmpty(content)) throw new ApiError(NOT_FOUND, "Content");
    return await adminModel.deleteContentModel(content_id);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(CUSTOM_ERROR, "Error in delete content", error, false);
  }
}