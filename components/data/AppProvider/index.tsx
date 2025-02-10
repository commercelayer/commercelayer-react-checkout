import {
  CommerceLayer,
  type Order,
  type PaymentMethod,
  type ShippingMethod as ShippingMethodCollection,
} from "@commercelayer/sdk"
import { changeLanguage } from "i18next"
import { createContext, useEffect, useReducer, useRef, useState } from "react"

import { ActionType, reducer } from "components/data/AppProvider/reducer"
import {
  type FetchOrderByIdResponse,
  calculateSettings,
  checkAndSetDefaultAddressForOrder,
  fetchOrder,
} from "components/data/AppProvider/utils"

export interface AppProviderData extends FetchOrderByIdResponse {
  isLoading: boolean
  orderId: string
  order: NullableType<Order>
  accessToken: string
  isGuest: boolean
  slug: string
  domain: string
  isFirstLoading: boolean
  getOrder: (order: Order) => void
  getOrderFromRef: () => Promise<Order>
  setCustomerEmail: (email: string) => void
  setAddresses: (order?: Order) => Promise<void>
  setCouponOrGiftCard: () => Promise<void>
  saveShipments: () => Promise<Order>
  placeOrder: (order?: Order) => Promise<void>
  setPayment: (params: { payment?: PaymentMethod; order?: Order }) => void
  selectShipment: (params: {
    shippingMethod: {
      id: string
    }
    shipmentId: string
    order?: Order
  }) => Promise<void>
  autoSelectShippingMethod: (order?: Order) => Promise<Order>
}

export interface AppStateData extends FetchOrderByIdResponse {
  order?: Order
  isLoading: boolean
  isFirstLoading: boolean
}

const initialState: AppStateData = {
  order: undefined,
  isLoading: true,
  isFirstLoading: true,
  isGuest: false,
  hasCustomerAddresses: false,
  isUsingNewBillingAddress: true,
  isUsingNewShippingAddress: true,
  hasSameAddresses: false,
  hasEmailAddress: false,
  emailAddress: "",
  hasBillingAddress: false,
  billingAddress: undefined,
  requiresBillingInfo: false,
  isShipmentRequired: true,
  shippingAddress: undefined,
  hasShippingMethod: false,
  hasShippingAddress: false,
  shipments: [],
  customerAddresses: [],
  paymentMethod: undefined,
  hasPaymentMethod: false,
  isPaymentRequired: true,
  isCreditCard: false,
  shippingCountryCodeLock: "",
  isComplete: false,
  returnUrl: "",
  cartUrl: undefined,
  taxIncluded: false,
  shippingMethodName: undefined,
  hasSubscriptions: false,
}

export const AppContext = createContext<AppProviderData | null>(null)

interface AppProviderProps {
  domain: string
  slug: string
  orderId: string
  isGuest: boolean
  isShipmentRequired: boolean
  accessToken: string
  children?: ChildrenType
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  orderId,
  isGuest,
  isShipmentRequired,
  accessToken,
  slug,
  domain,
}) => {
  const orderRef = useRef<Order>()
  const [state, dispatch] = useReducer(reducer, { ...initialState, isGuest })
  const [order, setOrder] = useState<NullableType<Order>>()

  const cl = CommerceLayer({
    organization: slug,
    accessToken,
    domain,
  })

  const getOrder = (order: Order) => {
    orderRef.current = order
    setOrder(order)
  }

  const fetchInitialOrder = async (orderId?: string, accessToken?: string) => {
    if (!orderId || !accessToken) {
      return
    }
    dispatch({ type: ActionType.START_LOADING })
    const order = await getOrderFromRef()

    const addressInfos = await checkAndSetDefaultAddressForOrder({
      cl,
      order,
    })

    const others = calculateSettings(
      order,
      isShipmentRequired,
      isGuest,
      undefined,
    )

    dispatch({
      type: ActionType.SET_ORDER,
      payload: {
        order,
        others: {
          isShipmentRequired,
          ...others,
          ...addressInfos,
        },
      },
    })

    await changeLanguage(order.language_code ?? "en")
  }

  const setCustomerEmail = (email: string) => {
    dispatch({
      type: ActionType.SET_CUSTOMER_EMAIL,
      payload: { customerEmail: email },
    })
  }

  const setAddresses = async (order?: Order) => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = order ?? (await getOrderFromRef())

    const others = calculateSettings(
      currentOrder,
      isShipmentRequired,
      // FIX We are using customer addresses saved in reducer because
      // we don't receive them from fetchOrder
      isGuest,
      state.customerAddresses,
    )
    setTimeout(() => {
      dispatch({
        type: ActionType.SET_ADDRESSES,
        payload: {
          order: currentOrder,
          others,
        },
      })
    }, 100)
  }

  const setCouponOrGiftCard = async (order?: Order) => {
    const currentOrder = order ?? (await getOrderFromRef())
    if (state.order) {
      dispatch({ type: ActionType.START_LOADING })

      const others = calculateSettings(
        currentOrder,
        state.isShipmentRequired,
        isGuest,
        state.customerAddresses,
      )
      setTimeout(() => {
        dispatch({
          type: ActionType.CHANGE_COUPON_OR_GIFTCARD,
          payload: { order: currentOrder, others },
        })
      }, 100)
    }
  }

  const selectShipment = async (params: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shippingMethod: ShippingMethodCollection | Record<string, any>
    shipmentId: string
    order?: Order
  }) => {
    // dispatch({ type: ActionType.START_LOADING })
    // TODO Remove after fixing components
    const currentOrder = params.order ?? (await fetchOrder(cl, orderId))

    const others = calculateSettings(
      currentOrder,
      state.isShipmentRequired,
      isGuest,
      state.customerAddresses,
    )

    dispatch({
      type: ActionType.SELECT_SHIPMENT,
      payload: {
        order: currentOrder,
        others,
        shipment: {
          shippingMethod: params.shippingMethod,
          shipmentId: params.shipmentId,
        },
      },
    })
  }

  const autoSelectShippingMethod = async (order?: Order) => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = order ?? (await fetchOrder(cl, orderId))

    const others = calculateSettings(
      currentOrder,
      state.isShipmentRequired,
      isGuest,
      state.customerAddresses,
    )
    setTimeout(() => {
      dispatch({
        type: ActionType.SAVE_SHIPMENTS,
        payload: { order: currentOrder, others },
      })
    }, 100)

    return currentOrder
  }

  const saveShipments = async () => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = await getOrderFromRef()
    const others = calculateSettings(
      currentOrder,
      state.isShipmentRequired,
      isGuest,
      state.customerAddresses,
    )

    setTimeout(() => {
      dispatch({
        type: ActionType.SAVE_SHIPMENTS,
        payload: { order: currentOrder, others },
      })
    }, 100)

    return currentOrder
  }

  const setPayment = async (params: {
    payment?: PaymentMethod
    order?: Order
  }) => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = params.order ?? (await getOrderFromRef())

    const others = calculateSettings(
      currentOrder,
      state.isShipmentRequired,
      isGuest,
      state.customerAddresses,
    )

    dispatch({
      type: ActionType.SET_PAYMENT,
      payload: { payment: params.payment, order: currentOrder, others },
    })
  }

  const placeOrder = async (order?: Order) => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = order ?? (await getOrderFromRef())

    dispatch({
      type: ActionType.PLACE_ORDER,
      payload: { order: currentOrder },
    })
  }

  const getOrderFromRef = async () => {
    return orderRef.current || (await fetchOrder(cl, orderId))
  }

  useEffect(() => {
    const unsubscribe = () => {
      fetchInitialOrder(orderId, accessToken)
    }
    return unsubscribe()
  }, [orderId, accessToken])

  return (
    <AppContext.Provider
      value={{
        ...state,
        orderId,
        order,
        accessToken,
        isGuest,
        slug,
        domain,
        getOrderFromRef,
        setAddresses,
        selectShipment,
        getOrder,
        saveShipments,
        setPayment,
        setCouponOrGiftCard,
        placeOrder,
        setCustomerEmail,
        autoSelectShippingMethod,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
