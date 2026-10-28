const STORAGE_KEY = "leaveflow_requests";

const defaultRequests = [
  {
    id: 1,
    employee: "Jia Lin",
    type: "Annual Leave",
    department: "Engineering",
    manager: "Rina Tan",
    startDate: "2026-11-04",
    endDate: "2026-11-08",
    reason: "Family trip",
    status: "Approved",
    submittedAt: "2026-10-20"
  },
  {
    id: 2,
    employee: "Aaron Koh",
    type: "Sick Leave",
    department: "Operations",
    manager: "Daniel Lee",
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    reason: "Medical appointment",
    status: "Pending",
    submittedAt: "2026-10-23"
  },
  {
    id: 3,
    employee: "Aisha Lim",
    type: "Personal Leave",
    department: "Marketing",
    manager: "Priya Nair",
    startDate: "2026-11-15",
    endDate: "2026-11-16",
    reason: "Personal matters",
    status: "Rejected",
    submittedAt: "2026-10-25"
  }
];

const form = document.getElementById("leaveForm");
const requestTableBody = document.getElementById("requestTableBody");
const approvalQueue = document.getElementById("approvalQueue");
const calculatedDaysEl = document.getElementById("calculatedDays");
const balanceCheckEl = document.getElementById("balanceCheck");

const elements = {
  employeeName: document.getElementById("employeeName"),
  department: document.getElementById("department"),
  leaveType: document.getElementById("leaveType"),
  manager: document.getElementById("manager"),
  startDate: document.getElementById("startDate"),
  endDate: document.getElementById("endDate"),
  reason: document.getElementById("reason")
};

function getStoredRequests() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultRequests;
  } catch {
    return defaultRequests;
  }
}

function saveRequests(requests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function getBusinessDays(startDateString, endDateString) {
  if (!startDateString || !endDateString) return 0;

  const start = new Date(startDateString + "T00:00:00");
  const end = new Date(endDateString + "T00:00:00");

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  if (end < start) return 0;

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count += 1;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "-";

  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function setStatusClass(status) {
  const normalized = String(status).toLowerCase();
  if (normalized === "approved") return "approved";
  if (normalized === "rejected") return "rejected";
  return "pending";
}

function renderRequests() {
  const requests = getStoredRequests();

  requestTableBody.innerHTML = requests
    .slice()
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .map(
      (request) => `
        <tr>
          <td>${request.employee}</td>
          <td>${request.type}</td>
          <td>${formatDateRange(request.startDate, request.endDate)}</td>
          <td>${getBusinessDays(request.startDate, request.endDate)} days</td>
          <td><span class="badge ${setStatusClass(request.status)}">${request.status}</span></td>
        </tr>
      `
    )
    .join("");

  renderApprovalQueue();
  updateSummaryCards();
}

function renderApprovalQueue() {
  const requests = getStoredRequests().filter((request) => request.status === "Pending");

  if (!requests.length) {
    approvalQueue.innerHTML = `
      <div class="approval-card">
        <div>
          <h4>No pending approvals</h4>
          <div class="approval-meta">Everything is up to date for the current leave cycle.</div>
        </div>
      </div>
    `;
    return;
  }

  approvalQueue.innerHTML = requests
    .map(
      (request) => `
        <div class="approval-card">
          <div>
            <h4>${request.employee} · ${request.type}</h4>
            <div class="approval-meta">
              ${request.department} · ${formatDateRange(request.startDate, request.endDate)}<br />
              Manager: ${request.manager}
            </div>
          </div>
          <div class="approval-actions">
            <button class="action-btn approve" data-action="approve" data-id="${request.id}">Approve</button>
            <button class="action-btn reject" data-action="reject" data-id="${request.id}">Reject</button>
          </div>
        </div>
      `
    )
    .join("");

  approvalQueue.querySelectorAll(".action-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const { id, action } = event.currentTarget.dataset;
      updateRequestStatus(Number(id), action === "approve" ? "Approved" : "Rejected");
    });
  });
}

function updateRequestStatus(id, status) {
  const requests = getStoredRequests();
  const nextRequests = requests.map((request) =>
    request.id === id ? { ...request, status } : request
  );

  saveRequests(nextRequests);
  renderRequests();
}

function updateSummaryCards() {
  const requests = getStoredRequests();
  const approvedCount = requests.filter((request) => request.status === "Approved").length;
  const pendingCount = requests.filter((request) => request.status === "Pending").length;
  const availableDays = 12;
  const teamCoverage = Math.max(72, 100 - pendingCount * 9);

  document.getElementById("approvedCount").textContent = String(approvedCount);
  document.getElementById("pendingCount").textContent = String(pendingCount);
  document.getElementById("availableDays").textContent = String(availableDays);
  document.getElementById("teamCoverage").textContent = `${teamCoverage}%`;
}

function updateCalculationSummary() {
  const start = elements.startDate.value;
  const end = elements.endDate.value;

  if (!start || !end) {
    calculatedDaysEl.textContent = "0 days";
    balanceCheckEl.textContent = "Ready";
    return;
  }

  const totalDays = getBusinessDays(start, end);
  calculatedDaysEl.textContent = `${totalDays} ${totalDays === 1 ? "day" : "days"}`;

  if (end < start) {
    balanceCheckEl.textContent = "Check dates";
    balanceCheckEl.style.color = "#ef4444";
    return;
  }

  balanceCheckEl.style.color = "#122033";
  balanceCheckEl.textContent = totalDays <= 12 ? "Within balance" : "Over balance";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const employee = elements.employeeName.value.trim();
  const department = elements.department.value;
  const leaveType = elements.leaveType.value;
  const manager = elements.manager.value;
  const startDate = elements.startDate.value;
  const endDate = elements.endDate.value;
  const reason = elements.reason.value.trim();

  if (!employee || !department || !leaveType || !manager || !startDate || !endDate || !reason) {
    alert("Please complete all fields before submitting your leave request.");
    return;
  }

  if (new Date(endDate) < new Date(startDate)) {
    alert("End date cannot be earlier than the start date.");
    return;
  }

  const requests = getStoredRequests();
  const nextRequest = {
    id: Date.now(),
    employee,
    department,
    type: leaveType,
    manager,
    startDate,
    endDate,
    reason,
    status: "Pending",
    submittedAt: new Date().toISOString().slice(0, 10)
  };

  const updatedRequests = [nextRequest, ...requests];
  saveRequests(updatedRequests);
  form.reset();
  renderRequests();
  alert("Leave request submitted successfully.");
});

Object.values(elements).forEach((field) => {
  field.addEventListener("input", updateCalculationSummary);
  field.addEventListener("change", updateCalculationSummary);
});

document.querySelector("button[type='reset']").addEventListener("click", () => {
  setTimeout(() => {
    calculatedDaysEl.textContent = "0 days";
    balanceCheckEl.textContent = "Ready";
    balanceCheckEl.style.color = "#122033";
  }, 0);
});

renderRequests();
updateCalculationSummary();
