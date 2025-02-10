import type { Address } from "@commercelayer/sdk"
import { Fragment } from "react"
import styled from "styled-components"
import tw from "twin.macro"

import { AddressInputGroup } from "components/composite/StepCustomer/AddressInputGroup"
import { useSettingsOrInvalid } from "components/hooks/useSettingsOrInvalid"

interface Props {
  shippingAddress: NullableType<Address>
}

export const ShippingAddressFormNew: React.FC<Props> = ({
  shippingAddress,
}: Props) => {
  const { settings } = useSettingsOrInvalid()

  if (!settings) {
    return null
  }

  const countries = settings?.config?.checkout?.shipping_countries
  const states = settings?.config?.checkout?.shipping_states
  const defaultCountry = settings?.config?.checkout?.default_country

  return (
    <Fragment>
      <Grid>
        <AddressInputGroup
          fieldName="shipping_address_first_name"
          resource="shipping_address"
          type="text"
          value={shippingAddress?.first_name || ""}
        />

        <AddressInputGroup
          fieldName="shipping_address_last_name"
          resource="shipping_address"
          type="text"
          value={shippingAddress?.last_name || ""}
        />
      </Grid>

      <AddressInputGroup
        fieldName="shipping_address_line_1"
        resource="shipping_address"
        type="text"
        value={shippingAddress?.line_1 || ""}
      />

      <AddressInputGroup
        fieldName="shipping_address_line_2"
        resource="shipping_address"
        required={false}
        type="text"
        value={shippingAddress?.line_2 || ""}
      />

      <Grid>
        <AddressInputGroup
          fieldName="shipping_address_city"
          resource="shipping_address"
          type="text"
          value={shippingAddress?.city || ""}
        />

        <AddressInputGroup
          fieldName="shipping_address_country_code"
          resource="shipping_address"
          countries={countries}
          defaultCountry={defaultCountry}
          type="text"
          value={shippingAddress?.country_code || ""}
        />
      </Grid>

      <Grid>
        <AddressInputGroup
          fieldName="shipping_address_state_code"
          resource="shipping_address"
          states={states}
          type="text"
          value={shippingAddress?.state_code || ""}
        />

        <AddressInputGroup
          fieldName="shipping_address_zip_code"
          resource="shipping_address"
          type="text"
          value={shippingAddress?.zip_code || ""}
        />
      </Grid>

      <AddressInputGroup
        fieldName="shipping_address_phone"
        resource="shipping_address"
        type="tel"
        value={shippingAddress?.phone || ""}
      />
    </Fragment>
  )
}

const Grid = styled.div`
  ${tw`grid lg:grid-cols-2 lg:gap-4`}
`
