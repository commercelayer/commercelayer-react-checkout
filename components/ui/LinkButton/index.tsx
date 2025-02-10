import type LinkButtonProps from "./props"
import { Button } from "./styled"

export const LinkButton: React.FC<LinkButtonProps> = ({
  onClick,
  label,
  ...rest
}) => {
  return (
    <Button onClick={onClick} {...rest}>
      {label}
    </Button>
  )
}
