
import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import im from "../../assets/hero.png";

function Video() {
  const [meetingData, setMeetingData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const createMeeting = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/virtual/create-meeting`);
      if (response.data.success) {
        setMeetingData(response.data.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.error || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (meetingData?.joinUrl) {
      navigator.clipboard.writeText(meetingData.joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    }
  };

  return (
    <div className=" flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 hover:scale-105">

        <button
          onClick={createMeeting}
          disabled={loading}
          className={`w-full px-6 py-3 rounded-lg text-white font-semibold transition duration-300 ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
          }`}
        >
          {loading ? 'Creating...' : 'Generate Virtual class link'}
        </button>
        {meetingData && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Meeting Created Successfully</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                <strong className="text-gray-900">Meeting ID:</strong> {meetingData.meetingId}
              </p>
              <p className="text-gray-900 space-x-2 font-semibold">
                Topic:<strong className="text-gray-900 "> {meetingData.topic}</strong> 
                <p> copy the link in the join meeting button and send to join</p>
              </p>
              <div className="relative">
                <a
                  href={meetingData.joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-6 py-3 bg-blue-500 text-white text-center rounded-lg font-medium hover:bg-blue-600 hover:shadow-md transition duration-300"
                >
                  Join Meeting
                </a>
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-600 hover:text-blue-600"
                  title="Copy Join URL"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
              {copied && (
                <p className="text-green-600 text-sm text-center">Link copied to clipboard!</p>
              )}
              <a
                href={meetingData.startUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-3 bg-green-500 text-white text-center rounded-lg font-medium hover:bg-green-600 hover:shadow-md transition duration-300"
              >
                Start Meeting (Host)
              </a>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg text-center">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Video;
