import { useEffect, useState } from "react";
import { hideLoading, showLoading } from "../redux/loaderSlice";
import { useDispatch } from "react-redux";
import { getAllMovies } from "../api/movies";
import { message, Row, Col, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
// import moment from "moment";

const Home = () => {
  const [movies, setMovies] = useState(null);
  const [searchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log({ movies })

  const getData = async () => {
    try {
      dispatch(showLoading());
      const response = await getAllMovies();
      if (response.success) {
        setMovies(response.movies);
      } else {
        message.error(response.message);
      }
      dispatch(hideLoading());
    } catch (err) {
      message.error(err.message);
      dispatch(hideLoading());
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    // You need to re-call your API with the updated value of searchText
    // Debouncing
    console.log(searchText);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <Row className="justify-content-center w-100">
        <Col xs={{ span: 24 }} lg={{ span: 12 }}>
          <Input
            placeholder="Type here to search for movies"
            onChange={handleSearch}
            prefix={<SearchOutlined />}
          />
          <br />
          <br />
          <br />
        </Col>
      </Row>
      <Row
        className="justify-content-center"
        gutter={{
          xs: 8,
          sm: 16,
          md: 24,
          lg: 32,
        }}
      >
        {movies &&
          movies
            .filter((movie) =>
             // The ?. operator is called optional chaining operator
             // movie.movieName is null and we call toLowerCase()
             // shorthand of saying (if movie.movieName) {movie.movieName?.toLowerCase(....}
              movie.movieName?.toLowerCase().includes(searchText.toLowerCase())
            )
            .map((movie) => (
              <Col
                className="gutter-row mb-5"
                key={movie._id}
                span={{
                  xs: 24,
                  sm: 24,
                  md: 12,
                  lg: 10,
                }}
              >
                <div className="text-center">
                  <img
                    onClick={() => {
                      navigate(
                        `/movie/${movie._id}?date=${(new Date()).toISOString().split('T')[0]}`
                      );
                    }}
                    className="cursor-pointer object-cover"
                    src={movie.poster}
                    alt="Movie Poster"
                    width={200}
                    height={300}
                    style={{ borderRadius: "8px" }}
                  />
                  <h3
                    onClick={() => {
                      navigate(
                        `/movie/${movie._id}?date=${(new Date()).toISOString().split('T')[0]}`
                      );
                    }}
                    className="cursor-pointer"
                  >
                    {movie.movieName}
                  </h3>
                </div>
              </Col>
            ))}
      </Row>
    </>
  );
};

export default Home;