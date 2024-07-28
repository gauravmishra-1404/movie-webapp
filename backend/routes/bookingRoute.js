const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_KEY);
const emailHelper = require('../config/emailHelper');
const authMiddleware = require('../middlewares/authMiddleware');
const Booking = require('../model/bookingModel');
const Show = require('../model/showModel');
const UserModel = require('../model/userModel');

router.post('/make-payment', authMiddleware, async (req, res) => {
    try {
        const { token, amount } = req.body;
        // const customer = await stripe.customers.create({
        //     email: token.email,
        //     source: token.id
        // });

        // This is what confirms that stripe has charged the card
        // which the user has provided from frontend
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            // customer: customer.id,
            payment_method_types: ['card'],
            receipt_email: token.email,
            description: "Token has been assigned to the movie!"
        });

        const transactionId = paymentIntent.id;

        res.send({
            success: true,
            message: "Payment Successful! Ticket(s) booked!",
            data: transactionId
        });
    } catch (err) {
        res.send({
            success: false,
            message: err.message
        })
    }
});

// Create a booking after the payment
router.post('/book-show', authMiddleware, async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();

        const show = await Show.findById(req.body.show).populate("movie").populate("theatre");
        const updatedBookedSeats = [...show.bookedSeats, ...req.body.seats];
        await Show.findByIdAndUpdate(req.body.show, { bookedSeats: updatedBookedSeats });
        res.send({
            success: true,
            message: 'New Booking done!',
            data: newBooking
        });

        const user = await UserModel.findById(newBooking.user)

        console.log({ user })

        await emailHelper("ticket.html", user.email, {
            name: user.name,
            movie: show.movie.movieName,
            theatre: show.theatre.name,
            date: show.date,
            time: show.time,
            seats: newBooking.seats,
            amount: newBooking.seats.length * show.ticketPrice,
            transactionId: newBooking.transactionId,
        });

        console.log("Email sent")

    } catch (err) {
        console.log({ err })
        res.send({
            success: false,
            message: err.message
        });
    }
});


router.get("/get-all-bookings", authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.body.userId })
            .populate("user")
            .populate("show")
            .populate({
                path: "show",
                populate: {
                    path: "movie",
                    model: "movies"
                }
            })
            .populate({
                path: "show",
                populate: {
                    path: "theatre",
                    model: "theatres"
                }
            });

        res.send({
            success: true,
            message: "Bookings fetched!",
            data: bookings
        })

    } catch (err) {
        res.send({
            success: false,
            message: err.message
        })
    }
});

module.exports = router;

// ```The email part in this component is handled using the `EmailHelper` function. Here’s a detailed explanation of how it works and what it does:

// 1. **Email Template**: The `EmailHelper` function is designed to send an email using a specified template file. In this case, the template is `"ticketTemplate.html"`.

// 2. **Recipient Email Address**: The email is sent to the user who made the booking. The recipient's email address is obtained from `populatedBooking.user.email`.

// 3. **Dynamic Content for Email**: The email includes various pieces of dynamic content related to the booking. These pieces of content are provided as an object in the third argument of the `EmailHelper` function. Specifically, the content includes:

//    - **Name**: The name of the user who made the booking (`populatedBooking.user.name`).
//    - **Movie**: The title of the movie for which the ticket was booked (`populatedBooking.show.movie.title`).
//    - **Theatre**: The name of the theatre where the movie will be shown (`populatedBooking.show.theatre.name`).
//    - **Date**: The date of the show (`populatedBooking.show.date`).
//    - **Time**: The time of the show (`populatedBooking.show.time`).
//    - **Seats**: The seats booked by the user (`populatedBooking.seats`).
//    - **Amount**: The total amount paid for the booking, calculated as the number of seats multiplied by the ticket price (`populatedBooking.seats.length * populatedBooking.show.ticketPrice`).
//    - **Transaction ID**: The transaction ID of the payment (`populatedBooking.transactionId`).

// 4. **Sending the Email**: The `EmailHelper` function is an asynchronous function that likely uses a service like Nodemailer or a similar library to send the email. It sends the email using the specified template and fills in the placeholders in the template with the dynamic content provided.

// Here is the relevant part of the code for reference:

// ```javascript
// await emailHelper("ticketTemplate.html", populatedBooking.user.email, {
//    name: populatedBooking.user.name,
//    movie: populatedBooking.show.movie.title,
//    theatre: populatedBooking.show.theatre.name,
//    date: populatedBooking.show.date,
//    time: populatedBooking.show.time,
//    seats: populatedBooking.seats,
//    amount: populatedBooking.seats.length * populatedBooking.show.ticketPrice,
//    transactionId: populatedBooking.transactionId,
// });