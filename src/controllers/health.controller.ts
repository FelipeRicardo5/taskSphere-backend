import { Request, Response } from 'express';

export const checkHealth = async (_req: Request, res: Response) => {
  try {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Health check failed'
    });
  }
}; 