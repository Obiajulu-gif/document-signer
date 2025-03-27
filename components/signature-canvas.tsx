"use client"

import { useRef, forwardRef, useImperativeHandle } from "react"
import SignaturePad from "react-signature-canvas"

type SignatureCanvasProps = {
  width?: number
  height?: number
}

const SignatureCanvas = forwardRef<any, SignatureCanvasProps>(({ width = 500, height = 200 }, ref) => {
  const sigCanvas = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    clear: () => {
      sigCanvas.current?.clear()
    },
    toDataURL: () => {
      return sigCanvas.current?.toDataURL()
    },
    isEmpty: () => {
      return sigCanvas.current?.isEmpty()
    },
  }))

  return (
    <div className="border rounded-xl bg-white dark:bg-slate-700 p-2">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 text-center">Draw your signature below</div>
      <SignaturePad
        ref={sigCanvas}
        canvasProps={{
          width,
          height,
          className: "signature-canvas w-full h-full rounded-lg border border-slate-200 dark:border-slate-600",
        }}
        penColor="black"
      />
    </div>
  )
})

SignatureCanvas.displayName = "SignatureCanvas"

export default SignatureCanvas

