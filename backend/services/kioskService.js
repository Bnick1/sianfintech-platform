// services/kioskService.js - ES Module version
import Kiosk from '../models/kioskModel.js';

async function registerKiosk({ body }) {
  const { kioskId, location, operatorName } = body;
  if (!kioskId) throw { status: 400, message: 'Missing kioskId' };

  const kiosk = new Kiosk({ kioskId, location, operatorName });
  const saved = await kiosk.save();
  return { status: 'success', kiosk: saved };
}

async function getKioskStatus({ params }) {
  const { kioskId } = params;
  const kiosk = await Kiosk.findOne({ kioskId });
  if (!kiosk) throw { status: 404, message: 'Kiosk not found' };
  return { status: 'success', kiosk };
}

export { registerKiosk, getKioskStatus };