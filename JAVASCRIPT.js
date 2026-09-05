let students = {};

const studentIdInput = document.getElementById("studentId");
const searchBtn = document.getElementById("searchBtn");

const studentDetails = document.getElementById("studentDetails");
const searchMessage = document.getElementById("searchMessage");

const studentName = document.getElementById("studentName");
const studentDepartment = document.getElementById("studentDepartment");
const displayStudentId = document.getElementById("displayStudentId");

const totalFee = document.getElementById("totalFee");
const paidAmount = document.getElementById("paidAmount");
const pendingAmount = document.getElementById("pendingAmount");
const fineAmount = document.getElementById("fineAmount");

const dueDate = document.getElementById("dueDate");
const totalPayable = document.getElementById("totalPayable");
const paymentStatus = document.getElementById("paymentStatus");

const remindMeBtn = document.getElementById("remindMeBtn");
const reminderStatus = document.getElementById("reminderStatus");
searchMessage.textContent =
    "Loading student information...";

searchMessage.style.color =
    "#6b7280";

// ==========================================
// LOAD STUDENT DATA
// ==========================================

fetch("student_result.csv?t=" + Date.now())
    .then(response => {

        if (!response.ok) {
            throw new Error("student_result.csv not found");
        }

        return response.text();
    })

    .then(csvText => {

        const rows = csvText.trim().split(/\r?\n/);

        if (rows.length < 2) {
            throw new Error("No student data found");
        }

        const headers = rows[0].split(",").map(header =>
            header.trim()
        );

        rows.slice(1).forEach(row => {

            const values = row.split(",");

            if (values.length < headers.length) {
                return;
            }

            const student = {};

            headers.forEach((header, index) => {
                student[header] =
                    values[index]?.trim() || "";
            });

            const id = student["StudentID"];

            if (id) {

                students[id.toUpperCase()] = {

                    studentId: id,

                    name: student["StudentName"],

                    department: student["Department"],

                    totalFee:
                        Number(student["TotalFee"]) || 0,

                    paidAmount:
                        Number(student["PaidAmount"]) || 0,

                    pendingAmount:
                        Number(student["PendingAmount"]) || 0,

                    dueDate:
                        student["DueDate"],

                    fineAmount:
                        Number(student["FineAmount"]) || 0,

                    totalPayable:
                        Number(student["TotalPayable"]) || 0,

                    whatsappNumber:
                        student["WhatsAppNumber"] || ""
                };
            }

        });

        console.log(
            "Students loaded:",
            Object.keys(students).length
        );

    })

    .catch(error => {

        console.error(error);

        searchMessage.textContent =
            "Unable to load student data.";

        searchMessage.style.color = "#dc2626";

    });


// ==========================================
// SEARCH STUDENT
// ==========================================

searchBtn.addEventListener("click", searchStudent);


// Allow Enter key
studentIdInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        searchStudent();
    }

});
function searchStudent() {

    const id = studentIdInput.value
        .trim()
        .toUpperCase();

    // Empty input
    if (id === "") {

        searchMessage.textContent =
            "Please enter your Student ID.";

        searchMessage.style.color = "#dc2626";

        studentDetails.style.display = "none";

        return;
    }

    const student = students[id];

    // Student not found
    if (!student) {

        searchMessage.textContent =
            "Student ID not found. Please check and try again.";

        searchMessage.style.color = "#dc2626";

        studentDetails.style.display = "none";

        return;
    }

    // Student found
    searchMessage.textContent =
        "✓ Student details found.";

    searchMessage.style.color = "#16a34a";

    studentDetails.style.display = "block";


    // Student information
    displayStudentId.textContent =
        student.studentId;

    studentName.textContent =
        student.name;

    studentDepartment.textContent =
        student.department;


    // Fee information
    totalFee.textContent =
        formatCurrency(student.totalFee);

    paidAmount.textContent =
        formatCurrency(student.paidAmount);

    pendingAmount.textContent =
        formatCurrency(student.pendingAmount);

    fineAmount.textContent =
        formatCurrency(student.fineAmount);


    // Payment information
    dueDate.textContent =
        student.dueDate || "--";

    totalPayable.textContent =
        formatCurrency(student.totalPayable);


    // Payment status
    if (student.pendingAmount <= 0) {

        paymentStatus.textContent =
            "✓ PAID";

        paymentStatus.style.color =
            "#16a34a";

        remindMeBtn.style.display =
            "none";

        reminderStatus.textContent =
            "Your fees are fully paid.";

        reminderStatus.style.color =
            "#16a34a";

        reminderStatus.style.display =
            "block";

    } else {

        paymentStatus.textContent =
            "⚠ PENDING";

        paymentStatus.style.color =
            "#ea580c";

        remindMeBtn.style.display =
            "block";

        updateReminderButton(id);
    }
}


// ==========================================
// CURRENCY FORMAT
// ==========================================

function formatCurrency(amount) {

    return "₹" +
        Number(amount).toLocaleString("en-IN");

}


// ==========================================
// REMINDER BUTTON
// ==========================================
remindMeBtn.addEventListener("click", function () {

    const id =
        studentIdInput.value.trim().toUpperCase();

    const student = students[id];

    // Check student
    if (!student) {

        reminderStatus.textContent =
            "Please search for your student details first.";

        reminderStatus.style.color =
            "#dc2626";

        reminderStatus.style.display =
            "block";

        return;
    }

    // Check pending amount
    if (student.pendingAmount <= 0) {

        reminderStatus.textContent =
            "✓ Your fees are fully paid. No reminder is required.";

        reminderStatus.style.color =
            "#16a34a";

        reminderStatus.style.display =
            "block";

        return;
    }

    // Check WhatsApp number
    if (!student.whatsappNumber) {

        reminderStatus.textContent =
            "WhatsApp number is not available.";

        reminderStatus.style.color =
            "#dc2626";

        reminderStatus.style.display =
            "block";

        return;
    }


    // Create personalized message
    const message =
        "Hello " + student.name +
        ", your college fee payment of ₹" +
        Number(student.totalPayable).toLocaleString("en-IN") +
        " is pending. Due date: " +
        student.dueDate +
        ". Please make the payment at the earliest.";

    // Create WhatsApp URL based on device

// ==========================================
// OPEN WHATSAPP
// ==========================================

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

let whatsappURL;

if (isMobile) {

    // 📱 Mobile → WhatsApp universal link
    whatsappURL =
        "https://wa.me/91" +
        student.whatsappNumber +
        "?text=" +
        encodeURIComponent(message);

} else {

    // 💻 Laptop/Desktop → WhatsApp Web
    whatsappURL =
        "https://web.whatsapp.com/send?phone=91" +
        student.whatsappNumber +
        "&text=" +
        encodeURIComponent(message);

}
    alert(whatsappURL);
window.location.href = whatsappURL;



    // Show status
    reminderStatus.textContent =
        "✓ WhatsApp reminder opened.";

    reminderStatus.style.color =
        "#16a34a";

    reminderStatus.style.display =
        "block";

});


// ==========================================
// UPDATE REMINDER BUTTON
// ==========================================

function updateReminderButton(studentId) {

    const key =
        "reminder_" + studentId;

    const enabled =
        localStorage.getItem(key) === "true";


    if (enabled) {

        remindMeBtn.textContent =
            "🔕 Turn Reminder OFF";

        reminderStatus.textContent =
            "✅ Daily WhatsApp reminder is ON until the fee is fully paid.";

        reminderStatus.style.color =
            "#16a34a";

    } else {

        remindMeBtn.textContent =
            "🔔 Remind Me";

        reminderStatus.textContent =
            "🔕 Daily WhatsApp reminder is OFF.";

        reminderStatus.style.color =
            "#dc2626";

    }


    reminderStatus.style.display =
        "block";

}
