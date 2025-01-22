import { test, expect } from "../fixtures/tokenizedPage"

test.describe("with coupon code", () => {
  test.use({
    defaultParams: {
      order: "with-items",
      lineItemsAttributes: [
        {
          sku_code: "DUFFLBAG000000FFFFFFXXXX",
          quantity: 1,
          sku_options: [
            {
              name: "Premium zipper",
            }
          ]
        }
      ],
      couponCode: "flex_promotion_nested_country_code",
    },
  })

  test("should execute a checkout", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")
    await checkoutPage.setCustomerMail("prospect@commercelayer.io")
    await checkoutPage.setBillingAddress()
    await checkoutPage.checkStep("Customer", "open")
    await checkoutPage.save("Customer")
    await checkoutPage.checkStep("Shipping", "open")
    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })
    await checkoutPage.checkDiscountAmount("-€25,00")
  })
})