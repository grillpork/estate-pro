import React from "react";

const PropertiesLoader = () => {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index}>
          <div className="w-48 h-48 bg-gray-200 animate-pulse"></div>
          <div className="w-48 h-4 bg-gray-200 animate-pulse"></div>
          <div className="w-48 h-4 bg-gray-200 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
};

export default PropertiesLoader;
