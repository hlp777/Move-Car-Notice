addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const wxpusherAppToken = 'AT_xxx' // Wxpusher APP Token
  const wxpusherUIDs = ['UID_xxx'] // 车主的UIDs

  const htmlContent = `
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
          <button class="notify-btn" onclick="notifyOwner()">通知车主挪车</button>
        </div>

        <script>
          let lastNotificationTime = 0;
          const cooldownPeriod = 7000;
          // 调用 Wxpusher API 来发送挪车通知
          function notifyOwner() {
            const currentTime = Date.now();
            
            if (currentTime - lastNotificationTime < cooldownPeriod) {
              alert("请等待7秒后再次发送通知。");
              return;
            }

            lastNotificationTime = currentTime;

            fetch("https://wxpusher.zjiecode.com/api/send/message", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                appToken: "${wxpusherAppToken}",
                content: "您好，有人需要您挪车，请及时处理。",
                contentType: 1,
                uids: ${JSON.stringify(wxpusherUIDs)}
              })
            })
            .then(response => response.json())
            .then(data => {
              if (data.code === 1000) {
                alert("通知已发送！");
              } else {
                alert("通知发送失败，请稍后重试。");
              }
            })
            .catch(error => {
              console.error("Error sending notification:", error);
              alert("通知发送出错，请检查网络连接。");
            });
          }
        </script>
      </body>
    </html>
  `

  return new Response(htmlContent, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  })
}
