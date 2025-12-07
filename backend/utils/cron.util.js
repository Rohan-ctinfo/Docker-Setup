import cron from "node-cron";
import moment from "moment";
import {
    getWebinarEmailNotificationData,
    getBootcampEmailNotificationData,
    bulkUpdateReminderEmails
} from "../model/public.model.js";
import { send1HReminderEmail, send24HReminderEmail } from "./email.util.js";

const reminderNotificationsCron = async () => {
    try {
        const NOW = moment.utc(); // current UTC time
        const EVENT_DATE = moment.utc(process.env.EVENT_DATE, "YYYY-MM-DD HH:mm:ss");

        // Function to determine if a reminder should be sent
        // targetMinutes = 24*60 for 24H, 60 for 1H
        // reminderSent = boolean flag from DB
        const shouldSendReminder = (eventTime, targetMinutes, reminderSent) => {
            const diff = eventTime.diff(NOW, 'minutes');
            // Send if reminder not yet sent and targetMinutes not passed yet
            return !reminderSent && diff <= targetMinutes;
        };

        // Fetch webinar & bootcamp reminders in parallel
        const [webinarAll, bootcampAll] = await Promise.all([
            getWebinarEmailNotificationData(),
            getBootcampEmailNotificationData()
        ]);

        // Filter reminders using catch-up logic
        const reminder24HWebinar = webinarAll.filter(u =>
            shouldSendReminder(u.schedule_date ? moment.utc(u.schedule_date, "YYYY-MM-DD HH:mm:ss") : EVENT_DATE, 24 * 60, u.reminder_24h_sent)
        );
        const reminder1HWebinar = webinarAll.filter(u =>
            shouldSendReminder(u.schedule_date ? moment.utc(u.schedule_date, "YYYY-MM-DD HH:mm:ss") : EVENT_DATE, 60, u.reminder_1h_sent)
        );

        const reminder24HBootcamp = bootcampAll.filter(u =>
            shouldSendReminder(EVENT_DATE, 24 * 60, u.reminder_24h_sent)
        );
        const reminder1HBootcamp = bootcampAll.filter(u =>
            shouldSendReminder(EVENT_DATE, 60, u.reminder_1h_sent)
        );

        // console.log("EVENT_DATE 24H catch-up check:", shouldSendReminder(EVENT_DATE, 24 * 60, false));

        // Function to send emails in parallel & track results
        const sendEmails = (reminders, sendFunction, idField, nameField, type) => {
            return reminders.map(user =>
                sendFunction({
                    email: user.email,
                    first_name: user[nameField],
                    date_time: user.schedule_date
                        ? moment.utc(user.schedule_date, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss")
                        : EVENT_DATE.format("YYYY-MM-DD HH:mm:ss"),
                    res: null
                })
                    .then(() => ({ success: true, id: user[idField], type }))
                    .catch(() => ({ success: false, id: user[idField], type }))
            );
        };

        // Flatten all email sending promises into a single array
        const allEmailPromises = [
            ...sendEmails(reminder24HWebinar, send24HReminderEmail, 'webinar_registration_id', 'first_name', 'webinar24h'),
            ...sendEmails(reminder1HWebinar, send1HReminderEmail, 'webinar_registration_id', 'first_name', 'webinar1h'),
            ...sendEmails(reminder24HBootcamp, send24HReminderEmail, 'bootcamp_id', 'name', 'bootcamp24h'),
            ...sendEmails(reminder1HBootcamp, send1HReminderEmail, 'bootcamp_id', 'name', 'bootcamp1h'),
        ];

        // Send all emails in parallel
        const allResults = await Promise.all(allEmailPromises);

        // Separate results by type
        const results24HWebinar = allResults.filter(r => r.type === 'webinar24h');
        const results1HWebinar = allResults.filter(r => r.type === 'webinar1h');
        const results24HBootcamp = allResults.filter(r => r.type === 'bootcamp24h');
        const results1HBootcamp = allResults.filter(r => r.type === 'bootcamp1h');

        // Collect successful IDs
        const filterSuccess = (results) => results.filter(r => r.success).map(r => r.id);

        const successful24HWebinarIds = filterSuccess(results24HWebinar);
        const successful1HWebinarIds = filterSuccess(results1HWebinar);
        const successful24HBootcampIds = filterSuccess(results24HBootcamp);
        const successful1HBootcampIds = filterSuccess(results1HBootcamp);

        // Update DB for successful emails
        await bulkUpdateReminderEmails(
            successful24HWebinarIds,
            successful1HWebinarIds,
            successful24HBootcampIds,
            successful1HBootcampIds
        );

        // Logging
        // const logResults = (total, successful, type) => {
        //     console.log(`${type}: ${successful.length}/${total} successful, ${total - successful.length} failed`);
        // };

        // logResults(webinarAll, successful24HWebinarIds, '24H Webinar');
        // logResults(webinarAll, successful1HWebinarIds, '1H Webinar');
        // logResults(bootcampAll, successful24HBootcampIds, '24H Bootcamp');
        // logResults(bootcampAll, successful1HBootcampIds, '1H Bootcamp');

        // Failed email IDs
        // const failedIds = {
        //     '24H Webinar': results24HWebinar.filter(r => !r.success).map(r => r.id),
        //     '1H Webinar': results1HWebinar.filter(r => !r.success).map(r => r.id),
        //     '24H Bootcamp': results24HBootcamp.filter(r => !r.success).map(r => r.id),
        //     '1H Bootcamp': results1HBootcamp.filter(r => !r.success).map(r => r.id)
        // };
        // console.log('❌ Failed email IDs:', failedIds);

    } catch (error) {
        console.error('❌ Error in reminderNotifications:', error);
    }
};



// Cron job running every 10 minutes
export const appointmentReminderCron = () => {
  return new Promise((resolve, reject) => {
    try {
      cron.schedule('* * * * *', reminderNotificationsCron);
      resolve(); // Resolve the promise when cron is set up
    } catch (error) {
      console.error("❌ Failed to schedule cron jobs:", error);
      reject(error);
    }
  });
};