export default function FurnitureLibrary({ selectedItem, onSelect }) {
    const FURNITURE_ITEMS = [
      { name: 'Chair', type: 'chair', size: [0.5, 1, 0.5], color: '#654321' },
      { name: 'Table', type: 'table', size: [1, 0.8, 1], color: '#c0a080' },
      { name: 'Sofa', type: 'sofa', size: [2, 0.8, 0.8], color: '#ff6666' }
    ];
  
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Furniture Library</h3>
        <div className="grid grid-cols-3 gap-4">
          {FURNITURE_ITEMS.map((item) => (
            <button
              key={item.type}
              onClick={() => onSelect(item.type === selectedItem?.type ? null : item)}
              className={`p-2 border-2 rounded-lg transition-colors ${
                selectedItem?.type === item.type 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div 
                className="w-full h-16 mb-2 rounded-md"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }