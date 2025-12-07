import db from "../config/db.js";
import { ApiError } from "../utils/api.util.js";
import { DB_ERROR } from "../utils/message.util.js";


export const getAdminById = async (admin_id) => {
  try {
    return await db.query(`SELECT * FROM admin WHERE admin_id = $1 `, [admin_id]);
  } catch (error) {
    throw new ApiError(DB_ERROR, "Checking Admin", error, false);
  }
};

export const getAdminByEmail = async (email) => {
  try {
    return await db.query(`SELECT * FROM admin WHERE email = $1`, [email]);
  } catch (error) {
    throw new ApiError(DB_ERROR, "Checking Admin", error, false);
  }
};

export const forgotADMINPasswordModel = async (email, forgot_code, otp) => {
  try {
    return await db.query(
      `UPDATE admin SET forgot_code = $1, otp = $2 WHERE email = $3`,
      [forgot_code, otp, email]
    );
  } catch (error) {
    throw new ApiError(DB_ERROR, "Checking Admin", error, false);
  }
};

export const resendAdminOTP = async (email, otp) => {
  try {
    return await db.query(
      `UPDATE admin SET otp = $1 WHERE email = $2`,
      [otp, email]
    );
  } catch (error) {
    throw new ApiError(DB_ERROR, "Updating Admin OTP", error, false);
  }
};

export const getAdminByForgotCode = async (forgot_code) => {
  try {
    return await db.query(`SELECT * FROM admin WHERE forgot_code = $1`, [forgot_code]);
  } catch (error) {
    throw new ApiError(DB_ERROR, "Checking Admin", error, false);
  }
};

export const updateAdminPassword = async (Admin_id, password) => {
  try {
    return await db.query(
      `UPDATE admin SET password = $1, forgot_code = NULL WHERE Admin_id = $2`,
      [password, Admin_id]
    );
  } catch (error) {
    throw new ApiError(DB_ERROR, "Updating Admin", error, false);
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
            WHERE u.role = 'COACH'
            GROUP BY u.user_id, c.coach_id,c1.category_name
            ORDER BY u.created_at DESC
        `);
  } catch (error) {
    throw new ApiError(DB_ERROR, "All Coaches with Subscriptions", error, false);
  }
};

export const getSingleCoacheModel = async (user_id) => {
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
            WHERE u.role = 'COACH' AND u.user_id = $1
            GROUP BY u.user_id, c.coach_id,c1.category_id
        `, [user_id]);
  } catch (error) {
    throw new ApiError(DB_ERROR, "Single Coach with Subscriptions", error, false);
  }
};

export const updateCoachStatusModel = async (user_id, status, rejected_reason, verification_code) => {
  try {
    await db.query(`UPDATE users SET status = $1, is_verified = $2,verification_code = $3 WHERE user_id = $4`, [status, status == "APPROVE" ? true : false, verification_code, user_id]);
    return await db.query(`UPDATE coaches SET approved_at = $1 , rejected_at = $2,rejected_reason = $3 WHERE user_id = $4 `, [status == "APPROVE" ? new Date() : null, status == "REJECT" ? new Date() : null, rejected_reason, user_id])
  } catch (error) {
    throw new ApiError(DB_ERROR, "Update Coach Status", error, false);
  }
};


export const getAllWebinarRegistrationModel = async () => {
  try {
    return await db.query(`SELECT webinar_id,first_name,last_name,email,linkedin_url,phone_number,role,source,created_at FROM webinar_registrations ORDER BY created_at DESC`);
  } catch (error) {
    throw new ApiError(DB_ERROR, "All Webinar Registration", error, false);
  }
};

export const getSingleWebinarRegistrationModel = async (webinar_id) => {
  try {
    return await db.query(`SELECT webinar_id,first_name,last_name,email,linkedin_url,phone_number,role,source,created_at FROM webinar_registrations WHERE webinar_id = $1`, [webinar_id]);
  } catch (error) {
    throw new ApiError(DB_ERROR, "Single Webinar Registration", error, false);
  }
};

export const getAllBootcampRegistrationModel = async () => {
  try {
    return await db.query(`SELECT * FROM bootcamp_registrations ORDER BY created_at DESC`);
  } catch (error) {
    throw new ApiError(DB_ERROR, "All Bootcamp Registration", error, false);
  }
};

export const getSingleBootcampRegistrationModel = async (bootcamp_id) => {
  try {
    return await db.query(`SELECT * FROM bootcamp_registrations WHERE bootcamp_id = $1`, [bootcamp_id]);
  } catch (error) {
    throw new ApiError(DB_ERROR, "Single Bootcamp Registration", error, false);
  }
};

export const getAllContactUsQueryModel = async () => {
  try {
    return await db.query(`SELECT * FROM contact_us ORDER BY created_at DESC`);
  } catch (error) {
    throw new ApiError(DB_ERROR, "All Contact Us Query", error, false);
  }
};


// export const createBootcampModel = async (data) => {
//   const client = await db.begin();

//   try {
//     const {
//       header_title,
//       header_sub_title,
//       header_description,
//       start_date,
//       end_date,
//       location,
//       price,
//       seats,
//       points,
//       footer_title,
//       footer_sub_title,
//       footer_description,
//       program_days = [],
//     } = data;

//     // Insert bootcamp
//     const bootcampInsertQuery = `
//       INSERT INTO bootcamps (
//         header_title, header_sub_title, header_description,
//         start_date, end_date, location, price, seats, points,
//         footer_title, footer_sub_title, footer_description
//       )
//       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
//       RETURNING *;
//     `;

//     const { rows: [bootcamp] } = await client.query(bootcampInsertQuery, [
//       header_title, header_sub_title, header_description,
//       start_date, end_date, location, price, seats, points,
//       footer_title, footer_sub_title, footer_description,
//     ]);

//     const bootcamp_id = bootcamp.bootcamp_id;

//     let insertedProgramDays = [];
//     let insertedSessions = [];

//     // Insert program days
//     if (program_days.length > 0) {
//       const dayInserts = [];
//       const dayValues = [];
//       let i = 1;

//       for (const day of program_days) {
//         dayInserts.push(`($${i++}, $${i++}, $${i++}, $${i++})`);
//         dayValues.push(bootcamp_id, day.day_number ?? null, day.title ?? null, day.description ?? null);
//       }

//       const { rows: programDayRows } = await client.query(`
//         INSERT INTO program_days (bootcamp_id, day_number, title, description)
//         VALUES ${dayInserts.join(', ')}
//         RETURNING *;
//       `, dayValues);

//       insertedProgramDays = programDayRows;
//       const programDayIds = programDayRows.map(r => r.program_day_id);

//       // Prepare sessions bulk insert
//       const sessionInserts = [];
//       const sessionValues = [];
//       let j = 1;

//       program_days.forEach((day, index) => {
//         const dayId = programDayIds[index];
//         (day.sessions || []).forEach(session => {
//           sessionInserts.push(`($${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++})`);
//           sessionValues.push(
//             dayId,
//             session.title ?? null,
//             session.description ?? null,
//             session.start_time ?? null,
//             session.end_time ?? null,
//             session.date ?? null
//           );
//         });
//       });

//       // Insert all sessions in one go
//       if (sessionInserts.length > 0) {
//         const { rows: sessionRows } = await client.query(`
//           INSERT INTO sessions (program_day_id, title, description, start_time, end_time, date)
//           VALUES ${sessionInserts.join(', ')}
//           RETURNING *;
//         `, sessionValues);

//         insertedSessions = sessionRows;
//       }
//     }

//     await db.commit(client);

//     // ✅ Build final structured response
//     const programDaysWithSessions = insertedProgramDays.map(day => ({
//       ...day,
//       sessions: insertedSessions.filter(s => s.program_day_id === day.program_day_id),
//     }));

//     return {
//       ...bootcamp,
//       program_days: programDaysWithSessions
//     };

//   } catch (error) {
//     await db.rollback(client);
//     throw new ApiError(DB_ERROR, 'Create Bootcamp', error, false);
//   }
// };

export const createBootcampModel = async (data) => {
  const client = await db.begin();

  try {
    const {
      header_title,
      header_sub_title,
      header_description,
      start_date,
      end_date,
      location,
      price,
      seats,
      points,
      footer_title,
      footer_sub_title,
      footer_description,
      brochure_color,
      footer_color,
      program_days = [],
    } = data;

    // Insert bootcamp
    const bootcampInsertQuery = `
      INSERT INTO bootcamps (
        header_title, header_sub_title, header_description,
        start_date, end_date, location, price, seats, points,
        footer_title, footer_sub_title, footer_description,brochure_color,footer_color
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *;
    `;

    const { rows: [bootcamp] } = await client.query(bootcampInsertQuery, [
      header_title, header_sub_title, header_description,
      start_date, end_date, location, price, seats, points,
      footer_title, footer_sub_title, footer_description, brochure_color, footer_color
    ]);

    const bootcamp_id = bootcamp.bootcamp_id;

    let insertedProgramDays = [];
    let insertedSessions = [];
    let insertedSpeakers = [];

    // Insert program days
    if (program_days.length > 0) {
      const dayInserts = [];
      const dayValues = [];
      let i = 1;

      for (const day of program_days) {
        dayInserts.push(`($${i++}, $${i++}, $${i++}, $${i++})`);
        dayValues.push(bootcamp_id, day.day_number ?? null, day.title ?? null, day.description ?? null);
      }

      const { rows: programDayRows } = await client.query(`
        INSERT INTO program_days (bootcamp_id, day_number, title, description)
        VALUES ${dayInserts.join(', ')}
        RETURNING *;
      `, dayValues);

      insertedProgramDays = programDayRows;
      const programDayIds = programDayRows.map(r => r.program_day_id);

      // Prepare sessions bulk insert
      const sessionInserts = [];
      const sessionValues = [];
      let j = 1;

      program_days.forEach((day, index) => {
        const dayId = programDayIds[index];
        (day.sessions || []).forEach(session => {
          sessionInserts.push(`($${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++})`);
          sessionValues.push(
            dayId,
            session.title ?? null,
            session.description ?? null,
            session.start_time ?? null,
            session.end_time ?? null,
            session.date ?? null
          );
        });
      });

      // Insert all sessions in one go
      if (sessionInserts.length > 0) {
        const { rows: sessionRows } = await client.query(`
          INSERT INTO sessions (program_day_id, title, description, start_time, end_time, date)
          VALUES ${sessionInserts.join(', ')}
          RETURNING *;
        `, sessionValues);

        insertedSessions = sessionRows;

        // ✅ Insert session speakers (linked to sessions)
        const speakerInserts = [];
        const speakerValues = [];
        let k = 1;

        program_days.forEach((day, index) => {
          (day.sessions || []).forEach((session) => {
            // Find the matching inserted session by title or order
            const insertedSession = insertedSessions.find(
              s =>
                s.title === (session.title ?? null) &&
                s.program_day_id === programDayIds[index]
            );

            const sessionId = insertedSession?.session_id;

            (session.speakers || []).forEach(speaker => {
              speakerInserts.push(`($${k++}, $${k++}, $${k++}, $${k++})`);
              speakerValues.push(
                sessionId ?? null,
                speaker.name ?? null,
                speaker.role ?? null,
                null
              );
            });
          });
        });

        if (speakerInserts.length > 0) {
          const { rows: speakerRows } = await client.query(`
            INSERT INTO session_speakers (session_id, name, role, image)
            VALUES ${speakerInserts.join(', ')}
            RETURNING session_speaker_id, session_id, name, role, image;
          `, speakerValues);

          insertedSpeakers = speakerRows;
        }
      }
    }

    await db.commit(client);

    // ✅ Build structured response
    const programDaysWithSessions = insertedProgramDays.map(day => ({
      ...day,
      sessions: insertedSessions
        .filter(s => s.program_day_id === day.program_day_id)
        .map(s => ({
          ...s,
          speakers: insertedSpeakers.filter(sp => sp.session_id === s.session_id)
        })),
    }));

    return {
      ...bootcamp,
      program_days: programDaysWithSessions,
    };

  } catch (error) {
    await db.rollback(client);
    throw new ApiError(DB_ERROR, 'Create Bootcamp', error, false);
  }
};

export const updateBootcampSessionSpeakersImagesModel = async (data) => {
  try {
    const { session_speaker_ids = [], images = [] } = data;

    const caseParts = session_speaker_ids
      .map((id, i) => `WHEN ${id} THEN $${i + 1}`)
      .join(' ');

    const query = `
      UPDATE session_speakers
      SET image = CASE session_speaker_id
        ${caseParts}
      END
      WHERE session_speaker_id IN (${session_speaker_ids.join(', ')})
    `;

    return await db.query(query, images);
  } catch (error) {
    throw new ApiError(DB_ERROR, 'Update Bootcamp Speaker Images', error, false);
  }
};



export const updateBootcampModel = async (bootcamp_id, data) => {
  const client = await db.begin();

  try {
    const {
      header_title,
      header_sub_title,
      header_description,
      start_date,
      end_date,
      location,
      price,
      seats,
      points,
      footer_title,
      footer_sub_title,
      footer_description,
      brochure_color,
      footer_color,
      program_days = [],
    } = data;

    // ------------------------
    // 1️⃣ Update bootcamp details
    // ------------------------
    const bootcampUpdateQuery = `
      UPDATE bootcamps
      SET
        header_title = $1,
        header_sub_title = $2,
        header_description = $3,
        start_date = $4,
        end_date = $5,
        location = $6,
        price = $7,
        seats = $8,
        points = $9,
        footer_title = $10,
        footer_sub_title = $11,
        footer_description = $12,
        brochure_color = $13,
        footer_color = $14
      WHERE bootcamp_id = $15
      RETURNING *;
    `;

    const { rows: [bootcamp] } = await client.query(bootcampUpdateQuery, [
      header_title, header_sub_title, header_description,
      start_date, end_date, location, price, seats, points,
      footer_title, footer_sub_title, footer_description, brochure_color, footer_color,
      bootcamp_id
    ]);

    if (!bootcamp) {
      throw new ApiError(DB_ERROR, 'Bootcamp not found', null, true);
    }

    // ------------------------
    // 2️⃣ Remove old structure
    // ------------------------
    await client.query(`
      DELETE FROM session_speakers 
      WHERE session_id IN (
        SELECT session_id FROM sessions 
        WHERE program_day_id IN (
          SELECT program_day_id FROM program_days WHERE bootcamp_id = $1
        )
      );
    `, [bootcamp_id]);

    await client.query(`
      DELETE FROM sessions 
      WHERE program_day_id IN (
        SELECT program_day_id FROM program_days WHERE bootcamp_id = $1
      );
    `, [bootcamp_id]);

    await client.query(`DELETE FROM program_days WHERE bootcamp_id = $1;`, [bootcamp_id]);

    // ------------------------
    // 3️⃣ Insert program days
    // ------------------------
    let insertedProgramDays = [];
    let insertedSessions = [];
    let insertedSpeakers = [];

    if (program_days.length > 0) {
      const dayInserts = [];
      const dayValues = [];
      let i = 1;

      for (const day of program_days) {
        dayInserts.push(`($${i++}, $${i++}, $${i++}, $${i++})`);
        dayValues.push(bootcamp_id, day.day_number ?? null, day.title ?? null, day.description ?? null);
      }

      const { rows: programDayRows } = await client.query(`
        INSERT INTO program_days (bootcamp_id, day_number, title, description)
        VALUES ${dayInserts.join(', ')}
        RETURNING *;
      `, dayValues);

      insertedProgramDays = programDayRows;
      const programDayIds = programDayRows.map(r => r.program_day_id);

      // ------------------------
      // 4️⃣ Insert sessions
      // ------------------------
      const sessionInserts = [];
      const sessionValues = [];
      let j = 1;

      program_days.forEach((day, index) => {
        const dayId = programDayIds[index];
        (day.sessions || []).forEach(session => {
          sessionInserts.push(`($${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++})`);
          sessionValues.push(
            dayId,
            session.title ?? null,
            session.description ?? null,
            session.start_time ?? null,
            session.end_time ?? null,
            session.date ?? null
          );
        });
      });

      if (sessionInserts.length > 0) {
        const { rows: sessionRows } = await client.query(`
          INSERT INTO sessions (program_day_id, title, description, start_time, end_time, date)
          VALUES ${sessionInserts.join(', ')}
          RETURNING *;
        `, sessionValues);

        insertedSessions = sessionRows;

        // ------------------------
        // 5️⃣ Insert session speakers (retain IDs if present + mark new)
        // ------------------------
        const speakerInserts = [];
        const speakerValues = [];
        let k = 1;
        const newSpeakersTemp = []; // track new speakers before insert

        program_days.forEach((day, index) => {
          (day.sessions || []).forEach((session) => {
            const insertedSession = insertedSessions.find(
              s =>
                s.title === (session.title ?? null) &&
                s.program_day_id === programDayIds[index]
            );

            const sessionId = insertedSession?.session_id;

            (session.speakers || []).forEach(speaker => {
              if (speaker.session_speaker_id) {
                // ✅ Existing speaker (retain ID)
                speakerInserts.push(`($${k++}, $${k++}, $${k++}, $${k++}, $${k++})`);
                speakerValues.push(
                  speaker.session_speaker_id,
                  sessionId ?? null,
                  speaker.name ?? null,
                  speaker.role ?? null,
                  speaker.image ?? null
                );
              } else {
                // 🆕 New speaker → auto-generate ID
                speakerInserts.push(`(DEFAULT, $${k++}, $${k++}, $${k++}, $${k++})`);
                speakerValues.push(
                  sessionId ?? null,
                  speaker.name ?? null,
                  speaker.role ?? null,
                  speaker.image ?? null
                );

                // Mark this as a new speaker for mapping later
                newSpeakersTemp.push({
                  session_temp_ref: sessionId,
                  name: speaker.name,
                  role: speaker.role
                });
              }
            });
          });
        });

        if (speakerInserts.length > 0) {
          const { rows: speakerRows } = await client.query(`
            INSERT INTO session_speakers (session_speaker_id, session_id, name, role, image)
            VALUES ${speakerInserts.join(', ')}
            RETURNING session_speaker_id, session_id, name, role, image;
          `, speakerValues);

          // 🧠 Mark which ones are new
          insertedSpeakers = speakerRows.map(sp => {
            const isNew = newSpeakersTemp.some(
              ns => ns.session_temp_ref === sp.session_id &&
                ns.name === sp.name &&
                ns.role === sp.role
            );
            return { ...sp, is_new: isNew };
          });
        }
      }
    }

    // ------------------------
    // 6️⃣ Commit transaction
    // ------------------------
    await db.commit(client);

    // ------------------------
    // 7️⃣ Build structured response
    // ------------------------
    const programDaysWithSessions = insertedProgramDays.map(day => ({
      ...day,
      sessions: insertedSessions
        .filter(s => s.program_day_id === day.program_day_id)
        .map(s => ({
          ...s,
          speakers: insertedSpeakers.filter(sp => sp.session_id === s.session_id)
        })),
    }));

    return {
      ...bootcamp,
      program_days: programDaysWithSessions,
    };

  } catch (error) {
    await db.rollback(client);
    throw new ApiError(DB_ERROR, 'Update Bootcamp', error, false);
  }
};


// export const updateBootcampModel = async (bootcamp_id, data) => {
//   const client = await db.begin();

//   try {
//     const {
//       header_title,
//       header_sub_title,
//       header_description,
//       start_date,
//       end_date,
//       location,
//       price,
//       seats,
//       points,
//       footer_title,
//       footer_sub_title,
//       footer_description,
//       program_days = [],
//     } = data;

//     // ------------------------
//     // 1️⃣ Update bootcamp details
//     // ------------------------
//     const bootcampUpdateQuery = `
//       UPDATE bootcamps
//       SET
//         header_title = $1,
//         header_sub_title = $2,
//         header_description = $3,
//         start_date = $4,
//         end_date = $5,
//         location = $6,
//         price = $7,
//         seats = $8,
//         points = $9,
//         footer_title = $10,
//         footer_sub_title = $11,
//         footer_description = $12
//       WHERE bootcamp_id = $13
//       RETURNING *;
//     `;

//     const { rows: [bootcamp] } = await client.query(bootcampUpdateQuery, [
//       header_title, header_sub_title, header_description,
//       start_date, end_date, location, price, seats, points,
//       footer_title, footer_sub_title, footer_description,
//       bootcamp_id
//     ]);

//     if (!bootcamp) {
//       throw new ApiError(DB_ERROR, 'Bootcamp not found', null, true);
//     }

//     // ------------------------
//     // 2️⃣ Remove old structure
//     // ------------------------
//     await client.query(`
//       DELETE FROM session_speakers 
//       WHERE session_id IN (
//         SELECT session_id FROM sessions 
//         WHERE program_day_id IN (
//           SELECT program_day_id FROM program_days WHERE bootcamp_id = $1
//         )
//       );
//     `, [bootcamp_id]);

//     await client.query(`
//       DELETE FROM sessions 
//       WHERE program_day_id IN (
//         SELECT program_day_id FROM program_days WHERE bootcamp_id = $1
//       );
//     `, [bootcamp_id]);

//     await client.query(`DELETE FROM program_days WHERE bootcamp_id = $1;`, [bootcamp_id]);

//     // ------------------------
//     // 3️⃣ Insert program days
//     // ------------------------
//     let insertedProgramDays = [];
//     let insertedSessions = [];
//     let insertedSpeakers = [];

//     if (program_days.length > 0) {
//       const dayInserts = [];
//       const dayValues = [];
//       let i = 1;

//       for (const day of program_days) {
//         dayInserts.push(`($${i++}, $${i++}, $${i++}, $${i++})`);
//         dayValues.push(bootcamp_id, day.day_number ?? null, day.title ?? null, day.description ?? null);
//       }

//       const { rows: programDayRows } = await client.query(`
//         INSERT INTO program_days (bootcamp_id, day_number, title, description)
//         VALUES ${dayInserts.join(', ')}
//         RETURNING *;
//       `, dayValues);

//       insertedProgramDays = programDayRows;
//       const programDayIds = programDayRows.map(r => r.program_day_id);

//       // ------------------------
//       // 4️⃣ Insert sessions
//       // ------------------------
//       const sessionInserts = [];
//       const sessionValues = [];
//       let j = 1;

//       program_days.forEach((day, index) => {
//         const dayId = programDayIds[index];
//         (day.sessions || []).forEach(session => {
//           sessionInserts.push(`($${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++})`);
//           sessionValues.push(
//             dayId,
//             session.title ?? null,
//             session.description ?? null,
//             session.start_time ?? null,
//             session.end_time ?? null,
//             session.date ?? null
//           );
//         });
//       });

//       if (sessionInserts.length > 0) {
//         const { rows: sessionRows } = await client.query(`
//           INSERT INTO sessions (program_day_id, title, description, start_time, end_time, date)
//           VALUES ${sessionInserts.join(', ')}
//           RETURNING *;
//         `, sessionValues);

//         insertedSessions = sessionRows;

//         // ------------------------
//         // 5️⃣ Insert session speakers (retain IDs if present)
//         // ------------------------
//         const speakerInserts = [];
//         const speakerValues = [];
//         let k = 1;

//         program_days.forEach((day, index) => {
//           (day.sessions || []).forEach((session) => {
//             const insertedSession = insertedSessions.find(
//               s =>
//                 s.title === (session.title ?? null) &&
//                 s.program_day_id === programDayIds[index]
//             );

//             const sessionId = insertedSession?.session_id;

//             (session.speakers || []).forEach(speaker => {
//               if (speaker.session_speaker_id) {
//                 // ✅ Retain existing speaker ID
//                 speakerInserts.push(`($${k++}, $${k++}, $${k++}, $${k++}, $${k++})`);
//                 speakerValues.push(
//                   speaker.session_speaker_id,
//                   sessionId ?? null,
//                   speaker.name ?? null,
//                   speaker.role ?? null,
//                   speaker.image ?? null
//                 );
//               } else {
//                 // 🆕 New speaker → auto-generate ID
//                 speakerInserts.push(`(DEFAULT, $${k++}, $${k++}, $${k++}, $${k++})`);
//                 speakerValues.push(
//                   sessionId ?? null,
//                   speaker.name ?? null,
//                   speaker.role ?? null,
//                   speaker.image ?? null
//                 );
//               }
//             });
//           });
//         });

//         if (speakerInserts.length > 0) {
//           const { rows: speakerRows } = await client.query(`
//             INSERT INTO session_speakers (session_speaker_id, session_id, name, role, image)
//             VALUES ${speakerInserts.join(', ')}
//             RETURNING session_speaker_id, session_id, name, role, image;
//           `, speakerValues);

//           insertedSpeakers = speakerRows;
//         }
//       }
//     }

//     // ------------------------
//     // 6️⃣ Commit transaction
//     // ------------------------
//     await db.commit(client);

//     // ------------------------
//     // 7️⃣ Build structured response
//     // ------------------------
//     const programDaysWithSessions = insertedProgramDays.map(day => ({
//       ...day,
//       sessions: insertedSessions
//         .filter(s => s.program_day_id === day.program_day_id)
//         .map(s => ({
//           ...s,
//           speakers: insertedSpeakers.filter(sp => sp.session_id === s.session_id)
//         })),
//     }));

//     return {
//       ...bootcamp,
//       program_days: programDaysWithSessions,
//     };

//   } catch (error) {
//     await db.rollback(client);
//     throw new ApiError(DB_ERROR, 'Update Bootcamp', error, false);
//   }
// };


// export const updateBootcampModel = async (bootcamp_id, data) => {
//   const client = await db.begin();

//   try {
//     const {
//       header_title,
//       header_sub_title,
//       header_description,
//       start_date,
//       end_date,
//       location,
//       price,
//       seats,
//       points,
//       footer_title,
//       footer_sub_title,
//       footer_description,
//       program_days = [],
//     } = data;

//     // ------------------------
//     // 1️⃣ Update bootcamp details
//     // ------------------------
//     const bootcampUpdateQuery = `
//       UPDATE bootcamps
//       SET
//         header_title = $1,
//         header_sub_title = $2,
//         header_description = $3,
//         start_date = $4,
//         end_date = $5,
//         location = $6,
//         price = $7,
//         seats = $8,
//         points = $9,
//         footer_title = $10,
//         footer_sub_title = $11,
//         footer_description = $12
//       WHERE bootcamp_id = $13
//       RETURNING *;
//     `;

//     const { rows: [bootcamp] } = await client.query(bootcampUpdateQuery, [
//       header_title, header_sub_title, header_description,
//       start_date, end_date, location, price, seats, points,
//       footer_title, footer_sub_title, footer_description,
//       bootcamp_id
//     ]);

//     if (!bootcamp) {
//       throw new ApiError(DB_ERROR, 'Bootcamp not found', null, true);
//     }

//     // ------------------------
//     // 2️⃣ Remove old structure
//     // ------------------------
//     await client.query(`
//       DELETE FROM session_speakers 
//       WHERE session_id IN (
//         SELECT session_id FROM sessions 
//         WHERE program_day_id IN (
//           SELECT program_day_id FROM program_days WHERE bootcamp_id = $1
//         )
//       );
//     `, [bootcamp_id]);

//     await client.query(`
//       DELETE FROM sessions 
//       WHERE program_day_id IN (
//         SELECT program_day_id FROM program_days WHERE bootcamp_id = $1
//       );
//     `, [bootcamp_id]);

//     await client.query(`DELETE FROM program_days WHERE bootcamp_id = $1;`, [bootcamp_id]);

//     // ------------------------
//     // 3️⃣ Insert program days
//     // ------------------------
//     let insertedProgramDays = [];
//     let insertedSessions = [];
//     let insertedSpeakers = [];

//     if (program_days.length > 0) {
//       const dayInserts = [];
//       const dayValues = [];
//       let i = 1;

//       for (const day of program_days) {
//         dayInserts.push(`($${i++}, $${i++}, $${i++}, $${i++})`);
//         dayValues.push(bootcamp_id, day.day_number ?? null, day.title ?? null, day.description ?? null);
//       }

//       const { rows: programDayRows } = await client.query(`
//         INSERT INTO program_days (bootcamp_id, day_number, title, description)
//         VALUES ${dayInserts.join(', ')}
//         RETURNING *;
//       `, dayValues);

//       insertedProgramDays = programDayRows;
//       const programDayIds = programDayRows.map(r => r.program_day_id);

//       // ------------------------
//       // 4️⃣ Insert sessions
//       // ------------------------
//       const sessionInserts = [];
//       const sessionValues = [];
//       let j = 1;

//       program_days.forEach((day, index) => {
//         const dayId = programDayIds[index];
//         (day.sessions || []).forEach(session => {
//           sessionInserts.push(`($${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++})`);
//           sessionValues.push(
//             dayId,
//             session.title ?? null,
//             session.description ?? null,
//             session.start_time ?? null,
//             session.end_time ?? null,
//             session.date ?? null
//           );
//         });
//       });

//       if (sessionInserts.length > 0) {
//         const { rows: sessionRows } = await client.query(`
//           INSERT INTO sessions (program_day_id, title, description, start_time, end_time, date)
//           VALUES ${sessionInserts.join(', ')}
//           RETURNING *;
//         `, sessionValues);

//         insertedSessions = sessionRows;

//         // ------------------------
//         // 5️⃣ Insert session speakers
//         // ------------------------



//         const speakerInserts = [];
//         const speakerValues = [];
//         let k = 1;

//         program_days.forEach((day, index) => {
//           (day.sessions || []).forEach((session) => {
//             const insertedSession = insertedSessions.find(
//               s =>
//                 s.title === (session.title ?? null) &&
//                 s.program_day_id === programDayIds[index]
//             );

//             const sessionId = insertedSession?.session_id;

//             (session.speakers || []).forEach(speaker => {
//               speakerInserts.push(`($${k++}, $${k++}, $${k++}, $${k++})`);
//               speakerValues.push(
//                 sessionId ?? null,
//                 speaker.name ?? null,
//                 speaker.role ?? null,
//                 speaker.image ?? null
//               );
//             });
//           });
//         });

//         if (speakerInserts.length > 0) {
//           const { rows: speakerRows } = await client.query(`
//             INSERT INTO session_speakers (session_id, name, role, image)
//             VALUES ${speakerInserts.join(', ')}
//             RETURNING session_speaker_id, session_id, name, role, image;
//           `, speakerValues);

//           insertedSpeakers = speakerRows;
//         }
//       }
//     }

//     // ------------------------
//     // 6️⃣ Commit transaction
//     // ------------------------
//     await db.commit(client);

//     // ------------------------
//     // 7️⃣ Build structured response
//     // ------------------------
//     const programDaysWithSessions = insertedProgramDays.map(day => ({
//       ...day,
//       sessions: insertedSessions
//         .filter(s => s.program_day_id === day.program_day_id)
//         .map(s => ({
//           ...s,
//           speakers: insertedSpeakers.filter(sp => sp.session_id === s.session_id)
//         })),
//     }));

//     return {
//       ...bootcamp,
//       program_days: programDaysWithSessions,
//     };

//   } catch (error) {
//     await db.rollback(client);
//     throw new ApiError(DB_ERROR, 'Update Bootcamp', error, false);
//   }
// };


// export const updateBootcampModel = async (bootcamp_id, data) => {
//     const client = await db.begin();

//     try {
//         const {
//             header_title,
//             header_sub_title,
//             header_description,
//             start_date,
//             end_date,
//             location,
//             price,
//             seats,
//             points,
//             footer_title,
//             footer_sub_title,
//             footer_description,
//             program_days = [],
//         } = data;

//         // ------------------------
//         // 1. Update bootcamp
//         // ------------------------
//         const bootcampUpdateQuery = `
//             UPDATE bootcamps
//             SET
//                 header_title = $1,
//                 header_sub_title = $2,
//                 header_description = $3,
//                 start_date = $4,
//                 end_date = $5,
//                 location = $6,
//                 price = $7,
//                 seats = $8,
//                 points = $9,
//                 footer_title = $10,
//                 footer_sub_title = $11,
//                 footer_description = $12
//             WHERE bootcamp_id = $13
//             RETURNING *;
//         `;

//         const { rows: [bootcamp] } = await client.query(bootcampUpdateQuery, [
//             header_title, header_sub_title, header_description,
//             start_date, end_date, location, price, seats, points,
//             footer_title, footer_sub_title, footer_description,
//             bootcamp_id
//         ]);

//         if (!bootcamp) {
//             throw new ApiError(DB_ERROR, 'Bootcamp not found', null, true);
//         }

//         // ------------------------
//         // 2. Handle program days
//         // ------------------------
//         // For simplicity, delete existing and reinsert all new
//         await client.query(`DELETE FROM sessions WHERE program_day_id IN (SELECT program_day_id FROM program_days WHERE bootcamp_id = $1);`, [bootcamp_id]);
//         await client.query(`DELETE FROM program_days WHERE bootcamp_id = $1;`, [bootcamp_id]);

//         let programDayIds = [];
//         if (program_days.length > 0) {
//             const dayInserts = [];
//             const dayValues = [];
//             let i = 1;

//             for (const day of program_days) {
//                 dayInserts.push(`($${i++}, $${i++},$${i++},$${i++})`);
//                 dayValues.push(bootcamp_id, day.day_number ?? null, day.title ?? null, day.description ?? null);
//             }

//             const { rows } = await client.query(`
//                 INSERT INTO program_days (bootcamp_id, day_number,title,description)
//                 VALUES ${dayInserts.join(', ')}
//                 RETURNING program_day_id;
//             `, dayValues);

//             programDayIds = rows.map(r => r.program_day_id);

//             // ------------------------
//             // 3. Insert sessions
//             // ------------------------
//             const sessionInserts = [];
//             const sessionValues = [];
//             let j = 1;

//             program_days.forEach((day, index) => {
//                 const dayId = programDayIds[index];
//                 (day.sessions || []).forEach(session => {
//                     sessionInserts.push(`($${j++}, $${j++}, $${j++}, $${j++}, $${j++}, $${j++})`);
//                     sessionValues.push(
//                         dayId,
//                         session.title ?? null,
//                         session.description ?? null,
//                         session.start_time ?? null,
//                         session.end_time ?? null,
//                         session.date ?? null
//                     );
//                 });
//             });

//             if (sessionInserts.length > 0) {
//                 await client.query(`
//                     INSERT INTO sessions (program_day_id, title, description, start_time, end_time,date)
//                     VALUES ${sessionInserts.join(', ')};
//                 `, sessionValues);
//             }
//         }

//         // ------------------------
//         // 4. Commit and return
//         // ------------------------
//         await db.commit(client);
//         return bootcamp;

//     } catch (error) {
//         await db.rollback(client);
//         throw new ApiError(DB_ERROR, 'Update Bootcamp', error, false);
//     }
// };

export const getBootcampSessionSpeakerByIdsModel = async (session_speaker_ids) => {
  try {
    const query = `SELECT session_speaker_id, image FROM session_speakers WHERE session_speaker_id = ANY($1)`;
    return await db.query(query, [session_speaker_ids]);
  } catch (error) {
    throw new ApiError(DB_ERROR, 'Get Bootcamp Session Speakers By IDs', error, false);
  }
};



export const updateBootcapImagesModel = async (data) => {
  try {
    const { bootcamp_id, header_image, footer_image, brochure } = data;
    return await db.query(`UPDATE bootcamps SET header_image = $1 , footer_image = $2, brochure = $3 WHERE bootcamp_id = $4`, [header_image, footer_image, brochure, bootcamp_id]);
  } catch (error) {
    throw new ApiError(DB_ERROR, 'Update Bootcamp', error, false);
  }
};


export const getBootcampByIdModel = async (bootcamp_id) => {
  try {
    return db.query(`
      SELECT
        b.bootcamp_id,
        b.header_title,
        b.header_sub_title,
        b.header_description,
        b.header_image,
        b.start_date,
        b.end_date,
        b.location,
        b.price,
        b.seats,
        b.points,
        b.footer_title,
        b.footer_sub_title,
        b.footer_description,
        b.footer_image,
        b.brochure,
        b.created_at,
        b.brochure_color,b.footer_color,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'program_day_id', pd_data.program_day_id,
              'day_number', pd_data.day_number,
              'title', pd_data.title,
              'description', pd_data.description,
              'sessions', COALESCE(pd_data.sessions, '[]'::json)
            )
            ORDER BY pd_data.day_number
          ) FILTER (WHERE pd_data.program_day_id IS NOT NULL),
          '[]'
        ) AS program_days
      FROM bootcamps b
      LEFT JOIN (
        SELECT
          pd.program_day_id,
          pd.bootcamp_id,
          pd.day_number,
          pd.title,
          pd.description,
          json_agg(
            jsonb_build_object(
              'session_id', s.session_id,
              'title', s.title,
              'description', s.description,
              'start_time', s.start_time,
              'end_time', s.end_time,
              'date', s.date,
              'speakers', COALESCE(sp.speakers, '[]'::json)
            )
            ORDER BY s.start_time
          ) AS sessions
        FROM program_days pd
        LEFT JOIN sessions s ON s.program_day_id = pd.program_day_id
        LEFT JOIN (
          SELECT
            ss.session_id,
            json_agg(
              jsonb_build_object(
                'session_speaker_id', ss.session_speaker_id,
                'name', ss.name,
                'role', ss.role,
                'image', ss.image,
                'created_at', ss.created_at
              )
            ) AS speakers
          FROM session_speakers ss
          GROUP BY ss.session_id
        ) sp ON sp.session_id = s.session_id
        GROUP BY pd.program_day_id, pd.bootcamp_id, pd.day_number, pd.title, pd.description
      ) AS pd_data ON pd_data.bootcamp_id = b.bootcamp_id
      WHERE b.delete_flag = 0 AND b.bootcamp_id = $1
      GROUP BY b.bootcamp_id
 
    `, [bootcamp_id]);

  } catch (error) {
    throw new ApiError(DB_ERROR, 'Get Bootcamp By ID', error, false);
  }
};

export const getAllBootcampModel = async () => {
  try {
    const query = `
      SELECT
        b.bootcamp_id,
        b.header_title,
        b.header_sub_title,
        b.header_description,
        b.header_image,
        b.start_date,
        b.end_date,
        b.location,
        b.price,
        b.seats,
        b.points,
        b.footer_title,
        b.footer_sub_title,
        b.footer_description,
        b.footer_image,
        b.brochure,
        b.created_at,
        b.brochure_color,b.footer_color,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'program_day_id', pd_data.program_day_id,
              'day_number', pd_data.day_number,
              'title', pd_data.title,
              'description', pd_data.description,
              'sessions', COALESCE(pd_data.sessions, '[]'::json)
            )
            ORDER BY pd_data.day_number
          ) FILTER (WHERE pd_data.program_day_id IS NOT NULL),
          '[]'
        ) AS program_days
      FROM bootcamps b
      LEFT JOIN (
        SELECT
          pd.program_day_id,
          pd.bootcamp_id,
          pd.day_number,
          pd.title,
          pd.description,
          json_agg(
            jsonb_build_object(
              'session_id', s.session_id,
              'title', s.title,
              'description', s.description,
              'start_time', s.start_time,
              'end_time', s.end_time,
              'date', s.date,
              'speakers', COALESCE(sp.speakers, '[]'::json)
            )
            ORDER BY s.start_time
          ) AS sessions
        FROM program_days pd
        LEFT JOIN sessions s ON s.program_day_id = pd.program_day_id
        LEFT JOIN (
          SELECT
            ss.session_id,
            json_agg(
              jsonb_build_object(
                'session_speaker_id', ss.session_speaker_id,
                'name', ss.name,
                'role', ss.role,
                'image', ss.image,
                'created_at', ss.created_at
              )
            ) AS speakers
          FROM session_speakers ss
          GROUP BY ss.session_id
        ) sp ON sp.session_id = s.session_id
        GROUP BY pd.program_day_id, pd.bootcamp_id, pd.day_number, pd.title, pd.description
      ) AS pd_data ON pd_data.bootcamp_id = b.bootcamp_id
      WHERE b.delete_flag = 0
      GROUP BY b.bootcamp_id
    `;

    return await db.query(query);
  } catch (error) {
    throw new ApiError(DB_ERROR, 'Get All Bootcamps', error, false);
  }
};

export const deleteBootcampModel = async (bootcamp_id) => {
  try {
    return await db.query(`UPDATE bootcamps SET delete_flag = 1 WHERE bootcamp_id = $1`, [bootcamp_id]);
  } catch (error) {
    throw new ApiError(DB_ERROR, 'Delete Bootcamp', error, false);
  }
};

export const getPublicBootcampModel = async () => {
  try {
    return await db.query(`
      SELECT 
        b.bootcamp_id,
        b.header_title,
        b.header_sub_title,
        b.header_description,
        b.header_image,
        b.start_date,
        b.end_date,
        b.location,
        b.price,
        b.seats,
        (b.seats - COALESCE(bb.booking_count, 0)) AS available_seats,
        b.points,
        b.footer_title,
        b.footer_sub_title,
        b.footer_description,
        b.footer_image,
        b.brochure,
        b.created_at,
        b.brochure_color,b.footer_color,
        COALESCE(pd_data.program_days, '[]'::json) AS program_days
      FROM bootcamps b
      LEFT JOIN (
        SELECT 
          bootcamp_id,
          COUNT(*) AS booking_count
        FROM bootcamp_bookings
        GROUP BY bootcamp_id
      ) AS bb ON bb.bootcamp_id = b.bootcamp_id
      LEFT JOIN (
        SELECT 
          pd.bootcamp_id,
          json_agg(
            jsonb_build_object(
              'program_day_id', pd.program_day_id,
              'day_number', pd.day_number,
              'title', pd.title,
              'description', pd.description,
              'sessions', COALESCE(s.sessions, '[]'::json)
            ) ORDER BY pd.day_number
          ) AS program_days
        FROM program_days pd
        LEFT JOIN (
          SELECT 
            s.program_day_id,
            json_agg(
              jsonb_build_object(
                'session_id', s.session_id,
                'title', s.title,
                'description', s.description,
                'start_time', s.start_time,
                'end_time', s.end_time,
                'date', s.date,
                'speakers', COALESCE(sp.speakers, '[]'::json)
              ) ORDER BY s.start_time
            ) AS sessions
          FROM sessions s
          LEFT JOIN (
            SELECT 
              ss.session_id,
              json_agg(
                jsonb_build_object(
                  'session_speaker_id', ss.session_speaker_id,
                  'name', ss.name,
                  'role', ss.role,
                  'image', ss.image,
                  'created_at', ss.created_at
                ) ORDER BY ss.session_speaker_id
              ) AS speakers
            FROM session_speakers ss
            GROUP BY ss.session_id
          ) AS sp ON sp.session_id = s.session_id
          GROUP BY s.program_day_id
        ) AS s ON s.program_day_id = pd.program_day_id
        GROUP BY pd.bootcamp_id
      ) AS pd_data ON pd_data.bootcamp_id = b.bootcamp_id
      WHERE b.delete_flag = 0
        AND b.end_date >= NOW()
      ORDER BY b.start_date ASC
    `);
  } catch (error) {
    throw new ApiError(DB_ERROR, 'Get Public Bootcamps', error, false);
  }
};

export const getBootcampBookingHistoryModel = async (bootcamp_id = null) => {
  try {
    // base query
    let query = `
      SELECT 
        bb.*,
        b.header_title,
        b.header_sub_title,
        b.header_description,
        b.start_date,
        b.end_date,
        b.location,
        b.price AS bootcamp_price
      FROM bootcamp_bookings bb
      LEFT JOIN bootcamps b 
        ON bb.bootcamp_id = b.bootcamp_id
    `;

    const params = [];

    // conditionally add WHERE clause
    if (bootcamp_id) {
      query += ` WHERE bb.bootcamp_id = $1`;
      params.push(bootcamp_id);
    }

    // always order by latest
    query += ` ORDER BY bb.created_at DESC`;

    // run query
    return await db.query(query, params);

  } catch (error) {
    throw new ApiError(DB_ERROR, "Get Bootcamp Booking History", error, false);
  }
};


export const getCoachPurchaseSubscriptionHistoryModel = async () => {
  try {
    return await db.query(
      `
      SELECT 
        p.*,
        u.role,
        u.email,
        u.full_name,
        u.phone_number,
        s.title,
        s.subscription_days,
        s.price,
        s.description
      FROM purchase_subscription p
      LEFT JOIN users u 
        ON p.user_id = u.user_id
        LEFT JOIN subscriptions s 
        ON p.subscription_id = s.subscription_id
      ORDER BY p.created_at DESC;
      `
    );
  } catch (error) {
    throw new ApiError(DB_ERROR, "Get Coach Purchase Subscription History", error, false);
  }
};

export const getBootcampBookingWaitinglistModel = async () => {
  try {
    return await db.query(
      `SELECT 
          bb.*,
          b.header_title,
          b.header_sub_title,
          b.header_description,
          b.start_date,
          b.end_date,
          b.location,
          b.price AS bootcamp_price
      FROM bootcamp_waitinglists bb
      LEFT JOIN bootcamps b 
          ON bb.bootcamp_id = b.bootcamp_id
      ORDER BY bb.created_at DESC`,
      []
    );
  } catch (error) {
    throw new ApiError(DB_ERROR, "Get Bootcamp Booking History", error, false);
  }
};


export const createWorkshopModel = async ({
  user_id,
  section_1,
  section_2,
  section_3,
  section_4,
  section_5,
  section_6,
  schedule_date,
  is_admin = 0,
  admin_id,
  location,
  language,
  hours
}) => {
  try {
    // Insert into workshop table
    const workshopResult = await db.query(
      `INSERT INTO workshop (user_id,schedule_date,is_admin,admin_id,location,language,hours) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_id, schedule_date, is_admin, admin_id, location, language, hours]
    );
    const workshop = workshopResult[0];

    // Insert into workshop_section table
    const sectionResult = await db.query(
      `INSERT INTO workshop_section 
        (workshop_id, section_1, section_2, section_3, section_4, section_5, section_6) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
      [
        workshop.workshop_id,
        section_1,
        section_2,
        section_3,
        section_4,
        section_5,
        section_6,
      ]
    );
    const workshopSection = sectionResult[0];

    // Optionally return both workshop and section
    return {
      workshop,
      workshopSection,
    };
  } catch (error) {
    throw new ApiError(DB_ERROR, "Creating Workshop", error, false);
  }
};

export const updateWorkshopModel = async ({
  workshop_id,
  section_1,
  section_2,
  section_3,
  section_4,
  section_5,
  section_6,
  schedule_date,
  location,
  language,
  hours
}) => {
  try {


    // Step 3: Update workshop table
    await db.query(
      `UPDATE workshop 
             SET schedule_date = $1, location = $2, language = $3, hours = $4
             WHERE workshop_id = $5`,
      [schedule_date, location, language, hours, workshop_id]
    );

    // Step 4: Update workshop_section table
    const sectionUpdate = await db.query(
      `UPDATE workshop_section 
             SET section_1 = $1, section_2 = $2, section_3 = $3, section_4 = $4, section_5 = $5, section_6 = $6 
             WHERE workshop_id = $7 
             RETURNING *`,
      [
        section_1,
        section_2,
        section_3,
        section_4,
        section_5,
        section_6,
        workshop_id
      ]
    );

    const updatedSections = sectionUpdate[0];

    return {
      workshop: {
        workshop_id,
        schedule_date,
      },
      workshopSection: updatedSections
    };
  } catch (error) {
    throw new ApiError(DB_ERROR, "Updating Workshop", error, false);
  }
};

export const updateWorkshop2ImagesModel = async ({
  workshop_id,
  image1, image2
}) => {
  try {

    // Step 4: Update workshop_section table
    const sectionUpdate = await db.query(
      `UPDATE workshop_section 
             SET image1 = $1, image2 = $2 
             WHERE workshop_id = $3 
             RETURNING *`,
      [
        image1,
        image2,
        workshop_id
      ]
    );

    const updatedSections = sectionUpdate[0];

    return updatedSections;
  } catch (error) {
    throw new ApiError(DB_ERROR, "Updating Workshop", error, false);
  }
};


export const getWorkshopByIdModel = async (workshop_id) => {
  try {
    return await db.query(`SELECT 
        w.*,
        ws.section_1,
        ws.section_2,
        ws.section_3,
        ws.section_4,
        ws.section_5,
        ws.section_6,
        ws.image1,
        ws.image2,
        COALESCE(
          json_agg(
            json_build_object(
              'workshop_speaker_id', sp.workshop_speaker_id,
              'name', sp.name,
              'role', sp.role,
              'sub_role', sp.sub_role,
              'image', sp.image
            )
              ORDER BY sp.workshop_speaker_id ASC
          ) FILTER (WHERE sp.workshop_speaker_id IS NOT NULL), '[]'
        ) AS speakers
      FROM workshop w
      LEFT JOIN workshop_section ws ON ws.workshop_id = w.workshop_id
      LEFT JOIN workshop_speakers sp ON sp.workshop_id = w.workshop_id
      WHERE w.workshop_id = $1 AND w.delete_flag = 0
      GROUP BY w.workshop_id, ws.workshop_section_id`, [workshop_id]);
  } catch (error) {
    throw new ApiError(DB_ERROR, "Getting Workshop", error, false);
  }
};

export const createWorkshopSpeakersModel = async (data) => {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Data must be a non-empty array");
    }

    const values = [];
    const params = [];

    data.forEach((item, index) => {
      const { workshop_id, name, role, sub_role, image } = item;
      // Calculate parameter positions e.g., ($1, $2, $3, $4, $5), ($6, $7, ...)
      const paramIndex = index * 5;
      values.push(`($${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5})`);
      params.push(workshop_id, name, role, sub_role, image);
    });

    const query = `
            INSERT INTO workshop_speakers (workshop_id, name, role, sub_role, image)
            VALUES ${values.join(', ')}
        `;

    return await db.query(query, params);
  } catch (error) {
    throw new ApiError(DB_ERROR, "Creating Workshop Speakers", error, false);
  }
};

export const updateWorkshopSpeakersModel = async (data) => {
  try {

    const workshop_id = data[0].workshop_id;

    // 1. Delete existing speakers for the workshop
    await db.query(
      `DELETE FROM workshop_speakers WHERE workshop_id = $1`,
      [workshop_id]
    );

    // 2. Prepare new insert values
    const values = [];
    const params = [];

    data.forEach((item, index) => {
      const { workshop_id, name, role, sub_role, image } = item;
      const paramIndex = index * 5;
      values.push(`($${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5})`);
      params.push(workshop_id, name, role, sub_role, image);
    });

    const insertQuery = `
            INSERT INTO workshop_speakers (workshop_id, name, role, sub_role, image)
            VALUES ${values.join(', ')}
        `;

    // 3. Insert new speakers
    return await db.query(insertQuery, params);
  } catch (error) {
    throw new ApiError(DB_ERROR, "Updating Workshop Speakers", error, false);
  }
};



export const getWorkshopSpeakersModel = async (workshop_id) => {
  try {
    return await db.query(`SELECT * FROM workshop_speakers WHERE workshop_id = $1`, [workshop_id]);
  } catch (error) {
    throw new ApiError(DB_ERROR, "Getting Workshop Speakers", error, false);
  }
};

export const getWorkshopByUserIdModel = async (user_id) => {
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
        ws.image1,
        ws.image2,
        COALESCE(
          json_agg(
            json_build_object(
              'workshop_speaker_id', sp.workshop_speaker_id,
              'name', sp.name,
              'role', sp.role,
              'sub_role', sp.sub_role,
              'image', sp.image
            )
              ORDER BY sp.workshop_speaker_id ASC
          ) FILTER (WHERE sp.workshop_speaker_id IS NOT NULL), '[]'
        ) AS speakers
      FROM workshop w
      LEFT JOIN workshop_section ws ON ws.workshop_id = w.workshop_id
      LEFT JOIN workshop_speakers sp ON sp.workshop_id = w.workshop_id
      WHERE w.user_id = $1 AND w.delete_flag = 0
      GROUP BY w.workshop_id, ws.workshop_section_id
      ORDER BY w.created_at DESC
    `;

    return await db.query(query, [user_id]);;
  } catch (error) {
    throw new ApiError(DB_ERROR, "Getting Workshop with Sections and Speakers", error, false);
  }
};

export const getAllWorkshopModel = async () => {
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
        ws.image1,
        ws.image2,
        COALESCE(
          json_agg(
            json_build_object(
              'workshop_speaker_id', sp.workshop_speaker_id,
              'name', sp.name,
              'role', sp.role,
              'sub_role', sp.sub_role,
              'image', sp.image
            )
              ORDER BY sp.workshop_speaker_id ASC
          ) FILTER (WHERE sp.workshop_speaker_id IS NOT NULL), '[]'
        ) AS speakers
      FROM workshop w 
      LEFT JOIN workshop_section ws ON ws.workshop_id = w.workshop_id
      LEFT JOIN workshop_speakers sp ON sp.workshop_id = w.workshop_id
      WHERE w.delete_flag = 0
      GROUP BY w.workshop_id, ws.workshop_section_id
      ORDER BY w.created_at DESC;
    `;

    return await db.query(query);;
  } catch (error) {
    throw new ApiError(DB_ERROR, "Getting Workshop with Sections and Speakers", error, false);
  }
};

export const getFutureWorkshopModel = async (user_id) => {
  try {
    let query = `
      SELECT 
        w.*,
        ws.section_1,
        ws.section_2,
        ws.section_3,
        ws.section_4,
        ws.section_5,
        ws.section_6,
        ws.image1,
        ws.image2,
        u.role,
        COALESCE(
          json_agg(
            json_build_object(
              'workshop_speaker_id', sp.workshop_speaker_id,
              'name', sp.name,
              'role', sp.role,
              'sub_role', sp.sub_role,
              'image', sp.image
            )
              ORDER BY sp.workshop_speaker_id ASC
          ) FILTER (WHERE sp.workshop_speaker_id IS NOT NULL), '[]'
        ) AS speakers,
         CASE 
         WHEN w.is_admin = 0 THEN u.full_name
         WHEN w.is_admin = 1 THEN 'Nuvio Team'
         ELSE NULL
         END AS created_user_name
      FROM workshop w
      LEFT JOIN workshop_section ws ON ws.workshop_id = w.workshop_id
      LEFT JOIN workshop_speakers sp ON sp.workshop_id = w.workshop_id
      LEFT JOIN users u ON u.user_id = w.user_id
      WHERE w.schedule_date > NOW() AND w.delete_flag = 0  AND (w.is_admin = 1 OR (w.is_admin = 0 AND u.is_deleted = false AND u.is_disabled = false))
    `;

    let params = [];
    if (user_id) {
      query += ` AND w.user_id = $1`;
      params.push(user_id);
    }

    query += ` GROUP BY w.workshop_id, ws.workshop_section_id,u.full_name,u.role
      ORDER BY w.schedule_date ASC`

    return await db.query(query, params);
  } catch (error) {
    throw new ApiError(DB_ERROR, "Getting Workshop with Sections and Speakers", error, false);
  }
};


export const deleteWorkshopModel = async (workshop_id) => {
  try {
    return await db.query(`UPDATE workshop SET delete_flag = 1 WHERE workshop_id = $1`, [workshop_id]);
  } catch (error) {
    throw new ApiError(DB_ERROR, "Deleting Workshop", error, false);
  }
};

export const getAllOpenTalentModel = async () => {
  try {
    return await db.query(`
            SELECT 
                u.*, 
                o.*, 
                
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'purchase_id', ps.purchase_id,
                            'subscription_id', ps.subscription_id,
                            'purchase_date', ps.purchase_date,
                            'expiry_date', ps.expiry_date,
                            'total_price', ps.total_price,
                            'title', s.title,
                            'subscription_days', s.subscription_days,
                            'created_at', s.created_at,
                            'is_active', 
                                CASE WHEN ps.expiry_date >= NOW() THEN true ELSE false END
                        )
                    ) FILTER (WHERE ps.purchase_id IS NOT NULL),
                    '[]'
                ) AS subscriptions,

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

            FROM users u
            JOIN open_talent o ON u.user_id = o.user_id
            LEFT JOIN purchase_subscription ps ON ps.user_id = u.user_id
            LEFT JOIN subscriptions s ON s.subscription_id = ps.subscription_id
            
            LEFT JOIN open_talent_projects p ON p.user_id = u.user_id
            LEFT JOIN certificates c ON c.user_id = u.user_id

            WHERE u.role = 'OPEN_TALENT'
            GROUP BY u.user_id, o.open_talent_id
            ORDER BY u.created_at DESC 
        `);
  } catch (error) {
    throw new ApiError(DB_ERROR, "All Coaches with Subscriptions", error, false);
  }
};

export const getOpenTalentByIdModel = async (user_id) => {
  try {
    return await db.query(`
            SELECT 
                u.*, 
                o.*, 
                
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'purchase_id', ps.purchase_id,
                            'subscription_id', ps.subscription_id,
                            'purchase_date', ps.purchase_date,
                            'expiry_date', ps.expiry_date,
                            'total_price', ps.total_price,
                            'title', s.title,
                            'subscription_days', s.subscription_days,
                            'created_at', s.created_at,
                            'is_active', 
                                CASE WHEN ps.expiry_date >= NOW() THEN true ELSE false END
                        )
                    ) FILTER (WHERE ps.purchase_id IS NOT NULL),
                    '[]'
                ) AS subscriptions,

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

            FROM users u
            JOIN open_talent o ON u.user_id = o.user_id
            LEFT JOIN purchase_subscription ps ON ps.user_id = u.user_id
            LEFT JOIN subscriptions s ON s.subscription_id = ps.subscription_id
            
            LEFT JOIN open_talent_projects p ON p.user_id = u.user_id
            LEFT JOIN certificates c ON c.user_id = u.user_id

            WHERE u.role = 'OPEN_TALENT' AND u.user_id = $1
            GROUP BY u.user_id, o.open_talent_id
            ORDER BY u.created_at DESC 
        `, [user_id]);
  } catch (error) {
    throw new ApiError(DB_ERROR, "All Coaches with Subscriptions", error, false);
  }
};

export const getAllOffersModel = async () => {
  try {
    return await db.query(`
      SELECT o.*,u.full_name,u.role,u.profile_image,u.phone_number,u.email FROM offers o  
     LEFT JOIN users u ON o.user_id = u.user_id WHERE o.is_active = true ORDER BY o.created_at DESC
      `)
  } catch (error) {
    throw new ApiError(DB_ERROR, "Get all offers", error, false);
  }
}

export const getOffersByIdModel = async (offer_id) => {
  try {
    return await db.query(`
      SELECT o.*,u.full_name,u.role,u.profile_image,u.phone_number,u.email FROM offers o  
     LEFT JOIN users u ON o.user_id = u.user_id WHERE o.is_active = true AND o.offer_id = $1
      `, [offer_id])
  } catch (error) {
    throw new ApiError(DB_ERROR, "Get all offers", error, false);
  }
}

export const switchBlockUnblockModel = async (is_active, user_id) => {
  try {
    return await db.query(`
      UPDATE users SET is_active = $1  WHERE user_id = $2
      `, [is_active, user_id])
  } catch (error) {
    throw new ApiError(DB_ERROR, "Switch Block Unblock", error, false);
  }
}


export const createContentModel = async (data) => {
  const client = await db.begin();
  try {
    const {
      title,
      short_description,
      content_type,
      category,
      visibility,
      status,
      user_id,
      is_admin_created,
      image,
      files = []
    } = data;

    // ⚠️ NO client.query("BEGIN") — already done in db.begin()

    const contentResult = await client.query(
      `
            INSERT INTO contents (
                title,
                short_description,
                content_type,
                category,
                visibility,
                status,
                user_id,
                is_admin_created,
                image
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
            `,
      [
        title,
        short_description,
        content_type,
        category,
        visibility,
        status,
        user_id,
        is_admin_created,
        image
      ]
    );

    const content = contentResult.rows[0];
    const content_id = content.content_id;

    if (files.length > 0) {
      const values = [];
      const placeholders = files
        .map((file, index) => {
          const base = index * 2;
          values.push(content_id, file);
          return `($${base + 1}, $${base + 2})`;
        })
        .join(",");

      await client.query(
        `
                INSERT INTO content_files (content_id, file)
                VALUES ${placeholders};
                `,
        values
      );
    }

    await db.commit(client); // ✅ handles COMMIT + RELEASE
    return content;

  } catch (error) {
    await db.rollback(client); // ✅ handles ROLLBACK + RELEASE
    throw new ApiError(DB_ERROR, "Creating Content", error, false);
  }
};


export const getAllContentsModel = async (content_type, category_id, view) => {
  try {
    let query = `
            SELECT
                c.content_id,
                c.title,
                c.short_description,
                c.content_type,
                c.category,
                c.visibility,
                c.status,
                c.is_admin_created,
                c.created_at,
                c.user_id,
                c.image,

                /* ✅ created_by logic */
                CASE
                    WHEN c.is_admin_created = true THEN 'Nuvio Team'
                    ELSE u.full_name
                END AS created_by,

                 CASE
                    WHEN c.is_admin_created = true THEN 'Nuvio Team Role'
                    ELSE cat.category_name
                END AS created_role,

                /* ✅ files as array */
                COALESCE(
                    json_agg(
                        json_build_object(
                            'content_file_id', cf.content_file_id,
                            'file', cf.file,
                            'created_at', cf.created_at
                        )
                    ) FILTER (WHERE cf.content_file_id IS NOT NULL),
                    '[]'
                ) AS files

            FROM contents c
            LEFT JOIN users u
                ON u.user_id = c.user_id
            
            LEFT JOIN coaches co
                ON co.user_id = c.user_id

            LEFT JOIN categories cat
                ON cat.category_id = co.category_id

            LEFT JOIN content_files cf
                ON cf.content_id = c.content_id

                WHERE c.is_deleted = false 
            `

    if (content_type) {
      query += ` AND c.content_type = '${content_type}'`
    }

    if (category_id) {
      query += ` AND co.category_id = '${category_id}'`
    }

    if (view == "admin") {
      query += `
        AND (
            (c.is_admin_created = false AND c.status IN ('Published','Archived'))
            OR
            (c.is_admin_created = true AND c.status IN ('Draft','Published','Archived'))
        )
      `;
    }

    if (view == "public") {
      query += ` AND c.status = 'Published' `;
      query += ` AND c.visibility = 'Public' `
    }

    query += ` GROUP BY
                c.content_id,
                u.full_name,
                cat.category_name

            ORDER BY c.created_at DESC`

    const result = await db.query(query);

    return result;
  } catch (error) {
    throw new ApiError(DB_ERROR, "Getting Contents", error, false);
  }
};


export const updateContentModel = async (content_id, data) => {
  const client = await db.begin();
  try {
    const {
      title,
      short_description,
      content_type,
      category,
      visibility,
      status,
      image,
      files = [],            // New files to insert
      content_file_ids = []  // Existing file IDs to delete
    } = data;

    // 1️⃣ Update the main content record
    const updateContentQuery = `
            UPDATE contents
            SET
                title = $1,
                short_description = $2,
                content_type = $3,
                category = $4,
                visibility = $5,
                status = $6,
                image = $7
            WHERE content_id = $8
            RETURNING *;
        `;
    const contentResult = await client.query(updateContentQuery, [
      title,
      short_description,
      content_type,
      category,
      visibility,
      status,
      image,
      content_id
    ]);

    const content = contentResult.rows[0];

    // 2️⃣ Delete specific files if content_file_ids are provided
    if (content_file_ids.length > 0) {
      const placeholders = content_file_ids.map((_, index) => `$${index + 1}`).join(", ");
      await client.query(
        `DELETE FROM content_files WHERE content_id = $${content_file_ids.length + 1} AND content_file_id IN (${placeholders});`,
        [...content_file_ids, content_id]
      );
    }

    // 3️⃣ Insert new files if provided
    if (files.length > 0) {
      const values = [];
      const placeholders = files
        .map((file, index) => {
          const base = index * 2;
          values.push(content_id, file);
          return `($${base + 1}, $${base + 2})`;
        })
        .join(",");

      await client.query(
        `INSERT INTO content_files (content_id, file) VALUES ${placeholders};`,
        values
      );
    }

    await db.commit(client); // ✅ Commit transaction
    return content;

  } catch (error) {
    await db.rollback(client); // ✅ Rollback transaction
    throw new ApiError(DB_ERROR, "Updating Content", error, false);
  }
};


export const getContentByIdModel = async (content_id) => {
  try {
    const [result] = await db.query(
      `
            SELECT
                c.content_id,
                c.title,
                c.short_description,
                c.content_type,
                c.category,
                c.visibility,
                c.status,
                c.is_admin_created,
                c.created_at,
                c.user_id,
                c.image,

                /* ✅ created_by logic */
                CASE
                    WHEN c.is_admin_created = true THEN 'Nuvio Team'
                    ELSE u.full_name
                END AS created_by,

                CASE
                    WHEN c.is_admin_created = true THEN 'Nuvio Team Role'
                    ELSE cat.category_name
                END AS created_role,

                /* ✅ files as array */
                COALESCE(
                    json_agg(
                        json_build_object(
                            'content_file_id', cf.content_file_id,
                            'file', cf.file,
                            'created_at', cf.created_at
                        )
                    ) FILTER (WHERE cf.content_file_id IS NOT NULL),
                    '[]'
                ) AS files

            FROM contents c
            LEFT JOIN users u
                ON u.user_id = c.user_id

            LEFT JOIN content_files cf
                ON cf.content_id = c.content_id

            LEFT JOIN coaches co
                ON co.user_id = c.user_id

            LEFT JOIN categories cat
                ON cat.category_id = co.category_id

            WHERE c.content_id = $1 AND c.is_deleted = false

            GROUP BY
                c.content_id,
                u.full_name,
                cat.category_name

            ORDER BY c.created_at DESC;
            `, [content_id]
    );

    return result;
  } catch (error) {
    throw new ApiError(DB_ERROR, "Getting Contents", error, false);
  }
};

export const getContentByUserIdModel = async (user_id, content_type, view) => {
  try {
    let query = `
            SELECT
                c.content_id,
                c.title,
                c.short_description,
                c.content_type,
                c.category,
                c.visibility,
                c.status,
                c.is_admin_created,
                c.created_at,
                c.user_id,
                c.image,

                /* ✅ created_by logic */
                CASE
                    WHEN c.is_admin_created = true THEN 'Nuvio Team'
                    ELSE u.full_name
                END AS created_by,

                CASE
                    WHEN c.is_admin_created = true THEN 'Nuvio Team Role'
                    ELSE cat.category_name
                END AS created_role,

                /* ✅ files as array */
                COALESCE(
                    json_agg(
                        json_build_object(
                            'content_file_id', cf.content_file_id,
                            'file', cf.file,
                            'created_at', cf.created_at
                        )
                    ) FILTER (WHERE cf.content_file_id IS NOT NULL),
                    '[]'
                ) AS files

            FROM contents c
            LEFT JOIN users u
                ON u.user_id = c.user_id

            LEFT JOIN content_files cf
                ON cf.content_id = c.content_id

            LEFT JOIN coaches co
                ON co.user_id = c.user_id

            LEFT JOIN categories cat
                ON cat.category_id = co.category_id

            WHERE c.user_id = $1 AND c.is_deleted = false
            `

    if (content_type) {
      query += ` AND c.content_type = '${content_type}'`
    }

    if (view == "admin") {
      query += ` AND c.visibility IN ('Public','Private','Restricted')`
      query += `
        AND (
            (c.is_admin_created = false AND c.status IN ('Published','Archived'))
            OR
            (c.is_admin_created = true AND c.status IN ('Draft','Published','Archived'))
        )
      `;
    } else if (view == "public") {
      query += ` AND c.visibility = 'Public'`;
      query += ` AND c.status = 'Published' `;
    }

    query += ` GROUP BY
                c.user_id,
                u.full_name,
                c.content_id,
                 cat.category_name

            ORDER BY c.created_at DESC`

    const result = await db.query(query, [user_id]);

    return result;
  } catch (error) {
    throw new ApiError(DB_ERROR, "Getting Contents", error, false);
  }
};

export const deleteContentModel = async (content_id) => {
  try {
    return await db.query(`UPDATE contents SET is_deleted = true WHERE content_id = $1`, [content_id]);
  } catch (error) {
    throw new ApiError(DB_ERROR, "Delete Content", error, false);
  }
};