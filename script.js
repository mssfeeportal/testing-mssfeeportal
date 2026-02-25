const BASE_URL = "https://script.google.com/macros/s/AKfycbxcNWMiwz0t37rOT-wq5512b-BhvH9aNLjgHz_0az64mU-nmtSxKDaCjCE2jtw7swTd/exec";

let groupMembers = [];

/* ================= PAYMENT DATA ================= */

const paymentData = {

  "College Fee": [
    "Tuition Fee",
    "Affiliation Fee",
    "Building Fee",
    "Semester Registration Fee",
    "College Reporting Fee",
    "CRT Fee",
    "College Bus Fee",
    "College Uniform",
    "Minor Degree Tuition Fee"
  ],

  "Exam Fee": [
    "Semester Exam Fee",
    "Annual Exam Fee",
    "CA/CMA/CS Exam Fee",
    "IPE Board Exam Fee",
    "NPTEL Exam Fee",
    "Minor Degree Exam Fee"
  ],

  "Miscellaneous Fees": [
    "CMM",
    "Original Degree",
    "Provisional Fee",
    "NCC Related",
    "Study Hall Fee",
    "Others"
  ],

  "Hostel and Mess Fee": [
    "Hostel Fee",
    "Mess Fee"
  ],

  "Technical Courses": [
    "C",
    "Java",
    "Full Stack",
    "Skill Enhancement Course",
    "DSA",
    "NPTEL",
    "TASK"
  ],

  "Personality Development Course": [
    "Yoga",
    "Mind Management Techniques",
    "Fear and Anxiety Course",
    "Other Development Sessions",
    "Spoken English Course"
  ],

  "Placement Related": [
    "Placement Fee",
    "Internship Fee",
    "Major Project Equipment",
    "Minor Project Equipment",
    "Industrial Visit",
    "IEEE",
    "CISCO",
    "SAE"
  ],

  "Records and Manuals": [
    "Lab Records",
    "Lab Manuals",
    "Major Project Reports",
    "Minor Project Reports"
  ],

  "Stationery": [
    "Pens",
    "Pencils",
    "Loose Sheets",
    "Scale"
  ],

  "Graduate Essentials": [
    "Aprons",
    "Drafters",
    "Calculators",
    "Drawing Instruments",
    "Scrubs",
    "Stethoscope",
    "Dissection Kit",
    "Knee Hammer",
    "Trunk Box",
    "Plank",
    "Chair",
    "Plate",
    "Glass",
    "Bag",
    "Bedsheet",
    "Cot",
    "Water Bottle",
    "Bucket",
    "Mug",
    "Lock",
    "Pillow"
  ],

  "Text Books": [
    "Text Books",
    "Reference Materials",
    "Note Books"
  ],

  "Graduate Entrance Registration": [
    "TS EAMCET Registration",
    "AP EAMCET Registration",
    "JEE Mains Registration",
    "JEE Advanced Registration",
    "NEET Registration",
    "CA/CMA/CS Registration",
    "DOST Registration Fee",
    "CSAB Fee"
  ],

  "Post-Graduate Entrance Registration": [
    "GATE Application Fee",
    "NEET PG Application Fee",
    "CUET Application Fee",
    "GPAT Application Fee"
  ],

  "Graduate Counselling": [
    "TS EAMCET Counselling",
    "AP EAMCET Counselling",
    "JoSAA Counselling",
    "MCC Counselling",
    "TS MBBS Counselling",
    "Ag BSc / BVSc Counselling",
    "BSc Nursing Counselling",
    "TS AYUSH Counselling",
    "DOST Counselling"
  ],

  "Post-Graduate Coaching": [
    "GATE Coaching",
    "NEET PG Coaching",
    "Study Material / Marrow"
  ]
};

/* ================= LOAD CATEGORIES ================= */

function loadCategories() {
  const category = document.getElementById("category");
  if (!category) return;

  category.innerHTML = `<option value="">Select Category</option>`;

  Object.keys(paymentData).forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = key;
    category.appendChild(opt);
  });
}

function loadSubCategories() {
  const categoryKey = document.getElementById("category").value;
  const subCategory = document.getElementById("subCategory");

  subCategory.innerHTML = `<option value="">Select Sub-Category</option>`;
  if (!categoryKey) return;

  paymentData[categoryKey].forEach(item => {
    const opt = document.createElement("option");
    opt.value = item;
    opt.textContent = item;
    subCategory.appendChild(opt);
  });
}

/* ================= HELPERS ================= */

function val(id) {
  return document.getElementById(id).value.trim();
}

/* ================= REQUEST TYPE ================= */
function handleRequestType() {

  const type = val("requestType");

  // Reset everything first
  document.getElementById("groupMembers").innerHTML = "";
  document.getElementById("groupCountBox").style.display = "none";
  document.getElementById("studentDetailsBox").style.display = "none";
  document.getElementById("mainStudentBox").style.display = "none";
  document.getElementById("individualAmountBox").style.display = "none";
  document.getElementById("paymentSection").style.display = "none";

  if (type === "Individual") {
    document.getElementById("studentDetailsBox").style.display = "block";
    document.getElementById("mainStudentBox").style.display = "block";
    document.getElementById("individualAmountBox").style.display = "block";
    document.getElementById("paymentSection").style.display = "block";
  }

  if (type === "Group") {
    document.getElementById("groupCountBox").style.display = "block";
  }
}

/* ================= GROUP ================= */
function createGroupInputs() {

  const count = parseInt(document.getElementById("groupCount").value);

  if (!count || count <= 0) {
    alert("Enter valid number of group members");
    return;
  }

  const box = document.getElementById("groupMembers");
  box.innerHTML = "";
  groupMembers = [];

  // Show the studentDetails container
  document.getElementById("studentDetailsBox").style.display = "block";

  // Hide main student section for group
  document.getElementById("mainStudentBox").style.display = "none";

  // Show payment section
  document.getElementById("paymentSection").style.display = "block";

  for (let i = 0; i < count; i++) {
    box.innerHTML += `
      <div class="memberBox">
        <h4>Group Member ${i + 1}</h4>
        <input id="gm_mssid_${i}" placeholder="MSS ID">
        <select id="gm_year_${i}">
  <option value="">Select Year</option>
  <option value="1">1st Year</option>
  <option value="2">2nd Year</option>
  <option value="3">3rd Year</option>
  <option value="4">4th Year</option>
    <option value="5">5th Year</option>
</select>
        <input id="gm_amount_${i}" type="number" placeholder="Amount">
        <button type="button" onclick="fetchGroupMember(${i})">Fetch</button>
        <input id="gm_name_${i}" placeholder="Name" disabled>
        <input id="gm_college_${i}" placeholder="College" disabled>
      </div>
    `;
  }
}
/* ================= FETCH MAIN STUDENT ================= */

function fetchMainStudent() {

  const mssid = val("mssid");

  if (!mssid) {
    alert("Enter MSS ID");
    return;
  }

  // SHOW LOADER
  document.getElementById("overlayLoader").style.display = "flex";

  fetch(`${BASE_URL}?mssid=${encodeURIComponent(mssid)}`)
    .then(res => res.json())
    .then(data => {

      if (!data.name) {
        alert("Student not found");
        return;
      }

      document.getElementById("name").value = data.name;
      document.getElementById("college").value = data.college;
    })
    .catch(err => {
      console.log("Fetch error:", err);
      alert("Error fetching student details");
    })
    .finally(() => {
      document.getElementById("overlayLoader").style.display = "none";
    });
}

/* ================= FETCH GROUP MEMBER ================= */

function fetchGroupMember(i) {

  const mssid = document.getElementById(`gm_mssid_${i}`).value.trim();

  if (!mssid) {
    alert("Enter MSS ID");
    return;
  }

  // SHOW LOADER
  document.getElementById("overlayLoader").style.display = "flex";

  fetch(`${BASE_URL}?mssid=${encodeURIComponent(mssid)}`)
    .then(res => res.json())
    .then(data => {

      if (!data.name) {
        alert("Student not found");
        return;
      }

      document.getElementById(`gm_name_${i}`).value = data.name;
      document.getElementById(`gm_college_${i}`).value = data.college;

      groupMembers[i] = {
        mssid: mssid,
        year: document.getElementById(`gm_year_${i}`).value.trim(),
        amount: document.getElementById(`gm_amount_${i}`).value.trim(),
        name: data.name,
        college: data.college
      };

    })
    .catch(err => {
      console.log("Fetch error:", err);
      alert("Error fetching student details");
    })
    .finally(() => {
      document.getElementById("overlayLoader").style.display = "none";
    });
}
/* ================= SUBMIT REQUEST ================= */
/* ================= SUBMIT REQUEST ================= */

function submitRequest() {

  const type = val("requestType");

  if (!type) {
    alert("Select Request Type");
    return;
  }

  // ================= INDIVIDUAL VALIDATION =================
  if (type === "Individual") {

    if (!val("mssid") ||
        !val("year") ||
        !document.getElementById("name").value ||
        !document.getElementById("college").value ||
        !val("amount")) {

      alert("Fill all student details");
      return;
    }
  }

  // ================= GROUP VALIDATION =================
  if (type === "Group") {

    const count = parseInt(document.getElementById("groupCount").value);

    if (!count || count <= 0) {
      alert("Enter group member count");
      return;
    }

    for (let i = 0; i < count; i++) {

      if (!document.getElementById(`gm_mssid_${i}`).value.trim() ||
          !document.getElementById(`gm_year_${i}`).value.trim() ||
          !document.getElementById(`gm_amount_${i}`).value.trim() ||
          !document.getElementById(`gm_name_${i}`).value.trim() ||
          !document.getElementById(`gm_college_${i}`).value.trim()) {

        alert(`Fill all details for Group Member ${i + 1}`);
        return;
      }
    }
  }

  // ================= PAYMENT VALIDATION =================
  if (!val("category") ||
      !val("subCategory") ||
      !val("paymentMode") ||
      !val("details") ||
      !val("dueDate") ||
      !val("attachment")) {

    alert("Fill all payment details");
    return;
  }

  // ================= LOADING =================
  document.getElementById("submitBtn").disabled = true;
 document.getElementById("overlayLoader").style.display = "flex";

  const payload = new URLSearchParams({
    requestType: val("requestType"),
    category: val("category"),
    subCategory: val("subCategory"),
    paymentMode: val("paymentMode"),
    details: val("details"),
    dueDate: val("dueDate"),
    mssid: val("mssid"),
    name: document.getElementById("name").value,
    college: document.getElementById("college").value,
    year: val("year"),
    amount: val("amount"),
    attachmentLink: val("attachment"),
    groupMembers: JSON.stringify(groupMembers)
  });

  fetch(BASE_URL, { method: "POST", body: payload })
    .then(res => res.text())
    .then(id => {
      alert("Request Submitted\nID: " + id);
      window.location.reload();
    })
    .catch(err => {
      console.log("Submit error:", err);
      alert("Error submitting request");
    })
    .finally(() => {
      document.getElementById("submitBtn").disabled = false;
   document.getElementById("overlayLoader").style.display = "none";
    });
}
