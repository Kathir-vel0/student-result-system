import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function header(doc, title, subtitle) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, w, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(title, w / 2, 12, { align: "center" });
  if (subtitle) {
    doc.setFontSize(9);
    doc.text(subtitle, w / 2, 20, { align: "center" });
  }
  doc.setTextColor(30, 30, 30);
}

export function downloadExamTimetablePdf(entries, examName) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  header(doc, "Exam Timetable", examName || "All Exams");

  const rows = (entries || []).map((e) => [
    e.examDate || "—",
    e.startTime || "—",
    e.endTime || "—",
    e.examName || "",
    e.subjectName || "",
    e.className || "",
    e.section || "",
    e.roomNumber || "—",
    e.teacherName || "—",
  ]);

  autoTable(doc, {
    startY: 34,
    head: [["Date", "Start", "End", "Exam", "Subject", "Class", "Section", "Room", "Teacher"]],
    body: rows.length ? rows : [["—", "No schedule", "—", "—", "—", "—", "—", "—", "—"]],
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    styles: { fontSize: 8 },
  });

  doc.save(`ExamTimetable_${examName || "all"}.pdf`);
}

export function downloadHallTicketPdf(student, exam, timetableEntries) {
  const doc = new jsPDF();
  header(doc, "Hall Ticket", exam?.examName || "Examination");

  let y = 38;
  doc.setFontSize(11);
  doc.text(`Student: ${student?.name || "N/A"}`, 14, y);
  y += 7;
  doc.text(`Student ID: ${student?.studentId || "N/A"}`, 14, y);
  y += 7;
  doc.text(`Class: ${student?.className || "—"}  Section: ${student?.section || "—"}`, 14, y);
  y += 7;
  doc.text(`Exam: ${exam?.examName || "—"}  |  Type: ${exam?.examType || "—"}`, 14, y);
  y += 10;

  const rows = (timetableEntries || []).map((e) => [
    e.examDate || "—",
    e.startTime || "—",
    e.subjectName || "",
    e.roomNumber || "—",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Date", "Time", "Subject", "Room"]],
    body: rows.length ? rows : [["—", "—", "No subjects scheduled", "—"]],
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
  });

  doc.setFontSize(9);
  const fy = doc.lastAutoTable?.finalY || y + 40;
  doc.text("Student Signature: ___________________", 14, fy + 15);
  doc.text("Invigilator: ___________________", 110, fy + 15);
  doc.save(`HallTicket_${student?.studentId || "student"}.pdf`);
}

export function downloadExamReportCardPdf(summary) {
  const doc = new jsPDF();
  header(doc, "Exam Report Card", summary?.examName || "");

  let y = 38;
  doc.setFontSize(11);
  doc.text(`Percentage: ${summary?.percentage ?? 0}%  |  Grade: ${summary?.grade || "—"}  |  GPA: ${summary?.gpa ?? "—"}`, 14, y);
  y += 10;

  const rows = (summary?.subjects || []).map((s) => [
    s.subjectCode || "",
    s.subjectName || "",
    String(s.marksObtained ?? ""),
    String(s.maxMarks ?? ""),
    s.grade || "",
    s.remarks || "",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Code", "Subject", "Marks", "Max", "Grade", "Remarks"]],
    body: rows.length ? rows : [["—", "No results", "—", "—", "—", "—"]],
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
  });

  doc.save(`ExamReport_${summary?.examName || "exam"}.pdf`);
}

export function downloadClassReportPdf(examName, rows) {
  const doc = new jsPDF({ orientation: "landscape" });
  header(doc, "Consolidated Class Report", examName || "");

  autoTable(doc, {
    startY: 34,
    head: [["Student ID", "Name", "Total", "Max", "Percentage", "Grade"]],
    body: (rows || []).map((r) => [
      r.studentId,
      r.name,
      String(r.totalMarks ?? ""),
      String(r.maxMarks ?? ""),
      `${r.percentage ?? 0}%`,
      r.grade || "",
    ]),
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    styles: { fontSize: 8 },
  });

  doc.save(`ClassReport_${examName || "exam"}.pdf`);
}
