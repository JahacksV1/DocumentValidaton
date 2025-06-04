import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const { uploadFiles } = f({
  documentUploader: {
    pdf: { maxFileSize: "10MB" },
    docx: { maxFileSize: "10MB" }
  }
}); 