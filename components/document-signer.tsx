"use client"

import { useState, useRef, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  FileUp,
  Highlighter,
  Underline,
  MessageSquare,
  Pen,
  Download,
  X,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import dynamic from "next/dynamic"
import SignatureCanvas from "./signature-canvas"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { motion, AnimatePresence } from "framer-motion"
import ErrorBoundary from "./error-boundary"

// Add a fallback component for PDF viewer errors
const PDFViewerErrorFallback = () => (
  <div className="flex flex-col items-center justify-center h-[800px] w-full p-8 text-center">
    <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-lg mb-4">
      <X className="h-12 w-12 text-red-500 mx-auto mb-2" />
      <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">PDF Viewer Error</h3>
      <p className="text-red-600 dark:text-red-300">
        There was a problem loading the PDF viewer component. Please try refreshing the page.
      </p>
    </div>
  </div>
)

// Dynamically import PDFViewer to avoid SSR issues with PDF.js
const PDFViewer = dynamic(() => import("./pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[800px] w-full">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin text-violet-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
        </div>
        <span className="text-lg font-medium">Loading PDF viewer...</span>
      </div>
    </div>
  ),
})

type Annotation = {
  id: string
  type: "highlight" | "underline" | "comment" | "signature"
  pageNumber: number
  position: { x: number; y: number }
  width?: number
  height?: number
  color?: string
  content?: string
  signatureData?: string
}

export default function DocumentSigner() {
  const [file, setFile] = useState<File | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [currentTool, setCurrentTool] = useState<string | null>(null)
  const [currentColor, setCurrentColor] = useState("#FFEB3B") // Default yellow for highlights
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const signatureRef = useRef<any>(null)

  // Set dark mode based on user preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const selectedFile = acceptedFiles[0]
      if (selectedFile?.type === "application/pdf") {
        setFile(selectedFile)
        setAnnotations([])
        setPdfError(null)
        toast({
          title: "✨ Document uploaded",
          description: `${selectedFile.name} has been successfully loaded.`,
        })
      } else {
        toast({
          title: "❌ Invalid file format",
          description: "Please upload a PDF document.",
          variant: "destructive",
        })
      }
    },
    accept: {
      "application/pdf": [".pdf"],
    },
  })

  const handleToolSelect = (tool: string) => {
    setCurrentTool(currentTool === tool ? null : tool)

    if (tool !== currentTool) {
      toast({
        title: getToolEmoji(tool) + " " + getToolName(tool) + " tool selected",
        description: getToolDescription(tool),
        duration: 2000,
      })
    }
  }

  const getToolEmoji = (tool: string) => {
    switch (tool) {
      case "highlight":
        return "🟨"
      case "underline":
        return "📏"
      case "comment":
        return "💬"
      case "signature":
        return "✍️"
      default:
        return "🔧"
    }
  }

  const getToolName = (tool: string) => {
    return tool.charAt(0).toUpperCase() + tool.slice(1)
  }

  const getToolDescription = (tool: string) => {
    switch (tool) {
      case "highlight":
        return "Click and drag to highlight text"
      case "underline":
        return "Click and drag to underline text"
      case "comment":
        return "Click to add a comment"
      case "signature":
        return "Create and place your signature"
      default:
        return ""
    }
  }

  const handleAnnotation = (
    pageNumber: number,
    position: { x: number; y: number },
    dimensions?: { width: number; height: number },
  ) => {
    if (!currentTool) return

    const newAnnotation: Annotation = {
      id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: currentTool as any,
      pageNumber,
      position,
      color: currentColor,
    }

    if (dimensions) {
      newAnnotation.width = dimensions.width
      newAnnotation.height = dimensions.height
    }

    if (currentTool === "comment") {
      // Will be filled by the comment form
      newAnnotation.content = ""
    }

    setAnnotations([...annotations, newAnnotation])

    if (currentTool === "signature") {
      setCurrentTool(null)
    }
  }

  const handleSignatureSave = (signatureData: string, annotationId: string) => {
    setAnnotations(annotations.map((ann) => (ann.id === annotationId ? { ...ann, signatureData } : ann)))
  }

  const handleCommentSave = (content: string, annotationId: string) => {
    setAnnotations(annotations.map((ann) => (ann.id === annotationId ? { ...ann, content } : ann)))

    toast({
      title: "💬 Comment saved",
      description: "Your comment has been added to the document.",
      duration: 2000,
    })
  }

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter((ann) => ann.id !== id))

    toast({
      title: "🗑️ Annotation removed",
      description: "The annotation has been deleted.",
      duration: 2000,
    })
  }

  const exportDocument = async () => {
    if (!file) return

    setIsExporting(true)

    // In a real application, you would use pdf-lib or a similar library
    // to modify the PDF with all annotations and then export it

    // This is a simplified mock of the export process
    setTimeout(() => {
      setIsExporting(false)
      toast({
        title: "🚀 Document exported",
        description: "Your annotated document has been exported successfully.",
      })
    }, 2000)
  }

  const handlePdfError = (error: Error) => {
    console.error("PDF loading error:", error)

    // Provide specific error messages based on the error
    let errorMessage = "There was a problem loading your PDF."

    if (error.message.includes("worker")) {
      errorMessage = "PDF worker could not be loaded. This might be due to browser restrictions."
    } else if (error.message.includes("password")) {
      errorMessage = "This PDF is password protected. Please provide a PDF without password protection."
    } else if (error.message.includes("corrupt") || error.message.includes("invalid")) {
      errorMessage = "The PDF file appears to be corrupt or invalid. Please try another file."
    } else if (error.message.includes("404")) {
      errorMessage = "Could not load required PDF components. This might be due to network issues."
    }

    setPdfError(errorMessage)
    toast({
      title: "❌ PDF loading error",
      description: errorMessage,
      variant: "destructive",
    })
  }

  return (
		<div className="flex flex-col min-h-screen">
			<Toaster />

			{/* Header */}
			<header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Sparkles className="h-6 w-6 text-violet-500" />
					<h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 text-transparent bg-clip-text">
						DocuSign Pro
					</h1>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setDarkMode(!darkMode)}
						className="rounded-full"
						title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
					>
						{darkMode ? (
							<Sun className="h-5 w-5" />
						) : (
							<Moon className="h-5 w-5" />
						)}
					</Button>
				</div>
			</header>

			<div className="flex-1 p-4 md:p-8">
				<AnimatePresence mode="wait">
					{!file ? (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3 }}
							className="max-w-3xl mx-auto"
						>
							<div className="text-center mb-8">
								<h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 text-transparent bg-clip-text">
									Document Signer & Annotation Tool
								</h2>
								<p className="text-slate-600 dark:text-slate-400">
									Upload a PDF to get started with annotations, comments, and
									signatures
								</p>
							</div>

							<div
								{...getRootProps()}
								className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                  ${
										isDragActive
											? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 scale-105"
											: "border-slate-300 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-900/10"
									}`}
							>
								<input {...getInputProps()} />
								<div className="bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 p-6 rounded-full inline-flex mb-4">
									<FileUp className="h-12 w-12 text-violet-500 dark:text-violet-400" />
								</div>
								<h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">
									Drop your PDF here
								</h3>
								<p className="text-slate-600 dark:text-slate-400 mb-4">
									or click to browse your files
								</p>
								<Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
									Choose a file
								</Button>
							</div>
						</motion.div>
					) : (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="flex flex-col h-[calc(100vh-150px)]"
						>
							<div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg mb-4 overflow-hidden">
								<Tabs defaultValue="tools" className="w-full">
									<TabsList className="w-full justify-start p-1 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
										<TabsTrigger
											value="tools"
											className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
										>
											✏️ Annotation Tools
										</TabsTrigger>
										<TabsTrigger
											value="view"
											className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
										>
											👁️ View Options
										</TabsTrigger>
									</TabsList>

									<TabsContent
										value="tools"
										className="p-3 flex flex-wrap gap-2"
									>
										<div className="flex flex-wrap items-center gap-2">
											<Button
												variant={
													currentTool === "highlight" ? "default" : "outline"
												}
												size="sm"
												onClick={() => handleToolSelect("highlight")}
												title="Highlight Text"
												className={`rounded-full ${
													currentTool === "highlight"
														? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white"
														: ""
												}`}
											>
												<Highlighter className="h-4 w-4 mr-1" />
												Highlight
											</Button>

											<Button
												variant={
													currentTool === "underline" ? "default" : "outline"
												}
												size="sm"
												onClick={() => handleToolSelect("underline")}
												title="Underline Text"
												className={`rounded-full ${
													currentTool === "underline"
														? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
														: ""
												}`}
											>
												<Underline className="h-4 w-4 mr-1" />
												Underline
											</Button>

											<Button
												variant={
													currentTool === "comment" ? "default" : "outline"
												}
												size="sm"
												onClick={() => handleToolSelect("comment")}
												title="Add Comment"
												className={`rounded-full ${
													currentTool === "comment"
														? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
														: ""
												}`}
											>
												<MessageSquare className="h-4 w-4 mr-1" />
												Comment
											</Button>

											<Dialog>
												<DialogTrigger asChild>
													<Button
														variant={
															currentTool === "signature"
																? "default"
																: "outline"
														}
														size="sm"
														onClick={() => handleToolSelect("signature")}
														title="Add Signature"
														className={`rounded-full ${
															currentTool === "signature"
																? "bg-gradient-to-r from-pink-400 to-rose-500 text-white"
																: ""
														}`}
													>
														<Pen className="h-4 w-4 mr-1" />
														Signature
													</Button>
												</DialogTrigger>
												<DialogContent className="sm:max-w-md">
													<DialogHeader>
														<DialogTitle>✍️ Create Your Signature</DialogTitle>
													</DialogHeader>
													<SignatureCanvas ref={signatureRef} />
													<div className="flex justify-end gap-2 mt-4">
														<Button
															variant="outline"
															onClick={() => signatureRef.current?.clear()}
															className="rounded-full"
														>
															Clear
														</Button>
														<DialogClose asChild>
															<Button
																onClick={() => {
																	if (signatureRef.current?.isEmpty()) {
																		toast({
																			title: "❌ Signature is empty",
																			description:
																				"Please draw your signature before saving.",
																			variant: "destructive",
																		});
																		return;
																	}
																	toast({
																		title: "✍️ Signature created",
																		description:
																			"Click on the document to place your signature.",
																	});
																}}
																className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
															>
																Save Signature
															</Button>
														</DialogClose>
													</div>
												</DialogContent>
											</Dialog>
										</div>

										{(currentTool === "highlight" ||
											currentTool === "underline") && (
											<div className="flex items-center gap-2 ml-2">
												<span className="text-sm">Color:</span>
												{[
													{ color: "#FFEB3B", name: "Yellow" },
													{ color: "#4CAF50", name: "Green" },
													{ color: "#2196F3", name: "Blue" },
													{ color: "#F44336", name: "Red" },
													{ color: "#9C27B0", name: "Purple" },
												].map(({ color, name }) => (
													<motion.button
														key={color}
														className={`w-6 h-6 rounded-full border transition-all ${
															currentColor === color
																? "ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-slate-800 scale-110"
																: "border-gray-300 hover:scale-105"
														}`}
														style={{ backgroundColor: color }}
														onClick={() => setCurrentColor(color)}
														title={`Select ${name} color`}
														whileHover={{ scale: 1.1 }}
														whileTap={{ scale: 0.95 }}
													/>
												))}
											</div>
										)}

										<div className="flex items-center gap-2 ml-auto">
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setFile(null);
													setAnnotations([]);
													setCurrentTool(null);
												}}
												title="Close Document"
												className="rounded-full"
											>
												<X className="h-4 w-4 mr-1" />
												Close
											</Button>

											<Button
												size="sm"
												onClick={exportDocument}
												disabled={isExporting}
												title="Export Document"
												className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
											>
												<Download className="h-4 w-4 mr-1" />
												{isExporting ? "Exporting..." : "Export PDF"}
											</Button>
										</div>
									</TabsContent>

									<TabsContent
										value="view"
										className="p-3 flex flex-wrap gap-4 items-center"
									>
										<div className="flex items-center gap-2">
											<span className="text-sm whitespace-nowrap">
												Zoom: {Math.round(scale * 100)}%
											</span>
											<Slider
												className="w-32"
												value={[scale]}
												min={0.5}
												max={2}
												step={0.1}
												onValueChange={(value) => setScale(value[0])}
											/>
										</div>

										<div className="flex items-center gap-2">
											<span className="text-sm">
												Page {currentPage} of {totalPages}
											</span>
											<div className="flex gap-1">
												<Button
													variant="outline"
													size="icon"
													onClick={() =>
														setCurrentPage(Math.max(1, currentPage - 1))
													}
													disabled={currentPage <= 1}
													className="h-8 w-8 rounded-full"
												>
													<ChevronLeft className="h-4 w-4" />
												</Button>
												<Button
													variant="outline"
													size="icon"
													onClick={() =>
														setCurrentPage(
															Math.min(totalPages, currentPage + 1)
														)
													}
													disabled={currentPage >= totalPages}
													className="h-8 w-8 rounded-full"
												>
													<ChevronRight className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</TabsContent>
								</Tabs>
							</div>

							<div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden relative">
								{pdfError ? (
									<div className="flex flex-col items-center justify-center h-full p-6 text-center">
										<div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg mb-4">
											<X className="h-12 w-12 text-red-500 mx-auto mb-2" />
											<h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
												PDF Loading Error
											</h3>
											<p className="text-red-600 dark:text-red-300">
												{pdfError}
											</p>
										</div>
										<Button
											onClick={() => {
												setFile(null);
												setPdfError(null);
											}}
											className="rounded-full"
										>
											Try Another File
										</Button>
									</div>
								) : (
									// <ErrorBoundary fallback={<PDFViewerErrorFallback />}>
									<PDFViewer fileUrl={URL.createObjectURL(file)} />
									// </ErrorBoundary>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

