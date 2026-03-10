const ADMIN_PASSWORD = "medha@admin";
const BASE_URL = "https://script.google.com/macros/s/AKfycbyYeI2YKrbd1fjS5w4U7-oTHEP6wbF3rOD9I_OOEc_8haJ5bxGzGWExiZcjPEC84UzXKw/exec";

const REQUEST_SHEET_ID = "1A9GvsStTFvU-I7aavQYBjPmT77Gah32cVyqw_uAkTA8";
const STUDENT_MASTER_SHEET_ID = "1D2odNEPFjpE3LO3-ccQuU6MqLgneAfRSFeml0DPClks";

let isAuthenticated = false;

function adminLogin() {
  const pass = document.getElementById("adminPassword").value.trim();

  if (!pass) {
    alert("Enter password");
    return;
  }

  if (pass === ADMIN_PASSWORD) {
    isAuthenticated = true;
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadDashboard();
  } else {
    alert("❌ Invalid password");
    document.getElementById("adminPassword").value = "";
  }
}

function loadDashboard() {
  fetch(`${BASE_URL}?adminStats=true`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("pendingCount").innerText = data.pending ?? 0;
      document.getElementById("completedCount").innerText = data.completed ?? 0;
      document.getElementById("totalCount").innerText = data.total ?? 0;
    })
    .catch(() => {
      document.getElementById("pendingCount").innerText = 0;
      document.getElementById("completedCount").innerText = 0;
      document.getElementById("totalCount").innerText = 0;
    });
}

function logoutAdmin() {
  isAuthenticated = false;
  window.location.href = "index.html";
}

function downloadStudentMaster() {
  if (!isAuthenticated) return alert("Login first");

  window.open(
    `https://docs.google.com/spreadsheets/d/${STUDENT_MASTER_SHEET_ID}/export?format=xlsx`
  );
}

function downloadAllRequests() {
  if (!isAuthenticated) return alert("Login first");

  window.open(
    `https://docs.google.com/spreadsheets/d/${REQUEST_SHEET_ID}/export?format=xlsx`
  );
}

function downloadRequestsWithDateFilter() {
  if (!isAuthenticated) return alert("Login first");

  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  if (!start || !end) {
    alert("Select both dates");
    return;
  }

  if (new Date(start) > new Date(end)) {
    alert("Invalid date range");
    return;
  }

  alert(
`Google Sheets does not support auto filtered downloads.
The sheet will now open.

Apply filter on Timestamp column:
Between ${start} and ${end}
Then download as Excel.`
  );

  window.open(
    `https://docs.google.com/spreadsheets/d/${REQUEST_SHEET_ID}/edit`
  );
}
