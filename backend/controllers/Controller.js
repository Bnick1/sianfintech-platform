class Controller {
  static async handleRequest(req, res, serviceFunction) {
    try {
      const result = await serviceFunction(req.body);
      res.status(200).json({
        status: 'success',
        prediction: result,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = Controller;
