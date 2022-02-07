/// <reference types="cypress" />
import {
  SetRoutes,
  NewStubData,
  SaveRequests,
} from "@commercelayer/cypress-vcr"
import { Order, Address, Shipment } from "@commercelayer/sdk"

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      setRoutes: SetRoutes
      newStubData: NewStubData
      saveRequests: SaveRequests
      dataCy(attribute: string): Chainable<Subject>
      // typescript OrderCollection
      createSkuLineItems(options: {
        orderId: string
        accessToken?: string
        attributes?: {
          quantity: string
          sku_code?: string
          bundle_code?: string
        }
        relationships?: any
      }): Chainable<Subject>
      createCustomer(options: {
        email: string
        password: string
      }): Chainable<Subject>
      createOrder(
        template:
          | "draft"
          | "pending"
          | "pending_with_billing_address"
          | "pending_with_billing_and_shipping"
          | "pending_with_customer",
        options: {
          languageCode: "it" | "en"
          customerEmail: string
          shipping_country_code_lock?: string
          return_url?: string
          reference?: string
          accessToken?: any
          terms_url?: string
          privacy_url?: string
        }
      ): Chainable<Order>
      setSameAddress(
        orderId: string,
        addressId: string,
        accessToken?: string
      ): Chainable<Subject>
      setDifferentAddress(
        orderId: string,
        billingAddressId: string,
        shippingAddressId: string,
        accessToken?: string
      ): Chainable<Subject>
      setShipmentMethod(options: {
        id: string
        accessToken?: string
        type:
          | "Express Delivery EU"
          | "Express Delivery US"
          | "Standard Shipping"
      }): Chainable<Shipment[]>
      createAddress(options: {
        firstName: string
        lastName: string
        line1: string
        line2?: string
        city: string
        zipCode: string
        stateCode: string
        countryCode: string
        phone: string
        billingInfo: string
        accessToken?: string
      }): Chainable<Address>
      getTokenCustomer(options: {
        username: string
        password: string
      }): Chainable<Subject>
      getTokenSuperuser(): Chainable<Subject>
      getShipments(options: {
        orderId: string
        accessToken?: string
      }): Chainable<Subject>
      addAddressToBook(
        idAddress: string,
        accessToken: string
      ): Chainable<Subject>
      getDataLayer(options: {
        gtm:
          | "begin_checkout"
          | "add_shipping_info"
          | "add_payment_info"
          | "purchase"
      }): Chainable<Subject>
      fillElementsInput(
        field:
          | "cardCvc"
          | "cardNumber"
          | "cardExpiry"
          | "cvv"
          | "number"
          | "expirationDate"
          | "encryptedCardNumber"
          | "encryptedExpiryDate"
          | "encryptedSecurityCode",
        value: string
      ): Chainable<Subject>
      setCoupon(options: {
        orderId: string
        couponCode: string
        accessToken?: string
      }): Chainable<Subject>
      createGiftCard(options: {
        currencyCode?: string
        balanceCents: number
        recipientEmail: string
        accessToken?: string
      }): Chainable<Subject>
      setGiftCard(options: {
        orderId: string
        giftCardCode: string
        accessToken?: string
      }): Chainable<Subject>
      activeGiftCard(options: {
        giftcardId: string
        accessToken?: string
      }): Chainable<Subject>
      fillForm(options: {
        type: "shipping" | "billing"
        address: {
          firstName: string
          lastName: string
          line1: string
          line2: string
          city: string
          countryCode: string
          stateCode: string
          zipCode: string
          phone: string
          billingInfo?: string
        }
        requiresBillingInfo?: boolean
        countryCodeLock?: boolean
      }): Chainable<Subject>
      checkForm(options: {
        type: "shipping" | "billing"
        address: {
          firstName: string
          lastName: string
          line1: string
          line2: string
          city: string
          countryCode: string
          stateCode: string
          zipCode: string
          phone: string
          billingInfo?: string
        }
        requiresBillingInfo?: boolean
      }): Chainable<Subject>
      checkAddressBook(options: {
        index?: number
        type: "shipping" | "billing"
        address: {
          firstName: string
          lastName: string
          line1: string
          line2: string
          city: string
          countryCode: string
          stateCode: string
          zipCode: string
          phone: string
          billingInfo?: string
        }
      }): Chainable<Subject>
    }
  }
}
