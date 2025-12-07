import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getMimeType } from "./misc.util.js";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    endpoint: "https://sfo3.digitaloceanspaces.com",
    forcePathStyle: false,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const generateS3Key = (file, folder = "temp") => {
    const mimeType = getMimeType(file);
    let subFolder = folder;

    if (mimeType.startsWith("image/")) {
        subFolder = "images";
    } else if (mimeType.startsWith("video/")) {
        subFolder = "videos";
    }

    const ext = file.originalname.split(".").pop();
    const name = file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
    const uniqueId = uuidv4().split("-")[0];
    return `${subFolder}/${Date.now()}-${uniqueId}-${name}`;
};

const getS3MulterInstance = (folder = "temp") =>
    multer({
        storage: multerS3({
            s3,
            bucket: process.env.S3_BUCKET_NAME,
            acl: "public-read",
            contentType: (req, file, cb) => {
                const mimeType = getMimeType(file);
                cb(null, mimeType);
            },
            key: (req, file, cb) => {
                const s3Key = generateS3Key(file, folder);
                cb(null, s3Key);
            },
        }),
    });

const getAWSPublicUrl = (fileKey) =>
    `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

const deleteFileFromS3 = async (fileUrl) => {
    if (!fileUrl) return;
    const fileKey = fileUrl;
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
    };
    try {
        const data = await s3.send(new DeleteObjectCommand(params));
        console.log(`🗑️ Deleted from S3: ${fileKey}`);
        console.log(" data:", data);
        return data;
    } catch (error) {
        console.error("❌ Error deleting file from S3:", error);
    }
};

export const singleAWS = (folder, fieldName) => getS3MulterInstance(folder).single(fieldName);
export const arrayAWS = (folder, fieldName, maxCount = 5) =>
    getS3MulterInstance(folder).array(fieldName, maxCount);
export const fieldsAWS = (folder, fieldsArray) =>
    getS3MulterInstance(folder).fields(fieldsArray);

export { getAWSPublicUrl, deleteFileFromS3 };
