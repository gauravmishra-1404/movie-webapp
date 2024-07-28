import { axiosInstance } from './axios'


const registerUser = async (value) => {
    try {
        const response = await axiosInstance.post("/api/user/register", value)
        return response.data
    } catch (error) {
        throw error
    }

}

const loginUser = async (value) => {
    try {
        const response = await axiosInstance.post("/api/user/login", value)
        return response.data
    } catch (error) {
        throw error
    }

}


const getCurrentUser = async () => {
    try {
        const response = await axiosInstance.get("/api/user/get-current-user")
        return response.data
    } catch (error) {
        throw error
    }
}


/// New Axios Instnace for Forget and Reset Password

const forgetPassword = async (value) => {
    try {
        const response = await axiosInstance.post("/api/user/forgetpassword", value);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

const resetPassword = async (value) => {
    try {
        const response = await axiosInstance.post("/api/user/resetpassword", value);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}


export {
    registerUser,
    loginUser,
    getCurrentUser,
    forgetPassword,
    resetPassword
}