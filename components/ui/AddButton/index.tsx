import { useTranslation } from "react-i18next"
import styled from "styled-components"
import tw from "twin.macro"

interface Props {
  dataTestId: string
  action: () => void
}

export const AddButton: React.FC<Props> = ({ dataTestId, action }) => {
  const { t } = useTranslation()

  return (
    <Wrapper data-testid={dataTestId} onClick={action}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <title>Add button</title>
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
          clipRule="evenodd"
        />
      </svg>
      <Label>{t("stepCustomer.addNewAddress")}</Label>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  ${tw`w-full flex py-2 justify-center items-center text-center px-2 bg-gray-50 text-gray-400 border rounded cursor-pointer hover:border-gray-400/50 transition duration-200 ease-in`}
`
const Label = styled.p`
  ${tw`text-xs pl-0.5`}
`
