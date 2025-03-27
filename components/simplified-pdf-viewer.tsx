"use client";

import React from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const PdfViewer = ({ file }) => {
	// Initialize default layout plugin (for sidebar, toolbar, etc.)
	const defaultLayout = defaultLayoutPlugin();

	return (
		<div style={{ height: "100vh", width: "100%" }}>
			<Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
				<Viewer fileUrl={file} plugins={[defaultLayout]} />
			</Worker>
		</div>
	);
};

export default PdfViewer;
