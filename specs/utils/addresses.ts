import { Address } from "@commercelayer/sdk"

export const euAddress: Partial<Address> = {
  first_name: "Darth",
  last_name: "Vader",
  line_1: "Via Morte Nera, 13",
  line_2: "Ragnatela, 99",
  city: "Cogorno",
  country_code: "IT",
  state_code: "GE",
  zip_code: "16030",
  phone: "+39 055 1234567890",
  billing_info: "ABCDEFGHIJKLMNOPQRSTUVWYXZ",
}

export const euAddressNoBillingInfo: Partial<Address> = {
  first_name: "Darth",
  last_name: "Vader",
  line_1: "Via Morte Nera, 13",
  line_2: "Ragnatela, 99",
  city: "Cogorno",
  country_code: "IT",
  state_code: "GE",
  zip_code: "16030",
  phone: "+39 055 1234567890"
}

export const euAddress2: Partial<Address> = {
  first_name: "Spider",
  last_name: "Man",
  line_1: "18 Pl. du Marché Saint-Honoré",
  line_2: "interno 1",
  city: "Paris",
  country_code: "FR",
  state_code: "PA",
  zip_code: "75001",
  phone: "+33 7 40 00 00 00",
  billing_info: "0ABCDEFGHIJKLMNOPQRSTUVWYX",
}

export const euAddress3: Partial<Address> = {
  first_name: "Sponge",
  last_name: "Bob",
  line_1: "Sott'acqua, 1",
  line_2: "Via Morte Nera, 13",
  city: "Besciamella",
  country_code: "IT",
  state_code: "TO",
  zip_code: "010101",
  phone: "+39 123 321123123",
  billing_info: "00CDEFGHIJKLMNOPQRSTUVWYXZ",
}

export const euAddress4: Partial<Address> = {
  first_name: "John",
  last_name: "Doe",
  line_1: "Avenue de Paris 10",
  line_2: "",
  city: "Paris",
  country_code: "FR",
  state_code: "PR",
  zip_code: "31000",
  phone: "+33 022 320132010",
  billing_info: "BMNDFT32F12D123W",
}

export const usAddress: Partial<Address> = {
  first_name: "Tim",
  last_name: "Cook",
  line_1: "1 Infinite Loop",
  city: "Cupertino",
  country_code: "US",
  state_code: "CA",
  zip_code: "95014",
  phone: "+1 123 321123123",
}

export const deAddress: Partial<Address> = {
  first_name: "Tim",
  last_name: "Cook",
  line_1: "Berlinstrasse Str. 23",
  city: "Munich",
  country_code: "DE",
  state_code: "Munich",
  zip_code: "80336",
  phone: "+49 89 242078610",
  billing_info: "MSNREW78D12D612W",
}

export function composeForCheck(address: Partial<Address>) {
  return `${address.first_name} ${address.last_name}${address.line_1}${
    address.line_2 ? `, ${address.line_2}` : ""
  }${address.zip_code} ${address.city} - ${address.state_code} (${
    address.country_code
  })${address.phone}`
}
