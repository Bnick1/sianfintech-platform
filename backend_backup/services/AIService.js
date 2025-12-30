/**
 * Mock AI Service
 * Returns a simple risk score based on input data
 */
const aiPredictDefaultPOST = async (data) => {
  const { soilMoisture, temperature, humidity } = data;

  // simple mock formula
  const riskScore = ((soilMoisture + temperature + humidity) / 300).toFixed(2);

  return { soilMoisture, temperature, humidity, riskScore };
};

module.exports = { aiPredictDefaultPOST };
