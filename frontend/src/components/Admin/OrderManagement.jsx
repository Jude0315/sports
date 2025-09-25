import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateOrderStatus, fetchAllOrders } from "../../redux/slices/adminOrderSlice";
import * as XLSX from 'xlsx';

const OrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { orders, loading, error, updating, updateError } = useSelector((state) => state.adminOrders);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [processingAlerts, setProcessingAlerts] = useState({});

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    } else {
      dispatch(fetchAllOrders());
    }
  }, [user, navigate, dispatch]);

  // Calculate processing time for orders
  useEffect(() => {
    if (orders && orders.length > 0) {
      const alerts = {};
      
      orders.forEach(order => {
        if (order.status === 'processing' && order.updatedAt) {
          const processingTime = new Date() - new Date(order.updatedAt);
          const hoursInProcessing = processingTime / (1000 * 60 * 60);
          
          if (hoursInProcessing >= 4) {
            alerts[order._id] = {
              hours: Math.floor(hoursInProcessing),
              minutes: Math.floor((hoursInProcessing % 1) * 60)
            };
          }
        }
      });
      
      setProcessingAlerts(alerts);
    }
  }, [orders]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort orders
  const sortedOrders = React.useMemo(() => {
    if (!orders) return [];
    
    let sortableOrders = [...orders];
    if (sortConfig.key) {
      sortableOrders.sort((a, b) => {
        // Handle nested properties
        const getValue = (obj, key) => {
          if (key.includes('.')) {
            const keys = key.split('.');
            return keys.reduce((o, k) => (o || {})[k], obj);
          }
          return obj[key];
        };
        
        const aValue = getValue(a, sortConfig.key);
        const bValue = getValue(b, sortConfig.key);
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableOrders;
  }, [orders, sortConfig]);

  // Filter orders based on status and search term
  const filteredOrders = sortedOrders.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status?.toLowerCase() === filterStatus;
    
    if (!matchesStatus) return false;
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      order._id?.toLowerCase().includes(searchLower) ||
      order.user?.name?.toLowerCase().includes(searchLower) ||
      order.user?.email?.toLowerCase().includes(searchLower) ||
      order.status?.toLowerCase().includes(searchLower) ||
      order.paymentStatus?.toLowerCase().includes(searchLower) ||
      order.shippingAddress?.address?.toLowerCase().includes(searchLower) ||
      order.shippingAddress?.city?.toLowerCase().includes(searchLower) ||
      order.orderItems?.some(item => 
        item.name?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower)
      )
    );
  });

  const handleStatusChange = async (orderId, status) => {
    try {
      const result = await dispatch(updateOrderStatus({ id: orderId, status })).unwrap();
      console.log('Status updated successfully:', result);
      
      // Clear alert if order was in processing and is now being moved to shipped
      if (status === 'shipped' && processingAlerts[orderId]) {
        const newAlerts = { ...processingAlerts };
        delete newAlerts[orderId];
        setProcessingAlerts(newAlerts);
      }
      
      dispatch(fetchAllOrders());
    } catch (error) {
      console.error('Failed to update status:', error);
      alert(error.message || updateError || 'Failed to update order status');
    }
  };

  const handleMarkDelivered = (orderId) => {
    if (window.confirm("Are you sure you want to mark this order as delivered?")) {
      handleStatusChange(orderId, "delivered");
    }
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      handleStatusChange(orderId, "cancelled");
    }
  };

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  // Generate Excel Report
  const generateOrderReport = () => {
    const reportData = orders.map(order => ({
      'Order ID': order._id,
      'Customer': order.user?.name || order.user?.email || 'Guest',
      'Email': order.user?.email || 'N/A',
      'Total Amount': `LKR ${order.totalPrice?.toFixed(2) || '0.00'}`,
      'Status': order.status || 'Pending',
      'Payment Status': order.paymentStatus || 'N/A',
      'Items Count': order.orderItems?.length || 0,
      'Order Date': order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
      'Delivery Date': order.updatedAt && order.status === 'delivered' ? 
        new Date(order.updatedAt).toLocaleDateString() : 'N/A',
      'Shipping Address': order.shippingAddress ? 
        `${order.shippingAddress.address}, ${order.shippingAddress.city}` : 'N/A'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);
    
    XLSX.utils.book_append_sheet(wb, ws, "Orders Report");
    XLSX.writeFile(wb, `Orders_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Get status counts for stats
  const statusCounts = {
    all: orders?.length || 0,
    pending: orders?.filter(o => o.status?.toLowerCase() === 'pending').length || 0,
    processing: orders?.filter(o => o.status?.toLowerCase() === 'processing').length || 0,
    shipped: orders?.filter(o => o.status?.toLowerCase() === 'shipped').length || 0,
    delivered: orders?.filter(o => o.status?.toLowerCase() === 'delivered').length || 0,
    cancelled: orders?.filter(o => o.status?.toLowerCase() === 'cancelled').length || 0,
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
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600 mt-1">Manage customer orders and track fulfillment</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={generateOrderReport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Processing Alerts Banner */}
      {Object.keys(processingAlerts).length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Attention needed
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {Object.keys(processingAlerts).length} order{Object.keys(processingAlerts).length > 1 ? 's have' : ' has'} been in processing status for more than 4 hours:
                </p>
                <ul className="list-disc pl-5 mt-1">
                  {Object.entries(processingAlerts).map(([orderId, time]) => {
                    const order = orders.find(o => o._id === orderId);
                    return (
                      <li key={orderId}>
                        Order #{order?._id?.slice(-8).toUpperCase()} - {time.hours}h {time.minutes}m in processing
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by ID, name, email, status, address, or product..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div 
          className={`bg-white p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all duration-200 ${
            filterStatus === 'all' ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setFilterStatus('all')}
        >
          <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        
        {Object.entries({
          pending: 'Pending',
          processing: 'Processing',
          shipped: 'Shipped',
          delivered: 'Delivered',
          cancelled: 'Cancelled'
        }).map(([key, label]) => (
          <div 
            key={key}
            className={`bg-white p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all duration-200 ${
              filterStatus === key ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setFilterStatus(key)}
          >
            <div className={`text-2xl font-bold ${
              key === 'delivered' ? 'text-green-600' : 
              key === 'cancelled' ? 'text-red-600' : 'text-gray-900'
            }`}>
              {statusCounts[key]}
            </div>
            <div className="text-sm text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('_id')}>
                  Order ID {sortConfig.key === '_id' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('user.name')}>
                  Customer {sortConfig.key === 'user.name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('totalPrice')}>
                  Amount {sortConfig.key === 'totalPrice' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                  Date {sortConfig.key === 'createdAt' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders && filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const hasProcessingAlert = processingAlerts[order._id];
                  
                  return (
                    <React.Fragment key={order._id}>
                      <tr className={`hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${hasProcessingAlert ? 'bg-yellow-50' : ''}`} onClick={() => toggleOrderExpand(order._id)}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              #{order._id?.slice(-8).toUpperCase()}
                              {hasProcessingAlert && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Attention
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.orderItems?.length || 0} items
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {order.user?.name || 'Guest'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.user?.email || 'N/A'}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            LKR {order.totalPrice?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.paymentMethod}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          {order.status === 'delivered' || order.status === 'cancelled' ? (
                            <span className={`text-sm rounded-lg p-2 font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          ) : (
                            <div>
                              <select
                                value={order.status?.toLowerCase() || 'processing'}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                className={`text-sm rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                                disabled={updating}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                              </select>
                              {hasProcessingAlert && (
                                <div className="text-xs mt-1 text-yellow-600 font-medium">
                                  In processing for {processingAlerts[order._id].hours}h {processingAlerts[order._id].minutes}m
                                </div>
                              )}
                            </div>
                          )}
                          <div className="text-xs mt-1 text-gray-500">
                            Payment: {order.paymentStatus || 'N/A'}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                          {order.status === 'processing' && order.updatedAt && (
                            <div className="text-xs text-gray-500">
                              Processing since: {new Date(order.updatedAt).toLocaleTimeString()}
                            </div>
                          )}
                          {order.deliveredAt && (
                            <div className="text-xs text-gray-500">
                              Delivered: {new Date(order.deliveredAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkDelivered(order._id);
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                                  disabled={updating}
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {updating ? '...' : 'Deliver'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelOrder(order._id);
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                                  disabled={updating}
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  {updating ? '...' : 'Cancel'}
                                </button>
                              </>
                            )}
                            {order.status === 'delivered' && (
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                ✓ Delivered
                              </span>
                            )}
                            {order.status === 'cancelled' && (
                              <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                ✗ Cancelled
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Order Details */}
                      {expandedOrder === order._id && (
                        <tr className="bg-blue-50">
                          <td colSpan="6" className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Order Items */}
                              <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Order Items</h3>
                                <div className="space-y-2">
                                  {order.orderItems?.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center border-b pb-2">
                                      <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                        {item.category && (
                                          <p className="text-sm text-gray-600">Category: {item.category}</p>
                                        )}
                                      </div>
                                      <p className="font-semibold">LKR {item.price?.toFixed(2)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Shipping and Payment Details */}
                              <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Shipping & Payment</h3>
                                <div className="space-y-2">
                                  {order.shippingAddress && (
                                    <div>
                                      <p className="font-medium">Shipping Address</p>
                                      <p className="text-sm">
                                        {order.shippingAddress.address}, {order.shippingAddress.city}
                                      </p>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <p className="font-medium">Payment Method</p>
                                    <p className="text-sm">{order.paymentMethod}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="font-medium">Payment Status</p>
                                    <p className="text-sm">{order.paymentStatus}</p>
                                    {order.paidAt && (
                                      <p className="text-xs text-gray-600">
                                        Paid on: {new Date(order.paidAt).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                  
                                  {hasProcessingAlert && (
                                    <div className="bg-yellow-50 p-3 rounded-md">
                                      <p className="font-medium text-yellow-800">Processing Alert</p>
                                      <p className="text-sm text-yellow-700">
                                        This order has been in processing status for {processingAlerts[order._id].hours} hours and {processingAlerts[order._id].minutes} minutes.
                                      </p>
                                    </div>
                                  )}
                                  
                                  {order.isDelivered && order.deliveredAt && (
                                    <div>
                                      <p className="font-medium">Delivered On</p>
                                      <p className="text-sm">{new Date(order.deliveredAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-lg font-medium">No orders found</p>
                      <p className="text-sm mt-2">
                        {filterStatus === 'all' ? 'No orders have been placed yet' : `No ${filterStatus} orders found`}
                        {searchTerm && ` matching "${searchTerm}"`}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      {filteredOrders && filteredOrders.length > 0 && (
        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
              {filterStatus !== 'all' && ` (filtered by ${filterStatus})`}
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              Total Value: LKR {filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;