//import cloudinary from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { getTimeString } from '../utils/timeString.js';

dotenv.config(); // Load environment variables from .env

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


export const uploadImageToCloudinary = async (file, email) => {
    try {
        const timeString = getTimeString();
        const result = await cloudinary.uploader.upload(file.path, {
            public_id: timeString + '__' + email, // Replace with your desired folder
            folder: 'Folder' + '_' + email,
            // Add other upload options as needed (e.g., transformations, public_id)
        });
        return result;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
};
