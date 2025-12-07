import jwt from "jsonwebtoken";
import { apiError, apiHandler } from "../utils/api.util.js";
import { CUSTOM_ERROR, NOT_FOUND, UNAUTHORIZED } from "../utils/message.util.js";
import { JWT_SECRET } from "../constants.js";
import { isEmpty } from "../utils/misc.util.js";
import { getCoachByUserId } from "../model/coach.model.js";
import { getUserById } from "../model/common.model.js";


const publicRoutes = ["login", "register", "verify-otp", "resend-otp", "forgot-password", "reset-password", "public", "verify", "create-password", "bootcamp"];

const skipPublicRoutes = (url) => {
  return publicRoutes.some(route => url.includes(route));
};

export const authGuard = apiHandler(async (req, res, next) => {
  if (skipPublicRoutes(req.path)) {
    return next();
  }

  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return apiError(CUSTOM_ERROR, "Missing or malformed token", null, res);
  }

  const token = authHeader.split(" ")[1];

  if (isEmpty(token)) {
    return apiError(CUSTOM_ERROR, "Missing or malformed token", null, res);
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);

    if (decodedToken.role != "ADMIN") {
      const [isUser] = await getUserById(decodedToken.user_id);
      if (isEmpty(isUser)) {
        return apiError(CUSTOM_ERROR, "User not found", null, res);
      }

      if(isUser.is_active == false) {
        return apiError(CUSTOM_ERROR, "Your account has been blocked by admin", null, res);
      }

      if (isUser.is_disabled) {
        return apiError(CUSTOM_ERROR, "Your account has been disabled. Please enable your account", null, res);
      }

      if (isUser.is_deleted) {
        return apiError(NOT_FOUND, "Account", null, res);
      }


    }



    req.user = decodedToken;
    next();
  } catch (error) {
    return apiError(UNAUTHORIZED, "Invalid token", null, res);
  }
});

export const coachAuthGuard = apiHandler(async (req, res, next) => {
  if (skipPublicRoutes(req.path)) {
    return next();
  }

  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return apiError(CUSTOM_ERROR, "Missing or malformed token", null, res);
  }

  const token = authHeader.split(" ")[1];

  if (isEmpty(token)) {
    return apiError(CUSTOM_ERROR, "Missing or malformed token", null, res);
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    req.user = decodedToken;

    const [coach] = await getCoachByUserId(decodedToken.user_id);
    if (isEmpty(coach)) {
      return apiError(UNAUTHORIZED, "Coach", null, res);
    }

    if (coach.is_disabled) {
      return apiError(CUSTOM_ERROR, "Your account has been disabled. Please enable your account", null, res);
    }

    if (coach.is_deleted) {
      return apiError(NOT_FOUND, "Account", null, res);
    }

    next();
  } catch (error) {
    return apiError(UNAUTHORIZED, "Invalid token", null, res);
  }
});


export const socketAuthGuard = async (socket, next) => {
  try {
    // Token sent via socket handshake auth
    let token = socket.handshake.auth?.token;

    // 2. If missing, try Authorization header (Postman / HTTP clients)
    if (!token) {
      const authHeader = socket.handshake.headers['authorization'];

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]; // extract the token
      }
    }

    if (!token) {
      return next(new Error("Authentication error: Missing token"));
    }

    // Verify JWT
    const decodedToken = jwt.verify(token, JWT_SECRET);


    console.log("Socket auth success", decodedToken);
    // Check if user is banned
    if (decodedToken.role != "ADMIN") {
      const isUser = await getUserById(decodedToken.user_id);
      if (isEmpty(isUser)) {
        return next(new Error("Authentication error: User is not found"));
      }
    } else {
      decodedToken.user_id = decodedToken.admin_id;
    }


    // Attach user to socket
    socket.user = decodedToken;

    next(); // Allow connection
  } catch (err) {
    console.log("Socket auth failed:", err.message);
    next(new Error("Authentication error"));
  }
};
