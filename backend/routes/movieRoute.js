const express = require("express")
const movieRouter = express.Router();
const Movie = require("../model/movieModel")
const authMiddleware = require("../middlewares/authMiddleware")


// function sum (request, two) { return a+b } -> Parameters
// sum(1, 10) -> Arguments


// Add a movie
movieRouter.post("/add-movie", authMiddleware, async (req, res) => {
    try {
        const movie = new Movie(req.body)

        await movie.save()

        res.send({
            success: true,
            message: "Movie is added!"
        })

    } catch(e) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: e
        })
    }
})


// List all movie
movieRouter.get("/get-all-movies", authMiddleware, async (req, res) => {
    try {
        const movies = await Movie.find()

        res.send({
            success: true,
            message: "Movies fetched!",
            movies
        })

    } catch(e) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error"
        })
    }
})


// List all movies by searchText
movieRouter.get("/get-all-movies-by-search-text/:text", authMiddleware, async (req, res) => {
    try {
        if (req.params.text && req.params.text !== "undefined") {
            const movies = await Movie.find({ "movieName": { "$regex": req.params.text, "$options": "i" }})

            res.send({
                success: true,
                message: "Movies fetched!",
                movies
            })
        } else {
            const movies = await Movie.find()

            res.send({
                success: true,
                message: "Movies fetched!",
                movies
            })
        }
    } catch(e) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error"
        })
    }
})


// Add a movie
movieRouter.put("/update-movie", authMiddleware, async (req, res) => {
    try {
        const movie = await Movie.findOneAndUpdate(req.body.movieId, req.body)

        res.send({
            success: true,
            message: "Movie is updated!",
            movie
        })

    } catch(e) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error"
        })
    }
})

movieRouter.get('/movie/:id', authMiddleware, async (req, res) => {
    try{
        const movie = await Movie.findById(req.params.id);
        res.send({
            success: true,
            message: "Movie fetched successfully!",
            data: movie
        })

    }catch(err){
        res.send({
            success: false,
            message: err.message
        })
    }
});

module.exports = movieRouter