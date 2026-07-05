import React, { forwardRef } from 'react';

const HouseIcon = forwardRef(({ className, style, ...props }, ref) => {
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2.5L1 12.5h3v9h16v-9h3L12 2.5zm0 3.2l7.5 6.7V19H4.5v-6.6L12 5.7z" />
    </svg>
  );
});

export default HouseIcon;
