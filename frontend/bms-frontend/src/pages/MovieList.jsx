import React, { useEffect, useState } from "react";
import { Button, Table } from "antd";
// import MovieForm from "./MovieForm";
import { hideLoading, showLoading } from "../redux/loaderSlice";
import { getAllMovies } from "../api/movies";
import { useDispatch } from "react-redux";
// import moment from "moment";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import MovieForm from "./MovieForm";
// import DeleteMovieModal from "./DeleteMovieModal";

function MovieList() {
  // This state is used for the add/edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);


  const [formType, setFormType] = useState("add");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const dispatch = useDispatch();

  const getData = async () => {
    dispatch(showLoading());
    const response = await getAllMovies();
    const allMovies = response.movies;
    setMovies(
      allMovies.map(function (item) {
        return { ...item, key: `movie${item._id}` };
      })
    );
    dispatch(hideLoading());
  };

  const tableHeadings = [
    {
      title: "Poster",
      dataIndex: "poster",
      render: (text, movie) => {
        return (
          <img
            width="75"
            height="115"
            style={{ objectFit: "cover", background: `url(${text})`, backgroundSize: "cover" }}
          />
        );
      },
    },
    {
      title: "Movie Name",
      dataIndex: "movieName",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Duration",
      dataIndex: "duration",
      render: (text) => {
        return `${text} Min`;
      },
    },
    {
      title: "Genre",
      dataIndex: "genre",
    },
    {
      title: "Language",
      dataIndex: "language",
    },
    {
      title: "Release Date",
      dataIndex: "releaseDate",
      render: (text, data) => {
        return new Date(text).toLocaleDateString()
        // return moment(data.releaseDate).format("MM-DD-YYYY");
      },
    },
    {
      title: "Action",
      render: (text, movie) => {
        return (
          <div>
            <Button
              onClick={() => {
                setIsModalOpen(true);
                setSelectedMovie(movie);
                setFormType("edit");
              }}
            >
              <EditOutlined />
            </Button>
            <Button
              onClick={() => {
                setIsDeleteModalOpen(true);
                setSelectedMovie(data);
              }}
            >
              <DeleteOutlined />
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <div className="d-flex justify-content-end">
        <Button
          onClick={() => {
            setIsModalOpen(true);
            setFormType("add");
          }}
        >
          Add Movie
        </Button>
      </div>

      <Table dataSource={movies} columns={tableHeadings} />
    
      {isModalOpen && (
        <MovieForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          selectedMovie={selectedMovie}
          formType={formType}
          setSelectedMovie={setSelectedMovie}
          getData={getData}
        />
      )}

      {/* {isDeleteModalOpen && (
        <DeleteMovieModal
          isDeleteModalOpen={isDeleteModalOpen}
          selectedMovie={selectedMovie}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          setSelectedMovie={setSelectedMovie}
          getData={getData}
        />
      )} */}
    </>
  );
}

export default MovieList;