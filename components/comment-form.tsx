"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"

type CommentFormProps = {
  initialContent: string
  onSave: (content: string) => void
  onCancel: () => void
}

export default function CommentForm({ initialContent, onSave, onCancel }: CommentFormProps) {
  const [content, setContent] = useState(initialContent)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
    >
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add your comment here..."
        className="min-h-[100px] mb-2 rounded-lg border-slate-200 dark:border-slate-700 focus:border-violet-500"
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} className="rounded-full">
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={() => onSave(content)}
          className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
        >
          Save
        </Button>
      </div>
    </motion.div>
  )
}

