import { Request, Response } from 'express';
import { UploadService } from '../services/upload.service';
import { BadRequestError } from '../utils/errors';

interface UploadResult {
  url: string;
  public_id: string;
}

export class UploadController {
  static async uploadAvatar(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw new BadRequestError('No file uploaded');
      }

      const result = await UploadService.uploadImage(req.file, 'avatar') as UploadResult;
      return res.status(200).json({
        success: true,
        data: {
          url: result.url,
          public_id: result.public_id
        }
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      if (error instanceof BadRequestError) {
        return res.status(400).json({ 
          success: false,
          error: error.message 
        });
      }
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload avatar'
      });
    }
  }

  static async uploadProjectImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw new BadRequestError('No file uploaded');
      }

      const result = await UploadService.uploadImage(req.file, 'project') as UploadResult;
      return res.status(200).json({
        success: true,
        data: {
          url: result.url,
          public_id: result.public_id
        }
      });
    } catch (error) {
      console.error('Project image upload error:', error);
      if (error instanceof BadRequestError) {
        return res.status(400).json({ 
          success: false,
          error: error.message 
        });
      }
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload project image'
      });
    }
  }

  static async uploadTaskImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw new BadRequestError('No file uploaded');
      }

      // Log do arquivo recebido
      console.log('Task image upload - File details:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      const result = await UploadService.uploadImage(req.file, 'task') as UploadResult;
      
      // Log do resultado
      console.log('Task image upload - Success:', result);

      return res.status(200).json({
        success: true,
        data: {
          url: result.url,
          public_id: result.public_id
        }
      });
    } catch (error) {
      // Log detalhado do erro
      console.error('Task image upload error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      if (error instanceof BadRequestError) {
        return res.status(400).json({ 
          success: false,
          error: error.message 
        });
      }
      return res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload task image'
      });
    }
  }

  static async deleteImage(req: Request, res: Response) {
    try {
      const { public_id } = req.params;
      if (!public_id) {
        throw new BadRequestError('Public ID is required');
      }

      await UploadService.deleteImage(public_id);
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(error instanceof BadRequestError ? 400 : 500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error deleting image'
      });
    }
  }

  static async getImageUrl(req: Request, res: Response) {
    try {
      const { public_id } = req.params;
      if (!public_id) {
        throw new BadRequestError('Public ID is required');
      }

      const url = await UploadService.getImageUrl(public_id);
      res.json({
        success: true,
        data: { url }
      });
    } catch (error) {
      console.error('Get image URL error:', error);
      res.status(error instanceof BadRequestError ? 400 : 500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error getting image URL'
      });
    }
  }
}