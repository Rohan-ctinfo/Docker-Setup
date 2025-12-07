import db from "../config/db.js";
import { ApiError } from "../utils/api.util.js";
import { DB_ERROR } from "../utils/message.util.js";


export const getCoachByUserId = async (user_id) => {
    try {
        return await db.query(`SELECT * FROM users LEFT JOIN coaches ON users.user_id = coaches.user_id WHERE users.user_id = $1 AND users.role = 'COACH'`, [user_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Checking Coach", error, false);
    }
};

export const getCoachByVerificationCode = async (verification_code) => {
    try {
        return await db.query(`SELECT * FROM users LEFT JOIN coaches ON users.user_id = coaches.user_id WHERE users.verification_code = $1 AND users.role = 'COACH'`, [verification_code]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Checking Coach", error, false);
    }
};

export const updateUserPasswordModel = async (user_id, hashedPassword) => {
    try {
        return await db.query(`UPDATE users SET password = $1, verification_code = NULL WHERE user_id = $2`, [hashedPassword, user_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating User", error, false);
    }
};

export const getSubscriptionPlansByIdModel = async (subscription_id) => {
    try {
        return await db.query(`SELECT * FROM subscriptions WHERE subscription_id = $1`, [subscription_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Getting Subscription Plans", error, false);
    }
};


export const addSubscriptionPlanModel = async ({ user_id, subscription_id, purchase_date, expiry_date, total_price }) => {
    try {
        const { rows } = await db.query(
            `INSERT INTO purchase_subscription  (user_id,subscription_id,purchase_date,expiry_date,total_price) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user_id, subscription_id, purchase_date, expiry_date, total_price]
        );
        return rows;
    } catch (error) {
        throw new ApiError(DB_ERROR, "Adding Subscription Plan", error, false);
    }
}

export const getMySubscriptionPlansModel = async (user_id) => {
    try {
        return await db.query(`
            SELECT 
                ps.*, 
                s.title,
                s.description,
                s.subscription_days,
                u.auto_pay,
                CASE 
                    WHEN ps.expiry_date >= NOW() THEN true
                    ELSE false
                END AS is_active,
                CASE
                    WHEN u.auto_pay = true THEN ps.expiry_date + INTERVAL '1 day'
                    ELSE NULL
                END AS next_billing_date,
                GREATEST((DATE(ps.expiry_date) - DATE(NOW())), 0) AS days_left
            FROM purchase_subscription ps
            JOIN subscriptions s ON ps.subscription_id = s.subscription_id
            JOIN users u ON ps.user_id = u.user_id
            WHERE ps.user_id = $1
            ORDER BY ps.purchase_date DESC
        `, [user_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Getting My Subscription Plans", error, false);
    }
}


export const getLatestSubscriptionPlansModel = async (user_id) => {
    try {
        return await db.query(`
            WITH latest_purchase AS (
                SELECT DISTINCT ON (ps.user_id)
                    ps.*,
                    s.title,
                    s.subscription_days
                FROM purchase_subscription ps
                LEFT JOIN subscriptions s ON ps.subscription_id = s.subscription_id
                WHERE ps.user_id = $1
                ORDER BY ps.user_id, ps.purchase_date DESC
            )
            SELECT *,
                CASE 
                    WHEN expiry_date >= NOW() THEN true
                    ELSE false
                END AS is_active
            FROM latest_purchase
        `, [user_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Getting My Subscription Plans", error, false);
    }
};


export const createWebinarModel = async ({
    user_id,
    section_1,
    section_2,
    section_3,
    section_4,
    section_5,
    section_6,
    schedule_date,
    is_admin = 0,
    admin_id
}) => {
    try {
        // Insert into webinar table
        const webinarResult = await db.query(
            `INSERT INTO webinar (user_id,schedule_date,is_admin,admin_id) VALUES ($1, $2, $3, $4) RETURNING *`,
            [user_id, schedule_date, is_admin, admin_id]
        );
        const webinar = webinarResult[0];

        // Insert into webinar_section table
        const sectionResult = await db.query(
            `INSERT INTO webinar_section 
        (webinar_id, section_1, section_2, section_3, section_4, section_5, section_6) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
            [
                webinar.webinar_id,
                section_1,
                section_2,
                section_3,
                section_4,
                section_5,
                section_6,
            ]
        );
        const webinarSection = sectionResult[0];

        // Optionally return both webinar and section
        return {
            webinar,
            webinarSection,
        };
    } catch (error) {
        throw new ApiError(DB_ERROR, "Creating Webinar", error, false);
    }
};

export const updateWebinarModel = async ({
    webinar_id,
    section_1,
    section_2,
    section_3,
    section_4,
    section_5,
    section_6,
    schedule_date,
}) => {
    try {


        // Step 3: Update webinar table
        await db.query(
            `UPDATE webinar 
             SET schedule_date = $1  
             WHERE webinar_id = $2`,
            [schedule_date, webinar_id]
        );

        // Step 4: Update webinar_section table
        const sectionUpdate = await db.query(
            `UPDATE webinar_section 
             SET section_1 = $1, section_2 = $2, section_3 = $3, section_4 = $4, section_5 = $5, section_6 = $6 
             WHERE webinar_id = $7 
             RETURNING *`,
            [
                section_1,
                section_2,
                section_3,
                section_4,
                section_5,
                section_6,
                webinar_id
            ]
        );

        const updatedSections = sectionUpdate[0];

        return {
            webinar: {
                webinar_id,
                schedule_date,
            },
            webinarSection: updatedSections
        };
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating Webinar", error, false);
    }
};


export const getWebinarByIdModel = async (webinar_id) => {
    try {
        return await db.query(`SELECT 
        w.*,
        ws.section_1,
        ws.section_2,
        ws.section_3,
        ws.section_4,
        ws.section_5,
        ws.section_6,
        COALESCE(
          json_agg(
            json_build_object(
              'webinar_speaker_id', sp.webinar_speaker_id,
              'name', sp.name,
              'role', sp.role,
              'sub_role', sp.sub_role,
              'image', sp.image
            )
              ORDER BY sp.webinar_speaker_id ASC
          ) FILTER (WHERE sp.webinar_speaker_id IS NOT NULL), '[]'
        ) AS speakers
      FROM webinar w
      LEFT JOIN webinar_section ws ON ws.webinar_id = w.webinar_id
      LEFT JOIN webinar_speakers sp ON sp.webinar_id = w.webinar_id
      WHERE w.webinar_id = $1 AND w.delete_flag = 0
      GROUP BY w.webinar_id, ws.webinar_section_id`, [webinar_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Getting Webinar", error, false);
    }
};

export const createWebinarSpeakersModel = async (data) => {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("Data must be a non-empty array");
        }

        const values = [];
        const params = [];

        data.forEach((item, index) => {
            const { webinar_id, name, role, sub_role, image } = item;
            // Calculate parameter positions e.g., ($1, $2, $3, $4, $5), ($6, $7, ...)
            const paramIndex = index * 5;
            values.push(`($${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5})`);
            params.push(webinar_id, name, role, sub_role, image);
        });

        const query = `
            INSERT INTO webinar_speakers (webinar_id, name, role, sub_role, image)
            VALUES ${values.join(', ')}
        `;

        return await db.query(query, params);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Creating Webinar Speakers", error, false);
    }
};

export const updateWebinarSpeakersModel = async (data) => {
    try {

        const webinar_id = data[0].webinar_id;

        // 1. Delete existing speakers for the webinar
        await db.query(
            `DELETE FROM webinar_speakers WHERE webinar_id = $1`,
            [webinar_id]
        );

        // 2. Prepare new insert values
        const values = [];
        const params = [];

        data.forEach((item, index) => {
            const { webinar_id, name, role, sub_role, image } = item;
            const paramIndex = index * 5;
            values.push(`($${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5})`);
            params.push(webinar_id, name, role, sub_role, image);
        });

        const insertQuery = `
            INSERT INTO webinar_speakers (webinar_id, name, role, sub_role, image)
            VALUES ${values.join(', ')}
        `;

        // 3. Insert new speakers
        return await db.query(insertQuery, params);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating Webinar Speakers", error, false);
    }
};



export const getWebinarSpeakersModel = async (webinar_id) => {
    try {
        return await db.query(`SELECT * FROM webinar_speakers WHERE webinar_id = $1`, [webinar_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Getting Webinar Speakers", error, false);
    }
};

export const getWebinarByUserIdModel = async (user_id) => {
    try {
        const query = `
      SELECT 
        w.*,
        ws.section_1,
        ws.section_2,
        ws.section_3,
        ws.section_4,
        ws.section_5,
        ws.section_6,
        COALESCE(
          json_agg(
            json_build_object(
              'webinar_speaker_id', sp.webinar_speaker_id,
              'name', sp.name,
              'role', sp.role,
              'sub_role', sp.sub_role,
              'image', sp.image
            )
              ORDER BY sp.webinar_speaker_id ASC
          ) FILTER (WHERE sp.webinar_speaker_id IS NOT NULL), '[]'
        ) AS speakers
      FROM webinar w
      LEFT JOIN webinar_section ws ON ws.webinar_id = w.webinar_id
      LEFT JOIN webinar_speakers sp ON sp.webinar_id = w.webinar_id
      WHERE w.user_id = $1 AND w.delete_flag = 0
      GROUP BY w.webinar_id, ws.webinar_section_id
      ORDER BY w.created_at DESC
    `;

        return await db.query(query, [user_id]);;
    } catch (error) {
        throw new ApiError(DB_ERROR, "Getting Webinar with Sections and Speakers", error, false);
    }
};

export const getAllWebinarModel = async () => {
    try {
        const query = `
      SELECT 
        w.*,
        ws.section_1,
        ws.section_2,
        ws.section_3,
        ws.section_4,
        ws.section_5,
        ws.section_6,
        COALESCE(
          json_agg(
            json_build_object(
              'webinar_speaker_id', sp.webinar_speaker_id,
              'name', sp.name,
              'role', sp.role,
              'sub_role', sp.sub_role,
              'image', sp.image
            )
              ORDER BY sp.webinar_speaker_id ASC
          ) FILTER (WHERE sp.webinar_speaker_id IS NOT NULL), '[]'
        ) AS speakers
      FROM webinar w 
      LEFT JOIN webinar_section ws ON ws.webinar_id = w.webinar_id
      LEFT JOIN webinar_speakers sp ON sp.webinar_id = w.webinar_id
      WHERE w.delete_flag = 0
      GROUP BY w.webinar_id, ws.webinar_section_id
      ORDER BY w.created_at DESC;
    `;

        return await db.query(query);;
    } catch (error) {
        throw new ApiError(DB_ERROR, "Getting Webinar with Sections and Speakers", error, false);
    }
};

export const getFutureWebinarModel = async () => {
    try {
        const query = `
      SELECT 
        w.*,
        ws.section_1,
        ws.section_2,
        ws.section_3,
        ws.section_4,
        ws.section_5,
        ws.section_6,
        u.role,
        COALESCE(
          json_agg(
            json_build_object(
              'webinar_speaker_id', sp.webinar_speaker_id,
              'name', sp.name,
              'role', sp.role,
              'sub_role', sp.sub_role,
              'image', sp.image
            )
              ORDER BY sp.webinar_speaker_id ASC
          ) FILTER (WHERE sp.webinar_speaker_id IS NOT NULL), '[]'
        ) AS speakers,
         CASE 
         WHEN w.is_admin = 0 THEN u.full_name
         WHEN w.is_admin = 1 THEN 'Nuvio Team'
         ELSE NULL
         END AS created_user_name
      FROM webinar w
      LEFT JOIN webinar_section ws ON ws.webinar_id = w.webinar_id
      LEFT JOIN webinar_speakers sp ON sp.webinar_id = w.webinar_id
      LEFT JOIN users u ON u.user_id = w.user_id
      WHERE w.schedule_date > NOW() AND w.delete_flag = 0   AND (w.is_admin = 1 OR ( u.is_deleted = false AND u.is_disabled = false))
      GROUP BY w.webinar_id, ws.webinar_section_id,u.full_name,u.role
      ORDER BY w.schedule_date ASC
    `;

        return await db.query(query);;
    } catch (error) {
        throw new ApiError(DB_ERROR, "Getting Webinar with Sections and Speakers", error, false);
    }
};


export const deleteWebinarModel = async (webinar_id) => {
    try {
        return await db.query(`UPDATE webinar SET delete_flag = 1 WHERE webinar_id = $1`, [webinar_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Deleting Webinar", error, false);
    }
};

export const getSingleCoacheModel = async (user_id) => {
    try {
        return await db.query(`
            SELECT 
                u.*, 
                c.*, 
                c1.category_name
            FROM users u
            JOIN coaches c ON u.user_id = c.user_id
            JOIN categories c1 ON c.category_id = c1.category_id
            WHERE u.role = 'COACH' AND u.user_id = $1
        `, [user_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Single Coach with Subscriptions", error, false);
    }
};


export const getWebinarRegisteredUser = async (user_id) => {
    try {
        return await db.query(`SELECT wr.webinar_registration_id,wr.first_name,wr.last_name,wr.email,wr.linkedin_url,wr.phone_number,wr.role,wr.source,wr.created_at,wr.webinar_id,w.schedule_date FROM webinar_registrations wr JOIN webinar w ON wr.webinar_id = w.webinar_id JOIN users u ON u.user_id = w.user_id  WHERE u.user_id = $1`, [user_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Getting Webinar Registered User", error, false);
    }
}

export const updateCoachProfileModel = async (user_id, data) => {
    const { full_name, phone_number, dob, gender, country, city, state, address_1, address_2, zip_code, time_zone, language,tagline,bio,reason,year_of_experience, profile_image } = data;
    const users = await db.query(`UPDATE users SET full_name = $1,phone_number = $2,dob = $3,gender = $4,time_zone = $5,language = $6, profile_image = $7 WHERE user_id = $8`, [full_name, phone_number, dob, gender, time_zone, language,profile_image, user_id]);

    const coach = await db.query(`UPDATE coaches SET country = $1,city = $2,state = $3,address_1 = $4,address_2 = $5,zip_code = $6 ,tagline = $7,bio = $8,reason = $9,year_of_experience = $10 WHERE user_id = $11`, [country, city, state, address_1, address_2, zip_code, tagline,bio,reason,year_of_experience, user_id]);
    return { users, coach };
}

export const switchMyAutoPayModel = async (user_id, auto_pay) => {
    try {
        return await db.query(`UPDATE users SET auto_pay = $1 WHERE user_id = $2`, [auto_pay, user_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating Coach Auto Pay", error, false);
    }
};

export const createOfferModel = async (data) => {
    try {
        const { user_id,offer_title,purpose,offer_type,offer_format,duration,price,additional_notes } = data;
        const result = await db.query(
            `INSERT INTO offers (user_id,offer_title,purpose,offer_type,offer_format,duration,price,additional_notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [user_id,offer_title,purpose,offer_type,offer_format,duration,price,additional_notes]
        );
        return result;
    } catch (error) {
        throw new ApiError(DB_ERROR, "Creating Offer", error, false);
    }
};

export const updateOfferModel = async (data) => {
    try {
        const { offer_id,offer_title,purpose,offer_type,offer_format,duration,price,additional_notes } = data;
        const result = await db.query(
            `UPDATE offers SET offer_title = $1,purpose = $2,offer_type = $3,offer_format = $4,duration = $5,price = $6,additional_notes = $7 WHERE offer_id = $8 RETURNING *`,
            [offer_title,purpose,offer_type,offer_format,duration,price,additional_notes,offer_id]
        );
        return result;
    } catch (error) {
        throw new ApiError(DB_ERROR, "Updating Offer", error, false);
    }
};


export const getOffersByUserIdModel = async (user_id) => {
    try {
        return await db.query(`SELECT * FROM offers WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC`, [user_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Getting Offers By User Id", error, false);
    }
};

export const getOfferByIdModel = async (offer_id) => {
    try {
        return await db.query(`SELECT * FROM offers WHERE offer_id = $1 AND is_active = true`, [offer_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Getting Offer By Id", error, false);
    }
};

export const deleteOfferModel = async (offer_id) => {
    try {
        return await db.query(`UPDATE offers SET is_active = false WHERE offer_id = $1`, [offer_id]);
    } catch (error) {
        throw new ApiError(DB_ERROR, "Deleting Offer", error, false);
    }
};

export const getOffersCountModel = async (user_id) => {
  try {

    const query = `
      WITH types AS (
        SELECT * FROM (
          VALUES
            ('Discovery Call (Free)'::offer_type_enum),
            ('Clarity Boost'::offer_type_enum),
            ('Growth Pro'::offer_type_enum),
            ('Deep Dive'::offer_type_enum),
            ('Team Coaching'::offer_type_enum),
            ('Group Coaching'::offer_type_enum)
        ) AS t(type)
      )
      SELECT 
          t.type AS offer_type,
          COUNT(o.offer_id) AS total
      FROM types t
      LEFT JOIN offers o
          ON o.offer_type = t.type
          AND o.user_id = $1
      GROUP BY t.type
      ORDER BY t.type;
    `;

    const result = await db.query(query, [user_id]);
    return result;

  } catch (error) {
    throw new ApiError(DB_ERROR, "Getting Offer Counts", error, false);
  }
};
