import jsPDF from "jspdf";

export const generateTicket = (booking) => {
  // 🔍 DEBUG: Check the Console to see what data we actually have!
  console.log("🎟️ Generating Ticket with Data:", booking);

  // --- 1. SMART DATA EXTRACTION (Checks multiple field names) ---
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [200, 90], // Ticket shape
  });

  // Try to find the Name
  const name =
    booking.userDetails?.fullName ||
    booking.name ||
    booking.userName ||
    booking.userEmail ||
    "Guest Explorer";

  // Try to find the Trip Title
  const title =
    booking.tripTitle ||
    booking.title ||
    booking.trip?.title ||
    "Unknown Mission";

  // Try to find the Date
  const rawDate = booking.bookingDate || booking.date || booking.startDate;
  const date = rawDate ? new Date(rawDate).toLocaleDateString() : "TBA";

  // Try to find the Seats
  const seats = booking.seats || booking.guests || booking.passengers || "1";

  // Try to find the ID
  const id = (booking.id || booking.paymentId || "000000")
    .slice(-6)
    .toUpperCase();

  // --- 2. DRAWING THE TICKET ---

  // Background (Dark)
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, 200, 90, "F");

  // Orange Stripe (Left)
  doc.setFillColor(234, 88, 12);
  doc.rect(0, 0, 10, 90, "F");

  // Header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("DD TOURS & TRAVELS", 20, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("OFFICIAL EXPEDITION PASS", 20, 22);

  const startY = 40;

  // Row 1: Name
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("EXPLORER NAME", 20, startY);

  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255); // White
  doc.text(name, 20, startY + 6);

  // Row 1: Mission
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("MISSION / TRIP", 80, startY);

  doc.setFontSize(12);
  doc.setTextColor(234, 88, 12); // Orange
  doc.text(title, 80, startY + 6);

  // Row 2: Date
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("LAUNCH DATE", 20, startY + 20);

  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(date, 20, startY + 26);

  // Row 2: Crew
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("CREW MEMBERS", 80, startY + 20);

  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`${seats} Person(s)`, 80, startY + 26);

  // --- RIGHT SIDE ---
  // Dashed Line
  doc.setDrawColor(60, 60, 60);
  doc.setLineDash([2, 2], 0);
  doc.line(150, 5, 150, 85);

  // Ref ID
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("REF ID", 160, 20);

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`#${id}`, 160, 28);

  // Fake QR Box
  doc.setFillColor(255, 255, 255);
  doc.rect(160, 45, 25, 25, "F");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("SCAN", 166, 60);

  // Save
  doc.save(`Mission-Pass-${id}.pdf`);
};
