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
type FuelItem = { name: string; price: string; unit: string };

function extractPrices(text: string): FuelItem[] {
  const results: FuelItem[] = [];
  const seen = new Set<string>();

  const patterns: [string, RegExp][] = [
    ['Xăng RON 95-III',    /RON\s*95[-–\s]*III[^0-9]*([0-9]{2,3}[.,][0-9]{3})/i],
    ['Xăng E5 RON 92-II',  /E5\s*RON\s*92[-–\s]*II[^0-9]*([0-9]{2,3}[.,][0-9]{3})/i],
    ['Dầu Diesel 0.05S-II',/[Dd]iesel\s*0\.05S[-–\s]*II[^0-9]*([0-9]{2,3}[.,][0-9]{3})/i],
    ['Dầu Diesel',         /[Dd]iesel[^0-9\n]*([0-9]{2,3}[.,][0-9]{3})/i],
    ['Dầu Hỏa',            /[Dd]ầu\s*h[oỏ]a[^0-9]*([0-9]{2,3}[.,][0-9]{3})/i],
    ['Dầu Mazut',          /[Mm]azut[^0-9]*([0-9]{2,3}[.,][0-9]{3})/i],
  ];

  for (const [name, re] of patterns) {
    const baseName = name.split(' ')[0] + ' ' + (name.split(' ')[1] ?? '');
    if (seen.has(baseName)) continue;
    const m = text.match(re);
    if (m) {
      results.push({ name, price: m[1], unit: 'đồng/lít' });
      seen.add(baseName);
    }
  }
  return results;
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

    if (!linkMatch) {
      // Thử trực tiếp trên trang danh sách
      const txt = htmlToText(listHtml);
      const prices = extractPrices(txt);
      return prices.length > 0
        ? { prices, source: 'https://www.pvoil.com.vn/tin-gia-xang-dau' }
        : { rawExcerpt: txt.slice(0, 1800), source: 'https://www.pvoil.com.vn/tin-gia-xang-dau' };
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

    // Trích xuất ngày hiệu lực
    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/);

    const prices = extractPrices(text);
    if (prices.length > 0) {
      return { prices, effectiveFrom: dateMatch?.[1], source: articleUrl };
    }

    // Fallback: trả về đoạn text thô cho AI tự phân tích
    return {
      rawExcerpt: text.slice(0, 2000),
      effectiveFrom: dateMatch?.[1],
      source: articleUrl,
    };
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return { error: 'Trang PVOIL phản hồi quá chậm. Thử lại sau nhé!' };
    }
    return { error: `Không lấy được dữ liệu: ${err.message}` };
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
- Khi user hỏi về giá xăng, giá dầu, hoặc bất cứ thứ gì liên quan → GỌI NGAY tool get_fuel_prices
- Sau khi có dữ liệu, trình bày bảng giá rõ ràng bằng markdown, thêm bình luận hài hước về giá
- Sau đó HỎI user: "Có muốn cô gửi báo cáo này lên Discord cho cả lớp cùng khóc không?" 
- Nếu user đồng ý → biên soạn nội dung bá đạo, GỌI tool send_discord_report
- Xác nhận sau khi gửi thành công

PHONG CÁCH:
- Hay dùng: "Ối giời ơi...", "Thôi chết rồi...", "Đắt vậy mà vẫn phải đổ!"
- Hay so sánh: "Tiền xăng hôm nay bằng X tô phở đó nhé"
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
      get_fuel_prices: {
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
