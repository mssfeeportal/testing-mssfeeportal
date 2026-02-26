/*************************************************
 MEDHA FINANCIAL SYSTEM – FINAL CLEAN BACKEND
*************************************************/

/***********************
 CONFIGURATION
************************/
const ADMIN_EMAIL = "mssc1@medhatrust.org";
const STUDENT_SHEET_ID = "152IsL4_2lLLn4qHGkMLy2LxkJ27c3FzLZlOocOW-DTM";
const REQUEST_SHEET_ID = "18TJg7T4Stf8FWWfhNyOfNJztDsLy20jSVNR-SgliOIk";
const STUDENT_SHEET_NAME = "Student_DB";
const REQUEST_SHEET_NAME = "Requests_DB";

/***********************
 JSON HELPER
************************/
function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/***********************
 DO GET
************************/
function doGet(e) {

  if (!e || !e.parameter) {
    return jsonResponse({ error: "Invalid request" });
  }

  // 🔹 FETCH STUDENT DETAILS
  if (e.parameter.mssid) {

    const sh = SpreadsheetApp
      .openById(STUDENT_SHEET_ID)
      .getSheetByName(STUDENT_SHEET_NAME);

    const data = sh.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(e.parameter.mssid).trim()) {
        return jsonResponse({
          name: data[i][1],
          college: data[i][2]
        });
      }
    }

    return jsonResponse({ error: "Student not found" });
  }

  // 🔹 ADMIN STATS
  if (e.parameter.adminStats) {

    const sh = SpreadsheetApp
      .openById(REQUEST_SHEET_ID)
      .getSheetByName(REQUEST_SHEET_NAME);

    const data = sh.getDataRange().getValues();

    let pending = 0;
    let completed = 0;

    for (let i = 1; i < data.length; i++) {
      const status = String(data[i][14] || "").trim();
      if (status === "Pending") pending++;
      if (status === "Completed") completed++;
    }

    return jsonResponse({
      pending,
      completed,
      total: pending + completed
    });
  }

  return jsonResponse({ error: "Invalid request" });
}

/***********************
 DO POST
************************/
function doPost(e) {

  if (!e || !e.parameter) {
    return ContentService.createTextOutput("ERROR: Missing parameters");
  }

  const sh = SpreadsheetApp
    .openById(REQUEST_SHEET_ID)
    .getSheetByName(REQUEST_SHEET_NAME);

  const reqId = generateRequestId();
  const now = new Date();

  const requestType = e.parameter.requestType;
  const mainAmount = e.parameter.amount;

  // 🔹 STORE MAIN REQUEST (Individual or Requesting Student)
  // ================= INDIVIDUAL =================
if (e.parameter.requestType === "Individual") {

  sh.appendRow([
    reqId,
    now,
    e.parameter.mssid,
    e.parameter.name,
    e.parameter.year,
    e.parameter.college,
    "Individual",
    e.parameter.amount,
    e.parameter.category,
    e.parameter.subCategory,
    e.parameter.paymentMode,
    e.parameter.details,
    e.parameter.dueDate,
    e.parameter.attachmentLink || "",
    "Pending"
  ]);
}

  // 🔹 GROUP MEMBERS
  let members = [];

  if (requestType === "Group") {

    try {
      members = JSON.parse(e.parameter.groupMembers || "[]");
    } catch (err) {
      members = [];
    }

    members.forEach(m => {
      sh.appendRow([
        reqId,
        now,
        m.mssid,
        m.name,
        m.year,
        m.college,
        "Group",
        m.amount || "",  // ✅ separate amount
        e.parameter.category,
        e.parameter.subCategory,
        e.parameter.paymentMode,
        e.parameter.details,
        e.parameter.dueDate,
        e.parameter.attachmentLink || "",
        "Pending"
      ]);
    });
  }

  // 🔹 EMAIL
  sendAdminNotification({
    reqId,
    name: e.parameter.name,
    mssid: e.parameter.mssid,
    college: e.parameter.college,
    year: e.parameter.year,
    requestType,
    amount: mainAmount,
    category: e.parameter.category,
    subCategory: e.parameter.subCategory,
    paymentMode: e.parameter.paymentMode,
    dueDate: e.parameter.dueDate,
    details: e.parameter.details,
    groupMembers: members
  });

  return ContentService.createTextOutput(reqId);
}

/***********************
 GENERATE REQUEST ID
************************/
function generateRequestId() {

  const sh = SpreadsheetApp
    .openById(REQUEST_SHEET_ID)
    .getSheetByName(REQUEST_SHEET_NAME);

  const month = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyyMMM"
  );

  const ids = sh.getRange(2, 1, sh.getLastRow()).getValues();
  const count = ids
    .filter(r => r[0] && String(r[0]).includes(month))
    .length + 1;

  return `MSS-${month}-${String(count).padStart(2, "0")}`;
}

/***********************
 EMAIL NOTIFICATION
************************/
function sendAdminNotification(d) {

  try {

    const isIndividual = d.requestType === "Individual";

    const studentSection = isIndividual ? `
        <p><b>Name:</b> ${d.name}</p>
        <p><b>MSS ID:</b> ${d.mssid}</p>
        <p><b>College:</b> ${d.college}</p>
        <p><b>Year:</b> ${d.year}</p>
        <p><b>Amount:</b> ₹${d.amount}</p>
    ` : "";

    const groupSection = (!isIndividual && d.groupMembers.length)
      ? `
        <p><b>Group Members:</b></p>
        <ul>
          ${d.groupMembers.map(m =>
            `<li>${m.name} (${m.mssid}) - ₹${m.amount}</li>`
          ).join("")}
        </ul>
      `
      : "";

    const html = `
      <div style="font-family: Arial;">
        <h2>📋 New Student Request</h2>
        <p><b>Request ID:</b> ${d.reqId}</p>

        ${studentSection}

        <p><b>Category:</b> ${d.category}</p>
        <p><b>Sub-Category:</b> ${d.subCategory}</p>
        <p><b>Due Date:</b> ${d.dueDate}</p>
        ${d.details ? `<p><b>Details:</b> ${d.details}</p>` : ""}

        ${groupSection}
      </div>
    `;

    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: `🔔 New Request ${d.reqId}`,
      htmlBody: html
    });

  } catch (err) {
    Logger.log("Email error: " + err);
  }
}

/***********************
 AUTHORIZE EMAIL (RUN ONCE)
************************/
function authorizeEmailPermissions() {
  MailApp.sendEmail(
    ADMIN_EMAIL,
    "Authorization Successful",
    "Email permissions granted."
  );
}
