import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from '../utils/auth';

export default function RoomInput() {
  const navigate = useNavigate();
  const { userType } = getAuth();
  const [roomData, setRoomData] = useState({
    name: '',
    width: '',
    length: '',
    height: '2.5',
    shape: 'rectangular',
    wallColor: '#ffffff'
  });
  const [errors, setErrors] = useState({});

  // Load saved draft for admins
  useEffect(() => {
    if (userType === 'admin') {
      const draft = localStorage.getItem('roomDraft');
      if (draft) setRoomData(JSON.parse(draft));
    }
  }, [userType]);

  // Auto-save draft for admins
  useEffect(() => {
    if (userType === 'admin') {
      localStorage.setItem('roomDraft', JSON.stringify(roomData));
    }
  }, [roomData, userType]);

  const validateField = (name, value) => {
    let error = '';
    if (!value) error = 'This field is required';
    else if (isNaN(value) || parseFloat(value) <= 0) error = 'Must be > 0';
    return error;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {
      name: validateField('name', roomData.name),
      width: validateField('width', roomData.width),
      length: validateField('length', roomData.length),
    };

    setErrors(newErrors);
    
    if (!Object.values(newErrors).some(Boolean)) {
      localStorage.setItem('currentDesign', JSON.stringify({
        ...roomData,
        timestamp: new Date().toISOString()
      }));
      navigate('/canvas');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {userType === 'admin' ? 'Client Room Setup' : 'My Room Setup'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Room Name */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Room Name
          </label>
          <input
            type="text"
            value={roomData.name}
            onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
            className={`w-full p-3 border rounded-lg ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500`}
            placeholder="Living Room, Office..."
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Shape Selection */}
        <div>
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Select Room Shape
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {['rectangular', 'square', 'l-shaped'].map((shape) => (
              <div
                key={shape}
                onClick={() => setRoomData({ ...roomData, shape })}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  roomData.shape === shape
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-2" />
                <span className="capitalize text-gray-700 block text-center">
                  {shape.replace('-', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Room Dimensions (meters)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['width', 'length', 'height'].map((dimension) => (
              <div key={dimension}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {dimension}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={roomData[dimension]}
                    onChange={(e) =>
                      setRoomData({ ...roomData, [dimension]: e.target.value })
                    }
                    className={`w-full p-2 border rounded-lg ${
                      errors[dimension] ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">
                    m
                  </span>
                  {errors[dimension] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[dimension]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wall Color */}
        <div>
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Choose Wall Color
          </h2>
          <div className="flex items-center space-x-4">
            <input
              type="color"
              value={roomData.wallColor}
              onChange={(e) =>
                setRoomData({ ...roomData, wallColor: e.target.value })
              }
              className="w-16 h-16 rounded-lg cursor-pointer border border-gray-300"
            />
            <div className="flex flex-col">
              <span className="text-gray-700">
                Selected: {roomData.wallColor.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                Click to choose different color
              </span>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          {userType === 'admin' && (
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('roomDraft');
                setRoomData({
                  name: '',
                  width: '',
                  length: '',
                  height: '2.5',
                  shape: 'rectangular',
                  wallColor: '#ffffff'
                });
              }}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Draft
            </button>
          )}
          <button
            type="submit"
            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue to Design →
          </button>
        </div>
      </form>
    </div>
  );
}