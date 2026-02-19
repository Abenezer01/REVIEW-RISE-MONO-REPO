import { Router } from 'express';
import * as UploadController from '../../controllers/upload.controller';
import { upload } from '../../services/upload.service';

const router = Router();

router.post('/', upload.single('file'), UploadController.uploadFile);

export default router;
