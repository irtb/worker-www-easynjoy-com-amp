export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let key = url.pathname.slice(1); // 移除路径开头的斜杠

    // 如果路径为空或以斜杠结尾，追加 index.html
    if (key === '' || key.endsWith('/')) {
      key += 'index.html';
    }
    // 如果路径不以斜杠结尾且可能为目录，尝试追加 /index.html
    else if (!key.includes('.') && !isFileExtension(key)) {
      key += '/index.html';
    }

    // 从 R2 获取文件
    const object = await env.MY_BUCKET.get(key);
    if (!object) {
      return new Response('文件未找到', { status: 404 });
    }

    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata.contentType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000');

    return new Response(object.body, { headers });
  }
};

// 辅助函数：检查是否为文件扩展名
function isFileExtension(key) {
  const extensions = [
    '.html', '.htm',    // HTML 文件
    '.css',             // 样式表
    '.js',              // JavaScript
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff', '.ico', // 图片
    '.svg',             // 矢量图
    '.mp3', '.wav', '.ogg', '.aac', '.flac', // 音频
    '.mp4', '.webm', '.mov', '.avi', '.mkv', // 视频
    '.ttf', '.otf', '.woff', '.woff2', '.eot', // 字体
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', // 文档
    '.txt', '.json', '.xml', '.csv', // 文本/数据
    '.zip', '.rar', '.tar', '.gz', // 压缩文件
    '.php', '.py', '.rb', '.java', // 脚本/代码
  ];
  return extensions.some(ext => key.toLowerCase().endsWith(ext));
}