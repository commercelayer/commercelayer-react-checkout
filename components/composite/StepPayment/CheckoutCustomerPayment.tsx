import PaymentMethod, {
  type PaymentMethodOnClickParams,
} from "@commercelayer/react-components/payment_methods/PaymentMethod"
import PaymentSource, {
  type CustomerSaveToWalletProps,
} from "@commercelayer/react-components/payment_source/PaymentSource"
import { type MouseEvent, useState } from "react"
import { useTranslation } from "react-i18next"

import { Label } from "components/ui/Label"

import { PaymentDetails } from "./PaymentDetails"
import { PaymentSkeleton } from "./PaymentSkeleton"
import { PaymentSummaryList } from "./PaymentSummaryList"
import {
  PaymentDetailsWrapper,
  PaymentSourceContainer,
  PaymentWrapper,
  WalletCheckbox,
} from "./styled"

interface Props {
  selectPayment: (params: PaymentMethodOnClickParams) => void
  hasTitle: boolean
  autoSelectCallback: () => void
  hasSubscriptions: boolean
}

type TTemplateCustomerCards = Parameters<
  typeof PaymentSource
>[0]["templateCustomerCards"]

export const CheckoutCustomerPayment: React.FC<Props> = ({
  selectPayment,
  hasTitle,
  autoSelectCallback,
  hasSubscriptions,
}) => {
  const { t } = useTranslation()

  // TemplateSaveToWalletCheckbox
  const [checked, setChecked] = useState(false)

  const TemplateCustomerCards: TTemplateCustomerCards = ({
    customerPayments,
    PaymentSourceProvider,
  }) => {
    return (
      <>
        {customerPayments?.map((p, k) => {
          return (
            <div
              key={k}
              data-testid="customer-card"
              onClick={p.handleClick}
              className="flex flex-col items-start p-3 mb-4 text-sm border rounded cursor-pointer lg:flex-row lg:items-center shadow-sm hover:border-gray-400"
            >
              <PaymentSourceProvider value={{ ...p.card }}>
                <PaymentDetails />
              </PaymentSourceProvider>
            </div>
          )
        })}
      </>
    )
  }

  const TemplateSaveToWalletCheckbox = ({
    name,
  }: CustomerSaveToWalletProps) => {
    const handleClick = (
      e: MouseEvent<HTMLInputElement, globalThis.MouseEvent>,
    ) => e?.stopPropagation()
    const handleChange = () => {
      setChecked(!checked)
    }

    return (
      !hasSubscriptions && (
        <div className="flex items-center mt-4">
          <WalletCheckbox
            name={name}
            id={name}
            data-testid="save-to-wallet"
            type="checkbox"
            className="form-checkbox"
            checked={checked}
            onClick={handleClick}
            onChange={handleChange}
          />
          <Label
            htmlFor={name}
            dataTestId="payment-save-wallet"
            textLabel={t("stepPayment.saveToWallet")}
          />
        </div>
      )
    )
  }

  return (
    <>
      <PaymentMethod
        autoSelectSinglePaymentMethod={autoSelectCallback}
        activeClass="active group"
        className="payment"
        loader={<PaymentSkeleton />}
        clickableContainer
        onClick={selectPayment}
      >
        <PaymentWrapper>
          <PaymentSummaryList hasTitle={hasTitle} />
          <PaymentSourceContainer data-testid="payment-source">
            <PaymentSource
              className="flex flex-col"
              templateCustomerCards={(props) => (
                <TemplateCustomerCards {...props} />
              )}
              templateCustomerSaveToWallet={(props) => (
                <TemplateSaveToWalletCheckbox {...props} />
              )}
              loader={<PaymentSkeleton />}
            >
              <PaymentDetailsWrapper>
                <PaymentDetails hasEditButton />
              </PaymentDetailsWrapper>
            </PaymentSource>
          </PaymentSourceContainer>
        </PaymentWrapper>
      </PaymentMethod>
    </>
  )
}
