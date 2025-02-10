import classNames from "classnames"
import { type ReactNode, useContext } from "react"
import styled from "styled-components"
import tw from "twin.macro"

import { AccordionContext } from "components/data/AccordionProvider"
import { AppContext } from "components/data/AppProvider"

interface Props {
  index: number
  header: ReactNode
  children?: JSX.Element[] | JSX.Element
}

export const Accordion = ({ children }: { children?: ChildrenType }) => {
  return <Wrapper>{children}</Wrapper>
}

export const AccordionItem = ({ children, index, header }: Props) => {
  const ctx = useContext(AccordionContext)
  const appCtx = useContext(AppContext)

  if (!ctx || !appCtx) return null

  const handleSelection = () => {
    return ctx.isActive ? ctx.closeStep() : ctx.setStep()
  }

  return (
    <AccordionTab
      tabIndex={index}
      className={classNames("group", {
        active: ctx.isActive,
        disabled: ctx.status === "disabled" || ctx.status === "skip",
      })}
    >
      <AccordionTabHeader
        data-testid={`accordion_${ctx.step.toLocaleLowerCase()}`}
        className="group"
        onClick={handleSelection}
      >
        <AccordionTitle>{header}</AccordionTitle>
        <AccordionIcon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <title>Accordion icon</title>
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </AccordionIcon>
      </AccordionTabHeader>
      <AccordionBody>{children}</AccordionBody>
    </AccordionTab>
  )
}

const Wrapper = styled.div`
  ${tw`-mx-5 md:-mx-0`}
`
const AccordionTab = styled.div`
  ${tw`outline-none bg-white shadow-bottom mb-2 px-5 md:px-0 md:mb-0 md:shadow-none md:border-b`}

  &[tabindex='3'] {
    ${tw`md:mb-5`}
  }
`
const AccordionTabHeader = styled.div`
  ${tw`text-black relative flex items-start justify-between pb-3 pt-5 cursor-pointer transition ease-in-out duration-100 focus:bg-gray-400 md:pt-6 md:pb-0`}
  .disabled & {
    ${tw`pointer-events-none`}
  }
`
const AccordionTitle = styled.div`
  ${tw`transition ease-in-out duration-100`}
`
const AccordionIcon = styled.div`
  ${tw`transform transition ease-in-out duration-100`}
  .active & {
    ${tw`-rotate-180`}
  }

  .disabled & {
    ${tw`text-gray-300`}
  }
`
const AccordionBody = styled.div`
  ${tw`max-h-0 transition duration-100 ease-in opacity-0`}
  .active & {
    ${tw`max-h-full opacity-100`}
  }

  .disabled & {
    ${tw`max-h-0 opacity-0`}
  }
`
