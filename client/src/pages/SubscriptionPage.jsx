import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Crown, Zap, Star, CreditCard, Banknote, Upload, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { subscriptionService } from '../services/subscriptionService';

const planIcons = {
  free: Star,
  basic: Zap,
  premium: Crown,
  lifetime: Crown
};

const BANK_INFO = {
  accountName: import.meta.env.VITE_BANK_ACCOUNT_NAME || 'Korean Exams (Pvt) Ltd',
  accountNo: import.meta.env.VITE_BANK_ACCOUNT_NO || '0000000000',
  bankName: import.meta.env.VITE_BANK_NAME || 'Commercial Bank',
  branch: import.meta.env.VITE_BANK_BRANCH || 'Colombo Main',
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '94700000000'
};

export default function SubscriptionPage() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('payhere');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slipPreview, setSlipPreview] = useState('');
  const [slipBase64, setSlipBase64] = useState('');
  const [slipUrl, setSlipUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchPlans();
    if (isAuthenticated) {
      fetchCurrentSubscription();
    }
  }, [isAuthenticated]);

  const fetchPlans = async () => {
    try {
      const { data } = await subscriptionService.getPlans();
      setPlans(data.filter(p => p.isActive));
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPaymentState = () => {
    setSlipPreview('');
    setSlipBase64('');
    setSlipUrl('');
    setNotes('');
    setIsSubmitting(false);
  };

  const submitPayHereForm = (payhere) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payhere.actionUrl;
    form.style.display = 'none';

    Object.entries(payhere.payload || {}).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const handlePayHereCheckout = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    try {
      const { data } = await subscriptionService.initiatePayHere({
        planName: selectedPlan.name,
        billingCycle
      });

      if (!data?.payhere?.actionUrl) {
        throw new Error('PayHere configuration missing');
      }

      submitPayHereForm(data.payhere);
      toast.info('Redirecting to PayHere secure checkout...');
    } catch (error) {
      toast.error(error.message || 'Unable to start PayHere checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSlipUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large (max 2MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSlipBase64(reader.result);
      setSlipPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleBankTransfer = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    try {
      const { data } = await subscriptionService.submitBankTransfer({
        planName: selectedPlan.name,
        billingCycle,
        slipUrl: slipUrl || undefined,
        notes,
        slipBase64: slipBase64 || undefined
      });

      const orderId = data?.payment?.orderId;
      toast.success(`Slip submitted. Reference ${orderId || ''} — we'll verify soon.`);
      setShowPaymentModal(false);
      resetPaymentState();
    } catch (error) {
      toast.error(error.message || 'Unable to submit bank transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const { data } = await subscriptionService.getCurrent();
      setCurrentSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/subscription' } });
      return;
    }

    if (plan.name === 'free') {
      toast.info('You are already on the free plan');
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentModal(true);
    setPaymentMethod('payhere');
  };

  const getPrice = (plan) => {
    if (plan.name === 'free') return 0;
    if (plan.name === 'lifetime') return plan.price?.lifetime || 0;
    return billingCycle === 'yearly'
      ? plan.price?.yearly || 0
      : plan.price?.monthly || 0;
  };

  const getPriceLabel = (plan) => {
    if (plan.name === 'free') return 'Free';
    if (plan.name === 'lifetime') return 'One-time';
    return billingCycle === 'yearly' ? '/year' : '/month';
  };

  const getWhatsappLink = (planDisplayName) => {
    const num = (BANK_INFO.whatsapp || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hi, I just submitted a bank transfer slip for ${planDisplayName || 'EPS-TOPIK subscription'}.`
    );
    return `https://wa.me/${num}?text=${message}`;
  };

  const isCurrentPlan = (plan) => {
    const current = currentSubscription?.plan || currentSubscription?.planName;
    return current === plan.name;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan to accelerate your EPS-TOPIK preparation journey
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs text-green-600 font-semibold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {plans.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No subscription plans available yet.</p>
            </div>
          ) : (
            plans.sort((a, b) => a.order - b.order).map((plan) => {
              const Icon = planIcons[plan.name] || Star;
              const price = getPrice(plan);
              const priceLabel = getPriceLabel(plan);
              const isCurrent = isCurrentPlan(plan);

              return (
                <Card
                  key={plan._id}
                  className={`relative flex flex-col ${
                    plan.isPopular ? 'ring-2 ring-primary-500 shadow-lg' : ''
                  } ${isCurrent ? 'border-green-500 border-2' : ''}`}
                >
                  {/* Popular Badge */}
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-white text-sm font-medium rounded-full">
                      Most Popular
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrent && (
                    <div className="absolute -top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      Current Plan
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center pt-6 pb-4">
                    <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4 ${
                      plan.name === 'premium' || plan.name === 'lifetime'
                        ? 'bg-yellow-100 text-yellow-600'
                        : plan.name === 'basic'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.displayName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center py-4 border-t border-b">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        {price === 0 ? 'Free' : `Rs. ${price.toLocaleString()}`}
                      </span>
                      {price > 0 && (
                        <span className="text-gray-500 ml-1">{priceLabel}</span>
                      )}
                    </div>
                    {billingCycle === 'yearly' && plan.name !== 'free' && plan.name !== 'lifetime' && (
                      <p className="text-sm text-green-600 mt-1">
                        Save Rs. {((plan.price?.monthly * 12) - plan.price?.yearly).toLocaleString()}/year
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex-1 py-6">
                    <ul className="space-y-3">
                      {plan.features?.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          )}
                          <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4 mt-auto">
                    <Button
                      fullWidth
                      variant={plan.isPopular ? 'primary' : 'secondary'}
                      onClick={() => handleSubscribe(plan)}
                      disabled={isCurrent}
                    >
                      {isCurrent
                        ? 'Current Plan'
                        : plan.name === 'free'
                        ? 'Get Started'
                        : 'Subscribe Now'}
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Payment Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            resetPaymentState();
          }}
          title={selectedPlan ? `Checkout — ${selectedPlan.displayName}` : 'Checkout'}
          size="lg"
        >
          {selectedPlan && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPlan.displayName} ({billingCycle})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rs. {getPrice(selectedPlan).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('payhere')}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition ${
                    paymentMethod === 'payhere' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">PayHere</p>
                    <p className="text-xs text-gray-500">Card, bank, wallet via PayHere</p>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition ${
                    paymentMethod === 'bank_transfer' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Bank Transfer</p>
                    <p className="text-xs text-gray-500">Upload slip & WhatsApp us</p>
                  </div>
                </button>
              </div>

              {paymentMethod === 'payhere' ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    You will be redirected to PayHere to complete a secure payment. Your subscription
                    activates automatically once payment succeeds.
                  </p>
                  <Button fullWidth onClick={handlePayHereCheckout} isLoading={isSubmitting}>
                    Pay with PayHere
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <p className="text-sm text-gray-600 mb-2">Bank Account Details</p>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Account Name</p>
                        <p className="font-medium text-gray-900">{BANK_INFO.accountName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Account No</p>
                        <p className="font-medium text-gray-900">{BANK_INFO.accountNo}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bank</p>
                        <p className="font-medium text-gray-900">{BANK_INFO.bankName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Branch</p>
                        <p className="font-medium text-gray-900">{BANK_INFO.branch}</p>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload deposit slip (image, max 2MB)
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <Upload className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">Choose file</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleSlipUpload} />
                        </label>
                        {slipPreview && <span className="text-xs text-gray-500">File attached</span>}
                      </div>
                      {slipPreview && (
                        <img src={slipPreview} alt="Slip preview" className="mt-3 h-24 rounded-lg object-cover border" />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Or paste slip URL</label>
                      <input
                        type="text"
                        value={slipUrl}
                        onChange={(e) => setSlipUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="https://drive.google.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Reference number, payer name, etc."
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>WhatsApp slip to {BANK_INFO.whatsapp}</span>
                      </div>
                      <a
                        href={getWhatsappLink(selectedPlan.displayName)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 font-medium"
                      >
                        Open WhatsApp
                      </a>
                    </div>

                    <Button fullWidth onClick={handleBankTransfer} isLoading={isSubmitting}>
                      Submit Bank Transfer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I switch plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. When upgrading,
                you'll only pay the difference. When downgrading, the change takes effect
                at the end of your billing cycle.
              </p>
            </Card>
            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept bank transfers, credit/debit cards, and popular Sri Lankan payment
                methods. Contact us for more payment options.
              </p>
            </Card>
            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-gray-600">
                Yes, we offer a 7-day money-back guarantee. If you're not satisfied with
                the service, contact us within 7 days of purchase for a full refund.
              </p>
            </Card>
            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens when my subscription ends?
              </h3>
              <p className="text-gray-600">
                Your account will revert to the free plan. You'll still have access to
                limited features, and your exam history will be preserved.
              </p>
            </Card>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Have questions? Need a custom plan for your organization?
          </p>
          <Button variant="secondary" onClick={() => toast.info('Contact: support@eps-topik.lk')}>
            Contact Us
          </Button>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-8 mt-16 rounded-2xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
            &copy; {new Date().getFullYear()} EPS-TOPIK Practice Platform. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
