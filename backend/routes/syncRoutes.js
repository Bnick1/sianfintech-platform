// routes/syncRoutes.js
router.post('/sync/pending', async (req, res) => {
  try {
    const { pendingOperations, lastSyncTimestamp } = req.body;
    // Process queued operations
    const results = await processPendingOperations(pendingOperations);
    res.json({ success: true, results, newTimestamp: Date.now() });
  } catch (error) {
    res.status(500).json({ error: 'Sync failed' });
  }
});