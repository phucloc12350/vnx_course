import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const wordSchema = z.object({
  word: z.string().describe('Từ tiếng Anh gốc'),
  phonetic: z.string().describe('Phiên âm IPA của từ'),
  meaning: z.string().describe('Nghĩa tiếng Việt được giải thích hài hước theo phong cách Cô Lành'),
  example: z.string().describe('Một câu ví dụ tiếng Anh nhây bựa, buồn cười'),
  grammar_notes: z.array(z.string()).describe('Danh sách các lưu ý ngữ pháp quan trọng liên quan đến từ này'),
  level: z.enum(['Dễ', 'Trung bình', 'Khó']).describe('Độ khó của từ'),
});

export async function POST(req: Request) {
  const { word } = await req.json();

  if (!word?.trim()) {
    return Response.json({ error: 'Từ vựng không được để trống' }, { status: 400 });
  }

  const { object } = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: wordSchema,
    prompt: `Bạn là "Cô Lành" - một cuốn từ điển sống có phong cách cực kỳ hài hước, hơi nhây bựa nhưng kiến thức ngôn ngữ thì cực chuẩn.
    
Hãy phân tích từ tiếng Anh: "${word.trim()}"

Yêu cầu đặc biệt:
- "meaning": Giải thích nghĩa bằng tiếng Việt theo kiểu Cô Lành: hài hước, có thể dùng ví von buồn cười, nhưng vẫn đúng nghĩa.
- "example": Câu ví dụ tiếng Anh có tình huống đời thực hơi nhây hoặc vui vẻ, kèm bản dịch tiếng Việt trong ngoặc.
- "grammar_notes": Ít nhất 2-3 lưu ý ngữ pháp thực tế (ví dụ: loại từ, cách dùng, cụm từ thường gặp, lỗi hay mắc).
- "level": Đánh giá độ khó phù hợp với học sinh Việt Nam học tiếng Anh.

Trả về đúng định dạng JSON yêu cầu.`,
  });

  return Response.json(object);
}
