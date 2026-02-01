import jsPDF from "jspdf";

export const generateTicket = (booking) => {
  console.log("🎟️ Generating Enhanced Ticket:", booking);

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [200, 90], // Standard Ticket Size
  });

  // --- DATA PREP ---
  const name =
    booking.userDetails?.fullName || booking.name || "Guest Explorer";
  const title = booking.tripTitle || booking.title || "Unknown Mission";
  const date = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString()
    : "TBA";
  const seats = booking.seats || "1";
  const amount = booking.totalAmount || booking.amountPaid || "0";
  const payId = (booking.paymentId || booking.id || "CASH")
    .slice(-8)
    .toUpperCase();
  const phone = booking.userDetails?.phone || "N/A";

  // Status Color Logic
  const status = (booking.status || "CONFIRMED").toUpperCase();

  // --- VISUAL DESIGN ---

  // 1. Dark Background
  doc.setFillColor(20, 20, 20); // Hex #141414
  doc.rect(0, 0, 200, 90, "F");

  // 2. Orange Brand Stripe (Left)
  doc.setFillColor(234, 88, 12);
  doc.rect(0, 0, 12, 90, "F");

  // 3. Status Badge (Top Right)
  doc.setFillColor(34, 197, 94); // Green for Confirmed
  doc.roundedRect(165, 10, 25, 6, 1, 1, "F");
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(status, 177.5, 14, { align: "center" });

  // --- HEADER SECTION ---
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("DD TOURS & TRAVELS", 25, 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("OFFICIAL EXPEDITION PASS", 25, 20);

  // --- MAIN CONTENT GRID ---
  const row1 = 35;
  const row2 = 55;
  const row3 = 75;

  // -- COLUMN 1 --
  // Name
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("EXPLORER IDENTITY", 25, row1);
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(name, 25, row1 + 5);

  // Date
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("LAUNCH DATE", 25, row2);
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(date, 25, row2 + 5);

  // Contact
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("CONTACT FREQUENCY", 25, row3);
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text(phone, 25, row3 + 5);

  // -- COLUMN 2 --
  // Mission Title
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("ASSIGNED MISSION", 80, row1);
  doc.setFontSize(11);
  doc.setTextColor(234, 88, 12); // Orange Accent
  doc.text(title.substring(0, 25), 80, row1 + 5); // Limit length

  // Crew Size
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("CREW COUNT", 80, row2);
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`${seats} Person(s)`, 80, row2 + 5);

  // Total Paid
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text("TOTAL PAID", 80, row3);
  doc.setFontSize(11);
  doc.setTextColor(34, 197, 94); // Green Money Color
  doc.text(`INR ${Number(amount).toLocaleString()}`, 80, row3 + 5);

  // --- RIGHT STUB (Receipt Info) ---
  // Dashed Separator
  doc.setDrawColor(60, 60, 60);
  doc.setLineDash([1, 1], 0);
  doc.line(145, 5, 145, 85);

  // Stub Content
  const stubX = 155;

  // Transaction ID
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text("TRANSACTION ID", stubX, 30);
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(payId, stubX, 35);

  // Payment Method
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text("PAYMENT VIA", stubX, 45);
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text((booking.paymentMethod || "ONLINE").toUpperCase(), stubX, 50);

  // Scan Text
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text("SCAN FOR ENTRY", stubX, 60);

  // White Box for QR Code (Simulated)
  doc.setFillColor(255, 255, 255);
  doc.rect(stubX, 63, 20, 20, "F");

  // Save
  doc.save(`Mission-Pass-${payId}.pdf`);
};
