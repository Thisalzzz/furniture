import { useThree } from '@react-three/fiber';
import { useState } from 'react';

export default function CanvasUI() {
  const { camera } = useThree();
  const [is2D, setIs2D] = useState(false);

  const handleResetView = () => {
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
  };

  return (
    <div className="absolute top-4 left-4 space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
        <button
          onClick={() => setIs2D(!is2D)}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {is2D ? '3D View' : '2D View'}
        </button>
        
        <button
          onClick={handleResetView}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Reset Camera
        </button>
      </div>
    </div>
  );
}