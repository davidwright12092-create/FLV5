import { Request, Response, NextFunction } from 'express'
import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Middleware to serve API documentation
 * Supports both HTML and JSON responses based on Accept header
 */
export async function serveApiDocs(req: Request, res: Response, next: NextFunction) {
  try {
    const docsPath = join(__dirname, '..', 'docs', 'api-reference.md')
    const markdownContent = await readFile(docsPath, 'utf-8')

    const acceptHeader = req.headers.accept || ''

    // Check if client wants JSON
    if (acceptHeader.includes('application/json')) {
      return res.json({
        success: true,
        format: 'markdown',
        content: markdownContent,
        lastUpdated: new Date().toISOString()
      })
    }

    // Otherwise, serve as HTML
    const htmlContent = generateHtmlFromMarkdown(markdownContent)
    res.setHeader('Content-Type', 'text/html')
    res.send(htmlContent)
  } catch (error) {
    console.error('Error serving API docs:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to load API documentation'
    })
  }
}

/**
 * Convert markdown to basic HTML
 * For production, consider using a proper markdown parser like 'marked'
 */
function generateHtmlFromMarkdown(markdown: string): string {
  // Basic markdown to HTML conversion
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FieldLink v5 API Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            min-height: 100vh;
        }

        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            margin: -20px -20px 40px;
            border-radius: 0 0 10px 10px;
        }

        h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        h2 {
            font-size: 2em;
            margin: 40px 0 20px;
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }

        h3 {
            font-size: 1.5em;
            margin: 30px 0 15px;
            color: #764ba2;
        }

        p {
            margin: 15px 0;
        }

        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #e83e8c;
        }

        pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 20px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 20px 0;
        }

        pre code {
            background: none;
            color: inherit;
            padding: 0;
        }

        ul {
            margin: 15px 0 15px 30px;
        }

        li {
            margin: 8px 0;
        }

        a {
            color: #667eea;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        strong {
            color: #555;
        }

        .method-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 0.85em;
            font-weight: bold;
            margin-right: 10px;
        }

        .get { background: #61affe; color: white; }
        .post { background: #49cc90; color: white; }
        .patch { background: #fca130; color: white; }
        .delete { background: #f93e3e; color: white; }

        .info-box {
            background: #e7f3ff;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 3px;
        }

        .warning-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 3px;
        }

        .toc {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }

        .toc ul {
            list-style: none;
            margin-left: 0;
        }

        .toc li {
            margin: 5px 0;
        }

        footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>FieldLink v5 API Documentation</h1>
            <p>Comprehensive API reference for the FieldLink v5 platform</p>
        </header>

        <div class="content">
            ${html}
        </div>

        <footer>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>FieldLink v5 - AI Conversation Analysis Platform</p>
        </footer>
    </div>
</body>
</html>
  `
}
