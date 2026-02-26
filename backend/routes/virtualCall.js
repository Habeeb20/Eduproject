









import axios from 'axios';
import dotenv from 'dotenv';
import express from 'express';
const router = express.Router();
dotenv.config();


// Zoom credentials (use .env in production)
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID || 'YOUR_ACCOUNT_ID';
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID || 'YOUR_CLIENT_ID';
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const ZOOM_USER_ID = 'me'; // Use 'me' or specific user ID (e.g., email or ID from /users/me)

// Generate OAuth token
async function getZoomToken() {
  try {
    const response = await axios.post(
      'https://api.zoom.us/oauth/token',
      `grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    throw new Error(`Failed to get token: ${error.response?.data?.message || error.message}`);
  }
}

// Create meeting endpoint
router.post('/create-meeting', async (req, res) => {
  try {
    const token = await getZoomToken();
    const meetingResponse = await axios.post(
      `https://api.zoom.us/v2/users/${ZOOM_USER_ID}/meetings`,
      {
        topic: 'EJobs interview  Call session',
        type: 2, // Scheduled meeting
        start_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins from now
        duration: 60, // 1 hour (in minutes)
        timezone: 'UTC',
        password: '123456', // Optional: Meeting password
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const meetingData = {
      meetingId: meetingResponse.data.id,
      topic: meetingResponse.data.topic,
      joinUrl: meetingResponse.data.join_url,
      startUrl: meetingResponse.data.start_url,
    };

    res.status(200).json({ success: true, data: meetingData });
  } catch (error) {
    console.error('Error creating meeting:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data?.message || error.message });
  }
});



export default router;