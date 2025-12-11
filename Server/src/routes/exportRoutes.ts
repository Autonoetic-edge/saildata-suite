import { Router } from 'express';
import { getAllExports, createExport, updateExport, deleteExport, bulkUploadExports } from '../controllers/exportController';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getAllExports);
router.post('/', createExport);
router.post('/upload', upload.single('file'), bulkUploadExports);
router.put('/:id', updateExport);
router.delete('/:id', deleteExport);

export default router;
