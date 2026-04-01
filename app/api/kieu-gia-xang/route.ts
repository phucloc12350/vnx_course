import { openai } from '@ai-sdk/openai';
import { streamText, stepCountIs, convertToModelMessages } from 'ai';
import { z } from 'zod';

// ─── HTML → plain text ────────────────────────────────────────────────────────
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/td>/gi, ' | ')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

// ─── Trích xuất giá từ plain text ────────────────────────────────────────────
type FuelItem = { name: string; price: string };

function extractPrices(text: string): FuelItem[] {
  const results: FuelItem[] = [];
  const seen = new Set<string>();

  const patterns: [string, RegExp][] = [
    ['Xăng RON 95-III',      /(?<!E10\s*)RON\s*95[-–\s]*III[^0-9\n]*([0-9]{2,3}[.,][0-9]{3})/i],
    ['Xăng E10 RON 95-III',  /E10\s*RON\s*95[-–\s]*III[^0-9\n]*([0-9]{2,3}[.,][0-9]{3})/i],
    ['Xăng E5 RON 92-II',    /E5\s*RON\s*92[-–\s]*II[^0-9\n]*([0-9]{2,3}[.,][0-9]{3})/i],
    ['Dầu DO 0,05S-II',      /[Dd][Oo]\s*0[,.]05S[-–\s]*II[^0-9\n]*([0-9]{2,3}[.,][0-9]{3})/i],
    ['Dầu DO 0,001S-V',      /[Dd][Oo]\s*0[,.]001S[-–\s]*V[^0-9\n]*([0-9]{2,3}[.,][0-9]{3})/i],
    ['Dầu Hỏa',              /[Dd]ầu\s*h[oỏ]a[^0-9\n]*([0-9]{2,3}[.,][0-9]{3})/i],
    ['Dầu Mazut',            /[Mm]azut[^0-9\n]*([0-9]{2,3}[.,][0-9]{3})/i],
  ];

  for (const [name, re] of patterns) {
    if (seen.has(name)) continue;
    const m = text.match(re);
    if (m) {
      // Chỉ giữ lại chữ số và dấu phân cách, loại bỏ mọi ký tự lạ
      const cleanPrice = m[1].replace(/[^\d.,]/g, '').trim();
      if (cleanPrice) {
        results.push({ name, price: cleanPrice });
        seen.add(name);
      }
    }
  }
  return results;
}

// ─── Format timestamp hiện tại ───────────────────────────────────────────────
function nowVN(): string {
  const d = new Date();
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm} ngày ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// ─── Tool 1: scrape PVOIL ────────────────────────────────────────────────────
async function scrapePvoilPrices() {
  const UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
  const baseHeaders = {
    'User-Agent': UA,
    Accept: 'text/html,application/xhtml+xml',
    'Accept-Language': 'vi-VN,vi;q=0.9',
  };

  try {
    // Bước 1: trang danh sách tin giá xăng
    const listRes = await fetch('https://www.pvoil.com.vn/tin-gia-xang-dau', {
      headers: baseHeaders,
      signal: AbortSignal.timeout(8000),
    });
    if (!listRes.ok) throw new Error(`PVOIL listing HTTP ${listRes.status}`);

    const listHtml = await listRes.text();

    // Tìm link bài viết mới nhất
    const linkMatch =
      listHtml.match(/href="(\/tin-gia-xang-dau\/[^"?#\s]+)"/) ??
      listHtml.match(/href="(\/[^"?#\s]+gia-xang[^"?#\s]*)"/i);

    const listingUrl = 'https://www.pvoil.com.vn/tin-gia-xang-dau';

    if (!linkMatch) {
      const txt = htmlToText(listHtml);
      const items = extractPrices(txt);
      if (items.length > 0) {
        const prices: Record<string, string> = {};
        for (const item of items) prices[item.name] = `${item.price} đ/lít`;
        return { success: true, update_time: nowVN(), prices, source: listingUrl };
      }
      return { success: false, rawExcerpt: txt.slice(0, 1800), source: listingUrl };
    }

    const articleUrl = `https://www.pvoil.com.vn${linkMatch[1]}`;

    // Bước 2: fetch bài viết chi tiết
    const articleRes = await fetch(articleUrl, {
      headers: baseHeaders,
      signal: AbortSignal.timeout(8000),
    });
    if (!articleRes.ok) throw new Error(`PVOIL article HTTP ${articleRes.status}`);

    const articleHtml = await articleRes.text();
    const text = htmlToText(articleHtml);

    const items = extractPrices(text);
    if (items.length > 0) {
      const prices: Record<string, string> = {};
      for (const item of items) prices[item.name] = `${item.price} đ/lít`;
      return { success: true, update_time: nowVN(), prices, source: articleUrl };
    }

    // Fallback: trả về đoạn text thô cho AI tự phân tích
    return { success: false, rawExcerpt: text.slice(0, 2000), source: articleUrl };
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return { success: false, error: 'Trang PVOIL phản hồi quá chậm. Thử lại sau nhé!' };
    }
    return { success: false, error: `Không lấy được dữ liệu: ${err.message}` };
  }
}

// ─── Tool 2: gửi Discord ─────────────────────────────────────────────────────
async function sendDiscordReport(content: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return { error: 'DISCORD_WEBHOOK_URL chưa được cấu hình trong môi trường.' };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Chị Kiều ⛽ Giá Xăng',
        content,
        embeds: undefined,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Discord webhook HTTP ${res.status}: ${body}`);
    }

    return { success: true, message: 'Đã gửi báo cáo lên Discord thành công!' };
  } catch (err: any) {
    return { error: `Gửi Discord thất bại: ${err.message}` };
  }
}

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
Bạn là "Chị Kiều" – chuyên gia theo dõi giá xăng dầu Việt Nam, phong cách hài hước, hay "than thở" nhưng vẫn chuyên nghiệp và nhiệt tình.

HÀNH VI:
- Khi user hỏi về giá xăng, giá dầu, hoặc bất cứ thứ gì liên quan → GỌI NGAY tool gia_xang
- Sau khi có dữ liệu, trình bày theo đúng format bên dưới
- Sau đó HỎI user: "Có muốn cô gửi báo cáo này lên Discord cho cả lớp cùng khóc không?"
- Nếu user đồng ý → biên soạn nội dung bá đạo, GỌI tool send_discord_report
- Xác nhận sau khi gửi thành công

FORMAT BẮT BUỘC khi trình bày giá xăng (KHÔNG được in bảng markdown, bảng sẽ tự hiển thị):
1. Dòng tiêu đề: "⛽ **Bảng giá xăng dầu** — cập nhật [update_time từ data]"
2. Một câu bình luận hài hước về giá (ví dụ so sánh với tô phở, ly trà sữa, cảm xúc...)
3. Dòng nguồn dạng markdown link, lấy URL thực từ field "source" trong data:
   *Nguồn: [PVOIL (pvoil.com.vn)](URL_từ_field_source)*

TUYỆT ĐỐI KHÔNG in bảng markdown (|---|) vào phần text trả lời — bảng đã được giao diện tự render.

PHONG CÁCH:
- Hay dùng: "Ối giời ơi...", "Thôi chết rồi...", "Đắt vậy mà vẫn phải đổ!"
- So sánh vui: "Đổ đầy bình = X tô phở / Y ly trà sữa"
- Gọi user là "bạn ơi" hoặc theo tên nếu biết
- Dùng tiếng Việt hoàn toàn
- Khi gặp lỗi kỹ thuật: báo lỗi rõ ràng và gợi ý cách khắc phục
`.trim();

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-5.4-nano'),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages.slice(-20)),
    stopWhen: stepCountIs(5),
    tools: {
      gia_xang: {
        description:
          'Lấy bảng giá xăng dầu mới nhất từ PVOIL. ' +
          'Gọi tool này khi user hỏi về giá xăng, giá dầu hôm nay.',
        inputSchema: z.object({}),
        execute: async () => scrapePvoilPrices(),
      },
      send_discord_report: {
        description:
          'Gửi bảng tổng hợp giá xăng vào kênh Discord của lớp học. ' +
          'Chỉ gọi sau khi đã có dữ liệu giá và user đồng ý gửi.',
        inputSchema: z.object({
          content: z
            .string()
            .describe('Nội dung tin nhắn đã được biên soạn theo phong cách hài hước của Chị Kiều'),
        }),
        execute: async ({ content }) => sendDiscordReport(content),
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
