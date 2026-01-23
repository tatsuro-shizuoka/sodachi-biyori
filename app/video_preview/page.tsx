
'use client';

import { Player } from '@remotion/player';
import { SodachiBiyoriPromo } from '../../remotion/SodachiBiyoriPromo';

export default function VideoPreviewPage() {
    return (
        <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold mb-8 font-zen-maru text-text">プロモーション動画プレビュー</h1>

            <div className="shadow-2xl rounded-xl overflow-hidden bg-black border-4 border-white">
                <Player
                    component={SodachiBiyoriPromo}
                    durationInFrames={450}
                    compositionWidth={1920}
                    compositionHeight={1080}
                    fps={30}
                    style={{
                        width: 960,
                        height: 540,
                    }}
                    controls
                    autoPlay
                    loop
                />
            </div>

            <div className="mt-8 text-neutral-600 font-zen-maru">
                <p>長さ: 15秒 (450フレーム)</p>
                <p>解像度: 1920x1080</p>
            </div>
        </div>
    );
}
