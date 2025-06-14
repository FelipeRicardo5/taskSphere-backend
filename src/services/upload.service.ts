import cloudinary from '../config/cloudinary';

export class UploadService {
  static async uploadImage(file: Express.Multer.File) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'tasksphere',
        resource_type: 'auto'
      });

      return {
        url: result.secure_url,
        public_id: result.public_id
      };
    } catch (error) {
      throw new Error('Failed to upload image');
    }
  }

  static async deleteImage(public_id: string) {
    try {
      await cloudinary.uploader.destroy(public_id);
    } catch (error) {
      throw new Error('Failed to delete image');
    }
  }

  static async getImageUrl(public_id: string) {
    try {
      const result = await cloudinary.api.resource(public_id);
      return result.secure_url;
    } catch (error) {
      throw new Error('Failed to get image URL');
    }
  }
} 