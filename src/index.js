export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let key = url.pathname.slice(1); // 移除路径开头的斜杠

    // 处理根路径或以斜杠结尾的情况，追加 index.html
    if (key === '' || key.endsWith('/')) {
      key = 'index.html';
    }
    // 如果没有文件扩展名且不是以 / 结尾，追加 .html
    else if (!key.includes('.') && !isFileExtension(key)) {
      key += '.html';
    }
    // 如果已有扩展名，直接使用
    else if (isFileExtension(key)) {
      // 保持原样
    }
    // 其他情况保持原 key
    else {
      key += '.html'; // 默认追加 .html
    }

    // 从 R2 获取文件
    const object = await env.EASYNJOY.get(key);
    if (!object) {
      return new Response('文件未找到', { status: 404 });
    }

    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata.contentType || 'text/html');
    headers.set('Cache-Control', 'public, max-age=31536000');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Link', `<https://www.easynjoy.com${url.pathname}>; rel="canonical"`); // 动态生成规范 URL

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