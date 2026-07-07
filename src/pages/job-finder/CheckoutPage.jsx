import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCart } from './CartContext';
import { jobFinderApi, membershipApi } from '../../lib/api';
import { useToast } from '../../lib/toast';
import { openCashfreeCheckout, pollOrderStatus } from '../../lib/cashfree';
import PaymentOptions from '../../components/payments/PaymentOptions';
import { ensureCreditsForAction, getCreditsConfirmLabel } from '../../lib/creditPacks';

export default function CheckoutPage() {
  const { cart, wallet, clearCart, refreshWallet } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [paymentMethod, setPaymentMethod] = useState('credits');
  const [isProcessing, setIsProcessing] = useState(false);
  const [myPlan, setMyPlan] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);

  React.useEffect(() => {
    membershipApi.getMe().then(res => setMyPlan(res)).catch(console.error);
  }, []);

  const totalCredits = cart.reduce((sum, item) => sum + (item.creditCost || 0), 0);
  const discountPercent = myPlan?.planId?.alaCarteDiscountPercent || 0;
  const rawTotalCash = cart.reduce((sum, item) => sum + (item.alaCartePrice || 0), 0);
  const totalCash = (rawTotalCash * (1 - discountPercent / 100)).toFixed(2);

  const hasEnoughCredits = wallet.balance >= totalCredits;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'credits' && !hasEnoughCredits && !selectedPack) {
      toast.error('Please select a credit pack to continue.');
      return;
    }

    setIsProcessing(true);
    try {
      if (paymentMethod === 'credits') {
        await ensureCreditsForAction({
          balance: wallet.balance,
          creditCost: totalCredits,
          selectedPack,
          refreshWallet,
        });
        await jobFinderApi.checkout(cart, paymentMethod);
      } else {
        const { orderId, paymentSessionId } = await jobFinderApi.checkout(cart, paymentMethod);
        await openCashfreeCheckout(paymentSessionId);

        const status = await pollOrderStatus((id) => jobFinderApi.getOrderStatus(id), orderId);

        if (status !== 'paid') {
          throw new Error('Payment failed or was cancelled.');
        }
      }
      
      await refreshWallet();

      toast.success('Subscription started successfully!');
      if (myPlan?.planId?.tier === 'free') {
        setTimeout(() => {
          toast.info('Upgrade to Pro for monthly bonus credits and a la carte discounts.');
        }, 1500);
      }

      clearCart();
      navigate('/dashboard/job-finder/subscriptions');
    } catch (err) {
      toast.error(err.message || 'Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bento-card p-16 bg-white/50 backdrop-blur-sm text-center max-w-2xl mx-auto flex flex-col items-center">
        <h3 className="font-display text-3xl font-bold uppercase mb-4">Your cart is empty</h3>
        <p className="text-black/50 font-medium mb-8">Add companies from the marketplace to subscribe.</p>
        <Link to="/dashboard/job-finder" className="pill-btn bg-black text-white hover:bg-[var(--color-accent-blue)]">
          BROWSE MARKETPLACE
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Col: Order Summary & Payment Selection */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Items */}
        <div className="bento-card bg-white p-6 md:p-8 border border-black/5">
          <h2 className="font-display text-2xl font-bold uppercase mb-6 border-b border-black/10 pb-4">Order Summary</h2>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-black/5 p-4 rounded-[24px]">
                <div className="flex items-center gap-4">
                  {item.logoUrl ? (
                    <img src={item.logoUrl} alt={item.name} className="h-10 w-10 rounded-full border border-black/10" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-white border border-black/10 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-lg">{item.name}</h4>
                    <p className="text-xs font-bold text-black/50 uppercase tracking-wide">1 Month Subscription</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-xl">{item.creditCost}c</div>
                  <div className="text-xs font-bold text-black/40 uppercase">or ${item.alaCartePrice}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bento-card bg-white p-6 md:p-8 border border-black/5 space-y-6">
          <h2 className="font-display text-2xl font-bold uppercase mb-2 border-b border-black/10 pb-4">Payment Method</h2>

          <PaymentOptions
            creditCost={totalCredits}
            cashPrice={totalCash}
            balance={wallet.balance}
            method={paymentMethod}
            onMethodChange={setPaymentMethod}
            onSelectedPackChange={setSelectedPack}
            creditsHint="Deduct from your wallet balance"
          />

          {paymentMethod === 'credits' && !hasEnoughCredits && myPlan?.planId?.tier === 'free' && (
            <Link
              to="/dashboard/billing"
              className="block text-center pill-btn-secondary !py-2 text-xs bg-white text-[var(--color-accent-blue)] border-[var(--color-accent-blue)]/30 hover:border-[var(--color-accent-blue)]"
            >
              UPGRADE TO PRO (SAVE {discountPercent || 15}%)
            </Link>
          )}
        </div>
      </div>

      {/* Right Col: Sticky Total */}
      <div className="lg:sticky lg:top-10 space-y-6">
        <div className="bento-card bg-[var(--color-accent-blue)]/5 border border-[var(--color-accent-blue)]/20 p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold uppercase mb-6">Total Due</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-black/60">
              <span>Items ({cart.length})</span>
              <span>
                {paymentMethod === 'credits' ? `${totalCredits}c` : `$${rawTotalCash.toFixed(2)}`}
              </span>
            </div>
            {paymentMethod === 'alacarte' && discountPercent > 0 && (
              <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-green-600">
                <span>Pro Discount ({discountPercent}%)</span>
                <span>-${(rawTotalCash * (discountPercent / 100)).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-black/60 border-b border-black/10 pb-4">
              <span>Taxes</span>
              <span>-</span>
            </div>
            <div className="flex justify-between items-center font-display text-4xl font-bold text-[var(--color-accent-blue)]">
              <span>Total</span>
              <span>
                {paymentMethod === 'credits' ? `${totalCredits}c` : `$${totalCash}`}
              </span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={
              isProcessing ||
              (paymentMethod === 'credits' && !hasEnoughCredits && !selectedPack)
            }
            className="w-full pill-btn bg-[var(--color-accent-blue)] text-white hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 py-4"
          >
            {isProcessing ? (
              <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
            ) : (
              <>
                {paymentMethod === 'alacarte'
                  ? 'CONFIRM & PAY'
                  : getCreditsConfirmLabel({ hasEnoughCredits, selectedPack, creditCost: totalCredits })}{' '}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
          
          <p className="text-[10px] font-bold uppercase text-black/40 tracking-widest text-center mt-4">
            By confirming, you agree to the Terms of Service. Subscriptions do not auto-renew.
          </p>
        </div>
      </div>
    </div>
  );
}
