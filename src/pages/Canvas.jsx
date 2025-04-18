import { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Html, TransformControls } from '@react-three/drei';
import { useNavigate, useLocation } from 'react-router-dom';
import FurnitureLibrary from '../components/FurnitureLibrary';

export default function CanvasPage() {
  const [roomData, setRoomData] = useState(null);
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [transformMode, setTransformMode] = useState('translate');
  const navigate = useNavigate();
  const location = useLocation();
  const planeRef = useRef();

  useEffect(() => {
    const design = location.state?.design || JSON.parse(localStorage.getItem('currentDesign'));
    if (!design) {
      navigate('/room-input');
      return;
    }
    setRoomData(design.roomData || design);
    setFurnitureItems(design.furnitureItems || []);
  }, [navigate, location]);

  const placeFurniture = (position, item) => {
    const newItem = {
      ...item,
      id: Date.now(),
      position: [position.x, 0, position.z],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    };
    setFurnitureItems(prev => [...prev, newItem]);
  };

  const saveDesign = () => {
    const designName = prompt('Enter design name:');
    if (!designName) return;

    const designs = JSON.parse(localStorage.getItem('designs')) || [];
    const newDesign = {
      id: Date.now(),
      name: designName,
      date: new Date().toLocaleString(),
      roomData,
      furnitureItems
    };
    
    localStorage.setItem('designs', JSON.stringify([...designs, newDesign]));
    alert('Design saved successfully!');
  };

  useEffect(() => {
    return () => {
      localStorage.setItem('currentDesign', JSON.stringify({
        ...roomData,
        furnitureItems
      }));
    };
  }, [furnitureItems, roomData]);

  if (!roomData) return null;

  return (
    <div className="w-full h-screen relative">
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        {/* 3D Scene */}
        <mesh
          position={[roomData.width/2, roomData.height/2, roomData.length/2]}
          receiveShadow
        >
          <boxGeometry args={[roomData.width, roomData.height, roomData.length]} />
          <meshStandardMaterial color={roomData.wallColor} />
        </mesh>

        <mesh 
          ref={planeRef}
          rotation={[-Math.PI/2, 0, 0]}
          onClick={(e) => selectedFurniture?.type && placeFurniture(e.point, selectedFurniture)}
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#f0f0f0" transparent opacity={0.3} />
        </mesh>

        {furnitureItems.map((item) => (
          <FurnitureItem
            key={item.id}
            item={item}
            isSelected={selectedFurniture?.id === item.id}
            onSelect={() => setSelectedFurniture(item)}
          />
        ))}

        {selectedFurniture?.ref && (
          <TransformControls
            object={selectedFurniture.ref.current}
            mode={transformMode}
            onMouseUp={() => {
              const updated = furnitureItems.map(i => 
                i.id === selectedFurniture.id ? {
                  ...i,
                  position: selectedFurniture.ref.current.position.toArray(),
                  rotation: selectedFurniture.ref.current.rotation.toArray(),
                  scale: selectedFurniture.ref.current.scale.toArray()
                } : i
              );
              setFurnitureItems(updated);
            }}
          />
        )}

        <OrbitControls makeDefault enabled={!selectedFurniture} />
        <Grid cellSize={0.5} cellThickness={0.5} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        <Html wrapperClass="canvas-ui">
          <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-md space-y-3 min-w-[200px] z-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Tools</h3>
              <button
                onClick={saveDesign}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                Save
              </button>
            </div>
            
            <select
              value={transformMode}
              onChange={(e) => setTransformMode(e.target.value)}
              className="w-full p-2 border rounded-lg mb-2"
            >
              <option value="translate">Move (W)</option>
              <option value="rotate">Rotate (E)</option>
              <option value="scale">Scale (R)</option>
            </select>
            
            <button
              onClick={() => setSelectedFurniture(null)}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Selection
            </button>
          </div>

          <div className="fixed bottom-4 left-4 z-50">
            <FurnitureLibrary
              selectedItem={selectedFurniture}
              onSelect={(item) => setSelectedFurniture(item ? { 
                ...item, 
                id: Date.now() 
              } : null)}
            />
          </div>
        </Html>
      </Canvas>
    </div>
  );
}

function FurnitureItem({ item, isSelected, onSelect }) {
  const ref = useRef();
  return (
    <mesh
      ref={ref}
      position={item.position}
      rotation={item.rotation}
      scale={item.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect({ ...item, ref });
      }}
      castShadow
    >
      <boxGeometry args={item.size} />
      <meshStandardMaterial 
        color={item.color} 
        opacity={isSelected ? 0.8 : 1}
        transparent
      />
    </mesh>
  );
}