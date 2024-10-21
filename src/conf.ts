import dotenv from 'dotenv';
dotenv.config({
    path:  `./.env.${process.env.NODE_ENV || 'development'}`
});

export const conf = {
    TEST_VALUE: process.env.TEST_VALUE,
    PORT: process.env.PORT || 3000,
    DB_NAME: 'wastebinDB',
    BRAND_NAME: 'Waste Bin',

    PROJECT_NAME: String(process.env.PROJECT_NAME),

    MONGODB_URI: String(process.env.MONGODB_URI) + '/wastebinDB',

    // CORS
    CORS_ORIGIN: String(process.env.CORS_ORIGIN),

    // Endpoints
    API_ENDPOINT: String(process.env.API_ENDPOINT),
    CLIENT_BASE_URL: String(process.env.CLIENT_BASE_URL),

    // Tokens and Expiry
    ACCESS_TOKEN_SECRET: String(process.env.ACCESS_TOKEN_SECRET),
    ACCESS_TOKEN_EXPIRY: String(process.env.ACCESS_TOKEN_EXPIRY),
    REFRESH_TOKEN_SECRET: String(process.env.REFRESH_TOKEN_SECRET),
    REFRESH_TOKEN_EXPIRY: String(process.env.REFRESH_TOKEN_EXPIRY),
    SECRET_TOKEN: String(process.env.SECRET_TOKEN),
    JWT_SECRET_TOKEN: String(process.env.JWT_SECRET_TOKEN),


    // OAuth
    GOOGLE_CLIENT_ID: String(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: String(process.env.GOOGLE_CLIENT_SECRET),
    GOOGLE_CALLBACK_URL: String(process.env.GOOGLE_CALLBACK_URL),

    // Services
    CLOUDINARY_CLOUD_NAME: String(process.env.CLOUDINARY_CLOUD_NAME),
    CLOUDINARY_API_KEY: String(process.env.CLOUDINARY_API_KEY),
    CLOUDINARY_API_SECRET: String(process.env.CLOUDINARY_API_SECRET),

    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,

    MAIL_HOST: String(process.env.MAIL_HOST),
    MAIL_ADDRESS: String(process.env.MAIL_ADDRESS),
    MAIL_PASSWORD: String(process.env.MAIL_PASSWORD),
} as const;