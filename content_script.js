function handleDocumentLoad() {
    const table = document.querySelector('table[border="1"][cellspacing="0"][cellpadding="5"][align="center"][width="100%"]');
    if (!table) {
        console.error('Grade table not found');
        return;
    }

    const rows = table.querySelectorAll('tr');
    insertCheckboxes(rows);
    createBachelorThesisGradeInput(table);
    updateCalculations(table, rows);
}

function insertCheckboxes(rows) {
    for (let i = 1; i < rows.length; i++) {  // First row is the header => skip it
        const firstCell = rows[i].cells[0];

        // Skip header rows 'Grundstudium' or 'Hauptstudium'
        if (firstCell.tagName === 'TH' && (/Grundstudium/.test(firstCell.textContent) || /Hauptstudium/.test(firstCell.textContent))) {
            continue;
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.addEventListener('change', () => updateCalculations(firstCell.closest('table'), firstCell.closest('table').querySelectorAll('tr')));
        firstCell.insertBefore(checkbox, firstCell.firstChild);
    }
}

function createBachelorThesisGradeInput(table) {
    const container = document.createElement('div');
    container.innerHTML = `
        <label for="bachelor-thesis-grade"><strong>Bachelor Thesis Grade:</strong></label>
        <input type="number" id="bachelor-thesis-grade" step="0.1" min="1" max="5" value="1.0">
    `;

    // Insert the final grade calculation two elements below the table
    let referenceNode = table;
    for (let i = 0; i < 2; i++) {
        referenceNode = referenceNode.nextSibling;
    }
    referenceNode.parentNode.insertBefore(container, referenceNode.nextSibling);

    const bachelorThesisGradeInput = document.getElementById('bachelor-thesis-grade');
    bachelorThesisGradeInput.addEventListener('input', () => updateCalculations(table, table.querySelectorAll('tr')));
}

function updateCalculations(table, rows) {
    let grundstudiumECTS = 0;
    let grundstudiumGradeSum = 0;
    let grundstudiumCount = 0;
    let hauptstudiumECTS = 0;
    let hauptstudiumGradeSum = 0;
    let hauptstudiumCount = 0;
    let currentSection = null;

    let grundstudiumSummaryRow = table.querySelector('.grundstudium-summary');
    let hauptstudiumSummaryRow = table.querySelector('.hauptstudium-summary');

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.cells;
        const firstCell = cells[0];

        if (cells[0].tagName === 'TH') {
            if (/Grundstudium/.test(cells[0].textContent)) {
                currentSection = 'Grundstudium';
            } else if (/Hauptstudium/.test(cells[0].textContent)) {
                currentSection = 'Hauptstudium';
                grundstudiumSummaryRow = appendOrUpdateSummaryRow(table, grundstudiumSummaryRow, grundstudiumGradeSum / grundstudiumCount, grundstudiumECTS, 'Grundstudium Summary', row, 'grundstudium-summary');
            }
            continue;
        }

        if (currentSection) {
            const checkbox = cells[0].querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked && cells.length > 6) {
                const statusCell = cells[6];
                colorizeStatusCell(statusCell);

                const grade = parseFloat(cells[5].textContent.trim().replace(',', '.'));
                const ects = parseInt(cells[7].textContent.trim());

                if (!isNaN(grade) && !isNaN(ects) && ects > 0) {
                    if (currentSection === 'Grundstudium') {
                        grundstudiumGradeSum += grade * ects;
                        grundstudiumCount += ects;
                    } else if (currentSection === 'Hauptstudium') {
                        hauptstudiumGradeSum += grade * ects;
                        hauptstudiumCount += ects;
                    }
                }

                if (!isNaN(ects)) {
                    if (currentSection === 'Grundstudium') {
                        grundstudiumECTS += ects;
                    } else if (currentSection === 'Hauptstudium') {
                        hauptstudiumECTS += ects;
                    }
                }
            }
        }
    }

    hauptstudiumSummaryRow = appendOrUpdateSummaryRow(table, hauptstudiumSummaryRow, hauptstudiumGradeSum / hauptstudiumCount, hauptstudiumECTS, 'Hauptstudium Summary', null, 'hauptstudium-summary');

    // Get the grade from the input field for the Bachelor Thesis
    const bachelorThesisGrade = parseFloat(document.getElementById('bachelor-thesis-grade').value);
    const bachelorThesisECTS = 12; // Fixed ECTS for Bachelor Thesis

    const finalGrade = (
        (grundstudiumGradeSum / grundstudiumCount) * 0.15 +
        (hauptstudiumGradeSum / hauptstudiumCount) * 0.70 +
        bachelorThesisGrade * 0.15
    ).toFixed(2);

    const finalECTS = grundstudiumECTS + hauptstudiumECTS + bachelorThesisECTS;

    displayFinalGradeCalculation(table, finalGrade, finalECTS, grundstudiumECTS, hauptstudiumECTS, bachelorThesisECTS);
}

function appendOrUpdateSummaryRow(table, existingRow, averageGrade, totalECTS, sectionTitle, insertBeforeRow = null, className) {
    if (existingRow) {
        existingRow.cells[5].textContent = `Average Grade: ${averageGrade.toFixed(2)}`;
        existingRow.cells[7].textContent = `Total ECTS: ${totalECTS}`;
    } else {
        const newRow = table.insertRow(insertBeforeRow ? insertBeforeRow.rowIndex : -1);
        newRow.className = `tabelle1 summary-row ${className}`;

        const numCells = table.rows[0].cells.length;
        for (let j = 0; j < numCells; j++) {
            const cell = newRow.insertCell(j);
            cell.className = 'tabelle1';
            cell.innerHTML = '&nbsp;';
        }

        newRow.cells[0].textContent = sectionTitle;
        newRow.cells[5].textContent = `Average Grade: ${averageGrade.toFixed(2)}`;
        newRow.cells[7].textContent = `Total ECTS: ${totalECTS}`;
        return newRow;
    }
    return existingRow;
}

function displayFinalGradeCalculation(table, finalGrade, finalECTS, grundstudiumECTS, hauptstudiumECTS, bachelorThesisECTS) {
    const finalCalculationContainer = document.getElementById('final-calculation');
    if (finalCalculationContainer) {
        finalCalculationContainer.remove();
    }

    const newFinalCalculationContainer = document.createElement('div');
    newFinalCalculationContainer.id = 'final-calculation';
    newFinalCalculationContainer.innerHTML = `
        <style>
            .final-grade-calculation {
                border: 1px solid #ccc;
                padding: 20px;
                margin-top: 20px;
                background-color: #f9f9f9;
                border-radius: 5px;
                font-family: Arial, sans-serif;
            }
            .final-grade-calculation h3 {
                margin-top: 0;
                color: #333;
            }
            .final-grade-calculation p {
                margin: 5px 0;
                color: #555;
            }
            .final-grade-calculation .strong {
                font-weight: bold;
                color: #000;
            }
        </style>
        <div class="final-grade-calculation">
            <h3>Final Grade Calculation</h3>
            <p>Grundstudium: 15% of ECTS (${grundstudiumECTS})</p>
            <p>Hauptstudium: 70% of ECTS (${hauptstudiumECTS})</p>
            <p>Bachelor Thesis: 15% of ECTS (${bachelorThesisECTS})</p>
            <p class="strong">Combined ECTS: ${finalECTS}</p>
            <p class="strong">Final Average Grade: ${finalGrade}</p>
        </div>
    `;

    // Insert the final grade calculation three elements below the table
    let referenceNode = table;
    for (let i = 0; i < 3; i++) {
        referenceNode = referenceNode.nextSibling;
    }
    referenceNode.parentNode.insertBefore(newFinalCalculationContainer, referenceNode.nextSibling);
}

document.addEventListener('DOMContentLoaded', handleDocumentLoad);

function colorizeStatusCell(cell) {
    const statusText = cell.textContent.trim();
    switch (statusText) {
        case "AN":
        case "angemeldet":
            cell.style.backgroundColor = '#ffcc80';  // Light Orange
            break;
        case "BE":
        case "bestanden":
            cell.style.backgroundColor = '#90ee90';  // Light Green
            break;
        case "NB":
        case "nicht bestanden":
            cell.style.backgroundColor = '#ff6347';  // Tomato Red
            break;
        case "EN":
        case "endgültig nicht bestanden":
            cell.style.backgroundColor = '#b22222';  // Firebrick
            break;
        case "G":
        case "genehmigter Rücktritt":
            cell.style.backgroundColor = '#ff8c00';  // Dark Orange
            break;
        case "U":
        case "unentschuldigter Rücktritt":
            cell.style.backgroundColor = '#ffa500';  // Orange
            break;
        default:
            cell.style.backgroundColor = '#d3d3d3';  // Light Gray for undefined statuses
    }
}

if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', handleDocumentLoad);
} else {
    handleDocumentLoad();
}
