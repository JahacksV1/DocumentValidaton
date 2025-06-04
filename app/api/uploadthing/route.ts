import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  documentUploader: f({ 
    "application/pdf": { maxFileSize: "4MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "4MB" }
  })
  .onUploadComplete(async ({ metadata, file }) => {
    // Here you could insert the file metadata into Turso
    console.log("Upload complete", file);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 