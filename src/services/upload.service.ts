import cloudinary from '../config/cloudinary';
import { BadRequestError } from '../utils/errors';

export class UploadService {
  static async uploadImage(file: Express.Multer.File, type: 'avatar' | 'project' | 'task') {
    try {
      if (!file) {
        throw new BadRequestError('No file uploaded');
      }

      // Se o arquivo já foi processado pelo CloudinaryStorage
      if (file.path) {
        return {
          url: file.path,
          public_id: file.filename
        };
      }

      // Se o arquivo tem buffer, faz o upload manual
      if (file.buffer) {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `tasksphere/${type}s`,
              resource_type: 'auto',
              transformation: type === 'avatar' 
                ? [{ width: 200, height: 200, crop: 'fill' }]
                : [{ width: 1000, height: 1000, crop: 'limit' }]
            },
            (error, result) => {
              if (error) {
                reject(new Error(`Failed to upload ${type} image: ${error.message}`));
              } else if (!result) {
                reject(new Error(`Failed to upload ${type} image: No result from Cloudinary`));
              } else {
                resolve({
                  url: result.secure_url,
                  public_id: result.public_id
                });
              }
            }
          );

          uploadStream.end(file.buffer);
        });
      }

      throw new BadRequestError('Invalid file format');
    } catch (error) {
      console.error('Upload service error:', error);
      throw new Error(`Failed to upload ${type} image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deleteImage(public_id: string) {
    try {
      const result = await cloudinary.uploader.destroy(public_id);
      if (result.result !== 'ok') {
        throw new Error('Failed to delete image');
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getImageUrl(public_id: string) {
    try {
      const result = await cloudinary.api.resource(public_id);
      return result.secure_url;
    } catch (error) {
      throw new Error(`Failed to get image URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 