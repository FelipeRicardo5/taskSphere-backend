import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { env } from './env';

// Configuração centralizada
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

interface CloudinaryParams {
  folder: string;
  allowed_formats: string[];
  transformation: Array<{
    width: number;
    height: number;
    crop: string;
  }>;
}

// Configurações específicas para diferentes tipos de upload
const uploadConfigs = {
  avatar: {
    folder: 'tasksphere/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 200, height: 200, crop: 'fill' }]
  },
  project: {
    folder: 'tasksphere/projects',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  },
  task: {
    folder: 'tasksphere/tasks',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
};

// Criar storages específicos para cada tipo
export const storages = {
  avatar: new CloudinaryStorage({
    cloudinary,
    params: {
      ...uploadConfigs.avatar,
      resource_type: 'auto'
    } as CloudinaryParams
  }),
  project: new CloudinaryStorage({
    cloudinary,
    params: {
      ...uploadConfigs.project,
      resource_type: 'auto'
    } as CloudinaryParams
  }),
  task: new CloudinaryStorage({
    cloudinary,
    params: {
      ...uploadConfigs.task,
      resource_type: 'auto'
    } as CloudinaryParams
  })
};

// Configuração comum do multer
const multerConfig = {
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
};

// Exportar uploaders específicos
export const uploaders = {
  avatar: multer({ 
    storage: storages.avatar,
    ...multerConfig
  }),
  project: multer({ 
    storage: storages.project,
    ...multerConfig
  }),
  task: multer({ 
    storage: storages.task,
    ...multerConfig
  })
};

export default cloudinary;