import { ShippingMethodCollection } from "@commercelayer/js-sdk"
import {
  LineItem,
  Shipment,
  ShipmentsContainer,
  LineItemImage,
  LineItemName,
  LineItemQuantity,
  ShippingMethodName,
  ShippingMethod,
  ShippingMethodRadioButton,
  ShippingMethodPrice,
  LineItemsContainer,
  StockTransfer,
  StockTransferField,
  DeliveryLeadTime,
} from "@commercelayer/react-components"
import { faTruckLoading } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "twin.macro"

import { AppContext } from "components/data/AppProvider"
import { GTMContext } from "components/data/GTMProvider"
import { Button } from "components/ui"
import { Icon } from "components/ui/Icon"
import { StepContent } from "components/ui/StepContent"
import { StepHeader } from "components/ui/StepHeader"
import { useTranslation, Trans } from "next-i18next"
import { useContext, useState, useEffect } from "react"

interface Props {
  className?: string
  isActive?: boolean
  onToggleActive: () => void
}

export const StepShipping: React.FC<Props> = ({
  className,
  isActive,
  onToggleActive,
}) => {
  const appCtx = useContext(AppContext)
  const gtmCtx = useContext(GTMContext)

  const { t } = useTranslation()

  if (!appCtx || !appCtx.hasShippingAddress) {
    return null
  }

  const {
    shipments,
    hasShippingMethod,
    isShipmentRequired,
    refetchOrder,
  } = appCtx

  const [shipmentsSelected, setShipmentsSelected] = useState(shipments)
  const [canContinue, setCanContinue] = useState(false)

  useEffect(() => {
    setCanContinue(
      !shipmentsSelected?.map((s) => s.shippingMethodId).includes(undefined)
    )
  }, [shipmentsSelected])

  const handleChange = (
    shippingMethod: ShippingMethodCollection | Record<string, any>
  ): void => {
    setShipmentsSelected((shipmentsSelected) =>
      shipmentsSelected?.map((shipment) => {
        return shipment.shipmentId === shippingMethod.shipmentId
          ? {
              ...shipment,
              shippingMethodId: shippingMethod.id,
            }
          : shipment
      })
    )
  }

  const handleSave = async () => {
    await refetchOrder()
    if (gtmCtx?.fireAddShippingInfo) {
      gtmCtx.fireAddShippingInfo()
    }
  }

  return (
    <div className={className}>
      <StepHeader
        stepNumber={2}
        status={isActive ? "edit" : "done"}
        label={t("stepShipping.title")}
        info={
          isShipmentRequired
            ? isActive
              ? t("stepShipping.summary")
              : t("stepShipping.methodSelected")
            : t("stepShipping.notRequired")
        }
        onEditRequest={() => {
          onToggleActive()
        }}
      />
      {isShipmentRequired && (
        <StepContent>
          {isActive ? (
            <ShipmentsContainer>
              <Shipment>
                <LineItemsContainer>
                  <LineItem>
                    <div className="flex items-center justify-between p-5 border-b">
                      <LineItemImage className="p-2" width={80} />
                      <LineItemName data-cy="line-item-name" className="p-2" />
                      <LineItemQuantity
                        readonly
                        data-cy="line-item-quantity"
                        max={100}
                        className="p-2"
                      />
                    </div>
                    <div>
                      <StockTransfer>
                        <div className="flex flex-row" data-cy="stock-transfer">
                          <StockTransferField
                            className="px-1"
                            type="quantity"
                          />{" "}
                          of <LineItemQuantity readonly className="px-1" />
                          items will undergo a transfer
                        </div>
                      </StockTransfer>
                    </div>
                  </LineItem>
                </LineItemsContainer>
                <ShippingMethod>
                  <div className="flex flex-row items-center justify-around px-3 py-5">
                    <ShippingMethodRadioButton
                      data-cy="shipping-method-button"
                      className="flex-1"
                      onChange={(
                        shippingMethod:
                          | ShippingMethodCollection
                          | Record<string, any>
                      ) => handleChange(shippingMethod)}
                    />
                    <div className="flex-1">
                      <ShippingMethodName data-cy="shipping-method-name" />
                    </div>
                    <div className="flex-1">
                      <ShippingMethodPrice
                        data-cy="shipping-method-price"
                        labelFreeOver={t("general.free")}
                      />
                    </div>
                    <div className="flex-1">
                      <Trans t={t} i18nKey="stepShipping.deliveryLeadTime">
                        <DeliveryLeadTime
                          type="minDays"
                          data-cy="delivery-lead-time-min-days"
                        />
                        <DeliveryLeadTime
                          type="maxDays"
                          data-cy="delivery-lead-time-max-days"
                          className="mr-1"
                        />
                      </Trans>
                    </div>
                  </div>
                </ShippingMethod>
              </Shipment>
              <div tw="flex justify-end">
                <Button
                  disabled={!canContinue}
                  data-cy="save-shipments-button"
                  onClick={handleSave}
                >
                  {t("stepShipping.continueToPayment")}
                </Button>
              </div>
            </ShipmentsContainer>
          ) : hasShippingMethod ? (
            <ShipmentsContainer>
              <Shipment>
                <ShippingMethod readonly>
                  <div className="flex flex-row justify-around">
                    <Icon>
                      <FontAwesomeIcon icon={faTruckLoading} />
                    </Icon>
                    <div className="flex-1 pl-1">
                      <ShippingMethodName
                        className="font-bold"
                        data-cy="shipping-method-name-recap"
                      />
                    </div>
                    <div className="flex-1">
                      <ShippingMethodPrice labelFreeOver={t("general.free")} />
                    </div>
                    <div className="flex-1">
                      <Trans t={t} i18nKey="stepShipping.deliveryLeadTime">
                        <DeliveryLeadTime type="minDays" />
                        <DeliveryLeadTime type="maxDays" className="mr-1" />
                      </Trans>
                    </div>
                  </div>
                </ShippingMethod>
              </Shipment>
            </ShipmentsContainer>
          ) : (
            <div>{t("stepShipping.methodUnselected")}</div>
          )}
        </StepContent>
      )}
    </div>
  )
}
