import { OrderSummary } from "components/composite/OrderSummary"
import { StepComplete } from "components/composite/StepComplete"
import { StepCustomer } from "components/composite/StepCustomer"
import { StepNav } from "components/composite/StepNav"
import { StepPayment } from "components/composite/StepPayment"
import { StepShipping } from "components/composite/StepShipping"
import { AppContext } from "components/data/AppProvider"
import { useActiveStep } from "components/hooks/useActiveStep"
import { LayoutDefault } from "components/layouts/LayoutDefault"
import { Logo } from "components/ui/Logo"
import { SpinnerLoader } from "components/ui/SpinnerLoader"
import { useContext } from "react"

interface Props {
  logoUrl: string
  companyName: string
  supportEmail: string
  supportPhone: string
}

export const Checkout: React.FC<Props> = ({
  logoUrl,
  companyName,
  supportEmail,
  supportPhone,
}) => {
  const ctx = useContext(AppContext)

  const {
    activeStep,
    lastActivableStep,
    setActiveStep,
    isLoading,
    steps,
  } = useActiveStep()

  if (!ctx || isLoading) {
    return <SpinnerLoader />
  }

  const renderComplete = () => {
    return (
      <StepComplete
        logoUrl={logoUrl}
        companyName={companyName}
        supportEmail={supportEmail}
        supportPhone={supportPhone}
      />
    )
  }

  const renderSteps = () => {
    return (
      <LayoutDefault
        aside={
          <div>
            <Logo logoUrl={logoUrl} companyName={companyName} />
            <OrderSummary />
          </div>
        }
        main={
          <div tw="md:pl-7">
            <h1 tw="font-bold mb-4 text-lg">Checkout</h1>
            <StepNav
              steps={steps}
              activeStep={activeStep}
              onStepChange={setActiveStep}
              lastActivable={lastActivableStep}
            />
            <StepCustomer
              tw="mb-6"
              isActive={activeStep === "Customer"}
              onToggleActive={() => setActiveStep("Customer")}
            />
            <StepShipping
              tw="mb-6"
              isActive={activeStep === "Shipping"}
              onToggleActive={() => setActiveStep("Shipping")}
            />
            <StepPayment
              tw="mb-6"
              isActive={activeStep === "Payment"}
              onToggleActive={() => setActiveStep("Payment")}
            />
          </div>
        }
      />
    )
  }

  return ctx.isComplete ? renderComplete() : renderSteps()
}
