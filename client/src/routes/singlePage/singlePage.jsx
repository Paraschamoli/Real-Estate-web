import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { singlePostData, userData } from "../../lib/dummydata";
import { redirect, useLoaderData } from "react-router-dom";
import DOMPurify from "dompurify";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
function SinglePage() {
  const post = useLoaderData();
  const { currentUser } = useContext(AuthContext);
  console.log(post);
  const [save, setsave] = useState(post.data.isSaved);
  const handleSave = async () => {
    setsave((prev)=>!prev);
    if (!currentUser) {
      redirect("/login");
    }
    try {
      await apiRequest.post("/user/save", { postId: post.data.post._id });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.data.post.img} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{post.data.post.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{post.data.post.address}</span>
                </div>
                <div className="price">$💵 {post.data.post.price}</div>
              </div>
              <div className="user">
                <img src={post.data.user.avatar || "noavatar.jpg"} alt="" />
                <span>{post.data.user.username}</span>
              </div>
            </div>
            <div
              className="bottom"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.data.postDetail.desc),
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <img src="/utility.png" alt="" />
              <div className="featureText">
                <span>Utilities</span>
                {post.data.postDetail.utilities === "owner" ? (
                  <p>Owner is responsible</p>
                ) : (
                  <p>Tenant is responsible</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Pet Policy</span>
                {post.data.postDetail.pet === "allowed" ? (
                  <p>Pets Allowed</p>
                ) : (
                  <p>Pets Not Allowed</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>income Policy</span>
                <p>{post.data.postDetail.income}</p>
              </div>
            </div>
          </div>
          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <img src="/size.png" alt="" />
              <span>{post.data.postDetail.size}sqft</span>
            </div>
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>{post.data.post.bedroom} bedrooms</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{post.data.post.bathroom} bathroom</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/school.png" alt="" />
              <div className="featureText">
                <span>School</span>
                <p>{post.data.postDetail.school}m away</p>
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>{post.data.postDetail.bus}m away</p>
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Restaurant</span>
                <p>{post.data.postDetail.restaurant}m away</p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post.data.post]} />
          </div>
          <div className="buttons">
            <button>
              <img src="/chat.png" alt="" />
              Send a Message
            </button>
            <button onClick={handleSave} style={{backgroundColor:save? "#fece51":"white"}}>
              <img src="/save.png" alt="" />
              {save ?"Place Saved" : "Save the post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePage;
