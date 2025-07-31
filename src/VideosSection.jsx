import React from "react";
import videos from "./json/videos.json";

const VideoSection = ({ handleVideoClick }) => {
  return (
    <section className="bg-sweetstake-dark ml-10 px-6 mr-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-2xl bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => handleVideoClick(video.url)}
              tabIndex="0"
              onKeyDown={(e) => e.key === 'Enter' && handleVideoClick(video.url)}
              role="button"
              aria-label={`Watch video - Opens in new tab`}
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={video.thumbnail}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Video thumbnail"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>

              {video.time && (
                <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                  <span className="text-red-500">▶</span>
                  <span>{video.time}</span>
                </div>
              )}

              {video.title && (
                <div className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold drop-shadow-md">
                  {video.title}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;