import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

const Resources = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const blogRef = ref(db, "Blog");
    
    onValue(blogRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const blogList = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setBlogs(Array.isArray(blogList) ? blogList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : []);
      } else {
        setBlogs([]);
      }
    });
  }, []);

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      {!selectedBlog ? (
        <>
          {/* Hero Section */}
          <section className="text-#003049 text-center py-16">
            <h1 className="text-4xl font-bold">Discover Inspiring Stories</h1>
            <p className="mt-4">Read blogs from industry experts, students, and professionals.</p>
          </section>

          {/* Search & Filter */}
          <div className="container mx-auto py-6">
            <input
              type="text"
              placeholder="Search Blogs..."
              className="w-full p-2 border border-gray-300 rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Trending Blogs */}
          <section className="container mx-auto py-6">
            <div className="grid grid-cols-3 gap-6 mt-6">
              {filteredBlogs.slice(0, 3).map((blog) => (
                <div key={blog.id} className="bg-white p-4 rounded-lg shadow-md">
                  {/* <img src={blog.image || "/placeholder.jpg"} alt={blog.title} className="rounded-md" /> */}
                  <h3 className="font-bold mt-2">{blog.title}</h3>
                  <p className="text-sm text-gray-600">By {blog.author}</p>
                  <button
                    className="text-white px-4 py-2 rounded mt-2"
                    style={{ background: 'linear-gradient(135deg, #003049, #003049, #005f73)' }}
                    onClick={() => setSelectedBlog(blog)}
                  >
                    Read More
                  </button>
                </div>
              ))}
            </div>
          </section>

        </>
      ) : (
        <div className="mt-6 p-4 border rounded shadow">
          <button
            onClick={() => setSelectedBlog(null)}
            className="text-white px-4 py-2 rounded mb-2"
            style={{ background: 'linear-gradient(135deg, #003049, #003049, #005f73)' }}
          >
            Back to Blogs
          </button>
          <h2 className="text-xl font-bold">{selectedBlog?.title}</h2>
          <h3 className="text-lg text-gray-600">{selectedBlog?.subtitle}</h3>
          {selectedBlog?.image && <img src={selectedBlog.image} alt="Blog" className="w-full h-auto my-2" />}
          <div className="mt-2 text-gray-800" dangerouslySetInnerHTML={{ __html: selectedBlog?.content }}></div>
          <p className="mt-2 text-sm text-gray-500">By {selectedBlog?.author}</p>
        </div>
      )}
    </div>
  );
};

export default Resources;
