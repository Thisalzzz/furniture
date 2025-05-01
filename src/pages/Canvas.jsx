import { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Html, TransformControls, OrthographicCamera } from '@react-three/drei';
import { useNavigate, useLocation } from 'react-router-dom';

const furnitureData = [
  { id: 'chair', name: 'Chair', type: 'chair', size: [1, 1, 1] },
  { id: 'table', name: 'Table', type: 'table', size: [2, 1, 2] },
  { id: 'sofa', name: 'Sofa', type: 'sofa', size: [3, 1, 1.5] },
  { id: 'bed', name: 'Bed', type: 'bed', size: [2, 1, 3] },
  { id: 'lamp', name: 'Lamp', type: 'lamp', size: [0.5, 1.5, 0.5] },
];

function FurnitureLibrary({ selectedItem, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  const filteredFurniture = useMemo(() => {
    return furnitureData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || item.type === category;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, category]);

  const categories = useMemo(() => ['all', ...new Set(furnitureData.map(item => item.type))], []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-80 max-h-[70vh] overflow-y-auto z-50">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Furniture Library</h3>
      <input
        type="text"
        placeholder="Search furniture..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3">
        {filteredFurniture.length ? (
          filteredFurniture.map(item => (
            <div
              key={item.id}
              onClick={() => {
                console.log('Selected furniture:', item);
                onSelect(item);
              }}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedItem?.id === item.id
                  ? 'bg-blue-100 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              } border border-gray-200`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{item.name}</span>
                <span className="text-xs text-gray-500">{item.size.join(' x ')} m</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No furniture found</p>
        )}
      </div>
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
        console.log('Clicked furniture item:', item);
        onSelect({ ...item, ref });
      }}
      castShadow
      receiveShadow
    >
      <boxGeometry args={item.size} />
      <meshStandardMaterial
        color={item.color || '#ff6347'}
        roughness={item.shade?.roughness || 0.5}
        metalness={item.shade?.metalness || 0.2}
        opacity={isSelected ? 0.8 : 1}
        transparent
      />
    </mesh>
  );
}

export default function CanvasPage() {
  const [roomData, setRoomData] = useState(null);
  const [furnitureItems, setFurnitureItems] = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [transformMode, setTransformMode] = useState('translate');
  const [is2DView, setIs2DView] = useState(false);
  const [globalColor, setGlobalColor] = useState('#ffffff');
  const [globalShade, setGlobalShade] = useState({ roughness: 0.5, metalness: 0.2 });
  const navigate = useNavigate();
  const location = useLocation();
  const planeRef = useRef();

  useEffect(() => {
    try {
      const design = location.state?.design || JSON.parse(localStorage.getItem('currentDesign'));
      if (!design) {
        console.warn('No design data found, navigating to /room-input');
        navigate('/room-input');
        return;
      }
      const room = design.roomData || design;
      if (!room.width || !room.height || !room.length || room.width <= 0 || room.height <= 0 || room.length <= 0) {
        console.warn('Invalid room dimensions, using defaults:', room);
        room.width = room.width && room.width > 0 ? room.width : 10;
        room.height = room.height && room.height > 0 ? room.height : 10;
        room.length = room.length && room.length > 0 ? room.length : 10;
      }
      setRoomData(room);
      setFurnitureItems(design.furnitureItems || []);
      console.log('Loaded roomData:', room);
    } catch (error) {
      console.error('Error loading design:', error);
      navigate('/room-input');
    }
  }, [navigate, location]);

  const placeFurniture = (position, item) => {
    if (!item || !item.size || !roomData) {
      console.error('Cannot place furniture: Invalid item or roomData', { item, roomData });
      return;
    }

    console.log('Placing furniture:', item, 'at position:', position);

    const maxRoomDim = Math.max(roomData.width, roomData.length, roomData.height);
    const maxFurnitureDim = Math.max(...item.size);
    const scaleFactor = Math.min(1, maxRoomDim / (maxFurnitureDim * 2));
    const safeScale = Math.max(0.1, scaleFactor);

    const safeX = Math.max(0, Math.min(position.x, roomData.width));
    const safeZ = Math.max(0, Math.min(position.z, roomData.length));

    const newItem = {
      ...item,
      id: Date.now(),
      position: [safeX, item.size[1] / 2, safeZ],
      rotation: [0, 0, 0],
      scale: [safeScale, safeScale, safeScale],
      color: item.color || globalColor,
      shade: item.shade || globalShade
    };

    console.log('New furniture item:', newItem);

    setFurnitureItems(prev => [...prev, newItem]);
    setSelectedFurniture(null);
  };

  const saveDesign = () => {
    try {
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
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Failed to save design');
    }
  };

  const updateGlobalColor = (color) => {
    setGlobalColor(color);
    setFurnitureItems(prev => prev.map(item => ({
      ...item,
      color: selectedFurniture?.id === item.id ? item.color : color
    })));
    setRoomData(prev => ({ ...prev, wallColor: color }));
  };

  const updateGlobalShade = (roughness, metalness) => {
    setGlobalShade({ roughness, metalness });
    setFurnitureItems(prev => prev.map(item => ({
      ...item,
      shade: selectedFurniture?.id === item.id ? item.shade : { roughness, metalness }
    })));
  };

  const updateSelectedFurniture = (updates) => {
    setFurnitureItems(prev => prev.map(item =>
      item.id === selectedFurniture?.id ? { ...item, ...updates } : item
    ));
  };

  useEffect(() => {
    return () => {
      try {
        localStorage.setItem('currentDesign', JSON.stringify({ roomData, furnitureItems }));
      } catch (error) {
        console.error('Error saving current design:', error);
      }
    };
  }, [roomData, furnitureItems]);

  const cameraPosition = useMemo(() => {
    const width = roomData?.width || 10;
    const length = roomData?.length || 10;
    const height = roomData?.height || 10;
    const centerX = width / 2;
    const centerZ = length / 2;
    const maxDim = Math.max(width, length, height);
    console.log('Camera positioned at:', is2DView ? [centerX, maxDim * 1.5, centerZ] : [centerX + maxDim, maxDim, centerZ + maxDim]);
    return is2DView ? [centerX, maxDim * 1.5, centerZ] : [centerX + maxDim, maxDim, centerZ + maxDim];
  }, [roomData, is2DView]);

  const planePosition = useMemo(() => {
    const width = roomData?.width || 10;
    const length = roomData?.length || 10;
    const x = width / 2;
    const z = length / 2;
    console.log('Plane positioned at:', [x, 0, z], 'with geometry:', [width, length]);
    return [x, 0, z];
  }, [roomData]);

  if (!roomData) return <div className="flex items-center justify-center h-screen text-gray-600">Loading room data...</div>;

  return (
    <div className="w-full h-screen relative">
      <Canvas
        shadows
        camera={{ position: cameraPosition, fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true }}
      >
        {is2DView && (
          <OrthographicCamera
            makeDefault
            zoom={50}
            position={[roomData.width / 2, roomData.height * 1.5, roomData.length / 2]}
            up={[0, 0, -1]}
          />
        )}

        <mesh position={[roomData.width / 2, roomData.height / 2, roomData.length / 2]}>
          <boxGeometry args={[roomData.width, roomData.height, roomData.length]} />
          <meshBasicMaterial
            color={roomData.wallColor || globalColor}
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>

        <mesh
          ref={planeRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={planePosition}
          onClick={(e) => {
            if (selectedFurniture) {
              console.log('Plane clicked with selected furniture:', selectedFurniture);
              placeFurniture(e.point, selectedFurniture);
            }
          }}
          receiveShadow
        >
          <planeGeometry args={[roomData.width || 10, roomData.length || 10]} />
          <meshStandardMaterial color="#f0f0f0" transparent opacity={0.1} />
        </mesh>

        {furnitureItems.map((item) => (
          <FurnitureItem
            key={item.id}
            item={item}
            isSelected={selectedFurniture?.id === item.id}
            onSelect={(selectedItem) => {
              console.log('Setting selected furniture:', selectedItem);
              setSelectedFurniture(selectedItem);
            }}
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

        <OrbitControls
          makeDefault
          enabled={!selectedFurniture?.ref}
          enableRotate={!is2DView}
          enableZoom={true}
          enablePan={true}
          minDistance={1}
          maxDistance={50}
          target={[roomData.width / 2, 0, roomData.length / 2]}
        />
        <Grid
          cellSize={0.5}
          cellThickness={0.5}
          sectionColor="#cccccc"
          cellColor="#e0e0e0"
          infiniteGrid={false}
          sectionSize={1}
        />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[roomData.width / 2, roomData.height * 2, roomData.length / 2]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0001}
        />

        <Html wrapperClass="canvas-ui">
          <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-md space-y-3 min-w-[250px] z-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">Tools</h3>
              <button
                onClick={saveDesign}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                Save
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">View Mode</label>
              <button
                onClick={() => setIs2DView(!is2DView)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {is2DView ? 'Switch to 3D' : 'Switch to 2D'}
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Transform Mode</label>
              <select
                value={transformMode}
                onChange={(e) => setTransformMode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="translate">Move (W)</option>
                <option value="rotate">Rotate (E)</option>
                <option value="scale">Scale (R)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Global Color</label>
              <input
                type="color"
                value={globalColor}
                onChange={(e) => updateGlobalColor(e.target.value)}
                className="w-full h-8 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Global Shading</label>
              <div className="flex space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={globalShade.roughness}
                  onChange={(e) => updateGlobalShade(parseFloat(e.target.value), globalShade.metalness)}
                  className="w-1/2"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={globalShade.metalness}
                  onChange={(e) => updateGlobalShade(globalShade.roughness, parseFloat(e.target.value))}
                  className="w-1/2"
                />
              </div>
              <div className="text-xs flex justify-between text-gray-600">
                <span>Roughness</span>
                <span>Metalness</span>
              </div>
            </div>
            {selectedFurniture && (
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">Selected Item Color</label>
                <input
                  type="color"
                  value={selectedFurniture.color || globalColor}
                  onChange={(e) => updateSelectedFurniture({ color: e.target.value })}
                  className="w-full h-8 border border-gray-300 rounded-lg"
                />
                <label className="block text-sm text-gray-600">Selected Item Shading</label>
                <div className="flex space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedFurniture.shade?.roughness || globalShade.roughness}
                    onChange={(e) => updateSelectedFurniture({
                      shade: { ...selectedFurniture.shade, roughness: parseFloat(e.target.value) }
                    })}
                    className="w-1/2"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedFurniture.shade?.metalness || globalShade.metalness}
                    onChange={(e) => updateSelectedFurniture({
                      shade: { ...selectedFurniture.shade, metalness: parseFloat(e.target.value) }
                    })}
                    className="w-1/2"
                  />
                </div>
              </div>
            )}
            <button
              onClick={() => {
                console.log('Clearing selected furniture');
                setSelectedFurniture(null);
              }}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Selection
            </button>
          </div>

          <div className="fixed bottom-4 left-4 z-50 w-80">
            <FurnitureLibrary
              selectedItem={selectedFurniture}
              onSelect={(item) => {
                console.log('FurnitureLibrary onSelect:', item);
                setSelectedFurniture(item ? { ...item } : null);
              }}
            />
          </div>
        </Html>
      </Canvas>
    </div>
  );
}