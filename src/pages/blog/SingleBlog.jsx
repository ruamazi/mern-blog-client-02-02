import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiUrl } from "./Register";
import { profilePlaceHolder } from "../../components/blog/BlogCard";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/blog/Loader";
import { FaLock, FaLockOpen } from "react-icons/fa6";
import { MdOutlineDeleteOutline } from "react-icons/md";
import ConfirmationModal from "../../components/blog/ConfirmationModal";

const SingleBlog = () => {
 const { id } = useParams();
 const [blog, setBlog] = useState(null);
 const [comment, setComment] = useState("");
 const { currentUser } = useAuth();
 const [deletingBlog, setDeletingBlog] = useState(false);
 const [commenting, setCommenting] = useState(false);
 const [deletingComment, setDeletingComment] = useState(false);
 const [error, setError] = useState("");
 const [showDeleteBlogModal, setShowDeleteBlogModal] = useState(false);
 const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
 const [commentToDelete, setCommentToDelete] = useState(null);
 const navigate = useNavigate();
 const token = localStorage.getItem("token");

 useEffect(() => {
  fetchBlog();
 }, [id]);

 const fetchBlog = async () => {
  try {
   const response = await axios.get(`${apiUrl}/api/blogs/${id}`);
   setBlog(response.data);
  } catch (err) {
   setError("Failed to fetch blog");
  }
 };

 const renderContentWithMedia = (content) => {
  const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;
  const youtubeRegex =
   /(https?:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+))/i;

  return content.split(/\s+/).map((word, index) => {
   if (imageRegex.test(word)) {
    return (
     <img
      key={index}
      src={word}
      alt="Blog content"
      className="my-2 max-w-full h-auto"
     />
    );
   } else if (youtubeRegex.test(word)) {
    const match = word.match(youtubeRegex);
    const videoId = match[2];
    return (
     <div key={index} className="my-2">
      <iframe
       width="560"
       height="315"
       src={`https://www.youtube.com/embed/${videoId}`}
       title="YouTube video player"
       frameBorder="0"
       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
       allowFullScreen
      ></iframe>
     </div>
    );
   } else {
    return <span key={index}>{word} </span>;
   }
  });
 };

 const handleCommentSubmit = async (e) => {
  e.preventDefault();
  setCommenting(true);
  try {
   await axios.post(
    `${apiUrl}/api/comments`,
    { content: comment, blogId: id },
    { headers: { Authorization: `Bearer ${token}` } }
   );
   setComment("");
   fetchBlog();
  } catch (err) {
   setError("Failed to post comment");
  } finally {
   setCommenting(false);
  }
 };

 const handleDeleteBlog = async () => {
  setDeletingBlog(true);
  try {
   await axios.delete(`${apiUrl}/api/blogs/${blog._id}`, {
    headers: { Authorization: `Bearer ${token}` },
   });
   navigate("/");
  } catch (error) {
   console.log(error);
  } finally {
   setDeletingBlog(false);
   setShowDeleteBlogModal(false);
  }
 };

 const handleDeleteComment = async (commentId) => {
  setDeletingComment(true);
  try {
   await axios.delete(`${apiUrl}/api/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
   });
   fetchBlog();
  } catch (error) {
   console.log(error);
  } finally {
   setDeletingComment(false);
   setShowDeleteCommentModal(false);
  }
 };

 const handleBlockComments = async () => {
  try {
   const resp = await axios.patch(
    `${apiUrl}/api/blogs/${blog._id}/toggle-comments`,
    {},
    {
     headers: {
      Authorization: `Bearer ${token}`,
     },
    }
   );
   setBlog(resp.data.blog);
  } catch (error) {
   console.log(error);
  }
 };

 if (!blog) return <Loader />;

 return (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
   <div className="container mx-auto">
    <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
     {blog.title}
    </h1>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
     <p className="text-gray-700 dark:text-gray-300 mb-4">
      {renderContentWithMedia(blog.content)}
     </p>
     <Link
      to={`/user/${blog.author.username}`}
      className="flex items-center mb-6"
     >
      <img
       src={blog.author.profilePicture || profilePlaceHolder}
       alt="Author"
       className="w-10 h-10 rounded-full mr-2"
      />
      <span className="text-gray-700 dark:text-gray-400">
       {blog.author.username}
      </span>
     </Link>
     {blog?.tags[0] != "" &&
      blog.tags.map((each, i) => (
       <Link
        to={`/blogs/${each}`}
        key={i}
        className="mr-2 bg-slate-500 px-2 py-1 text-sm"
       >
        #{each.trim().charAt(0).toUpperCase() + each.trim().slice(1)}
       </Link>
      ))}
     {(currentUser?._id === blog?.author._id ||
      currentUser?.role === "admin") && (
      <div className="flex gap-4 w-full my-2 p-2 flex-wrap">
       <button
        disabled={deletingBlog}
        onClick={() => setShowDeleteBlogModal(true)}
        className="flex items-center gap-1 bg-red-400 px-2 hover:bg-red-500 cursor-pointer"
       >
        {deletingBlog ? "Deleting..." : "Delete"} <MdDelete size={20} />
       </button>
       <button
        onClick={() => navigate(`/update-blog/${blog._id}`)}
        className="flex items-center gap-1 bg-blue-500 px-2 hover:bg-blue-600 cursor-pointer"
       >
        Update <CiEdit size={20} />
       </button>
       <button
        onClick={handleBlockComments}
        className="flex items-center gap-1 bg-gray-500 px-2 hover:bg-gray-600 cursor-pointer"
       >
        {blog.commentsEnabled ? "Lock comments" : "Unlock comments"}
        {blog.commentsEnabled ? <FaLockOpen size={18} /> : <FaLock size={18} />}
       </button>
      </div>
     )}

     <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white mt-5">
      Comments
     </h2>
     {blog.comments.map((comment) => (
      <div
       key={comment._id}
       className="m-2 bg-black/30 p-2 rounded-xl shadow max-w-4xl mx-auto"
      >
       <div className="flex items-center">
        <img
         src={comment.author.profilePicture || profilePlaceHolder}
         alt="Author"
         className="w-8 h-8 rounded-full mr-2"
        />
        <span className="text-gray-700 dark:text-gray-400">
         {comment.author.username}
        </span>
       </div>
       <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-300 ml-10">
         {comment.content}
        </p>

        {(currentUser?._id === blog?.author._id ||
         currentUser?.role === "admin" ||
         currentUser?._id === comment.author._id) && (
         <button
          onClick={() => {
           setCommentToDelete(comment._id);
           setShowDeleteCommentModal(true);
          }}
          disabled={deletingComment}
          className="cursor-pointer text-red-400 hover:text-red-500"
         >
          <MdOutlineDeleteOutline size={20} />
         </button>
        )}
       </div>
      </div>
     ))}
     {currentUser && blog.commentsEnabled && (
      <form onSubmit={handleCommentSubmit} className="mt-6">
       <textarea
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
        rows="3"
        required
       />
       <button
        disabled={commenting}
        type="submit"
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 cursor-pointer"
       >
        {commenting ? "Commenting..." : "Add Comment"}
       </button>
      </form>
     )}
    </div>
   </div>

   <ConfirmationModal
    isOpen={showDeleteBlogModal}
    onClose={() => setShowDeleteBlogModal(false)}
    onConfirm={handleDeleteBlog}
    message="Are you sure you want to delete this blog?"
   />

   <ConfirmationModal
    isOpen={showDeleteCommentModal}
    onClose={() => setShowDeleteCommentModal(false)}
    onConfirm={() => handleDeleteComment(commentToDelete)}
    message="Are you sure you want to delete this comment?"
   />
  </div>
 );
};

export default SingleBlog;
