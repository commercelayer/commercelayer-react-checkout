import type { Errors } from "@commercelayer/react-components/errors/Errors"

export const messages: Parameters<typeof Errors>[0]["messages"] = [
  {
    code: "VALIDATION_ERROR",
    resource: "orders",
    field: "status",
    message: "error.transition",
  },
  {
    code: "VALIDATION_ERROR",
    resource: "orders",
    field: "paymentMethod",
    message: "error.paymentMethod",
  },
  {
    code: "VALIDATION_ERROR",
    resource: "orders",
    field: "giftCardOrCouponCode",
    message: " ",
  },
  {
    code: "PAYMENT_NOT_APPROVED_FOR_EXECUTION",
    resource: "orders",
    field: "base",
    message: "error.payer",
  },
  {
    code: "INVALID_RESOURCE_ID",
    resource: "orders",
    field: "base",
    message: "error.resourceID",
  },
  {
    code: "EMPTY_ERROR",
    resource: "orders",
    field: "customer_email",
    message: " ",
  },
  {
    code: "VALIDATION_ERROR",
    resource: "orders",
    field: "customer_email",
    message: " ",
  },
  {
    code: "VALIDATION_ERROR",
    resource: "orders",
    field: "gift_card_or_coupon_code",
    message: " ",
  },
  {
    code: "VALIDATION_ERROR",
    resource: "orders",
    field: "coupon_code",
    message: " ",
  },
  {
    code: "VALIDATION_ERROR",
    resource: "orders",
    field: "gift_card_code",
    message: " ",
  },
]
