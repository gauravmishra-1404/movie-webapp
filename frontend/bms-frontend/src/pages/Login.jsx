import React from 'react'
import { Button, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from '../api/users'

function Login() {
  const navigate = useNavigate()
  const [messageApi, context] = message.useMessage()

  const onFinishLoginForm = async (values) => {
    try {
      const response = await loginUser(values)

      console.log({ response })
      if (response.success) {
        messageApi.success("Logged In successfully!")
        localStorage.setItem("token", response.token)

        if (response.role === "Admin") {
          return navigate("/home")
        }
        if (response.role === "Partner") {
          return navigate("/partner")
        }

        navigate("/")
      } else {
        messageApi.error("Something went wrong!")
      }
    } catch (error) {
      messageApi.error("Something went wrong!")
      console.log("error", error)
    }
  }

  return (
    <>
      {context}
      <header className="App-header">
        <main className="main-area mw-500 text-center px-3">
          <section className="left-section">
            <h1>Login to BookMyShow</h1>
          </section>

          <section className="right-section">
            <Form onFinish={onFinishLoginForm} layout="vertical">

              <Form.Item
                label="Email"
                htmlFor="email"
                name="email"
                className="d-block"
                rules={[{ required: true, message: "Email is required" }]}
              >
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your Email"
                ></Input>
              </Form.Item>

              <Form.Item
                label="Password"
                htmlFor="password"
                name="password"
                className="d-block"
                rules={[{ required: true, message: "Password is required" }]}
              >
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your Password"

                ></Input>
              </Form.Item>

              <Form.Item className="d-block">
                <Button
                  type="primary"
                  block
                  htmlType="submit"
                  style={{ fontSize: "1rem", fontWeight: "600" }}
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
            <div>
              <p>
                New User? <Link to="/register">Register Here</Link>
              </p>
              <p>
                Forgot Password? <Link to="/forget">Click Here</Link>
              </p>
            </div>
          </section>
        </main>
      </header>
    </>
  )
}

export default Login