// src/utils/axiosPublic.js
import axios from 'axios';

const axiosPublic = axios.create({
  baseURL: '', // no base — we use full URLs
});

export default axiosPublic;