import axios from 'axios'

// Sending a token from frontend to backend
// "Bearer XXXXXXXXXXXXXXXXXXXXXX"

export const axiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    baseURL: "http://localhost:3000"
});
