import React from 'react';
import { UploadButton, UploadDropzone } from '../utils/uploadthing';

export default function FileUploader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <UploadButton
        endpoint="documentUploader"
        onClientUploadComplete={(res) => {
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error) => {
          alert(`ERROR! ${error.message}`);
        }}
      />
      
      <UploadDropzone
        endpoint="documentUploader"
        onClientUploadComplete={(res) => {
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error) => {
          alert(`ERROR! ${error.message}`);
        }}
      />
    </div>
  );
} 