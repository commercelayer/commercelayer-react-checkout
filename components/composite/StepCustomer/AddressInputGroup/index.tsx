import AddressCountrySelector from "@commercelayer/react-components/addresses/AddressCountrySelector"
import AddressInput from "@commercelayer/react-components/addresses/AddressInput"
import AddressStateSelector from "@commercelayer/react-components/addresses/AddressStateSelector"
import { Errors } from "@commercelayer/react-components/errors/Errors"
import type {
  Country,
  States,
} from "@commercelayer/react-components/lib/esm/utils/countryStateCity"
import { type ChangeEvent, useContext } from "react"
import { useTranslation } from "react-i18next"
import styled from "styled-components"
import tw from "twin.macro"

import {
  type ShippingToggleProps,
  evaluateShippingToggle,
} from "components/composite/StepCustomer"
import { AppContext } from "components/data/AppProvider"
import { ErrorCss } from "components/ui/form/Error"
import { InputCss } from "components/ui/form/Input"
import { Label } from "components/ui/form/Label"

type TFieldName =
  | Parameters<typeof AddressCountrySelector>[0]["name"]
  | Parameters<typeof AddressInput>[0]["name"]
  | Parameters<typeof AddressStateSelector>[0]["name"]

type TInputType = JSX.IntrinsicElements["input"]["type"]
type TResource = Parameters<typeof Errors>[0]["resource"]
type TMessages = Parameters<typeof Errors>[0]["messages"]

interface Props {
  type: TInputType
  fieldName: TFieldName
  resource: TResource
  required?: boolean
  value?: string
  countries?: Country[] | undefined
  defaultCountry?: string
  states?: States[]
  pattern?: React.ComponentProps<typeof AddressInput>["pattern"]
  openShippingAddress?: (props: ShippingToggleProps) => void
}

export const AddressInputGroup: React.FC<Props> = ({
  fieldName,
  resource,
  required,
  type,
  pattern,
  countries,
  defaultCountry,
  states,
  value,
  openShippingAddress,
}) => {
  const { t } = useTranslation()

  const messages: TMessages = [
    {
      code: "VALIDATION_ERROR",
      resource: "billing_address",
      field: fieldName,
      message: t("input.mustBeValidFormat"),
    },
    {
      code: "VALIDATION_ERROR",
      resource: "shipping_address",
      field: fieldName,
      message: t("input.mustBeValidFormat"),
    },
    {
      code: "EMPTY_ERROR",
      resource: "billing_address",
      field: fieldName,
      message: t("input.cantBlank"),
    },
    {
      code: "EMPTY_ERROR",
      resource: "shipping_address",
      field: fieldName,
      message: t("input.cantBlank"),
    },
  ]

  const appCtx = useContext(AppContext)

  let shippingCountryCodeLock: NullableType<string> = ""

  if (appCtx) {
    shippingCountryCodeLock = appCtx.shippingCountryCodeLock
  }

  const label = t(`addressForm.${fieldName}`)

  const isCountry =
    fieldName === "shipping_address_country_code" ||
    fieldName === "billing_address_country_code"

  const isState =
    fieldName === "shipping_address_state_code" ||
    fieldName === "billing_address_state_code"

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (isCountry && fieldName === "billing_address_country_code") {
      const countryCode = event.target.value

      openShippingAddress?.(
        evaluateShippingToggle({ countryCode, shippingCountryCodeLock }),
      )
    }
  }

  function renderInput() {
    if (isCountry) {
      return (
        <>
          <StyledAddressCountrySelector
            id={fieldName}
            className="form-select"
            data-testid={`input_${fieldName}`}
            name={fieldName}
            placeholder={{
              label: t(`addressForm.${fieldName}_placeholder`),
              value: "",
            }}
            onChange={handleChange}
            countries={countries}
            value={
              shippingCountryCodeLock &&
              fieldName === "shipping_address_country_code"
                ? shippingCountryCodeLock
                : value === "" || value == null
                  ? defaultCountry
                  : value
            }
            disabled={Boolean(
              shippingCountryCodeLock &&
                fieldName === "shipping_address_country_code",
            )}
          />
          <Label htmlFor={fieldName}>{label}</Label>
        </>
      )
    }
    if (isState) {
      return (
        <>
          <StyledAddressStateSelector
            id={fieldName}
            selectClassName="form-select"
            inputClassName="form-input"
            data-testid={`input_${fieldName}`}
            // @ts-expect-error missing
            states={states}
            name={fieldName}
            value={value}
          />
          <Label htmlFor={fieldName}>{label}</Label>
        </>
      )
    }
    return (
      <>
        <StyledAddressInput
          id={fieldName}
          required={required}
          data-testid={`input_${fieldName}`}
          name={fieldName}
          type={type}
          pattern={pattern}
          value={value}
          className="form-input"
        />
        <Label htmlFor={fieldName}>{label}</Label>
      </>
    )
  }

  return (
    <div className="mb-8">
      <Wrapper>
        <div className="relative h-10">{renderInput()}</div>
      </Wrapper>
      <StyledErrors
        data-testid={`error_${fieldName}`}
        resource={resource}
        field={fieldName}
        messages={messages}
      />
    </div>
  )
}

const Wrapper = styled.div`
  position: relative;
`

const StyledAddressInput = styled(AddressInput)`
  ${InputCss}
  &.hasError {
    ${tw`border-red-400 border-2 focus:ring-offset-0 focus:ring-red-400 focus:ring-opacity-50`}
  }
`

const StyledAddressCountrySelector = styled(AddressCountrySelector)`
  ${InputCss}
  &:disabled {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='h-2 w-2' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z' clip-rule='evenodd' /%3E%3C/svg%3E");
    background-size: 1rem;
  }
  ${tw`disabled:bg-gray-50`}
`

const StyledAddressStateSelector = styled(AddressStateSelector)`
  ${InputCss}
  &.hasError {
    ${tw`border-red-400 border-2 focus:ring-offset-0 focus:ring-red-400 focus:ring-opacity-50`}
  }
`

const StyledErrors = styled(Errors)`
  ${ErrorCss}
`
