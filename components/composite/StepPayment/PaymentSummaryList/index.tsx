import { PaymentMethodPrice } from "@commercelayer/react-components"

import { PaymentMethodNameWithStripe } from "../PaymentMethodNameWithStripe"
import {
  PaymentRadioContainer,
  PaymentSummary,
  PaymentSummaryItem,
  PaymentSummaryValue,
  StyledPaymentMethodRadioButton,
} from "../styled"

import { StyledErrors } from "components/composite/OrderSummary/CouponOrGiftCard/styled"

export const PaymentSummaryList = ({ hasTitle }: { hasTitle: boolean }) => {
  return (
    <>
      <PaymentSummary>
        <PaymentSummaryItem data-testid="payment-method-item">
          <PaymentRadioContainer>
            <StyledPaymentMethodRadioButton className="form-radio" />
          </PaymentRadioContainer>
          {hasTitle && <PaymentMethodNameWithStripe />}
        </PaymentSummaryItem>
        {hasTitle && (
          <PaymentSummaryValue>
            <PaymentMethodPrice labelFree="&nbsp;" />
          </PaymentSummaryValue>
        )}
      </PaymentSummary>
      <StyledErrors resource="payment_methods" />
    </>
  )
}
