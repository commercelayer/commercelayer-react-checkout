import PaymentSource from "@commercelayer/react-components/payment_source/PaymentSource"
import PaymentSourceBrandIcon from "@commercelayer/react-components/payment_source/PaymentSourceBrandIcon"
import PaymentSourceBrandName from "@commercelayer/react-components/payment_source/PaymentSourceBrandName"
import PaymentSourceDetail from "@commercelayer/react-components/payment_source/PaymentSourceDetail"
import { useContext, useEffect } from "react"
import { Trans, useTranslation } from "react-i18next"

import { OrderSummary } from "components/composite/OrderSummary"
import { PaymentContainer } from "components/composite/StepPayment/PaymentContainer"
import { AppContext } from "components/data/AppProvider"
import { useSettingsOrInvalid } from "components/hooks/useSettingsOrInvalid"
import { Base } from "components/ui/Base"
import { Button } from "components/ui/Button"
import { CustomAddress } from "components/ui/CustomerAddressCard"
import { FlexContainer } from "components/ui/FlexContainer"
import { Footer } from "components/ui/Footer"
import { Logo } from "components/ui/Logo"
import { getTranslations } from "components/utils/payments"

import { CheckIcon } from "./CheckIcon"
import { SupportMessage } from "./SupportMessage"
import {
  AddressContainer,
  Bottom,
  Main,
  Recap,
  RecapBox,
  RecapCol,
  RecapCustomer,
  RecapItem,
  RecapItemDescription,
  RecapItemTitle,
  RecapSummary,
  RecapTitle,
  Text,
  Title,
  Top,
  Wrapper,
  WrapperButton,
} from "./styled"

interface Props {
  logoUrl: NullableType<string>
  companyName: string
  supportEmail: NullableType<string>
  supportPhone: NullableType<string>
  orderNumber: string
}

export const StepComplete: React.FC<Props> = ({
  logoUrl,
  companyName,
  supportEmail,
  supportPhone,
  orderNumber,
}) => {
  const { t } = useTranslation()

  const { settings } = useSettingsOrInvalid()

  const thankyouPageUrl = settings?.config?.checkout?.thankyou_page

  const ctx = useContext(AppContext)

  useEffect(() => {
    if (thankyouPageUrl != null) {
      window.location.href = thankyouPageUrl
    }
  }, [thankyouPageUrl])

  if (!ctx) return null

  const handleClick = () => {
    if (ctx?.returnUrl) {
      document.location.href = ctx?.returnUrl
    }
  }

  return (
    thankyouPageUrl == null && (
      <Base>
        <Top>
          <Wrapper>
            <Logo
              logoUrl={logoUrl}
              companyName={companyName}
              className="self-center pt-10 pl-4 mb-10 md:self-auto"
            />
            <Main>
              <div className="p-8">
                <CheckIcon />
              </div>
              <Title>{t("stepComplete.title")}</Title>
              <Text
                data-testid="complete-checkout-summary"
                className="text-gray-400"
              >
                <Trans
                  i18nKey={"stepComplete.description"}
                  values={{ orderNumber }}
                  components={{
                    WrapperOrderId: <strong className="text-black" />,
                  }}
                />
              </Text>
              <SupportMessage
                supportEmail={supportEmail}
                supportPhone={supportPhone}
              />

              {ctx?.returnUrl && (
                <WrapperButton>
                  <Button
                    data-testid="button-continue-to-shop"
                    onClick={handleClick}
                  >
                    {t("stepComplete.continue")}
                  </Button>

                  {""}
                </WrapperButton>
              )}
            </Main>
          </Wrapper>
        </Top>
        <Bottom>
          <Wrapper>
            <Recap>
              <RecapSummary>
                <RecapTitle>{t("stepComplete.summary_title")}</RecapTitle>
                <OrderSummary appCtx={ctx} readonly />
              </RecapSummary>
              <RecapCustomer>
                <RecapTitle>{t("stepComplete.customer_title")}</RecapTitle>
                <RecapCol>
                  <RecapItemTitle>{t("stepComplete.email")}</RecapItemTitle>
                  <RecapItem>{ctx.emailAddress}</RecapItem>
                </RecapCol>
                <RecapCol>
                  <AddressContainer className="lg:!grid-cols-1 xl:!grid-cols-2">
                    <div data-testid="billing-address-recap">
                      <RecapItemTitle>
                        {t("stepComplete.billed_to")}
                      </RecapItemTitle>
                      <RecapBox>
                        <CustomAddress
                          firstName={ctx.billingAddress?.first_name ?? ""}
                          lastName={ctx.billingAddress?.last_name ?? ""}
                          city={ctx.billingAddress?.city ?? ""}
                          line1={ctx.billingAddress?.line_1 ?? ""}
                          line2={ctx.billingAddress?.line_2 ?? ""}
                          zipCode={ctx.billingAddress?.zip_code ?? ""}
                          stateCode={ctx.billingAddress?.state_code ?? ""}
                          countryCode={ctx.billingAddress?.country_code ?? ""}
                          phone={ctx.billingAddress?.phone ?? ""}
                          addressType="billing"
                        />
                      </RecapBox>
                    </div>
                    <>
                      {ctx.isShipmentRequired && (
                        <div data-testid="shipping-address-recap">
                          <RecapItemTitle>
                            {t("stepComplete.ship_to")}
                          </RecapItemTitle>
                          <RecapBox>
                            <CustomAddress
                              firstName={ctx.shippingAddress?.first_name ?? ""}
                              lastName={ctx.shippingAddress?.last_name ?? ""}
                              city={ctx.shippingAddress?.city ?? ""}
                              line1={ctx.shippingAddress?.line_1 ?? ""}
                              line2={ctx.shippingAddress?.line_2 ?? ""}
                              zipCode={ctx.shippingAddress?.zip_code ?? ""}
                              stateCode={ctx.shippingAddress?.state_code ?? ""}
                              countryCode={
                                ctx.shippingAddress?.country_code ?? ""
                              }
                              phone={ctx.shippingAddress?.phone ?? ""}
                              addressType="shipping"
                            />
                          </RecapBox>
                        </div>
                      )}
                    </>
                  </AddressContainer>
                </RecapCol>

                <RecapCol data-testid="payment-recap">
                  <RecapItemTitle>{t("stepComplete.payment")}</RecapItemTitle>
                  {ctx.isPaymentRequired ? (
                    <RecapBox>
                      <FlexContainer className="font-bold text-md">
                        <PaymentContainer>
                          <PaymentSource readonly>
                            <PaymentSourceBrandIcon className="mr-2" />
                            <PaymentSourceBrandName className="mr-1">
                              {({ brand }) => {
                                if (ctx.isCreditCard) {
                                  return (
                                    <Trans i18nKey="stepPayment.endingIn">
                                      {brand}
                                      <PaymentSourceDetail
                                        className="ml-1 font-normal"
                                        type="last4"
                                      />
                                    </Trans>
                                  )
                                }
                                return <>{getTranslations(brand, t)}</>
                              }}
                            </PaymentSourceBrandName>
                          </PaymentSource>
                        </PaymentContainer>
                      </FlexContainer>
                    </RecapBox>
                  ) : (
                    <RecapItemDescription>
                      {t("stepComplete.free_payment")}
                    </RecapItemDescription>
                  )}
                </RecapCol>
              </RecapCustomer>
            </Recap>
            <Footer />
          </Wrapper>
        </Bottom>
      </Base>
    )
  )
}
