import db from "../config/db.js";
import { ApiError } from "../utils/api.util.js";
import { DB_ERROR } from "../utils/message.util.js";
import { isEmpty } from "../utils/misc.util.js";

export const getUserByEmail = async (email, role) => {
    try {
        return await db.query(`SELECT * FROM users WHERE email = $1 AND is_deleted = false AND role = $2`, [email, role]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Checking Admin", error, false);
    }
};

export const getUserById = async (user_id) => {
    try {
        const user = await db.query(`SELECT * FROM users WHERE user_id = $1`, [user_id]);
        if (isEmpty(user)) user;
        if (user[0].role == "COACH") {
            [user[0].coach] = await db.query(`SELECT * FROM coaches WHERE user_id = $1`, [user_id]);
        }else if (user[0].role == "OPEN_TALENT") {
            [user[0].open_talent] = await db.query(`SELECT 
    ot.*,

    -- Projects Array
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'open_talent_project_id', p.open_talent_project_id,
                'project_url', p.project_url,
                'created_at', p.created_at
            )
        ) FILTER (WHERE p.open_talent_project_id IS NOT NULL),
        '[]'
    ) AS projects,

    -- Certificates Array
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'certificate_id', c.certificate_id,
                'file', c.file,
                'created_at', c.created_at
            )
        ) FILTER (WHERE c.certificate_id IS NOT NULL),
        '[]'
    ) AS certificates

FROM open_talent ot
LEFT JOIN open_talent_projects p 
    ON ot.user_id = p.user_id
LEFT JOIN certificates c 
    ON ot.user_id = c.user_id

WHERE ot.user_id = $1
GROUP BY ot.open_talent_id
`, [user_id]);
        }
        return user;
    } catch (error) {
        throw new ApiError(DB_ERROR, "Checking Admin", error, false);
    }
};

export const createCoach = async (userData) => {
    try {
        const {
            full_name,
            email,
            category_id,
            format,
            tagline,
            bio,
            reason,
            year_of_experience,
            verification_code,
            phone_number,
            cv,
            certificate,
            profile_image
        } = userData;

        // Insert into users and RETURNING id
        const userResult = await db.query(
            `INSERT INTO users (full_name, email, role, verification_code, phone_number,profile_image)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING user_id`,
            [full_name, email, "COACH", verification_code, phone_number,profile_image]
        );

        const userId = userResult[0].user_id;

        // Insert into coaches
        const coachResult = await db.query(
            `INSERT INTO coaches (user_id, category_id, format, tagline, bio, reason, year_of_experience, cv, certificate)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [userId, category_id, format, tagline, bio, reason, year_of_experience, cv, certificate]
        );

        return coachResult;
    } catch (error) {
        throw new ApiError(DB_ERROR, "Creating Coach", error, false);
    }
};


export const getUserByVerificationCode = async (verification_code) => {
    try {
        return await db.query(`SELECT * FROM users WHERE verification_code = $1`, [verification_code]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Checking Admin", error, false);
    }
};

export const userVerified = async (user_id) => {
    try {
        return await db.query(
            `UPDATE users SET is_verified = TRUE, verification_code = NULL,status = 'APPROVE' WHERE user_id = $1`,
            [user_id]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating User", error, false);
    }
};

export const forgotPasswordModel = async (email, forgot_code, otp,role) => {
    try {
        return await db.query(
            `UPDATE users SET forgot_code = $1, otp = $2 WHERE email = $3 AND role = $4`,
            [forgot_code, otp, email, role]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Checking Admin", error, false);
    }
};

export const resendUserOTP = async (email, otp,role) => {
    try {
        return await db.query(
            `UPDATE users SET otp = $1 WHERE email = $2 AND role = $3`,
            [otp, email,role]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating User OTP", error, false);
    }
};

export const getUserByForgotCode = async (forgot_code) => {
    try {
        console.log(forgot_code);
        return await db.query(`SELECT * FROM users WHERE forgot_code = $1`, [forgot_code]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Checking User", error, false);
    }
};

export const updatePassword = async (user_id, password) => {
    try {
        return await db.query(
            `UPDATE users SET password = $1, forgot_code = NULL WHERE user_id = $2`,
            [password, user_id]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating User", error, false);
    }
};


export const disabledMyAccountModel = async (user_id) => {
    try {
        return await db.query(`UPDATE users SET is_disabled = true WHERE user_id = $1`, [user_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating User", error, false);
    }
};

export const enableMyAccountModel = async (user_id) => {
    try {
        return await db.query(`UPDATE users SET is_disabled = false WHERE user_id = $1`, [user_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating User", error, false);
    }
};


export const deleteMyAccountModel = async (user_id) => {
    try {
        return await db.query(`UPDATE users SET is_deleted = true WHERE user_id = $1`, [user_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating User", error, false);
    }
};