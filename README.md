# Grade Calculator Extension

This Firefox extension enhances the student portal on `https://vw-online.hdm-stuttgart.de/` by providing additional functionality to calculate and display the average grades and ECTS for `Grundstudium` and `Hauptstudium`, as well as the final grade based on the specified weights. The final grade is calculated using 15% `Grundstudium`, 70% `Hauptstudium`, and 15% `Bachelor Thesis`.

## Features

- Adds checkboxes to each row for selective grade calculation.
- Displays a summary row for `Grundstudium` and `Hauptstudium` with average grades and total ECTS.
- Allows adjusting the Bachelor Thesis grade dynamically.
- Shows a detailed final grade calculation section below the table.

## Installation

1. Clone or download this repository.
2. Open Firefox and navigate to `about:debugging`.
3. Click on `This Firefox` in the left sidebar.
4. Click on `Load Temporary Add-on...`.
5. Select the `manifest.json` file from the cloned/downloaded repository.

## Usage

1. Navigate to the HdM grade overview and login on `https://vw-online.hdm-stuttgart.de/`.
2. Navigate to "Prüfungsverwaltung" => "Notenspiegel"
3. The extension will automatically enhance the table with checkboxes and additional calculation features.
4. Use the checkboxes to select/deselect rows for grade calculation.
5. Adjust the Bachelor Thesis grade as needed.
6. View the calculated grades and ECTS summaries directly in the table.
7. The final grade calculation section will be displayed below the table.

## Permissions

The extension requires the following permissions:
- `activeTab`: To interact with the currently active tab.
- `*://vw-online.hdm-stuttgart.de/*`: To run the content script on the student portal.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
