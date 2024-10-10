import { faker } from "@faker-js/faker"

import { test, expect } from "../fixtures/tokenizedPage"
import { euAddress } from "../utils/addresses"

const customerEmail = faker.internet.email().toLocaleLowerCase()
const customerPassword = faker.internet.password()

test.describe("customer with Stripe without saving", () => {
  test.use({
    defaultParams: {
      order: "with-items",
      orderAttributes: {
        customer_email: customerEmail,
      },
      customer: {
        email: customerEmail,
        password: customerPassword,
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

  test("Checkout order", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.checkStep("Shipping", "open")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    await checkoutPage.selectPayment("stripe")

    const element = checkoutPage.page.locator(
      "[data-testid=payment-save-wallet]"
    )
    await expect(element).toBeVisible()
    await expect(element).not.toBeChecked()

    await checkoutPage.setPayment("stripe")

    await checkoutPage.checkPaymentSummary("€10,00")

    await checkoutPage.save("Payment")
  })
})

test.describe("customer with Stripe with saving", () => {
  test.describe.configure({ mode: "serial" })

  test.use({
    defaultParams: {
      order: "with-items",
      orderAttributes: {
        customer_email: customerEmail,
      },
      customer: {
        email: customerEmail,
        password: customerPassword,
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

  test("Checkout order and save customer wallet", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.checkStep("Shipping", "open")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    await checkoutPage.selectPayment("stripe")

    await checkoutPage.setPayment("stripe")

    await checkoutPage.checkPaymentSummary("€10,00")

    let element = checkoutPage.page.locator("[data-testid=payment-save-wallet]")
    await expect(element).toBeVisible()
    await expect(element).not.toBeChecked()
    await checkoutPage.page.waitForTimeout(2000)
    await element.check({ force: true })
    element = checkoutPage.page.locator("[data-testid=payment-save-wallet]")
    await expect(element).toBeChecked()

    await checkoutPage.save("Payment")
  })

  test("Checkout order with customer wallet", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.checkStep("Shipping", "open")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    await checkoutPage.selectPayment("stripe")

    await checkoutPage.page.waitForTimeout(1000)

    await checkoutPage.useCustomerCard()

    await checkoutPage.page.waitForTimeout(2000)

    await checkoutPage.checkPaymentSummary("€10,00")
    await checkoutPage.page.waitForTimeout(2000)

    await checkoutPage.save("Payment")
  })

  test("Checkout order selecting customer wallet and refreshing the page", async ({
    checkoutPage,
  }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.checkStep("Shipping", "open")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    await checkoutPage.selectPayment("stripe")

    await checkoutPage.page.waitForTimeout(1000)

    await checkoutPage.useCustomerCard()

    await checkoutPage.page.waitForTimeout(2000)

    await checkoutPage.page.reload()

    await checkoutPage.checkPaymentSummary("€10,00")
    await checkoutPage.page.waitForTimeout(2000)

    await checkoutPage.save("Payment")
  })
})

test.describe("guest with Stripe", () => {
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

  test("checkout", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.checkStep("Shipping", "open")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    await checkoutPage.selectPayment("stripe")

    await checkoutPage.setPayment("stripe")

    const element = checkoutPage.page.locator(
      "[data-testid=payment-save-wallet]"
    )
    await expect(element).not.toBeVisible()

    await checkoutPage.setPayment("stripe")

    await checkoutPage.checkPaymentSummary("€10,00")

    await checkoutPage.save("Payment")

    await checkoutPage.checkPaymentRecap("Visa ending in 4242")

    await checkoutPage.page.reload()

    await checkoutPage.checkPaymentRecap("Visa ending in 4242")
  })

  test("checkout changing shipping method", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.checkStep("Shipping", "open")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    await checkoutPage.selectPayment("stripe")

    await checkoutPage.page.waitForTimeout(3000)

    await checkoutPage.checkPaymentSummary("€10,00")

    await checkoutPage.clickStep("Shipping")
    await checkoutPage.selectShippingMethod({ text: "Express Delivery" })

    await checkoutPage.save("Shipping")
    await checkoutPage.page.waitForTimeout(5000)
    // await checkoutPage.selectPayment("stripe")
    await checkoutPage.setPayment("stripe")

    await checkoutPage.save("Payment")
  })

  test("generic card decline then valid", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.checkStep("Shipping", "open")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    await checkoutPage.selectPayment("stripe")

    await checkoutPage.setPayment("stripe", { number: "4000000000000002" })

    await checkoutPage.save("Payment", undefined, true)

    await checkoutPage.checkPaymentError({
      type: "stripe",
      text: "Your card has been declined.",
    })
    await checkoutPage.setPayment("stripe")

    await checkoutPage.save("Payment")
    await checkoutPage.checkPaymentRecap("Visa ending in 4242")
  })

  test("checkout with 3DS card", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.checkStep("Shipping", "open")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    await checkoutPage.selectPayment("stripe")

    await checkoutPage.setPayment("stripe", {
      number: "4000002500003155",
      exp: "03/35",
      cvc: "123",
    })

    const element = await checkoutPage.page.locator(
      "[data-testid=payment-save-wallet]"
    )
    await expect(element).not.toBeVisible()

    await checkoutPage.checkPaymentSummary("€10,00")

    await checkoutPage.save("Payment", undefined, true)

    await checkoutPage.page.waitForTimeout(6000)

    const myFrames = checkoutPage.page.frames()

    await myFrames[myFrames.length - 1]
      .locator("#test-source-authorize-3ds")
      .click()

    await checkoutPage.checkPaymentRecap("Visa ending in 3155", 10000)

    await checkoutPage.page.reload()

    await checkoutPage.checkPaymentRecap("Visa ending in 3155")
  })
})
