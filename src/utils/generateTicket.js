import jsPDF from "jspdf";

export const generateTicket = (booking) => {
  console.log("🎟️ Generating Ticket with MATCHED data:", booking);

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [200, 90],
  });

  // --- 1. DATA MAPPING (The Fix) ---
  // We define "sources" to look in both the root and the 'raw' nest
  const raw = booking.raw || {};
  const userDetails = booking.userDetails || raw.userDetails || {};

  // NAME: Look in the mapped userDetails object
  const name = userDetails.fullName || booking.name || "Guest Explorer";

  // TITLE: Root title ("The Hill Station") OR raw.tripTitle
  const title =
    booking.title || raw.tripTitle || booking.tripTitle || "Unknown Mission";

  // DATE: Root date ("2026-02-25") OR raw.tripDate
  const dateStr = booking.date || raw.tripDate || booking.bookingDate || "TBA";

  // SEATS: Root seats (1) OR raw.seats
  const seats = booking.seats || raw.seats || "1";

  // PRICE: Root price (10000) OR raw.totalPrice
  const rawPrice = booking.price || raw.totalPrice || booking.totalAmount || 0;
  const priceDisplay = `INR ${Number(rawPrice).toLocaleString()}`;

  // PHONE: userDetails.phone ("9679812235")
  const phone = userDetails.phone || booking.phone || "N/A";

  // PAYMENT METHOD: userDetails.paymentMethod ("pay_on_arrival")
  const methodRaw =
    userDetails.paymentMethod ||
    raw.paymentMethod ||
    booking.paymentMethod ||
    "OFFLINE";
  const methodDisplay = methodRaw.replace(/_/g, " ").toUpperCase(); // Turns "pay_on_arrival" -> "PAY ON ARRIVAL"

  // ID: Root id ("uH74...") OR raw.id
  // We use the Document ID because "pay_on_arrival" usually doesn't have a paymentId
  const idRaw = booking.id || raw.id || "REF000";
  const idDisplay = idRaw.slice(-8).toUpperCase();

  // STATUS
  const statusRaw = booking.status || raw.status || "CONFIRMED";
  const statusDisplay = statusRaw.toUpperCase();

  // --- 2. PDF DESIGN (High-Tech Dark Theme) ---

  // Background
  doc.setFillColor(20, 20, 20); // Dark Grey
  doc.rect(0, 0, 200, 90, "F");

  // Accent Stripe (Orange)
  doc.setFillColor(234, 88, 12);
  doc.rect(0, 0, 12, 90, "F");

  // Status Badge
  const statusColor =
    statusDisplay === "CONFIRMED" ? [34, 197, 94] : [234, 179, 8];
  doc.setFillColor(...statusColor);
  doc.roundedRect(165, 10, 25, 6, 1, 1, "F");

  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(statusDisplay, 177.5, 14, { align: "center" });

  // Header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("DD TOURS & TRAVELS", 25, 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("OFFICIAL EXPEDITION PASS", 25, 20);

  // Layout Grid
  const col1 = 25;
  const col2 = 85;
  const row1 = 35;
  const row2 = 55;
  const row3 = 75;

  // -- COLUMN 1 --
  // Name
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("EXPLORER IDENTITY", col1, row1);
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(String(name).substring(0, 25), col1, row1 + 5);

  // Date
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("LAUNCH DATE", col1, row2);
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(String(dateStr), col1, row2 + 5);

  // Phone
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("CONTACT FREQUENCY", col1, row3);
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text(String(phone), col1, row3 + 5);

  // -- COLUMN 2 --
  // Title
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("ASSIGNED MISSION", col2, row1);
  doc.setFontSize(11);
  doc.setTextColor(234, 88, 12); // Orange text
  doc.text(String(title).substring(0, 25), col2, row1 + 5);

  // Seats
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("CREW COUNT", col2, row2);
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`${seats} Person(s)`, col2, row2 + 5);

  // Price
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("TOTAL ESTIMATE", col2, row3);
  doc.setFontSize(11);
  doc.setTextColor(34, 197, 94); // Green text
  doc.text(priceDisplay, col2, row3 + 5);

  // -- STUB (Right Side) --
  doc.setDrawColor(60, 60, 60);
  doc.setLineDash([1, 1], 0);
  doc.line(145, 5, 145, 85);

  const stubX = 155;

  // Ref ID
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text("BOOKING REF", stubX, 35);
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(idDisplay, stubX, 40);

  // Payment Method
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text("PAYMENT MODE", stubX, 50);
  doc.setFontSize(8); // Slightly smaller to fit "PAY ON ARRIVAL"
  doc.setTextColor(255, 255, 255);
  doc.text(methodDisplay, stubX, 55);

  // Scan Code
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text("SCAN FOR ENTRY", stubX, 65);
  doc.setFillColor(255, 255, 255);
  doc.rect(stubX, 68, 15, 15, "F");

  doc.save(`Mission-Pass-${idDisplay}.pdf`);
};
