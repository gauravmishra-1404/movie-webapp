import {axiosInstance} from './axios'


const addMovie = async (value) => {
    try {
        const response = await axiosInstance.post("/api/movies/add-movie", value)
        return response.data
    } catch (error) {
        throw error
    }

}

const updateMovie = async (value) => {
    try {
        const response = await axiosInstance.post("/api/movies/update-movie", value)
        return response.data
    } catch (error) {
        throw error
    }

}


const getAllMovies = async () => {
    try {
        const response = await axiosInstance.get("/api/movies/get-all-movies")
        return response.data
    } catch (error) {
        throw error
    }
}

const getMovieById = async (id) => {
    try{
        const response = await axiosInstance.get(`/api/movies/movie/${id}`)
        return response.data;
    }catch(err){
        return err.response
    }
}


export {
    addMovie,
    getAllMovies,
    updateMovie,
    getMovieById
}