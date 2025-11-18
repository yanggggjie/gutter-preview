// 测试 data URI 识别
const testLine = `mask-image: url(data:image/svg+xml,%3Csvg%20width%3D%2212%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M2.454%206.58l1.06-1.06%205.78%205.779a.996.996%200%20010%201.413l-5.78%205.779-1.06-1.061%205.425-5.425-5.425-5.424z%22%20fill%3D%22%23B2B2B2%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E);`;

console.log('测试字符串:', testLine);
console.log('\n--- 测试不带引号的正则 ---');

const pattern = /url\((data:image[^)]*)\)/gim;
const match = pattern.exec(testLine);

if (match) {
    console.log('✅ 匹配成功！');
    console.log('完整匹配:', match[0]);
    console.log('捕获组 1:', match[1]);
    console.log('匹配索引:', match.index);
} else {
    console.log('❌ 未匹配');
}

// 测试 escapeURIContent 函数
console.log('\n--- 测试 escapeURIContent 函数 ---');

let escapeURIContent = (content) => {
    console.log('输入:', content);
    console.log('content.indexOf(\' \'):', content.indexOf(' '));
    console.log('content.indexOf(\'"\'):', content.indexOf('"'));
    console.log('content.indexOf("\'"):', content.indexOf("'"));
    
    if (content.indexOf(' ') > 0 || content.indexOf('"') || content.indexOf("'") > 0) {
        console.log('⚠️  进入编码分支');
        const result = content.substring(0, content.indexOf(',') + 1) +
            encodeURIComponent(content.substring(content.indexOf(',') + 1));
        console.log('输出:', result);
        return result;
    } else {
        console.log('✅ 直接返回');
        return content;
    }
};

if (match) {
    const escaped = escapeURIContent(match[1]);
}

