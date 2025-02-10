import type { TErrorComponent } from "@commercelayer/react-components/errors/Errors"
import GiftCardOrCouponCode from "@commercelayer/react-components/gift_cards/GiftCardOrCouponCode"
import GiftCardOrCouponForm from "@commercelayer/react-components/gift_cards/GiftCardOrCouponForm"
import type { Order } from "@commercelayer/sdk"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import {
  CouponFieldWrapper,
  CouponFormWrapper,
  CouponName,
  CouponRecap,
  StyledErrors,
  StyledGiftCardOrCouponInput,
  StyledGiftCardOrCouponRemoveButton,
  StyledGiftCardOrCouponSubmit,
} from "./styled"

interface Props {
  readonly?: boolean
  setCouponOrGiftCard: (order?: Order) => Promise<void>
}

export const CouponOrGiftCard: React.FC<Props> = ({
  readonly,
  setCouponOrGiftCard,
}) => {
  const { t } = useTranslation()

  const [codeError, setCodeError] = useState(false)

  const handleSubmit = async (response: {
    success: boolean
    value?: string
    order?: Order
  }) => {
    if (!response.success) {
      return setCodeError(response.value?.length !== 0)
    }
    await setCouponOrGiftCard(response.order)
    return setCodeError(false)
  }

  const classError = codeError ? "hasError" : ""

  const messages: TErrorComponent["messages"] = [
    {
      code: "VALIDATION_ERROR",
      resource: "orders",
      field: "gift_card_or_coupon_code",
      message: t("input.mustBeValidCouponOrGiftCard"),
    },
    {
      code: "VALIDATION_ERROR",
      resource: "orders",
      field: "coupon_code",
      message: t("input.mustBeValidCoupon"),
    },
    {
      code: "VALIDATION_ERROR",
      resource: "orders",
      field: "gift_card_code",
      message: t("input.mustBeValidGiftCard"),
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
      field: "braintree_payments",
      message: " ",
    },
    {
      code: "VALIDATION_ERROR",
      resource: "orders",
      field: "adyen_payments",
      message: " ",
    },
    {
      code: "VALIDATION_ERROR",
      resource: "orders",
      field: "paypal_payments",
      message: " ",
    },
  ]

  return (
    <>
      {!readonly && (
        <GiftCardOrCouponForm onSubmit={handleSubmit}>
          <CouponFormWrapper>
            <CouponFieldWrapper>
              <StyledGiftCardOrCouponInput
                data-testid="input_giftcard_coupon"
                className={`form-input ${classError}`}
                required={false}
                placeholderTranslation={(codeType) =>
                  t(`orderRecap.${codeType}`)
                }
              />
              <StyledGiftCardOrCouponSubmit
                data-testid="submit_giftcard_coupon"
                label={t("general.apply")}
              />
            </CouponFieldWrapper>
            <StyledErrors
              data-testid="discount-error"
              resource="orders"
              messages={messages}
            />
          </CouponFormWrapper>
        </GiftCardOrCouponForm>
      )}

      <GiftCardOrCouponCode type="coupon" className="inline-flex items-center">
        {(props) => {
          const { hide, code, ...p } = props
          return hide ? null : (
            <CouponRecap>
              <span data-testid="code-coupon" {...p}>
                <CouponName>{code}</CouponName>
                {!readonly && (
                  <StyledGiftCardOrCouponRemoveButton
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    onClick={handleSubmit}
                    data-testid="remove_coupon"
                    type="coupon"
                    label="Remove"
                  />
                )}
              </span>
            </CouponRecap>
          )
        }}
      </GiftCardOrCouponCode>
      <GiftCardOrCouponCode
        type="gift_card"
        className="inline-flex items-center text-sm font-medium"
      >
        {(props) => {
          const { hide, code, ...p } = props
          return hide ? null : (
            <CouponRecap>
              <span data-testid="code-giftcard" {...p}>
                {code}
                {!readonly && (
                  <StyledGiftCardOrCouponRemoveButton
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    onClick={handleSubmit}
                    data-testid="remove_giftcard"
                    type="gift_card"
                    className=""
                    label="Remove"
                  />
                )}
              </span>
            </CouponRecap>
          )
        }}
      </GiftCardOrCouponCode>
    </>
  )
}
