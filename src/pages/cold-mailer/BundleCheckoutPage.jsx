import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBundleCart } from './BundleCartContext';
import { useWallet } from '../../context/WalletContext';
import { bundlesApi, membershipApi } from '../../lib/api';
import { ArrowRight, ShieldCheck, Tag, Users, Lock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { openCashfreeCheckout, pollOrderStatus } from '../../lib/cashfree';
import PaymentOptions from '../../components/payments/PaymentOptions';
import { ensureCreditsForAction, getCreditsConfirmLabel } from '../../lib/creditPacks';

export default function BundleCheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useBundleCart();
  const { wallet, refreshWallet } = useWallet();
  
  const [paymentMethod, setPaymentMethod] = useState('credits');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [myPlan, setMyPlan] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);

  React.useEffect(() => {
    membershipApi.getMe().then(res => setMyPlan(res)).catch(console.error);
  }, []);

  const totalCredits = cart.reduce((sum, item) => sum + item.creditCost, 0);
  const rawTotalAlaCarte = cart.reduce((sum, item) => sum + item.alaCartePrice, 0);
  const discountPercent = myPlan?.planId?.alaCarteDiscountPercent || 0;
  const totalAlaCarte = (rawTotalAlaCarte * (1 - discountPercent / 100)).toFixed(2);
  
  const canUseCredits = (wallet?.balance || 0) >= totalCredits;

  const handleCheckout = async () => {
    if (paymentMethod === 'credits' && !canUseCredits && !selectedPack) {
      setError('Please select a credit pack to continue.');
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      if (paymentMethod === 'credits') {
        await ensureCreditsForAction({
          balance: wallet?.balance || 0,
          creditCost: totalCredits,
          selectedPack,
          refreshWallet,
        });
      }

      for (const bundle of cart) {
        if (paymentMethod === 'credits') {
          await bundlesApi.purchaseBundle(bundle._id, paymentMethod);
        } else {
          const { orderId, paymentSessionId } = await bundlesApi.purchaseBundle(bundle._id, paymentMethod);
          await openCashfreeCheckout(paymentSessionId);

          const status = await pollOrderStatus((id) => bundlesApi.getOrderStatus(id), orderId);

          if (status !== 'paid') {
            throw new Error('Payment failed or was cancelled for ' + bundle.name);
          }
        }
      }
      await refreshWallet();
      clearCart();
      navigate('/dashboard/emailer/bundles');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center">
        <h2 className="font-display text-4xl font-bold uppercase mb-4">Cart is empty</h2>
        <button onClick={() => navigate('/dashboard/emailer/marketplace')} className="bento-button bg-black text-white">
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-black/40 mb-8">
        <Link to="/dashboard/emailer/marketplace" className="hover:text-black transition-colors">Marketplace</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-black">Checkout</span>
      </div>

      <div className="mb-12">
        <h1 className="font-display text-5xl font-bold uppercase tracking-tight mb-4">Checkout</h1>
        <p className="text-xl text-black/60">Review your bundle selections and complete your purchase.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bento-card p-8 bg-white border border-black/5 shadow-sm">
            <h2 className="font-display text-2xl font-bold uppercase mb-6 flex items-center">
              <Tag className="mr-3 text-[var(--color-accent-yellow)]" />
              Order Summary
            </h2>
            
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item._id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 bg-black/5 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-sm text-black/60 font-medium">{item.contactCount} HR Contacts • {item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{paymentMethod === 'credits' ? `${item.creditCost} cr` : `₹${item.alaCartePrice}`}</div>
                    {paymentMethod === 'credits' && <div className="text-xs text-black/40 font-bold uppercase tracking-wider">₹{item.alaCartePrice} value</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Payment */}
        <div className="space-y-6">
          <div className="bento-card p-8 bg-white border border-black/5 shadow-sm sticky top-24">
            <h2 className="font-display text-2xl font-bold uppercase mb-6">Payment Method</h2>
            
            <div className="space-y-4 mb-8">
              <PaymentOptions
                creditCost={totalCredits}
                cashPrice={totalAlaCarte}
                balance={wallet?.balance || 0}
                method={paymentMethod}
                onMethodChange={setPaymentMethod}
                onSelectedPackChange={setSelectedPack}
                creditsHint={
                  <span className="flex items-center gap-1.5">
                    Deduct from wallet <span className="bg-[var(--color-accent-yellow)] text-yellow-900 text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Recommended</span>
                  </span>
                }
              />

              {!canUseCredits && paymentMethod === 'credits' && myPlan?.planId?.tier === 'free' && (
                <Link
                  to="/dashboard/billing"
                  className="block text-center text-xs px-3 py-2 rounded-lg bg-white border border-[var(--color-accent-blue)] text-[var(--color-accent-blue)] font-bold hover:bg-[var(--color-accent-blue)] hover:text-white transition-colors"
                >
                  UPGRADE TO PRO FOR {discountPercent || 15}% OFF
                </Link>
              )}
            </div>

            <div className="border-t border-black/10 pt-6 mb-8 space-y-2">
              {paymentMethod === 'alacarte' && discountPercent > 0 && (
                <div className="flex justify-between items-center text-green-600 font-bold text-sm tracking-wider uppercase">
                  <span>Pro Discount ({discountPercent}%)</span>
                  <span>-₹{(rawTotalAlaCarte * (discountPercent / 100)).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-end">
                <span className="font-bold text-xl">Total:</span>
                <div className="text-right">
                  {paymentMethod === 'credits' ? (
                    <span className="font-display text-4xl font-bold">{totalCredits} <span className="text-xl">cr</span></span>
                  ) : (
                    <span className="font-display text-4xl font-bold">₹{totalAlaCarte}</span>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">
                {error}
              </div>
            )}

            <button 
              onClick={handleCheckout}
              disabled={
                processing ||
                (paymentMethod === 'credits' && !canUseCredits && !selectedPack)
              }
              className="bento-button w-full justify-between bg-[var(--color-accent-yellow)] text-black hover:bg-[var(--color-accent-yellow)]/90 py-5 text-xl disabled:opacity-50"
            >
              <span className="flex items-center">
                {processing
                  ? 'Processing...'
                  : paymentMethod === 'alacarte'
                    ? 'Complete Purchase'
                    : getCreditsConfirmLabel({
                        hasEnoughCredits: canUseCredits,
                        selectedPack,
                        creditCost: totalCredits,
                      })}
              </span>
              {!processing && <ArrowRight />}
            </button>
            <div className="flex items-center justify-center gap-2 mt-5 text-xs text-black/40 font-bold uppercase tracking-widest">
              <Lock className="w-3.5 h-3.5" /> Secured by Cashfree • Instant Delivery
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
