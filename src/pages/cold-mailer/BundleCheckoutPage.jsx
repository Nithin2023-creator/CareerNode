import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBundleCart } from './BundleCartContext';
import { useWallet } from '../../context/WalletContext';
import { bundlesApi, membershipApi } from '../../lib/api';
import { CreditCard, Coins, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { openCashfreeCheckout } from '../../lib/cashfree';

export default function BundleCheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useBundleCart();
  const { wallet, refreshWallet } = useWallet();
  
  const [paymentMethod, setPaymentMethod] = useState('credits');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [myPlan, setMyPlan] = useState(null);

  React.useEffect(() => {
    membershipApi.getMe().then(res => setMyPlan(res)).catch(console.error);
  }, []);

  const totalCredits = cart.reduce((sum, item) => sum + item.creditCost, 0);
  const rawTotalAlaCarte = cart.reduce((sum, item) => sum + item.alaCartePrice, 0);
  const discountPercent = myPlan?.planId?.alaCarteDiscountPercent || 0;
  const totalAlaCarte = (rawTotalAlaCarte * (1 - discountPercent / 100)).toFixed(2);
  
  const shortfall = Math.max(0, totalCredits - (wallet?.balance || 0));
  const canUseCredits = shortfall === 0;

  // Auto-switch to alacarte if they don't have enough credits
  React.useEffect(() => {
    if (!canUseCredits && paymentMethod === 'credits') {
      setPaymentMethod('alacarte');
    }
  }, [canUseCredits, paymentMethod]);

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

  const handleCheckout = async () => {
    setProcessing(true);
    setError(null);
    try {
      for (const bundle of cart) {
        if (paymentMethod === 'credits') {
          await bundlesApi.purchaseBundle(bundle._id, paymentMethod);
        } else {
          const { orderId, paymentSessionId } = await bundlesApi.purchaseBundle(bundle._id, paymentMethod);
          await openCashfreeCheckout(paymentSessionId);
          
          let status = 'created';
          let retries = 0;
          while (status === 'created' && retries < 15) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const res = await bundlesApi.getOrderStatus(orderId);
            status = res.status;
            retries++;
          }
          
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

  return (
    <div className="max-w-6xl mx-auto pb-24">
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
                <div key={item._id} className="flex justify-between items-center p-4 bg-black/5 rounded-2xl">
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-black/60">{item.contactCount} HR Contacts • {item.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{paymentMethod === 'credits' ? `${item.creditCost} cr` : `$${item.alaCartePrice}`}</div>
                    {paymentMethod === 'credits' && <div className="text-xs text-black/40">${item.alaCartePrice} value</div>}
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
              {/* Pay with Credits */}
              <label className={`
                relative flex items-start p-4 rounded-2xl cursor-pointer border-2 transition-all
                ${paymentMethod === 'credits' ? 'border-black bg-black/5' : 'border-black/10 hover:border-black/30'}
                ${!canUseCredits ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="credits"
                  checked={paymentMethod === 'credits'}
                  onChange={(e) => canUseCredits && setPaymentMethod(e.target.value)}
                  className="mt-1 mr-3"
                  disabled={!canUseCredits}
                />
                <div className="flex-1">
                  <div className="font-bold text-lg flex items-center">
                    <Coins className="w-5 h-5 mr-2 text-[var(--color-accent-yellow)]" />
                    Pay with Credits
                  </div>
                  <div className="text-sm text-black/60 mt-1">
                    Balance: <span className="font-bold text-black">{wallet?.balance || 0}</span> cr
                  </div>
                  {!canUseCredits && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl space-y-2">
                      <div className="text-xs text-red-600 font-bold uppercase tracking-wider flex justify-between">
                        <span>Shortfall</span>
                        <span>{shortfall} cr</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {myPlan?.planId?.tier === 'free' && (
                          <Link to="/dashboard/billing" className="text-xs px-3 py-1.5 rounded-lg bg-white border border-[var(--color-accent-blue)] text-[var(--color-accent-blue)] font-bold hover:bg-[var(--color-accent-blue)] hover:text-white transition-colors">
                            UPGRADE TO PRO
                          </Link>
                        )}
                        <Link to="/dashboard/emailer/marketplace" className="text-xs px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors">
                          TOP UP WALLET
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Pay with Card */}
              <label className={`
                relative flex items-start p-4 rounded-2xl cursor-pointer border-2 transition-all
                ${paymentMethod === 'alacarte' ? 'border-black bg-black/5' : 'border-black/10 hover:border-black/30'}
              `}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="alacarte"
                  checked={paymentMethod === 'alacarte'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="font-bold text-lg flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Credit Card
                  </div>
                  <div className="text-sm text-black/60 mt-1">One-time payment</div>
                </div>
              </label>
            </div>

            <div className="border-t border-black/10 pt-6 mb-8 space-y-2">
              {paymentMethod === 'alacarte' && discountPercent > 0 && (
                <div className="flex justify-between items-center text-green-600 font-bold text-sm tracking-wider uppercase">
                  <span>Pro Discount ({discountPercent}%)</span>
                  <span>-${(rawTotalAlaCarte * (discountPercent / 100)).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-end">
                <span className="font-bold text-xl">Total:</span>
                <div className="text-right">
                  {paymentMethod === 'credits' ? (
                    <span className="font-display text-4xl font-bold">{totalCredits} <span className="text-xl">cr</span></span>
                  ) : (
                    <span className="font-display text-4xl font-bold">${totalAlaCarte}</span>
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
              disabled={processing || (paymentMethod === 'credits' && !canUseCredits)}
              className="bento-button w-full justify-between bg-[var(--color-accent-yellow)] text-black hover:bg-[var(--color-accent-yellow)]/90 py-5 text-xl disabled:opacity-50"
            >
              <span className="flex items-center">
                <ShieldCheck className="mr-2 h-6 w-6" />
                {processing ? 'Processing...' : 'Complete Purchase'}
              </span>
              {!processing && <ArrowRight />}
            </button>
            <p className="text-center text-xs text-black/40 mt-4 font-medium">Secure mock payment processing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
