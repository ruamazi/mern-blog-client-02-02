import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import BlogCard from "../components/blog/BlogCard";
import { apiUrl } from "./blog/Register";

const Home = () => {
 const [blogs, setBlogs] = useState([]);
 const [currentPage, setCurrentPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 useEffect(() => {
  fetchBlogs();
 }, [currentPage]);

 const fetchBlogs = async () => {
  try {
   const response = await axios.get(
    `${apiUrl}/api/blogs?page=${currentPage}&limit=10`
   );
   setBlogs(response.data.blogs);
   setTotalPages(response.data.totalPages);
  } catch (err) {
   console.error(err);
  }
 };

 return (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
   <div className="container mx-auto">
    <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
     Latest Blogs
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     {blogs.map((blog) => (
      <Link to={`/blog/${blog._id}`} key={blog._id}>
       <BlogCard blog={blog} />
      </Link>
     ))}
    </div>
    <div className="flex justify-center mt-8">
     {Array.from({ length: totalPages }, (_, i) => (
      <button
       key={i + 1}
       onClick={() => setCurrentPage(i + 1)}
       className={`mx-1 px-4 py-2 rounded ${
        currentPage === i + 1
         ? "bg-blue-500 text-white"
         : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
       }`}
      >
       {i + 1}
      </button>
     ))}
    </div>
   </div>
  </div>
 );
};

export default Home;
