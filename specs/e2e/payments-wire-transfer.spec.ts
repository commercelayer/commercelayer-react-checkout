import { faker } from "@faker-js/faker"

import { test, expect } from "../fixtures/tokenizedPage"
import { euAddress } from "../utils/addresses"

test.describe("guest with wire transfer", () => {
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

  test("Checkout", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    await checkoutPage.checkButton({ type: "Payment", status: "disabled" })

    await checkoutPage.selectPayment("wire")

    await checkoutPage.checkButton({ type: "Payment", status: "enabled" })

    await checkoutPage.save("Payment")

    await checkoutPage.checkPaymentRecap("Manual payment")

    await checkoutPage.page.reload()

    await checkoutPage.checkPaymentRecap("Manual payment")
  })

  test("Change method and checkout", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    await checkoutPage.selectPayment("stripe")

    const element = await checkoutPage.page.locator(
      "[data-testid=payment-save-wallet]"
    )
    expect(element).not.toBeVisible()

    await checkoutPage.setPayment("stripe")

    await checkoutPage.checkPaymentSummary("€10,00")

    await checkoutPage.checkButton({ type: "Payment", status: "enabled" })

    await checkoutPage.selectPayment("wire")
    await checkoutPage.page.waitForTimeout(1500)

    await checkoutPage.checkButton({ type: "Payment", status: "enabled" })

    await checkoutPage.save("Payment")
  })
})
