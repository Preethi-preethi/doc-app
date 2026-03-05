import { ipcMain } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import fg from 'fast-glob'

const IGNORE_PATTERNS = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.png',
    '**/*.gif',
    '**/*.ico',
    '**/*.svg',
    '**/*.pdf',
    '**/*.zip',
    '**/*.tar',
    '**/*.gz',
    '**/*.exe',
    '**/*.dll',
    '**/*.mp4',
    '**/*.mp3',
    '**/*.woff',
    '**/*.woff2',
    '**/*.eot',
    '**/*.ttf'
]

// Expose scanning capability to frontend
export function registerFileScanningHandlers() {
    ipcMain.handle('scan:directory', async (_, dirPath: string) => {
        try {
            // 1. Map all files using fast-glob
            const files = await fg('**/*', {
                cwd: dirPath,
                ignore: IGNORE_PATTERNS,
                dot: true,
                absolute: true,
            })

            const fileData = []

            // 2. Read contents of text-based files
            for (const file of files) {
                try {
                    // Add a simple size check to skip huge files > 1MB
                    const stats = fs.statSync(file)
                    if (stats.size > 1024 * 1024) continue

                    const content = fs.readFileSync(file, 'utf-8')
                    const relativePath = path.relative(dirPath, file)

                    fileData.push({
                        path: relativePath,
                        name: path.basename(file),
                        content,
                        size: stats.size
                    })
                } catch (readErr) {
                    console.error(`Failed to read file ${file}`, readErr)
                }
            }

            return { success: true, files: fileData }
        } catch (error: any) {
            console.error('File scanning error:', error)
            return { success: false, error: error.message }
        }
    })
}
