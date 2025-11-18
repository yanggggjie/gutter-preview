// 测试修复后的 escapeURIContent 函数

// 修复后的函数
let escapeURIContent = (content) => {
    // 检查是否包含需要编码的字符（空格、引号）
    const hasUnescapedSpace = content.indexOf(' ') > -1;
    const hasUnescapedQuote = content.indexOf('"') > -1 || content.indexOf("'") > -1;
    // 检查是否已经被 URL 编码（包含 %XX 格式）
    const isAlreadyEncoded = /%[0-9A-Fa-f]{2}/.test(content);
    
    console.log('分析:', {
        hasUnescapedSpace,
        hasUnescapedQuote,
        isAlreadyEncoded
    });
    
    // 如果包含未转义的空格或引号，且还没有被编码，则进行编码
    if ((hasUnescapedSpace || hasUnescapedQuote) && !isAlreadyEncoded) {
        const commaIndex = content.indexOf(',');
        if (commaIndex > -1) {
            console.log('✅ 进行编码');
            return (
                content.substring(0, commaIndex + 1) +
                encodeURIComponent(content.substring(commaIndex + 1))
            );
        }
    }
    
    // 否则直接返回原内容
    console.log('✅ 直接返回（不编码）');
    return content;
};

console.log('=== 测试场景 1：已编码的 data URI（用户的问题场景）===');
const test1 = `data:image/svg+xml,%3Csvg%20width%3D%2212%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M2.454%206.58l1.06-1.06%205.78%205.779a.996.996%200%20010%201.413l-5.78%205.779-1.06-1.061%205.425-5.425-5.425-5.424z%22%20fill%3D%22%23B2B2B2%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E`;
console.log('输入:', test1.substring(0, 50) + '...');
const result1 = escapeURIContent(test1);
console.log('输出:', result1.substring(0, 50) + '...');
console.log('相同?', test1 === result1);

console.log('\n=== 测试场景 2：未编码的 data URI（包含空格）===');
const test2 = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><path d='M12 0'/></svg>`;
console.log('输入:', test2);
const result2 = escapeURIContent(test2);
console.log('输出:', result2);
console.log('已编码?', result2.includes('%'));

console.log('\n=== 测试场景 3：charset 参数的已编码 URI ===');
const test3 = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 0'/%3E%3C/svg%3E`;
console.log('输入:', test3);
const result3 = escapeURIContent(test3);
console.log('输出:', result3);
console.log('相同?', test3 === result3);

