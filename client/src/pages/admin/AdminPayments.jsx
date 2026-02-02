import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Search,
  Plus,
  Eye,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { adminService } from '../../services/adminService';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [totals, setTotals] = useState({ total: 0, count: 0 });
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ status: '', notes: '' });
  const [createForm, setCreateForm] = useState({
    userId: '',
    planName: 'premium',
    billingCycle: 'monthly',
    amount: 0,
    status: 'completed',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchPayments = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await adminService.getPayments({
        page,
        search: search || undefined,
        status: statusFilter || undefined
      });
      setPayments(data.data);
      setTotals(data.totals);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers({ limit: 100 });
      setUsers(data.data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchUsers();
  }, [search, statusFilter]);

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setForm({ status: payment.status, notes: payment.notes || '' });
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    setIsSaving(true);
    try {
      await adminService.updatePayment(selectedPayment._id, form);
      toast.success('Payment updated');
      setShowModal(false);
      fetchPayments(pagination.page);
    } catch (error) {
      toast.error('Failed to update payment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    setIsSaving(true);
    try {
      await adminService.createPayment(createForm);
      toast.success('Payment created and subscription activated');
      setShowCreateModal(false);
      setCreateForm({
        userId: '',
        planName: 'premium',
        billingCycle: 'monthly',
        amount: 0,
        status: 'completed',
        notes: ''
      });
      fetchPayments();
    } catch (error) {
      toast.error('Failed to create payment');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (currency = '') => (currency === 'LKR' ? 'Rs.' : currency || '');

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      refunded: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-gray-100 text-gray-700'
    };
    return styles[status] || styles.pending;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-500">Manage orders and transactions</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Manual Payment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs. {totals.total?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Payments</p>
                <p className="text-2xl font-bold text-gray-900">{totals.count || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </Card>

        {/* Payments Table */}
        <Card padding="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900">{payment.orderId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{payment.userId?.fullName}</p>
                          <p className="text-sm text-gray-500">{payment.userId?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize">{payment.planName}</span>
                        <span className="text-sm text-gray-500 ml-1">({payment.billingCycle})</span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(payment.currency)} {payment.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleView(payment)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-200">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchPayments(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    pagination.page === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* View/Update Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Payment Details">
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Order ID:</span>
                <p className="font-mono font-medium">{selectedPayment.orderId}</p>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>
                <p className="font-medium">{selectedPayment.currency} {selectedPayment.amount?.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">User:</span>
                <p className="font-medium">{selectedPayment.userId?.fullName}</p>
              </div>
              <div>
                <span className="text-gray-500">Plan:</span>
                <p className="font-medium capitalize">{selectedPayment.planName} ({selectedPayment.billingCycle})</p>
              </div>
              <div>
                <span className="text-gray-500">Payment Method:</span>
                <p className="font-medium capitalize">{selectedPayment.paymentMethod || 'N/A'}</p>
              </div>
              {(selectedPayment.slipUrl || selectedPayment.receiptUrl) && (
                <div>
                  <span className="text-gray-500">Slip / Receipt:</span>
                  <p className="font-medium text-primary-600 break-all">
                    <a href={selectedPayment.slipUrl || selectedPayment.receiptUrl} target="_blank" rel="noreferrer">
                      View attachment
                    </a>
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Date:</span>
                <p className="font-medium">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Add notes..."
              />
            </div>

            {selectedPayment?.metadata?.slipBase64 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Uploaded Slip</p>
                <img
                  src={selectedPayment.metadata.slipBase64}
                  alt="Slip"
                  className="w-full rounded-lg border object-contain max-h-64"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" fullWidth onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleUpdateStatus} isLoading={isSaving}>
                Update Payment
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Manual Payment Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Manual Payment">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <select
              value={createForm.userId}
              onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select user...</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.fullName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select
                value={createForm.planName}
                onChange={(e) => setCreateForm({ ...createForm, planName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
              <select
                value={createForm.billingCycle}
                onChange={(e) => setCreateForm({ ...createForm, billingCycle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.)</label>
            <input
              type="number"
              value={createForm.amount}
              onChange={(e) => setCreateForm({ ...createForm, amount: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={createForm.status}
              onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed (Activates subscription)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Bank transfer, Cash payment..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleCreate} isLoading={isSaving} disabled={!createForm.userId}>
              Create Payment
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
