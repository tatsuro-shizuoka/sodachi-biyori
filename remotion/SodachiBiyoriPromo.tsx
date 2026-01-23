
import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

// Colors from tailwind.config.ts
const COLORS = {
    cream: '#FFFDF5',
    orange: '#FFB74D',
    orangeLight: '#FFD180',
    orangeDark: '#F57C00',
    green: '#AED581',
    text: '#4A4A4A',
};

const Title: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame - delay, [0, 30], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const translateY = interpolate(frame - delay, [0, 30], [20, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <div
            style={{
                position: 'absolute',
                top: '50%',
                width: '100%',
                textAlign: 'center',
                opacity,
                transform: `translateY(${translateY}px)`,
                fontFamily: '"Zen Maru Gothic", sans-serif',
                fontSize: 80,
                fontWeight: 'bold',
                color: COLORS.text,
                textShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            }}
        >
            {text}
        </div>
    );
};

export const SodachiBiyoriPromo: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Scene timings
    const SCENE_1_START = 0;
    const SCENE_2_START = 120;
    const SCENE_3_START = 240;
    const OUTRO_START = 360;

    // Opacity transitions
    const scene1Opacity = interpolate(frame, [SCENE_1_START, SCENE_1_START + 20, SCENE_2_START - 20, SCENE_2_START], [0, 1, 1, 0]);
    const scene2Opacity = interpolate(frame, [SCENE_2_START, SCENE_2_START + 20, SCENE_3_START - 20, SCENE_3_START], [0, 1, 1, 0]);
    const scene3Opacity = interpolate(frame, [SCENE_3_START, SCENE_3_START + 20, OUTRO_START - 20, OUTRO_START], [0, 1, 1, 0]);
    const outroOpacity = interpolate(frame, [OUTRO_START, OUTRO_START + 20], [0, 1]);

    // Ken burns effects
    const scale1 = interpolate(frame, [SCENE_1_START, SCENE_2_START], [1, 1.1]);
    const scale2 = interpolate(frame, [SCENE_2_START, SCENE_3_START], [1.1, 1]);
    const scale3 = interpolate(frame, [SCENE_3_START, OUTRO_START], [1, 1.1]);

    return (
        <AbsoluteFill style={{ backgroundColor: COLORS.cream }}>
            {/* Scene 1: Intro / Logo */}
            <AbsoluteFill style={{ opacity: scene1Opacity }}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Img
                        src="/logo_sodachi.png"
                        style={{
                            width: 400,
                            transform: `scale(${scale1})`,
                        }}
                    />
                    <Title text="そだちびより" delay={30} />
                </AbsoluteFill>
            </AbsoluteFill>

            {/* Scene 2: Playground Image */}
            <AbsoluteFill style={{ opacity: scene2Opacity }}>
                <AbsoluteFill>
                    <Img
                        src="/img_playground.png"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: `scale(${scale2})`,
                        }}
                    />
                    <AbsoluteFill style={{ backgroundColor: 'rgba(255, 253, 245, 0.7)' }} />
                </AbsoluteFill>
                <Title text="子どもたちの未来を育む" delay={SCENE_2_START + 10} />
            </AbsoluteFill>

            {/* Scene 3: Classroom Image */}
            <AbsoluteFill style={{ opacity: scene3Opacity }}>
                <AbsoluteFill>
                    <Img
                        src="/img_classroom.png"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: `scale(${scale3})`,
                        }}
                    />
                    <AbsoluteFill style={{ backgroundColor: 'rgba(255, 253, 245, 0.7)' }} />
                </AbsoluteFill>
                <Title text="地域で見守る、新しいかたち" delay={SCENE_3_START + 10} />
            </AbsoluteFill>

            {/* Outro: Call to Action */}
            <AbsoluteFill style={{ opacity: outroOpacity, backgroundColor: COLORS.orangeLight }}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{
                        fontSize: 60,
                        color: '#fff',
                        fontFamily: '"Zen Maru Gothic", sans-serif',
                        fontWeight: 'bold',
                        marginBottom: 40
                    }}>
                        スポンサー募集中
                    </div>
                    <Img
                        src="/logo_sodachi.png"
                        style={{
                            width: 300,
                        }}
                    />
                </AbsoluteFill>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
