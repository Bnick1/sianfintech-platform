// services/investmentService.js - ES Module version
import Investment from '../models/investmentModel.js';

export const createInvestment = async (data) => {
  if (!data.userId || !data.amount) {
    const error = new Error('userId and amount are required');
    error.status = 400;
    throw error;
  }

  const investment = new Investment({
    userId: data.userId,
    amount: data.amount,
    type: data.type || 'general',
    expectedReturn: data.expectedReturn || null,
    durationMonths: data.durationMonths || 12,
  });

  return await investment.save();
};

export const getInvestmentById = async (id) => {
  return await Investment.findById(id);
};

export const getAllInvestments = async () => {
  return await Investment.find().sort({ createdAt: -1 });
};