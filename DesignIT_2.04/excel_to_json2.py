import pandas as pd
import json

# Load the Excel file
excel_file = 'C:/Users/nielsfgj/WebstormProjects/DesignIT_2.04/data/WebComponents (version 2025-02-04).xlsx'  # Update this to the file path
sheet_name = 'Components'  # Sheet name where data is located

# Read the data from the specified sheet
df = pd.read_excel(excel_file, sheet_name=sheet_name)

# Select only the required columns (adjust column names as needed)
# Assuming columns are named 'Title', 'HTML', 'CSS', 'Reference'
data = df[['Title', 'HTML', 'CSS', 'Reference']].to_dict(orient='records')

# Save the data to a JSON file
json_file_path = 'C:/Users/nielsfgj/WebstormProjects/DesignIT_2.04/data/components.json'  # Update this to desired output path
with open(json_file_path, 'w', encoding='utf-8') as json_file:
    json.dump(data, json_file, indent=4, ensure_ascii=False)

print("Data successfully exported to components.json")
