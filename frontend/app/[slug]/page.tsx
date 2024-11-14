'use client'
import VideoPlayer from "../compoments/video";

const ItemPage = () => {

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Item Title</h1>
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
        {/* Item Image */}
        <div className="mb-6">
          <img src="/path-to-your-image.jpg" alt="Item Image" className="w-full h-auto rounded" />
        </div>

        {/* HLS Video */}
          <VideoPlayer
            src=""
          />

        {/* Add to Cart Button */}
        <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ItemPage;
