import  mongoose from "mongoose"

const libraryResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  subject: { type: String, required: true },
  classLevel: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'video'], required: true },
  
thumbnailUrl: { type: String }, // Cloudinary thumbnail URL
  fileUrl: { type: String, required: true }, // Cloudinary secure_url
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schoolName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('LibraryResource', libraryResourceSchema);