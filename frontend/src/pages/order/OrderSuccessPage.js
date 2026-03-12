// src/pages/order/OrderSuccessPage.js

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { paymentService } from '../../api/services';
import { CheckCircle, Package } from 'lucide-react';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) { setLoading(false); return; }
      try {
        await paymentService.verifyPayment(sessionId);
        setVerified(true);
      } catch {
        setVerified(false);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [sessionId]);

  if (loading) return (
    <div className="text-center py-20 text-gray-400">Confirming your payment...</div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-800 mb-3">Order Confirmed!</h1>
      <p className="text-gray-500 mb-2">
        {verified
          ? 'Your payment was successful and your order is being processed.'
          : 'Thank you for your order! We\'re processing your payment.'}
      </p>
      {orderId && (
        <p className="text-sm text-gray-400 mb-8">Order #{orderId}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/dashboard" className="btn-primary flex items-center justify-center gap-2">
          <Package size={18} /> View My Orders
        </Link>
        <Link to="/products" className="btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
