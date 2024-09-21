import axios from "axios";

 const apiRequest=axios.create({
     baseURL:"https://real-estate-web-back.onrender.com/api",
    // baseURL:"http://localhost:8000/api",
    withCredentials:true
})


export default apiRequest;
