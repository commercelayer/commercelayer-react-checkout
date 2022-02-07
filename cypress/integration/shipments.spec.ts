import { faker } from "@faker-js/faker"

import { euAddress } from "../support/utils"

describe("Checkout Shipments", () => {
  const filename = "shipments"

  const email = faker.internet.email().toLocaleLowerCase()
  const password = faker.internet.password()

  before(function () {
    cy.createCustomer({ email: email, password: password }).then(() => {
      cy.getTokenCustomer({
        username: email,
        password: password,
      }).as("tokenObj")
    })
  })

  context("order with one shipment not selected", () => {
    before(function () {
      cy.createOrder("draft", {
        languageCode: "en",
        customerEmail: email,
        accessToken: this.tokenObj.access_token,
      })
        .as("newOrder")
        .then((order) => {
          cy.createSkuLineItems({
            orderId: order.id,
            accessToken: this.tokenObj.access_token,
          })
          cy.createAddress({
            ...euAddress,
            accessToken: this.tokenObj.access_token,
          }).then((address) => {
            cy.setSameAddress(order.id, address.id, this.tokenObj.access_token)
          })
        })
    })

    beforeEach(function () {
      cy.setRoutes({
        endpoint: Cypress.env("apiEndpoint"),
        routes: Cypress.env("requests"),
        record: Cypress.env("record"), // @default false
        filename,
      })
    })

    after(() => {
      if (Cypress.env("record")) {
        cy.saveRequests(filename)
      }
    })

    it("valid customer token", function () {
      cy.visit(`/${this.newOrder.id}?accessToken=${this.tokenObj.access_token}`)
      cy.wait(
        [
          "@getOrders",
          "@getOrders",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        { timeout: 100000 }
      )
      cy.url().should("contain", this.tokenObj.access_token)
      cy.url().should("not.contain", Cypress.env("accessToken"))
    })

    it("select Standard Shipping and save", () => {
      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton0").click({ force: true })
      cy.wait(
        [
          "@patchShipments",
          "@getOrders",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        {
          timeout: 100000,
        }
      )
      cy.dataCy("save-shipments-button").click()
      cy.wait(["@getOrders"], {
        timeout: 100000,
      })
      cy.wait(3000)
      cy.dataCy("step_shipping")
        .click()
        .should("have.attr", "data-status", "true")

      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton0").should("be.checked")
    })

    it("edit Delivery, select Express Delivery and save", () => {
      cy.dataCy("step_shipping")
        .click()
        .should("have.attr", "data-status", "true")
      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton1").click({ force: true })
      cy.wait(
        [
          "@patchShipments",
          "@getOrders",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        {
          timeout: 100000,
        }
      )
      cy.dataCy("save-shipments-button").click()
      cy.wait(["@getOrders", "@getOrders"], {
        timeout: 100000,
      })
      cy.wait(3000)
      cy.dataCy("step_shipping")
        .click()
        .should("have.attr", "data-status", "true")

      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton1").should("be.checked")
    })
  })

  context("order with two shipments not selected", () => {
    before(function () {
      cy.createOrder("draft", {
        languageCode: "en",
        customerEmail: email,
        accessToken: this.tokenObj.access_token,
      })
        .as("newOrder")
        .then((order) => {
          cy.createSkuLineItems({
            orderId: order.id,
            accessToken: this.tokenObj.access_token,
            attributes: { quantity: "1", sku_code: "CANVASAU000000FFFFFF1824" },
          })
          cy.createSkuLineItems({
            orderId: order.id,
            accessToken: this.tokenObj.access_token,
            attributes: {
              quantity: "5",
              sku_code: "TSHIRTMMFFFFFF000000XLXX",
            },
          })
          cy.createAddress({
            ...euAddress,
            accessToken: this.tokenObj.access_token,
          }).then((address) => {
            cy.setSameAddress(order.id, address.id, this.tokenObj.access_token)
          })
        })
    })

    beforeEach(function () {
      cy.setRoutes({
        endpoint: Cypress.env("apiEndpoint"),
        routes: Cypress.env("requests"),
        record: Cypress.env("record"), // @default false
        filename,
      })
    })

    after(() => {
      if (Cypress.env("record")) {
        cy.saveRequests(filename)
      }
    })

    it("valid customer token", function () {
      cy.visit(`/${this.newOrder.id}?accessToken=${this.tokenObj.access_token}`)
      cy.wait(
        [
          "@getOrders",
          "@getOrders",
          "@getOrders",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        { timeout: 100000 }
      )
      cy.url().should("contain", this.tokenObj.access_token)
      cy.url().should("not.contain", Cypress.env("accessToken"))
    })

    it("select Standard Shipping to both shipments and save", () => {
      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton0").click({ force: true })
      cy.wait(
        [
          "@patchShipments",
          "@getOrders",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        {
          timeout: 100000,
        }
      )
      cy.get("@shippingMethodButton2").click({ force: true })
      cy.wait(
        [
          "@patchShipments",
          "@getOrders",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        {
          timeout: 100000,
        }
      )
      cy.dataCy("save-shipments-button").click()
      cy.wait(["@getOrders"], {
        timeout: 100000,
      })
      cy.wait(3000)
      cy.dataCy("step_shipping")
        .click()
        .should("have.attr", "data-status", "true")

      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton0").should("be.checked")
      cy.get("@shippingMethodButton2").should("be.checked")
    })

    it("edit Delivery, select Express Delivery to both shipments and save", () => {
      cy.dataCy("step_shipping")
        .click()
        .should("have.attr", "data-status", "true")
      cy.wait(2000)
      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton1").click({ force: true })
      cy.wait(
        [
          "@patchShipments",
          "@getOrders",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        {
          timeout: 100000,
        }
      )
      cy.get("@shippingMethodButton3").click({ force: true })
      cy.wait(
        [
          "@patchShipments",
          "@getOrders",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        {
          timeout: 100000,
        }
      )
      cy.dataCy("save-shipments-button").click()
      cy.wait(["@getOrders"], {
        timeout: 100000,
      })
      cy.dataCy("step_shipping")
        .click()
        .should("have.attr", "data-status", "true")

      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton1").should("be.checked")
      cy.get("@shippingMethodButton3").should("be.checked")
    })

    it("edit Delivery, select Express Delivery to first shipment and select Standard Shipping to second shipment and save", () => {
      cy.wait(2000)
      cy.dataCy("step_shipping")
        .click()
        .should("have.attr", "data-status", "true")
      cy.wait(2000)
      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton1").click({ force: true })
      cy.get("@shippingMethodButton2").click({ force: true })
      cy.wait(
        [
          "@patchShipments",
          "@getOrders",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        {
          timeout: 100000,
        }
      )
      cy.dataCy("save-shipments-button").click()
      cy.wait(["@getOrders", "@getOrders"], {
        timeout: 100000,
      })
      cy.wait(3000)
      cy.dataCy("step_shipping")
        .click()
        .should("have.attr", "data-status", "true")

      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton1").should("be.checked")
      cy.get("@shippingMethodButton2").should("be.checked")
    })

    it("edit Delivery, select Standard Shipping to first shipment and select Express Delivery to second shipment and save", () => {
      cy.wait(2000)
      cy.dataCy("step_shipping")
        .click()
        .should("have.attr", "data-status", "true")
      cy.wait(2000)
      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton0").click({ force: true })
      cy.wait(["@patchShipments"], {
        timeout: 100000,
      })
      cy.get("@shippingMethodButton3").click({ force: true })
      cy.wait(["@getOrders", "@getCustomerAddresses", "@deliveryLeadTimes"], {
        timeout: 100000,
      })
      cy.dataCy("save-shipments-button").click()
      cy.wait(["@getOrders"], {
        timeout: 100000,
      })
      cy.dataCy("step_shipping")
        .click()
        .should("have.attr", "data-status", "true")
      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton0").should("be.checked")
      cy.get("@shippingMethodButton3").should("be.checked")
    })
  })

  context("order with a Standard Shipping", () => {
    before(function () {
      cy.createOrder("draft", {
        languageCode: "en",
        customerEmail: email,
        accessToken: this.tokenObj.access_token,
      })
        .as("newOrder")
        .then((order) => {
          cy.createSkuLineItems({
            orderId: order.id,
            accessToken: this.tokenObj.access_token,
            attributes: { quantity: "1", sku_code: "CANVASAU000000FFFFFF1824" },
          })
          cy.createAddress({
            ...euAddress,
            accessToken: this.tokenObj.access_token,
          }).then((address) => {
            cy.setSameAddress(
              order.id,
              address.id,
              this.tokenObj.access_token
            ).then(() => {
              cy.getShipments({
                accessToken: this.tokenObj.access_token,
                orderId: order.id,
              }).then((shipments) => {
                cy.setShipmentMethod({
                  type: "Standard Shipping",
                  id: shipments[0].id,
                  accessToken: this.tokenObj.access_token,
                })
              })
            })
          })
        })
    })

    beforeEach(function () {
      cy.setRoutes({
        endpoint: Cypress.env("apiEndpoint"),
        routes: Cypress.env("requests"),
        record: Cypress.env("record"), // @default false
        filename,
      })
    })

    after(() => {
      if (Cypress.env("record")) {
        cy.saveRequests(filename)
      }
    })

    it("valid customer token", function () {
      cy.visit(`/${this.newOrder.id}?accessToken=${this.tokenObj.access_token}`)
      cy.wait(
        [
          "@getOrders",
          "@getOrders",
          "@getOrders",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        { timeout: 100000 }
      )
      cy.url().should("contain", this.tokenObj.access_token)
      cy.url().should("not.contain", Cypress.env("accessToken"))
    })

    it("select shipment and save", () => {
      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton0").click({ force: true })
      cy.wait(
        [
          "@patchShipments",
          "@getOrders",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        {
          timeout: 100000,
        }
      )
      cy.dataCy("save-shipments-button").click()
      cy.wait(["@getOrders", "@getOrders"], {
        timeout: 100000,
      })
    })

    it("check both Standard Shipping", () => {
      cy.wait(2000)
      cy.dataCy("step_shipping")
        .click()
        .should("have.attr", "data-status", "true")

      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton0").should("be.checked")
    })
  })

  context("order with a Express Delivery EU", () => {
    before(function () {
      cy.createOrder("draft", {
        languageCode: "en",
        customerEmail: email,
        accessToken: this.tokenObj.access_token,
      })
        .as("newOrder")
        .then((order) => {
          cy.createSkuLineItems({
            orderId: order.id,
            accessToken: this.tokenObj.access_token,
            attributes: {
              quantity: "1",
              sku_code: "CANVASAU000000FFFFFF1824",
            },
          })
          cy.createAddress({
            ...euAddress,
            accessToken: this.tokenObj.access_token,
          }).then((address) => {
            cy.setSameAddress(
              order.id,
              address.id,
              this.tokenObj.access_token
            ).then(() => {
              cy.getShipments({
                accessToken: this.tokenObj.access_token,
                orderId: order.id,
              }).then((shipments) => {
                cy.setShipmentMethod({
                  type: "Express Delivery EU",
                  id: shipments[0].id,
                  accessToken: this.tokenObj.access_token,
                })
              })
            })
          })
        })
    })

    beforeEach(function () {
      cy.setRoutes({
        endpoint: Cypress.env("apiEndpoint"),
        routes: Cypress.env("requests"),
        record: Cypress.env("record"), // @default false
        filename,
      })
    })

    after(() => {
      if (Cypress.env("record")) {
        cy.saveRequests(filename)
      }
    })

    it("valid customer token", function () {
      cy.visit(`/${this.newOrder.id}?accessToken=${this.tokenObj.access_token}`)
      cy.wait(
        [
          "@getOrders",
          "@getOrders",
          "@getOrders",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        { timeout: 100000 }
      )
      cy.url().should("contain", this.tokenObj.access_token)
      cy.url().should("not.contain", Cypress.env("accessToken"))
    })

    it("select shipment and save", () => {
      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton1").click({ force: true })
      cy.wait(
        [
          "@patchShipments",
          "@getOrders",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        {
          timeout: 100000,
        }
      )
      cy.dataCy("save-shipments-button").click()
      cy.wait(["@getOrders", "@getOrders"], {
        timeout: 100000,
      })
    })

    it("check both Express Delivery", () => {
      cy.dataCy("step_shipping")
        .click()
        .should("have.attr", "data-status", "true")

      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton1").should("be.checked")
    })
  })

  context("order with 2 shipments both Standard Shipping", () => {
    before(function () {
      cy.createOrder("draft", {
        languageCode: "en",
        customerEmail: email,
        accessToken: this.tokenObj.access_token,
      })
        .as("newOrder")
        .then((order) => {
          cy.createSkuLineItems({
            orderId: order.id,
            accessToken: this.tokenObj.access_token,
            attributes: { quantity: "1", sku_code: "CANVASAU000000FFFFFF1824" },
          })
          cy.createSkuLineItems({
            orderId: order.id,
            accessToken: this.tokenObj.access_token,
            attributes: {
              quantity: "5",
              sku_code: "TSHIRTMMFFFFFF000000XLXX",
            },
          })
          cy.createAddress({
            ...euAddress,
            accessToken: this.tokenObj.access_token,
          }).then((address) => {
            cy.setSameAddress(
              order.id,
              address.id,
              this.tokenObj.access_token
            ).then(() => {
              cy.getShipments({
                accessToken: this.tokenObj.access_token,
                orderId: order.id,
              }).then((shipments) => {
                cy.setShipmentMethod({
                  type: "Standard Shipping",
                  id: shipments[0].id,
                  accessToken: this.tokenObj.access_token,
                })
                cy.setShipmentMethod({
                  type: "Standard Shipping",
                  id: shipments[1].id,
                  accessToken: this.tokenObj.access_token,
                })
              })
            })
          })
        })
    })

    beforeEach(function () {
      cy.setRoutes({
        endpoint: Cypress.env("apiEndpoint"),
        routes: Cypress.env("requests"),
        record: Cypress.env("record"), // @default false
        filename,
      })
    })

    after(() => {
      if (Cypress.env("record")) {
        cy.saveRequests(filename)
      }
    })

    it("valid customer token", function () {
      cy.visit(`/${this.newOrder.id}?accessToken=${this.tokenObj.access_token}`)
      cy.wait(
        [
          "@getOrders",
          "@getOrders",
          "@getOrders",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        { timeout: 100000 }
      )
      cy.url().should("contain", this.tokenObj.access_token)
      cy.url().should("not.contain", Cypress.env("accessToken"))
    })

    it("select shipment and save", () => {
      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton0").click({ force: true })
      cy.wait(
        [
          "@patchShipments",
          "@getOrders",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        {
          timeout: 100000,
        }
      )
      cy.get("@shippingMethodButton2").click({ force: true })
      cy.wait(
        [
          "@patchShipments",
          "@getOrders",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        {
          timeout: 100000,
        }
      )
      cy.dataCy("save-shipments-button").click()
      cy.wait(["@getOrders", "@getOrders"], {
        timeout: 100000,
      })
    })

    it("check both Standard Shipping", () => {
      cy.dataCy("step_shipping")
        .click()
        .should("have.attr", "data-status", "true")

      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton0").should("be.checked")
      cy.get("@shippingMethodButton2").should("be.checked")
    })
  })

  context("order with 2 shipments both Express Delivery EU", () => {
    before(function () {
      cy.createOrder("draft", {
        languageCode: "en",
        customerEmail: email,
        accessToken: this.tokenObj.access_token,
      })
        .as("newOrder")
        .then((order) => {
          cy.createSkuLineItems({
            orderId: order.id,
            accessToken: this.tokenObj.access_token,
            attributes: { quantity: "1", sku_code: "CANVASAU000000FFFFFF1824" },
          })
          cy.createSkuLineItems({
            orderId: order.id,
            accessToken: this.tokenObj.access_token,
            attributes: {
              quantity: "5",
              sku_code: "TSHIRTMMFFFFFF000000XLXX",
            },
          })
          cy.createAddress({
            ...euAddress,
            accessToken: this.tokenObj.access_token,
          }).then((address) => {
            cy.setSameAddress(
              order.id,
              address.id,
              this.tokenObj.access_token
            ).then(() => {
              cy.getShipments({
                accessToken: this.tokenObj.access_token,
                orderId: order.id,
              }).then((shipments) => {
                cy.setShipmentMethod({
                  type: "Express Delivery EU",
                  id: shipments[0].id,
                  accessToken: this.tokenObj.access_token,
                })
                cy.setShipmentMethod({
                  type: "Express Delivery EU",
                  id: shipments[1].id,
                  accessToken: this.tokenObj.access_token,
                })
              })
            })
          })
        })
    })

    beforeEach(function () {
      cy.setRoutes({
        endpoint: Cypress.env("apiEndpoint"),
        routes: Cypress.env("requests"),
        record: Cypress.env("record"), // @default false
        filename,
      })
    })

    after(() => {
      if (Cypress.env("record")) {
        cy.saveRequests(filename)
      }
    })

    it("valid customer token", function () {
      cy.visit(`/${this.newOrder.id}?accessToken=${this.tokenObj.access_token}`)
      cy.wait(
        [
          "@getOrders",
          "@getOrders",
          "@getOrders",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        { timeout: 100000 }
      )
      cy.url().should("contain", this.tokenObj.access_token)
      cy.url().should("not.contain", Cypress.env("accessToken"))
    })

    it("select shipment and save", () => {
      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton1").click({ force: true })
      cy.wait(
        [
          "@patchShipments",
          "@getOrders",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        {
          timeout: 100000,
        }
      )
      cy.get("@shippingMethodButton3").click({ force: true })
      cy.wait(
        [
          "@patchShipments",
          "@getOrders",
          "@getCustomerAddresses",
          "@deliveryLeadTimes",
        ],
        {
          timeout: 100000,
        }
      )
      cy.dataCy("save-shipments-button").click()
      cy.wait(["@getOrders", "@getOrders"], {
        timeout: 100000,
      })
    })

    it("check both Express Delivery", () => {
      cy.dataCy("step_shipping")
        .click()
        .should("have.attr", "data-status", "true")

      cy.dataCy("shipping-method-button").each((e, i) => {
        cy.wrap(e).as(`shippingMethodButton${i}`)
      })
      cy.get("@shippingMethodButton1").should("be.checked")
      cy.get("@shippingMethodButton3").should("be.checked")
    })
  })

  context(
    "order with 2 shipments: Standard Shipping and Express Delivery EU",
    () => {
      before(function () {
        cy.createOrder("draft", {
          languageCode: "en",
          customerEmail: email,
          accessToken: this.tokenObj.access_token,
        })
          .as("newOrder")
          .then((order) => {
            cy.createSkuLineItems({
              orderId: order.id,
              accessToken: this.tokenObj.access_token,
              attributes: {
                quantity: "1",
                sku_code: "CANVASAU000000FFFFFF1824",
              },
            })
            cy.createSkuLineItems({
              orderId: order.id,
              accessToken: this.tokenObj.access_token,
              attributes: {
                quantity: "5",
                sku_code: "TSHIRTMMFFFFFF000000XLXX",
              },
            })
            cy.createAddress({
              ...euAddress,
              accessToken: this.tokenObj.access_token,
            }).then((address) => {
              cy.setSameAddress(
                order.id,
                address.id,
                this.tokenObj.access_token
              ).then(() => {
                cy.getShipments({
                  accessToken: this.tokenObj.access_token,
                  orderId: order.id,
                }).then((shipments) => {
                  cy.setShipmentMethod({
                    type: "Standard Shipping",
                    id: shipments[0].id,
                    accessToken: this.tokenObj.access_token,
                  })
                  cy.setShipmentMethod({
                    type: "Express Delivery EU",
                    id: shipments[1].id,
                    accessToken: this.tokenObj.access_token,
                  })
                })
              })
            })
          })
      })

      beforeEach(function () {
        cy.setRoutes({
          endpoint: Cypress.env("apiEndpoint"),
          routes: Cypress.env("requests"),
          record: Cypress.env("record"), // @default false
          filename,
        })
      })

      after(() => {
        if (Cypress.env("record")) {
          cy.saveRequests(filename)
        }
      })

      it("valid customer token", function () {
        cy.visit(
          `/${this.newOrder.id}?accessToken=${this.tokenObj.access_token}`
        )
        cy.wait(
          [
            "@getOrders",
            "@getOrders",
            "@getOrders",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@deliveryLeadTimes",
          ],
          { timeout: 100000 }
        )
        cy.url().should("contain", this.tokenObj.access_token)
        cy.url().should("not.contain", Cypress.env("accessToken"))
      })

      it("select shipment and save", () => {
        cy.dataCy("shipping-method-button").each((e, i) => {
          cy.wrap(e).as(`shippingMethodButton${i}`)
        })
        cy.get("@shippingMethodButton0").click({ force: true })
        cy.wait(
          [
            "@patchShipments",
            "@getOrders",
            "@getCustomerAddresses",
            "@deliveryLeadTimes",
          ],
          {
            timeout: 100000,
          }
        )
        cy.get("@shippingMethodButton3").click({ force: true })
        cy.wait(
          [
            "@patchShipments",
            "@getOrders",
            "@getCustomerAddresses",
            "@deliveryLeadTimes",
          ],
          {
            timeout: 100000,
          }
        )
        cy.dataCy("save-shipments-button").click()
        cy.wait(["@getOrders", "@getOrders"], {
          timeout: 100000,
        })
      })

      it("check shipments: Standard Shipping and Express Delivery", () => {
        cy.dataCy("step_shipping")
          .click()
          .should("have.attr", "data-status", "true")

        cy.dataCy("shipping-method-button").each((e, i) => {
          cy.wrap(e).as(`shippingMethodButton${i}`)
        })
        cy.get("@shippingMethodButton0").should("be.checked")
        cy.get("@shippingMethodButton3").should("be.checked")
      })
    }
  )

  context("order with one shipment (do not ship) not selected", () => {
    before(function () {
      cy.createOrder("draft", {
        languageCode: "en",
        customerEmail: email,
        accessToken: this.tokenObj.access_token,
      })
        .as("newOrder")
        .then((order) => {
          cy.createSkuLineItems({
            orderId: order.id,
            accessToken: this.tokenObj.access_token,
            attributes: {
              sku_code: "SWEETHMUB7B7B7E63E74MXXX",
              quantity: "1",
            },
          })
          cy.createAddress({
            ...euAddress,
            accessToken: this.tokenObj.access_token,
          }).then((address) => {
            cy.setSameAddress(order.id, address.id, this.tokenObj.access_token)
          })
        })
    })

    beforeEach(function () {
      cy.setRoutes({
        endpoint: Cypress.env("apiEndpoint"),
        routes: Cypress.env("requests"),
        record: Cypress.env("record"), // @default false
        filename,
      })
    })

    after(() => {
      if (Cypress.env("record")) {
        cy.saveRequests(filename)
      }
    })

    it("valid customer token", function () {
      cy.visit(`/${this.newOrder.id}?accessToken=${this.tokenObj.access_token}`)
      cy.wait(
        [
          "@getOrders",
          "@getOrders",
          "@getOrders",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
          "@getCustomerAddresses",
        ],
        { timeout: 100000 }
      )
      cy.url().should("contain", this.tokenObj.access_token)
      cy.url().should("not.contain", Cypress.env("accessToken"))
    })

    it("check if step deplivery is not visible", () => {
      cy.dataCy("step-header-badge").each((e, i) => {
        cy.wrap(e).as(`stepHeaderBadge${i}`)
      })
      cy.get("@stepHeaderBadge1").should("contain.text", "2")
    })
  })

  context(
    "order with two shipment, but one do not ship, both not selected",
    () => {
      before(function () {
        cy.createOrder("draft", {
          languageCode: "en",
          customerEmail: email,
          accessToken: this.tokenObj.access_token,
        })
          .as("newOrder")
          .then((order) => {
            cy.createSkuLineItems({
              orderId: order.id,
              accessToken: this.tokenObj.access_token,
              attributes: {
                sku_code: "SWEETHMUB7B7B7E63E74MXXX",
                quantity: "1",
              },
            })
            cy.createSkuLineItems({
              orderId: order.id,
              accessToken: this.tokenObj.access_token,
            })
            cy.createAddress({
              ...euAddress,
              accessToken: this.tokenObj.access_token,
            }).then((address) => {
              cy.setSameAddress(
                order.id,
                address.id,
                this.tokenObj.access_token
              )
            })
          })
      })

      beforeEach(function () {
        cy.setRoutes({
          endpoint: Cypress.env("apiEndpoint"),
          routes: Cypress.env("requests"),
          record: Cypress.env("record"), // @default false
          filename,
        })
      })

      after(() => {
        if (Cypress.env("record")) {
          cy.saveRequests(filename)
        }
      })

      it("valid customer token", function () {
        cy.visit(
          `/${this.newOrder.id}?accessToken=${this.tokenObj.access_token}`
        )
        cy.wait(
          [
            "@getOrders",
            "@getOrders",
            "@getOrders",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@getCustomerAddresses",
            "@deliveryLeadTimes",
          ],
          { timeout: 100000 }
        )
        cy.url().should("contain", this.tokenObj.access_token)
        cy.url().should("not.contain", Cypress.env("accessToken"))
      })

      it("select Standard Shipping and save", () => {
        cy.dataCy("shipping-method-button").each((e, i) => {
          cy.wrap(e).as(`shippingMethodButton${i}`)
        })
        cy.get("@shippingMethodButton0").click({ force: true })
        cy.wait(
          [
            "@patchShipments",
            "@getOrders",
            "@getCustomerAddresses",
            "@deliveryLeadTimes",
          ],
          {
            timeout: 100000,
          }
        )
        cy.dataCy("save-shipments-button").click()
        cy.wait(["@getOrders", "@getOrders"], {
          timeout: 100000,
        })
        cy.wait(3000)
        cy.dataCy("step_shipping")
          .click()
          .should("have.attr", "data-status", "true")

        cy.dataCy("shipping-method-button").each((e, i) => {
          cy.wrap(e).as(`shippingMethodButton${i}`)
        })
        cy.get("@shippingMethodButton0").should("be.checked")
      })

      it("edit Delivery, select Express Delivery and save", () => {
        cy.dataCy("step_shipping")
          .click()
          .should("have.attr", "data-status", "true")
        cy.dataCy("shipping-method-button").each((e, i) => {
          cy.wrap(e).as(`shippingMethodButton${i}`)
        })
        cy.get("@shippingMethodButton1").click({ force: true })
        cy.wait(
          [
            "@patchShipments",
            "@getOrders",
            "@getCustomerAddresses",
            "@deliveryLeadTimes",
          ],
          {
            timeout: 100000,
          }
        )
        cy.dataCy("save-shipments-button").click()
        cy.wait(["@getOrders", "@getOrders"], {
          timeout: 100000,
        })
        cy.wait(3000)
        cy.dataCy("step_shipping")
          .click()
          .should("have.attr", "data-status", "true")

        cy.dataCy("shipping-method-button").each((e, i) => {
          cy.wrap(e).as(`shippingMethodButton${i}`)
        })
        cy.get("@shippingMethodButton1").should("be.checked")
      })
    }
  )
})
