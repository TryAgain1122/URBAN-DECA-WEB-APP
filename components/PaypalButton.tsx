//@ts-nocheck
import { 
    FUNDING, 
    PayPalScriptProvider, 
    PayPalButtons 
} from "@paypal/react-paypal-js";

interface PaypalButtonProps {
    amount: number; // Changed `Number` to `number` for TypeScript correctness
    onSuccess: (details: any) => void;
    currency?: string; // Optional currency prop
}

const PaypalButton = ({ amount, onSuccess, currency = "PHP" }: PaypalButtonProps) => {
    return (
        <PayPalScriptProvider
            options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, // Use `NEXT_PUBLIC_` prefix for Next.js env vars
                currency,
            }}
        >
            <PayPalButtons
                fundingSource={FUNDING.PAYPAL}
                style={{
                    layout: "vertical", // Customizable layout
                    color: "blue",
                    shape: "rect",
                    label: "paypal",
                }}
                createOrder={(data, actions) => {
                    return actions.order.create({
                        purchase_units: [
                            {
                                amount: {
                                    value: amount.toFixed(2), // Ensure the amount is in proper decimal format
                                },
                            },
                        ],
                    });
                }}
                onApprove={(data, actions) => {
                    return actions.order.capture().then((details) => {
                        onSuccess(details); // Call the onSuccess callback with payment details
                    });
                }}
                onError={(err) => {
                    console.error("PayPal Button Error:", err); // Log errors for debugging
                }}
            />
        </PayPalScriptProvider>
    );
};

export default PaypalButton;
