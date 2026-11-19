const LIMIT = 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

// Runs entirely in the browser. Oversized images are flattened onto white when converted to JPEG.
export async function prepareEventPhotos(files: File[]): Promise<File[]> {
  if (files.length > 10) throw new Error("Chỉ được chọn tối đa 10 ảnh.");
  const result: File[] = [];
  for (const file of files) {
    if (!TYPES.includes(file.type) || !file.size) throw new Error("Vui lòng chọn ảnh JPEG, PNG hoặc WebP có dữ liệu.");
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Không thể đọc ảnh. Vui lòng chọn ảnh khác."));
        image.src = url;
      });
      if (!image.width || !image.height) throw new Error("Không thể đọc ảnh. Vui lòng chọn ảnh khác.");
      if (file.size < LIMIT) { result.push(file); continue; }
      let scale = Math.min(1, 2048 / Math.max(image.width, image.height));
      let output: Blob | null = null;
      for (let attempt = 0; attempt < 6 && !output; attempt++) {
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Không thể xử lý ảnh trên thiết bị này.");
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        for (const quality of [0.85, 0.7, 0.55]) {
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
          if (blob && blob.type === "image/jpeg" && blob.size > 0 && blob.size < LIMIT) { output = blob; break; }
        }
        scale *= 0.7;
      }
      if (!output) throw new Error("Không thể giảm kích thước ảnh. Vui lòng chọn ảnh khác.");
      result.push(new File([output], `${file.name.replace(/\.[^.]*$/, "") || "photo"}.jpg`, { type: "image/jpeg", lastModified: file.lastModified }));
    } catch (error) {
      if (error instanceof Error && /ảnh/.test(error.message)) throw error;
      throw new Error("Không thể xử lý ảnh. Vui lòng chọn ảnh khác.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return result;
}
