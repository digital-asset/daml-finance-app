// UploadedFilesContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface UploadedFilesContextType {
  uploadedFiles: { [key: string]: File };
  addUploadedFile: (fileId: string, file: File) => void;
}

const UploadedFilesContext = createContext<UploadedFilesContextType | undefined>(undefined);

export const UploadedFilesProvider: React.FC = ({ children }) => {
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({});

  const addUploadedFile = (fileId: string, file: File) => {
    setUploadedFiles({ ...uploadedFiles, [fileId]: file });
  };

  return (
    <UploadedFilesContext.Provider value={{ uploadedFiles, addUploadedFile }}>
      {children}
    </UploadedFilesContext.Provider>
  );
};

export const useUploadedFiles = () => {
  const context = useContext(UploadedFilesContext);
  if (!context) {
    throw new Error('useUploadedFiles must be used within an UploadedFilesProvider');
  }
  return context;
};
