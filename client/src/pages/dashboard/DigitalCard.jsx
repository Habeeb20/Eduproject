// src/components/dashboard/DigitalIdCard.jsx
import { useState } from 'react';
import { Download, Share2, QrCode, ShieldCheck } from 'lucide-react';

export default function DigitalIdCard({ user, isAdminView = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(user.digitalId.verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Simple way: download the QR code image
    const link = document.createElement('a');
    link.href = user.digitalId.qrCodeUrl;
    link.download = `${user.name.replace(' ', '_')}_Digital_ID.png`;
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-w-md mx-auto transform transition-all hover:shadow-2xl">
      {/* Header / Banner */}
      <div className="bg-gradient-to-r from-[#1890ff] to-[#0d6fe6] p-6 text-white text-center relative">
        <div className="absolute top-3 right-3">
          <ShieldCheck className="h-8 w-8 text-white/30" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          {user.schoolName}
        </h2>
        <p className="text-sm opacity-90 mt-1">Official Digital Identity Card</p>
      </div>

      {/* Profile Section */}
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 bg-gradient-to-b from-white to-gray-50">
        <div className="relative">
          <img
            src={user.profilePicture}
            alt={user.name}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
            Verified
          </div>
        </div>

        <div className="text-center md:text-left">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
            {user.name}
          </h3>
          <p className="text-lg font-medium text-indigo-600 capitalize mt-1">
            {user.role}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {user.schoolName}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
          <p className="font-medium text-gray-900 break-all">{user.email}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Unique Code</p>
          <p className="font-mono font-bold text-xl text-indigo-700 tracking-wider">
            {user.digitalId.uniqueCode}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Issued On</p>
          <p className="font-medium">
            {new Date(user.digitalId.issuedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {isAdminView && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Created By</p>
            <p className="font-medium">
              {user.createdBy?.name || 'Superadmin'}
              <br />
              <span className="text-xs text-gray-500">
                ({user.createdBy?.email || 'System'})
              </span>
            </p>
          </div>
        )}
      </div>

      {/* QR Code & Actions */}
      <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* QR Code */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Scan to Verify
            </p>
            <img
              src={user.digitalId.qrCodeUrl}
              alt="QR Code"
              className="w-40 h-40 md:w-48 md:h-48 mx-auto rounded-xl shadow-md border border-gray-200"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-md"
            >
              <Download size={18} />
              Download ID
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
            >
              <Share2 size={18} />
              {copied ? 'Link Copied!' : 'Copy Verification Link'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Issued under the authority of {user.schoolName}
        </p>
      </div>
    </div>
  );
}