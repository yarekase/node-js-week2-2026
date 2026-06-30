const { formidable } = require("formidable");
console.log("formidable的內容有：", formidable); // 確認 formidable

function handleUpload(req, res, config) {
  const { uploadDir, maxFileSize, gymName } = config;

  // 檔案路徑、檔案大小限制、保留原檔名
  const form = formidable({
    uploadDir: uploadDir,
    maxFileSize: maxFileSize,
    keepExtensions: true,
  });

  form.on("error", (err) => {
    console.error(err);
  });

  form.parse(req, (err, fields, files) => {
    // 處理錯誤(檔案大小超過系統限制、其他解析錯誤等後端問題)
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }

    const uploadedFile = files.file;

    // 前端送來的檔案裏面沒有file欄位
    if (!uploadedFile) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No file uploaded" }));
      return;
    }

    // 沒有問題則回傳這裡
    // 是陣列(多個檔案)則取第一個檔案，否則直接取uploadedFile
    const fileInfo = Array.isArray(uploadedFile)
      ? uploadedFile[0]
      : uploadedFile;

    const filename = fileInfo.originalFilename;
    const savedPath = fileInfo.filepath;
    const sizeKB = Math.round(fileInfo.size / 1024);

    function getFileExtension(filename) {
      if (!filename) return "";
      const lastDotIndex = filename.lastIndexOf(".");
      if (lastDotIndex <= 0) return "";
      return filename.slice(lastDotIndex).toLowerCase();
    }

    const ext = getFileExtension(filename);

    // 回傳成功與規定的JSON資料結構
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        filename,
        sizeKB,
        ext,
        savedPath,
      }),
    );
  });
}

module.exports = { handleUpload };
