// File: src/components/ui/tabs.tsx

import React, { useState } from 'react';

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div style={{ display: 'flex', cursor: 'pointer' }}>
        {tabs.map((tab, index) => (
          <div
            key={index}
            style={{
              padding: '10px 20px',
              borderBottom: activeIndex === index ? '2px solid blue' : '2px solid transparent',
            }}
            onClick={() => setActiveIndex(index)}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div style={{ padding: '20px', border: '1px solid #ddd' }}>
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
};

export default Tabs;
