import { generateReactHelpers } from "@uploadthing/react";
import { generateComponents } from "@uploadthing/react";

export const { useUploadThing, uploadFiles } = generateReactHelpers();
export const { UploadButton, UploadDropzone, Uploader } = generateComponents(); 