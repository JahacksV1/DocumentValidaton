import { createUploadthing, type FileRouter } from "uploadthing/next";
import { createRouteHandler } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  documentUploader: f({ 
    "application/pdf": { maxFileSize: "4MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "4MB" }
  })
  .middleware(() => {
    // Add any auth/validation here
    return { userId: "user123" }; // You can add real auth later
  })
  .onUploadComplete(async ({ metadata, file }) => {
    // Return the file data to the client
    console.log("Upload complete on server:", file);
    return { 
      uploadedBy: metadata.userId,
      fileName: file.name,
      fileSize: file.size,
      fileUrl: file.url,
      fileType: file.type || "unknown"
    };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// Export route handlers for Next.js App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
}); 