import {
  Order,
  Address,
  CustomerAddress,
  PaymentMethod,
  CommerceLayerClient,
  OrderUpdate,
  StripePayment,
  WireTransfer,
  AdyenPayment,
  BraintreePayment,
  CheckoutComPayment,
  PaypalPayment,
  ShippingMethod,
  Shipment,
} from "@commercelayer/sdk"

import { AppStateData } from "components/data/AppProvider"

export type LineItemType =
  | "gift_cards"
  | "payment_methods"
  | "promotions"
  | "shipments"
  | "skus"
  | "bundles"
  | "adjustments"

export type TypeAccepted = Extract<
  LineItemType,
  "skus" | "gift_cards" | "bundles" | "adjustments"
>

interface IsNewAddressProps {
  address: NullableType<Address>
  customerAddresses?: NullableType<CustomerAddress[]>
  isGuest: boolean
}

interface CheckAndSetDefaultAddressForOrderProps {
  cl: CommerceLayerClient
  order: Order
  customerAddresses?: Array<CustomerAddress>
}

interface PaymentSourceProps {
  options?: { card?: string }
  metadata?: { card?: string }
  payment_response?: { source?: string }
}

type PaymentSourceType = (
  | AdyenPayment
  | BraintreePayment
  | CheckoutComPayment
  | PaypalPayment
  | StripePayment
  | WireTransfer
) &
  PaymentSourceProps

export interface FetchOrderByIdResponse {
  isGuest: boolean
  isUsingNewBillingAddress: boolean
  isUsingNewShippingAddress: boolean
  hasSameAddresses: boolean
  hasEmailAddress: boolean
  customerAddresses: CustomerAddress[]
  emailAddress: NullableType<string>
  hasShippingAddress: boolean
  shippingAddress: NullableType<Address>
  hasBillingAddress: boolean
  billingAddress: NullableType<Address>
  requiresBillingInfo: NullableType<boolean>
  hasShippingMethod: boolean
  paymentMethod: NullableType<PaymentMethod>
  shipments: Array<ShipmentSelected>
  hasPaymentMethod: boolean
  hasCustomerAddresses: boolean
  shippingCountryCodeLock: NullableType<string>
  isShipmentRequired: boolean
  isPaymentRequired: boolean
  isComplete: boolean
  returnUrl: NullableType<string>
  cartUrl: NullableType<string>
  isCreditCard: boolean
  taxIncluded: NullableType<boolean>
  shippingMethodName?: string
  hasSubscriptions: boolean
}

function isNewAddress({
  address,
  customerAddresses,
  isGuest,
}: IsNewAddressProps): boolean {
  if (isGuest) {
    return true
  }

  const hasAddressIntoAddresses = Boolean(
    customerAddresses?.find(
      (customerAddress) => customerAddress?.id === address?.reference
    )
  )

  if (
    !hasAddressIntoAddresses &&
    customerAddresses &&
    customerAddresses?.length > 1 &&
    Boolean(address)
  ) {
    return true
  }
  if (
    !hasAddressIntoAddresses &&
    customerAddresses &&
    customerAddresses?.length > 1 &&
    Boolean(!address)
  ) {
    return false
  }
  return !hasAddressIntoAddresses
}

export async function checkAndSetDefaultAddressForOrder({
  cl,
  order,
}: CheckAndSetDefaultAddressForOrderProps) {
  const customerAddresses = order?.customer?.customer_addresses
  if (
    order.guest ||
    !customerAddresses ||
    (customerAddresses && customerAddresses.length !== 1) ||
    order.billing_address ||
    order.shipping_address
  ) {
    return {}
  }

  const address = customerAddresses[0]?.address

  if (!address) {
    return {}
  }

  if (
    !!order.shipping_country_code_lock &&
    order.shipping_country_code_lock !== address.country_code
  ) {
    return {}
  }

  // Set reference on original address if not present
  // doing this we can lookup the cloned address for the same entity
  if (address.id && address.reference !== customerAddresses[0].id) {
    await cl.addresses.update({
      id: address.id,
      reference: customerAddresses[0].id,
    })
  }

  const updateObjet: OrderUpdate = {
    id: order.id,
    _billing_address_clone_id: address.id,
    _shipping_address_clone_id: address.id,
  }
  try {
    const { billing_address, shipping_address } = await cl.orders.update(
      updateObjet,
      {
        include: ["billing_address", "shipping_address"],
      }
    )

    localStorage.setItem(
      "_save_billing_address_to_customer_address_book",
      "false"
    )
    localStorage.setItem(
      "_save_shipping_address_to_customer_address_book",
      "false"
    )
    return {
      customerAddresses: [
        {
          ...customerAddresses[0],
          address: { ...address, reference: customerAddresses[0].id },
        },
      ],
      hasSameAddresses: true,
      hasBillingAddress: true,
      hasShippingAddress: true,
      isUsingNewBillingAddress: false,
      isUsingNewShippingAddress: false,
      billingAddress: billing_address,
      shippingAddress: shipping_address,
    }
  } catch (error) {
    console.log(error)
    return {}
  }
}

interface IsBillingAddressSameAsShippingAddressProps {
  billingAddress: NullableType<Address>
  shippingAddress: NullableType<Address>
}

function isBillingAddressSameAsShippingAddress({
  billingAddress,
  shippingAddress,
}: IsBillingAddressSameAsShippingAddressProps) {
  if (shippingAddress && billingAddress) {
    if (
      (shippingAddress.reference === billingAddress.reference &&
        shippingAddress.reference !== null) ||
      shippingAddress.name === billingAddress.name
    ) {
      return true
    } else if (
      shippingAddress.reference !== billingAddress.reference ||
      shippingAddress.name !== billingAddress.name
    ) {
      return false
    }
  } else if (shippingAddress === undefined && billingAddress) {
    return true
  } else if (billingAddress === undefined && shippingAddress) {
    return false
  } else {
    return true
  }
  return true
}

export const fetchOrder = (cl: CommerceLayerClient, orderId: string) => {
  return cl.orders.retrieve(orderId, {
    fields: {
      orders: [
        "id",
        // Start fields for GTM
        "number",
        "coupon_code",
        "currency_code",
        "shipping_amount_float",
        "total_tax_amount_float",
        // End fields for GTM
        "guest",
        "shipping_country_code_lock",
        "customer_email",
        "status",
        "return_url",
        "cart_url",
        "tax_included",
        "requires_billing_info",
        "total_amount_with_taxes_float",
        "language_code",
        "subscription_created_at",
        "shipping_address",
        "billing_address",
        "shipments",
        "payment_method",
        "payment_source",
        "customer",
        "line_items",
      ],
      shipments: ["shipping_method", "available_shipping_methods"],
      customers: ["customer_addresses"],
      customer_addresses: ["address"],
      line_items: ["frequency"],
    },
    include: [
      "shipping_address",
      "billing_address",
      "shipments",
      "shipments.shipping_method",
      "shipments.available_shipping_methods",
      "payment_method",
      "payment_source",
      "customer",
      "customer.customer_addresses",
      "customer.customer_addresses.address",
      "line_items",
    ],
  })
}

export function isPaymentRequired(order: Order) {
  return !(order.total_amount_with_taxes_float === 0)
}

export function calculateAddresses(
  order: Order,
  addresses: NullableType<CustomerAddress[]>
): Partial<AppStateData> {
  const cAddresses =
    (addresses || order.customer?.customer_addresses) ?? undefined
  const values = {
    hasCustomerAddresses: (cAddresses && cAddresses.length >= 1) || false,
    billingAddress: order.billing_address,
    shippingAddress: order.shipping_address,
    hasBillingAddress: Boolean(order.billing_address),
    hasShippingAddress: Boolean(order.shipping_address),
    customerAddresses: cAddresses,
    isUsingNewBillingAddress: isNewAddress({
      address: order.billing_address,
      customerAddresses: cAddresses,
      isGuest: Boolean(order.guest),
    }),
    isUsingNewShippingAddress: isNewAddress({
      address: order.shipping_address,
      customerAddresses: cAddresses,
      isGuest: Boolean(order.guest),
    }),
    hasSameAddresses: isBillingAddressSameAsShippingAddress({
      billingAddress: order.billing_address,
      shippingAddress: order.shipping_address,
    }),
  }
  return values
}

export function calculateSettings(
  order: Order,
  isShipmentRequired: boolean,
  isGuest: boolean,
  customerAddress?: CustomerAddress[]
) {
  // FIX saving customerAddresses because we don't receive
  // them from fetchOrder
  const calculatedAddresses = calculateAddresses(
    order,
    order.customer?.customer_addresses || customerAddress
  )

  const hasSubscriptions =
    order.line_items?.some((item) => {
      return item.frequency && item.frequency?.length > 0
    }) ||
    order.subscription_created_at != null ||
    false

  return {
    isGuest,
    shippingCountryCodeLock: order.shipping_country_code_lock,
    hasEmailAddress: Boolean(order.customer_email),
    emailAddress: order.customer_email,
    ...calculatedAddresses,
    ...(isShipmentRequired
      ? calculateSelectedShipments(prepareShipments(order.shipments))
      : {
          hasShippingMethod: true,
          shipments: [],
        }),
    ...checkPaymentMethod(order),
    returnUrl: order.return_url,
    cartUrl: order.cart_url,
    taxIncluded: order.tax_included,
    requiresBillingInfo: order.requires_billing_info,
    hasSubscriptions,
  }
}

export function checkPaymentMethod(order: Order) {
  const paymentMethod = order.payment_method

  const paymentSource: PaymentSourceType | undefined =
    order.payment_source as PaymentSourceType
  let hasPaymentMethod = Boolean(
    // @ts-expect-error no type for payment_method
    paymentSource?.payment_method?.lenght > 0 ||
      paymentSource?.payment_response?.source
  )
  const paymentRequired = isPaymentRequired(order)
  if (!hasPaymentMethod && !paymentRequired) {
    hasPaymentMethod = true
  }

  const isComplete = order.status === "placed"

  return {
    hasPaymentMethod,
    isPaymentRequired: paymentRequired,
    paymentMethod,
    isComplete,
    isCreditCard: creditCardPayment(paymentMethod),
    paymentSource,
  }
}

export function creditCardPayment(paymentMethod: NullableType<PaymentMethod>) {
  return (
    paymentMethod?.payment_source_type === "adyen_payments" ||
    paymentMethod?.payment_source_type === "stripe_payments" ||
    paymentMethod?.payment_source_type === "braintree_payments" ||
    paymentMethod?.payment_source_type === "checkout_com_payments"
  )
}
export function calculateSelectedShipments(
  shipments: ShipmentSelected[],
  payload?: {
    shipmentId: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shippingMethod: ShippingMethod | Record<string, any>
  }
) {
  const shipmentsSelected = shipments?.map((shipment) => {
    return shipment.shipmentId === payload?.shipmentId
      ? {
          ...shipment,
          shippingMethodId: payload.shippingMethod.id,
          shippingMethodName: payload.shippingMethod.name,
        }
      : shipment
  })
  const hasShippingMethod = hasShippingMethodSet(shipmentsSelected)
  return { shipments: shipmentsSelected, ...hasShippingMethod }
}

export function prepareShipments(
  shipments?: NullableType<Shipment[]>
): ShipmentSelected[] {
  return (shipments || []).map((a) => {
    return {
      shipmentId: a.id,
      shippingMethodId: a.shipping_method?.id,
      shippingMethodName: a.shipping_method?.name,
    }
  })
}

export function hasShippingMethodSet(shipments: ShipmentSelected[]) {
  const shippingMethods = shipments?.map(
    (a: ShipmentSelected) => a.shippingMethodId
  )
  const hasShippingMethod = Boolean(
    shippingMethods?.length && !shippingMethods?.includes(undefined)
  )
  return { hasShippingMethod }
}
