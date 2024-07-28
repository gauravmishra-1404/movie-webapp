import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hideLoading, showLoading } from "../redux/loaderSlice";
import { getShowById } from "../api/shows";
import { useNavigate, useParams } from "react-router-dom";
import { message, Card, Row, Col, Button } from "antd";
import moment from 'moment';
import StripeCheckout from "react-stripe-checkout";
import { bookShow, makePayment } from "../api/booking";


const STRIPE_PUB_KEY = "pk_test_51PfYekRq1eamTwevNRauMqm2WxdTLJneOwj75Oh2FfOV1eSnu8tvzQ9DsrBcb93UmWWyHmR1F9CXlOaUyM12xfwU00rO7Vzfwi"


const BookShow = () => {
    const { user } = useSelector((state) => state.users);
    const dispatch = useDispatch();

    // Initialized state for a single show
    const [show, setShow] = useState();

    // Storing the selected seats in an array
    const [selectedSeats, setSelectedSeats] = useState([]);

    // To extract out the show ID
    const params = useParams();
    const navigate = useNavigate();

    // Fetching the show details
    const getData = async () => {
        try {
            dispatch(showLoading());
            const response = await getShowById({ showId: params.id });
            if (response.success) {
                setShow(response.data);
                // message.success(response.message);
                console.log(response.data)
            } else {
                message.error(response.message)
            }
            dispatch(hideLoading());
        } catch (err) {
            message.error(err.message);
            dispatch(hideLoading());
        }
    }

    const book = async (transactionId) => {
        try {
            dispatch(showLoading());
            const response = await bookShow({
                show: params.id,
                transactionId,
                seats: selectedSeats,
                user: user._id,
            });
            if (response.success) {
                message.success("Show Booking done!");
                navigate("/");
            } else {
                message.error(response.message);
            }
            dispatch(hideLoading());
        } catch (err) {
            message.error(err.message);
            dispatch(hideLoading());
        }
    };



    // Once the payment has been initiated by Stripe,
    // I need to confirm that in my backend
    const onToken = async (token) => {

        console.log({ token })
        try {
            dispatch(showLoading());
            const response = await makePayment(
                token,
                selectedSeats.length * show.ticketPrice * 100
            );

            if (response.success) {
                message.success(response.message);
                book(response.data);
                console.log(response);
            } else {
                message.error(response.message);
            }
            dispatch(hideLoading());
        } catch (err) {
            message.error(err.message);
            dispatch(hideLoading());
        }
    };



    const getSeats = () => {
        let columns = 12;
        // Totalseats we're conmsidering 120 for our ease,
        // we can also get this from show.totalSeats
        let totalSeats = 120;
        let rows = totalSeats / columns; // 10

        return (
            <div className="d-flex flex-column align-items-center">
                <div className="w-100 max-width-600 mx-auto mb-25px">
                    <p className="text-center mb-10px">Screen this side, you will be watching in this direction</p>
                    <div className="screen-div">
                    </div>
                </div>
                <ul className="seat-ul justify-content-center">
                    {Array.from(Array(rows).keys()).map((row) => {
                        return (Array.from(Array(columns).keys()).map((column) => {

                            // First row and third column
                            // seatNumber = 0 * 12 + 2 + 1 = 3

                            // Second row and third column
                            // seatNumber = 1 * 12 + 2 + 1 = 15
                            let seatNumber = row * columns + column + 1;

                            let seatClass = "seat-btn";
                            // Selected seats are currently selected seats in frontend
                            // They are NOT booked yet
                            if (selectedSeats.includes(seatNumber)) {
                                seatClass += " selected"
                            }

                            // Booked seats are coming from server 
                            // They are seats which are previously booked for this show
                            if (show.bookedSeats.includes(seatNumber)) {
                                seatClass += " booked"
                            }


                            // We have to ensure that the seatnumber is only until the total seats in the show
                            if (seatNumber <= totalSeats)
                                return (
                                    <li><button className={seatClass} onClick={() => {
                                        if (selectedSeats.includes(seatNumber)) {
                                            setSelectedSeats(selectedSeats.filter((curSeatNumber => curSeatNumber !== seatNumber)))
                                        } else {
                                            setSelectedSeats([...selectedSeats, seatNumber]);
                                        }
                                    }}>{seatNumber}</button></li>
                                )
                        })
                        )
                    })}
                </ul>

                <div className="d-flex bottom-card justify-content-between w-100 max-width-600 mx-auto mb-25px mt-3">
                    <div className="flex-1">Selected Seats: <span>{selectedSeats.join(", ")}</span></div>
                    <div className="flex-shrink-0 ms-3">Total Price: <span>Rs. {selectedSeats.length * show.ticketPrice}</span></div>
                </div>
            </div>
        )
    }


    useEffect(() => {
        getData();
    }, [])

    return (<>

        {show && <Row gutter={24}>
            <Col span={24}>

                <Card
                    title={<div className="movie-title-details">
                        <h1>{show.movie.movieName}</h1>
                        <p>Theatre: {show.theatre.name}, {show.theatre.address}</p>
                    </div>}
                    extra={<div className="show-name py-3">
                        <h3><span>Show Name:</span> {show.name}</h3>
                        <h3><span>Date & Time: </span>{moment(show.date).format("MMM Do YYYY")} at {moment(show.time, "HH:mm").format("hh:mm A")}</h3>
                        <h3><span>Ticket Price:</span> Rs. {show.ticketPrice}/-</h3>
                        <h3><span>Total Seats:</span> {show.totalSeats}<span> &nbsp;|&nbsp; Available Seats:</span> {show.totalSeats - show.bookedSeats.length}  </h3>
                    </div>}
                    style={{ width: "100%" }}
                >
                    {getSeats()}


                    {selectedSeats.length > 0 && (
                        <StripeCheckout
                            token={onToken}
                            amount={selectedSeats.length * show.ticketPrice * 100}
                            stripeKey={STRIPE_PUB_KEY}
                        >
                            <div className="max-width-600 mx-auto">
                                <Button type="primary" shape="round" size="large" block>
                                    Pay Now
                                </Button>
                            </div>
                        </StripeCheckout>
                    )}
                </Card>
            </Col>
        </Row>}


    </>)
}
export default BookShow;