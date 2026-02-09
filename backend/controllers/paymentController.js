// controllers/paymentController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import axios from 'axios';
import crypto from 'crypto';


export const initializePayment = asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only superadmin can subscribe' });
  }

  const { subscriptionType } = req.body; // 'quarterly' or 'annual'

  if (!['quarterly', 'annual'].includes(subscriptionType)) {
    return res.status(400).json({ success: false, message: 'Invalid subscription type' });
  }

  const amount = subscriptionType === 'quarterly' ? 50000 : 150000; // in naira
  const email = req.user.email;
  const reference = `sub_${req.user._id}_${Date.now()}`; // unique ref

  try {
    // Paystack initialization
    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // convert to kobo
        reference,
        callback_url: `${process.env.FRONTEND_URL}/dashboard/subscription/callback`, // your frontend callback page
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Save pending payment in user's history
    req.user.payments.push({
      amount,
      reference,
      status: 'pending',
    });
    await req.user.save();

    res.json({
      success: true,
      authorization_url: paystackRes.data.data.authorization_url,
      reference,
    });
  } catch (err) {
    console.error('Paystack init error:', err.response?.data);
    res.status(500).json({ success: false, message: 'Payment initialization failed' });
  }
});



export const paystackWebhook = async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ success: false, message: 'Invalid signature' });
  }

  const event = req.body;

  // Handle successful payment
  if (event.event === 'charge.success') {
    const { reference, amount } = event.data;
    // Find user by reference (from payments array)
    const user = await User.findOne({ 'payments.reference': reference });

    if (user) {
      const payment = user.payments.find(p => p.reference === reference);
      payment.status = 'success';

      // Activate subscription
      const type = (amount / 100) === 50000 ? 'quarterly' : 'annual';
      const durationMonths = type === 'quarterly' ? 3 : 12;

      user.subscriptionType = type;
      user.subscriptionStart = new Date();
      user.subscriptionEnd = new Date(user.subscriptionStart);
      user.subscriptionEnd.setMonth(user.subscriptionEnd.getMonth() + durationMonths);
      user.subscriptionStatus = 'active';

      await user.save();
    }
  }

  res.sendStatus(200);
};

// Verification endpoint (frontend can call to confirm after redirect)
export const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  try {
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    const { status, amount } = paystackRes.data.data;

    if (status === 'success') {
      // Update user (same as webhook logic)
      const user = await User.findOne({ 'payments.reference': reference });
      if (user) {
        const payment = user.payments.find(p => p.reference === reference);
        payment.status = 'success';

        const type = (amount / 100) === 50000 ? 'quarterly' : 'annual';
        const durationMonths = type === 'quarterly' ? 3 : 12;

        user.subscriptionType = type;
        user.subscriptionStart = new Date();
        user.subscriptionEnd = new Date(user.subscriptionStart);
        user.subscriptionEnd.setMonth(user.subscriptionEnd.getMonth() + durationMonths);
        user.subscriptionStatus = 'active';

        await user.save();

        res.json({ success: true, message: 'Subscription activated' });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Payment not successful' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});