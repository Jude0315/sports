import React, { useState } from 'react';
import { RiDeleteBin3Line } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { updateCartItemQuantity, removeFromCart } from '../../redux/slices/cartSlice';

const CartContents = () => {
  const dispatch = useDispatch();
  const { cart, loading, error } = useSelector(state => state.cart);
  const { user, guestId } = useSelector(state => state.auth);
  const [localLoading, setLocalLoading] = useState({});
  const [localErrors, setLocalErrors] = useState({});

  const userId = user?._id || null;

  // Handle adding or subtracting from cart
  // In CartContents.jsx, add debug logs:
const handleAddToCart = async (productId, delta, currentQuantity, size, color) => {
  console.log('🔄 Updating quantity:', {
    productId,
    delta,
    currentQuantity,
    size,
    color,
    newQuantity: currentQuantity + delta
  });

  // Log the current cart state to see what's actually there
  console.log('📦 Current cart products:', cart.products);
  console.log('🔍 Looking for item:', { productId, size, color });

  const itemExists = cart.products.some(item => 
    item.productId === productId && item.size === size && item.color === color
  );
  console.log('✅ Item exists in cart:', itemExists);

  const newQuantity = currentQuantity + delta;
  const itemKey = `${productId}-${size}-${color}`;
  
  if (newQuantity >= 1) {
    setLocalLoading(prev => ({ ...prev, [itemKey]: true }));
    setLocalErrors(prev => ({ ...prev, [itemKey]: null }));
    
    try {
      const result = await dispatch(
        updateCartItemQuantity({
          productId,
          quantity: newQuantity,
          guestId,
          userId,
          size,
          color,
        })
      ).unwrap();
      
      console.log('✅ Update successful:', result);
    } catch (error) {
      console.error('❌ Update failed:', error);
      setLocalErrors(prev => ({ 
        ...prev, 
        [itemKey]: error.message || "Failed to update quantity" 
      }));
    } finally {
      setLocalLoading(prev => ({ ...prev, [itemKey]: false }));
    }
  }
};

  const handleRemoveFromCart = async (productId, size, color) => {
    const itemKey = `${productId}-${size}-${color}`;
    
    setLocalLoading(prev => ({ ...prev, [itemKey]: true }));
    setLocalErrors(prev => ({ ...prev, [itemKey]: null }));
    
    try {
        await dispatch(
            removeFromCart({ productId, size, color })
        ).unwrap();
    } catch (error) {
        console.error('Failed to remove item:', error);
        setLocalErrors(prev => ({ 
            ...prev, 
            [itemKey]: "Failed to remove item. Please try again." 
        }));
    } finally {
        setLocalLoading(prev => ({ ...prev, [itemKey]: false }));
    }
};

  if (!cart.products || cart.products.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium text-gray-600">
          Your cart is empty
        </h3>
        <p className="text-gray-500 mt-2">
          Add some items to your cart to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {cart.products.map((product) => {
        const itemKey = `${product.productId}-${product.size}-${product.color}`;
        const isLoading = localLoading[itemKey];
        const itemError = localErrors[itemKey];
        
        return (
          <div key={itemKey} className="flex items-start justify-between py-4 border-b">
            {/* Product Image */}
            <div className="flex items-start gap-4 w-full">
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 object-cover rounded"
              />

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="text-md font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">Size: {product.size}</p>
                {product.color && (
                  <p className="text-sm text-gray-600">Color: {product.color}</p>
                )}
                <p className="text-sm font-medium text-green-700">
                  ${(product.price * product.quantity).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  ${product.price.toLocaleString()} each
                </p>
                
                {itemError && (
                  <p className="text-red-500 text-xs mt-1">{itemError}</p>
                )}

                <div className="flex items-center mt-2">
                  <button
                    onClick={() =>
                      handleAddToCart(
                        product.productId,
                        -1,
                        product.quantity,
                        product.size,
                        product.color
                      )
                    }
                    disabled={isLoading || product.quantity <= 1}
                    className="border rounded px-2 py-1 text-xl font-medium disabled:opacity-50"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="mx-4 w-6 text-center">
                    {isLoading ? '...' : product.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleAddToCart(
                        product.productId,
                        1,
                        product.quantity,
                        product.size,
                        product.color
                      )
                    }
                    disabled={isLoading}
                    className="border rounded px-2 py-1 text-xl font-medium disabled:opacity-50"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() =>
                  handleRemoveFromCart(
                    product.productId,
                    product.size,
                    product.color
                  )
                }
                disabled={isLoading}
                className="p-2 disabled:opacity-50 self-start"
                aria-label="Remove item from cart"
              >
                <RiDeleteBin3Line className="h-6 w-6 text-red-600" />
              </button>
            </div>
          </div>
        );
      })}
      
      {/* Cart Summary */}
      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span>${cart.totalPrice?.toLocaleString() || '0.00'}</span>
        </div>
      </div>

      
      {/* Debug Info */} 
     {/* <div className="mt-4 p-2 bg-gray-100 text-xs">
        <p>User ID: {userId || 'None'}</p>
        <p>Guest ID: {guestId || 'None'}</p>
        <p>Backend URL: {import.meta.env.VITE_BACKEND_URL}</p>
      </div> */}
    </div>
  );
};

export default CartContents;