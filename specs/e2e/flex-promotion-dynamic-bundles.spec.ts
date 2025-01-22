import { test, expect } from "../fixtures/tokenizedPage"

test.describe("with coupon code", () => {
  test.use({
    defaultParams: {
      order: "with-items",
      lineItemsAttributes: [
        { sku_code: "5PANECAP9D9CA1FFFFFFXXXX", quantity: 2 },
        { sku_code: "CROPTOPW000000FFFFFFLXXX", quantity: 2 },
        { sku_code: "CROPTOPWE8E8E8000000XSXX", quantity: 1 },
        { sku_code: "HOODIEWC000000FFFFFFLXXX", quantity: 1 },
      ],
      couponCode: "flex_promotion_dynamic_bundles",
    },
  })

  test("should execute a checkout", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")
    await checkoutPage.checkDiscountAmount("-€37,86")
  })
})