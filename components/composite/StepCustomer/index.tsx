import type { Order } from "@commercelayer/sdk"
import classNames from "classnames"
import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { AccordionContext } from "components/data/AccordionProvider"
import { AppContext } from "components/data/AppProvider"
import { StepContainer } from "components/ui/StepContainer"
import { StepContent } from "components/ui/StepContent"
import { StepHeader } from "components/ui/StepHeader"

import { CheckoutAddresses } from "./CheckoutAddresses"
import { CheckoutCustomerAddresses } from "./CheckoutCustomerAddresses"

interface Props {
  className?: string
  step: number
}

export interface ShippingToggleProps {
  forceShipping?: boolean
  disableToggle: boolean
}

export const StepHeaderCustomer: React.FC<Props> = ({ step }) => {
  const appCtx = useContext(AppContext)
  const accordionCtx = useContext(AccordionContext)
  if (!appCtx || !accordionCtx) {
    return null
  }

  const {
    hasShippingAddress,
    hasBillingAddress,
    emailAddress,
    isShipmentRequired,
  } = appCtx

  const { t } = useTranslation()

  const recapText = () => {
    if (
      (!hasShippingAddress && !hasBillingAddress) ||
      accordionCtx.status === "edit"
    ) {
      return (
        <>
          <p data-testid="customer-addresses-title">
            {isShipmentRequired
              ? t("stepCustomer.notSet")
              : t("stepCustomer.notSetNoDelivery")}
          </p>
        </>
      )
    }

    return (
      <>
        <p data-testid="customer-email-step-header">{emailAddress}</p>
      </>
    )
  }

  return (
    <StepHeader
      stepNumber={step}
      status={accordionCtx.status}
      label={t("stepCustomer.title")}
      info={recapText()}
      onEditRequest={accordionCtx.setStep}
    />
  )
}

export const StepCustomer: React.FC<Props> = () => {
  const appCtx = useContext(AppContext)
  const accordionCtx = useContext(AccordionContext)

  const [isLocalLoader, setIsLocalLoader] = useState(false)

  if (!appCtx || !accordionCtx) {
    return null
  }
  const {
    isGuest,
    isShipmentRequired,
    billingAddress,
    shippingAddress,
    emailAddress,
    hasSameAddresses,
    isUsingNewBillingAddress,
    isUsingNewShippingAddress,
    hasCustomerAddresses,
    shippingCountryCodeLock,
    setAddresses,
    setCustomerEmail,
  } = appCtx

  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(
    !hasSameAddresses,
  )

  useEffect(() => {
    setShipToDifferentAddress(!hasSameAddresses)
  }, [hasSameAddresses])

  const [disabledShipToDifferentAddress, setDisabledShipToDifferentAddress] =
    useState(
      !!(
        shippingCountryCodeLock &&
        billingAddress?.country_code &&
        billingAddress?.country_code !== shippingCountryCodeLock
      ),
    )

  const openShippingAddress = ({
    forceShipping,
    disableToggle,
  }: ShippingToggleProps) => {
    if (isShipmentRequired) {
      if (forceShipping) {
        setShipToDifferentAddress(true)
      }
      setDisabledShipToDifferentAddress(disableToggle)
    }
  }

  const handleSave = async (params: { success: boolean; order?: Order }) => {
    setIsLocalLoader(true)
    await setAddresses(params.order)

    // it is used temporarily to scroll
    // to the next step and fix
    // the mobile and desktop bug that led to the bottom of the page
    const tab = document.querySelector('div[tabindex="2"]')
    const top = tab?.scrollLeft as number
    const left = tab?.scrollTop as number
    window.scrollTo({ left, top, behavior: "smooth" })

    setIsLocalLoader(false)
  }

  return (
    <StepContainer
      className={classNames({
        current: accordionCtx.isActive,
        done: !accordionCtx.isActive,
        submitting: isLocalLoader,
      })}
    >
      <StepContent>
        <>
          {accordionCtx.isActive && (
            <>
              {isGuest ? (
                <CheckoutAddresses
                  shippingAddress={shippingAddress}
                  billingAddress={billingAddress}
                  emailAddress={emailAddress}
                  hasSameAddresses={hasSameAddresses}
                  setCustomerEmail={setCustomerEmail}
                  isShipmentRequired={isShipmentRequired}
                  isLocalLoader={isLocalLoader}
                  openShippingAddress={openShippingAddress}
                  shipToDifferentAddress={shipToDifferentAddress}
                  setShipToDifferentAddress={setShipToDifferentAddress}
                  disabledShipToDifferentAddress={
                    disabledShipToDifferentAddress
                  }
                  handleSave={handleSave}
                />
              ) : (
                <CheckoutCustomerAddresses
                  shippingAddress={shippingAddress}
                  billingAddress={billingAddress}
                  emailAddress={emailAddress}
                  hasCustomerAddresses={hasCustomerAddresses}
                  isShipmentRequired={isShipmentRequired}
                  isUsingNewShippingAddress={isUsingNewShippingAddress}
                  isUsingNewBillingAddress={isUsingNewBillingAddress}
                  hasSameAddresses={hasSameAddresses}
                  isLocalLoader={isLocalLoader}
                  shippingCountryCodeLock={shippingCountryCodeLock}
                  openShippingAddress={openShippingAddress}
                  shipToDifferentAddress={shipToDifferentAddress}
                  setShipToDifferentAddress={setShipToDifferentAddress}
                  disabledShipToDifferentAddress={
                    disabledShipToDifferentAddress
                  }
                  handleSave={handleSave}
                />
              )}
            </>
          )}
        </>
      </StepContent>
    </StepContainer>
  )
}

interface EvaluateConditionsProps {
  countryCode?: string
  shippingCountryCodeLock: NullableType<string>
}

export function evaluateShippingToggle({
  countryCode,
  shippingCountryCodeLock,
}: EvaluateConditionsProps): ShippingToggleProps {
  if (
    !!shippingCountryCodeLock &&
    countryCode &&
    countryCode !== shippingCountryCodeLock
  ) {
    return { disableToggle: true, forceShipping: true }
  }
  return { disableToggle: false }
}
