import { Address, AddressField } from "@commercelayer/react-components"
import type { Address as AddressCollection } from "@commercelayer/sdk"

interface AddressCardProps {
  addressType: "shipping" | "billing"
  addresses?: AddressCollection[]
  deselect: boolean
  onSelect?: (address: AddressCollection) => void
}

export const CustomerAddressCard: React.FC<AddressCardProps> = ({
  addressType,
  addresses,
  deselect,
  onSelect,
}) => {
  const dataTestId =
    addressType === "billing"
      ? "customer-billing-address"
      : "customer-shipping-address"
  return (
    <Address
      data-testid={dataTestId}
      addresses={addresses}
      className={`text-black p-3 rounded border ${
        onSelect && "hover:border-gray-400 cursor-pointer"
      } transition duration-200 ease-in`}
      selectedClassName="!border-2 border-primary shadow-md bg-gray-50"
      deselect={deselect}
      onSelect={(address) => onSelect?.(address as AddressCollection)}
      disabledClassName="opacity-50 cursor-not-allowed"
    >
      {
        <AddressField>
          {({ address }) => (
            <CustomAddress
              firstName={address.first_name}
              lastName={address.last_name}
              city={address.city}
              line1={address.line_1}
              line2={address.line_2}
              zipCode={address.zip_code}
              stateCode={address.state_code}
              countryCode={address.country_code}
              phone={address.phone}
              addressType={addressType}
            />
          )}
        </AddressField>
      }
    </Address>
  )
}

interface AddressProps {
  firstName: NullableType<string>
  lastName: NullableType<string>
  city: NullableType<string>
  line1: NullableType<string>
  line2: NullableType<string>
  zipCode: NullableType<string>
  stateCode: NullableType<string>
  countryCode: NullableType<string>
  phone: NullableType<string>
  addressType: NullableType<string>
}

export const CustomAddress = ({
  firstName,
  lastName,
  city,
  line1,
  line2,
  zipCode,
  stateCode,
  countryCode,
  phone,
  addressType,
}: AddressProps) => (
  <>
    <p className="font-bold text-md" data-testid={`fullname_${addressType}`}>
      {firstName} {lastName}
    </p>
    <p
      className="text-sm text-gray-500"
      data-testid={`full_address_${addressType}`}
    >
      {[line1, line2].join(", ")}
      <br />
      {zipCode} {city} - {stateCode} ({countryCode})
      <br />
      {phone}
    </p>
  </>
)
