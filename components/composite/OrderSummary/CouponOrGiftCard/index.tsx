import {
  GiftCardOrCouponCode,
  GiftCardOrCouponRemoveButton,
  DiscountAmount,
  GiftCardAmount,
  GiftCardOrCouponInput,
  GiftCardOrCouponSubmit,
  Errors,
  GiftCardOrCouponForm,
} from "@commercelayer/react-components"
import { AppContext } from "components/data/AppProvider"
import * as S from "components/ui"
import { useContext, useState } from "react"
import { useTranslation } from "react-i18next"
import "twin.macro"

export const CouponOrGiftCard: React.FC = () => {
  const { t } = useTranslation()

  const appCtx = useContext(AppContext)

  if (!appCtx) {
    return null
  }

  const { refetchOrder } = appCtx

  const [codeError, setCodeError] = useState(false)

  const handleSubmit = async ({ success }: { success: boolean }) => {
    if (!success) return setCodeError(true)
    if (success) {
      // soluzione momentanea in vista di una risoluzione di @commercelayer/react-components
      setTimeout(() => {
        refetchOrder()
      }, 2000)
    }
    return setCodeError(false)
  }

  const classError = codeError
    ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
    : ""

  const removeIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )

  const labelButton = (
    <>
      <svg
        className="w-5 h-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>
    </>
  )
  return (
    <>
      <GiftCardOrCouponForm onSubmit={handleSubmit}>
        <S.LayoutGiftCardOrCouponForm
          input={
            <GiftCardOrCouponInput
              data-cy="input_giftcard_coupon"
              className={`${classError} focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300`}
            />
          }
          submit={
            <GiftCardOrCouponSubmit
              data-cy="submit_giftcard_coupon"
              label={labelButton}
              className={`${classError} -ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
            />
          }
        />
      </GiftCardOrCouponForm>
      <Errors
        className={classError}
        resource="order"
        field="giftCardOrCouponCode"
      />
      <GiftCardOrCouponCode
        type="coupon"
        className="inline-flex items-center pr-1 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-full py-0.5 pl-2.5"
      >
        {(props) => {
          const { hide, code, ...p } = props
          return hide ? null : (
            <>
              <span data-cy="code-coupon" {...p}>
                {code}
                <GiftCardOrCouponRemoveButton
                  data-cy="remove_coupon"
                  type="coupon"
                  className="inline-flex items-center justify-center flex-shrink-0 w-4 h-4 text-indigo-400 rounded-full ml-0.5 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                  label={removeIcon}
                  onClick={refetchOrder}
                />
              </span>
            </>
          )
        }}
      </GiftCardOrCouponCode>
      <GiftCardOrCouponCode
        type="giftCard"
        className="inline-flex items-center pr-1 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-full py-0.5 pl-2.5"
      >
        {(props) => {
          const { hide, code, ...p } = props
          return hide ? null : (
            <>
              <span data-cy="code-giftcard" {...p}>
                {code}
                <GiftCardOrCouponRemoveButton
                  data-cy="remove_giftcard"
                  type="giftCard"
                  className="inline-flex items-center justify-center flex-shrink-0 w-4 h-4 text-indigo-400 rounded-full ml-0.5 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                  label={removeIcon}
                  onClick={refetchOrder}
                />
              </span>
            </>
          )
        }}
      </GiftCardOrCouponCode>
      <GiftCardOrCouponCode type="coupon">
        {(props) => {
          const { hide } = props
          return hide ? null : (
            <S.LayoutBaseAmount
              main={
                <>
                  {t("orderRecap.discount_amount")}
                  <DiscountAmount data-cy="discount-amount" />
                </>
              }
            />
          )
        }}
      </GiftCardOrCouponCode>
      <GiftCardOrCouponCode type="giftCard">
        {(props) => {
          const { hide } = props
          return hide ? null : (
            <S.LayoutBaseAmount
              main={
                <>
                  {t("orderRecap.giftcard_amount")}
                  <GiftCardAmount data-cy="giftcard-amount" />
                </>
              }
            />
          )
        }}
      </GiftCardOrCouponCode>
    </>
  )
}
