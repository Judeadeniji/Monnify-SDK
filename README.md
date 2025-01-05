# Monnify SDK TypeScript

A TypeScript implementation of the Monnify Payment Gateway SDK for seamless integration of payment services into web applications.

## Features

- 🎯 Full TypeScript support with comprehensive type definitions
- 🔒 Secure payment processing
- 🌐 Support for both sandbox and production environments
- ⚡ Lightweight and efficient implementation
- 🎨 Customizable UI elements
- 🔄 Comprehensive payment lifecycle management

## Installation

```bash
npm install monnify-sdk
```

Or using yarn:

```bash
yarn add monnify-sdk
```

## Quick Start

```typescript
import MonnifySDK from 'monnify-sdk';

MonnifySDK.initialize({
  amount: 1000,
  currency: 'NGN',
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  paymentDescription: 'Payment for Product XYZ',
  contractCode: 'YOUR_CONTRACT_CODE',
  apiKey: 'YOUR_API_KEY',
  onComplete: (response) => {
    console.log('Payment completed:', response);
  },
  onClose: (response) => {
    console.log('Payment window closed:', response);
  }
});
```

## Configuration Options

### PaymentConfig Interface

```typescript
interface PaymentConfig {
  apiKey: string;                    // Your Monnify API key
  contractCode: string;              // Your contract code
  amount: number;                    // Amount to be paid
  currency: string;                  // Currency code (e.g., 'NGN')
  reference?: string;                // Optional unique reference
  customerEmail: string;             // Customer's email address
  customerName?: string;             // Optional customer name
  paymentDescription: string;        // Description of the payment
  redirectUrl?: string;              // Optional redirect URL after payment
  metadata?: Record<string, any>;    // Optional additional data
  paymentMethods?: string[];        // Optional allowed payment methods
  showLoadingState?: boolean;        // Optional loading state visibility
  onClose?: (response: PaymentResponse) => void;      // Close callback
  onComplete?: (response: PaymentResponse) => void;   // Completion callback
  onLoadStart?: () => void;          // Load start callback
  onLoadComplete?: () => void;       // Load complete callback
}
```

### PaymentResponse Interface

```typescript
interface PaymentResponse {
  redirectUrl?: string;
  responseCode?: string;
  paymentStatus?: string;
  responseMessage?: string;
  authorizedAmount?: number;
  status?: string;
  paidOn?: string;
  payableAmount?: number;
  completedOn?: string;
}
```

## Environment Support

The SDK automatically detects the environment based on your API key:

- API keys starting with `MK_PROD_` are routed to the production environment
- All other API keys are routed to the sandbox environment

## Event Callbacks

### onComplete

Triggered when a payment is completed (successful or failed):

```typescript
MonnifySDK.initialize({
  // ... other config
  onComplete: (response) => {
    if (response.status === 'SUCCESS') {
      // Handle successful payment
    } else {
      // Handle failed payment
    }
  }
});
```

### onClose

Triggered when the payment modal is closed:

```typescript
MonnifySDK.initialize({
  // ... other config
  onClose: (response) => {
    // Handle modal close
    console.log('Payment window closed:', response.responseMessage);
  }
});
```

## Transaction Status Types

The SDK defines several transaction status types:

```typescript
enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  OVERPAID = 'OVERPAID'
}
```

## Error Handling

The SDK includes comprehensive validation and error handling:

```typescript
MonnifySDK.initialize({
  // Invalid config
  amount: -1000,
  customerEmail: 'invalid-email',
  // ... other config
}); // Will log appropriate error messages to console
```

## Security Considerations

1. Never expose your API keys in client-side code
2. Always validate payment responses server-side
3. Use HTTPS for all API calls
4. Implement proper error handling for failed payments

## Development Mode

To use the sandbox environment for testing:

```typescript
MonnifySDK.initialize({
  apiKey: 'MK_TEST_XXXXXXXXXX',
  // ... other config
});
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11+ (with appropriate polyfills)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please email <support@monnify.com> or visit [Monnify Documentation](https://developers.monnify.com/docs/)
