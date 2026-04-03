import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use a stable API version
});

/**
 * Creates a Financial Connections Session for the user.
 * This is the first step in the "OMEGA Clearance" verification.
 */
export const createFinancialSession = async (customerName: string) => {
  try {
    const session = await stripe.financialConnections.sessions.create({
      account_holder: { type: 'account', account: process.env.ACCOUNT_ID }, // Use the existing account ID
      permissions: ['balances', 'ownership', 'transactions', 'payment_method'],
      filters: { countries: ['US'] },
    });

    return {
      clientSecret: session.client_secret,
      sessionId: session.id,
    };
  } catch (error) {
    console.error('[Stripe Bridge] Failed to create session:', error);
    throw error;
  }
};

/**
 * Synchronizes the verified financial data with the Aetheris Hub's resonance state.
 */
export const syncAethericResonance = async (sessionId: string) => {
  try {
    const session = await stripe.financialConnections.sessions.retrieve(sessionId);
    const accounts = await stripe.financialConnections.accounts.list({
      session: sessionId,
      limit: 10,
    });

    // Synthesis: Convert financial balances into "Resonance Scores"
    const totalBalance = accounts.data.reduce((acc, account) => {
      const availableUsd = account.balance?.cash?.available?.usd || 0;
      return acc + availableUsd;
    }, 0);

    return {
      coherence: totalBalance > 100000 ? 'OMEGA' : 'AUDITOR',
      verifiedBalance: totalBalance,
      accounts: accounts.data.map(a => a.display_name),
    };
  } catch (error) {
    console.error('[Stripe Bridge] Resonance Sync failed:', error);
    throw error;
  }
};
