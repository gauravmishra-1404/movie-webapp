import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../api/users";
import { useNavigate } from "react-router-dom";
import { message, Layout, Menu } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { hideLoading, showLoading } from "../redux/loaderSlice";
import { Header } from "antd/es/layout/layout";
import {
  HomeOutlined,
  LogoutOutlined,
  ProfileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { setUser } from "../redux/userSlice";

function ProtectedRoute({ children }) {
  const {user} = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log({ user })

  const navItems = [
    {
      label: (
            <span
            onClick={() => navigate("/")}
            >
              Home
            </span>
          ),
      icon: <HomeOutlined />,
    },

    {
      label: `${user ? user.name : ""}`,
      icon: <UserOutlined />,
      children: [
        {
          label: (
            <span
            onClick={() => {
              if (user.role==='Admin') {
                navigate("/home");
              } else if (user.role==='Partner') {
                navigate("/partner");
              } else {
                navigate("/profile");
              }
            }}
            >
              My Profile
            </span>
          ),
          icon: <ProfileOutlined />,
        },

        {
          label: (
            <Link
              to="/login"
              onClick={() => {
                localStorage.removeItem("token");
              }}
            >
              Log Out
            </Link>
          ),
          icon: <LogoutOutlined />,
        },
      ],
    },
  ];

  const getValidUser = async () => {
    try {
     //Before fetching, turn loading on 
      dispatch(showLoading());

      const response = await getCurrentUser();
      console.log(response)

      // Check if the user's role correspond with the current Protected Route role


      dispatch(setUser(response.user));
      dispatch(hideLoading());
      // Hide Loader
    } catch (error) {
      dispatch(setUser(null));
      message.error(error.message);
    }
  };

  useEffect(() => {
    // If there is no token, no need to make any API call
    // Simply redirect back to the login page
    if (localStorage.getItem("token")) {
      getValidUser();
    } else {
      navigate("/login");
    }
  }, []);

  return (
    user && (
      <>
        <Layout>
          <Header
            className="d-flex justify-content-between"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              width: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <h3 className="demo-logo text-white m-0" style={{ color: "white" }}>
              Book My Show
            </h3>
            <Menu theme="dark" mode="horizontal" items={navItems} />
          </Header>
          <div style={{ padding: 24, height: "90vh",  minHeight: 380, background: "#fff" }}>
            {children}
          </div>
        </Layout>
      </>
    )
  );
}

export default ProtectedRoute;