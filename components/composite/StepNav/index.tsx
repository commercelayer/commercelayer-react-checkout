import { useTranslation } from "react-i18next"
import styled from "styled-components"
import tw from "twin.macro"

import { Step } from "./Step"

interface Props {
  steps: Array<SingleStepEnum>
  onStepChange: (stepIndex: SingleStepEnum) => void
  activeStep: SingleStepEnum
  lastActivable: SingleStepEnum
}

export const StepNav: React.FC<Props> = ({
  steps,
  onStepChange,
  activeStep,
  lastActivable,
}) => {
  const { t } = useTranslation()

  return (
    <Wrapper aria-label="Breadcrumb">
      <StepList>
        {(steps || []).map((step, index) => {
          const isActive = step === activeStep
          const isLocked =
            lastActivable !== "Complete" &&
            steps.indexOf(step) > steps.indexOf(lastActivable)

          return (
            <Step
              key={index}
              data-testid={`step_${step.toLocaleLowerCase()}`}
              data-status={isActive}
              onClick={() => {
                if (!isLocked) {
                  onStepChange(step)
                }
              }}
              $isActive={isActive}
              $isLocked={isLocked}
            >
              {t(`step${step}.title`)}
              {step !== "Payment" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 mx-3 fill-current"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <title>Breadcrumb</title>
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </Step>
          )
        })}
      </StepList>
    </Wrapper>
  )
}

const Wrapper = styled.nav`
  ${tw`mb-12 pt-2 hidden md:block`}
`

const StepList = styled.ol`
  ${tw`list-none p-0 inline-flex text-gray-900 text-sm font-medium`}
`
