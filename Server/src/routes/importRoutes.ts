import { Router } from 'express';
import { getAllImports, createImport, updateImport, deleteImport, bulkUploadImports } from '../controllers/importController';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getAllImports);
router.post('/', createImport);
router.post('/upload', upload.single('file'), bulkUploadImports);
router.put('/:id', updateImport);
router.delete('/:id', deleteImport);

export default router;
