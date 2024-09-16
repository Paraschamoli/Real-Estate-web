import "./login.scss";
import { Link, useNavigate} from "react-router-dom";

import { useState,useContext } from "react";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
function Login() {
  const [error, setError] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const navigate = useNavigate();

  const {updateUser}=useContext(AuthContext)
  const handleSubmit = async (e) => {
    setError("");
    e.preventDefault();
    setisLoading(true);
    const formData = new FormData(e.target);
    const username = formData.get("username");
    // const email = formData.get("email");
    const password = formData.get("password");
    try {
      const res = await apiRequest.post("/auth/login", {
        username,
        password,
      });
      // console.log(res);

      // console.log(res.data);
     // localStorage.setItem("user", JSON.stringify(res.data.data.user));
     updateUser(res.data)
      navigate("/profile");
    } catch (err) {
      console.log(err);
      setError(err.response.data.message);
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <input name="username" type="text" placeholder="Username" />
          <input name="password" type="password" placeholder="Password" />
          <button disabled={isLoading}>Login</button>
          {error && <span>{error}</span>}
          <Link to="/register">{"Don't"} you have an account?</Link>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default Login;
