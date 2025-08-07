const { Router } = require('express');
const { handleFileUpload } = require('../uploadHandler');
const multer = require('multer');

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  await handleFileUpload(req, res);
});


module.exports = router;