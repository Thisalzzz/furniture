import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Designs() {
  const [designs, setDesigns] = useState([]);

  useEffect(() => {
    const savedDesigns = JSON.parse(localStorage.getItem('designs')) || [];
    setDesigns(savedDesigns);
  }, []);

  const deleteDesign = (id) => {
    const updated = designs.filter(design => design.id !== id);
    setDesigns(updated);
    localStorage.setItem('designs', JSON.stringify(updated));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Saved Designs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {designs.map(design => (
          <div key={design.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="aspect-video bg-gray-100 rounded-lg mb-2"></div>
            <h3 className="text-xl font-semibold">{design.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{design.date}</p>
            
            <div className="flex space-x-2">
              <Link
                to="/canvas"
                state={{ design }}
                className="flex-1 text-center bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Open
              </Link>
              <button
                onClick={() => deleteDesign(design.id)}
                className="flex-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}