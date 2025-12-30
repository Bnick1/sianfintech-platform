// services/loanService.js - ES Module version
import Loan from '../models/loanModel.js';

async function applyLoan({ body }) {
  const { userId, amount, termMonths, purpose } = body;
  if (!userId || !amount) throw { status: 400, message: 'Missing userId or amount' };

  const loan = new Loan({
    userId,
    amount,
    termMonths,
    purpose,
  });

  const saved = await loan.save();
  return {
    status: 'success',
    message: 'Loan application submitted successfully',
    loan: saved,
  };
}

async function getLoanById({ params }) {
  const { id } = params;
  const loan = await Loan.findById(id);
  if (!loan) throw { status: 404, message: 'Loan not found' };
  return { status: 'success', loan };
}

export { applyLoan, getLoanById };