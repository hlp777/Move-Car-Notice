addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const cooldownPeriod = 7000; 
let lastNotificationTime = 0;
const wxpusherAppToken = 'AT_xxx';
const wxpusherUIDs = ['UID_xxx'];

async function handleRequest(request) {
  const url = new URL(request.url);

  // 如果请求的是 /notify 端点
  if (url.pathname === '/notify') {
    return await notifyOwner();
  }

  // 否则返回HTML页面
  return new Response(getHtmlContent(), {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}

async function notifyOwner() {
  const currentTime = Date.now();

  // 检查冷却时间
  if (currentTime - lastNotificationTime < cooldownPeriod) {
    return new Response('请等待7秒后再次发送通知。', { status: 503 }); // 使用503 Service Unavailable状态码
  }

  lastNotificationTime = currentTime;

  // 发送通知
  try {
    const response = await fetch("https://wxpusher.zjiecode.com/api/send/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appToken: wxpusherAppToken,
        content: "您好，有人需要您挪车，请及时处理。",
        contentType: 1,
        uids: wxpusherUIDs
      })
    });

    const data = await response.json();

    if (data.code === 1000) {
      return new Response('通知已发送！', { status: 200 });
    } else {
      return new Response(`通知发送失败，请稍后重试。错误代码: ${data.code}`, { status: 500 });
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response('通知发送出错，请检查网络连接。', { status: 500 });
  }
}

function getHtmlContent() {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>通知车主挪车</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f0f2f5; color: #333; }
          .container { text-align: center; padding: 20px; width: 100%; max-width: 400px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); background: #fff; }
          h1 { font-size: 24px; margin-bottom: 20px; color: #007bff; }
          p { margin-bottom: 20px; font-size: 16px; color: #555; }
          button { 
            width: 100%; 
            padding: 15px; 
            margin: 10px 0; 
            font-size: 18px; 
            font-weight: bold; 
            color: #fff; 
            border: none; 
            border-radius: 6px; 
            cursor: pointer; 
            transition: background 0.3s; 
          }
          .notify-btn { background: #28a745; }
          .notify-btn:hover { background: #218838; }
          .call-btn { background: #17a2b8; }
          .call-btn:hover { background: #138496; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>通知车主挪车</h1>
          <p>如需通知车主，请点击以下按钮</p>
          <button class="notify-btn">通知车主挪车</button>
        </div>

        <script>
          // 调用 Wxpusher API 来发送挪车通知
          function notifyOwner() {
            fetch("/notify")
              .then(response => response.text())
              .then(message => alert(message))
              .catch(error => alert("通知发送出错，请检查网络连接。"));
          }
        </script>
      </body>
    </html>
  `;
}