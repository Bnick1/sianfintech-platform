// src/services/locationService.ts
class LocationService {
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });
  }
  
  async trackFieldAgentSession(agentId: string) {
    // Continuous location tracking for field agents
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        api.post('/locations/track', {
          agentId,
          location: position.coords
        });
      },
      (error) => console.error('Location error:', error),
      { enableHighAccuracy: true, distanceFilter: 10 } // Update every 10 meters
    );
  }
}