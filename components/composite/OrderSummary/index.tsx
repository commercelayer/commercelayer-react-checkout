import LineItemsContainer from "@commercelayer/react-components/line_items/LineItemsContainer"
import LineItemsCount from "@commercelayer/react-components/line_items/LineItemsCount"
import AdjustmentAmount from "@commercelayer/react-components/orders/AdjustmentAmount"
import DiscountAmount from "@commercelayer/react-components/orders/DiscountAmount"
import GiftCardAmount from "@commercelayer/react-components/orders/GiftCardAmount"
import PaymentMethodAmount from "@commercelayer/react-components/orders/PaymentMethodAmount"
import ShippingAmount from "@commercelayer/react-components/orders/ShippingAmount"
import SubTotalAmount from "@commercelayer/react-components/orders/SubTotalAmount"
import TaxesAmount from "@commercelayer/react-components/orders/TaxesAmount"
import TotalAmount from "@commercelayer/react-components/orders/TotalAmount"
import { Trans, useTranslation } from "react-i18next"

import type { AppProviderData } from "components/data/AppProvider"
import { LINE_ITEMS_SHOPPABLE } from "components/utils/constants"

import { CouponOrGiftCard } from "./CouponOrGiftCard"
import { LineItemTypes } from "./LineItemTypes"
import { ReturnToCart } from "./ReturnToCart"
import {
  AmountSpacer,
  AmountWrapper,
  RecapLine,
  RecapLineItem,
  RecapLineItemTotal,
  RecapLineTotal,
  SummaryHeader,
  SummarySubTitle,
  SummaryTitle,
  TotalWrapper,
  Wrapper,
} from "./styled"

interface Props {
  appCtx: AppProviderData
  readonly?: boolean
}

export const OrderSummary: React.FC<Props> = ({ appCtx, readonly }) => {
  const { t } = useTranslation()

  const isTaxCalculated = appCtx.isShipmentRequired
    ? appCtx.hasBillingAddress &&
      appCtx.hasShippingAddress &&
      appCtx.hasShippingMethod
    : appCtx.hasBillingAddress

  const lineItems = !readonly ? (
    <SummaryHeader>
      <SummaryTitle data-testid="test-summary">
        {t("orderRecap.order_summary")}
      </SummaryTitle>
      <SummarySubTitle>
        <LineItemsCount
          data-testid="items-count"
          typeAccepted={LINE_ITEMS_SHOPPABLE}
        >
          {(props): JSX.Element => (
            <span data-testid="items-count">
              {t("orderRecap.cartContains", { count: props.quantity })}
            </span>
          )}
        </LineItemsCount>
      </SummarySubTitle>
    </SummaryHeader>
  ) : null
  return (
    <Wrapper data-testid="order-summary">
      <LineItemsContainer>
        <>
          {lineItems}
          {
            <>
              {LINE_ITEMS_SHOPPABLE.map((type) => (
                <LineItemTypes type={type} key={type} />
              ))}
            </>
          }
        </>
      </LineItemsContainer>
      <TotalWrapper>
        <AmountSpacer />
        <AmountWrapper>
          <CouponOrGiftCard
            readonly={readonly}
            setCouponOrGiftCard={appCtx.setCouponOrGiftCard}
          />
          <RecapLine>
            <RecapLineItem>{t("orderRecap.subtotal_amount")}</RecapLineItem>
            <SubTotalAmount />
          </RecapLine>
          <RecapLine>
            <DiscountAmount>
              {(props) => {
                if (props.priceCents === 0) return <></>
                return (
                  <>
                    <RecapLineItem>
                      {t("orderRecap.discount_amount")}
                    </RecapLineItem>
                    <div data-testid="discount-amount">{props.price}</div>
                  </>
                )
              }}
            </DiscountAmount>
          </RecapLine>
          <RecapLine>
            <AdjustmentAmount>
              {(props) => {
                if (props.priceCents === 0) return <></>
                return (
                  <>
                    <RecapLineItem>
                      {t("orderRecap.adjustment_amount")}
                    </RecapLineItem>
                    <div data-testid="adjustment-amount">{props.price}</div>
                  </>
                )
              }}
            </AdjustmentAmount>
          </RecapLine>
          <RecapLine>
            <ShippingAmount>
              {(props) => {
                if (!appCtx.isShipmentRequired) return <></>
                return (
                  <>
                    <RecapLineItem>
                      {t("orderRecap.shipping_amount")}
                    </RecapLineItem>
                    <div data-testid="shipping-amount">
                      {!appCtx.hasShippingMethod
                        ? t("orderRecap.notSet")
                        : props.priceCents === 0
                          ? t("general.free")
                          : props.price}
                    </div>
                  </>
                )
              }}
            </ShippingAmount>
          </RecapLine>
          <RecapLine data-testid="payment-method-amount">
            <PaymentMethodAmount>
              {(props) => {
                if (props.priceCents === 0) return <></>
                return (
                  <>
                    <RecapLineItem>
                      {t("orderRecap.payment_method_amount")}
                    </RecapLineItem>
                    {props.price}
                  </>
                )
              }}
            </PaymentMethodAmount>
          </RecapLine>
          <RecapLine>
            <TaxesAmount>
              {(props) => {
                return (
                  <>
                    <RecapLineItem>
                      <Trans
                        i18nKey={
                          isTaxCalculated && appCtx.taxIncluded
                            ? "orderRecap.tax_included_amount"
                            : "orderRecap.tax_amount"
                        }
                        components={
                          isTaxCalculated
                            ? {
                                style: (
                                  <span
                                    className={
                                      appCtx.taxIncluded
                                        ? "text-gray-500 font-normal"
                                        : ""
                                    }
                                  />
                                ),
                              }
                            : {}
                        }
                      />
                    </RecapLineItem>
                    <div data-testid="tax-amount">
                      {isTaxCalculated ? props.price : t("orderRecap.notSet")}
                    </div>
                  </>
                )
              }}
            </TaxesAmount>
          </RecapLine>
          <RecapLine>
            <GiftCardAmount>
              {(props) => {
                if (props.priceCents === 0) return <></>
                return (
                  <>
                    <RecapLineItem>
                      {t("orderRecap.giftcard_amount")}
                    </RecapLineItem>
                    <div data-testid="giftcard-amount">{props.price}</div>
                  </>
                )
              }}
            </GiftCardAmount>
          </RecapLine>
          <RecapLineTotal>
            <RecapLineItemTotal>
              {t("orderRecap.total_amount")}
            </RecapLineItemTotal>
            <TotalAmount
              data-testid="total-amount"
              className="text-xl font-extrabold"
            />
          </RecapLineTotal>
          {!appCtx.isComplete && <ReturnToCart cartUrl={appCtx.cartUrl} />}
        </AmountWrapper>
      </TotalWrapper>
    </Wrapper>
  )
}
