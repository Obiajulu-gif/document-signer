"use client";

import React from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const PdfViewer = ({ fileUrl }: { fileUrl: string }) => {
	// Initialize default layout plugin (for sidebar, toolbar, etc.)
	const defaultLayout = defaultLayoutPlugin();

	return (
		<div style={{ height: "100vh", width: "100%" }}>
			<Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
				<Viewer fileUrl={fileUrl} plugins={[defaultLayout]} />
			</Worker>
		</div>
	);
};

export default PdfViewer;
