// ================= 仓库配置 =================
const owner = "hshmeng";
const repo = "hshmeng-forum";

// ================= Emoji 支持 =================
let emojiMap = {};

async function loadEmojiMap() {
    const res = await fetch("../json/emoji.json"); // 确保文件放在根目录 or public 下
    const data = await res.json();

    // 生成映射表 { ":fire:": "🔥", ":bug:": "🐛", ... }
    data.forEach(e => {
        e.aliases.forEach(alias => {
            emojiMap[`:${alias}:`] = e.emoji;
        });
    });
}


// 将文本中的 :emoji: 替换为真正的 emoji
function replaceEmoji(text) {
    if (!text) return "";
    return text.replace(/:[a-z0-9_+]+:/gi, match => emojiMap[match] || match);
}

// ================= Markdown 渲染 =================
function renderMarkdown(text) {
    if (!text) return "";
    return marked.parse(text, {
        headerIds: false,
        mangle: false,
        breaks: true,
        gfm: true,
        sanitizer: false
    });
}

// ================= 加载帖子 =================
async function loadIssues() {
    const container = document.getElementById("issues-container");

    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`, {
            headers: { "Accept": "application/vnd.github+json" }
        });
        if (!res.ok) throw new Error(`API 请求失败: ${res.status}`);
        const issuesList = await res.json();

        if (!issuesList || issuesList.length === 0) {
            container.innerHTML = "<p style='text-align:center'>暂无帖子</p>";
            return;
        }
        // 遍历所有帖子，一个一个加载详情
        for (const issueSummary of issuesList) {
            const issueRes = await fetch(issueSummary.url, { headers: { "Accept": "application/vnd.github+json" } });
            const issue = await issueRes.json();

            const div = document.createElement("div");
            div.className = "issue-card";

            // ========== 标签部分 ==========
            let labelsHtml = "";
            if (issue.labels && issue.labels.length > 0) {
                labelsHtml = `<div class="issue-labels">`;
                issue.labels.forEach(label => {
                    const labelColor = `#${label.color}`;
                    let textColor = "#fff";
                    const rgb = parseInt(label.color,16);
                    if ((rgb & 0xff) + ((rgb >> 8) & 0xff) + ((rgb >> 16) & 0xff) > 382) {
                        textColor = "#333";
                    }
                    labelsHtml += `<span class="issue-label" style="background-color:${labelColor}; color:${textColor}">${replaceEmoji(label.name)}</span>`;
                });
                labelsHtml += `</div>`;
            }
            // ========== 帖子 HTML ==========
            div.innerHTML = `
                <div class="issue-header">
                    <div class="issue-header-left">
                        <img src="${issue.user.avatar_url}" class="issue-avatar" alt="avatar">
                        <div class="issue-title">${issue.title}</div>
                    </div>
                    <div class="issue-time">${new Date(issue.created_at).toLocaleString()}</div>
                </div>

                <div class="issue-body">${renderMarkdown(issue.body)}</div>

                ${labelsHtml}

                <div class="comments-toggle">评论 (${issue.comments}) ▼</div>
                <div class="comments-container"></div>
            `;
            container.appendChild(div);

            // ========== 帖子正文交互 ==========
            const issueBody = div.querySelector(".issue-body");
            issueBody.addEventListener("click", () => issueBody.classList.toggle("expanded"));

            // 帖子内图片点击放大
            issueBody.querySelectorAll("img").forEach(img => {
                img.addEventListener("click", () => window.open(img.src, "_blank"));
            });
            // ========== 评论逻辑 ==========
            const toggleEl = div.querySelector(".comments-toggle");
            const commentsContainer = div.querySelector(".comments-container");
            let commentsLoaded = false;

            toggleEl.addEventListener("click", async () => {
                if (commentsContainer.style.display === "block") {
                    commentsContainer.style.display = "none";
                    toggleEl.textContent = `评论 (${issue.comments}) ▼`;
                    return;
                }

                commentsContainer.style.display = "block";
                toggleEl.textContent = `评论 (${issue.comments}) ▲`;

                if (commentsLoaded) return;
                commentsLoaded = true;
                commentsContainer.innerHTML = "";

                const commentsRes = await fetch(issue.comments_url, {
                    headers: { "Accept": "application/vnd.github+json" }
                });
                const comments = await commentsRes.json();
                if (!comments || comments.length === 0) {
                    commentsContainer.innerHTML = "<p>暂无评论</p>";
                    return;
                }

                comments.forEach(c => {
                    // 有些评论可能被隐藏
                    if (!c.user) return;

                    const cdiv = document.createElement("div");
                    cdiv.className = "comment";
                    cdiv.innerHTML = `
                            <img src="${c.user.avatar_url}" alt="avatar">
                            <div class="comment-body">
                                <div>
                                    <span class="author">${c.user.login}</span> 
                                    <span class="time">${new Date(c.created_at).toLocaleString()}</span>
                                </div>
                                <div class="comment-text">${renderMarkdown(c.body)}</div>
                            </div>
                        `;
                    commentsContainer.appendChild(cdiv);

                    // 评论图片点击放大
                    cdiv.querySelectorAll(".comment-text img").forEach(img => {
                        img.addEventListener("click", () => window.open(img.src, "_blank"));
                    });

                    // 评论文本点击展开/收回
                    const commentText = cdiv.querySelector(".comment-text");
                    commentText.addEventListener("click", () => commentText.classList.toggle("expanded"));
                });
            });
        }
    } catch (err) {
        container.innerHTML = `<p style="color:red;text-align:center;">加载失败: ${err.message}</p>`;
    }
}

// ================= 页面加载时执行 =================
(async () => {
    await loadEmojiMap();  // 先加载 emoji 映射表
    await loadIssues();    // 再加载帖子
})();
