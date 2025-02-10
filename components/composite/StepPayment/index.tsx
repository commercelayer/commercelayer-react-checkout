import "@adyen/adyen-web/styles/adyen.css"
import {
  type PaymentMethodOnClickParams,
  PaymentSource,
  PaymentSourceBrandIcon,
  PaymentSourceBrandName,
  PaymentSourceDetail,
} from "@commercelayer/react-components"
import type { PaymentMethod as PaymentMethodType } from "@commercelayer/sdk"
import classNames from "classnames"
import { useContext, useEffect, useState } from "react"
import { Trans, useTranslation } from "react-i18next"

import { AccordionContext } from "components/data/AccordionProvider"
import { AppContext } from "components/data/AppProvider"
import { StepContainer } from "components/ui/StepContainer"
import { StepContent } from "components/ui/StepContent"
import { StepHeader } from "components/ui/StepHeader"

import { CheckoutCustomerPayment } from "./CheckoutCustomerPayment"
import { CheckoutPayment } from "./CheckoutPayment"
import { PaymentSkeleton } from "./PaymentSkeleton"

interface HeaderProps {
  className?: string
  step: number
  info?: string
}

export const StepHeaderPayment: React.FC<HeaderProps> = ({ step }) => {
  const appCtx = useContext(AppContext)
  const accordionCtx = useContext(AccordionContext)

  if (!appCtx || !accordionCtx) {
    return null
  }

  const { hasPaymentMethod, isPaymentRequired, isCreditCard } = appCtx

  const { t } = useTranslation()

  const recapText = () => {
    if (!isPaymentRequired) {
      return t("stepPayment.notRequired")
    }
    if (!hasPaymentMethod || accordionCtx.status === "edit") {
      return t("stepPayment.methodUnselected")
    }

    return (
      <>
        <div className="flex">
          <PaymentSource readonly loader={<PaymentSkeleton />}>
            <PaymentSourceBrandIcon className="mr-2" />
            <PaymentSourceBrandName className="mr-1">
              {({ brand }) => {
                if (isCreditCard) {
                  return (
                    <Trans i18nKey="stepPayment.endingIn">
                      {brand}
                      <PaymentSourceDetail className="ml-1" type="last4" />
                    </Trans>
                  )
                }
                return <>{brand}</>
              }}
            </PaymentSourceBrandName>
          </PaymentSource>
        </div>
      </>
    )
  }

  return (
    <StepHeader
      stepNumber={step}
      status={accordionCtx.status}
      label={t("stepPayment.title")}
      info={recapText()}
      onEditRequest={accordionCtx.setStep}
    />
  )
}

export const StepPayment: React.FC = () => {
  const appCtx = useContext(AppContext)
  const accordionCtx = useContext(AccordionContext)
  const [hasMultiplePaymentMethods, setHasMultiplePaymentMethods] =
    useState(false)
  const [autoSelected, setAutoselected] = useState(false)
  const [hasTitle, setHasTitle] = useState(true)

  const { t } = useTranslation()

  // if (!appCtx || !appCtx.hasShippingMethod) {
  // this exit on shippingMethod is causing an error in useEffect to enable button
  if (!appCtx || !accordionCtx) {
    return null
  }

  useEffect(() => {
    // If single payment methods and has multiple payment methods, we hide the label of the box
    if (autoSelected && hasMultiplePaymentMethods) {
      setHasTitle(false)
    }
  }, [autoSelected, hasMultiplePaymentMethods])

  const { isGuest, isPaymentRequired, setPayment, hasSubscriptions } = appCtx

  const selectPayment = ({ payment, order }: PaymentMethodOnClickParams) => {
    if (
      // @ts-expect-error available only on adyen
      order?.payment_source.payment_methods &&
      // @ts-expect-error available only on adyen
      order?.payment_source?.payment_methods?.length > 1
    ) {
      setHasMultiplePaymentMethods(true)
    }
    setPayment({ payment: payment as PaymentMethodType })
  }

  const autoSelectCallback = () => {
    setAutoselected(true)
  }

  return (
    <StepContainer
      className={classNames({
        current: accordionCtx.isActive,
        done: !accordionCtx.isActive,
      })}
    >
      <StepContent>
        <>
          {accordionCtx.isActive && (
            <div>
              {isPaymentRequired ? (
                isGuest ? (
                  <CheckoutPayment
                    selectPayment={selectPayment}
                    autoSelectCallback={autoSelectCallback}
                    hasTitle={hasTitle}
                  />
                ) : (
                  <>
                    <CheckoutCustomerPayment
                      selectPayment={selectPayment}
                      autoSelectCallback={autoSelectCallback}
                      hasTitle={hasTitle}
                      hasSubscriptions={hasSubscriptions}
                    />
                  </>
                )
              ) : (
                <p className="text-sm text-gray-400">
                  {t("stepPayment.amountZero")}
                </p>
              )}
            </div>
          )}
        </>
      </StepContent>
    </StepContainer>
  )
}
