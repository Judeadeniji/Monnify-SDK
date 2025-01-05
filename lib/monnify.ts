// Types and Interfaces
interface MonnifyConfig {
  apiKey: string;
  contractCode: string;
  compatibilityMode?: boolean;
}

interface PaymentConfig extends MonnifyConfig {
  amount: number;
  currency: string;
  reference?: string;
  customerEmail: string;
  customerName?: string;
  paymentDescription: string;
  redirectUrl?: string;
  metadata?: Record<string, any>;
  paymentMethods?: string[];
  collectionChannel?: string;
  incomeSplitConfig?: any;
  showLoadingState?: boolean;
  onClose?: (response: PaymentResponse) => void;
  onComplete?: (response: PaymentResponse) => void;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
}

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

enum MessageType {
  CLOSE = "MonnifyPopupClose",
  COMPLETE = "MonnifyPopupComplete",
  LOADED = "MonnifyPopupLoaded",
  CANCEL = "MonnifyPopupCancel",
  INIT_POPUP = "INIT_POPUP",
  TRANSACTION_SUCCESS = "TRANSACTION_SUCCESS",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
}

enum TransactionStatus {
  SUCCESS = "SUCCESS",
  PAID = "PAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  OVERPAID = "OVERPAID",
}

// Constants
const SELECTORS = {
  StageId: "MonnifyFrame",
  StageName: "MonnifyFrame",
  PaymentFormName: "MonnifyPaymentForm",
  StyleId: "MonnifyStyles",
  PreLoaderId: "MonnifyPreLoader",
  LoadedMessageType: "MonnifyPopupLoaded",
  ClosePopupMessageType: "MonnifyPopupClose",
  TransactionCompletedMessageType: "MonnifyPopupComplete",
  AttributePrefix: "data-monnify-",
  MonnifyButtonIdentifier: "monnify-payment-buttons",
};

// Helper functions
const isSandbox = (config: MonnifyConfig): boolean => {
  return !config?.apiKey?.includes("MK_PROD_");
};

const getBaseUrls = (config: MonnifyConfig) => {
  const sandbox = isSandbox(config);
  const compatMode = config.compatibilityMode;

  if (sandbox) {
    return {
      APP_URL: compatMode
        ? "https://sandbox.sdk.monnify.com/compatibility-mode"
        : "https://sandbox.sdk.monnify.com",
      APP_ORIGIN: "https://sandbox.monnify.com",
    };
  }

  return {
    APP_URL: compatMode
      ? "https://sdk.monnify.com/compatibility-mode"
      : "https://sdk.monnify.com",
    APP_ORIGIN: "https://api.monnify.com",
  };
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isPlainObject = (obj: any): boolean => {
  return obj !== null && typeof obj === "object" && !Array.isArray(obj);
};

const generateReference = (config: MonnifyConfig): string => {
  const prefix = `MNFY|PAYREF|${isSandbox(config) ? "TEST|" : ""}`;
  return `${prefix}GENERATED|${Date.now()}${Math.floor(
    Math.random() * 1000000 + 1
  )}`;
};

const css = (strings: TemplateStringsArray, ...values: any[]): string => {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (values[i] || "");
  });
  return str;
};

class MonnifySDK {
  private static instance: MonnifySDK;
  private constructor() {}

  static getInstance(): MonnifySDK {
    if (!MonnifySDK.instance) {
      MonnifySDK.instance = new MonnifySDK();
    }
    return MonnifySDK.instance;
  }

  private validatePaymentConfig(config: PaymentConfig): {
    status: boolean;
    reason?: string;
  } {
    if (!config) return { status: false, reason: "Invalid Payment Data." };
    if (!config.customerEmail || !validateEmail(config.customerEmail)) {
      return {
        status: false,
        reason: "Customer email not provided or invalid",
      };
    }
    if (!config.amount || isNaN(config.amount)) {
      return { status: false, reason: "Invalid Amount." };
    }
    if (!config.currency?.trim()) {
      return { status: false, reason: "Currency is required." };
    }
    if (!config.paymentDescription?.trim()) {
      return { status: false, reason: "Payment description is required." };
    }
    if (!config.contractCode) {
      return { status: false, reason: "Invalid Contract Code" };
    }
    if (!config.apiKey) {
      return { status: false, reason: "Invalid API Key" };
    }
    if (config.metadata && !isPlainObject(config.metadata)) {
      return { status: false, reason: "Invalid metadata." };
    }

    return { status: true };
  }

  private injectStyles(): void {
    const styles = css`
      .monnify-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        /* Moniepoint devs LOL */
        /* z-index: 1000002920290930192028202832830832083038392082038032830283; */
        z-index: 999999999;
      }
      #MonnifyFrame,
      #MonnifyPreLoader,
      .monnify-frame {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2147483647;
        margin: 0;
        padding: 0;
        border: none;
        outline: 0;
      }
      .hide {
        display: none;
        visibility: hidden;
      }
      .show {
        display: block;
        visibility: visible;
      }
      #MonnifyPreLoader,
      .monnify-frame {
        background: rgba(52, 52, 52);
        text-align: center;
        transition-property: visibility, display;
        transition-duration: 0.6s;
        transition-timing-function: ease-in-out;
      }
      #MonnifyPreLoader .lds-spinner,
      .monnify-frame .lds-spinner {
        top: 50%;
        margin-top: -40px;
      }
      .lds-spinner {
        color: #fff;
        display: inline-block;
        position: relative;
        width: 64px;
        height: 64px;
      }
      .lds-spinner div {
        transform-origin: 32px 32px;
        animation: lds-spinner 1.2s linear infinite;
      }
      .lds-spinner div:after {
        content: " ";
        display: block;
        position: absolute;
        top: 3px;
        left: 29px;
        width: 5px;
        height: 14px;
        border-radius: 20%;
        background: #fff;
      }
      .lds-spinner div:nth-child(1) {
        transform: rotate(0);
        animation-delay: -1.1s;
      }
      .lds-spinner div:nth-child(2) {
        transform: rotate(30deg);
        animation-delay: -1s;
      }
      .lds-spinner div:nth-child(3) {
        transform: rotate(60deg);
        animation-delay: -0.9s;
      }
      .lds-spinner div:nth-child(4) {
        transform: rotate(90deg);
        animation-delay: -0.8s;
      }
      .lds-spinner div:nth-child(5) {
        transform: rotate(120deg);
        animation-delay: -0.7s;
      }
      .lds-spinner div:nth-child(6) {
        transform: rotate(150deg);
        animation-delay: -0.6s;
      }
      .lds-spinner div:nth-child(7) {
        transform: rotate(180deg);
        animation-delay: -0.5s;
      }
      .lds-spinner div:nth-child(8) {
        transform: rotate(210deg);
        animation-delay: -0.4s;
      }
      .lds-spinner div:nth-child(9) {
        transform: rotate(240deg);
        animation-delay: -0.3s;
      }
      .lds-spinner div:nth-child(10) {
        transform: rotate(270deg);
        animation-delay: -0.2s;
      }
      .lds-spinner div:nth-child(11) {
        transform: rotate(300deg);
        animation-delay: -0.1s;
      }
      .lds-spinner div:nth-child(12) {
        transform: rotate(330deg);
        animation-delay: 0s;
      }
      @keyframes lds-spinner {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
      body {
        margin: 0;
        padding: 0;
      }
    `;

    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.id = SELECTORS.StyleId;
    styleElement.appendChild(document.createTextNode(styles));
    document.head.appendChild(styleElement);
  }

  initialize(config: PaymentConfig): void {
    const validation = this.validatePaymentConfig(config);
    if (!validation.status) {
      console.error(validation.reason);
      return;
    }

    const finalConfig: PaymentConfig = {
      ...config,
      reference: config.reference || generateReference(config),
      showLoadingState: config.showLoadingState ?? true,
    };

    this.injectStyles();
    this.createPaymentIframe(finalConfig);
  }

  private createPaymentIframe(config: PaymentConfig): void {
    const wrapper = document.createElement("div");
    wrapper.id = "monnify_app_wrapper";
    wrapper.className = "monnify-wrapper";

    const iframe = document.createElement("iframe");
    iframe.setAttribute("width", "100%");
    iframe.setAttribute("height", "100%");
    iframe.setAttribute("allow", "geolocation;clipboard-write");
    iframe.setAttribute("style", "border:0px !important;");
    iframe.className = "monnify-frame";

    const paymentData = {
      ...config,
      otherPaymentData: {
        httpBrowserLanguage: "en-US",
        httpBrowserJavaEnabled: false,
        httpBrowserJavaScriptEnabled: "true",
        httpBrowserColorDepth: "24",
        httpBrowserScreenHeight: window.innerHeight.toString(),
        httpBrowserScreenWidth: window.innerWidth.toString(),
        httpBrowserTimeDifference: "",
        userAgentBrowserValue: navigator.userAgent,
      },
    };

    this.setupIframeEventListeners(iframe, paymentData, config);
    wrapper.appendChild(iframe);
    document.body.appendChild(wrapper);

    // Initialize payment
    const baseUrls = getBaseUrls(config);
    fetch(`${baseUrls.APP_URL}/app/transaction/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })
      .then((response) => response.json())
      .then((data) => {
        iframe.setAttribute(
          "src",
          `${baseUrls.APP_URL}/checkout/${data.data.paymentData.transactionReference}`
        );
      })
      .catch(() => {
        iframe.setAttribute(
          "src",
          isSandbox(config)
            ? "https://sandbox.sdk.monnify.com"
            : "https://sdk.monnify.com"
        );
      });
  }

  private setupIframeEventListeners(
    iframe: HTMLIFrameElement,
    paymentData: any,
    config: PaymentConfig
  ): void {
    iframe.onload = () => {
      config.onLoadComplete?.();

      iframe.contentWindow?.postMessage(
        {
          type: MessageType.INIT_POPUP,
          data: paymentData,
        },
        "*"
      );

      window.addEventListener("message", (event) => {
        const response = event.data;
        const paymentResponse = this.formatPaymentResponse(
          response?.data,
          paymentData
        );

        switch (response.type) {
          case MessageType.CANCEL:
          case MessageType.CLOSE:
            this.handleClose(config, paymentResponse);
            break;
          case MessageType.TRANSACTION_SUCCESS:
            this.handleSuccess(config, paymentResponse);
            break;
          case MessageType.TRANSACTION_FAILED:
            this.handleFailure(config, paymentResponse);
            break;
        }
      });
    };
  }

  private formatPaymentResponse(data: any, paymentData: any): PaymentResponse {
    return {
      ...data,
      authorizedAmount: data?.payableAmount || data?.authorizedAmount,
      paidOn: data?.completedOn,
      redirectUrl: paymentData.redirectUrl,
      status: this.getTransactionStatus(data?.paymentStatus || data?.status),
    };
  }

  private getTransactionStatus(status?: string): string {
    if (!status) return "FAILED";
    const successStatuses = [
      TransactionStatus.SUCCESS,
      TransactionStatus.PAID,
      TransactionStatus.OVERPAID,
      TransactionStatus.PARTIALLY_PAID,
    ];
    return successStatuses.includes(status.toUpperCase() as TransactionStatus)
      ? "SUCCESS"
      : "FAILED";
  }

  private handleClose(config: PaymentConfig, response: PaymentResponse): void {
    document.getElementById("monnify_app_wrapper")?.remove();
    config.onClose?.({
      ...response,
      responseCode: "USER_CANCELLED",
      paymentStatus: "USER_CANCELLED",
      responseMessage: "User cancelled Transaction",
    });
  }

  private handleSuccess(
    config: PaymentConfig,
    response: PaymentResponse
  ): void {
    document.getElementById("monnify_app_wrapper")?.remove();
    config.onComplete?.(response);
    config.onClose?.(response);
  }

  private handleFailure(
    config: PaymentConfig,
    response: PaymentResponse
  ): void {
    document.getElementById("monnify_app_wrapper")?.remove();
    config.onComplete?.(response);
    config.onClose?.(response);
  }
}

export type { MonnifySDK, MessageType, MonnifyConfig, PaymentConfig, PaymentResponse };

export default MonnifySDK.getInstance();
