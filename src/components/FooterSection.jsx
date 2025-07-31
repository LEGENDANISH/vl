import React, { useEffect, useState } from "react";
import footer from "../json/footerData.json"; // Adjust the path if needed
import {
  FaWindows,
  FaPlaystation,
  FaXbox,
  FaVrCardboard,
} from "react-icons/fa";

const iconMap = {
  FaWindows: FaWindows,
  FaPlaystation: FaPlaystation,
  FaXbox: FaXbox,
  FaVrCardboard: FaVrCardboard,
};

export default function FooterSection() {
  const [data, setData] = useState(null);


//  useEffect(() => {
//     axios
//       .get("/json/footerData.json") 
//       .then((res) => setData(res.data))
//       .catch((err) => console.error("Failed to load footer data:", err));
//   }, []);

//   if (!data) return null; 



  useEffect(() => {
    setData(footer); // ✅ directly set the imported data
  }, []);
  if (!data) return null; // or a loading spinner

  return (
    <div className="bg-sweetstake text-white ml-10 ">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
        <div className="md:col-span-1">
          <h2 className="text-4xl font-bold">Platform Availability</h2>
        </div>

        <div className="md:col-span-3">
          {data.platforms.map((platform, index) => {
            const IconComponent = iconMap[platform.icon];
            return (
              <div key={index} className="ml-8 flex flex-wrap gap-20 mt-6">
                <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl">
                  <IconComponent className="text-lg" />
                  <span className="font-semibold">{platform.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-32"></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
        <div className="md:col-span-1">
          <h3 className="text-4xl font-bold">Additional Details</h3>
        </div>

        <div className="md:col-span-3 gap-6 mt-3">
          <div className="flex gap-32 ml-8">
            <div>
              <h4 className="text-sm text-[10px] font-bold text-gray-400 mb-2">
                WEBSITE
              </h4>
              <a
                href={data.details.website.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-md text-white hover:text-pink-500 cursor-pointer transition-colors duration-200"
              >
                {data.details.website.label}
              </a>
            </div>
            <div>
              <h4 className="text-sm text-[10px] font-bold text-gray-400 mb-2">
                DEVELOPER
              </h4>
              <p className="text-md text-white">{data.details.developer}</p>
            </div>
            <div>
              <h4 className="text-sm text-[10px] font-bold text-gray-400 mb-2">
                PUBLISHER
              </h4>
              <p className="text-md text-white">{data.details.publisher}</p>
            </div>
            <div>
              <h4 className="text-sm text-[10px] font-bold text-gray-400 mb-2">
                RELEASE DATE
              </h4>
              <p className="text-md text-white">{data.details.releaseDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
