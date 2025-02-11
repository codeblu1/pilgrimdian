'use client'
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
};

export default function PayPalProvider({ children }) {
    return (
        <PayPalScriptProvider options={initialOptions}>
            {children}
        </PayPalScriptProvider>
    );
}
