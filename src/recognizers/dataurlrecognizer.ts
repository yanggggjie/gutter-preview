import { ImagePathRecognizer, UrlMatch } from './recognizer';

const collectMatchesForPattern = (pattern: RegExp, lineIndex: number, line: string): UrlMatch[] => {
    let match: RegExpExecArray;

    let escapeURIContent = (content: string) => {
        // 检查是否包含需要编码的字符（空格、引号）
        const hasUnescapedSpace = content.indexOf(' ') > -1;
        const hasUnescapedQuote = content.indexOf('"') > -1 || content.indexOf("'") > -1;
        // 检查是否已经被 URL 编码（包含 %XX 格式）
        const isAlreadyEncoded = /%[0-9A-Fa-f]{2}/.test(content);

        // 如果包含未转义的空格或引号，且还没有被编码，则进行编码
        if ((hasUnescapedSpace || hasUnescapedQuote) && !isAlreadyEncoded) {
            const commaIndex = content.indexOf(',');
            if (commaIndex > -1) {
                return content.substring(0, commaIndex + 1) + encodeURIComponent(content.substring(commaIndex + 1));
            }
        }

        // 否则直接返回原内容
        return content;
    };

    const result = [];
    while ((match = pattern.exec(line))) {
        if (match.length > 1) {
            const imagePath = match[1];
            result.push({
                url: escapeURIContent(imagePath),
                lineIndex,
                start: match.index,
                end: match.index + imagePath.length,
            });
        }
    }
    return result;
};

export const dataUrlRecognizer: ImagePathRecognizer = {
    recognize: (lineIndex: number, line: string): UrlMatch[] => {
        const urlPrefixLength = "url('".length;
        let results: UrlMatch[] = [];

        // 匹配 url() 中带引号的 data URI
        results.push(...collectMatchesForPattern(/url\(\'(data:image.*)\'\)/gim, lineIndex, line));
        results.push(...collectMatchesForPattern(/url\(\"(data:image.*)\"\)/gim, lineIndex, line));

        results = results.map((p) => ({ ...p, start: p.start + urlPrefixLength, end: p.end + urlPrefixLength }));

        // 匹配 url() 中不带引号的 data URI
        if (results.length == 0) {
            const unquotedResults = collectMatchesForPattern(/url\((data:image[^)]*)\)/gim, lineIndex, line);
            const unquotedUrlPrefixLength = 'url('.length;
            results.push(
                ...unquotedResults.map((p) => ({
                    ...p,
                    start: p.start + unquotedUrlPrefixLength,
                    end: p.end + unquotedUrlPrefixLength,
                })),
            );
        }

        // 匹配引号中的 data URI（不在 url() 中）
        if (results.length == 0) {
            results.push(...collectMatchesForPattern(/\'(data:image[^']*)\'/gim, lineIndex, line));
            results.push(...collectMatchesForPattern(/\"(data:image[^"]*)\"/gim, lineIndex, line));
            results.push(...collectMatchesForPattern(/\`(data:image[^`]*)\`/gim, lineIndex, line));
        }

        return results;
    },
};
