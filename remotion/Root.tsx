
import React from 'react';
import { Composition } from 'remotion';
import { SodachiBiyoriPromo } from './SodachiBiyoriPromo';
import './style.css';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="SodachiBiyoriPromo"
                component={SodachiBiyoriPromo}
                durationInFrames={450}
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
