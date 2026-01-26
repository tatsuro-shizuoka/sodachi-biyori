export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-4">決済をキャンセルしました</h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    決済処理は行われませんでした。<br />
                    再度お試しの場合は、アプリからもう一度お手続きください。
                </p>

                <p className="text-sm text-gray-500">
                    このウィンドウを閉じて、アプリにお戻りください。
                </p>
            </div>
        </div>
    );
}
