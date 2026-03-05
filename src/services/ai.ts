import { FileData } from '../types'

const NVIDIA_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY || "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" // User-provided key injected directly into frontend memory

export const QwenAPI = {
    async generateDocumentation(
        files: FileData[],
        mode: 'product' | 'process',
        onStreamToken?: (token: string) => void
    ) {
        // 1. Prepare context. Due to ~32k context window in typical open models, 
        // we aggregate snippets intelligently
        const MAX_FILES = 50 // cap to prevent token explosion
        const safeFiles = files.slice(0, MAX_FILES)
        let codebaseContext = safeFiles.map(f => `\n--- File: ${f.path} ---\n${f.content.substring(0, 1500)}...\n`).join('')

        const systemPrompt = `You are a world-class principal software engineer. You are analyzing an entire codebase to automatically generate comprehensive technical documentation.`

        const userPrompt = `
      I need you to generate a detailed ${mode === 'product' ? 'Product-Based' : 'Process-Based'} Documentation for the following codebase.
      
      Requirements for Product-Based: Focus on features, user guides, API usage, high-level architecture.
      Requirements for Process-Based: Focus on setup instructions, deployment, continuous integration, code structure, contribution guidelines.
      
      Format the output in clean, structured Markdown, neatly dividing into sections: Frontend, Backend, Database.
      
      CODEBASE CONTEXT:
      ${codebaseContext}
    `

        try {
            const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${NVIDIA_API_KEY}`,
                    "Accept": "text/event-stream",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "meta/llama-3.1-70b-instruct",
                    messages: [
                        { "role": "system", "content": systemPrompt },
                        { "role": "user", "content": userPrompt }
                    ],
                    max_tokens: 4096,
                    temperature: 0.60,
                    top_p: 0.95,
                    top_k: 20,
                    stream: true,
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error (${response.status}): ${errorText}`);
            }

            if (!response.body) throw new Error("ReadableStream not yet supported in this browser.")

            const reader = response.body.getReader()
            const decoder = new TextDecoder("utf-8")
            let fullText = ""
            let buffer = ""

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')

                // Keep the last partial line in the buffer
                buffer = lines.pop() || ""

                for (const line of lines) {
                    const trimmedLine = line.trim()
                    if (trimmedLine.startsWith('data: ') && trimmedLine !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(trimmedLine.slice(6))
                            if (data.choices && data.choices[0].delta?.content) {
                                const token = data.choices[0].delta.content
                                fullText += token
                                if (onStreamToken) onStreamToken(token)
                            }
                        } catch (e) {
                            console.warn("Could not parse stream delta", trimmedLine)
                        }
                    }
                }
            }

            return fullText

        } catch (error) {
            console.error("Error generating documentation via Qwen:", error)
            throw error
        }
    }
}
