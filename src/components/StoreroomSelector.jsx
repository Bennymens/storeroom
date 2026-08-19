import React from 'react';
import { Layers, Warehouse } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const StoreroomSelector = () => {
  const { storerooms, activeStoreroomId, setActiveStoreroomId, items } = useInventory();

  const getCount = (id) => {
    if (id === 'all') return items.length;
    return items.filter(item => item.storeroomId === id).length;
  };

  return (
    <div className="storeroom-bar no-print">
      <button
        className={`storeroom-pill ${activeStoreroomId === 'all' ? 'active' : ''}`}
        onClick={() => setActiveStoreroomId('all')}
      >
        <Layers size={16} />
        <span>All Storerooms</span>
        <span className="pill-count">{getCount('all')}</span>
      </button>

      <button
        className={`storeroom-pill pill-aud ${activeStoreroomId === 'aud' ? 'active' : ''}`}
        onClick={() => setActiveStoreroomId('aud')}
      >
        <Warehouse size={16} />
        <span>Aud Storeroom</span>
        <span className="pill-count">{getCount('aud')}</span>
      </button>

      <button
        className={`storeroom-pill pill-md ${activeStoreroomId === 'md' ? 'active' : ''}`}
        onClick={() => setActiveStoreroomId('md')}
      >
        <Warehouse size={16} />
        <span>MD Storeroom</span>
        <span className="pill-count">{getCount('md')}</span>
      </button>

      <button
        className={`storeroom-pill pill-poimen ${activeStoreroomId === 'poimen' ? 'active' : ''}`}
        onClick={() => setActiveStoreroomId('poimen')}
      >
        <Warehouse size={16} />
        <span>Poimen Storeroom</span>
        <span className="pill-count">{getCount('poimen')}</span>
      </button>
    </div>
  );
};
