import jsPDF from "jspdf";

export const generateTicket = (booking) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [200, 90], // Ticket shape (Long & Short)
  });

  // --- BACKGROUND & STYLE ---
  // Dark Background
  doc.setFillColor(20, 20, 20); // Hex #141414
  doc.rect(0, 0, 200, 90, "F");

  // Orange Accent Bar (Left)
  doc.setFillColor(234, 88, 12); // Primary Orange
  doc.rect(0, 0, 10, 90, "F");

  // --- HEADER ---
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("DD TOURS & TRAVELS", 20, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("OFFICIAL EXPEDITION PASS", 20, 22);

  // --- MISSION DETAILS (Left Side) ---
  const startY = 40;

  // Label: Explorer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("EXPLORER NAME", 20, startY);
  // Value
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(
    booking.userDetails?.fullName || booking.userEmail || "Guest",
    20,
    startY + 6,
  );

  // Label: Mission
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("MISSION / TRIP", 80, startY);
  // Value
  doc.setFontSize(12);
  doc.setTextColor(234, 88, 12); // Orange Text
  doc.text(booking.tripTitle || "Unknown Mission", 80, startY + 6);

  // Label: Date
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("LAUNCH DATE", 20, startY + 20);
  // Value
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(booking.bookingDate || "TBA", 20, startY + 26);

  // Label: Crew Size
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("CREW MEMBERS", 80, startY + 20);
  // Value
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`${booking.seats} Person(s)`, 80, startY + 26);

  // --- RIGHT SIDE (Stub) ---
  // Dashed Line Separator
  doc.setDrawColor(60, 60, 60);
  doc.setLineDash([2, 2], 0);
  doc.line(150, 5, 150, 85);

  // Booking Ref (Rotated or Big)
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("REF ID", 160, 20);

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  const shortId = (booking.id || "000").slice(-6).toUpperCase();
  doc.text(`#${shortId}`, 160, 28);

  // Fake QR Code Box
  doc.setFillColor(255, 255, 255);
  doc.rect(160, 45, 25, 25, "F");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("SCAN", 166, 60);

  // Save File
  doc.save(`Mission-Pass-${shortId}.pdf`);
};
