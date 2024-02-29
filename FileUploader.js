import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const FileUploader = () => {
  const [tableData, setTableData] = useState(null);
  console.log("1");
  const fetchTableDataFromBackend = async () => {
    try {
      const response = await fetch('http://localhost:8090/process_table/');
      if (!response.ok) {
        throw new Error('Failed to fetch table data from backend');
      }
      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error('Error fetching table data from backend:', error);
    }
  }; 

const handleFileUpload = async (event) => {
    console.log("2");
    const file = event.target.files[0];
    if (!file) return;
  
    if (file.name.endsWith('.csv')) {
      readCSVFile(file);
    } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
      await readXLSXFile(file); // Wait for readXLSXFile to complete
    } else {
      alert('Unsupported file format. Please upload a CSV or Excel file.');
    }
  };


const readCSVFile = (file) => {
    console.log("3");
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      sendFileDataToBackend(fileContent);
    };
    reader.readAsText(file, 'ISO-8859-8'); // Specify the encoding
  };

const readXLSXFile = (file) => {
    console.log("4");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        sendFileDataToBackend(fileContent);
        resolve(); // Resolve the promise after sending the file data
      };
      reader.readAsArrayBuffer(file);
    });
  };

const sampleData = {
key1: 'value1',
key2: 'value2',
key3: 123,
key4: true
};

// Convert sample data to JSON string
const sampleDataJson = JSON.stringify(sampleData);

const sendFileDataToBackend = (fileContent) => {
  console.log("5");
  console.log(fileContent);
  const formData = new FormData();
  formData.append('sampleData', sampleDataJson);
//   formData.append('file', fileContent);
    fetch('http://localhost:8090/process_table/', {
      method: 'POST',
      body: formData, // Send file data directly to the backend
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to send file data to backend');
        }
        // Handle successful response
        console.log('File data sent to backend successfully');
        fetchTableDataFromBackend(); // Fetch updated table data
      })
      .catch(error => {
        console.error('Error sending file data to backend:', error);
      });
  };

  const handleOptionChange = (rowIndex, columnName, newValue) => {
    // Your logic for handling changes to table data
    // For example, you can update the tableData state here
  };

return (
    <div style={{ textAlign: 'center', paddingTop: '50px', paddingBottom: '20px', margin: '0', backgroundColor: 'transparent' }}>
      <input type="file" onChange={handleFileUpload} accept=".csv, .xls, .xlsx" style={{ display: 'none' }} id="upload-button" />
      <label htmlFor="upload-button" style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', margin: '0', border: 'none' }}>Upload File (CSV/XLS/XLSX)</label>
      {tableData && (
        <div style={{ margin: '20px auto 0', width: 'fit-content' }}>
          <table>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.entries(row).map(([column, cell], cellIndex) => (
                      <td key={cellIndex}>
                        <input
                          type="text"
                          defaultValue={cell}
                          style={{ backgroundColor: 'gold', padding: '5px', borderRadius: '3px' }}
                        />
                      </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
