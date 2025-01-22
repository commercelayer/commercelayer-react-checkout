import { Address } from "@commercelayer/sdk"
import { faker } from "@faker-js/faker"
import { Page, expect } from "@playwright/test"

import { EcommerceProps } from "../../components/data/GTMProvider/typings"
import { composeForCheck, euAddress, euAddress2 } from "../utils/addresses"

interface GoToProps {
  orderId: string
  token: string
}

interface DataLayerWindowProps {
  event: string
  ecommerce: EcommerceProps
}

interface AttributesProps {
  giftCard: NullableType<string>
  orderId: NullableType<string>
  accessToken: NullableType<string>
  organization: NullableType<object>
}

export class CheckoutPage {
  readonly page: Page
  readonly attributes: NullableType<AttributesProps>

  constructor(page: Page, attributes: NullableType<AttributesProps>) {
    this.page = page

    this.attributes = attributes
  }

  async goto({ orderId, token }: GoToProps) {
    const url = `${process.env.NEXT_PUBLIC_BASE_PATH || ""
      }/${orderId}?accessToken=${token}`

    await this.page.route("**/api/organization**", (route) => {
      // // Add a prefix to the title.
      const body = {
        data: {
          id: "organization-id",
          type: "organizations",
          attributes: {
            name: process.env.NEXT_PUBLIC_SLUG as string,
            slug: process.env.NEXT_PUBLIC_SLUG as string,
            domain: null,
            support_phone: "",
            support_email: "",
            logo_url:
              "https://data.commercelayer.app/assets/logos/full-logo/black/commercelayer_full_logo_black.svg",
            favicon_url:
              "https://data.commercelayer.app/assets/images/favicons/favicon-32x32.png",
            primary_color: "",
            contrast_color: null,
            gtm_id: "",
            gtm_id_test: "",
            discount_disabled: null,
            account_disabled: null,
            acceptance_disabled: null,
            max_concurrent_promotions: 10,
            max_concurrent_imports: 10,
            created_at: "2022-02-24T14:04:55.307Z",
            updated_at: "2022-12-15T09:14:36.994Z",
            reference: null,
            reference_origin: null,
            metadata: {},
            config: null,
          },
        },
      }
      route.fulfill({
        // Pass all fields from the response.
        status: 200,
        contentType: "application/json",
        // Override response body.
        body: JSON.stringify({
          ...body,
          data: {
            ...body.data,
            attributes: {
              ...body.data.attributes,
              ...this.attributes?.organization,
            },
          },
        }),
      })
    })
    await this.page.goto(`${url}`, {
      waitUntil: "networkidle",
    })
  }

  getGiftCard() {
    return this.attributes?.giftCard
  }

  getOrderId() {
    return this.attributes?.orderId
  }

  getAccessToken() {
    return this.attributes?.accessToken
  }

  async setCustomerMail(email?: string) {
    let customerEmail = email || ""
    if (email === undefined) {
      customerEmail = faker.internet.email().toLocaleLowerCase()
    }
    await this.page.getByTestId("customer_email").fill(customerEmail)
    await this.page.getByTestId("customer_email").blur()
  }

  async blurCustomerEmail() {
    await this.page
      .locator("[data-testid=customer_email]")
      .evaluate((e) => e.blur())
  }

  getCustomerMail() {
    return this.page.locator("input[name=customer_email]")
  }

  async clearInput(name: string) {
    await this.page.click(name, {
      clickCount: 3,
    })
    await this.page.keyboard.press("Backspace")
  }

  async changeCustomerEmail(text: string) {
    await this.clearInput("[data-testid=customer_email]")
    await this.setCustomerMail(text)
  }

  async checkCustomerEmail(text: string) {
    await this.page
      .locator(`[data-testid=customer-email-step-header] >> text=${text}`)
      .waitFor({ state: "visible" })
  }

  async checkStep(
    step: SingleStepEnum,
    status: "close" | "open" | "not_present"
  ) {
    const element = this.page.getByTestId(`step_${step.toLocaleLowerCase()}`)
    if (status === "not_present") {
      await expect(element).toHaveCount(0)
      return
    }

    await expect(element).toHaveCount(1)

    await expect(element).toHaveAttribute(
      "data-status",
      status === "close" ? "false" : "true"
    )
  }

  async clickStep(step: SingleStepEnum) {
    await this.page.click(`[data-testid=step_${step.toLocaleLowerCase()}]`, {
      force: true,
    })
  }

  async clickAccordion(step: SingleStepEnum) {
    await this.page.click(
      `[data-testid=accordion_${step.toLocaleLowerCase()}]`,
      {
        force: true,
      }
    )
  }

  async shipToDifferentAddress() {
    await this.page.click(`[data-testid=button-ship-to-different-address]`)
  }

  async getDataLayer(
    eventToTrack:
      | "begin_checkout"
      | "add_shipping_info"
      | "add_payment_info"
      | "purchase"
  ) {
    await this.page.waitForTimeout(2000)
    const dataLayer: DataLayerWindowProps[] =
      await this.page.evaluate("window.dataLayer")
    return (
      dataLayer &&
      dataLayer.filter(
        ({ event }: DataLayerWindowProps) => event === eventToTrack
      )
    )
  }

  async getOrderNumber() {
    const element = await this.page.locator(
      "[data-testid=complete-checkout-summary] >> strong"
    )
    return element.innerText()
  }

  async checkTermsAndPrivacyValue(value?: boolean) {
    const element = this.page.locator(
      "[data-testid=checkbox-privacy-and-terms]"
    )
    if (value === undefined) {
      await expect(element).toHaveCount(0)
      return
    }
    if (value) {
      await expect(element).toBeChecked()
    } else {
      await expect(element).not.toBeChecked()
    }
  }

  async setTermsAndPrivacy(value: boolean) {
    const element = this.page.locator(
      "[data-testid=checkbox-privacy-and-terms]"
    )
    if (value) {
      await element.check()
    } else {
      await element.uncheck()
    }
  }

  async checkShipToDifferentAddressValue(value: boolean) {
    const element = this.page.locator(
      "[data-testid=button-ship-to-different-address]"
    )
    await expect(element).toHaveAttribute(
      "data-status",
      value ? "true" : "false"
    )
  }

  async isVisibleShipToDifferentAddress(visible: boolean) {
    const element = this.page.locator(
      "[data-testid=button-ship-to-different-address]"
    )
    if (visible) {
      await expect(element).toBeVisible()
    } else {
      await expect(element).toBeHidden()
    }
  }

  async useCustomerCard() {
    const element = this.page.getByTestId("customer-card")
    await expect(element).toBeVisible({ timeout: 10000 })
    await this.page.waitForTimeout(2000)
    await this.page.getByTestId("customer-card").click()
  }

  async checkCustomerCardCount(value: number) {
    const element = this.page.getByTestId("customer-card")
    await this.page.waitForTimeout(2000)
    await expect(element).toHaveCount(value)
  }

  async checkShipToDifferentAddressEnabled(value: boolean) {
    const element = this.page.locator(
      "[data-testid=button-ship-to-different-address]"
    )
    if (value) {
      await expect(element).toBeEnabled()
    } else {
      await expect(element).toBeDisabled()
    }
  }

  getSaveAddressBookCheckbox(type: "billing" | "shipping") {
    return this.page.locator(
      `input[data-testid=${type}_address_save_to_customer_address_book]`
    )
  }

  async selectCountry(
    type: "billing_address" | "shipping_address",
    country: "IT" | "US" | "GB" | "FR" | "ES"
  ) {
    await this.page.selectOption(
      `[data-testid=input_${type}_country_code]`,
      country
    )
  }

  async getSelectOptions({
    type,
    field,
  }: {
    type: "billing_address" | "shipping_address"
    field: "country_code" | "state_code"
  }) {
    const selectElement = await this.page.$(
      `[data-testid=input_${type}_${field}]`
    )

    if (selectElement != null) {
      const options = await selectElement.$$("option")

      const countries = []

      for (const option of options) {
        countries.push(option.getAttribute("value"))
      }
      return Promise.all(countries)
    }
  }

  async getSelectedOption({
    type,
    field,
  }: {
    type: "billing_address" | "shipping_address"
    field: "country_code" | "state_code"
  }) {
    const value = this.page.getByTestId(`input_${type}_${field}`)
    return await value.inputValue()
  }

  async selectState(
    type: "billing_address" | "shipping_address",
    state: "FI" | "NA" | "MI"
  ) {
    await this.page.selectOption(
      `[data-testid=input_${type}_state_code]`,
      state
    )
  }

  async selectShippingMethod({
    text,
    shipment = 0,
  }: {
    text: string
    shipment?: number
  }) {
    await this.page.getByText(text).nth(shipment).click()
    await expect(this.page.getByText(text).nth(shipment)).toHaveCount(1)
    const element = this.page.locator(
      `[data-testid=shipments-container] >> nth=${shipment} >> [data-testid=shipping-method-button]:checked`
    )
    await expect(element).toBeChecked()
  }

  async checkShippingMethodPrice({
    index = 0,
    shipment = 0,
    text,
  }: {
    index?: number
    shipment?: number
    text: string
  }) {
    const element = this.page.locator(
      `[data-testid=shipments-container] >> nth=${shipment} >> [data-testid=shipping-methods-container] >> nth=${index} >> text=${text}`
    )

    await expect(element).toHaveCount(1)
  }

  async checkSelectedShippingMethod({
    index = 0,
    shipment = 0,
    value,
  }: {
    index?: number
    shipment?: number
    value: boolean
  }) {
    const element = await this.page.isChecked(
      `[data-testid=shipments-container] >> nth=${shipment} >> [data-testid=shipping-methods-container] >> nth=${index} >> input[type=radio]`
    )
    if (value) {
      expect(element).toBeTruthy()
    } else {
      expect(element).toBeFalsy()
    }
  }

  async setAddress({
    address,
    type,
  }: {
    address: Partial<Address>
    type: "billing_address" | "shipping_address"
  }) {
    await this.page
      .getByTestId(`input_${type}_first_name`)
      .fill((address.first_name as string) || "")
    await this.page.fill(
      `[data-testid=input_${type}_last_name]`,
      (address.last_name as string) || ""
    )
    await this.page.fill(
      `[data-testid=input_${type}_line_1]`,
      (address.line_1 as string) || ""
    )
    await this.page.fill(
      `[data-testid=input_${type}_line_2]`,
      (address.line_2 as string) || ""
    )
    await this.page.fill(
      `[data-testid=input_${type}_city]`,
      (address.city as string) || ""
    )

    const countrySelect = this.page.locator(
      `[data-testid=input_${type}_country_code]`
    )
    const countrySelectEnabled = await countrySelect.isEnabled()
    if (countrySelectEnabled) {
      await this.page.selectOption(
        `[data-testid=input_${type}_country_code]`,
        (address.country_code as string) || "",
        { force: true }
      )
    }

    const stateInput = this.page
      .getByTestId(`input_${type}_state_code`)
      .and(this.page.locator("select"))

    const command = (await stateInput.isVisible()) ? "selectOption" : "fill"

    await this.page[command](
      `[data-testid=input_${type}_state_code]`,
      (address.state_code as string) || ""
    )

    await this.page.fill(
      `[data-testid=input_${type}_zip_code]`,
      (address.zip_code as string) || ""
    )
    await this.page.fill(
      `[data-testid=input_${type}_phone]`,
      (address.phone as string) || ""
    )
    if (address.billing_info) {
      await this.page.fill(
        `[data-testid=input_${type}_billing_info]`,
        (address.billing_info as string) || ""
      )
    }
  }

  async setBillingAddress(address?: Partial<Address>) {
    const addressToFill = address || euAddress
    await this.setAddress({ address: addressToFill, type: "billing_address" })
  }

  async setShippingAddress(address?: Partial<Address>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { billing_info, ...addressToFill } = address || euAddress2
    await this.setAddress({ address: addressToFill, type: "shipping_address" })
  }

  async checkAddress({
    address,
    type,
  }: {
    address: Partial<Address>
    type: "billing_address" | "shipping_address"
  }) {
    const promises = Object.keys(address).map((key) => {
      if (type === "shipping_address" && key === "billing_info") {
        return undefined
      }
      const fieldType =
        key === "country_code" ||
          (key === "state_code" &&
            address.country_code &&
            // TODO Adjust to check for select or input
            ["IT", "US"].includes(address.country_code))
          ? "select"
          : "input"
      const element = this.page.locator(`${fieldType}[name=${type}_${key}]`)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return expect(element).toHaveValue(address[key])
    })
    await Promise.all(promises)
  }

  async openNewAddress(type: "shipping" | "billing") {
    await this.page.click(`[data-testid=add_new_${type}_address]`)
  }

  async closeNewAddress(type: "shipping" | "billing") {
    await this.page.click(`[data-testid=close-${type}-form]`)
  }

  async checkBillingAddress(address: Partial<Address>) {
    await this.checkAddress({ address, type: "billing_address" })
  }

  async checkShippingAddress(address: Partial<Address>) {
    await this.checkAddress({ address, type: "shipping_address" })
  }

  async selectAddressOnBook({
    type,
    index = 0,
  }: {
    type: "billing" | "shipping"
    index: number
  }) {
    await this.page.click(
      `[data-testid=customer-${type}-address] >> nth=${index}`
    )
  }

  async checkSelectedAddressBook({
    type,
    address,
  }: {
    type: "billing" | "shipping"
    address: Partial<Address>
  }) {
    const titleizeType = type[0].toLocaleUpperCase() + type.slice(1)

    const element = this.page.locator(
      `[data-testid=customer-${type}-address]:near(:text("${titleizeType} Address")) >> text=${composeForCheck(
        address
      )}`
    )
    await expect(element).toHaveCount(1)
  }

  async checkReturnToCartLink(status: "present" | "not_present") {
    const element = await this.page.locator("[data-testid=edit-cart-link]")
    await expect(element).toHaveCount(status === "not_present" ? 0 : 1)
  }

  async clickReturnToCartLink() {
    await this.page.click("[data-testid=edit-cart-link] a")
  }

  async checkContinueShoppingLink(status: "present" | "not_present") {
    const element = await this.page.locator(
      "[data-testid=button-continue-to-shop]"
    )
    await expect(element).toHaveCount(status === "not_present" ? 0 : 1)
  }

  async clickContinueShoppingLink() {
    await this.page.click("[data-testid=button-continue-to-shop]")
  }

  async checkBadgeIndex(step: SingleStepEnum, value: string) {
    const element = await this.page.locator(
      `[data-testid=step-header-badge]:near(:text("${step}")) >> text=${value}`
    )
    await expect(element).toHaveCount(1)
  }

  async setCoupon(code: string) {
    await this.page.fill("[data-testid=input_giftcard_coupon]", code)
    await this.page.click("[data-testid=submit_giftcard_coupon]")
  }

  async removeCoupon() {
    await this.page.click("[data-testid=remove_coupon]")
  }

  async removeGiftCard() {
    await this.page.click("[data-testid=remove_giftcard]")
  }

  async checkOrderSummary(text: string) {
    await expect(this.page.locator(`text=${text}`)).toBeVisible()
  }

  async checkCustomerAddressesTitle(text: string) {
    await expect(
      this.page.getByTestId("customer-addresses-title")
    ).toContainText(text)
  }

  async checkShippingSummary(text?: string) {
    if (text === undefined) {
      const element = this.page.getByTestId("shipping-amount")
      await expect(element).toHaveCount(0)
    } else {
      await this.page
        .getByTestId("shipping-amount")
        .filter({ hasText: text })
        .waitFor({ state: "visible" })
    }
  }

  async checkLineItemsCount(text: string) {
    const element = this.page.locator(`[data-testid=items-count]`)
    await expect(element).toHaveText(text)
  }

  async checkLineItemFrequency(text?: string) {
    const element = this.page.locator(`[data-testid=line-items-frequency]`)
    if (text) {
      await expect(element).toContainText(text)
    } else {
      expect(element).toBeHidden()
    }
  }

  async checkPaymentRecap(text: string, timeout?: number) {
    await expect(this.page.getByText(text)).toBeVisible({
      timeout: timeout ?? 5000,
    })
  }

  async checkTaxSummary(text: string) {
    await this.page
      .locator(`[data-testid=tax-amount] >> text=${text}`)
      .waitFor({ state: "visible" })
  }

  async checkTaxLine(text: string) {
    await this.page.getByText(text).waitFor({ state: "visible" })
  }

  async checkLineItemAmount(text?: string) {
    const element = this.page.getByTestId(`line-item-amount`)
    if (text !== undefined) {
      await element.waitFor({ state: "visible" })
      await expect(await element.innerText()).toBe(text)
    } else {
      await expect(element).toHaveCount(0)
    }
  }

  async checkDiscountAmount(text?: string) {
    const element = this.page.locator(
      `[data-testid=discount-amount] >> text=${text}`
    )
    if (text !== undefined) {
      await element.waitFor({ state: "visible" })
    } else {
      await expect(element).toHaveCount(0)
    }
  }

  async checkGiftCardAmount(text?: string) {
    const element = this.page.locator(
      `[data-testid=giftcard-amount] >> text=${text}`
    )
    if (text !== undefined) {
      await element.waitFor({ state: "visible" })
    } else {
      await expect(element).toHaveCount(0)
    }
  }

  async checkCouponCode(text: string) {
    await this.page
      .locator(`[data-testid=code-coupon] >> text=${text}`)
      .waitFor({ state: "visible" })
  }

  async checkGiftCardCode(text: string) {
    await this.page
      .locator(`[data-testid=code-giftcard] >> text=${text}`)
      .waitFor({ state: "visible" })
  }

  async checkCouponError(text?: string) {
    const element = this.page.locator(
      `[data-testid=discount-error] >> text=${text}`
    )
    if (text !== undefined) {
      await element.waitFor({ state: "visible" })
    } else {
      await expect(element).toHaveCount(0)
    }
  }

  async checkTotalAmount(text: string) {
    await this.page
      .locator(`[data-testid=total-amount] >> text=${text}`)
      .waitFor({ state: "visible" })
  }

  async checkPaymentSummary(text: string) {
    await this.page
      .locator(`[data-testid=payment-method-amount] >> text=${text}`)
      .waitFor({ state: "visible" })
  }

  async checkButton({
    type,
    status,
  }: {
    type: SingleStepEnum
    status: "enabled" | "disabled" | "not_present"
  }) {
    const element = await this.page.locator(
      `[data-testid=save-${type.toLocaleLowerCase()}-button]`
    )
    if (status === "not_present") {
      return expect(element).toHaveCount(0)
    }
    if (status === "disabled") {
      return expect(element).toBeDisabled()
    } else {
      return expect(element).toBeEnabled()
    }
  }

  async selectPayment(
    type:
      | "stripe"
      | "braintree"
      | "wire"
      | "paypal"
      | "adyen"
      | "checkout_com"
      | "adyen-dropin"
      | "klarna"
  ) {
    let paymentMethod
    if (type === "wire") {
      paymentMethod = `${type}_transfers`
    } else {
      paymentMethod = `${type}_payments`
    }
    await this.page.getByTestId(paymentMethod).click()
    await this.page.waitForTimeout(2000)
    await this.page.mouse.wheel(0, 30)
  }

  async completePayment({
    type,
    gateway = "klarna_pay_now",
    language,
  }: {
    type: "adyen-dropin" | "klarna" | "stripe"
    gateway?:
    | "paypal"
    | "card"
    | "card3DS"
    | "klarna_pay_over_time"
    | "klarna_pay_later"
    | "klarna_pay_now"
    | "klarna"
    language?: "fr" | "de" | "us"
  }) {
    switch (type) {
      case "klarna": {
        const [newPage] = await Promise.all([this.page.waitForEvent("popup")])
        await newPage.locator("#onContinue").click()
        const phone = newPage.getByTestId("kaf-field")

        if (await phone.isVisible()) {
          await phone.focus()
          await this.page.waitForTimeout(2000)
          await phone.fill("+393282243727")
          await newPage.waitForTimeout(3000)
        }

        await newPage.locator("#otp_field__container input").fill("123456")
        // await newPage.getByTestId("kaf-button").click()

        const paymentCategory = newPage.getByTestId("select-payment-category")
        if (await paymentCategory.isVisible()) {
          paymentCategory.click()
        }
        const pickPlan = newPage.getByTestId("pick-plan")
        if (await pickPlan.isVisible()) {
          await pickPlan.click()
        }
        await newPage.getByTestId("confirm-and-pay").click()
        await this.page

          .locator("text=Thank you for your order!")
          .waitFor({ state: "visible", timeout: 80000 })
        break
      }
      case "stripe": {
        const klarnaIframe = this.page // .frameLocator("#klarna-apf-iframe")

        await klarnaIframe
          .getByTestId("kaf-field")
          .waitFor({ state: "visible" })

        await klarnaIframe.getByTestId("kaf-field").focus()
        await klarnaIframe.getByTestId("kaf-field").fill("+16466698197")

        await klarnaIframe.getByTestId("kaf-button").click()
        await klarnaIframe.locator("input#otp_field").focus()
        await klarnaIframe.locator("input#otp_field").type("123456")
        await this.page.waitForTimeout(5000)

        const selectPayment = klarnaIframe.getByTestId(
          "select-payment-category-or-method-from-stacked-selector"
        )

        if (await selectPayment.isVisible()) {
          await selectPayment.click()
        }

        await this.page.waitForTimeout(1000)

        if (await selectPayment.isVisible()) {
          await selectPayment.click()
        }

        await this.page.waitForTimeout(4000)
        const pickPlan = klarnaIframe.getByTestId("pick-plan")
        if (await pickPlan.isVisible()) {
          await pickPlan.click()
        }
        await this.page.waitForTimeout(4000)
        if (await pickPlan.isVisible()) {
          await pickPlan.click()
        }
        const confirmAndPay = klarnaIframe.getByTestId("confirm-and-pay")
        if (await confirmAndPay.isVisible()) {
          await confirmAndPay.click()
        }
        const button = klarnaIframe.getByRole("button", { name: "Continue" })
        if (await button.isVisible()) {
          button.click()
        }

        const pagePromise = await this.page
          .waitForEvent("popup", { timeout: 5000 })
          .then((pagePromise) => {
            return pagePromise
          })
          .catch((error) => console.log(`no popup ${error}`))

        if (pagePromise !== undefined) {
          await pagePromise.getByText("Demo Bank").click()
          await pagePromise.getByLabel("Kontonummer").click()
          await pagePromise.getByLabel("Kontonummer").fill("12345678")
          await pagePromise.getByLabel("PIN").click()
          await pagePromise.getByLabel("PIN").fill("1234")
          await pagePromise.waitForTimeout(2000)
          await pagePromise.getByRole("button", { name: "Weiter" }).click()
          await pagePromise.getByLabel("TAN").click()
          await pagePromise.getByLabel("TAN").fill("12345")
          await pagePromise.getByRole("button", { name: "Weiter" }).click()
        }
        break
      }
      case "adyen-dropin": {
        switch (gateway) {
          case "paypal": {
            await this.page.click(
              "[data-testid=adyen_payments] >> text=PayPal",
              {
                force: true,
              }
            )
            const [newPage] = await Promise.all([
              this.page.waitForEvent("popup"),
              await this.page.click(
                "[data-testid=adyen_payments] >> .adyen-checkout__paypal__button >> nth=0",
                {
                  force: true,
                }
              ),
            ])
            await newPage.waitForLoadState()
            await newPage.fill(
              "input[name=login_email]",
              process.env.E2E_PAYPAL_EMAIL as string
            )

            await newPage.click("#btnNext")

            await newPage.fill(
              "input[name=login_password]",
              process.env.E2E_PAYPAL_PASSWORD as string
            )

            await newPage.click("#btnLogin")
            await newPage.waitForTimeout(3000)
            const banner = newPage.locator("#gdpr-container >> text=Accetta")
            if (await banner.isVisible()) {
              banner.click()
            }
            await newPage.click('[data-testid="submit-button-initial"]')

            break
          }
          case "klarna_pay_now": {
            await this.page
              .getByRole("radio", {
                name: "Pay now with Klarna.",
              })
              .click()
            await this.page.getByTestId("save-payment-button").click()

            const klarnaIframe = this.page // .frameLocator("#klarna-apf-iframe")

            await klarnaIframe
              .getByTestId("kaf-field")
              .waitFor({ state: "visible" })

            await klarnaIframe.getByTestId("kaf-field").focus()
            await klarnaIframe.getByTestId("kaf-field").fill("+491711234567")

            await klarnaIframe.getByTestId("kaf-button").click()
            await klarnaIframe.locator("input#otp_field").focus()
            await klarnaIframe.locator("input#otp_field").type("123456")
            await this.page.waitForTimeout(5000)

            const selectPayment = klarnaIframe.getByTestId(
              "select-payment-category-or-method-from-stacked-selector"
            )

            if (await selectPayment.isVisible()) {
              await selectPayment.click()
            }

            await this.page.waitForTimeout(1000)

            if (await selectPayment.isVisible()) {
              await selectPayment.click()
            }

            await this.page.waitForTimeout(4000)
            const pickPlan = klarnaIframe.getByTestId("pick-plan")
            if (await pickPlan.isVisible()) {
              await pickPlan.click()
            }
            await this.page.waitForTimeout(4000)
            if (await pickPlan.isVisible()) {
              await pickPlan.click()
            }
            const confirmAndPay = klarnaIframe.getByTestId("confirm-and-pay")
            if (await confirmAndPay.isVisible()) {
              await confirmAndPay.click()
            }
            const button = klarnaIframe.getByRole("button", { name: "Weiter" })
            if (await button.isVisible()) {
              button.click()
            }

            const pagePromise = await this.page
              .waitForEvent("popup", { timeout: 5000 })
              .then((pagePromise) => {
                return pagePromise
              })
              .catch((error) => console.log(`no popup ${error}`))

            if (pagePromise !== undefined) {
              await pagePromise.getByText("Demo Bank").click()
              await pagePromise.getByLabel("Kontonummer").click()
              await pagePromise.getByLabel("Kontonummer").fill("12345678")
              await pagePromise.getByLabel("PIN").click()
              await pagePromise.getByLabel("PIN").fill("1234")
              await pagePromise.waitForTimeout(2000)
              await pagePromise.getByRole("button", { name: "Weiter" }).click()
              await pagePromise.getByLabel("TAN").click()
              await pagePromise.getByLabel("TAN").fill("12345")
              await pagePromise.getByRole("button", { name: "Weiter" }).click()
            }
            break
          }
          case "klarna_pay_later": {
            await this.page.click(
              "[data-testid=adyen_payments] >> text=Pay later",
              {
                force: true,
              }
            )

            await this.page.click("[data-testid=save-payment-button]")
            await this.page.waitForTimeout(4000)

            const klarnaIframe = this.page // .frameLocator("#klarna-apf-iframe")

            await klarnaIframe
              .getByTestId("kaf-field")
              .waitFor({ state: "visible" })

            await klarnaIframe.getByTestId("kaf-field").focus()
            await klarnaIframe.getByTestId("kaf-field").fill("+491711234567")

            await klarnaIframe.getByTestId("kaf-button").click()
            await klarnaIframe.locator("input#otp_field").focus()
            await klarnaIframe.locator("input#otp_field").type("123456")
            await this.page.waitForTimeout(5000)

            const selectPayment = klarnaIframe.getByTestId(
              "select-payment-category-or-method-from-stacked-selector"
            )

            if (await selectPayment.isVisible()) {
              await selectPayment.click()
            }

            await klarnaIframe.getByTestId("confirm-and-pay").click()

            break
          }
          case "klarna_pay_over_time": {
            if (language === "fr") {
              await this.page.click(
                "[data-testid=adyen_payments] >> text=Pay over time",
                {
                  force: true,
                }
              )
              await this.page.click("[data-testid=save-payment-button]")
              // await this.page.click("#buy-button")

              // const i = this.page.locator("#klarna-apf-iframe")
              const klarnaIframe = this.page // .frameLocator("#klarna-apf-iframe")

              await this.page
                .getByTestId("kaf-field")
                .waitFor({ state: "visible" })

              await klarnaIframe.getByTestId("kaf-field").focus()
              await klarnaIframe.getByTestId("kaf-field").fill("0733211231")

              await klarnaIframe.getByTestId("kaf-button").click()
              await klarnaIframe.locator("input#otp_field").focus()
              await klarnaIframe.locator("input#otp_field").type("123456")
              await this.page.waitForTimeout(5000)

              const selectPayment = klarnaIframe.getByTestId(
                "select-payment-category-or-method-from-stacked-selector"
              )

              if (await selectPayment.isVisible()) {
                await selectPayment.click()
              }

              const confirm = klarnaIframe.locator(
                "[data-testid=confirm-and-pay]"
              )

              if (await confirm.isVisible()) {
                await confirm.click()
              }

              const popup = await klarnaIframe.locator(
                '[data-testid="SmoothCheckoutPopUp:enable"]'
              )
              if (await popup.isVisible()) {
                await popup.click()
              }
            } else {
              await this.page.click(
                "[data-testid=adyen_payments] >> text=Pay over time",
                {
                  force: true,
                }
              )

              await this.page.click("[data-testid=save-payment-button]")
              await this.page.waitForTimeout(5000)

              const klarnaIframe = this.page // .frameLocator("#klarna-apf-iframe")

              await klarnaIframe
                .getByTestId("kaf-field")
                .waitFor({ state: "visible" })

              await klarnaIframe.getByTestId("kaf-field").focus()
              await klarnaIframe.getByTestId("kaf-field").fill("+491711234567")

              await klarnaIframe.getByTestId("kaf-button").click()
              await klarnaIframe.locator("input#otp_field").focus()
              await klarnaIframe.locator("input#otp_field").type("123456")
              await this.page.waitForTimeout(1000)

              const emailButton = klarnaIframe.getByTestId("kaf-button")
              if (await emailButton.isVisible()) {
                emailButton.click()
              }

              // await klarnaIframe
              //   .locator("input#addressCollector-date_of_birth")
              //   .focus()
              // await klarnaIframe
              //   .locator("input#addressCollector-date_of_birth")
              //   .type("22061978")

              const selectPayment = klarnaIframe.getByTestId(
                "select-payment-category-or-method-from-stacked-selector"
              )

              await this.page.waitForTimeout(5000)

              if (await selectPayment.isVisible()) {
                await selectPayment.click()
              }

              await this.page.waitForTimeout(1000)

              if (await selectPayment.isVisible()) {
                await selectPayment.click()
              }

              await this.page.waitForTimeout(2000)

              const pickPlan = klarnaIframe.getByTestId("pick-plan")
              if (await pickPlan.isVisible()) {
                await pickPlan.click()
              }
              // await klarnaIframe
              //   .locator("label")
              //   .filter({
              //     hasText: "Indem du fortfährst, bestätigst du, dass du den",
              //   })
              //   .locator("div")
              //   .nth(1)
              //   .click()
              await klarnaIframe.getByTestId("confirm-and-pay").click()

              const iban = klarnaIframe.getByRole("textbox", {
                name: "IBAN übermitteln",
              })

              if (await iban.isVisible()) {
                iban.click()
                iban.fill("DE91100000000123456789")
                klarnaIframe.getByRole("button", { name: "Bestätigen" }).click()
              }
            }
            break
          }
          case "card": {
            await this.page.click(
              "[data-testid=adyen_payments] >> text=Credit Card",
              {
                force: true,
              }
            )
            await this.page.waitForTimeout(3000)
            const cardFrame = this.page.frameLocator("iframe >> nth=0")
            await this.page.waitForTimeout(3000)
            await cardFrame
              .locator("[data-fieldtype=encryptedCardNumber]")
              .fill("4111111111111111", { timeout: 5000 })

            const expFrame = this.page.frameLocator("iframe >> nth=1")
            await expFrame
              .locator("[data-fieldtype=encryptedExpiryDate]")
              .fill("0330")
            const cvvFrame = this.page.frameLocator("iframe >> nth=2")
            await cvvFrame
              .locator("[data-fieldtype=encryptedSecurityCode]")
              .fill("737")
            await this.page.click("[data-testid=save-payment-button]")
            break
          }
          case "card3DS": {
            await this.page.click(
              "[data-testid=adyen_payments] >> text=Credit Card",
              {
                force: true,
              }
            )
            await this.page.waitForTimeout(3000)
            const cardFrame = this.page.frameLocator("iframe >> nth=0")
            await this.page.waitForTimeout(3000)
            await cardFrame
              .locator("[data-fieldtype=encryptedCardNumber]")
              .fill("4917610000000000", { timeout: 5000 })

            const expFrame = this.page.frameLocator("iframe >> nth=1")
            await expFrame
              .locator("[data-fieldtype=encryptedExpiryDate]")
              .fill("0330")
            const cvvFrame = this.page.frameLocator("iframe >> nth=2")
            await cvvFrame
              .locator("[data-fieldtype=encryptedSecurityCode]")
              .fill("737")
            await this.page.click("[data-testid=save-payment-button]")
            return
          }
        }
        await this.page

          .locator("text=Thank you for your order!")
          .waitFor({ state: "visible", timeout: 60000 })
      }
    }
  }

  async enter3DSecure({ text }: { type: "adyen"; text: string }) {
    await this.page.waitForTimeout(3000)
    const secureFrame = this.page.frameLocator("iframe[name=threeDSIframe]")
    await this.page.waitForTimeout(2000)
    const element = await secureFrame.getByPlaceholder(
      "enter the word 'password'"
    )
    await element.click()
    await element.fill(text)
    await secureFrame.locator("#buttonSubmit").click()
  }

  async setPayment(
    type:
      | "stripe"
      | "stripe-paypal"
      | "stripe-affirm"
      | "stripe-klarna"
      | "braintree"
      | "paypal"
      | "adyen"
      | "adyen3DS"
      | "checkout_com",
    card?: {
      number?: string
      exp?: string
      cvc?: string
    }
  ) {
    switch (type) {
      case "stripe": {
        const stripeFrame = this.page
          .frameLocator("[data-testid=stripe_payments] iframe")
          .first()

        const creditCard = {
          number: card?.number ?? "4242424242424242",
          exp: card?.exp ?? "0235",
          cvc: card?.cvc ?? "321",
        }
        await stripeFrame
          .getByPlaceholder("1234 1234 1234 1234")
          .fill(creditCard.number)
        await stripeFrame.getByPlaceholder("MM / YY").fill(creditCard.exp)
        await stripeFrame.locator("#Field-cvcInput").fill(creditCard.cvc)
        break
      }
      case "stripe-paypal": {
        await this.page.waitForTimeout(2000)
        await this.page.mouse.wheel(0, 300)

        const stripeFrame = this.page
          .frameLocator("[data-testid=stripe_payments] iframe")
          .first()
        await stripeFrame.getByRole("button", { name: "PayPal" }).click()
        break
      }
      case "stripe-affirm": {
        await this.page.waitForTimeout(2000)
        await this.page.mouse.wheel(0, 300)

        const stripeFrame = this.page
          .frameLocator("[data-testid=stripe_payments] iframe")
          .first()
        await stripeFrame.getByRole("button", { name: "Affirm" }).click()
        break
      }
      case "stripe-klarna": {
        await this.page.waitForTimeout(2000)
        await this.page.mouse.wheel(0, 300)

        const stripeFrame = this.page
          .frameLocator("[data-testid=stripe_payments] iframe")
          .first()
        await stripeFrame.getByRole("button", { name: "Klarna" }).click()
        break
      }
      case "braintree": {
        const cardFrame = this.page.frameLocator(
          'iframe[name="braintree-hosted-field-number"]'
        )
        const expFrame = this.page.frameLocator(
          'iframe[name="braintree-hosted-field-expirationDate"]'
        )
        const cvvFrame = this.page.frameLocator(
          'iframe[name="braintree-hosted-field-cvv"]'
        )
        await cardFrame
          .locator("#credit-card-number")
          .fill(card?.number || "4005519200000004")
        await expFrame.locator("#expiration").fill(card?.exp || "102030")
        await cvvFrame.locator("#cvv").fill(card?.cvc || "123")
        break
      }
      case "checkout_com": {
        const cardFrame = this.page.frameLocator(
          'iframe[name="checkout-frames-cardNumber"]'
        )
        const expFrame = this.page.frameLocator(
          'iframe[name="checkout-frames-expiryDate"]'
        )
        const cvvFrame = this.page.frameLocator(
          'iframe[name="checkout-frames-cvv"]'
        )
        await cardFrame
          .locator("#checkout-frames-card-number")
          .fill("4242424242424242")
        await expFrame.locator("#checkout-frames-expiry-date").fill("102030")
        await cvvFrame.locator("#checkout-frames-cvv").fill("100")
        break
      }
      case "adyen": {
        await this.page.waitForTimeout(3000)

        const cardFrame = this.page.frameLocator("iframe >> nth=0")
        await this.page.waitForTimeout(3000)

        await cardFrame
          .locator("[data-fieldtype=encryptedCardNumber]")
          .fill("4111111111111111")

        const expFrame = this.page.frameLocator("iframe >> nth=1")
        await expFrame
          .locator("[data-fieldtype=encryptedExpiryDate]")
          .fill("0330")
        const cvvFrame = this.page.frameLocator("iframe >> nth=2")
        await cvvFrame
          .locator("[data-fieldtype=encryptedSecurityCode]")
          .fill("737")

        break
      }
      case "adyen3DS": {
        await this.page.waitForTimeout(3000)

        const cardFrame = this.page.frameLocator("iframe >> nth=0")
        await this.page.waitForTimeout(3000)

        await cardFrame
          .locator("[data-fieldtype=encryptedCardNumber]")
          .fill("4917 6100 0000 0000")

        const expFrame = this.page.frameLocator("iframe >> nth=1")
        await expFrame
          .locator("[data-fieldtype=encryptedExpiryDate]")
          .fill("0330")
        const cvvFrame = this.page.frameLocator("iframe >> nth=2")
        await cvvFrame
          .locator("[data-fieldtype=encryptedSecurityCode]")
          .fill("737")

        break
      }
      case "paypal": {
        await this.page.click("[data-testid=paypal_payments] >> text=PayPal", {
          force: true,
        })
        break
      }
    }
  }

  async checkPaymentError({
    type,
    text,
  }: {
    type: "stripe" | "braintree" | "paypal" | "adyen"
    text: string
  }) {
    let selector = `${type}_payments`
    if (type === "braintree") {
      selector = "errors-container"
    }
    const element = this.page.locator(
      `[data-testid="${selector}"] >> text=${text}`
    )
    await expect(element).toHaveCount(1)
  }

  async save(step: SingleStepEnum, waitText?: string, skipWait?: boolean) {
    const buttonId = this.page.getByTestId(
      `save-${step.toLocaleLowerCase()}-button`
    )
    await this.page.waitForTimeout(2000)
    await buttonId.focus()
    switch (step) {
      case "Customer":
        await buttonId.isEnabled()
        await buttonId.click()
        await this.page
          .locator("[data-testid=step_customer][data-status=false]")
          .waitFor({ state: "visible" })
        break
      case "Shipping":
        await buttonId.isEnabled()
        await buttonId.click()
        await this.page
          .locator("[data-testid=step_shipping][data-status=false]")
          .waitFor({ state: "visible" })
        break
      case "Payment": {
        const text = waitText || "Thank you for your order"
        await buttonId.isEnabled({ timeout: 3000 })
        await buttonId.click()

        if (waitText === "Paga con PayPal") {
          await this.page.fill(
            "input[name=login_email]",
            process.env.E2E_PAYPAL_EMAIL as string
          )

          await this.page.click("#btnNext")

          await this.page.fill(
            "input[name=login_password]",
            process.env.E2E_PAYPAL_PASSWORD as string
          )

          await this.page.click("#btnLogin")
          await this.page.click('[data-testid="submit-button-initial"]')

          await this.page
            .locator("text=Thank you for your order!")
            .waitFor({ state: "visible", timeout: 60000 })
          return
        }

        if (skipWait) {
          return
        }
        await this.page
          .locator(`text=${text}`)
          .waitFor({ state: "visible", timeout: 60000 })
        break
      }
    }
  }
}
