// FileUploadComponent.tsx
import React, { useState } from 'react';
import { Input } from '@mui/material';
import { useUploadedFiles } from './UploadedFilesContext';

interface FileUploadProps {
  label: string;
  onFileUploaded: (fileId: string) => void;
}

const FileUploadComponent: React.FC<FileUploadProps> = ({ label, onFileUploaded }) => {
  const { addUploadedFile } = useUploadedFiles();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file) {
        // Generate a unique fileId (e.g., using a timestamp)
        const fileId = Date.now().toString();
        
        addUploadedFile(fileId, file); // Add the file to the context with a unique fileId
        setSelectedFile(file);
        onFileUploaded(fileId); // Notify the parent component with the fileId and filename
      }
    }
  };

  return (
    <div>
      <label style={{ display: 'block', cursor: 'pointer' }}>
        {label}
        <input
          type="file"
          accept=".pdf, .doc, .docx" // Specify allowed file types here
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </label>
      {selectedFile && <p>Selected File: {selectedFile.name}</p>}
    </div>
  );
};

export default FileUploadComponent;
