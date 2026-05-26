import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function generateReportCardPdf(data) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("ResultSys — Student Report Card", pageWidth / 2, 14, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Generated: ${data.generatedAt || new Date().toISOString().slice(0, 10)}`, pageWidth / 2, 22, {
    align: "center",
  });

  doc.setTextColor(30, 30, 30);
  let y = 38;
  doc.setFontSize(12);
  doc.text(`Name: ${data.name || "N/A"}`, 14, y);
  y += 7;
  doc.text(`Student ID: ${data.studentId || "N/A"}`, 14, y);
  y += 7;
  doc.text(`Class: ${data.className || "N/A"}  |  Section: ${data.section || "N/A"}`, 14, y);
  y += 7;
  doc.text(
    `Percentage: ${data.percentage ?? 0}%  |  Grade: ${data.grade || "N/A"}  |  Rank: ${data.rank ?? "N/A"}`,
    14,
    y
  );
  y += 7;
  doc.text(`Attendance: ${data.attendancePercentage ?? 0}%`, 14, y);
  y += 10;

  const rows = (data.subjects || []).map((s) => [
    s.subjectCode || "",
    s.subjectName || "",
    String(s.marks ?? ""),
    s.grade || "",
    s.comments || "",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Code", "Subject", "Marks", "Grade", "Remarks"]],
    body: rows.length ? rows : [["—", "No subjects recorded", "—", "—", "—"]],
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });

  const finalY = doc.lastAutoTable?.finalY || y + 40;
  doc.setFontSize(10);
  doc.text(`Total Marks: ${data.totalMarks ?? 0} / ${data.maxMarks ?? 0}`, 14, finalY + 10);
  doc.text(`Teacher Remarks: ${data.remarks || "—"}`, 14, finalY + 18);

  doc.setFontSize(9);
  doc.text("Class Teacher Signature: _______________________", 14, finalY + 32);
  doc.text("Principal Signature: _______________________", 110, finalY + 32);

  doc.save(`ReportCard_${data.studentId || "student"}.pdf`);
}
