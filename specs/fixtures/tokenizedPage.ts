import {
  createAssertion,
  authenticate,
  jwtDecode,
  jwtIsSalesChannel,
} from "@commercelayer/js-auth"
import { type MfeConfigs } from "@commercelayer/organization-config"
import {
  CommerceLayer,
  CommerceLayerClient,
  Address,
  AddressCreate,
} from "@commercelayer/sdk"
import { test as base } from "@playwright/test"
import dotenv from "dotenv"

import path from "path"

import { CheckoutPage } from "./CheckoutPage"

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") })

type OrderType =
  | "plain"
  | "no_line_items"
  | "bundle"
  | "bundle+skus"
  | "digital"
  | "gift-card"
  | "with-items"

interface BaseLineItemObject {
  quantity: number
  inventory?: number
  frequency?: string
  sku_options?: Array<Record<string, string | object>>
  final_quantity?: number
}

interface SkuItem extends BaseLineItemObject {
  sku_code: string
}

interface BundleItem extends BaseLineItemObject {
  bundle_code: string
}

type LineItemObject = SkuItem | BundleItem

interface GiftCardProps {
  currency_code?: "EUR" | "USD"
  balance_cents?: number
  customer_email?: string
  apply?: boolean
}

interface DefaultParamsProps {
  incognito?: boolean
  token?: string
  orderId?: string
  order?: OrderType
  market?: "EU" | "US" | "MI" | "IT" | "IE"
  customer?: {
    email: string
    password: string
  }
  organization?: {
    support_phone?: string
    support_email?: string
    gtm_id_test?: string
    config?: { mfe: MfeConfigs }
  }
  orderAttributes?: {
    language_code?: "en" | "it" | "it-IT"
    customer_email?: string
    shipping_country_code_lock?: "IT" | "GB" | "US"
    terms_url?: string
    privacy_url?: string
    cart_url?: string
    return_url?: string
  }
  lineItemsAttributes?: LineItemObject[]
  giftCardAttributes?: GiftCardProps
  customerAddresses?: Partial<Address>[]
  shippingMethods?: Array<
    "Standard Shipping" | "Express Delivery EU" | "Express Delivery US"
  >
  addresses?: {
    billingAddress?: Partial<Address>
    shippingAddress?: Partial<Address>
    sameShippingAddress?: boolean
  }
  couponCode?: string
}

type FixtureType = {
  checkoutPage: CheckoutPage
  defaultParams: DefaultParamsProps
}

const getToken = async (
  market?: "US" | "EU" | "MI" | "IT" | "IE",
  customerId?: string
) => {
  const scope = market != null ? `market:code:${market}` : "market:code:EU"

  if (customerId == null) {
    return (
      await authenticate("client_credentials", {
        domain: process.env.NEXT_PUBLIC_DOMAIN as string,
        clientId: process.env.E2E_CLIENT_ID as string,
        scope,
      })
    ).accessToken
  } else {
    return (
      await authenticate("urn:ietf:params:oauth:grant-type:jwt-bearer", {
        domain: process.env.NEXT_PUBLIC_DOMAIN as string,
        clientId: process.env.E2E_CLIENT_ID as string,
        clientSecret: process.env.E2E_CLIENT_SECRET as string,
        scope,
        assertion: await createAssertion({
          payload: {
            "https://commercelayer.io/claims": {
              owner: {
                type: "Customer",
                id: customerId,
              },
            },
          },
        }),
      })
    ).accessToken
  }
}

const getCustomerUserToken = async ({
  email,
  password,
  market = "EU",
}: {
  email: string
  password: string
  market?: "EU" | "US" | "MI" | "IT" | "IE"
}) => {
  const token = await getSuperToken()
  const cl = getClient(token)
  let customerId
  const existingUser = await cl.customers.list({
    filters: {
      email_eq: email,
    },
  })

  if (existingUser.length === 0) {
    customerId = (await cl.customers.create({ email, password })).id
  } else {
    customerId = existingUser[0].id
  }

  const scope = market

  return getToken(scope, customerId)
}

const getSuperToken = async () => {
  const token = await authenticate("client_credentials", {
    domain: process.env.NEXT_PUBLIC_DOMAIN as string,
    clientId: process.env.E2E_INTEGRATION_CLIENT_ID as string,
    clientSecret: process.env.E2E_INTEGRATION_CLIENT_SECRET as string,
  })

  return token.accessToken
}

const getOrder = async (
  cl: CommerceLayerClient,
  params: DefaultParamsProps
) => {
  const email = params.customer?.email || params.orderAttributes?.customer_email
  const attributes = {
    ...params.orderAttributes,
    customer_email: email,
  }

  const giftCard = params.giftCardAttributes
  const order = await cl.orders.create(attributes)
  let giftCardCode
  switch (params.order) {
    case "plain":
      await createDefaultLineItem(cl, order.id)
      break
    case "with-items": {
      let superToken: string | undefined
      let superCl: CommerceLayerClient | undefined

      const noStock =
        (params.lineItemsAttributes?.length || 0) > 0 &&
        (params.lineItemsAttributes?.filter(
          ({ inventory }) => inventory !== undefined && inventory >= 0
        ) as SkuItem[])

      if (noStock && noStock.length > 0) {
        superToken = await getSuperToken()
        superCl = getClient(superToken)
        await updateInventory(superCl, noStock, "quantity")
      }
      await createLineItems({
        cl,
        orderId: order.id,
        items: params.lineItemsAttributes || [],
      })
      if (noStock && noStock.length > 0) {
        superToken = await getSuperToken()
        superCl = getClient(superToken)
        await updateInventory(superCl, noStock, "inventory")
      }

      if (giftCard) {
        superToken = superToken || (await getSuperToken())
        superCl = superCl || getClient(superToken)
        const card = await createAndPurchaseGiftCard(cl, giftCard, true)
        const activeCard = await superCl.gift_cards.update({
          id: card.id,
          _activate: true,
        })
        if (giftCard.apply) {
          await cl.orders.update({
            id: order.id,
            gift_card_code: activeCard.code,
          })
        } else {
          giftCardCode = activeCard.code
        }
      }
      if (params.couponCode) {
        await cl.orders.update({
          id: order.id,
          coupon_code: params.couponCode,
        })
      }
      if (params.addresses && params.addresses.billingAddress) {
        const { billingAddress, shippingAddress, sameShippingAddress } =
          params.addresses
        const addressToAttach = await cl.addresses.create(
          billingAddress as AddressCreate
        )
        await cl.orders.update({
          id: order.id,
          billing_address: cl.addresses.relationship(addressToAttach),
          _shipping_address_same_as_billing: sameShippingAddress,
        })
        if (!sameShippingAddress && shippingAddress) {
          const addressToAttach = await cl.addresses.create(
            shippingAddress as AddressCreate
          )
          await cl.orders.update({
            id: order.id,
            shipping_address: cl.addresses.relationship(addressToAttach),
          })
        }
      }
      if (
        params.customer &&
        params.customerAddresses &&
        params.customerAddresses.length > 0
      ) {
        const token = await getCustomerUserToken({
          email: params.customer.email,
          password: params.customer.password,
          market: params.market,
        })
        const customerCl = getClient(token)
        const { payload } = jwtDecode(token)

        const promises = params.customerAddresses.map(async (address) => {
          const a = await customerCl.addresses.create({
            ...address,
          } as AddressCreate)
          if (jwtIsSalesChannel(payload)) {
            // @ts-expect-error no customer_email needed
            const ca = await customerCl.customer_addresses.create({
              customer: customerCl.customers.relationship(
                payload.owner?.id as string
              ),
              address: customerCl.addresses.relationship(a),
            })
            await customerCl.addresses.update({
              id: a.id,
              reference: ca.id,
            })
            return ca
          }
        })
        await Promise.all(promises)
      }

      break
    }
    case "bundle":
      await createLineItems({
        cl,
        orderId: order.id,
        items: [
          {
            bundle_code: "SHIRTSETSINGLE",
            quantity: 1,
          },
        ],
      })
      break
    case "bundle+skus":
      await createLineItems({
        cl,
        orderId: order.id,
        items: [
          {
            bundle_code: "SHIRTSETSINGLE",
            quantity: 1,
          },
          {
            sku_code: "TESLA5",
            quantity: 2,
          },
        ],
      })
      break

    case "digital": {
      await createLineItems({
        cl,
        orderId: order.id,
        items: [
          {
            sku_code: "NFTEBOOK",
            quantity: 1,
          },
        ],
      })
      break
    }
    case "gift-card": {
      const activeCard = await createAndPurchaseGiftCard(cl, giftCard)

      const lineItem = {
        quantity: 1,
        order: cl.orders.relationship(order),
        item: cl.gift_cards.relationship(activeCard),
      }

      await cl.line_items.create(lineItem)

      break
    }
  }
  return {
    orderId: order.id,
    attributes: {
      giftCard: giftCardCode,
      organization: { ...params.organization },
    },
  }
}

const updateInventory = async (
  cl: CommerceLayerClient,
  lineItems: SkuItem[],
  quantity: "quantity" | "inventory"
) => {
  const skus = await cl.skus.list({
    include: ["stock_items"],
    filters: {
      code_in: lineItems.map((line) => line.sku_code).join(","),
    },
  })
  const promises = skus.map((sku) => {
    if (sku && sku.stock_items) {
      const lineItem = lineItems.find((li) => li.sku_code === sku.code)
      if (lineItem) {
        return cl.stock_items.update({
          id: sku.stock_items[0].id,
          quantity: lineItem[quantity],
        })
      }
    }
    return undefined
  })
  await Promise.all(promises)
}

const createAndPurchaseGiftCard = async (
  cl: CommerceLayerClient,
  props?: GiftCardProps,
  purchase: boolean = false
) => {
  const card = await cl.gift_cards.create({
    currency_code: props?.currency_code ? props.currency_code : "EUR",
    balance_cents: props?.balance_cents ? props.balance_cents : 10000,
    recipient_email: props?.customer_email
      ? props.customer_email
      : "customer@tk.com",
  })
  const activeCard = await cl.gift_cards.update({
    id: card.id,
    _purchase: purchase,
  })
  return activeCard
}

const getClient = (token: string) => {
  return CommerceLayer({
    organization: process.env.NEXT_PUBLIC_SLUG as string,
    accessToken: token,
    domain: process.env.NEXT_PUBLIC_DOMAIN,
  })
}

const createLineItems = async ({
  cl,
  orderId,
  items,
}: {
  cl: CommerceLayerClient
  orderId: string
  items: Array<LineItemObject>
}) => {
  const lineItems = items.map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sku_options, inventory, final_quantity, ...tail } = item
    const lineItem = {
      ...tail,
      order: cl.orders.relationship(orderId),
    }

    return cl.line_items.create(lineItem)
  })

  try {
    const lineItemsCreated = await Promise.all(lineItems)

    const sku_options = await cl.sku_options.list()
    if (sku_options && sku_options.length === 0) return
    const lineItemsOptions = items.map((item, index) => {
      if (item.sku_options && item.sku_options.length) {
        return item.sku_options.map((sku_option) => {
          const option = sku_options.find((so) => so.name === sku_option.name)
          if (option) {
            return cl.line_item_options.create({
              line_item: cl.line_items.relationship(lineItemsCreated[index].id),
              quantity: 1,
              options: sku_option.value as object,
              sku_option: cl.sku_options.relationship(option),
            })
          }
          return undefined
        })
      }
      return undefined
    })

    await Promise.all(
      lineItemsOptions.filter((item) => item !== undefined).flat(2)
    )

    // update line_items with final_quantity
    const updateLineItems = items.map((item) => {
      if (
        isSkuItem(item) &&
        item.final_quantity !== undefined &&
        item.final_quantity > 0
      ) {
        const toUpdate = lineItemsCreated.find(
          (i) => i.sku_code === item.sku_code
        )
        if (toUpdate) {
          return cl.line_items.update({
            id: toUpdate.id,
            quantity: item.final_quantity,
          })
        }
      }
      return null
    })
    await Promise.all(updateLineItems)
  } catch (e) {
    console.log(e)
  }
}

function isSkuItem(item: SkuItem | BundleItem): item is SkuItem {
  return (item as SkuItem).final_quantity !== undefined
}

const createDefaultLineItem = async (
  cl: CommerceLayerClient,
  orderId: string
) => {
  const sku = (await cl.skus.list()).first()

  const lineItem = {
    sku_code: sku?.code,
    quantity: 1,
    order: cl.orders.relationship(orderId),
  }

  await cl.line_items.create(lineItem)
}

export const test = base.extend<FixtureType>({
  defaultParams: { order: "plain" },
  checkoutPage: async ({ page, defaultParams }, use) => {
    const token = await (defaultParams.customer
      ? getCustomerUserToken({
          ...defaultParams.customer,
          market: defaultParams.market,
        })
      : getToken(defaultParams.market))

    const cl = getClient(token)
    const { orderId, attributes } = await getOrder(cl, defaultParams)
    const id =
      defaultParams.orderId === undefined ? orderId : defaultParams.orderId
    const accessToken =
      defaultParams.token === undefined ? token : defaultParams.token

    const checkoutPage = new CheckoutPage(page, {
      ...attributes,
      accessToken,
      orderId: id,
    })

    await checkoutPage.goto({
      orderId: id,
      token: accessToken,
    })
    await use(checkoutPage)
  },

  // This is the option to avoid incognito mode
  // context: [
  //   async ({ defaultParams: { incognito } }, use) => {
  //     if (!incognito) {
  //       const context = await chromium.launchPersistentContext("/tmp")
  //       await use(context)
  //       await context.close()
  //     }
  //   },
  //   { scope: "test" },
  // ],
})

export { expect } from "@playwright/test"
