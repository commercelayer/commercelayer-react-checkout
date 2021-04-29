import { Address, AddressField } from "@commercelayer/react-components"
import {
  faShippingFast,
  faAddressCard,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "react-i18next"
import { Fragment, useContext } from "react"
import "twin.macro"

import { AppContext } from "components/data/AppProvider"
import * as S from "components/ui"
import { StepContent } from "components/ui/StepContent"
import { StepHeader } from "components/ui/StepHeader"

import { CheckoutAddresses } from "./CheckoutAddresses"
import { CheckoutCustomerAddresses } from "./CheckoutCustomerAddresses"

interface Props {
  className?: string
  isActive?: boolean
  onToggleActive: () => void
}

export const StepCustomer: React.FC<Props> = ({
  className,
  isActive,
  onToggleActive,
}) => {
  const appCtx = useContext(AppContext)
  const { t } = useTranslation()

  if (!appCtx) {
    return null
  }
  const {
    hasShippingAddress,
    hasBillingAddress,
    isGuest,
    isShipmentRequired,
    billingAddress,
    shippingAddress,
    emailAddress,
    hasSameAddresses,
    isUsingNewBillingAddress,
    isUsingNewShippingAddress,
    hasCustomerAddresses,
    refetchOrder,
  } = appCtx

  // todo: logica interna da implementare
  // se guest e' true: mostrare input email + form indirizzi
  // altrimenti mostrare elenco indirizzi della rubrica + pulsante aggiungi nuovo indirizzo
  // se non ci sono indirizzi in rubrica, ma solo l'indirizzo dell'ordine (non ancora salvato in rubrica) si mostra il form con i valori in edit

  return (
    <div className={className}>
      <StepHeader
        stepNumber={1}
        status={isActive ? "edit" : "done"}
        label={t("stepCustomer.title")}
        info={
          isActive ? t("stepCustomer.summary") : t("stepCustomer.information")
        }
        onEditRequest={() => {
          onToggleActive()
        }}
      />
      <StepContent>
        {isActive ? (
          <Fragment>
            {isGuest ? (
              <CheckoutAddresses
                shippingAddress={shippingAddress}
                billingAddress={billingAddress}
                emailAddress={emailAddress}
                isGuest={isGuest}
                hasSameAddresses={hasSameAddresses}
                isShipmentRequired={isShipmentRequired}
                refetchOrder={refetchOrder}
              />
            ) : (
              <CheckoutCustomerAddresses
                shippingAddress={shippingAddress}
                billingAddress={billingAddress}
                emailAddress={emailAddress}
                isGuest={isGuest}
                hasCustomerAddresses={hasCustomerAddresses}
                isShipmentRequired={isShipmentRequired}
                isUsingNewShippingAddress={isUsingNewShippingAddress}
                isUsingNewBillingAddress={isUsingNewBillingAddress}
                hasSameAddresses={hasSameAddresses}
                refetchOrder={refetchOrder}
              />
            )}
          </Fragment>
        ) : (
          <div>
            <div>
              {billingAddress && (
                <Address addresses={[billingAddress]}>
                  <div tw="flex flex-row">
                    <S.Icon>
                      <FontAwesomeIcon icon={faAddressCard} />
                    </S.Icon>
                    <div>
                      <AddressField
                        tw="pl-1 font-bold"
                        name="full_name"
                        data-cy="fullname_billing"
                      />
                      <div>
                        <AddressField
                          tw="pl-1"
                          name="full_address"
                          data-cy="full_address_billing"
                        />
                      </div>
                    </div>
                  </div>
                </Address>
              )}
              {isShipmentRequired && shippingAddress && (
                <Address addresses={[shippingAddress]}>
                  <div tw="flex flex-row">
                    <S.Icon>
                      <FontAwesomeIcon icon={faShippingFast} />
                    </S.Icon>
                    <div>
                      <AddressField
                        tw="pl-1 font-bold"
                        name="full_name"
                        data-cy="fullname_shipping"
                      />
                      <div>
                        <AddressField
                          tw="pl-1"
                          name="full_address"
                          data-cy="full_address_shipping"
                        />
                      </div>
                    </div>
                  </div>
                </Address>
              )}
            </div>

            {!hasShippingAddress && !hasBillingAddress ? (
              <div>No Billing / Shipping Address set</div>
            ) : null}
          </div>
        )}
      </StepContent>
    </div>
  )
}
