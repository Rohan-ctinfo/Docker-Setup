import express from 'express';
import { validate } from '../middlewares/validation.middleware.js';
import { arrayAWS } from '../utils/aws.util.js';
import { isEmpty } from '../utils/misc.util.js';
import { CUSTOM_ERROR } from '../utils/message.util.js';
import { ApiError, apiResponse } from '../utils/api.util.js';
import { uploadSocketFilesController } from '../controllers/admin.controller.js';

const router = express.Router();

router.post("/upload-file", arrayAWS("", "files", 10), uploadSocketFilesController);


export default router;