import React from 'react';
import HouseIcon from '../../components/interactive/HouseIcon';

const GRID_CELL = 48;

const pixels = [
  { col: 2, row: 2, color: 'var(--color-accent-blue)' },
  { col: 4, row: 7, color: '#e63946' },
  { col: 11, row: 3, color: '#ff6b35' },
  { col: 17, row: 1, color: '#7b2cbf' },
  { col: 20, row: 4, color: 'var(--color-accent-yellow)' },
  { col: 23, row: 6, color: '#2a9d8f' },
];

export default function GridBrandSection() {
  return (
    <section className="grid-brand-section relative w-full min-h-[320px] md:min-h-[420px] overflow-hidden border-t border-black/10">
      <div className="absolute inset-0 grid-brand-bg pointer-events-none" aria-hidden="true" />

      {pixels.map((pixel, i) => (
        <div
          key={i}
          className="grid-pixel absolute"
          style={{
            left: pixel.col * GRID_CELL,
            top: pixel.row * GRID_CELL,
            width: GRID_CELL,
            height: GRID_CELL,
            backgroundColor: pixel.color,
          }}
        />
      ))}

      <div className="relative z-10 flex items-end px-4 md:px-8 lg:px-12 py-16 md:py-24 lg:py-28 min-h-[320px] md:min-h-[420px]">
        <h2
          className="font-display font-bold lowercase leading-none tracking-tight text-black select-none flex items-end gap-0"
          aria-label="node"
        >
          <span className="text-[clamp(64px,14vw,240px)]">node</span>
          <HouseIcon className="w-[clamp(28px,3.2vw,56px)] h-[clamp(28px,3.2vw,56px)] mb-[clamp(6px,1vw,14px)] shrink-0" />
        </h2>
      </div>
    </section>
  );
}
