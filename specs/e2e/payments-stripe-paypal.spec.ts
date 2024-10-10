import { faker } from "@faker-js/faker"

import { test, expect } from "../fixtures/tokenizedPage"
import { euAddress } from "../utils/addresses"

test.describe("guest with PayPal", () => {
  const customerEmail = faker.internet.email().toLocaleLowerCase()

  test.use({
    defaultParams: {
      order: "with-items",
      orderAttributes: {
        customer_email: customerEmail,
      },
      lineItemsAttributes: [
        { sku_code: "CANVASAU000000FFFFFF1824", quantity: 1 },
      ],
      addresses: {
        billingAddress: euAddress,
        sameShippingAddress: true,
      },
    },
  })

  test("success", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.checkStep("Shipping", "open")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    await checkoutPage.selectPayment("stripe")

    await checkoutPage.setPayment("stripe-paypal")

    const element = checkoutPage.page.locator(
      "[data-testid=payment-save-wallet]"
    )
    await expect(element).not.toBeVisible()

    await checkoutPage.checkPaymentSummary("€10,00")

    await checkoutPage.save("Payment", undefined, true)

    await checkoutPage.page
      .getByRole("link", { name: "Authorize Test Payment" })
      .click()

    await checkoutPage.checkPaymentRecap("ending in ****", 15000)

    await checkoutPage.page.reload()

    await checkoutPage.checkPaymentRecap("ending in ****", 10000)
  })

  test("failing", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.checkStep("Shipping", "open")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    await checkoutPage.selectPayment("stripe")

    await checkoutPage.setPayment("stripe-paypal")

    const element = checkoutPage.page.locator(
      "[data-testid=payment-save-wallet]"
    )
    await expect(element).not.toBeVisible()

    await checkoutPage.checkPaymentSummary("€10,00")

    await checkoutPage.save("Payment", undefined, true)
    await checkoutPage.page
      .getByRole("link", { name: "Fail Test Payment" })
      .click()
  })
})
