import { PaymentMethodRadioButton } from "@commercelayer/react-components"
import styled from "styled-components"
import tw from "twin.macro"

import { CheckCss } from "components/ui/form/CheckBox"
import { RadioCss } from "components/ui/form/RadioButton"

export const PaymentWrapper = styled.div`
  ${tw`will-change-transform text-black border border-gray-300 mb-5 p-4 rounded bg-gray-50 relative transition duration-200 ease-in hover:border-gray-400 group-hover:(cursor-pointer) group-first:mt-6 group-last:mb-0`}

  label {
    ${tw`group-hover:(cursor-pointer)`}
  }

  .payment.active & {
    ${tw`border-2 border-primary bg-white cursor-default shadow-md`}

    input[type="radio"] + label {
      ${tw`pointer-events-none cursor-default`}
    }
  }
`
export const PaymentSummary = styled.div`
  ${tw`flex flex-row justify-around text-sm items-center`}
`
export const PaymentSummaryItem = styled.div`
  ${tw`flex flex-1 font-bold leading-none`}
`
export const PaymentRadioContainer = styled.div`
  ${tw`hidden`}
`
export const PaymentSummaryValue = styled.p`
  ${tw`flex font-bold uppercase text-ss leading-8`}
`
export const PaymentSourceContainer = styled.div`
  ${tw`mt-2 hidden opacity-0 transition delay-700 duration-100 ease-in-out`}

  .payment.active & {
    ${tw`block opacity-100`}
  }

  .adyen-checkout__input-wrapper {
    ${tw`transition duration-300 ease-in-out`}
  }
  .adyen-checkout__input-wrapper:hover {
    ${tw`border-gray-200`}
  }

  .adyen-checkout__label--focused + .adyen-checkout__input-wrapper {
    ${tw`border-primary ring ring-offset-0 ring-primary-light ring-opacity-50 bg-white`}
  }

  .braintree-hosted-fields-focused {
    ${tw`border-primary ring ring-offset-0 ring-primary-light ring-opacity-50 bg-white`}
  }

  .adyen-checkout__label__text {
    ${tw`font-bold text-gray-700`}
  }

  .adyen-checkout-contextual-text {
    ${tw`text-gray-500`}
  }

  .frame--activated {
    ${tw`h-12 mb-3`}
    &.expiry-date-frame, 
    &.cvv-frame {
      ${tw`inline-block w-1/2 mb-0`}
    }
    &:last-of-type {
      ${tw`pl-3`}
    }
  }
`
export const PaymentDetailsWrapper = styled.div`
  ${tw`flex flex-row items-start justify-between lg:justify-start lg:items-center text-sm`}
`
export const PaymentItemTitle = styled.h5`
  ${tw`text-sm font-bold`}
`
export const ShippingLineItemQty = styled.p`
  ${tw`text-lg text-gray-500 lowercase pt-1`}
`
export const WalletCheckbox = styled.input`
  ${CheckCss}
`
export const StyledPaymentMethodRadioButton = styled(PaymentMethodRadioButton)`
  ${RadioCss}
`
