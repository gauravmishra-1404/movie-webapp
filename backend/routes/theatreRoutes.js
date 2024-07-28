const express = require("express");
const Theatre = require("../model/theatreModel");
const theatreRouter = express.Router()


theatreRouter.post('/add-theatre',  async (req, res) => {
    try{
        const newTheatre = new Theatre(req.body);
        await newTheatre.save();
        res.send({
            success: true,
            message: "New theatre has been added!"
        })
    }catch(err){
        res.send({
            success: false,
            message: err.message
        })
    }
});


// Update theatre
theatreRouter.put('/update-theatre',  async (req, res) => {
    try{
        await Theatre.findByIdAndUpdate(req.body.theatreId, req.body);
        // console.log(req.body.theatreId)
        res.send({
            success: true,
            message: "Theatre has been updated!"
        })
    }catch(err){
        res.send({
            success: false,
            message: err.message
        })
    }
})

// Delete theatre
theatreRouter.delete('/delete-theatre', async (req, res) => {
    try{
        await Theatre.findByIdAndDelete(req.body.theatreId);
        res.send({
            success: true,
            message: "The theatre has been deleted!"
        })
    }catch(err){
        res.send({
            success: false,
            message: err.message
        })
    }
});

// Getting all theatres
theatreRouter.get("/get-all-theatres", async (req, res) => {
    try {
        // This will by default omit all reference fields
        // When we populate the owner, EVERY field from Owner is included
        const allTheatres = await Theatre.find().populate("owner")

        res.send({
            success: true,
            message: "Theatres fetched!",
            allTheatres
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error!",
        })
    }
})

// Getting all theatres for a particular user ID as owner
theatreRouter.get("/get-all-theatres-by-owner/:ownerID", async (req, res) => {
    try {
        const allTheatresByOwner = await Theatre.find({
            owner: req.params.ownerID
        })

        console.log(req.params.ownerID, allTheatresByOwner)

        res.send({
            success: true,
            message: "Theatres by owners fetched!",
            allTheatresByOwner
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error!",
        })
    }
})




module.exports = theatreRouter