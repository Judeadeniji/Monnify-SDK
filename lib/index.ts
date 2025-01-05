import monnify from "./monnify";
import type {
  MonnifyConfig,
  PaymentConfig,
  PaymentResponse,
  MessageType,
  MonnifySDK,
} from "./monnify";

export { monnify as MonnifySDK };

export type {
  MonnifyConfig,
  PaymentConfig,
  PaymentResponse,
  MessageType,
  MonnifySDK as TMonnifySDK,
};

export default monnify;
