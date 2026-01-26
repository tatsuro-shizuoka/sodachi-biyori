export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-4">ご支援ありがとうございます！</h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    温かいご支援、心より感謝申し上げます。<br />
                    決済が正常に完了しました。
                </p>

                <div className="bg-orange-50 rounded-lg p-4 mb-8">
                    <p className="text-sm text-orange-800 font-medium">
                        アプリに戻って更新すると、<br />サポーターバッジが有効になります。
                    </p>
                </div>

                <p className="text-sm text-gray-500">
                    このウィンドウを閉じて、アプリにお戻りください。
                </p>
            </div>
        </div>
    );
}
