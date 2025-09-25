// components/SupplierTable.jsx
import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import EditSupplierForm from './EditSupplierForm';

const SupplierTable = ({ suppliers, loading, onUpdate }) => {
  const [editingSupplier, setEditingSupplier] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const response = await fetch(`${API_ENDPOINTS.SUPPLIERS}/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          onUpdate();
          alert('Supplier deleted successfully');
        } else {
          alert('Error deleting supplier');
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Error deleting supplier');
      }
    }
  };

  const handleResendEmail = async (supplier) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SUPPLIERS}/${supplier._id}/resend-email`, {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        alert('Email sent successfully!');
        onUpdate();
      } else {
        alert(data.message || 'Error sending email');
      }
    } catch (error) {
      console.error('Error resending email:', error);
      alert('Error sending email');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading suppliers...</div>;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{supplier.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{supplier.product}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{supplier.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    supplier.emailSent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {supplier.emailSent ? 'Email Sent' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => setEditingSupplier(supplier)}
                      className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                      title="Edit supplier"
                    >
                      ✏️ Edit
                    </button>
                    
                    {/* Resend Email Button */}
                    <button
                      onClick={() => handleResendEmail(supplier)}
                      className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                      title="Resend welcome email"
                    >
                      ↪️ Resend
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(supplier._id)}
                      className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                      title="Delete supplier"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {suppliers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No suppliers found. Add your first supplier above.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingSupplier && (
        <EditSupplierForm
          supplier={editingSupplier}
          onClose={() => setEditingSupplier(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
};

export default SupplierTable;