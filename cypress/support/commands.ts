// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import "@commercelayer/cypress-vcr"
import { md5 } from "pure-md5"

import { apiRequestHeaders } from "./utils"

Cypress.Commands.add("dataCy", (value) => {
  return cy.get(`[data-cy=${value}]`, { timeout: 100000 })
})

Cypress.Commands.add("createCustomer", (options) => {
  cy.request({
    url: Cypress.env("apiEndpoint") + "/api/customers",
    method: "POST",
    body: {
      data: {
        type: "customers",
        attributes: {
          email: options.email,
          password: options.password,
        },
      },
    },
    headers: apiRequestHeaders(Cypress.env("accessToken")),
  })
    .its("body.data")
    .then((customer) => {
      return customer
    })
})

Cypress.Commands.add("createOrder", (template, options) => {
  const hash = md5(JSON.stringify(options))
  const filename = `${template}_${hash}.json`

  if (Cypress.env("record")) {
    cy.request({
      url: Cypress.env("apiEndpoint") + "/api/orders",
      method: "POST",
      body: {
        data: {
          type: "orders",
          attributes: {
            language_code: options.languageCode,
            customer_email: options.customerEmail,
            shipping_country_code_lock: options.shipping_country_code_lock,
            return_url: options.return_url,
            reference: options.reference || null,
          },
        },
      },
      headers: options.accessToken
        ? apiRequestHeaders(options.accessToken)
        : apiRequestHeaders(Cypress.env("accessToken")),
    })
      .its("body.data")
      .then((order) => {
        cy.writeFile(`cypress/fixtures/orders/${filename}`, order).then(() => {
          return order
        })
      })
  } else {
    return cy.readFile(`cypress/fixtures/orders/${filename}`)
  }
})

Cypress.Commands.add("createSkuLineItems", (options) => {
  const hash = md5(JSON.stringify(options))
  const filename = `line_items_${hash}.json`

  if (Cypress.env("record")) {
    cy.request({
      url: Cypress.env("apiEndpoint") + "/api/line_items",
      method: "POST",
      body: {
        data: {
          type: "line_items",
          attributes: options.attributes || {
            quantity: "2",
            sku_code: "BABYONBU000000E63E7412MX",
          },
          relationships: {
            order: {
              data: {
                type: "orders",
                id: options.orderId,
              },
            },
            ...options.relationships,
          },
        },
      },
      headers: options.accessToken
        ? apiRequestHeaders(options.accessToken)
        : apiRequestHeaders(Cypress.env("accessToken")),
    })
      .its("body.data")
      .then((lineItems) => {
        cy.writeFile(`cypress/fixtures/orders/${filename}`, lineItems).then(
          () => {
            return lineItems
          }
        )
      })
  } else {
    return cy.readFile(`cypress/fixtures/orders/${filename}`)
  }
})

Cypress.Commands.add("createAddress", (options) => {
  cy.request({
    url: Cypress.env("apiEndpoint") + "/api/addresses",
    method: "POST",
    body: {
      data: {
        type: "addresses",
        attributes: {
          first_name: options.firstName,
          last_name: options.lastName,
          line_1: options.line1,
          city: options.city,
          zip_code: options.zipCode,
          state_code: options.stateCode,
          country_code: options.countryCode,
          phone: options.phone,
        },
      },
    },
    headers: options.accessToken
      ? apiRequestHeaders(options.accessToken)
      : apiRequestHeaders(Cypress.env("accessToken")),
  })
    .its("body.data")
    .then((address) => {
      return address
    })
})

Cypress.Commands.add("addAddressToBook", (idAddress, accessToken) => {
  cy.request({
    url: Cypress.env("apiEndpoint") + `/api/customer_addresses`,
    method: "POST",
    body: {
      data: {
        type: "customer_addresses",
        relationships: {
          customer: {
            data: {
              type: "customers",
              id: idAddress,
            },
          },
          address: {
            data: {
              type: "addresses",
              id: idAddress,
            },
          },
        },
      },
    },
    headers: accessToken
      ? apiRequestHeaders(accessToken)
      : apiRequestHeaders(Cypress.env("accessToken")),
  })
    .its("body.data")
    .then((customer_addresses) => {
      return customer_addresses
    })
})

Cypress.Commands.add("setSameAddress", (orderId, addressId, accessToken) => {
  cy.request({
    url: Cypress.env("apiEndpoint") + `/api/orders/${orderId}`,
    method: "PATCH",
    body: {
      data: {
        type: "orders",
        id: orderId,
        attributes: {
          _shipping_address_same_as_billing: true,
        },
        relationships: {
          billing_address: {
            data: {
              type: "addresses",
              id: addressId,
            },
          },
        },
      },
    },
    headers: accessToken
      ? apiRequestHeaders(accessToken)
      : apiRequestHeaders(Cypress.env("accessToken")),
  })
    .its("body.data")
    .then((orderWithAddress) => {
      return orderWithAddress
    })
})

Cypress.Commands.add(
  "setDifferentAddress",
  (orderId, billingAddressId, shippingAddressId, accessToken) => {
    cy.request({
      url: Cypress.env("apiEndpoint") + `/api/orders/${orderId}`,
      method: "PATCH",
      body: {
        data: {
          type: "orders",
          id: orderId,
          relationships: {
            billing_address: {
              data: {
                type: "addresses",
                id: billingAddressId,
              },
            },
            shipping_address: {
              data: {
                type: "addresses",
                id: shippingAddressId,
              },
            },
          },
        },
      },
      headers: accessToken
        ? apiRequestHeaders(accessToken)
        : apiRequestHeaders(Cypress.env("accessToken")),
    })
      .its("body.data")
      .then((orderWithAddress) => {
        return orderWithAddress
      })
  }
)

Cypress.Commands.add("getShipments", (options) => {
  cy.request({
    url:
      Cypress.env("apiEndpoint") +
      `/api/orders/${options.orderId}/shipments?include=available_shipping_methods`,
    method: "GET",
    headers: options.accessToken
      ? apiRequestHeaders(options.accessToken)
      : apiRequestHeaders(Cypress.env("accessToken")),
  })
    .its("body.data")
    .then((idShipment) => {
      return idShipment
    })
})

Cypress.Commands.add("setShipmentMethod", (options) => {
  let type
  switch (options.type) {
    case "Express Delivery EU":
      type = "dVbgQFBDjE"
      break
    case "Express Delivery US":
      type = "LEnKgFndXO"
      break
    case "Standard Shipping":
      type = "mVGpzFqjyE"
      break
    default:
      break
  }

  cy.request({
    url: Cypress.env("apiEndpoint") + `/api/shipments/${options.id}`,
    method: "PATCH",
    body: {
      data: {
        type: "shipments",
        id: options.id,
        relationships: {
          shipping_method: {
            data: {
              type: "shipping_methods",
              id: type,
            },
          },
        },
      },
    },
    headers: options.accessToken
      ? apiRequestHeaders(options.accessToken)
      : apiRequestHeaders(Cypress.env("accessToken")),
  })
    .its("body.data")
    .then((idShipment) => {
      return idShipment
    })
})

Cypress.Commands.add("getTokenCustomer", (options) => {
  cy.request({
    url: Cypress.env("apiEndpoint") + `/oauth/token`,
    method: "POST",
    qs: {
      grant_type: "password",
      client_id: Cypress.env("clientId"),
      scope: Cypress.env("scope"),
      username: options.username,
      password: options.password,
    },
  })
    .its("body")
    .then((tokenObj) => {
      // cypress env
      return tokenObj
    })
})

Cypress.Commands.add("getTokenSuperuser", () => {
  cy.request({
    url: Cypress.env("apiEndpoint") + `/oauth/token`,
    method: "POST",
    qs: {
      grant_type: "client_credentials",
      client_id: Cypress.env("clienrIdGod"),
      client_secret: Cypress.env("clientSecret"),
      scope: Cypress.env("scope"),
    },
  })
    .its("body")
    .then((tokenObj) => {
      // cypress env
      return tokenObj
    })
})

Cypress.Commands.add("getDataLayer", (options) => {
  cy.wait(5000)
  return cy.window().then(({ dataLayer }: any) => {
    return dataLayer.filter(({ event }: any) => options.gtm === event)
  })
})

const getSelectorForField = (
  name: "cardCvc" | "cardNumber" | "cardExpiry"
): string => {
  return `input[data-elements-stable-field-name="${name}"]`
}

Cypress.Commands.add("fillElementsInput", (field, value): void => {
  if (Cypress.config("chromeWebSecurity")) {
    throw new Error(
      'You must set `{ "chromeWebSecurity": false }` in `cypress.json`, ' +
        "or cypress-plugin-stripe-elements cannot access the Stripe Elements " +
        "<iframe> to perform autofill."
    )
  }

  const selector = getSelectorForField(field)

  cy.get("iframe")
    .should((iframe) => expect(iframe.contents().find(selector)).to.exist)
    .then((iframe) => cy.wrap(iframe.contents().find(selector)))
    .within((input) => {
      cy.wrap(input).type(value)
    })
})

Cypress.Commands.add("createGiftCard", (options) => {
  cy.request({
    url: Cypress.env("apiEndpoint") + `/api/gift_cards`,
    method: "POST",
    body: {
      data: {
        type: "gift_cards",
        attributes: {
          currency_code: options.currencyCode ? options.currencyCode : "EUR",
          balance_cents: String(options.balanceCents),
          recipient_email: String(options.recipientEmail),
        },
      },
    },
    headers: options.accessToken
      ? apiRequestHeaders(options.accessToken)
      : apiRequestHeaders(Cypress.env("accessToken")),
  })
    .its("body.data")
    .then((giftCard) => {
      return giftCard
    })
})

Cypress.Commands.add("activeGiftCard", (options) => {
  cy.request({
    url: Cypress.env("apiEndpoint") + `/api/gift_cards/${options.giftcardId}`,
    method: "PATCH",
    body: {
      data: {
        type: "gift_cards",
        id: options.giftcardId,
        attributes: {
          _purchase: true,
        },
      },
    },
    headers: options.accessToken
      ? apiRequestHeaders(options.accessToken)
      : apiRequestHeaders(Cypress.env("accessToken")),
  })
    .then(() =>
      cy.request({
        url:
          Cypress.env("apiEndpoint") + `/api/gift_cards/${options.giftcardId}`,
        method: "PATCH",
        body: {
          data: {
            type: "gift_cards",
            id: options.giftcardId,
            attributes: {
              _activate: true,
            },
          },
        },
        headers: options.accessToken
          ? apiRequestHeaders(options.accessToken)
          : apiRequestHeaders(Cypress.env("accessToken")),
      })
    )
    .its("body.data")
    .then((giftCard) => {
      return giftCard
    })
})

Cypress.Commands.add("setGiftCard", (options) => {
  cy.request({
    url: Cypress.env("apiEndpoint") + `/api/orders/${options.orderId}`,
    method: "PATCH",
    body: {
      data: {
        type: "orders",
        id: options.orderId,
        attributes: {
          gift_card_code: options.giftCardCode,
        },
      },
    },
    headers: options.accessToken
      ? apiRequestHeaders(options.accessToken)
      : apiRequestHeaders(Cypress.env("accessToken")),
  })
    .its("body.data")
    .then((order) => {
      return order
    })
})

Cypress.Commands.add("setCoupon", (options) => {
  cy.request({
    url: Cypress.env("apiEndpoint") + `/api/orders/${options.orderId}`,
    method: "PATCH",
    body: {
      data: {
        type: "orders",
        id: options.orderId,
        attributes: {
          coupon_code: options.couponCode,
        },
      },
    },
    headers: options.accessToken
      ? apiRequestHeaders(options.accessToken)
      : apiRequestHeaders(Cypress.env("accessToken")),
  })
    .its("body.data")
    .then((order) => {
      return order
    })
})
