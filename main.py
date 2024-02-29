from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel, AnyHttpUrl, ValidationError
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse  # Add this import
import xlrd
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)  # Set log level to DEBUG

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8090"],  # Adjust the origin URL according to your frontend's URL
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

class TableData(BaseModel):
    data: list
    file_extension: str

@app.get("/")
def read_root():
    return {"message": "My InsuranceAlert app!"}

@app.get("/process_table/")
async def get_processed_table():
    global df
    try:
        if df.empty:
            return JSONResponse(content=[], status_code=200)  # Return an empty response
        else:
            # Assuming df is your DataFrame that was processed earlier
            modified_data = df.to_dict(orient='records')
            return JSONResponse(content=modified_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve processed table data")

@app.post("/process_table/")
async def process_table(file: UploadFile = File(...)):
    try:
        # Read the file content
        content = await file.read()
        logging("Received file content:")
        logging(content)  # Print the received file content

        # Process the file based on its extension
        if file.filename.endswith('.csv'):
            # Process CSV data
            df = pd.read_csv(content)
        elif file.filename.endswith('.xls') or file.filename.endswith('.xlsx'):
            # Process Excel data
            workbook = xlrd.open_workbook(file_contents=content)
            sheet = workbook.sheet_by_index(0)  # Assuming data is in the first sheet
            data = [sheet.row_values(row) for row in range(sheet.nrows)]
            df = pd.DataFrame(data)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a CSV or Excel file.")

        # Convert DataFrame to dictionary
        processed_data = df.to_dict(orient='records')

        return processed_data

    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to process table data")

# def process_file(file_contents):
#     try:
#         print("File contents:", file_contents)
#         df = pd.read_csv(file_contents)
#         print("DataFrame:", df)
#         processed_data = df.to_dict(orient='records')
#         return {"processed_data": processed_data}
#     except Exception as e:
#         print("Error:", e)
#         return {"error": "Failed to process the file"}

# @app.post("/upload/")
# async def upload_file(file: UploadFile = File(...)):
#     try:
#         # Read the bytes of the uploaded file
#         contents = await file.read()
#         # Convert bytes to DataFrame
#         df = pd.read_csv(io.BytesIO(contents), encoding='utf-8')
#         # Process the DataFrame
#         processed_data = df.to_dict(orient='records')
#         return {"processed_data": processed_data}
#     except Exception as e:
#         return {"error": "Failed to process the file"}