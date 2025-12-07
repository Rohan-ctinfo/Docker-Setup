import db from "../config/db.js";
import { ApiError } from "../utils/api.util.js";
import { DB_ERROR } from "../utils/message.util.js";

export const webinarRegistrationModel = async (first_name, last_name, email, phone_number, linkedin_url, role, source, webinar_id) => {
    try {
        return await db.query(
            `INSERT INTO webinar_registrations (first_name,last_name,email,phone_number,linkedin_url,role,source,webinar_id) VALUES ($1, $2, $3,  $4, $5, $6, $7,$8)`,
            [first_name, last_name, email, phone_number, linkedin_url, role, source, webinar_id]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Interval server error", error, false);
    }
}

export const getWebinarRegistrationByEmail = async (email) => {
    try {
        // Use IS NULL instead of = null
        return await db.query(
            `SELECT * FROM webinar_registrations WHERE email = $1 AND webinar_id IS NULL`,
            [email]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Error checking webinar registration by email", error, false);
    }
};

export const getWebinarRegistrationByEmailAndWebinarId = async (email, webinar_id) => {
    try {
        return await db.query(
            `SELECT * FROM webinar_registrations WHERE email = $1 AND webinar_id = $2`,
            [email, webinar_id]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Error checking webinar registration by email and webinar ID", error, false);
    }
};



export const contactUs = async (full_name, email, phone_number, address, subject, message, latitude, longitude) => {
    try {
        return await db.query(
            `INSERT INTO contact (full_name, email,phone_number,address,subject,message,latitude,longitude) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [full_name, email, phone_number, address, subject, message, latitude, longitude]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Contact Us", error, false);
    }
};

export const bootcampRegistrationModel = async (name, email, timezone, notes) => {
    try {
        return await db.query(
            `INSERT INTO bootcamp_registrations (name,email,timezone ,notes ) VALUES ($1, $2, $3, $4)`,
            [name, email, timezone, notes]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Bootcamp Registration", error, false);
    }
}


export const getbootcampRegistrationByEmail = async (email) => {
    try {
        return await db.query(`SELECT * FROM bootcamp_registrations WHERE email = $1`, [email]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Get Bootcamp", error, false);
    }
}


export const bulkUpdateReminderEmails = async (
    webinar24hIds = [],
    webinar1hIds = [],
    bootcamp24hIds = [],
    bootcamp1hIds = []
) => {
    try {
        const queries = [];

        // Webinar updates
        if (webinar24hIds.length || webinar1hIds.length) {
            const sets = [];
            if (webinar24hIds.length) {
                sets.push(`
                    reminder_24h_sent = CASE webinar_registration_id
                        ${webinar24hIds.map(id => `WHEN ${id} THEN true`).join(' ')}
                        ELSE reminder_24h_sent
                    END
                `);
            }
            if (webinar1hIds.length) {
                sets.push(`
                    reminder_1h_sent = CASE webinar_registration_id
                        ${webinar1hIds.map(id => `WHEN ${id} THEN true`).join(' ')}
                        ELSE reminder_1h_sent
                    END
                `);
            }

            const allWebinarIds = [...webinar24hIds, ...webinar1hIds];
            const sql = `
                UPDATE webinar_registrations
                SET ${sets.join(', ')}
                WHERE webinar_registration_id = ANY($1::int[])
            `;
            queries.push(db.query(sql, [allWebinarIds]));
        }

        // Bootcamp updates
        if (bootcamp24hIds.length || bootcamp1hIds.length) {
            const sets = [];
            if (bootcamp24hIds.length) {
                sets.push(`
                    reminder_24h_sent = CASE bootcamp_id
                        ${bootcamp24hIds.map(id => `WHEN ${id} THEN true`).join(' ')}
                        ELSE reminder_24h_sent
                    END
                `);
            }
            if (bootcamp1hIds.length) {
                sets.push(`
                    reminder_1h_sent = CASE bootcamp_id
                        ${bootcamp1hIds.map(id => `WHEN ${id} THEN true`).join(' ')}
                        ELSE reminder_1h_sent
                    END
                `);
            }

            const allBootcampIds = [...bootcamp24hIds, ...bootcamp1hIds];
            const sql = `
                UPDATE bootcamp_registrations
                SET ${sets.join(', ')}
                WHERE bootcamp_id = ANY($1::int[])
            `;
            queries.push(db.query(sql, [allBootcampIds]));
        }

        if (queries.length) await Promise.all(queries);
    } catch (error) {
        throw new ApiError('DB_ERROR', 'Bulk update reminders', error, false);
    }
};

// Fetch both 24H and 1H webinar reminders in one query
export const getWebinarEmailNotificationData = async () => {
    try {
        const results = await db.query(`
            SELECT wr.*,w.schedule_date FROM webinar_registrations wr LEFT JOIN webinar w ON wr.webinar_id = w.webinar_id
            WHERE reminder_24h_sent = false OR reminder_1h_sent = false
        `);
        return results;
    } catch (error) {
        throw new ApiError(DB_ERROR, "Get Webinar", error, false);
    }
}

// Fetch both 24H and 1H bootcamp reminders in one query
export const getBootcampEmailNotificationData = async () => {
    try {
        const results = await db.query(`
            SELECT * FROM bootcamp_registrations 
            WHERE reminder_24h_sent = false OR reminder_1h_sent = false
        `);
        return results;
    } catch (error) {
        throw new ApiError(DB_ERROR, "Get Bootcamp", error, false);
    }
}

export const getCategoriesModel = async () => {
    try {
        const results = await db.query(`SELECT * FROM categories`);
        return results;
    } catch (error) {
        throw new ApiError(DB_ERROR, "Get Categories", error, false);
    }
}

export const getSubscriptionPlansModel = async () => {
    try {
        return await db.query(`
            SELECT 
                s.subscription_id,
                s.price,
                s.title,
                s.description,
                s.subscription_days,
                s.created_at,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'detail_id', sd.detail_id,
                        'feature_name', sd.feature_name,
                        'created_at', sd.created_at
                    )
                ) AS details
            FROM subscriptions s
            LEFT JOIN subscription_details sd ON s.subscription_id = sd.subscription_id
            WHERE s.subscription_type = 'COACH'
            GROUP BY s.subscription_id
            ORDER BY s.subscription_id ASC
        `);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Get Subscription Plans", error, false);
    }
};

export const getbootcampBookingsByEmail = async (email, bootcamp_id) => {
    try {
        return await db.query(`SELECT * FROM bootcamp_bookings WHERE email = $1 AND bootcamp_id = $2`, [email, bootcamp_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Get Bootcamp", error, false);
    }
}

export const bootcampBookingsModel = async ({ first_name, last_name, email, phone_number, bootcamp_id, total_price }) => {
    try {
        return await db.query(
            `INSERT INTO bootcamp_bookings (first_name,last_name,email,phone_number,bootcamp_id,total_price) VALUES ($1, $2, $3,  $4, $5, $6)`,
            [first_name, last_name, email, phone_number, bootcamp_id, total_price]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Bootcamp Bookings", error, false);
    }
}

export const getBootcampWaitinglistByEmail = async (email, bootcamp_id) => {
    try {
        return await db.query(
            `SELECT * FROM bootcamp_waitinglists WHERE email = $1 AND bootcamp_id = $2`,
            [email, bootcamp_id]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Get Bootcamp Waitinglist", error, false);
    }
};

// Insert new waiting list entry
export const bootcampWaitinglistModel = async ({
    bootcamp_id,
    name,
    email,
    phone_number,
    notes
}) => {
    try {
        return await db.query(
            `INSERT INTO bootcamp_waitinglists (bootcamp_id, name, email, phone_number, notes)
       VALUES ($1, $2, $3, $4, $5)`,
            [bootcamp_id, name, email, phone_number, notes]
        );
    } catch (error) {
        throw new ApiError(DB_ERROR, "Bootcamp Waitinglist", error, false);
    }
};

export const getAllCoachesModel = async () => {
    try {
        return await db.query(`
            SELECT 
                u.*, 
                c.*, 
                c1.category_name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'purchase_id', ps.purchase_id,
                            'subscription_id', ps.subscription_id,
                            'purchase_date', ps.purchase_date,
                            'expiry_date', ps.expiry_date,
                            'total_price', ps.total_price,
                            'title', s.title,
                            'subscription_days', s.subscription_days,
                            'created_at', s.created_at,
                            'is_active', CASE 
                                WHEN ps.expiry_date >= NOW() THEN true
                                ELSE false
                            END
                        )
                    ) FILTER (WHERE ps.purchase_id IS NOT NULL), '[]'
                ) AS subscriptions
            FROM users u
            JOIN coaches c ON u.user_id = c.user_id
            JOIN categories c1 ON c.category_id = c1.category_id
            LEFT JOIN purchase_subscription ps ON ps.user_id = u.user_id
            LEFT JOIN subscriptions s ON s.subscription_id = ps.subscription_id
            WHERE u.role = 'COACH' AND u.status = 'APPROVE' AND u.is_deleted = false AND u.is_disabled = false
            GROUP BY u.user_id, c.coach_id,c1.category_name
            ORDER BY u.created_at DESC
        `);
    } catch (error) {
        throw new ApiError(DB_ERROR, "All Coaches with Subscriptions", error, false);
    }
};

export const registerOpenTalentModel = async ({first_name, last_name, email, password,talent_type}) => {
    try {
        const user =  await db.query(`
            INSERT INTO users (first_name, last_name, email, password, role,status,signup_step,is_verified)
            VALUES ($1, $2, $3, $4, 'OPEN_TALENT', 'APPROVE',1,true)
            RETURNING user_id
        `, [first_name, last_name, email, password]);

        return await db.query(`
            INSERT INTO open_talent (user_id,talent_type)
            VALUES ($1, $2)
        `, [user[0].user_id,talent_type]);

    } catch (error) {
        throw new ApiError(DB_ERROR, "Register Open Talent", error, false);
    }
};

export const getSubscriptionPlansForOpenTalentModel = async () => {
    try {
        return await db.query(`
            SELECT 
                s.subscription_id,
                s.price,
                s.title,
                s.description,
                s.subscription_days,
                s.created_at,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'detail_id', sd.detail_id,
                        'feature_name', sd.feature_name,
                        'created_at', sd.created_at
                    )
                ) AS details
            FROM subscriptions s
            LEFT JOIN subscription_details sd ON s.subscription_id = sd.subscription_id
            WHERE s.subscription_type = 'OPEN_TALENT'
            GROUP BY s.subscription_id
            ORDER BY s.subscription_id ASC
        `);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Get Subscription Plans", error, false);
    }
};