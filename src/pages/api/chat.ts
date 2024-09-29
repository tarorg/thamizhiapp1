import type { APIRoute } from 'astro';
import { createClient } from '@libsql/client/web';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.GROQ_API_KEY,
});

const db = createClient({
  url: "libsql://thamizhiapp-thamizhiorg.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MjcyOTAwMzMsImlkIjoiMzczMmY0YTQtZDdmNi00OTAyLTg5NTItNDM4MTdiODIwMmZjIn0.wgkfQkCUVSxzqb0tQHtxrigmWLIsFL4QW6p4B19Thz3MMCi1O37K0evuDy2u4YDxfTm4ADndFs1nIE-d-4GzBg"
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const { question } = await request.json();

    const relevantDocs = await performSimilaritySearch(question);
    const context = relevantDocs.map(doc => {
      return Object.entries(doc)
        .filter(([key]) => key !== 'embedding' && key !== 'id')
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }).join('\n\n');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Use the following context to answer the user\'s question:\n\n' + context
        },
        { role: 'user', content: question }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.5,
      max_tokens: 1000,
    });

    const answer = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error processing question:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while processing your question.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

async function performSimilaritySearch(question: string) {
  const keywords = question.split(/\s+/).filter((word: string) => word.length > 2);
  const searchConditions = keywords.map(() => "incident_description LIKE ? OR incident_title LIKE ?").join(" OR ");
  const searchArgs = keywords.flatMap((word: string) => [`%${word}%`, `%${word}%`]);

  const result = await db.execute({
    sql: `SELECT *
          FROM datas_fts
          WHERE ${searchConditions}
          LIMIT 5`,
    args: searchArgs
  });

  return result.rows;
}