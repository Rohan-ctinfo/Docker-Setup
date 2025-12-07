import db from "../config/db.js";
import { ApiError } from "../utils/api.util.js";
import { DB_ERROR } from "../utils/message.util.js";

export const getFreelancerByEmail = async (email) => {
    try {
        return await db.query(
            `SELECT * FROM users WHERE email = $1 AND role = 'OPEN_TALENT'`,
            [email]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Checking FREELANCER", error, false);
    }
};

export const getEmailByVerificationCode = async (verification_code) => {
    try {
        return await db.query(
            `SELECT * FROM users WHERE verification_code = $1`,
            [verification_code]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Checking FREELANCER", error, false);
    }
};


export const verifyEmailAddressModel = async (verification_code) => {
    try {
        return await db.query(
            `UPDATE users SET is_verified = true WHERE verification_code = $1 `,
            [verification_code]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Checking FREELANCER", error, false);
    }
};

export const updateTalentTypeModel = async (user_id, talent_type) => {
    try {
        const openTalent = await db.query(
            `UPDATE open_talent SET talent_type = $1 WHERE user_id = $2 RETURNING *`,
            [talent_type, user_id]
        );
        return await db.query(
            `UPDATE users set signup_step = 1 WHERE user_id = $1 RETURNING *`,
            [user_id]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Checking FREELANCER", error, false);
    }
};

export const updateStep2Model = async ({ talent_role, location, bio, user_id }) => {
    try {
        const openTalent = await db.query(
            `UPDATE open_talent SET talent_role = $1, location = $2, bio = $3 WHERE user_id = $4 RETURNING *`,
            [talent_role, location, bio, user_id]
        );
        return await db.query(
            `UPDATE users set signup_step = 2 WHERE user_id = $1 RETURNING *`,
            [user_id]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating Step 2", error, false);
    }
}

export const updateStep3Model = async ({ skills, language, user_id, certificates }) => {
    try {
        const openTalent = await db.query(
            `UPDATE open_talent SET skills = $1, language = $2 WHERE user_id = $3 RETURNING *`,
            [skills, language, user_id]
        );

        await db.query(`DELETE FROM certificates WHERE user_id = $1`, [user_id]);

        if (certificates && certificates.length > 0) {
            const values = certificates
                .map((_, index) => `($1, $${index + 2})`)
                .join(", ");

            await db.query(
                `INSERT INTO certificates (user_id, file) VALUES ${values}`,
                [user_id, ...certificates]
            );
        }


        return await db.query(
            `UPDATE users set signup_step = 3 WHERE user_id = $1 RETURNING *`,
            [user_id]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating Step 3", error, false);
    }
}

export const updateStep4Model = async ({ cv, user_id, website_or_portfolio, projects }) => {
    try {
        const openTalent = await db.query(
            `UPDATE open_talent SET cv = $1, website_or_portfolio = $2 WHERE user_id = $3 RETURNING *`,
            [cv, website_or_portfolio, user_id]
        );

        await db.query(`DELETE FROM open_talent_projects WHERE user_id = $1`, [user_id]);

        if (projects && projects.length > 0) {
            const values = projects
                .map((_, index) => `($1, $${index + 2})`)
                .join(", ");

            await db.query(
                `INSERT INTO open_talent_projects (user_id, project_url) VALUES ${values}`,
                [user_id, ...projects]
            );
        }


        return await db.query(
            `UPDATE users set signup_step = 4 WHERE user_id = $1 RETURNING *`,
            [user_id]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating Step 4", error, false);
    }
}

export const updateStep5Model = async ({ search_status, salary_preference, user_id, job_type }) => {
    try {
        const openTalent = await db.query(
            `UPDATE open_talent SET search_status = $1, salary_preference = $2, job_type = $3 WHERE user_id = $4 RETURNING *`,
            [search_status, salary_preference, job_type, user_id]
        );
        return await db.query(
            `UPDATE users set signup_step = 5 WHERE user_id = $1 RETURNING *`,
            [user_id]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating Step 5", error, false);
    }
}

// export const openTalentProfileUpdateModel = async (user_id, data) => {
//     try {
//         const {first_name,last_name,talent_role,location,bio,skills,language,website_or_portfolio,search_status,salary_preference,job_type,phone_number,dob,gender,country,city,state,address_1,address_2,zip_code,time_zone,certificates,cv,projects,certificates_ids,project_ids } = data;
//        const user = await db.query(
//            `UPDATE users SET settings = $1 WHERE user_id = $2 RETURNING *`,
//            [data, user_id]
//        )

//        const openTalent = await db.query()

//     } catch (error) {
//         throw new ApiError(DB_ERROR, "Updating Setting", error, false);
//     }
// }

export const openTalentProfileUpdateModel = async (user_id, data) => {
    try {
        const {
            first_name,
            last_name,
            phone_number,
            dob,
            gender,
            time_zone,
            profile_image,

            talent_role,
            location,
            bio,
            skills,
            language,
            website_or_portfolio,
            search_status,
            salary_preference,
            job_type,
            cv,

            country,
            state,
            city,
            address_1,
            address_2,
            zip_code,

            certificates,
            certificates_ids,
            projects,
            project_ids,
        } = data;

        // -------------------------
        // UPDATE USERS TABLE
        // -------------------------
        await db.query(
            `UPDATE users 
             SET first_name = $1,
                 last_name = $2,
                 phone_number = $3,
                 dob = $4,
                 gender = $5,
                 time_zone = $6,
                 profile_image = $7
             WHERE user_id = $8`,
            [
                first_name,
                last_name,
                phone_number,
                dob,
                gender,
                time_zone,
                profile_image,
                user_id,
            ]
        );

        // -------------------------
        // UPDATE OPEN TALENT TABLE
        // -------------------------
        await db.query(
            `UPDATE open_talent SET
                talent_role = $1,
                location = $2,
                bio = $3,
                skills = $4,
                language = $5,
                website_or_portfolio = $6,
                search_status = $7,
                salary_preference = $8,
                job_type = $9,
                cv = $10,
                country = $11,
                state = $12,
                city = $13,
                address_1 = $14,
                address_2 = $15,
                zip_code = $16
             WHERE user_id = $17`,
            [
                talent_role,
                location,
                bio,
                skills,
                language,
                website_or_portfolio,
                search_status,
                salary_preference,
                job_type,
                cv,
                country,
                state,
                city,
                address_1,
                address_2,
                zip_code,
                user_id,
            ]
        );

        // -------------------------
        // UPDATE CERTIFICATES
        // -------------------------
        if (certificates_ids && certificates_ids.length > 0) {
            const placeholders = certificates_ids.map((_, i) => `$${i + 2}`).join(",");
            await db.query(
                `DELETE FROM certificates 
         WHERE user_id = $1 
         AND certificate_id IN (${placeholders})`,
                [user_id, ...certificates_ids]
            );
        }

        if (certificates && certificates.length > 0) {
            const values = certificates
                .map((_, i) => `($1, $${i + 2})`)
                .join(", ");

            await db.query(
                `INSERT INTO certificates (user_id, file)
                 VALUES ${values}`,
                [user_id, ...certificates]
            );
        }

        // -------------------------
        // UPDATE PROJECTS
        // -------------------------
        if (project_ids && project_ids.length > 0) {
            const placeholders = project_ids.map((_, i) => `$${i + 2}`).join(",");
            await db.query(
                `DELETE FROM open_talent_projects 
         WHERE user_id = $1 
         AND open_talent_project_id IN (${placeholders})`,
                [user_id, ...project_ids]
            );
        }


        if (projects && projects.length > 0) {
            const values = projects
                .map((_, i) => `($1, $${i + 2})`)
                .join(", ");

            await db.query(
                `INSERT INTO open_talent_projects (user_id, project_url)
                 VALUES ${values}`,
                [user_id, ...projects]
            );
        }

        return { message: "Open Talent Profile Updated Successfully" };

    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating Setting", error, false);
    }
};

