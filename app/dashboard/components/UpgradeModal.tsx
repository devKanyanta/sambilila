'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Crown, Sparkles, Smartphone, Globe, Loader2, ArrowRight, AlertCircle } from 'lucide-react'
import { useSubscription, PlanInfo } from '@/app/hooks/useSubscription'

interface UpgradeModalProps {
  show: boolean
  onClose: () => void
  initialPlanSlug?: string
}

export default function UpgradeModal({ show, onClose, initialPlanSlug }: UpgradeModalProps) {
  const { plans, subscription, isLoading, upgrade, verifyPayment, refresh } = useSubscription()
  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlanSlug || 'weekly')
  const [paymentMethod, setPaymentMethod] = useState<'PAYPAL' | 'LENCO' | null>(null)
  const [phone, setPhone] = useState('')
  const [operator, setOperator] = useState('')
  const [step, setStep] = useState<'select-plan' | 'payment' | 'processing' | 'verifying' | 'success'>('select-plan')
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [paymentReference, setPaymentReference] = useState<string | null>(null)
  const [pollAttempts, setPollAttempts] = useState(0)
  const [networkError, setNetworkError] = useState(false)
  const verificationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentPlanSlug = subscription?.plan?.slug || 'free'

  // Poll payment status for Lenco
  useEffect(() => {
    if (step !== 'verifying' || !paymentReference) return

    let attempts = 0
    const maxAttempts = 90 // 3-5 minutes at 2-3s intervals
    let consecutiveNetworkErrors = 0
    const maxNetworkErrors = 5

    const pollPaymentStatus = async () => {
      if (attempts >= maxAttempts) {
        setProcessingError('Payment verification timed out. Your payment may still be processing. Check your subscription status or contact support.')
        setStep('payment')
        return
      }

      attempts++
      setPollAttempts(attempts)

      try {
        const result = await verifyPayment(paymentReference)
        setNetworkError(false)
        consecutiveNetworkErrors = 0

        // Check if subscription is now active
        if (result.subscriptionStatus === 'activated' || result.paymentStatus === 'completed') {
          await refresh()
          setStep('success')
          if (verificationIntervalRef.current) {
            clearInterval(verificationIntervalRef.current)
          }
        } else if (result.paymentStatus === 'failed') {
          setProcessingError('Payment failed. Please try again or contact support.')
          setStep('payment')
          if (verificationIntervalRef.current) {
            clearInterval(verificationIntervalRef.current)
          }
        }
        // If status is 'pending', keep polling
      } catch (err: any) {
        console.warn('Verification poll error:', err.message)
        consecutiveNetworkErrors++
        if (consecutiveNetworkErrors >= maxNetworkErrors) {
          setNetworkError(true)
        }
        // Continue polling on error
      }
    }

    // Poll every 2.5 seconds
    verificationIntervalRef.current = setInterval(pollPaymentStatus, 2500)

    // Initial poll attempt
    pollPaymentStatus()

    return () => {
      if (verificationIntervalRef.current) {
        clearInterval(verificationIntervalRef.current)
      }
    }
  }, [step, paymentReference, verifyPayment, refresh])

  const handlePlanSelect = (slug: string) => {
    if (slug === currentPlanSlug) return
    setSelectedPlan(slug)
    setStep('payment')
    setPaymentMethod(null)
    setProcessingError(null)
  }

  const handlePayment = async () => {
    if (!paymentMethod) return
    setStep('processing')
    setProcessingError(null)

    try {
      const result = await upgrade(
        selectedPlan,
        paymentMethod,
        paymentMethod === 'LENCO' ? phone : undefined,
        paymentMethod === 'LENCO' ? operator : undefined
      )

      if (result.approvalUrl) {
        // Redirect to PayPal approval
        window.location.href = result.approvalUrl
      } else if (result.reference && paymentMethod === 'LENCO') {
        // Lenco payment initiated - start verification polling
        setPaymentReference(result.reference)
        setStep('verifying')
      } else {
        setStep('success')
      }
    } catch (err: any) {
      setProcessingError(err.message)
      setStep('payment')
    }
  }

  const handleBack = () => {
    if (verificationIntervalRef.current) {
      clearInterval(verificationIntervalRef.current)
    }

    if (step === 'verifying') {
      setStep('payment')
      setPaymentReference(null)
      setPollAttempts(0)
      setNetworkError(false)
      setProcessingError(null)
    } else if (step === 'payment') {
      setStep('select-plan')
      setPaymentMethod(null)
      setProcessingError(null)
    } else {
      onClose()
    }
  }

  if (!show) return null

  const selectedPlanData = plans.find(p => p.slug === selectedPlan)
  const isCurrentPlan = (slug: string) => slug === currentPlanSlug

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-neutral-100">
            <button onClick={handleBack} className="text-sm text-neutral-500 hover:text-neutral-700">
              {step === 'select-plan' ? (
                <span className="sr-only">Close</span>
              ) : (
                '← Back'
              )}
            </button>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-primary-500" />
              <h2 className="text-base font-heading font-semibold text-neutral-900">Upgrade</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          </div>

          {/* Step: Select Plan */}
          {step === 'select-plan' && (
            <div className="p-5 space-y-4">
              <p className="text-sm text-neutral-500">Choose a plan that works for you</p>
              {plans.filter(p => p.slug !== 'free').map((plan) => (
                <motion.button
                  key={plan.slug}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handlePlanSelect(plan.slug)}
                  disabled={isCurrentPlan(plan.slug)}
                  className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                    selectedPlan === plan.slug
                      ? 'border-primary-500 bg-primary-50/30'
                      : isCurrentPlan(plan.slug)
                      ? 'border-neutral-200 bg-neutral-50 opacity-60'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-semibold text-neutral-900">{plan.name}</h3>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xl font-bold text-neutral-900">${plan.priceUSD}</span>
                      <span className="text-xs text-neutral-400">/{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {plan.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-neutral-600">
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrentPlan(plan.slug) && (
                    <span className="mt-2 inline-block text-xs font-medium text-neutral-400">Current plan</span>
                  )}
                </motion.button>
              ))}
            </div>
          )}

          {/* Step: Payment Method */}
          {step === 'payment' && selectedPlanData && (
            <div className="p-5 space-y-4">
              <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-900">{selectedPlanData.name} Plan</span>
                  <span className="text-sm font-semibold text-primary-600">
                    ${selectedPlanData.priceUSD}/{selectedPlanData.period}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Sparkles className="w-3 h-3" />
                  <span>Cancel anytime · Instant access</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-700">Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('PAYPAL')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      paymentMethod === 'PAYPAL'
                        ? 'border-primary-500 bg-primary-50/30'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <Globe className="w-6 h-6 mx-auto mb-1.5 text-[#0070ba]" />
                    <span className="text-xs font-medium text-neutral-700">PayPal</span>
                    <span className="block text-[10px] text-neutral-400">Auto-renew</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('LENCO')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      paymentMethod === 'LENCO'
                        ? 'border-primary-500 bg-primary-50/30'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <Smartphone className="w-6 h-6 mx-auto mb-1.5 text-green-600" />
                    <span className="text-xs font-medium text-neutral-700">Mobile Money</span>
                    <span className="block text-[10px] text-neutral-400">Manual payment</span>
                  </button>
                </div>
              </div>

              {/* Lenco form */}
              {paymentMethod === 'LENCO' && (
                <div className="space-y-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 26097XXXXXXX"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">Include country code (e.g., 260 for Zambia)</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Mobile Operator</label>
                    <select
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">Select operator</option>
                      <option value="MTN">MTN</option>
                      <option value="Airtel">Airtel</option>
                      <option value="Vodafone">Vodafone</option>
                    </select>
                  </div>
                </div>
              )}

              {processingError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <p className="text-xs text-red-600">{processingError}</p>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={!paymentMethod || (paymentMethod === 'LENCO' && (!phone || !operator))}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paymentMethod === 'PAYPAL' ? (
                  <>Continue with PayPal <ArrowRight className="w-4 h-4" /></>
                ) : (
                  <>Pay with Mobile Money <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              {paymentMethod === 'PAYPAL' && (
                <p className="text-[10px] text-neutral-400 text-center">
                  You will be redirected to PayPal to approve the subscription
                </p>
              )}
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="p-10 text-center">
              <Loader2 className="w-10 h-10 mx-auto mb-4 text-primary-500 animate-spin" />
              <p className="text-sm font-medium text-neutral-900">Processing your payment...</p>
              <p className="text-xs text-neutral-500 mt-1">Please wait a moment</p>
            </div>
          )}

          {/* Step: Verifying */}
          {step === 'verifying' && (
            <div className="p-8 text-center">
              {/* Animated phone icon */}
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
                  className="absolute inset-0 w-16 h-16 rounded-2xl border-2 border-primary-300"
                />
              </motion.div>

              <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-2">
                {networkError ? 'Connection Lost' : 'Waiting for Payment'}
              </h3>
              <p className="text-sm text-neutral-500 mb-1">
                {networkError
                  ? 'We are having trouble reaching the payment service. Please check your internet connection.'
                  : 'Please check your phone and complete the mobile money transaction.'}
              </p>
              <p className="text-xs text-neutral-400 mb-6">
                Polling payment status{' '}
                <span className="font-medium text-primary-500">
                  {networkError ? '...' : `(attempt ${pollAttempts})`}
                </span>
              </p>

              {/* Network error retry */}
              {networkError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-amber-800 mb-1">Connection issue detected</p>
                      <p className="text-xs text-amber-700">
                        We are automatically retrying. Your payment request has been submitted —
                        no action needed on your end.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Manual actions */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    if (verificationIntervalRef.current) {
                      clearInterval(verificationIntervalRef.current)
                    }
                    setStep('payment')
                    setPaymentReference(null)
                    setPollAttempts(0)
                    setNetworkError(false)
                    setProcessingError(null)
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-500 hover:text-neutral-700 transition-all"
                >
                  Minimise
                </button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="p-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-6 h-6 text-green-600" />
              </motion.div>
              <h3 className="text-lg font-heading font-semibold text-neutral-900 mb-1">
                Subscription Activated!
              </h3>
              <p className="text-sm text-neutral-500 mb-6">
                Your payment was successful and your subscription is now active. Enjoy premium features!
              </p>
              <button
                onClick={() => {
                  if (verificationIntervalRef.current) {
                    clearInterval(verificationIntervalRef.current)
                  }
                  onClose()
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-all active:scale-95"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
