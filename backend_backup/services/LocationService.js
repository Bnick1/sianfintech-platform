// services/locationService.js
export class LocationService {
  async trackFieldAgent(agentId, location) {
    await LocationModel.create({
      agentId,
      coordinates: [location.longitude, location.latitude],
      timestamp: new Date()
    });
  }
  
  async findNearestKiosk(userLocation) {
    return await KioskModel.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [userLocation.lng, userLocation.lat]
          },
          $maxDistance: 5000 // 5km radius
        }
      }
    });
  }
}