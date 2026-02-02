import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { adminService } from '../../services/adminService';

const emptyPlan = {
  name: 'basic',
  displayName: '',
  description: '',
  price: { monthly: 0, yearly: 0, lifetime: 0 },
  currency: 'LKR',
  features: [],
  limits: {
    examsPerMonth: -1,
    questionsAccess: 'all',
    reviewAccess: true,
    analyticsAccess: true,
    downloadCertificate: false,
    prioritySupport: false
  },
  isActive: true,
  isPopular: false,
  order: 0
};

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState(emptyPlan);
  const [newFeature, setNewFeature] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getPlans();
      setPlans(data.data);
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreate = () => {
    setSelectedPlan(null);
    setForm(emptyPlan);
    setShowModal(true);
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setForm(plan);
    setShowModal(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (selectedPlan) {
        await adminService.updatePlan(selectedPlan._id, form);
        toast.success('Plan updated');
      } else {
        await adminService.createPlan(form);
        toast.success('Plan created');
      }
      setShowModal(false);
      fetchPlans();
    } catch (error) {
      toast.error(error.message || 'Failed to save plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (plan) => {
    setSelectedPlan(plan);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await adminService.deletePlan(selectedPlan._id);
      toast.success('Plan deleted');
      setShowDeleteModal(false);
      fetchPlans();
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setForm({
      ...form,
      features: [...(form.features || []), { text: newFeature, included: true }]
    });
    setNewFeature('');
  };

  const removeFeature = (index) => {
    setForm({
      ...form,
      features: form.features.filter((_, i) => i !== index)
    });
  };

  const toggleFeatureIncluded = (index) => {
    const newFeatures = [...form.features];
    newFeatures[index].included = !newFeatures[index].included;
    setForm({ ...form, features: newFeatures });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
            <p className="text-gray-500">Manage pricing and features</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Plan
          </Button>
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card key={plan._id} className={`relative ${plan.isPopular ? 'ring-2 ring-primary-500' : ''}`}>
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                    Popular
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.displayName}</h3>
                  <p className="text-sm text-gray-500">{plan.name}</p>
                </div>

                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    Rs. {plan.price?.monthly?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">/month</div>
                </div>

                <div className="space-y-2 mb-4">
                  {plan.features?.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className={`text-xs ${plan.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Plan Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedPlan ? 'Edit Plan' : 'Create Plan'}
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan ID</label>
              <select
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled={selectedPlan}
              >
                <option value="free">free</option>
                <option value="basic">basic</option>
                <option value="premium">premium</option>
                <option value="lifetime">lifetime</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Premium Plan"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly (Rs.)</label>
              <input
                type="number"
                value={form.price?.monthly || 0}
                onChange={(e) => setForm({ ...form, price: { ...form.price, monthly: parseInt(e.target.value) } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yearly (Rs.)</label>
              <input
                type="number"
                value={form.price?.yearly || 0}
                onChange={(e) => setForm({ ...form, price: { ...form.price, yearly: parseInt(e.target.value) } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lifetime (Rs.)</label>
              <input
                type="number"
                value={form.price?.lifetime || 0}
                onChange={(e) => setForm({ ...form, price: { ...form.price, lifetime: parseInt(e.target.value) } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exams Per Month (-1 for unlimited)</label>
            <input
              type="number"
              value={form.limits?.examsPerMonth ?? -1}
              onChange={(e) => setForm({ ...form, limits: { ...form.limits, examsPerMonth: parseInt(e.target.value) } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.limits?.reviewAccess}
                onChange={(e) => setForm({ ...form, limits: { ...form.limits, reviewAccess: e.target.checked } })}
                className="w-4 h-4"
              />
              <span className="text-sm">Review Access</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.limits?.analyticsAccess}
                onChange={(e) => setForm({ ...form, limits: { ...form.limits, analyticsAccess: e.target.checked } })}
                className="w-4 h-4"
              />
              <span className="text-sm">Analytics</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.limits?.downloadCertificate}
                onChange={(e) => setForm({ ...form, limits: { ...form.limits, downloadCertificate: e.target.checked } })}
                className="w-4 h-4"
              />
              <span className="text-sm">Certificates</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.limits?.prioritySupport}
                onChange={(e) => setForm({ ...form, limits: { ...form.limits, prioritySupport: e.target.checked } })}
                className="w-4 h-4"
              />
              <span className="text-sm">Priority Support</span>
            </label>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
            <div className="space-y-2 mb-2">
              {form.features?.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFeatureIncluded(index)}
                    className={`p-1 rounded ${feature.included ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {feature.included ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                  <span className="flex-1 text-sm">{feature.text}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add feature..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                onKeyPress={(e) => e.key === 'Enter' && addFeature()}
              />
              <Button size="sm" onClick={addFeature}>Add</Button>
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPopular}
                onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Popular Badge</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleSave} isLoading={isSaving}>
              {selectedPlan ? 'Update' : 'Create'} Plan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Plan">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the <strong>{selectedPlan?.displayName}</strong> plan?
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
