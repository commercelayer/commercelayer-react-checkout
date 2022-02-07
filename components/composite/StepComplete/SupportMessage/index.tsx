import { Trans } from "react-i18next"

interface Props {
  supportPhone?: string
  supportEmail?: string
}

export const SupportMessage: React.FC<Props> = ({
  supportPhone,
  supportEmail,
}) => {
  const handleEmail = () => {
    return window.open(`mailto:${supportEmail}`)
  }

  const handlePhone = () => {
    return window.open(`tel:${supportEmail}`)
  }

  const setI18nKey = () => {
    if (supportPhone && supportEmail) {
      return "stepComplete.fullSupport"
    }
    if (!supportPhone && supportEmail) {
      return "stepComplete.supportEmail"
    }
    if (supportPhone && !supportEmail) {
      return "stepComplete.supportPhone"
    }
  }

  if (!supportPhone && !supportEmail) {
    return <></>
  }

  return (
    <Trans
      i18nKey={setI18nKey()}
      values={{ email: supportEmail, phone: supportPhone }}
      components={{
        WrapperEmail: (
          <strong
            className="text-black border-b border-gray-400 cursor-pointer"
            onClick={handleEmail}
          />
        ),
        WrapperPhone: (
          <strong
            className="text-black border-b border-gray-400 cursor-pointer"
            onClick={handlePhone}
          />
        ),
      }}
    />
  )
}
