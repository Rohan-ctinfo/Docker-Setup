import db from "../config/db.js";
import { ApiError } from "../utils/api.util.js";
import { DB_ERROR } from "../utils/message.util.js";
import { CustomImagePath } from "../utils/misc.util.js";

export default {
    saveMessage: async ({ sender_id, receiver_id, message, sender_type, file, message_type, receiver_type }) => {
        try {
            const result = await db.query(
                `INSERT INTO messages (sender_id, receiver_id, message, sender_type, file, message_type, receiver_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING message_id`,
                [sender_id, receiver_id, message, sender_type, file, message_type, receiver_type]
            );

            console.log("result", result);
            const messageId = result[0].message_id;
            console.log("✅ Message saved with ID:", messageId);
            return messageId;
        } catch (err) {
            console.error("❌ Error saving message:", err.message);
            throw new ApiError(DB_ERROR, "Error saving message", err, false);
        }
    },

    getChatBetweenUsers: async (user1, user2,) => {
        try {
            const rows = await db.query(
                `SELECT
          m.message_id,
          m.sender_id,
          m.receiver_id,
          m.message,
          m.sender_type,
          m.receiver_type,
          m.created_at,
          m.file,
          m.message_type,
          m.is_read,
          
          CASE 
            WHEN m.sender_type = 'ADMIN' THEN a.full_name
            ELSE u.full_name
          END AS sender_name,
          CASE 
            WHEN m.sender_type = 'ADMIN' THEN a.profile_image
            ELSE u.profile_image
          END AS sender_image,
          
          CASE 
            WHEN m.receiver_type = 'ADMIN' THEN ra.full_name
            ELSE ru.full_name
          END AS receiver_name,
          CASE 
            WHEN m.receiver_type = 'ADMIN' THEN ra.profile_image
            ELSE ru.profile_image
          END AS receiver_image

      FROM messages m
      LEFT JOIN users u ON u.user_id = m.sender_id
      LEFT JOIN admin a ON a.admin_id = m.sender_id AND m.sender_type = 'ADMIN'

      LEFT JOIN users ru ON ru.user_id = m.receiver_id
      LEFT JOIN admin ra ON ra.admin_id = m.receiver_id AND m.receiver_type = 'ADMIN'

      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC`,
                [user1, user2]
            );

            // Optional: fix profile images URLs
            rows.forEach(msg => {
                msg.sender_image = CustomImagePath(msg.sender_image);
                msg.receiver_image = CustomImagePath(msg.receiver_image);
                // msg.file = CustomImagePath(msg.file);
                msg.file = msg.file
                    ? msg.file.split(",").map(f => CustomImagePath(f.trim()))
                    : [];
            });

            return rows;
        } catch (err) {
            console.error("❌ Error fetching chat:", err.message);
            throw new ApiError(DB_ERROR, "Error fetching chat", err, false);
        }
    },
    getUserById: async (user_id) => {
        try {
            const rows = await db.query(
                `SELECT user_id, full_name, full_name, profile_image, role 
         FROM users 
         WHERE user_id = $1`,
                [user_id]
            );

            const user = rows[0];

            if (!user) return null;

            user.profile_image = CustomImagePath(user.profile_image);

            // If user is a coach → fetch coach details
            if (user.role === "COACH") {
                const coachRows = await db.query(
                    `SELECT * FROM coaches WHERE user_id = $1`,
                    [user_id]
                );
                user.coach = coachRows[0] || null;
            }

            return user;
        } catch (err) {
            console.error("❌ Error fetching user:", err.message);
            throw new ApiError(DB_ERROR, "Error fetching user", err, false);
        }
    },

    getAdminById: async (admin_id) => {
        try {
            const rows = await db.query(`SELECT * FROM admin WHERE admin_id = $1 `, [admin_id]);

            const user = rows[0];
            if (!user) return null;

            user.profile_image = CustomImagePath(user.profile_image);

            return user;
        } catch (error) {
            throw new ApiError(DB_ERROR, "Checking Admin", error, false);
        }
    },

    getChatList: async (userId, role) => {
        try {
            const rows = await db.query(
                `
            WITH target AS (
                SELECT 
                    m.*,
                    CASE 
                        WHEN m.sender_id = $1 THEN m.receiver_id
                        ELSE m.sender_id
                    END AS chat_partner_id,
                    CASE 
                        WHEN m.sender_id = $1 THEN m.receiver_type
                        ELSE m.sender_type
                    END AS chat_partner_type
                FROM messages m
                WHERE 
                    ($2 = 'ADMIN' AND (m.sender_id = $1 OR m.receiver_id = $1))
                    OR
                    ($2 != 'ADMIN' AND (m.sender_id = $1 OR m.receiver_id = $1))
            ),

            unread AS (
                SELECT 
                    CASE 
                        WHEN sender_id = $1 THEN receiver_id
                        ELSE sender_id
                    END AS cp_id,
                    COUNT(*) AS unread_count
                FROM messages
                WHERE 
                    receiver_id = $1
                    AND is_read = false
                GROUP BY cp_id
            )

            SELECT DISTINCT ON (t.chat_partner_id)
                t.message_id,
                t.sender_id,
                t.receiver_id,
                t.message,
                t.message_type,
                t.sender_type,
                t.receiver_type,
                t.created_at,
                t.chat_partner_id,
                t.chat_partner_type,
                t.is_read,

                -- Chat Partner Name
                CASE 
                    WHEN t.chat_partner_type = 'ADMIN' THEN a.full_name
                    ELSE u.full_name
                END AS chat_partner_name,

                -- Chat Partner Image
                CASE 
                    WHEN t.chat_partner_type = 'ADMIN' THEN a.profile_image
                    ELSE u.profile_image
                END AS chat_partner_image,

                COALESCE(uq.unread_count, 0) AS unread_count

            FROM target t
            LEFT JOIN users u 
                ON t.chat_partner_id = u.user_id 
            LEFT JOIN admin a 
                ON t.chat_partner_id = a.admin_id 
                AND t.chat_partner_type = 'ADMIN'
            LEFT JOIN unread uq 
                ON uq.cp_id = t.chat_partner_id
            ORDER BY t.chat_partner_id, t.created_at DESC
            `,
                [userId, role]
            );

            rows.forEach(chat => {
                chat.chat_partner_image = CustomImagePath(chat.chat_partner_image);
            });

            return rows;

        } catch (err) {
            console.error("❌ Error fetching chat list:", err.message);
            throw new ApiError(DB_ERROR, "Error fetching chat list", err, false);
        }
    },

    // getChatList: async (userId, role) => {
    //     try {
    //         const rows = await db.query(
    //             `
    //         WITH target AS (
    //             SELECT 
    //                 m.*,
    //                 CASE 
    //                     WHEN m.sender_id = $1 THEN m.receiver_id
    //                     ELSE m.sender_id
    //                 END AS chat_partner_id,
    //                 CASE 
    //                     WHEN m.sender_id = $1 THEN m.receiver_type
    //                     ELSE m.sender_type
    //                 END AS chat_partner_type
    //             FROM messages m
    //             WHERE 
    //                 ($2 = 'ADMIN' AND (m.sender_id = $1 OR m.receiver_id = $1))
    //                 OR
    //                 ($2 != 'ADMIN' AND (m.sender_id = $1 OR m.receiver_id = $1))
    //         )
    //         SELECT DISTINCT ON (t.chat_partner_id)
    //             t.message_id,
    //             t.sender_id,
    //             t.receiver_id,
    //             t.message,
    //             t.message_type,
    //             t.sender_type,
    //             t.receiver_type,
    //             t.created_at,
    //             t.chat_partner_id,
    //             t.chat_partner_type,
    //             t.is_read,

    //             -- Chat Partner Name
    //             CASE 
    //                 WHEN t.chat_partner_type = 'ADMIN' THEN a.full_name
    //                 ELSE u.full_name
    //             END AS chat_partner_name,

    //             -- Chat Partner Image
    //             CASE 
    //                 WHEN t.chat_partner_type = 'ADMIN' THEN a.profile_image
    //                 ELSE u.profile_image
    //             END AS chat_partner_image

    //         FROM target t
    //         LEFT JOIN users u ON t.chat_partner_id = u.user_id 
    //         LEFT JOIN admin a ON t.chat_partner_id = a.admin_id AND t.chat_partner_type = 'ADMIN'
    //         ORDER BY t.chat_partner_id, t.created_at DESC
    //         `,
    //             [userId, role]
    //         );

    //         // Fix image paths
    //         rows.forEach(chat => {
    //             chat.chat_partner_image = CustomImagePath(chat.chat_partner_image);
    //         });

    //         return rows;

    //     } catch (err) {
    //         console.error("❌ Error fetching chat list:", err.message);
    //         throw new ApiError(DB_ERROR, "Error fetching chat list", err, false);
    //     }
    // },

    markAsRead: async (message_id) => {
        try {
            const result = await db.query(
                `UPDATE messages SET is_read = TRUE WHERE message_id = $1 RETURNING message_id`,
                [message_id]
            );
            return result;
        } catch (err) {
            console.error("❌ Error marking message as read:", err.message);
            throw new ApiError(DB_ERROR, "Error marking message as read", err, false);
        }
    },

    allChatMarkAsRead: async (receiver_id, receiver_type, other_user_id) => {
        try {
            await db.query(
                `UPDATE messages SET is_read = TRUE WHERE receiver_id = $1 AND receiver_type = $2 AND sender_id = $3  AND is_read = FALSE`,
                [receiver_id, receiver_type, other_user_id]
            );
            return null;
        } catch (err) {
            console.error("❌ Error marking message as read:", err.message);
            throw new ApiError(DB_ERROR, "Error marking message as read", err, false);
        }
    },

};
