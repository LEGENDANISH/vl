import React, { useEffect } from 'react';

const Test = () => {
  useEffect(() => {
    const now = new Date().toLocaleString();
    console.log(`[${now}] 🧩 <Test /> component mounted`);
  }, []);

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md text-center">
      test
      
    </div>
  );
};

export default Test;
