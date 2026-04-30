import axios from "axios";

const API = axios.create({
  baseURL: "https://student-result-system-10c4.onrender.com/api"
});

export default API;