// Vercel Serverless: 讯飞语音听写 WebSocket 代理
// 前端通过 fetch 发送音频 base64，此函数转发到讯飞

const crypto = require('crypto');

const APP_ID = 'd99c4af6';
const API_KEY = '1f8d94ff30ae4c5504a36f1e5d813adc';
const API_SECRET = 'MmJkZjkyNDdmZDcyMzU3NmY3YmY0OTVi';
const HOST = 'iat-api.xfyun.cn';
const PATH = '/v2/iat';
const URL = 'ws://' + HOST + PATH;

function getAuthUrl() {
  const date = new Date().toUTCString();
  const signatureOrigin = `host: ${HOST}\ndate: ${date}\nGET ${PATH} HTTP/1.1`;
  const signature = crypto.createHmac('sha256', API_SECRET).update(signatureOrigin).digest('base64');
  const authorizationOrigin = `api_key="${API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');
  return `${URL}?authorization=${encodeURIComponent(authorization)}&host=${encodeURIComponent(HOST)}&date=${encodeURIComponent(date)}`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body;
    const audioBase64 = body.audio;
    if (!audioBase64) return res.status(400).json({ error: 'No audio data' });

    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // 连接讯飞 WebSocket
    const WebSocket = require('ws');
    const wsUrl = getAuthUrl();

    const result = await new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      let text = '';
      let frameCreated = false;

      ws.on('open', () => {
        // 发送参数帧
        const params = {
          common: { app_id: APP_ID },
          business: {
            language: 'zh_cn', domain: 'iat', accent: 'mandarin',
            vad_eos: 2000, dwa: 'wpgs', ptt: 0
          },
          data: { status: 0, format: 'audio/L16;rate=16000', encoding: 'raw', audio: '' }
        };
        ws.send(JSON.stringify(params));

        // 发送音频数据帧
        const chunkSize = 1280;
        for (let i = 0; i < audioBuffer.length; i += chunkSize) {
          const chunk = audioBuffer.slice(i, i + chunkSize);
          const frame = {
            data: { status: i + chunkSize >= audioBuffer.length ? 2 : 1, format: 'audio/L16;rate=16000', encoding: 'raw', audio: chunk.toString('base64') }
          };
          ws.send(JSON.stringify(frame));
        }
      });

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.code !== 0) { reject(new Error(msg.message || '讯飞错误')); return; }
          if (msg.data && msg.data.result) {
            const ws = msg.data.result.ws || [];
            for (const w of ws) {
              for (const cw of (w.cw || [])) {
                text += cw.w || '';
              }
            }
          }
          if (msg.data && msg.data.status === 2) {
            ws.close();
            resolve(text);
          }
        } catch (e) {
          reject(e);
        }
      });

      ws.on('error', (e) => reject(e));
      ws.on('close', () => { if (!text) resolve(''); });

      setTimeout(() => { try { ws.close(); } catch(e) {} reject(new Error('超时')); }, 10000);
    });

    res.json({ text: result });
  } catch (e) {
    console.error('ASR proxy error:', e);
    res.status(500).json({ error: e.message });
  }
};
