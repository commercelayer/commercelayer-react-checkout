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

import '@commercelayer/cypress-vcr'
import { apiRequestHeaders } from "./utils"
import { md5 } from 'pure-md5';


Cypress.Commands.add('dataCy', (value) => {
  return cy.get(`[data-cy=${value}]`)
})


Cypress.Commands.add('createOrder', (template, options) => {

  const hash = md5(JSON.stringify(options))
  const filename = `${template}_${hash}.json`

  if (Cypress.env("record")) {
    cy.request({
      url: Cypress.env('apiEndpoint') + '/api/orders',
      method: 'POST',
      body: {
        data: {
          type: 'orders',
          attributes: {
            language_code: options.languageCode,
            customer_email: options.customerEmail
          }
        }
      },
      headers: apiRequestHeaders(Cypress.env('accessToken'))
    }).its('body.data').then((order) => {
      cy.request({
        url: Cypress.env('apiEndpoint') + '/api/line_items',
        method: 'POST',
        body: {
          data: {
            type: "line_items",
            attributes: {
              quantity: "2",
              sku_code: "BABYONBU000000E63E7412MX"
            },
            relationships: {
              order: {
                data: {
                  type: "orders",
                  id: order.id
                }
              }
            }
          }
        },
        headers: apiRequestHeaders(Cypress.env('accessToken'))
      }).then(() => {
        cy.writeFile(`cypress/fixtures/orders/${filename}`, order).then(() => { return order })
      })
    })
  } else {
    return cy.readFile(`cypress/fixtures/orders/${filename}`)
  }
})