import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../../components/blog/Loader";
import axios from "axios";
import { apiUrl } from "./Register";
import { useAuth } from "../../context/AuthContext";
import { profilePlaceHolder } from "../../components/blog/BlogCard";

const User = () => {
 const { username } = useParams();
 const [profileUser, setProfileUser] = useState(null);
 const [loadingUser, setLoadingUser] = useState(true);
 const { currentUser } = useAuth();
 const token = localStorage.getItem("token");

 const getUser = async () => {
  setLoadingUser(true);
  try {
   const resp = await axios.get(`${apiUrl}/api/users/user/${username}`);
   setProfileUser(resp.data);
  } catch (error) {
   console.log(error);
  } finally {
   setLoadingUser(false);
  }
 };

 const handleAdmin = async (userId) => {
  try {
   const resp = await axios.put(
    `${apiUrl}/api/users/change-role/${userId}`,
    {},
    {
     headers: { Authorization: `Bearer ${token}` },
    }
   );
   setProfileUser(resp.data);
  } catch (error) {
   console.log(error);
  }
 };

 useEffect(() => {
  getUser();
 }, [username]);

 if (loadingUser) return <Loader />;

 return (
  <div className="bg-white  dark:bg-gray-800/50 m-3 p-6 rounded-lg shadow-md mt-10 max-w-200 mx-auto">
   <div className="flex flex-col items-center space-y-3">
    {/* Profile Picture */}
    <img
     src={profileUser.profilePicture || profilePlaceHolder}
     alt="Profile"
     className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
    />

    {/* Username */}
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
     {profileUser.username}
    </h2>
    <h3>{profileUser.email}</h3>

    {/* Role */}
    <div className="mt-5 flex flex-col w-40 gap-2 text-center">
     <h2 className="text-xl">Role: {profileUser.role}</h2>
     {currentUser?.role === "admin" && (
      <button
       onClick={() => {
        handleAdmin(profileUser._id);
       }}
       className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 cursor-pointer"
      >
       {profileUser.role === "user"
        ? "Make the user an Admin"
        : "Remove Admin access"}
      </button>
     )}
    </div>
   </div>
  </div>
 );
};

export default User;
