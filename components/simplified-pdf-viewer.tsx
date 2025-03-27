"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Loader2 } from "lucide-react"
import AnnotationLayer from "./annotation-layer"

// Use a specific version of the worker that is known to work
pdfjs.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js"

type PDFViewerProps = {
  file: File | null
  annotations: any[]
  currentTool: string | null
  onAnnotation: (
    pageNumber: number,
    position: { x: number; y: number },
    dimensions?: { width: number; height: number },
  ) => void
  onDeleteAnnotation: (id: string) => void
  onSignatureSave: (signatureData: string, annotationId: string) => void
  onCommentSave: (content: string, annotationId: string) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
  setTotalPages: (pages: number) => void
  scale: number
  signatureRef: React.RefObject<any>
  onError: (error: Error) => void
}

export default function PDFViewer({
  file,
  annotations,
  currentTool,
  onAnnotation,
  onDeleteAnnotation,
  onSignatureSave,
  onCommentSave,
  currentPage,
  setCurrentPage,
  totalPages,
  setTotalPages,
  scale,
  signatureRef,
  onError,
}: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Create a blob URL from the file
  useEffect(() => {
    // Clean up previous URL if it exists
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl)
    }

    if (!file) {
      setFileUrl(null)
      return
    }

    // Create a blob URL from the file
    try {
      const url = URL.createObjectURL(file)
      setFileUrl(url)

      // Clean up the URL when component unmounts or file changes
      return () => {
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error creating object URL:", error)
      onError(new Error("Failed to create URL for PDF file"))
    }
  }, [file, onError])

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages)
    setIsLoading(false)
  }

  const handleDocumentLoadError = (error: Error) => {
    console.error("PDF.js error:", error)
    setIsLoading(false)
    onError(error)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTool || !containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    const position = {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    }

    if (currentTool === "signature" && signatureRef.current) {
      const signatureData = signatureRef.current.toDataURL()
      onAnnotation(currentPage, position)

      // Find the last added annotation (which should be the signature we just added)
      setTimeout(() => {
        const lastAnnotation = annotations[annotations.length - 1]
        if (lastAnnotation && lastAnnotation.type === "signature") {
          onSignatureSave(signatureData, lastAnnotation.id)
        }
      }, 0)
    } else {
      onAnnotation(currentPage, position)
    }
  }

  return (
    <div className="flex justify-center h-full overflow-auto p-4">
      {file && (
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 z-10 rounded-xl">
              <Loader2 className="h-12 w-12 animate-spin text-violet-500 mb-4" />
              <span className="text-lg font-medium bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 text-transparent bg-clip-text">
                Loading your document...
              </span>
            </div>
          )}

          <div
            ref={containerRef}
            className="relative cursor-crosshair bg-white dark:bg-slate-800 rounded-xl shadow-lg"
            onClick={handleClick}
          >
            {fileUrl && (
              <Document
                file={fileUrl}
                onLoadSuccess={handleDocumentLoadSuccess}
                onLoadError={handleDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-[800px] w-[600px]">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                  </div>
                }
                options={{
                  cMapUrl: "https://unpkg.com/pdfjs-dist@2.16.105/cmaps/",
                  cMapPacked: true,
                  standardFontDataUrl: "https://unpkg.com/pdfjs-dist@2.16.105/standard_fonts/",
                  disableWorker: false,
                }}
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-md"
                  loading={
                    <div className="flex items-center justify-center h-[800px] w-[600px]">
                      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                    </div>
                  }
                />

                <AnnotationLayer
                  annotations={annotations.filter((a) => a.pageNumber === currentPage)}
                  onDeleteAnnotation={onDeleteAnnotation}
                  onCommentSave={onCommentSave}
                  scale={scale}
                />
              </Document>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

