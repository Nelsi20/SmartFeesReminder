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

        searchMessage.textContent =
            "Enter your Student ID to continue.";

        searchMessage.style.color =
            "#6b7280";

    })

    .catch(error => {

        console.error(error);

        searchMessage.textContent =
            "Unable to load student data.";

        searchMessage.style.color =
            "#dc2626";

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


    // ======================================
    // EMPTY INPUT
    // ======================================

    if (id === "") {

        searchMessage.textContent =
            "Please enter your Student ID.";

        searchMessage.style.color =
            "#dc2626";

        studentDetails.style.display =
            "none";

        return;

    }


    const student = students[id];


    // ======================================
    // STUDENT NOT FOUND
    // ======================================

    if (!student) {

        searchMessage.textContent =
            "Student ID not found. Please check and try again.";

        searchMessage.style.color =
            "#dc2626";

        studentDetails.style.display =
            "none";

        return;

    }


    // ======================================
    // STUDENT FOUND
    // ======================================

    searchMessage.textContent =
        "✓ Student details found.";

    searchMessage.style.color =
        "#16a34a";

    studentDetails.style.display =
        "block";


    // ======================================
    // STUDENT INFORMATION
    // ======================================

    displayStudentId.textContent =
        student.studentId;

    studentName.textContent =
        student.name;

    studentDepartment.textContent =
        student.department;


    // ======================================
    // FEE INFORMATION
    // ======================================

    totalFee.textContent =
        formatCurrency(student.totalFee);

    paidAmount.textContent =
        formatCurrency(student.paidAmount);

    pendingAmount.textContent =
        formatCurrency(student.pendingAmount);

    fineAmount.textContent =
        formatCurrency(student.fineAmount);


    // ======================================
    // PAYMENT INFORMATION
    // ======================================

    dueDate.textContent =
        student.dueDate || "--";

    totalPayable.textContent =
        formatCurrency(student.totalPayable);


    // ======================================
    // PAYMENT STATUS
    // ======================================

    if (student.pendingAmount <= 0) {

        paymentStatus.textContent =
            "✓ PAID";

        paymentStatus.style.color =
            "#16a34a";

        remindMeBtn.style.display =
            "none";

        remindMeBtn.removeAttribute("href");

        reminderStatus.textContent =
            "Your fees are fully paid.";

        reminderStatus.style.color =
            "#16a34a";

        reminderStatus.style.display =
            "block";

    }

    else {

        paymentStatus.textContent =
            "⚠ PENDING";

        paymentStatus.style.color =
            "#ea580c";

        remindMeBtn.style.display =
            "block";


        // Create WhatsApp link
        setWhatsAppLink(student);


        // Reminder instruction
        reminderStatus.textContent =
            "💬 Click \"Send WhatsApp Reminder\" to send your personalized fee reminder.";

        reminderStatus.style.color =
            "#16a34a";

        reminderStatus.style.display =
            "block";

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
// CREATE WHATSAPP LINK
// ==========================================

function setWhatsAppLink(student) {

    // ======================================
    // PERSONALIZED MESSAGE
    // ======================================

    const message =
        "Hello " + student.name +
        ", your college fee payment of ₹" +
        Number(student.totalPayable).toLocaleString("en-IN") +
        " is pending. Due date: " +
        student.dueDate +
        ". Please make the payment at the earliest.";


    // ======================================
    // DETECT DEVICE
    // ======================================

    const isMobile =
        /Android|iPhone|iPad|iPod/i.test(
            navigator.userAgent
        );


    let whatsappURL;


    // ======================================
    // MOBILE → WHATSAPP APP
    // ======================================

    if (isMobile) {

        whatsappURL =
            "https://wa.me/91" +
            student.whatsappNumber +
            "?text=" +
            encodeURIComponent(message);

    }


    // ======================================
    // LAPTOP → WHATSAPP WEB
    // ======================================

    else {

        whatsappURL =
            "https://web.whatsapp.com/send?phone=91" +
            student.whatsappNumber +
            "&text=" +
            encodeURIComponent(message);

    }


    // ======================================
    // SET DIRECT LINK
    // ======================================

    remindMeBtn.href =
        whatsappURL;

    remindMeBtn.target =
        "_self";

    remindMeBtn.textContent =
        "🔔 Send WhatsApp Reminder";

}


// ==========================================
// PREVENT "#" FROM APPEARING
// ==========================================

remindMeBtn.addEventListener("click", function(event) {

    if (!remindMeBtn.href ||
        remindMeBtn.getAttribute("href") === "#") {

        event.preventDefault();

    }

});
