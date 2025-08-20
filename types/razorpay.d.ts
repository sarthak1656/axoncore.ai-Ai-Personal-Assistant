declare module "razorpay" {
  interface RazorpayOptions {
    key_id: string;
    key_secret: string;
  }

  interface SubscriptionCreateOptions {
    plan_id: string;
    customer_notify?: number;
    total_count?: number;
    notes?: Record<string, any>;
  }

  interface SubscriptionCancelOptions {
    cancel_at_cycle_end?: number;
  }

  interface RazorpayInstance {
    subscriptions: {
      create(options: SubscriptionCreateOptions): Promise<any>;
      cancel(
        subscriptionId: string,
        options?: SubscriptionCancelOptions
      ): Promise<any>;
      fetch(subscriptionId: string): Promise<any>;
    };
    payments: {
      fetch(paymentId: string): Promise<any>;
    };
  }

  class Razorpay {
    constructor(options: RazorpayOptions);
    subscriptions: RazorpayInstance["subscriptions"];
    payments: RazorpayInstance["payments"];
  }

  export = Razorpay;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
