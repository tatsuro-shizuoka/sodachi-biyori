'use client'

import { useState } from 'react'
import { Heart, Sparkles, Gift, CheckCircle, Loader2, ExternalLink } from 'lucide-react'

export default function SupportPage() {
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
    const [customAmount, setCustomAmount] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const amounts = [500, 1000, 3000, 5000, 10000]

    const handlePayPay = async () => {
        const amount = selectedAmount === -1 ? parseInt(customAmount) : selectedAmount

        if (!amount || amount < 100) {
            setError('100円以上の金額を選択してください')
            return
        }

        setIsProcessing(true)
        setError(null)

        try {
            const res = await fetch('/api/payments/paypay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            })

            const data = await res.json()

            if (data.configured === false) {
                setError('PayPay決済は現在準備中です。もうしばらくお待ちください。')
                return
            }

            if (data.deepLinkUrl) {
                // On mobile, try to open PayPay app
                window.location.href = data.deepLinkUrl
            } else if (data.qrCodeUrl) {
                // On desktop, show QR code URL
                setPaymentUrl(data.qrCodeUrl)
            } else {
                setError('決済の開始に失敗しました')
            }
        } catch (err) {
            setError('決済の開始に失敗しました')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 mb-6 shadow-xl">
                    <Heart className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
                    そだちびよりを応援する
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
                    「見逃した成長を手のひらに」
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    お子様の大切な成長の瞬間を保護者の皆様にお届けするため、
                    そだちびよりは多くの機能を無料で提供しています。
                </p>
            </div>

            {/* Mission Section */}
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-3xl p-6 mb-8 border border-orange-100 dark:border-orange-800">
                <h2 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    私たちのミッション
                </h2>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <p>
                        保育園・幼稚園での日常は、お子様にとってかけがえのない成長の時間です。
                        しかし、お仕事で忙しい保護者の方々は、その瞬間を見逃してしまうことも。
                    </p>
                    <p>
                        そだちびよりは、園が撮影した動画を保護者に届け、
                        <span className="font-bold text-orange-600">AI技術を活用してお子様の登場シーンを自動検出</span>
                        することで、「見逃した成長を手のひらに」お届けします。
                    </p>
                </div>
            </div>

            {/* Free Features */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
                <h2 className="font-bold text-slate-800 dark:text-white mb-4">
                    無料でご利用いただける機能
                </h2>
                <div className="grid gap-3">
                    <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300">動画の視聴・お気に入り登録</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300">AI顔認識によるお子様の自動検出（ベータ版）</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300">登場シーンへのチャプタージャンプ（ベータ版）</span>
                    </div>
                </div>
            </div>

            {/* Support Options */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
                <h2 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-pink-500" />
                    応援金で支援する
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    皆様からの応援金は、サービスの維持・改善に活用させていただきます。
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {error}
                    </div>
                )}

                {paymentUrl ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-slate-600 mb-4">
                            以下のリンクからPayPayで決済を完了してください
                        </p>
                        <a
                            href={paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
                        >
                            <img src="/paypay-logo.png" alt="PayPay" className="h-5" onError={(e) => e.currentTarget.style.display = 'none'} />
                            PayPayで支払う
                            <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                            onClick={() => setPaymentUrl(null)}
                            className="block mx-auto mt-4 text-sm text-slate-500 hover:text-slate-700"
                        >
                            金額を変更する
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Amount Selection */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {amounts.map(amount => (
                                <button
                                    key={amount}
                                    onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                                    className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${selectedAmount === amount
                                            ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg scale-105'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    ¥{amount.toLocaleString()}
                                </button>
                            ))}
                            <button
                                onClick={() => setSelectedAmount(-1)}
                                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${selectedAmount === -1
                                        ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg scale-105'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                その他
                            </button>
                        </div>

                        {/* Custom Amount Input */}
                        {selectedAmount === -1 && (
                            <div className="mb-6">
                                <input
                                    type="number"
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    placeholder="金額を入力（100円以上）"
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    min="100"
                                />
                            </div>
                        )}

                        {/* PayPay Button */}
                        <button
                            onClick={handlePayPay}
                            disabled={!selectedAmount || isProcessing}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${selectedAmount && !isProcessing
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    処理中...
                                </>
                            ) : (
                                <>
                                    <img
                                        src="/paypay-logo.png"
                                        alt="PayPay"
                                        className="h-6"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                        }}
                                    />
                                    {selectedAmount && selectedAmount > 0
                                        ? `PayPayで ¥${selectedAmount.toLocaleString()} を支援`
                                        : selectedAmount === -1 && customAmount
                                            ? `PayPayで ¥${parseInt(customAmount).toLocaleString()} を支援`
                                            : '金額を選択してください'}
                                </>
                            )}
                        </button>

                        <p className="text-[10px] text-slate-400 text-center mt-4">
                            PayPayが開きます。決済完了後、自動でこのページに戻ります。
                        </p>
                    </>
                )}
            </div>

            {/* Sponsor Badge */}
            <div className="text-center">
                <p className="text-xs text-slate-400 mb-4">
                    ご支援いただいた方には「サポーター」バッジを付与いたします
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg">
                    <Heart className="h-4 w-4" />
                    サポーター
                </div>
            </div>
        </div>
    )
}
