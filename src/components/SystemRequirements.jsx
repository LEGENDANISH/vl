import React from "react";
import systemRequirements from "../json/systemRequirements.json";

  // const [requirements, setRequirements] = useState(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchRequirements = async () => {
  //     try {
  //       const response = await fetch("https://yourdomain.com/systemRequirements.json");
  //       const data = await response.json();
  //       setRequirements(data);
  //     } catch (error) {
  //       console.error("Failed to fetch system requirements:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchRequirements();
  // }, []);


export default function SystemRequirements() {
  return (
    <div className="bg-sweetstake text-white min-h-screen p-10 grid grid-cols-4">
      <h2 className="text-4xl font-bold mb-10">{systemRequirements.title}</h2>
      <div className="flex col-span-3 gap-6">
        {systemRequirements.specs.map((spec, index) => (
          <div key={index} className="bg-sweetstake rounded-2xl p-6">
            <h3 className={`text-xl font-bold ${spec.color} mb-4`}>
              {spec.title}
            </h3>
            <p className="text-3xl font-bold mb-4">{spec.fps}</p>
            <div className="space-y-4">
              {spec.requirements.map((requirement, reqIndex) => (
                <div key={reqIndex}>
                  <h3 className="text-white font-bold mb-1">
                    {requirement.title}
                  </h3>
                  {requirement.values.map((value, valueIndex) => (
                    <p
                      key={valueIndex}
                      className="text-gray-400 font-semibold text-sm"
                    >
                      {value}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}