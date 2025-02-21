import { faker } from "@faker-js/faker"

import { test } from "../fixtures/tokenizedPage"
import {euAddressNoBillingInfo} from "../utils/addresses"

const customerEmail = faker.internet.email().toLocaleLowerCase()

test.describe("optional billing info enabled", () => {
  test.use({
    defaultParams: {
      order: "with-items",
      market: "IE",
      lineItemsAttributes: [
        { sku_code: "BABYONBU000000E63E7412MX", quantity: 2 },
      ],
      orderAttributes: {
        customer_email: customerEmail,
      },
      organization: {
        config: {
          mfe: {
            default: {
              checkout: {
                optional_billing_info: true
              }
            }
          }
        },
      },
    },
  })

  test("should display billing info", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.checkStep("Customer", "open")
    await checkoutPage.isVisibleBillingInfo(true)
  })

  test("should save billing address without billing info", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")
    await checkoutPage.checkStep("Customer", "open")
    await checkoutPage.isVisibleBillingInfo(true)
    await checkoutPage.setBillingAddress(euAddressNoBillingInfo)
    await checkoutPage.save("Customer")
    await checkoutPage.checkStep("Customer", "close")
    await checkoutPage.checkStep("Shipping", "close")
    await checkoutPage.checkStep("Payment", "open")
  })

  test("should save billing address with billing info", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.checkStep("Customer", "open")
    await checkoutPage.isVisibleBillingInfo(true)
    await checkoutPage.setBillingAddress({...euAddressNoBillingInfo, billing_info: "00CDEFGHIJKLMNOPQRSTUVWYXZ"})
    await checkoutPage.save("Customer")
    await checkoutPage.checkStep("Customer", "close")
    await checkoutPage.checkStep("Shipping", "close")
    await checkoutPage.checkStep("Payment", "open")
  })

  test("should save billing address with billing info and remove it", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.checkStep("Customer", "open")
    await checkoutPage.isVisibleBillingInfo(true)
    await checkoutPage.setBillingAddress({...euAddressNoBillingInfo, billing_info: "00CDEFGHIJKLMNOPQRSTUVWYXZ"})
    await checkoutPage.save("Customer")
    await checkoutPage.checkStep("Customer", "close")
    await checkoutPage.checkStep("Shipping", "close")
    await checkoutPage.checkStep("Payment", "open")
    await checkoutPage.clickStep("Customer")
    await checkoutPage.page.fill("[data-testid=input_billing_address_billing_info]","")
    await checkoutPage.save("Customer")
    await checkoutPage.checkStep("Customer", "close")
    await checkoutPage.checkStep("Shipping", "close")
    await checkoutPage.checkStep("Payment", "open")
    await checkoutPage.clickStep("Customer")
    await checkoutPage.checkAddress({address: euAddressNoBillingInfo, type: "billing_address"})

  })
})


test.describe("optional billing info disabled", () => {
  test.use({
    defaultParams: {
      order: "with-items",
      market: "IE",
      lineItemsAttributes: [
        { sku_code: "BABYONBU000000E63E7412MX", quantity: 2 },
      ],
      orderAttributes: {
        customer_email: customerEmail,
      },
      organization: {
        config: {
          mfe: {
            default: {
              checkout: {
                optional_billing_info: false
              }
            }
          }
        },
      },
    },
  })

  test("should display billing info", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.checkStep("Customer", "open")
    await checkoutPage.isVisibleBillingInfo(false)
  })
})
