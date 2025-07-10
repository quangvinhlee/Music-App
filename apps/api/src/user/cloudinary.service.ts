import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary configuration is missing. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadBase64Image(base64Data: string): Promise<string> {
    try {
      // Remove data URL prefix if present
      const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          `data:image/jpeg;base64,${base64Image}`,
          {
            folder: 'avatars',
            transformation: [
              { width: 400, height: 400, crop: 'fill' },
              { quality: 'auto' },
            ],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result.secure_url);
            } else {
              reject(new Error('Upload failed: No result returned'));
            }
          },
        );
      });
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  async deleteImageByUrl(imageUrl: string): Promise<void> {
    try {
      // Extract public ID from Cloudinary URL
      // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/filename.jpg
      const urlParts = imageUrl.split('/');
      const uploadIndex = urlParts.findIndex((part) => part === 'upload');

      if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
        throw new Error('Invalid Cloudinary URL format');
      }

      // Get everything after 'upload' and before the file extension
      const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
      const publicId = pathAfterUpload.replace(/\.[^/.]+$/, ''); // Remove file extension

      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error(`Failed to delete image by URL: ${error.message}`);
    }
  }
}
