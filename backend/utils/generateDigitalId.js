// utils/generateDigitalId.js
import QRCode from 'qrcode';
import crypto from 'crypto';
import cloudinary from 'cloudinary'; // install cloudinary

// Configure Cloudinary (in your server init file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateDigitalId = async (user) => {
  // 1. Generate unique 6-digit code
  const randomNum = crypto.randomInt(100000, 999999);
  const uniqueCode = `SCH-${randomNum}`;

  // 2. Generate verification URL
  const verificationUrl = `${process.env.FRONTEND_URL}/verify?id=${user._id}&code=${uniqueCode}`;

  // 3. Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });

  // 4. Upload QR to Cloudinary
  const qrUpload = await cloudinary.uploader.upload(qrCodeDataUrl, {
    folder: 'schoolhub/digital-ids/qrcodes',
    public_id: `qr_${user._id}`,
    resource_type: 'image',
  });

  // 5. Save to user
  user.digitalId = {
    uniqueCode,
    qrCodeUrl: qrUpload.secure_url,
    verificationUrl,
    issuedAt: new Date(),
  };

  await user.save();

  return user.digitalId;
};