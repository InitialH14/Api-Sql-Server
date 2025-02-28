const express = require('express');
const router = express.Router();
const snapshotController = require('../controller/snapshotController');

router.get('/snapshots', snapshotController.getSnapshots);
router.get('/snapshots/realtime', snapshotController.getSnapshotsPooling);

module.exports = router;
