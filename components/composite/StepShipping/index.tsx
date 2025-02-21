import type Errors from "@commercelayer/react-components/errors/Errors"
import LineItem from "@commercelayer/react-components/line_items/LineItem"
import LineItemImage from "@commercelayer/react-components/line_items/LineItemImage"
import LineItemName from "@commercelayer/react-components/line_items/LineItemName"
import LineItemQuantity from "@commercelayer/react-components/line_items/LineItemQuantity"
import LineItemsContainer from "@commercelayer/react-components/line_items/LineItemsContainer"
import Shipment from "@commercelayer/react-components/shipments/Shipment"
import ShipmentField from "@commercelayer/react-components/shipments/ShipmentField"
import ShipmentsContainer from "@commercelayer/react-components/shipments/ShipmentsContainer"
import ShippingMethod from "@commercelayer/react-components/shipping_methods/ShippingMethod"
import ShippingMethodName from "@commercelayer/react-components/shipping_methods/ShippingMethodName"
import ShippingMethodPrice from "@commercelayer/react-components/shipping_methods/ShippingMethodPrice"
import DeliveryLeadTime from "@commercelayer/react-components/skus/DeliveryLeadTime"
import StockTransfer from "@commercelayer/react-components/stock_transfers/StockTransfer"
import StockTransferField from "@commercelayer/react-components/stock_transfers/StockTransferField"
import type {
  Order,
  ShippingMethod as ShippingMethodCollection,
} from "@commercelayer/sdk"
import classNames from "classnames"
import { Trans, useTranslation } from "next-i18next"
import { useContext, useEffect, useState } from "react"

import { AccordionContext } from "components/data/AccordionProvider"
import { AppContext } from "components/data/AppProvider"
import type { TypeAccepted } from "components/data/AppProvider/utils"
import { GTMContext } from "components/data/GTMProvider"
import { Button, ButtonWrapper } from "components/ui/Button"
import { GridContainer } from "components/ui/GridContainer"
import { SpinnerIcon } from "components/ui/SpinnerIcon"
import { StepContainer } from "components/ui/StepContainer"
import { StepContent } from "components/ui/StepContent"
import { StepHeader } from "components/ui/StepHeader"
import { LINE_ITEMS_SHIPPABLE } from "components/utils/constants"

import { NoShippingMethods } from "./Errors/NoShippingMethods"
import { OutOfStock } from "./Errors/OutOfStock"
import {
  ShippingLineItem,
  ShippingLineItemDescription,
  ShippingLineItemQty,
  ShippingLineItemTitle,
  ShippingSummary,
  ShippingSummaryItemDescription,
  ShippingSummaryValue,
  ShippingTitle,
  ShippingWrapper,
  StyledShippingMethodRadioButton,
} from "./styled"

interface Props {
  className?: string
  step: number
}

interface HeaderProps {
  className?: string
  step: number
  info?: string
}

export const StepHeaderShipping: React.FC<HeaderProps> = ({ step }) => {
  const appCtx = useContext(AppContext)
  const accordionCtx = useContext(AccordionContext)

  if (!appCtx || !accordionCtx) {
    return null
  }
  const { t } = useTranslation()
  const { hasShippingMethod, isShipmentRequired, shipments } = appCtx

  const recapText = () => {
    if (!isShipmentRequired) {
      return t("stepShipping.notRequired")
    }
    if (hasShippingMethod && accordionCtx.status !== "edit") {
      if (shipments.length === 1 && shipments[0]?.shippingMethodName) {
        return shipments[0]?.shippingMethodName
      }
      if (appCtx.shippingMethodName) {
        return appCtx.shippingMethodName
      }
      return t("stepShipping.methodSelected", { count: shipments.length })
    }
    return t("stepShipping.methodUnselected")
  }

  return (
    <StepHeader
      stepNumber={step}
      status={accordionCtx.status}
      label={t("stepShipping.title")}
      info={recapText()}
      onEditRequest={isShipmentRequired ? accordionCtx.setStep : undefined}
    />
  )
}

const ShippingLineItems: TypeAccepted[] = LINE_ITEMS_SHIPPABLE

export const StepShipping: React.FC<Props> = () => {
  const appCtx = useContext(AppContext)
  const accordionCtx = useContext(AccordionContext)
  const gtmCtx = useContext(GTMContext)
  const { t } = useTranslation()

  if (!appCtx || !accordionCtx) {
    return null
  }

  const messages: Parameters<typeof Errors>[0]["messages"] = [
    {
      code: "OUT_OF_STOCK",
      resource: "line_items",
      message: t("stepShipping.outOfStock"),
    },
    {
      code: "NO_SHIPPING_METHODS",
      resource: "shipments",
      message: t("stepShipping.notAvailable"),
    },
  ]

  const { shipments, isShipmentRequired, saveShipments, selectShipment } =
    appCtx

  const [canContinue, setCanContinue] = useState(false)
  const [isLocalLoader, setIsLocalLoader] = useState(false)
  const [outOfStockError, setOutOfStockError] = useState(false)
  const [shippingMethodError, setShippingMethodError] = useState(false)

  useEffect(() => {
    if (shipments.length > 0) {
      setCanContinue(
        !shipments?.map((s) => s.shippingMethodId).includes(undefined),
      )
    }
  }, [shipments])

  const handleChange = (params: {
    shippingMethod: ShippingMethodCollection
    shipmentId: string
    order?: Order
  }): void => {
    selectShipment({
      shippingMethod: params.shippingMethod,
      shipmentId: params.shipmentId,
      order: params.order,
    })
  }

  const handleSave = async () => {
    setIsLocalLoader(true)

    const updatedOrder = await saveShipments()

    setIsLocalLoader(false)
    if (gtmCtx?.fireAddShippingInfo) {
      await gtmCtx.fireAddShippingInfo(updatedOrder)
    }
  }

  const autoSelectCallback = async (order?: Order) => {
    const updatedOrder = await appCtx.autoSelectShippingMethod(order)
    if (gtmCtx?.fireAddShippingInfo) {
      await gtmCtx.fireAddShippingInfo(updatedOrder)
    }
  }

  return (
    <StepContainer
      className={classNames({
        current: accordionCtx.isActive,
        done: !accordionCtx.isActive,
        submitting: isLocalLoader,
      })}
    >
      <StepContent>
        <>
          {isShipmentRequired && (
            <div>
              {accordionCtx.isActive && (
                <>
                  {
                    <ShipmentsContainer>
                      <OutOfStock
                        cartUrl={appCtx.cartUrl}
                        messages={messages}
                        setOutOfStockError={setOutOfStockError}
                      />
                      <NoShippingMethods
                        messages={messages}
                        setShippingMethodError={setShippingMethodError}
                      />

                      {!shippingMethodError && !outOfStockError && (
                        <>
                          <Shipment
                            autoSelectSingleShippingMethod={autoSelectCallback}
                            loader={
                              <div className="animate-pulse">
                                <div className="w-1/2 h-5 mt-6 bg-gray-200" />
                                <div className="h-20 my-5 bg-gray-200" />
                              </div>
                            }
                          >
                            <ShippingWrapper data-testid="shipments-container">
                              {shipments.length > 1 && (
                                <ShippingTitle>
                                  <ShipmentField name="key_number">
                                    {(props) => {
                                      const index = shipments.findIndex(
                                        (item) =>
                                          item.shipmentId === props.shipment.id,
                                      )

                                      return (
                                        <Trans
                                          i18nKey="stepShipping.shipment"
                                          components={{
                                            Wrap: (
                                              <span className="text-sm font-medium text-gray-500" />
                                            ),
                                          }}
                                          values={{
                                            current: index + 1,
                                            total: shipments.length.toString(),
                                          }}
                                        />
                                      )
                                    }}
                                  </ShipmentField>
                                </ShippingTitle>
                              )}
                              <GridContainer className="mb-6">
                                <ShippingMethod
                                  emptyText={t("stepShipping.notAvailable")}
                                >
                                  <ShippingSummary data-testid="shipping-methods-container">
                                    <StyledShippingMethodRadioButton
                                      data-testid="shipping-method-button"
                                      className="form-radio mt-0.5 md:mt-0 peer"
                                      onChange={(params) =>
                                        handleChange(params)
                                      }
                                    />
                                    <ShippingMethodName data-testid="shipping-method-name">
                                      {(props) => {
                                        const deliveryLeadTime =
                                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                          // @ts-ignore
                                          props?.deliveryLeadTimeForShipment
                                        return (
                                          <label
                                            className="flex flex-col p-3 border rounded cursor-pointer hover:border-gray-400 transition duration-200 ease-in peer-checked:border-2 peer-checked:border-primary peer-checked:shadow-md peer-checked:bg-gray-50"
                                            htmlFor={props.htmlFor}
                                          >
                                            <ShippingLineItemTitle>
                                              {props.label}
                                            </ShippingLineItemTitle>
                                            {deliveryLeadTime?.min_days &&
                                              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                              // @ts-ignore
                                              deliveryLeadTime?.max_days && (
                                                <ShippingSummaryItemDescription>
                                                  <Trans i18nKey="stepShipping.deliveryLeadTime">
                                                    <DeliveryLeadTime
                                                      type="min_days"
                                                      data-testid="delivery-lead-time-min-days"
                                                    />
                                                    <DeliveryLeadTime
                                                      type="max_days"
                                                      data-testid="delivery-lead-time-max-days"
                                                      className="mr-1"
                                                    />
                                                  </Trans>
                                                </ShippingSummaryItemDescription>
                                              )}
                                            <ShippingSummaryValue>
                                              <ShippingMethodPrice
                                                data-testid="shipping-method-price"
                                                labelFreeOver={t(
                                                  "general.free",
                                                )}
                                                labelExternal={t(
                                                  "stepShipping.externalPrice",
                                                )}
                                              />
                                            </ShippingSummaryValue>
                                          </label>
                                        )
                                      }}
                                    </ShippingMethodName>
                                  </ShippingSummary>
                                </ShippingMethod>
                              </GridContainer>
                              <LineItemsContainer>
                                {ShippingLineItems.map((type) => (
                                  <LineItem key={type} type={type}>
                                    <ShippingLineItem>
                                      <LineItemImage
                                        width={50}
                                        className="self-start p-1 border rounded"
                                      />
                                      <ShippingLineItemDescription>
                                        <ShippingLineItemTitle>
                                          <LineItemName data-testid="line-item-name" />
                                        </ShippingLineItemTitle>
                                        <ShippingLineItemQty>
                                          <LineItemQuantity readonly>
                                            {({ quantity }) => (
                                              <>
                                                {!!quantity &&
                                                  t("orderRecap.quantity", {
                                                    count: quantity,
                                                  })}
                                              </>
                                            )}
                                          </LineItemQuantity>
                                        </ShippingLineItemQty>
                                      </ShippingLineItemDescription>
                                    </ShippingLineItem>
                                    <StockTransfer>
                                      <ShippingLineItem>
                                        <StockTransferField
                                          attribute="image_url"
                                          tagElement="img"
                                          width={50}
                                          className="self-start p-1 border rounded"
                                        />
                                        <ShippingLineItemDescription>
                                          <ShippingLineItemTitle>
                                            <StockTransferField
                                              attribute="name"
                                              tagElement="p"
                                              data-testid="line-item-name"
                                            />
                                          </ShippingLineItemTitle>
                                          <ShippingLineItemQty>
                                            <Trans
                                              i18nKey={
                                                "orderRecap.quantity_stock"
                                              }
                                            >
                                              <StockTransferField
                                                attribute="quantity"
                                                tagElement="span"
                                              />
                                            </Trans>
                                          </ShippingLineItemQty>
                                        </ShippingLineItemDescription>
                                      </ShippingLineItem>
                                    </StockTransfer>
                                  </LineItem>
                                ))}
                              </LineItemsContainer>
                            </ShippingWrapper>
                          </Shipment>
                          <ButtonWrapper>
                            <Button
                              disabled={!canContinue || isLocalLoader}
                              // disabled={!canContinue || isLocalLoader}
                              data-testid="save-shipping-button"
                              onClick={handleSave}
                            >
                              {isLocalLoader && <SpinnerIcon />}
                              {t("stepShipping.continueToPayment")}
                            </Button>
                          </ButtonWrapper>
                        </>
                      )}
                    </ShipmentsContainer>
                  }
                </>
              )}
            </div>
          )}
        </>
      </StepContent>
    </StepContainer>
  )
}
