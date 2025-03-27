"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import CommentForm from "./comment-form"

type AnnotationLayerProps = {
  annotations: any[]
  onDeleteAnnotation: (id: string) => void
  onCommentSave: (content: string, annotationId: string) => void
  scale: number
}

export default function AnnotationLayer({
  annotations,
  onDeleteAnnotation,
  onCommentSave,
  scale,
}: AnnotationLayerProps) {
  const [activeComment, setActiveComment] = useState<string | null>(null)

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {annotations.map((annotation) => {
        const { id, type, position, width, height, color, content, signatureData } = annotation
        const posX = position.x * scale
        const posY = position.y * scale

        switch (type) {
          case "highlight":
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute group pointer-events-auto"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  width: width ? `${width * scale}px` : "100px",
                  height: height ? `${height * scale}px` : "20px",
                  backgroundColor: color,
                  opacity: 0.4,
                  borderRadius: "3px",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteAnnotation(id)}
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </motion.div>
            )

          case "underline":
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute group pointer-events-auto"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  width: width ? `${width * scale}px` : "100px",
                  height: "3px",
                  backgroundColor: color,
                  marginTop: "18px",
                  borderRadius: "3px",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteAnnotation(id)}
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </motion.div>
            )

          case "comment":
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute group pointer-events-auto z-10"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-amber-200 to-yellow-300 dark:from-amber-300 dark:to-yellow-400 p-2 rounded-full shadow-md w-8 h-8 flex items-center justify-center cursor-pointer"
                  onClick={() => setActiveComment(id)}
                >
                  {content ? "💬" : "➕"}
                </motion.div>

                {activeComment === id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-2 z-20 w-64"
                  >
                    <CommentForm
                      initialContent={content || ""}
                      onSave={(newContent) => {
                        onCommentSave(newContent, id)
                        setActiveComment(null)
                      }}
                      onCancel={() => setActiveComment(null)}
                    />
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteAnnotation(id)}
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </motion.div>
            )

          case "signature":
            return signatureData ? (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute group pointer-events-auto"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                }}
              >
                <img
                  src={signatureData || "/placeholder.svg"}
                  alt="Signature"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "100px",
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                  className="filter drop-shadow-md"
                />
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteAnnotation(id)}
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </motion.div>
            ) : null

          default:
            return null
        }
      })}
    </div>
  )
}

