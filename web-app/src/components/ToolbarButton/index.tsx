import React from 'react';
import './ToolbarButton.css';

export default function ToolbarButton({ icon, onClick }: { icon: string, onClick?: any }) {

  return (
    <i className={`toolbar-button ${icon}`} onClick={onClick} />
  );
}