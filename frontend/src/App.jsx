import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import UserLayout from "./components/Layout/UserLayout";
import Home from "./pages/Home"; //  Make sure this path is correct
import { Toaster } from 'sonner';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CollectionPage from './pages/CollectionPage';
import ProductDetails from './components/Products/ProductDetails';
import Checkout from './components/Cart/Checkout';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminLayout from './components/Admin/AdminLayout';
import AdminHomePage from './pages/AdminHomePage';
import UserManagement from './components/Admin/UserManagement';
import ProductManagement from './components/Admin/ProductManagement';
import EditProductPage from './components/Admin/EditProductPage';
import OrderManagement from './components/Admin/OrderManagement';

import {Provider} from "react-redux";
import store from "./redux/store";
import ProtectedRoute from './components/Common/ProtectedRoute';

import AddProductPage from './components/Admin/AddProductPage';
import SupplierManagement from './components/Admin/SupplierManagement';

import QuickFeatures from './components/Admin/QuickFeatures';

import AdminFeedbackList from './components/Admin/AdminFeedbackList';

import FeedbackForm from './components/Feedback/FeedbackForm';
// Import the Feedback component

import Payments from "./components/Admin/Payments";

const App = () => {
  return (
    <Provider store={store}>
    <BrowserRouter>
    <Toaster position='top-right'/>
      <Routes>
        {/* User Layout */}
        <Route path='/' element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login/>}/>

          <Route path="register" element={<Register/>}/>
          <Route path="profile" element={<Profile/>}/>
          <Route path="collections/:collection" element={<CollectionPage/>}/>
          <Route path='product/:id' element={<ProductDetails/>}/>

          <Route path='order-confirmation' element={<OrderConfirmationPage/>}/>
          
          
<Route path="checkout" element={<Checkout/>}/>

<Route path="orders/:id" element={<OrderDetailsPage/>}/>
 <Route path="my-orders" element={<MyOrdersPage/>}/>

  {/* ADD FEEDBACK ROUTE HERE (User accessible) */}
            <Route path="feedback" element={<FeedbackForm />} />
 {/* Add Feedback Route */}
          
 
</Route>


        <Route path='/admin' element={
          <ProtectedRoute role="admin" >
            <AdminLayout/>
            </ProtectedRoute>}>

  <Route index element={<AdminHomePage />} />
  <Route path="users" element={<UserManagement/>}/>
   <Route path="products" element={<ProductManagement/>}/>
      <Route path="products/:id/edit" element={<EditProductPage/>}/>
      <Route path="orders" element={<OrderManagement/>}/>

<Route path="products/add" element={<AddProductPage/>}/>
// Add to your routes
<Route path="/admin/suppliers" element={<SupplierManagement />} />

<Route path="/admin/quick-features" element={<QuickFeatures />} />


<Route path="feedbacks" element={<AdminFeedbackList />} />
  
  <Route path="payments" element={<Payments />} />
  </Route>


        {/* Admin Layout (placeholder) */}
        {/* <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route> */}
        
      </Routes>
    </BrowserRouter>
    </Provider>
  );
};

export default App;
