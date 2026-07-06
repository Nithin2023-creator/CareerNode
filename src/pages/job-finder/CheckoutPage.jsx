import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Coins, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCart } from './CartContext';
import { jobFinderApi, membershipApi } from '../../lib/api';
import { useToast } from '../../lib/toast';
import { openCashfreeCheckout } from '../../lib/cashfree';

export default function CheckoutPage() {
  const { cart, wallet, clearCart, refreshWallet } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [paymentMethod, setPaymentMethod] = useState('credits');
  const [isProcessing, setIsProcessing] = useState(false);
  const [myPlan, setMyPlan] = useState(null);

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

    if (paymentMethod === 'credits' && !hasEnoughCredits) {
      toast.error('Insufficient credits. Please top up your wallet.');
      return;
    }

    setIsProcessing(true);
    try {
      if (paymentMethod === 'credits') {
        await jobFinderApi.checkout(cart, paymentMethod);
      } else {
        const { orderId, paymentSessionId } = await jobFinderApi.checkout(cart, paymentMethod);
        await openCashfreeCheckout(paymentSessionId);
        
        let status = 'created';
        let retries = 0;
        while (status === 'created' && retries < 15) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const res = await jobFinderApi.getOrderStatus(orderId);
          status = res.status;
          retries++;
        }
        
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Credits Option */}
            <button 
              type="button"
              onClick={() => setPaymentMethod('credits')}
              className={`p-6 rounded-[24px] border-2 text-left transition-all relative overflow-hidden ${
                paymentMethod === 'credits' 
                  ? 'border-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]/5' 
                  : 'border-black/10 hover:border-black/30'
              }`}
            >
              <Coins className={`h-8 w-8 mb-4 ${paymentMethod === 'credits' ? 'text-[var(--color-accent-blue)]' : 'text-black/40'}`} />
              <h4 className="font-bold text-lg">Pay with Credits</h4>
              <p className="text-sm font-medium text-black/60 mt-1">Deduct from your wallet balance</p>
              
              <div className="mt-4 pt-4 border-t border-black/10 flex justify-between items-center text-sm font-bold uppercase tracking-widest">
                <span className="text-black/40">Balance</span>
                <span className={hasEnoughCredits ? 'text-black' : 'text-red-500'}>{wallet.balance}c</span>
              </div>
            </button>

            {/* A la Carte Option */}
            <button 
              type="button"
              onClick={() => setPaymentMethod('alacarte')}
              className={`p-6 rounded-[24px] border-2 text-left transition-all ${
                paymentMethod === 'alacarte' 
                  ? 'border-[var(--color-accent-blue)] bg-[var(--color-accent-blue)]/5' 
                  : 'border-black/10 hover:border-black/30'
              }`}
            >
              <CreditCard className={`h-8 w-8 mb-4 ${paymentMethod === 'alacarte' ? 'text-[var(--color-accent-blue)]' : 'text-black/40'}`} />
              <h4 className="font-bold text-lg">Pay A la Carte</h4>
              <p className="text-sm font-medium text-black/60 mt-1">One-time card payment</p>
              
              <div className="mt-4 pt-4 border-t border-black/10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40">
                <ShieldCheck className="h-4 w-4" /> SECURE CHECKOUT
              </div>
            </button>
          </div>

          {/* Warnings & Decorative Fields */}
          {paymentMethod === 'credits' && !hasEnoughCredits && (
            <div className="bg-red-50 text-red-600 p-4 rounded-[16px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-red-100">
              <div className="flex items-center gap-2 text-sm font-bold">
                <AlertCircle className="h-5 w-5" /> Insufficient Credits
              </div>
              <div className="flex flex-wrap gap-2">
                {myPlan?.planId?.tier === 'free' && (
                  <Link to="/dashboard/billing" className="pill-btn-secondary !py-1.5 !px-4 text-xs bg-white text-[var(--color-accent-blue)] border-[var(--color-accent-blue)]/30 hover:border-[var(--color-accent-blue)]">
                    UPGRADE TO PRO (SAVE {discountPercent || 15}%)
                  </Link>
                )}
                <Link to="/dashboard/job-finder/wallet" className="pill-btn-secondary !py-1.5 !px-4 text-xs bg-white text-red-600 border-red-200">
                  TOP UP WALLET
                </Link>
              </div>
            </div>
          )}

          {paymentMethod === 'alacarte' && (
            <div className="bg-black/5 p-6 rounded-[24px] space-y-4 border border-black/10 animate-in fade-in slide-in-from-top-4">
              <p className="text-sm font-medium text-black/80 text-center">
                You will be redirected to our secure payment gateway to complete your purchase.
              </p>
            </div>
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
            disabled={isProcessing || (paymentMethod === 'credits' && !hasEnoughCredits)}
            className="w-full pill-btn bg-[var(--color-accent-blue)] text-white hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 py-4"
          >
            {isProcessing ? (
              <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
            ) : (
              <>CONFIRM & PAY <ArrowRight className="h-5 w-5" /></>
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
