"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";

const DataExportOptions = ({ data, fileName = "exported_data" }) => {
  const [exportType, setExportType] = useState("csv");

  // Export as CSV using XLSX
  const exportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${fileName}.csv`);
  };

  // Export as Excel (.xlsx)
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, `${fileName}.xlsx`);
  };

  // Export as PDF using jsPDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const pdfContent = JSON.stringify(data, null, 2);
    const lines = doc.splitTextToSize(pdfContent, 180);
    doc.text(lines, 10, 10);
    doc.save(`${fileName}.pdf`);
  };

  // Export as Word by creating a .doc file using plain text.
  const exportWord = () => {
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: "application/msword" });
    saveAs(blob, `${fileName}.doc`);
  };

  const handleExport = () => {
    switch (exportType) {
      case "csv":
        exportCSV();
        break;
      case "excel":
        exportExcel();
        break;
      case "pdf":
        exportPDF();
        break;
      case "word":
        exportWord();
        break;
      default:
        exportCSV();
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      <select
        value={exportType}
        onChange={(e) => setExportType(e.target.value)}
        className="p-2 border rounded w-full bg-white text-black dark:bg-gray-800 dark:text-white"
      >
        <option value="csv">CSV</option>
        <option value="excel">Excel</option>
        <option value="pdf">PDF</option>
        <option value="word">Word</option>
      </select>
      <button
        onClick={handleExport}
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Download Data
      </button>
    </div>
  );
};

export default DataExportOptions;
