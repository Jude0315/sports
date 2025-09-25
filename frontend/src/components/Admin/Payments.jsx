import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllOrders } from "../../redux/slices/adminOrderSlice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { FaTrash, FaEdit, FaMoneyBillWave, FaDownload, FaSearch, FaUndo } from "react-icons/fa";
import * as XLSX from 'xlsx';

const Payments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { orders, loading, error } = useSelector((state) => state.adminOrders);
  
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    } else {
      dispatch(fetchAllOrders());
    }
  }, [user, navigate, dispatch]);

  // Transform orders into payment data
  useEffect(() => {
    if (orders && orders.length > 0) {
      const paymentData = orders
        .filter(order => order.isPaid) // Only include paid orders
        .map(order => ({
          id: order._id,
          orderId: order._id?.slice(-8).toUpperCase(),
          customer: order.user?.name || 'Guest',
          customerEmail: order.user?.email || 'N/A',
          amount: order.totalPrice || 0,
          method: order.paymentMethod?.toLowerCase() || 'unknown',
          status: order.paymentStatus || (order.isPaid ? 'paid' : 'pending'),
          date: order.paidAt || order.createdAt,
          orderStatus: order.status,
          paymentStatus: order.paymentStatus,
          isPaid: order.isPaid
        }));
      
      setPayments(paymentData);
      setFilteredPayments(paymentData);
    }
  }, [orders]);

  // Filter payments based on status and search term
  useEffect(() => {
    let result = payments;
    
    // Apply status filter
    if (filter !== "all") {
      result = result.filter(payment => payment.status === filter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(payment => 
        payment.orderId.toLowerCase().includes(term) ||
        payment.customer.toLowerCase().includes(term) ||
        payment.customerEmail.toLowerCase().includes(term)
      );
    }
    
    setFilteredPayments(result);
  }, [filter, searchTerm, payments]);

  // Generate payment report
  const generatePaymentReport = () => {
    const reportData = payments.map(payment => ({
      'Payment ID': payment.id,
      'Order ID': payment.orderId,
      'Customer': payment.customer,
      'Email': payment.customerEmail,
      'Amount': `LKR ${payment.amount.toFixed(2)}`,
      'Payment Method': payment.method.toUpperCase(),
      'Payment Status': payment.status,
      'Order Status': payment.orderStatus,
      'Payment Date': payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);
    
    XLSX.utils.book_append_sheet(wb, ws, "Payments Report");
    XLSX.writeFile(wb, `Payments_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Handle refund process
  const handleRefund = (payment) => {
    // In a real application, you would make an API call to process the refund
    // For now, we'll just show a confirmation and simulate the process
    
    if (window.confirm(`Are you sure you want to refund LKR ${payment.amount.toFixed(2)} to ${payment.customer}?`)) {
      // Simulate refund process
      console.log(`Refunding payment ${payment.orderId} to customer ${payment.customerEmail}`);
      
      // In a real app, you would:
      // 1. Make API call to process refund with payment gateway
      // 2. Update order status in database
      // 3. Send email notification to customer
      
      // Simulate sending message to customer
      alert(`Refund initiated for order #${payment.orderId}. The customer will receive a confirmation message.`);
      
      // Message that would be sent to the customer
      const message = `Dear ${payment.customer}, your refund of LKR ${payment.amount.toFixed(2)} for order #${payment.orderId} has been processed. The amount will be credited to your original payment method within 7 business days.`;
      
      console.log("Message to customer:", message);
      
      // You would typically integrate with an email service or notification system here
    }
  };

  // Data for charts - using useMemo to prevent recalculating on every render
  const chartData = [
    { name: "PayPal", value: payments.filter(p => p.method === "paypal").length },
    { name: "Credit Card", value: payments.filter(p => p.method === "credit_card").length },
    { name: "Stripe", value: payments.filter(p => p.method === "stripe").length },
    { name: "Other", value: payments.filter(p => !["paypal", "credit_card", "stripe"].includes(p.method)).length },
  ];

  const statusData = [
    { name: "Paid", value: payments.filter(p => p.status === "paid").length },
    { name: "Pending", value: payments.filter(p => p.status === "pending").length },
    { name: "Refunded", value: payments.filter(p => p.status === "refunded").length },
    { name: "Failed", value: payments.filter(p => p.status === "failed").length },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Get payment statistics
  const paymentStats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
    paid: payments.filter(p => p.status === "paid").length,
    pending: payments.filter(p => p.status === "pending").length,
    refunded: payments.filter(p => p.status === "refunded").length,
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Error:</p>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 ml-64">
      <h1 className="text-3xl font-bold mb-6">Payment Management</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{paymentStats.total}</div>
          <div className="text-sm text-gray-600">Total Payments</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">LKR {paymentStats.totalAmount.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-emerald-600">{paymentStats.paid}</div>
          <div className="text-sm text-gray-600">Successful Payments</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{paymentStats.pending}</div>
          <div className="text-sm text-gray-600">Pending Payments</div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setFilter("all")}
          >
            All Payments
          </button>
          <button 
            className={`px-4 py-2 rounded ${filter === "paid" ? "bg-green-500 text-white" : "bg-gray-200"}`}
            onClick={() => setFilter("paid")}
          >
            Paid
          </button>
          <button 
            className={`px-4 py-2 rounded ${filter === "pending" ? "bg-yellow-500 text-white" : "bg-gray-200"}`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button 
            className={`px-4 py-2 rounded ${filter === "refunded" ? "bg-red-500 text-white" : "bg-gray-200"}`}
            onClick={() => setFilter("refunded")}
          >
            Refunded
          </button>
        </div>
        
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search payments..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button 
          onClick={generatePaymentReport}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <FaDownload className="mr-2" />
          Export Report
        </button>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Payment Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Payment Records</h2>
          <span className="text-sm text-gray-600">
            Showing {filteredPayments.length} of {payments.length} payments
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">#{payment.orderId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{payment.customer}</div>
                        <div className="text-sm text-gray-500">{payment.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">
                        LKR {payment.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {payment.method.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full
                        ${payment.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                        ${payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${payment.status === 'refunded' ? 'bg-red-100 text-red-800' : ''}
                        ${payment.status === 'failed' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payment.status === 'paid' && (
                        <button
                          onClick={() => handleRefund(payment)}
                          className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors duration-200"
                        >
                          <FaUndo className="mr-1" />
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FaMoneyBillWave className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No payments found</p>
                      <p className="text-sm mt-2">
                        {filter === 'all' ? 'No payments have been processed yet' : `No ${filter} payments found`}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;