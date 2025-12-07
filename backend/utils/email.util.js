import nodemailer from 'nodemailer';
import Msg from '../utils/messages.util.js';
import { smtpConfig, __dirname, LOGO_URL, SENDGRID_API_KEY, FROM_EMAIL, API_URL,SENDGRID_API_KEY_HELLO,FROM_EMAIL_HELLO } from '../constants.js';
import path from 'path';
import { readFile } from 'fs/promises';
import handlebars from 'handlebars';
import sgMail from '@sendgrid/mail';

// const transporter = nodemailer.createTransport({
//     host: smtpConfig.SMTP_HOST,
//     port: 587,
//     secure: false,
//     auth: {
//         user: smtpConfig.EMAIL_USER,
//         pass: smtpConfig.EMAIL_PASS,
//     },
// });

// const sendEmail = async (emailOptions) => {
//     const mailOptions = {
//         from: smtpConfig.EMAIL_USER,
//         to: emailOptions.to,
//         subject: emailOptions.subject,
//         html: emailOptions.html,
//     };
//     try {
//         await transporter.sendMail(mailOptions);
//     } catch (error) {
//         console.error('❌ Failed to send email:', error);
//         throw new Error(Msg.errorToSendingEmail);
//     }
// };


// sgMail.setApiKey(SENDGRID_API_KEY);

// const sendEmail = async ({ to, subject, text, html }) => {
//     const msg = {
//         to,
//         from: FROM_EMAIL, // must be verified in SendGrid
//         subject,
//         text,
//         html,
//     };

//     try {
//         await sgMail.send(msg);
//         console.log(`✅ Email sent to ${to}`);
//     } catch (error) {
//         console.error('❌ Failed to send email:', error?.response?.body || error.message);
//         throw new Error('Email failed to send');
//     }
// };

const sendEmail = async ({ 
    to, 
    subject, 
    text, 
    html,
    useAccount = "default"  // default account
}) => {

    let apiKey = SENDGRID_API_KEY;
    let fromEmail = FROM_EMAIL;

    // 🔄 Switch to HELLO account if requested
    if (useAccount == "hello") {
        apiKey = SENDGRID_API_KEY_HELLO;
        fromEmail = FROM_EMAIL_HELLO;
    }

    // Set the selected API key
    sgMail.setApiKey(apiKey);

    const msg = {
        to,
        from: fromEmail,
        subject,
        text,
        html,
    };

    try {
        await sgMail.send(msg);
        console.log(`✅ Email sent using account: ${useAccount}`);
    } catch (error) {
        console.error("❌ SendGrid Error:", error?.response?.body || error.message);
        throw new Error("Email failed to send");
    }
};




export const sendOtpVerificationEmail = async ({ email, otp, res }) => {
    try {
        const verificationCode = otp;

        const context = {
            logo_url: LOGO_URL,
            email_title: Msg.accountActivate,
            heading: Msg.confirmYourEmailAddress,
            message: Msg.verifiedMessage,
            verification_code: verificationCode,
            company_name: "Nuvio",
            support_url: "#",
            support_text: "We are here to help you out"
        };

        const emailTemplatePath = path.join(__dirname, 'views', 'otp_mail_template.handlebars');
        const templateSource = await readFile(emailTemplatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const emailHtml = template(context);

        const emailOptions = {
            to: email,
            subject: Msg.otpVerification,
            html: emailHtml,
            useAccount: "hello"
        };

        await sendEmail(emailOptions);

        return {
            success: true,
            message: Msg.forgotPasswordOtpSend,
            code: verificationCode, // ✅ optional return
        };
    } catch (error) {
        console.error('❌ Error in sendVerificationEmail:', error);
        throw new Error(Msg.errorToSendingEmail);
    }
};

export const sendVerificationEmail = async ({ email, url, res }) => {
    try {
        const verificationUrl = url;

        const context = {
            logo_url: LOGO_URL,
            email_title: Msg.accountActivate,
            heading: Msg.confirmYourEmailAddress,
            message: Msg.verificatiionMessage,
            verification_url: verificationUrl,
            verification_button: "Verify",
            company_name: "Nuvio",
            support_url: "#",
            support_text: "We are here to help you out"
        };

        const emailTemplatePath = path.join(__dirname, 'views', 'verification_mail_template.handlebars');
        const templateSource = await readFile(emailTemplatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const emailHtml = template(context);

        const emailOptions = {
            to: email,
            subject: Msg.accountActivate,
            html: emailHtml,
            useAccount: "hello"
        };

        await sendEmail(emailOptions);

        return {
            success: true,
            message: Msg.accountVerifiedCodeSent,
        };
    } catch (error) {
        console.error('❌ Error in sendVerificationEmail:', error);
        throw new Error(Msg.errorToSendingEmail);
    }
};

export const sendRegistrationEmail = async ({ email, first_name, date_time, res }) => {
    try {
        const context = {
            first_name: first_name,
            date_time: date_time,
            company_name: "NUVIO",
            logo: LOGO_URL || "https://api.nu-vio.com/logo.png"
        };

        const emailTemplatePath = path.join(__dirname, 'views', 'registration_mail_template.handlebars');
        const templateSource = await readFile(emailTemplatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const emailHtml = template(context);

        const emailOptions = {
            to: email,
            subject: "🎉 You're in! Game On starts soon.",
            html: emailHtml,
        };

        await sendEmail(emailOptions);
        return {
            success: true,
            message: "Registration confirmation email sent successfully",
        };
    } catch (error) {
        console.error('❌ Error in sendRegistrationEmail:', error);
        throw new Error("Error sending registration confirmation email");
    }
};

export const send24HReminderEmail = async ({ email, first_name, date_time, res }) => {
    try {
        const context = {
            first_name: first_name,
            date_time: date_time,
            company_name: "NUVIO",
            logo: LOGO_URL || "https://api.nu-vio.com/logo.png"
        };
        const emailTemplatePath = path.join(__dirname, 'views', '24h_reminder_mail_template.handlebars');
        const templateSource = await readFile(emailTemplatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const emailHtml = template(context);
        const emailOptions = {
            to: email,
            subject: "⏳ Just a few days away: Game On",
            html: emailHtml,
        };
        await sendEmail(emailOptions);
        return {
            success: true,
            message: "24-hour reminder email sent successfully",
        };
    } catch (error) {
        console.error('❌ Error in send24HReminderEmail:', error);
        throw new Error("Error sending 24-hour reminder email");
    }
};
export const send1HReminderEmail = async ({ email, first_name, date_time, res }) => {
    try {
        const context = {
            first_name: first_name,
            date_time: date_time,
            company_name: "NUVIO",
            logo: LOGO_URL || "https://api.nu-vio.com/logo.png",
            access_link: "https://www.google.com/" // Replace with actual access link
        };

        const emailTemplatePath = path.join(__dirname, 'views', '1h_reminder_mail_template.handlebars');
        const templateSource = await readFile(emailTemplatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const emailHtml = template(context);

        const emailOptions = {
            to: email,
            subject: "🚨 It's happening today: Game On",
            html: emailHtml,
        };

        await sendEmail(emailOptions);

        return {
            success: true,
            message: "1-hour reminder email sent successfully",
        };
    } catch (error) {
        console.error('❌ Error in send1HReminderEmail:', error);
        throw new Error("Error sending 1-hour reminder email");
    }
};

export const sendContactFormNotification = async (contactData) => {
    try {
        const context = {
            logo_url: LOGO_URL,
            full_name: contactData.full_name,
            email: contactData.email,
            phone_number: contactData.phone_number || "Not provided",
            address: contactData.address || "Not provided",
            subject: contactData.subject,
            message: contactData.message,
            company_name: "Nuvio",
            submission_date: new Date().toLocaleString(),
            support_url: "#",
            support_text: "We are here to help you out"
        };

        const emailTemplatePath = path.join(__dirname, 'views', 'contactus_template.handlebars');
        const templateSource = await readFile(emailTemplatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const emailHtml = template(context);

        const emailOptions = {
            to: FROM_EMAIL_HELLO, // Replace with actual admin email
            subject: `${contactData.subject}`,
            html: emailHtml,
            useAccount: "hello"
        };

        await sendEmail(emailOptions);

        return {
            success: true,
            message: "Contact form notification sent to admin successfully",
        };
    } catch (error) {
        console.error('❌ Error in sendContactFormNotification:', error);
        throw new Error("Failed to send contact form notification");
    }
};

export const adminWebinarRegistrationNotification = async (contactData) => {
    try {
        const context = {
            logo_url: LOGO_URL,
            full_name: contactData.full_name,
            email: contactData.email,
            phone_number: contactData.phone_number || "Not provided",
            role: contactData.role || "Not provided",
            linkedin_url: contactData.linkedin_url || "Not provided",
            hear_about_us: contactData.source || "Not provided",
        };

        const emailTemplatePath = path.join(__dirname, 'views', 'admin_webinar_registration_template.handlebars');
        const templateSource = await readFile(emailTemplatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const emailHtml = template(context);

        const emailOptions = {
            to: FROM_EMAIL, // Replace with actual admin email
            subject: `New User Registered for Webinar`,
            html: emailHtml,
        };

        await sendEmail(emailOptions);

        return {
            success: true,
            message: "Webinar registration notification sent to admin successfully",
        };
    } catch (error) {
        console.error('❌ Error in sendContactFormNotification:', error);
        throw new Error("Failed to send contact form notification");
    }
};

export const sendAccountRejectionEmail = async ({ email, res,rejected_reason }) => {
    try {

        const context = {
            logo_url: LOGO_URL,
            email_title: Msg.accountApplicatonStatusUpdate,
            heading: Msg.accountApplicatonStatus,
            message: Msg.accountRejected,
            rejection_reason: rejected_reason,
            company_name: "Nuvio",
            support_url: "#",
            support_text: "We are here to help you out"
        };

        const emailTemplatePath = path.join(__dirname, 'views', 'account_rejected_template.handlebars');
        const templateSource = await readFile(emailTemplatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const emailHtml = template(context);

        const emailOptions = {
            to: email,
            subject: Msg.accountApplicatonStatusUpdate,
            html: emailHtml,
            useAccount: "hello"
        };

        await sendEmail(emailOptions);

        return {
            success: true,
            message: Msg.accountVerifiedCodeSent,
        };
    } catch (error) {
        console.error('❌ Error in sendVerificationEmail:', error);
        throw new Error(Msg.errorToSendingEmail);
    }
};

export const sendAccountApproveEmail = async ({ email, verification_code, res }) => {
    try {
        const verificationUrl = `${API_URL}coach/verify/${verification_code}`;

        const context = {
            logo_url: LOGO_URL,
            email_title: Msg.accountApplicatonStatusUpdate,
            heading: Msg.accountApplicatonStatus,
            message: Msg.passwordCreateMessage,
            verification_url: verificationUrl,
            verification_button: "Create Password",
            company_name: "Nuvio",
            support_url: "#",
            support_text: "We are here to help you out"
        };

        const emailTemplatePath = path.join(__dirname, 'views', 'verification_mail_template.handlebars');
        const templateSource = await readFile(emailTemplatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const emailHtml = template(context);

        const emailOptions = {
            to: email,
            subject: Msg.accountApplicatonStatusUpdate,
            html: emailHtml,
            useAccount: "hello"
        };

        await sendEmail(emailOptions);

        return {
            success: true,
            message: Msg.accountVerifiedCodeSent,
        };
    } catch (error) {
        console.error('❌ Error in sendVerificationEmail:', error);
        throw new Error(Msg.errorToSendingEmail);
    }
};

export const sendBootcampBookingsEmail = async ({ email, first_name, bootcamp_title,start_date,end_date,price, res }) => {
    try {
        const context = {
            first_name: first_name,
            bootcamp_title: bootcamp_title,
            start_date : start_date,
            end_date : end_date,
            price : price,
            company_name: "NUVIO",
            logo: LOGO_URL || "https://api.nu-vio.com/logo.png",
            support_url : "#",
            support_text: "We are here to help you out"
        };

        const emailTemplatePath = path.join(__dirname, 'views', 'bootcamp_booking_template.handlebars');
        const templateSource = await readFile(emailTemplatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const emailHtml = template(context);

        const emailOptions = {
            to: email,
            subject: "🎉 Booking Confirmed!",
            html: emailHtml,
        };

        await sendEmail(emailOptions);
        return {
            success: true,
            message: "Bootcamp booking confirmation email sent successfully",
        };
    } catch (error) {
        console.error('❌ Error in sendRegistrationEmail:', error);
        throw new Error("Error sending bootcamp booking confirmation email");
    }
};

export const sendAdminBootcampBookingsEmail = async ({ email, first_name, bootcamp_title,start_date,end_date,price,last_name, res }) => {
    try {
        const context = {
            first_name: first_name,
            last_name : last_name,
            email : email,
            is_admin : true,
            bootcamp_title: bootcamp_title,
            start_date : start_date,
            end_date : end_date,
            price : price,
            company_name: "NUVIO",
            logo: LOGO_URL || "https://api.nu-vio.com/logo.png",
            support_url : "#",
            support_text: "We are here to help you out"
        };

        const emailTemplatePath = path.join(__dirname, 'views', 'bootcamp_booking_template.handlebars');
        const templateSource = await readFile(emailTemplatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const emailHtml = template(context);

        const emailOptions = {
            to: FROM_EMAIL,
            // to: "rohangupta.ctinfotech@gmail.com",
            subject: "🎉 Booking Confirmed!",
            html: emailHtml,
        };

        await sendEmail(emailOptions);
        return {
            success: true,
            message: "Bootcamp booking confirmation email sent successfully",
        };
    } catch (error) {
        console.error('❌ Error in sendRegistrationEmail:', error);
        throw new Error("Error sending bootcamp booking confirmation email");
    }
};

export const sendBootcampWaitingListEmail = async ({ email, first_name, bootcamp_title,start_date,end_date,notes, res }) => {
    try {
        const context = {
            first_name: first_name,
            bootcamp_title: bootcamp_title,
            start_date : start_date,
            end_date : end_date,
            notes : notes || "Not Provided",
            company_name: "NUVIO",
            logo: LOGO_URL || "https://api.nu-vio.com/logo.png",
            support_url : "#",
            support_text: "We are here to help you out"
        };

        const emailTemplatePath = path.join(__dirname, 'views', 'bootcamp_waitinglist_template.handlebars');
        const templateSource = await readFile(emailTemplatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const emailHtml = template(context);

        const emailOptions = {
            to: email,
            subject: "👋 Added to Waiting List!",
            html: emailHtml,
        };

        await sendEmail(emailOptions);
        return {
            success: true,
            message: "Bootcamp booking confirmation email sent successfully",
        };
    } catch (error) {
        console.error('❌ Error in sendRegistrationEmail:', error);
        throw new Error("Error sending bootcamp booking confirmation email");
    }
};

export const sendAdminBootcampWaitingListEmail = async ({ email, first_name, bootcamp_title,start_date,end_date,notes,last_name, res }) => {
    try {
        const context = {
            first_name: first_name,
            last_name : last_name,
            email : email,
            is_admin : true,
            bootcamp_title: bootcamp_title,
            start_date : start_date,
            end_date : end_date,
            notes : notes || "Not Provided",
            company_name: "NUVIO",
            logo: LOGO_URL || "https://api.nu-vio.com/logo.png",
            support_url : "#",
            support_text: "We are here to help you out"
        };

        const emailTemplatePath = path.join(__dirname, 'views', 'bootcamp_waitinglist_template.handlebars');
        const templateSource = await readFile(emailTemplatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const emailHtml = template(context);

        const emailOptions = {
            to: FROM_EMAIL,
            // to: "rohangupta.ctinfotech@gmail.com",
            subject: "👋 Added to Waiting List!",
            html: emailHtml,
        };

        await sendEmail(emailOptions);
        return {
            success: true,
            message: "Bootcamp booking confirmation email sent successfully",
        };
    } catch (error) {
        console.error('❌ Error in sendRegistrationEmail:', error);
        throw new Error("Error sending bootcamp booking confirmation email");
    }
};

export const sendOpenTalentVerificationEmail = async ({ email, talent_type, res }) => {
    try {

        const context = {
            logo: LOGO_URL,
            subject: 'Sign Up Successfully',
            title: 'Sign Up Successfully',
            message: `Your account has been successfully created as a "${talent_type == "FREELANCER" ? "Freelancer" : "Looking for a job"}". ${talent_type == "FREELANCER" ? "Your 14-day free trial has now been initiated." : null}`,
            companyName: "Nuvio",
            supportEmail : FROM_EMAIL_HELLO
        };

        const emailTemplatePath = path.join(__dirname, 'views', 'mail_template.handlebars');
        const templateSource = await readFile(emailTemplatePath, 'utf-8');
        const template = handlebars.compile(templateSource);
        const emailHtml = template(context);

        const emailOptions = {
            to: email,
            subject: 'Sign Up Successfully',
            html: emailHtml,
            useAccount: "hello"
        };

        await sendEmail(emailOptions);

        return {
            success: true,
            message: 'Signup completed successfully.',
        };
    } catch (error) {
        console.error('❌ Error in sendVerificationEmail:', error);
        throw new Error(Msg.errorToSendingEmail);
    }
};