import {
  Errors,
  PlaceOrderButton,
  PrivacyAndTermsCheckbox,
} from "@commercelayer/react-components"
import styled from "styled-components"
import tw from "twin.macro"

import { ButtonCss, ButtonWrapper } from "components/ui/Button"
import { CheckCss } from "components/ui/form/CheckBox"
import { ErrorCss } from "components/ui/form/Error"

interface StyledPlaceOrderButtonProps {
  isActive: boolean
}

export const ErrorWrapper = styled.div`
  ${tw`bg-red-50 flex justify-center border border-2 border-red-400 ml-8 `}
  & + & {
    ${tw`mb-10 mt-5`}
  }
`
export const ErrorIco = styled.div`
  ${tw`flex items-center bg-red-400`}
`
export const ErrorMessage = styled.div`
  ${ErrorCss}
  ${tw`flex-1 pt-0 pl-0 text-sm p-3 break-words break-all`}
`
export const StyledErrors = styled(Errors)`
  ${ErrorCss}
  ${tw`pt-0 pl-0 text-sm p-3`}
`
export const ErrorsContainer = styled.div`
  & > div:only-of-type {
    ${tw`mb-10`}
  }
`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomPlaceOrderButton = (props: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isActive, ...rest } = props
  return <PlaceOrderButton {...rest} />
}

export const StyledPlaceOrderButton = styled(
  CustomPlaceOrderButton,
)<StyledPlaceOrderButtonProps>`
  ${ButtonCss}
  ${({ isActive }) => (isActive ? null : tw`md:hidden`)}
`
export const StyledPrivacyAndTermsCheckbox = styled(PrivacyAndTermsCheckbox)`
  ${CheckCss}
`
export const PlaceOrderButtonWrapper = styled(ButtonWrapper)`
  ${tw`fixed w-full bottom-9 p-5 bg-gray-50 z-20 border-t md:(static flex justify-end z-auto p-0 bg-white border-0)`}
  &::before {
    ${tw`top-0 absolute left-0 w-full z-10 h-2 shadow-top md:hidden`}

    content: "";
  }
`
