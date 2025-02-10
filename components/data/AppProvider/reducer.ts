import type { Order, PaymentMethod, ShippingMethod } from "@commercelayer/sdk"

import type { AppStateData } from "components/data/AppProvider"
import {
  checkPaymentMethod,
  creditCardPayment,
  hasShippingMethodSet,
  prepareShipments,
} from "components/data/AppProvider/utils"

export enum ActionType {
  START_LOADING = "START_LOADING",
  STOP_LOADING = "STOP_LOADING",
  SET_ORDER = "SET_ORDER",
  SET_CUSTOMER_EMAIL = "SET_CUSTOMER_EMAIL",
  SET_ADDRESSES = "SET_ADDRESSES",
  SELECT_SHIPMENT = "SELECT_SHIPMENT",
  SAVE_SHIPMENTS = "SAVE_SHIPMENTS",
  SET_PAYMENT = "SET_PAYMENT",
  CHANGE_COUPON_OR_GIFTCARD = "CHANGE_COUPON_OR_GIFTCARD",
  PLACE_ORDER = "PLACE_ORDER",
}

export type Action =
  | { type: ActionType.START_LOADING }
  | { type: ActionType.STOP_LOADING }
  | {
      type: ActionType.SET_ORDER
      payload: {
        order: Order
        others: Partial<AppStateData>
      }
    }
  | {
      type: ActionType.SET_CUSTOMER_EMAIL
      payload: {
        customerEmail?: string
      }
    }
  | {
      type: ActionType.SET_ADDRESSES
      payload: {
        order: Order
        others: Partial<AppStateData>
      }
    }
  | {
      type: ActionType.SELECT_SHIPMENT
      payload: {
        order: Order
        others: Partial<AppStateData>
        shipment: {
          shipmentId: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          shippingMethod: ShippingMethod | Record<string, any>
        }
      }
    }
  | {
      type: ActionType.SAVE_SHIPMENTS
      payload: {
        order: Order
        others: Partial<AppStateData>
      }
    }
  | {
      type: ActionType.SET_PAYMENT
      payload: {
        payment: NullableType<PaymentMethod>
        order: Order
        others: Partial<AppStateData>
      }
    }
  | {
      type: ActionType.CHANGE_COUPON_OR_GIFTCARD
      payload: {
        order: Order
        others: Partial<AppStateData>
      }
    }
  | {
      type: ActionType.PLACE_ORDER
      payload: {
        order: Order
      }
    }

export function reducer(state: AppStateData, action: Action): AppStateData {
  switch (action.type) {
    case ActionType.START_LOADING:
      return {
        ...state,
        isLoading: true,
      }
    case ActionType.STOP_LOADING:
      return {
        ...state,
        isLoading: false,
      }
    case ActionType.SET_ORDER:
      return {
        ...state,
        order: action.payload.order,
        // FIX saving customerAddresses because we don't receive
        // them from fetchORder
        customerAddresses:
          action.payload.order.customer?.customer_addresses ||
          state.customerAddresses,
        ...action.payload.others,
        isFirstLoading: false,
        isLoading: false,
      }
    case ActionType.SET_CUSTOMER_EMAIL:
      return {
        ...state,
        emailAddress: action.payload.customerEmail,
        hasEmailAddress: Boolean(action.payload.customerEmail),
        isLoading: false,
      }
    case ActionType.SET_ADDRESSES: {
      const preparedShipments: ShipmentSelected[] = prepareShipments(
        action.payload.order.shipments,
      )

      let { hasShippingMethod } = hasShippingMethodSet(preparedShipments)
      if (!state.isShipmentRequired) {
        hasShippingMethod = true
      }
      return {
        ...state,
        order: action.payload.order,
        shipments: preparedShipments,
        ...action.payload.others,
        hasShippingMethod,
        isLoading: false,
      }
    }
    case ActionType.CHANGE_COUPON_OR_GIFTCARD:
      return {
        ...state,
        order: action.payload.order,
        ...action.payload.others,
        isLoading: false,
        paymentMethod: undefined,
        isCreditCard: false,
        hasPaymentMethod: false,
      }
    case ActionType.SELECT_SHIPMENT: {
      return {
        ...state,
        order: action.payload.order,
        ...action.payload.others,
        isLoading: false,
      }
    }
    case ActionType.SAVE_SHIPMENTS:
      return {
        ...state,
        order: action.payload.order,
        ...action.payload.others,
        isLoading: false,
      }
    case ActionType.SET_PAYMENT:
      return {
        ...state,
        order: action.payload.order,
        ...action.payload.others,
        isLoading: false,
        isCreditCard: creditCardPayment(action.payload.payment),
        paymentMethod: action.payload.payment,
      }
    case ActionType.PLACE_ORDER: {
      return {
        ...state,
        ...checkPaymentMethod(action.payload.order),
        isLoading: false,
      }
    }
    default:
      throw new Error("Unknown action type")
  }
}
