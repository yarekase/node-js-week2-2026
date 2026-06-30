function handleUpload(req, res, config) {
  const { uploadDir, maxFileSize } = config;

  const form = formidable({
    uploadDir: uploadDir,
    maxFileSize: maxFileSize,
    keepExtensions: true,
  });

  form.on("error", (err) => {
    console.error(err);
  });

  // 開始解析前端傳來的 request
  form.parse(req, (err, fields, files) => {
    // 狀況一：formidable 解析錯誤（包含超過檔案大小限制 maxFileSize）
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }

    // 這裡要注意：新版 formidable 的 files.file 可能是一個陣列，或者關鍵字叫做 files.file
    // 依據題目「沒 file 欄位」的要求，我們檢查 files.file 是否存在
    const uploadedFile = files.file; // 假設前端 input 的 name 叫做 'file'

    // 狀況二：沒 file 欄位（使用者沒上傳檔案）
    if (!uploadedFile) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No file uploaded" }));
      return;
    }

    // 狀況三：成功拿到檔案！開始準備回傳的資料
    // 如果單個檔案，新版 formidable 通常會把它包在物件或陣列裡，我們取第一個或直接拿屬性
    const fileInfo = Array.isArray(uploadedFile)
      ? uploadedFile[0]
      : uploadedFile;

    const filename = fileInfo.originalFilename; // 原始檔名，例如 'PHOTO.JPG'
    const savedPath = fileInfo.filepath; // 存在伺服器上的實體路徑
    const sizeKB = Math.round(fileInfo.size / 1024); // 把 byte 換算成 KB

    // 使用你之前寫的任務二函式來拿副檔名
    const ext = getFileExtension(filename);

    // 回傳 200 成功與 JSON 資料
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
