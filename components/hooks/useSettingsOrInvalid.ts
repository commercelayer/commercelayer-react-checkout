import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { getSettings } from "utils/getSettings"
import { getSubdomain } from "utils/getSubdomain"

import { useLocalStorageToken } from "./useLocalStorageToken"

interface UseSettingsOrInvalid {
  settings?: CheckoutSettings
  retryOnError?: boolean
  isLoading: boolean
}

export const useSettingsOrInvalid = (): UseSettingsOrInvalid => {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const accessToken = searchParams.get("accessToken")
  const paymentReturn = searchParams.get("paymentReturn")
  const redirectResult = searchParams.get("redirectResult")
  const paymentIntentClientSecret = searchParams.get(
    "payment_intent_client_secret",
  )
  const [settings, setSettings] = useState<
    CheckoutSettings | InvalidCheckoutSettings | undefined
  >(undefined)
  const [isFetching, setIsFetching] = useState(true)

  const [savedAccessToken, setAccessToken] = useLocalStorageToken(
    "checkoutAccessToken",
    accessToken as string,
  )

  const isPaymentReturn =
    paymentReturn === "true" || !!redirectResult || !!paymentIntentClientSecret

  useEffect(() => {
    if (accessToken && accessToken !== savedAccessToken) {
      setAccessToken(accessToken)
    }
  }, [accessToken])

  const syncedAccessToken =
    accessToken === savedAccessToken || (!accessToken && savedAccessToken)

  useEffect(() => {
    if (syncedAccessToken) {
      setIsFetching(true)
      getSettings({
        accessToken: savedAccessToken,
        orderId: orderId as string,
        paymentReturn: isPaymentReturn,
        subdomain: getSubdomain(window.location.hostname),
      }).then((fetchedSettings) => {
        setSettings(fetchedSettings)
        setIsFetching(false)
      })
    }
  }, [syncedAccessToken])

  // No accessToken in URL
  if (!isPaymentReturn && accessToken === null) {
    navigate("/404")
    return { settings: undefined, isLoading: false }
  }

  if (isFetching) {
    return { isLoading: true, settings: undefined }
  }

  if (settings && !settings.validCheckout) {
    if (!settings.retryOnError) {
      navigate("/404")
    }
    return { settings: undefined, retryOnError: true, isLoading: false }
  }

  return {
    settings,
    isLoading: false,
  }
}
