import { test, expect } from "../fixtures/tokenizedPage"

test.describe("with coupon code", () => {
  test.use({
    defaultParams: {
      order: "with-items",
      lineItemsAttributes: [
        { sku_code: "SWEETSMUB7B7B7E63E74LXXX", quantity: 5 },
      ],
      couponCode: "flex_promotion_fixed_price",
    },
  })

  test("should execute a checkout", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")
    await checkoutPage.checkDiscountAmount("-€162,5")
  })
})