import styled from "styled-components"

export const CheckIcon: React.FC = () => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 154 154"
      className="icon-order-success"
    >
      <title>Success icon</title>
      <g fill="none" stroke="#1FDA8A" strokeWidth="2">
        <circle cx="77" cy="77" r="72" className="circle" />
        <circle
          id="colored"
          className="colored_circle"
          fill="#1FDA8A"
          cx="77"
          cy="77"
          r="72"
        />
        <polyline
          className="checkmark"
          stroke="#fff"
          strokeWidth="5"
          points="43.5,77.8 63.7,97.9 112.2,49.4 "
        />
      </g>
    </Svg>
  )
}

const Svg = styled.svg`
  width: 154px;
  height: 154px;
  animation: scale 0.3s ease-in-out 0.9s both;

  .circle {
    stroke-dasharray: 480px, 480px;
    stroke-dashoffset: 960px;
  }

  .colored_circle {
    stroke-dasharray: 480px, 480px;
    stroke-dashoffset: 960px;
  }

  .checkmark {
    stroke-dasharray: 100px, 100px;
    stroke-dashoffset: 200px;
  }

  polyline {
    animation: checkmark 0.25s ease-in-out 0.7s backwards;
  }

  circle {
    animation: checkmark-circle 0.6s ease-in-out backwards;
  }

  circle#colored {
    animation: colored-circle 0.6s ease-in-out 0.7s backwards;
  }

  @keyframes checkmark {
    0% {
      stroke-dashoffset: 100px;
    }

    100% {
      stroke-dashoffset: 0;
    }
  }

  @keyframes checkmark-circle {
    0% {
      stroke-dashoffset: 480px;
    }

    100% {
      stroke-dashoffset: 960px;
    }
  }

  @keyframes colored-circle {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 100;
    }
  }

  @keyframes scale {
    0%,
    100% {
      transform: none;
    }

    50% {
      transform: scale3d(1.1, 1.1, 1);
    }
  }
`
