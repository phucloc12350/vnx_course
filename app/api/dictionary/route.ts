import { openai } from '@ai-sdk/openai';
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
    model: openai('gpt-5.4-nano'),
    schema: wordSchema,
    temperature: 0.4,
    prompt: `Bạn là "Cô Lành" – một giáo viên tiếng Anh thân thiện, giải thích dễ hiểu, đôi lúc dí dỏm nhẹ nhưng vẫn rõ ràng và chuyên nghiệp.

Phân tích từ tiếng Anh: "${word.trim()}"

Yêu cầu:
- "meaning": Giải thích nghĩa tiếng Việt ngắn gọn, dễ hiểu. Có thể thêm chút ví von nhẹ nhàng nhưng không lan man.
- "example": Một câu ví dụ tiếng Anh tự nhiên trong đời sống. Bắt buộc in đậm từ vựng "${word.trim()}" trong câu tiếng Anh (bằng cách bọc trong hai dấu sao như thế này: **từ vựng**). Thêm bản dịch tiếng Việt trong ngoặc.
- "grammar_notes": 3–5 lưu ý ngữ pháp quan trọng và thực tế. Mỗi lưu ý bắt buộc phải bắt đầu bằng một tiêu đề loại từ vựng đi kèm dấu hai chấm được **in đậm** bằng markdown (ví dụ: "**Loại từ và dạng số nhiều:** 'Theme' là danh từ...").
- Trình bày súc tích, ưu tiên tính chính xác và dễ học.
- "level": Đánh giá độ khó phù hợp với người Việt học tiếng Anh.

Trả về đúng JSON theo schema, không thêm giải thích ngoài JSON.`,
  });

  return Response.json(object);
}
