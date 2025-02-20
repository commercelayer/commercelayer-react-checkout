import { test, expect } from "../fixtures/tokenizedPage"

test.describe("with coupon code", () => {
  test.use({
    defaultParams: {
      order: "with-items",
      lineItemsAttributes: [
        { sku_code: "SOCKXXMUFFFFFF000000MXXX", quantity: 1 },
        { sku_code: "TSHIRTMMFFFFFFE63E74MXXX", quantity: 1 },
        { sku_code: "LSLEEVMM000000E63E74LXXX", quantity: 1 },
      ],
      couponCode: "flex_promotion_dynamic_value",
    },
  })

  test("should execute a checkout", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")
    await checkoutPage.setCustomerMail("test@commercelayer.io")
    await checkoutPage.setBillingAddress()
    await checkoutPage.checkStep("Customer", "open")
    await checkoutPage.save("Customer")
    await checkoutPage.checkStep("Shipping", "open")
    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })
    await checkoutPage.checkDiscountAmount("-€12,20")
  })
})