import { Request, Response } from 'express';
import { UploadService } from '../services/upload.service';
import { storageService } from '../services/storage.service';
import { BadRequestError } from '../utils/errors';

export class UploadController {
  static async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw new BadRequestError('No file uploaded');
      }

      const imageUrl = await storageService.uploadFile(req.file);
      return res.status(200).json({ imageUrl });
    } catch (error) {
      if (error instanceof BadRequestError) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to upload image' });
    }
  }

  static async deleteImage(req: Request, res: Response) {
    try {
      const { public_id } = req.params;

      await UploadService.deleteImage(public_id);

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting image',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getImageUrl(req: Request, res: Response) {
    try {
      const { public_id } = req.params;

      const url = await UploadService.getImageUrl(public_id);

      res.json({
        success: true,
        data: { url }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error getting image URL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 