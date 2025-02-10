import { useContext, useEffect, useState } from "react"

import { AppContext } from "components/data/AppProvider"

interface UseActiveStep {
  activeStep: SingleStepEnum
  setActiveStep: (step: SingleStepEnum) => void
  lastActivableStep: SingleStepEnum
  isLoading: boolean
  steps: SingleStepEnum[]
}

const STEPS: SingleStepEnum[] = ["Customer", "Shipping", "Payment"]

export function checkIfCannotGoNext(
  step: SingleStepEnum,
  steps: SingleStepEnum[],
  lastActivableStep: SingleStepEnum,
) {
  if (lastActivableStep === "Complete") {
    return false
  }
  const indexCurrent = steps.indexOf(step)
  const indexLastActivable = steps.indexOf(lastActivableStep)
  return indexCurrent >= indexLastActivable
}

export const useActiveStep = (): UseActiveStep => {
  const [activeStep, setActiveStep] = useState<SingleStepEnum>("Customer")
  const [lastActivableStep, setLastActivableStep] =
    useState<SingleStepEnum>("Customer")
  const [steps, setSteps] = useState<SingleStepEnum[]>(STEPS)

  const ctx = useContext(AppContext)

  if (!ctx)
    return {
      activeStep,
      lastActivableStep,
      setActiveStep,
      isLoading: true,
      steps,
    }

  const { isFirstLoading, isLoading } = ctx

  useEffect(() => {
    if (ctx && (isFirstLoading || !ctx.isLoading)) {
      // Use it to alter steps of checkout
      if (ctx.isShipmentRequired) {
        setSteps(["Customer", "Shipping", "Payment"])
      } else {
        setSteps(["Customer", "Payment"])
      }

      const canSelectCustomerAddress =
        ((ctx.isShipmentRequired &&
          ctx.hasShippingAddress &&
          ctx.hasBillingAddress) ||
          (!ctx.isShipmentRequired && ctx.hasBillingAddress)) &&
        ctx.hasEmailAddress
      const canSelectShippingMethod =
        canSelectCustomerAddress &&
        (ctx.hasShippingAddress || !ctx.isShipmentRequired)
      const canSelectPayment =
        canSelectCustomerAddress &&
        canSelectShippingMethod &&
        ctx.hasShippingMethod
      const canPlaceOrder =
        canSelectCustomerAddress &&
        canSelectShippingMethod &&
        canSelectPayment &&
        ctx.hasPaymentMethod
      if (canPlaceOrder) {
        setActiveStep("Complete")
        setLastActivableStep("Complete")
      } else if (canSelectPayment) {
        setActiveStep("Payment")
        setLastActivableStep("Payment")
      } else if (canSelectShippingMethod) {
        setActiveStep("Shipping")
        setLastActivableStep("Shipping")
      } else {
        setActiveStep("Customer")
        setLastActivableStep("Customer")
      }
    }
  }, [isFirstLoading, isLoading])

  return {
    activeStep,
    lastActivableStep,
    setActiveStep,
    isLoading,
    steps,
  }
}
