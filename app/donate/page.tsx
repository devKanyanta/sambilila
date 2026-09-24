// app/donate/page.tsx — Public donation page (works for guests and accounts alike)
'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart, Globe, Smartphone, Loader2, Check, ArrowLeft, X,
  AlertCircle, ShieldCheck,
} from 'lucide-react'
import { useDonations } from '@/app/hooks/useDonations'
import { useSession } from '@/app/hooks/useSession'

const PRESETS = [2, 5, 10, 20]
const MIN = 1
const MAX = 1000

type Step = 'amount' | 'method' | 'processing' | 'verifying' | 'success'

function normalizeMobileNumber(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('260')) return digits
  if (digits.startsWith('0') && digits.length >= 10) return `260${digits.slice(1)}`
  return digits
}

function detectMobileOperator(value: string) {
  const normalizedPhone = normalizeMobileNumber(value)
  if (/^260(76|96)/.test(normalizedPhone)) return 'MTN'
  if (/^260(77|97)/.test(normalizedPhone)) return 'Airtel'
  return ''
}

export default function DonatePage() {
  return (
    <Suspense fallback={<DonateFallback />}>
      <DonateContent />
    </Suspense>
  )
}

function DonateFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  )
}

function DonateContent() {
  const { create, verifyLenco, capturePayPal, isLoading, error, clearError } = useDonations()
  const { isBootstrapping } = useSession()
  const searchParams = useSearchParams()

  // Handle return from PayPal approval
  useEffect(() => {
    if (searchParams.get('paypal_return')) {
      const orderId = searchParams.get('token') // PayPal puts the order id in ?token=
      if (orderId) {
        capturePayPal(orderId).then((ok) => {
          setStep(ok ? 'success' : 'method')
          if (!ok) setProcessingError('We could not confirm your PayPal payment. If you were charged, contact support.')
        })
      }
    } else if (searchParams.get('paypal_cancel')) {
      setProcessingError('PayPal payment was cancelled — no charge was made.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [step, setStep] = useState<Step>('amount')
  const [amount, setAmount] = useState<number>(5)
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [provider, setProvider] = useState<'PAYPAL' | 'LENCO' | null>(null)
  const [phone, setPhone] = useState('')
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)
  const [pollAttempts, setPollAttempts] = useState(0)
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const operator = detectMobileOperator(phone)
  const effectiveAmount = customAmount ? Number(customAmount) : amount
  const isAmountValid =
    Number.isFinite(effectiveAmount) && effectiveAmount >= MIN && effectiveAmount <= MAX

  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current)
    }
  }, [])

  const stopPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current)
      pollInterval.current = null
    }
  }

  const startPolling = (ref: string) => {
    stopPolling()
    let attempts = 0
    pollInterval.current = setInterval(async () => {
      attempts++
      setPollAttempts(attempts)
      const status = await verifyLenco(ref)
      if (status === 'COMPLETED') {
        stopPolling()
        setStep('success')
      } else if (status === 'FAILED') {
        stopPolling()
        setProcessingError('The payment failed or was cancelled. Please try again.')
        setStep('method')
      }
    }, 2500)
  }

  const handleDonate = async () => {
    if (!provider || !isAmountValid) return
    setStep('processing')
    setProcessingError(null)
    clearError()

    try {
      const result = await create({
        amountUSD: effectiveAmount,
        provider,
        message: message.trim() || undefined,
        isAnonymous,
        phone: provider === 'LENCO' ? normalizeMobileNumber(phone) : undefined,
        operator: provider === 'LENCO' ? operator : undefined,
        country: provider === 'LENCO' ? 'ZM' : undefined,
      })

      if (!result) {
        setStep('method')
        setProcessingError(error || 'Something went wrong. Please try again.')
        return
      }

      if (result.approvalUrl) {
        // PayPal: remember order for capture on return
        sessionStorage.setItem('pendingDonationAmount', String(effectiveAmount))
        window.location.href = result.approvalUrl
      } else if (result.reference) {
        setReference(result.reference)
        setStep('verifying')
        startPolling(result.reference)
      } else {
        setStep('success')
      }
    } catch (err) {
      setProcessingError(err instanceof Error ? err.message : 'Donation failed')
      setStep('method')
    }
  }

  const handleBack = () => {
    stopPolling()
    if (step === 'verifying') {
      setStep('method')
      setReference(null)
      setPollAttempts(0)
    } else if (step === 'method') {
      setStep('amount')
      setProvider(null)
      setProcessingError(null)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="px-4 sm:px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 relative">
                <Image src="/logo.png" alt="Lernopia" fill className="object-contain" priority />
              </div>
              <span className="font-fredoka font-semibold text-xl text-neutral-900">Lernopia</span>
            </Link>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-md"
          >
            <AnimatePresence mode="wait">
              {/* Step: amount */}
              {step === 'amount' && (
                <motion.div
                  key="amount"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-6 h-6 text-primary-500" />
                    </div>
                    <h1 className="text-2xl font-fredoka font-bold text-neutral-900">
                      Support Lernopia
                    </h1>
                    <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
                      Your one-time donation keeps Lernopia free for students everywhere.
                      No subscriptions — give only if you can.
                    </p>
                  </div>

                  {/* Presets */}
                  <div className="grid grid-cols-4 gap-2.5 mb-4">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setAmount(preset)
                          setCustomAmount('')
                        }}
                        className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                          !customAmount && amount === preset
                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                        }`}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>

                  {/* Custom amount */}
                  <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold">
                      $
                    </span>
                    <input
                      type="number"
                      min={MIN}
                      max={MAX}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Custom amount"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all"
                    />
                  </div>

                  {/* Message */}
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                    rows={2}
                    placeholder="Leave a message of support (optional)"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all mb-4"
                  />

                  {/* Anonymous */}
                  <label className="flex items-center gap-2.5 mb-6 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-100"
                    />
                    <span className="text-sm text-neutral-500">Give anonymously</span>
                  </label>

                  <button
                    onClick={() => setStep('method')}
                    disabled={!isAmountValid}
                    className="btn-primary w-full py-3.5 text-sm rounded-xl"
                  >
                    Continue
                  </button>

                  <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-neutral-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    One-time payment — never recurring
                  </div>
                </motion.div>
              )}

              {/* Step: method */}
              {step === 'method' && (
                <motion.div
                  key="method"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-fredoka font-semibold text-neutral-900">
                      Choose payment method
                    </h2>
                    <button onClick={handleBack} className="text-sm text-neutral-400 hover:text-neutral-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-5 flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Your donation</span>
                    <span className="text-lg font-bold text-primary-600">
                      ${effectiveAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <button
                      onClick={() => setProvider('PAYPAL')}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        provider === 'PAYPAL'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <Globe className="w-6 h-6 mx-auto mb-1.5 text-[#0070ba]" />
                      <span className="block text-xs font-semibold text-neutral-800">PayPal</span>
                      <span className="block text-[10px] text-neutral-400 mt-0.5">Card or PayPal</span>
                    </button>
                    <button
                      onClick={() => setProvider('LENCO')}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        provider === 'LENCO'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <Smartphone className="w-6 h-6 mx-auto mb-1.5 text-success-600" />
                      <span className="block text-xs font-semibold text-neutral-800">Mobile Money</span>
                      <span className="block text-[10px] text-neutral-400 mt-0.5">MTN / Airtel</span>
                    </button>
                  </div>

                  {/* Phone input for Lenco */}
                  {provider === 'LENCO' && (
                    <div className="space-y-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200 mb-5">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          Phone number
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 097XXXXXXX or 26097XXXXXXX"
                          className="w-full px-3 py-2.5 text-sm rounded-lg border border-neutral-200 bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                          Operator
                        </label>
                        <input
                          type="text"
                          value={operator}
                          disabled
                          placeholder="Enter a supported number"
                          className="w-full px-3 py-2.5 text-sm rounded-lg border border-neutral-200 bg-white outline-none"
                        />
                        {phone && !operator && (
                          <p className="text-[10px] text-warning-600 mt-1.5">
                            Supported Zambian prefixes: MTN 096/076, Airtel 097/077
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {(processingError || error) && (
                    <div className="p-3 rounded-xl bg-error-50 border border-error-100 mb-5 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-error-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-error-600">{processingError || error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleDonate}
                    disabled={!provider || (provider === 'LENCO' && (!phone || !operator)) || isLoading || isBootstrapping}
                    className="btn-primary w-full py-3.5 text-sm rounded-xl"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : provider === 'PAYPAL' ? (
                      'Continue with PayPal'
                    ) : provider === 'LENCO' ? (
                      'Pay with Mobile Money'
                    ) : (
                      'Select a payment method'
                    )}
                  </button>

                  <p className="text-[10px] text-neutral-400 text-center mt-3">
                    {provider === 'PAYPAL'
                      ? "You'll be redirected to PayPal to approve the payment"
                      : 'You will receive a prompt on your phone to approve the payment'}
                  </p>
                </motion.div>
              )}

              {/* Step: processing */}
              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center"
                >
                  <Loader2 className="w-10 h-10 mx-auto mb-4 text-primary-500 animate-spin" />
                  <p className="text-sm font-semibold text-neutral-900">Starting your donation...</p>
                  <p className="text-xs text-neutral-500 mt-1">This only takes a moment</p>
                </motion.div>
              )}

              {/* Step: verifying */}
              {step === 'verifying' && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="relative w-16 h-16 mx-auto mb-5"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
                      <Smartphone className="w-7 h-7 text-primary-500" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-2xl border-2 border-primary-300"
                    />
                  </motion.div>

                  <h3 className="text-lg font-fredoka font-semibold text-neutral-900 mb-2">
                    Waiting for approval
                  </h3>
                  <p className="text-sm text-neutral-500 mb-1">
                    Check your phone and approve the payment prompt.
                  </p>
                  <p className="text-xs text-neutral-400 mb-6">
                    Checking status <span className="text-primary-500">({pollAttempts})</span>
                  </p>

                  <button
                    onClick={handleBack}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-all"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}

              {/* Step: success */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-14 h-14 rounded-full bg-success-50 border border-success-100 flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-6 h-6 text-success-600" />
                  </motion.div>
                  <h3 className="text-xl font-fredoka font-bold text-neutral-900 mb-2">
                    Thank you!
                  </h3>
                  <p className="text-sm text-neutral-500 mb-8 max-w-xs mx-auto leading-relaxed">
                    Your donation keeps Lernopia free for students everywhere.
                    We&apos;re deeply grateful for your support.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link href="/dashboard" className="btn-primary py-3 text-sm rounded-xl px-6">
                      Start studying
                    </Link>
                    <Link
                      href="/"
                      className="py-3 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
                    >
                      Back to home
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <p className="text-center text-xs text-neutral-400 mt-6">
            Questions? <Link href="/contact" className="text-primary-500 hover:text-primary-600">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
