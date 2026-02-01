import jsPDF from "jspdf";

export const generateTicket = (booking) => {
  // 🔍 DEBUG: Look at the console when you click "Download"
  console.log("🎟️ Generating Ticket for:", booking);

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [200, 90],
  });

  // --- 1. ROBUST DATA FETCHING ---

  // NAME: Check userDetails first, then top-level name, then email
  const name =
    booking.userDetails?.fullName ||
    booking.name ||
    booking.userEmail ||
    booking.email ||
    "Guest Explorer";

  // TITLE: Check tripTitle, then generic title
  const title = booking.tripTitle || booking.title || "Mission: Unknown";

  // DATE: Check bookingDate, then date, then createdAt, then Today
  let rawDate = booking.bookingDate || booking.date || booking.createdAt;
  // If it's a Firestore Timestamp (has .seconds), convert it
  if (rawDate && rawDate.seconds) {
    rawDate = new Date(rawDate.seconds * 1000);
  }
  const dateStr = rawDate
    ? new Date(rawDate).toLocaleDateString()
    : new Date().toLocaleDateString();

  // AMOUNT: Check totalAmount, amountPaid, or amount
  const rawAmount =
    booking.totalAmount || booking.amountPaid || booking.amount || 0;
  const amountStr = `INR ${Number(rawAmount).toLocaleString()}`;

  // CONTACT: Check phone inside userDetails, or top-level phone
  const phone = booking.userDetails?.phone || booking.phone || "N/A";

  // ID: Use Payment ID or Doc ID
  const idRaw = booking.paymentId || booking.id || "OFFLINE";
  const idDisplay = idRaw.slice(-8).toUpperCase();

  // --- 2. DESIGN (Dark Theme) ---

  // Background
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, 200, 90, "F");

  // Orange Stripe
  doc.setFillColor(234, 88, 12);
  doc.rect(0, 0, 12, 90, "F");

  // Status Pill (Top Right)
  const statusText = (booking.status || "CONFIRMED").toUpperCase();
  const statusColor =
    statusText === "CONFIRMED" ? [34, 197, 94] : [234, 179, 8]; // Green or Yellow

  doc.setFillColor(...statusColor);
  doc.roundedRect(165, 10, 25, 6, 1, 1, "F");
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(statusText, 177.5, 14, { align: "center" });

  // Header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("DD TOURS & TRAVELS", 25, 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("OFFICIAL EXPEDITION PASS", 25, 20);

  // --- GRID LAYOUT ---
  const col1 = 25;
  const col2 = 85;
  const row1 = 35;
  const row2 = 55;
  const row3 = 75;

  // -- COL 1 --
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("EXPLORER IDENTITY", col1, row1);
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(String(name).substring(0, 25), col1, row1 + 5);

  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("LAUNCH DATE", col1, row2);
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(dateStr, col1, row2 + 5);

  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("CONTACT FREQUENCY", col1, row3);
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text(String(phone), col1, row3 + 5);

  // -- COL 2 --
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("ASSIGNED MISSION", col2, row1);
  doc.setFontSize(11);
  doc.setTextColor(234, 88, 12);
  doc.text(String(title).substring(0, 25), col2, row1 + 5);

  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("CREW COUNT", col2, row2);
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  const seats = booking.seats || booking.passengers || "1";
  doc.text(`${seats} Person(s)`, col2, row2 + 5);

  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("TOTAL PAID", col2, row3);
  doc.setFontSize(11);
  doc.setTextColor(34, 197, 94);
  doc.text(amountStr, col2, row3 + 5);

  // --- STUB (Right Side) ---
  doc.setDrawColor(60, 60, 60);
  doc.setLineDash([1, 1], 0);
  doc.line(145, 5, 145, 85);

  const stubX = 155;
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text("TRANSACTION ID", stubX, 35);
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(idDisplay, stubX, 40);

  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text("PAYMENT METHOD", stubX, 50);
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text((booking.paymentMethod || "ONLINE").toUpperCase(), stubX, 55);

  // Fake QR
  doc.setFillColor(255, 255, 255);
  doc.rect(stubX, 62, 20, 20, "F");
  doc.setFontSize(6);
  doc.setTextColor(0, 0, 0);
  doc.text("SCAN FOR ENTRY", stubX + 2, 85);

  doc.save(`Mission-Pass-${idDisplay}.pdf`);
};
