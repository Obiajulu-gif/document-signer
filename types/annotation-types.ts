export type AnnotationType = "highlight" | "underline" | "comment" | "signature" | "hand"

export interface Annotation {
  id?: string
  type: AnnotationType
  pageNumber?: number
  page?: number
  position?: { x: number; y: number }
  x?: number
  y?: number
  width?: number
  height?: number
  color?: string
  content?: string
  signatureData?: string
  text?: string
  comment?: string
  dataUrl?: string | null
}

