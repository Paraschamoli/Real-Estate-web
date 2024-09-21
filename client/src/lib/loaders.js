import apiRequest from "./apiRequest";
import { defer } from "react-router-dom";

// Loader for fetching a single post by ID
export const singlePageLoader = async ({ params }) => {
  try {
    const res = await apiRequest("/posts/" + params.id);
    return res.data; // Return the data directly
  } catch (error) {
    // Handle the error (e.g., return a meaningful error message or throw it)
    throw new Response("Failed to load post", { status: 500 });
  }
};

// Loader for fetching a list of posts based on query params
export const listPageLoader = async ({ request }) => {
  const query = new URLSearchParams(request.url.split("?")[1]).toString();
  try {
    const postPromise = apiRequest("/posts?" + query); // Await is unnecessary here since we use defer
    return defer({
      postResponse: postPromise, // Return the promise without awaiting
    });
  } catch (error) {
    // Handle error and throw a meaningful response
    throw new Response("Failed to load posts", { status: 500 });
  }
};

// Loader for fetching user profile data (posts and chats)
export const profilePageLoader = async () => {
  try {
    const postPromise = apiRequest("/user/profilePosts");
    const chatPromise = apiRequest("/chats");

    return defer({
      postResponse: postPromise, // Resolve the postPromise in the component
      chatResponse: chatPromise, // Resolve the chatPromise in the component
    });
  } catch (error) {
    // Handle error and throw a meaningful response
    throw new Response("Failed to load profile data", { status: 500 });
  }
};
