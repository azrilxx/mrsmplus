const { Router } = require('express');
const { UploadHandler, upload } = require('../uploadHandler');

const router = Router();
const uploadHandler = new UploadHandler();

router.post('/single', upload.single('file'), async (req, res) => {
  await uploadHandler.handleFileUpload(req, res);
});

router.post('/bulk', upload.array('files', 10), async (req, res) => {
  await uploadHandler.handleBulkUpload(req, res);
});

router.get('/content/:uploadId', async (req, res) => {
  await uploadHandler.getUploadedContent(req, res);
});

router.get('/list', async (req, res) => {
  await uploadHandler.listUploadedContent(req, res);
});

router.get('/subject/:subject', async (req, res) => {
  await uploadHandler.getContentBySubject(req, res);
});

router.get('/validate/:uploadId', async (req, res) => {
  await uploadHandler.validateUpload(req, res);
});

module.exports = router;