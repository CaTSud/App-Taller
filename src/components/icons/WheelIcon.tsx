import React from 'react';

interface IconProps {
    className?: string;
}

export const WheelIcon = ({ className }: IconProps) => (
    <img
        src="/icons/wheel.png"
        alt="Neumáticos"
        className={className}
        style={{
            objectFit: 'contain',
            filter: 'invert(1) brightness(1.5)'
        }}
    />
);
