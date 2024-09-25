import { faker } from "@faker-js/faker"

import { test, expect } from "../fixtures/tokenizedPage"
import { euAddress, usAddress } from "../utils/addresses"

const TIMEOUT = 200

const customerEmail = faker.internet.email().toLocaleLowerCase()

test.describe("multi shipments", () => {
  test.use({
    defaultParams: {
      order: "with-items",
      orderAttributes: {
        customer_email: customerEmail,
        terms_url: "https://www.google.it",
        privacy_url: "https://www.google.it",
      },
      organization: {
        gtm_id_test: "GTM-123456",
      },
      lineItemsAttributes: [
        { sku_code: "CANVASAU000000FFFFFF1824", quantity: 1 },
        { sku_code: "TSHIRTMMFFFFFF000000XLXX", quantity: 5 },
      ],
      addresses: {
        billingAddress: euAddress,
        sameShippingAddress: true,
      },
    },
  })

  test("check begin and shipments", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")
    let dataLayer = await checkoutPage.getDataLayer("begin_checkout")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.value).toBe(244)
    expect(dataLayer[0].ecommerce.items?.length).toBe(2)
    expect(
      dataLayer[0].ecommerce.items?.filter(
        (item) => item?.item_id === "CANVASAU000000FFFFFF1824"
      )
    ).toHaveLength(1)

    await checkoutPage.checkStep("Shipping", "open")
    // await checkoutPage.page.waitForTimeout(TIMEOUT)

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })
    // await checkoutPage.page.waitForTimeout(TIMEOUT)
    await checkoutPage.selectShippingMethod({
      text: "Standard Shipping",
      shipment: 1,
    })
    await checkoutPage.page.waitForTimeout(TIMEOUT * 10)

    await checkoutPage.save("Shipping")

    await checkoutPage.page.waitForTimeout(TIMEOUT * 10)

    dataLayer = await checkoutPage.getDataLayer("add_shipping_info")
    expect(dataLayer.length).toBe(2)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.shipping_tier).toBe("Standard Shipping")
    expect(dataLayer[0].ecommerce.value).toBe(0)
    expect(dataLayer[0].ecommerce.items?.length).toBe(1)

    expect(dataLayer[1].ecommerce.currency).toBe("EUR")
    expect(dataLayer[1].ecommerce.shipping_tier).toBe("Standard Shipping")
    expect(dataLayer[1].ecommerce.value).toBe(0)
    expect(dataLayer[1].ecommerce.items?.length).toBe(1)

    await checkoutPage.clickStep("Shipping")

    // await checkoutPage.page.waitForTimeout(TIMEOUT)
    await checkoutPage.selectShippingMethod({ text: "Express Delivery" })
    // await checkoutPage.page.waitForTimeout(TIMEOUT)
    await checkoutPage.selectShippingMethod({
      text: "Express Delivery",
      shipment: 1,
    })
    await checkoutPage.page.waitForTimeout(TIMEOUT * 10)

    await checkoutPage.save("Shipping")
    await checkoutPage.page.waitForTimeout(TIMEOUT * 10)

    dataLayer = await checkoutPage.getDataLayer("add_shipping_info")
    expect(dataLayer.length).toBe(4)
    expect(dataLayer[2].ecommerce.currency).toBe("EUR")
    expect(dataLayer[2].ecommerce.shipping_tier).toBe("Express Delivery")
    expect(dataLayer[2].ecommerce.value).toBe(12)
    expect(dataLayer[2].ecommerce.items?.length).toBe(1)

    expect(dataLayer[3].ecommerce.currency).toBe("EUR")
    expect(dataLayer[3].ecommerce.shipping_tier).toBe("Express Delivery")
    expect(dataLayer[3].ecommerce.value).toBe(12)
    expect(dataLayer[3].ecommerce.items?.length).toBe(1)

    await checkoutPage.clickStep("Shipping")
    await checkoutPage.page.waitForTimeout(TIMEOUT)

    // await checkoutPage.page.waitForTimeout(TIMEOUT)
    await checkoutPage.selectShippingMethod({ text: "Express Delivery" })
    // await checkoutPage.page.waitForTimeout(TIMEOUT)
    await checkoutPage.selectShippingMethod({
      text: "Standard Shipping",
      shipment: 1,
    })
    await checkoutPage.page.waitForTimeout(TIMEOUT * 10)

    await checkoutPage.save("Shipping")

    await checkoutPage.page.waitForTimeout(TIMEOUT * 10)
    dataLayer = await checkoutPage.getDataLayer("add_shipping_info")
    expect(dataLayer.length).toBe(6)
    expect(dataLayer[4].ecommerce.currency).toBe("EUR")
    expect(dataLayer[4].ecommerce.shipping_tier).toBe("Express Delivery")
    expect(dataLayer[4].ecommerce.value).toBe(12)
    expect(dataLayer[4].ecommerce.items?.length).toBe(1)

    expect(dataLayer[5].ecommerce.currency).toBe("EUR")
    expect(dataLayer[5].ecommerce.shipping_tier).toBe("Standard Shipping")
    expect(dataLayer[5].ecommerce.value).toBe(0)
    expect(dataLayer[5].ecommerce.items?.length).toBe(1)

    await checkoutPage.clickStep("Shipping")
    // await checkoutPage.page.waitForTimeout(TIMEOUT)

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })
    // await checkoutPage.page.waitForTimeout(TIMEOUT)
    await checkoutPage.selectShippingMethod({
      text: "Express Delivery",
      shipment: 1,
    })
    await checkoutPage.page.waitForTimeout(TIMEOUT * 10)

    await checkoutPage.save("Shipping")

    await checkoutPage.page.waitForTimeout(TIMEOUT * 10)
    dataLayer = await checkoutPage.getDataLayer("add_shipping_info")
    expect(dataLayer.length).toBe(8)
    expect(dataLayer[6].ecommerce.currency).toBe("EUR")
    expect(dataLayer[6].ecommerce.shipping_tier).toBe("Standard Shipping")
    expect(dataLayer[6].ecommerce.value).toBe(0)
    expect(dataLayer[6].ecommerce.items?.length).toBe(1)

    expect(dataLayer[7].ecommerce.currency).toBe("EUR")
    expect(dataLayer[7].ecommerce.shipping_tier).toBe("Express Delivery")
    expect(dataLayer[7].ecommerce.value).toBe(12)
    expect(dataLayer[7].ecommerce.items?.length).toBe(1)

    await checkoutPage.selectPayment("stripe")

    await checkoutPage.checkTermsAndPrivacyValue(false)
    await checkoutPage.setTermsAndPrivacy(true)
    await checkoutPage.checkTermsAndPrivacyValue(true)

    await checkoutPage.setPayment("stripe")
    await checkoutPage.save("Payment")
  })
})

test.describe("single shipment", () => {
  test.use({
    defaultParams: {
      order: "with-items",
      orderAttributes: {
        customer_email: customerEmail,
      },
      organization: {
        gtm_id_test: "GTM-123456",
      },
      lineItemsAttributes: [
        { sku_code: "CANVASAU000000FFFFFF1824", quantity: 1 },
        { sku_code: "SWEETHMUB7B7B7000000MXXX", quantity: 4 },
      ],
      addresses: {
        billingAddress: euAddress,
        sameShippingAddress: true,
      },
    },
  })

  test("check payment and purchase", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")
    let dataLayer = await checkoutPage.getDataLayer("begin_checkout")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.value).toBe(244)
    expect(dataLayer[0].ecommerce.items?.length).toBe(2)

    await checkoutPage.checkStep("Shipping", "open")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    dataLayer = await checkoutPage.getDataLayer("add_shipping_info")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.shipping_tier).toBe("Standard Shipping")
    expect(dataLayer[0].ecommerce.value).toBe(0)
    expect(dataLayer[0].ecommerce.items?.length).toBe(2)

    await checkoutPage.selectPayment("stripe")

    await checkoutPage.setPayment("stripe")

    await checkoutPage.save("Payment")

    dataLayer = await checkoutPage.getDataLayer("add_payment_info")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.payment_type).toBe("Stripe Payment")
    expect(dataLayer[0].ecommerce.value).toBe(10)
    expect(dataLayer[0].ecommerce.items?.length).toBe(2)

    dataLayer = await checkoutPage.getDataLayer("purchase")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.value).toBe(254)
    expect(dataLayer[0].ecommerce.shipping).toBe(0)
    expect(dataLayer[0].ecommerce.tax).toBe(0)

    const orderNumber = await checkoutPage.getOrderNumber()

    expect(dataLayer[0].ecommerce.transaction_id).toBe(
      orderNumber.replace("#", "")
    )
    expect(dataLayer[0].ecommerce.items?.length).toBe(2)
  })
})

test.describe("with single shipping method", () => {
  test.use({
    defaultParams: {
      organization: {
        gtm_id_test: "GTM-123456",
      },
      order: "with-items",
      market: "US",
      lineItemsAttributes: [
        { sku_code: "CANVASAU000000FFFFFF1824", quantity: 1 },
      ],
      orderAttributes: {
        customer_email: customerEmail,
      },
    },
  })

  test("fire add shipping info on autoselect", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.setBillingAddress(usAddress)
    await checkoutPage.save("Customer")

    let dataLayer = await checkoutPage.getDataLayer("begin_checkout")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("USD")
    expect(dataLayer[0].ecommerce.value).toBe(118.8)
    expect(dataLayer[0].ecommerce.items?.length).toBe(1)

    await checkoutPage.checkStep("Customer", "close")
    await checkoutPage.checkStep("Shipping", "close")
    await checkoutPage.checkStep("Payment", "open")

    dataLayer = await checkoutPage.getDataLayer("add_shipping_info")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("USD")
    expect(dataLayer[0].ecommerce.shipping_tier).toBe("Express Delivery")
    expect(dataLayer[0].ecommerce.value).toBe(7)
    expect(dataLayer[0].ecommerce.items?.length).toBe(1)
  })

  test("fire multiple time going back and forth", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.setBillingAddress(usAddress)
    await checkoutPage.save("Customer")

    let dataLayer = await checkoutPage.getDataLayer("begin_checkout")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("USD")
    expect(dataLayer[0].ecommerce.value).toBe(118.8)
    expect(dataLayer[0].ecommerce.items?.length).toBe(1)

    await checkoutPage.checkStep("Customer", "close")
    await checkoutPage.checkStep("Shipping", "close")
    await checkoutPage.checkStep("Payment", "open")

    dataLayer = await checkoutPage.getDataLayer("add_shipping_info")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("USD")
    expect(dataLayer[0].ecommerce.shipping_tier).toBe("Express Delivery")
    expect(dataLayer[0].ecommerce.value).toBe(7)
    expect(dataLayer[0].ecommerce.items?.length).toBe(1)

    await checkoutPage.clickStep("Shipping")
    await checkoutPage.save("Shipping")
    await checkoutPage.checkStep("Shipping", "close")

    dataLayer = await checkoutPage.getDataLayer("add_shipping_info")
    expect(dataLayer.length).toBe(2)
    expect(dataLayer[0].ecommerce.currency).toBe("USD")
    expect(dataLayer[0].ecommerce.shipping_tier).toBe("Express Delivery")
    expect(dataLayer[0].ecommerce.value).toBe(7)
    expect(dataLayer[0].ecommerce.items?.length).toBe(1)
  })
})

test.describe("with digital products", () => {
  test.use({
    defaultParams: {
      organization: {
        gtm_id_test: "GTM-123456",
      },
      order: "digital",
      market: "US",
      lineItemsAttributes: [
        { sku_code: "CANVASAU000000FFFFFF1824", quantity: 1 },
      ],
      orderAttributes: {
        customer_email: customerEmail,
      },
    },
  })

  test("do not fire add_shipping_info event", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")

    await checkoutPage.setBillingAddress(usAddress)
    await checkoutPage.save("Customer")

    let dataLayer = await checkoutPage.getDataLayer("begin_checkout")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("USD")
    expect(dataLayer[0].ecommerce.value).toBe(15)
    expect(dataLayer[0].ecommerce.items?.length).toBe(1)

    await checkoutPage.checkStep("Customer", "close")
    await checkoutPage.checkStep("Shipping", "not_present")
    await checkoutPage.checkStep("Payment", "open")

    dataLayer = await checkoutPage.getDataLayer("add_shipping_info")
    expect(dataLayer.length).toBe(0)

    await checkoutPage.selectPayment("wire")

    await checkoutPage.save("Payment")

    dataLayer = await checkoutPage.getDataLayer("add_payment_info")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("USD")
    expect(dataLayer[0].ecommerce.payment_type).toBe("Wire Transfer")
    expect(dataLayer[0].ecommerce.value).toBe(0)
    expect(dataLayer[0].ecommerce.items?.length).toBe(1)

    dataLayer = await checkoutPage.getDataLayer("purchase")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("USD")
    expect(dataLayer[0].ecommerce.value).toBe(18.3)
    expect(dataLayer[0].ecommerce.shipping).toBe(0)
    expect(dataLayer[0].ecommerce.tax).toBe(3.3)
  })
})

test.describe("with bundle", () => {
  test.use({
    defaultParams: {
      order: "with-items",
      orderAttributes: {
        customer_email: customerEmail,
      },
      organization: {
        gtm_id_test: "GTM-123456",
      },
      lineItemsAttributes: [{ bundle_code: "SHIRTSETSINGLE", quantity: 1 }],
      addresses: {
        billingAddress: euAddress,
        sameShippingAddress: true,
      },
    },
  })

  test("check payment and purchase", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")
    let dataLayer = await checkoutPage.getDataLayer("begin_checkout")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.value).toBe(105)
    expect(
      dataLayer[0].ecommerce.items?.filter(
        (item) => item?.item_id === "SHIRTSETSINGLE"
      )
    ).toHaveLength(1)

    expect(dataLayer[0].ecommerce.items?.length).toBe(1)

    await checkoutPage.checkStep("Shipping", "open")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    dataLayer = await checkoutPage.getDataLayer("add_shipping_info")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.shipping_tier).toBe("Standard Shipping")
    expect(dataLayer[0].ecommerce.value).toBe(0)
    expect(dataLayer[0].ecommerce.items?.length).toBe(2)

    await checkoutPage.selectPayment("stripe")

    await checkoutPage.setPayment("stripe")

    await checkoutPage.save("Payment")

    dataLayer = await checkoutPage.getDataLayer("add_payment_info")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.payment_type).toBe("Stripe Payment")
    expect(dataLayer[0].ecommerce.value).toBe(10)
    expect(dataLayer[0].ecommerce.items?.length).toBe(1)

    dataLayer = await checkoutPage.getDataLayer("purchase")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.value).toBe(115)
    expect(dataLayer[0].ecommerce.shipping).toBe(0)
    expect(dataLayer[0].ecommerce.tax).toBe(0)

    const orderNumber = await checkoutPage.getOrderNumber()

    expect(dataLayer[0].ecommerce.transaction_id).toBe(
      orderNumber.replace("#", "")
    )
    expect(dataLayer[0].ecommerce.items?.length).toBe(1)
  })

  test("check payment and purchase with redirect back from paypal", async ({
    checkoutPage,
  }) => {
    await checkoutPage.checkOrderSummary("Order Summary")
    let dataLayer = await checkoutPage.getDataLayer("begin_checkout")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.value).toBe(105)
    expect(
      dataLayer[0].ecommerce.items?.filter(
        (item) => item?.item_id === "SHIRTSETSINGLE"
      )
    ).toHaveLength(1)

    expect(dataLayer[0].ecommerce.items?.length).toBe(1)

    await checkoutPage.checkStep("Shipping", "open")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    dataLayer = await checkoutPage.getDataLayer("add_shipping_info")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.shipping_tier).toBe("Standard Shipping")
    expect(dataLayer[0].ecommerce.value).toBe(0)
    expect(dataLayer[0].ecommerce.items?.length).toBe(2)

    await checkoutPage.setPayment("paypal")

    await checkoutPage.save("Payment", "Paga con PayPal")

    dataLayer = await checkoutPage.getDataLayer("begin_checkout")
    expect(dataLayer.length).toBe(0)

    dataLayer = await checkoutPage.getDataLayer("add_payment_info")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.payment_type).toBe("Paypal Payment")
    expect(dataLayer[0].ecommerce.value).toBe(0)
    expect(dataLayer[0].ecommerce.items?.length).toBe(1)

    dataLayer = await checkoutPage.getDataLayer("purchase")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.value).toBe(105)
    expect(dataLayer[0].ecommerce.shipping).toBe(0)
    expect(dataLayer[0].ecommerce.tax).toBe(0)

    const orderNumber = await checkoutPage.getOrderNumber()

    expect(dataLayer[0].ecommerce.transaction_id).toBe(
      orderNumber.replace("#", "")
    )
    expect(dataLayer[0].ecommerce.items?.length).toBe(1)
  })

  test("avoid events when order placed on reload", async ({ checkoutPage }) => {
    await checkoutPage.checkOrderSummary("Order Summary")
    let dataLayer = await checkoutPage.getDataLayer("begin_checkout")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.value).toBe(105)
    expect(
      dataLayer[0].ecommerce.items?.filter(
        (item) => item?.item_id === "SHIRTSETSINGLE"
      )
    ).toHaveLength(1)

    expect(dataLayer[0].ecommerce.items?.length).toBe(1)

    await checkoutPage.checkStep("Shipping", "open")

    await checkoutPage.selectShippingMethod({ text: "Standard Shipping" })

    await checkoutPage.save("Shipping")

    await checkoutPage.selectPayment("stripe")

    await checkoutPage.setPayment("stripe")

    await checkoutPage.save("Payment")

    dataLayer = await checkoutPage.getDataLayer("add_payment_info")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.payment_type).toBe("Stripe Payment")
    expect(dataLayer[0].ecommerce.value).toBe(10)
    expect(dataLayer[0].ecommerce.items?.length).toBe(1)

    dataLayer = await checkoutPage.getDataLayer("purchase")
    expect(dataLayer.length).toBe(1)
    expect(dataLayer[0].ecommerce.currency).toBe("EUR")
    expect(dataLayer[0].ecommerce.value).toBe(115)
    expect(dataLayer[0].ecommerce.shipping).toBe(0)
    expect(dataLayer[0].ecommerce.tax).toBe(0)

    const orderNumber = await checkoutPage.getOrderNumber()

    expect(dataLayer[0].ecommerce.transaction_id).toBe(
      orderNumber.replace("#", "")
    )
    expect(dataLayer[0].ecommerce.items?.length).toBe(1)

    await checkoutPage.page.reload()

    await checkoutPage.checkPaymentRecap("Visa ending in 4242")

    dataLayer = await checkoutPage.getDataLayer("begin_checkout")
    expect(dataLayer.length).toBe(0)
  })
})
