import React from 'react';

interface IconProps {
    className?: string;
}

export const OilCanIcon = ({ className }: IconProps) => (
    <img
        src="/icons/oil-can.png"
        alt="Aceite"
        className={className}
        style={{ objectFit: 'contain' }}
    />
);
