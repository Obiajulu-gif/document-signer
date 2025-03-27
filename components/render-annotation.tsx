import type React from "react"
import type { Annotation } from "@/types/annotation-types"

interface RenderAnnotationProps {
  annotation: Annotation
}

const RenderAnnotation: React.FC<RenderAnnotationProps> = ({ annotation }) => {
  const { type, x, y, width, height, color, dataUrl } = annotation

  const getStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: `${x}px`,
      top: `${y}px`,
    }

    switch (type) {
      case "highlight":
        return {
          ...baseStyle,
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: color,
          opacity: 0.4,
          borderRadius: "3px",
          pointerEvents: "none",
        }
      case "underline":
        return {
          ...baseStyle,
          width: `${width}px`,
          height: "3px",
          backgroundColor: color,
          marginTop: "18px",
          pointerEvents: "none",
        }
      case "comment":
        return {
          ...baseStyle,
          width: "24px",
          height: "24px",
          backgroundColor: color || "#FFC107",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "12px",
          cursor: "pointer",
          zIndex: 10,
        }
      case "signature":
        return {
          ...baseStyle,
          pointerEvents: "none",
        }
      default:
        return baseStyle
    }
  }

  return (
    <div style={getStyle()}>
      {type === "comment" && "💬"}
      {type === "signature" && dataUrl && (
        <img
          src={dataUrl || "/placeholder.svg"}
          alt="Signature"
          style={{
            maxWidth: "200px",
            maxHeight: "100px",
          }}
        />
      )}
    </div>
  )
}

export default RenderAnnotation

