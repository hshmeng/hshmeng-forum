// 仓库信息
const owner = "hshmeng";          // GitHub 仓库拥有者
const repo = "hshmeng-forum";     // 仓库名称

// 异步函数：加载帖子
async function loadIssues() {
    const container = document.getElementById("issues-container"); // 获取帖子容器

    try {
        // 请求 GitHub API 获取所有公开 Issue（帖子）
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`, {
            headers: { "Accept": "application/vnd.github+json" } // GitHub 推荐 Accept header
        });

        // 如果请求失败，抛出错误
        if (!res.ok) throw new Error(`API 请求失败: ${res.status}`);

        // 转换为 JSON 数据
        const issues = await res.json();

        // 如果没有帖子，显示提示
        if (!issues || issues.length === 0) {
            container.innerHTML = "<p style='text-align:center'>暂无帖子</p>";
            return;
        }

        // 遍历每个帖子（Issue）
        issues.forEach(issue => {
            const div = document.createElement("div"); // 创建帖子卡片容器
            div.className = "issue-card";

            // =================== 标签部分 ===================
            let labelsHtml = "";
            if (issue.labels && issue.labels.length > 0) {
                labelsHtml = `<div class="issue-labels">`;
                issue.labels.forEach(label => {
                    // GitHub API 返回的 label.color 是十六进制（不带 #）
                    const labelColor = `#${label.color}`;

                    // 默认文字白色
                    let textColor = "#fff";

                    // 判断亮色背景，自动调整文字颜色为深色，避免看不清
                    const rgb = parseInt(label.color, 16);
                    if ((rgb & 0xff) + ((rgb >> 8) & 0xff) + ((rgb >> 16) & 0xff) > 382) {
                        textColor = "#333";
                    }

                    // 拼接每个标签的 HTML，使用内联背景色
                    labelsHtml += `<span class="issue-label" style="background-color:${labelColor}; color:${textColor}">${label.name}</span>`;
                });
                labelsHtml += `</div>`;
            }

            // =================== 帖子 HTML ===================
            div.innerHTML = `
                <div class="issue-header">
                    <div class="issue-header-left">
                        <img src="${issue.user.avatar_url}" class="issue-avatar" alt="avatar">
                        <div class="issue-title">${issue.title}</div>
                    </div>
                    <div class="issue-time">${new Date(issue.created_at).toLocaleString()}</div>
                </div>

                <!-- 正文内容原样显示，禁止 Markdown -->
                <div class="issue-body">${(issue.body || "").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>

                ${labelsHtml} <!-- 标签显示在正文和评论之间 -->

                <div class="comments-toggle">评论 (${issue.comments}) ▼</div>
                <div class="comments-container"></div>
            `;

            // 将帖子卡片添加到页面容器
            container.appendChild(div);

            // =================== 评论逻辑 ===================
            const toggleEl = div.querySelector(".comments-toggle");      // 评论展开按钮
            const commentsContainer = div.querySelector(".comments-container"); // 评论容器
            let commentsLoaded = false; // 标记是否已加载评论，避免重复请求

            toggleEl.addEventListener("click", async () => {
                // 如果评论已展开，点击收起
                if (commentsContainer.style.display === "block") {
                    commentsContainer.style.display = "none";
                    toggleEl.textContent = `评论 (${issue.comments}) ▼`;
                    return;
                }

                // 展开评论
                commentsContainer.style.display = "block";
                toggleEl.textContent = `评论 (${issue.comments}) ▲`;

                // 如果评论已经加载过，直接显示，不重复请求
                if (commentsLoaded) return;
                commentsLoaded = true;
                commentsContainer.innerHTML = "";

                // 请求该帖子的评论
                const commentsRes = await fetch(issue.comments_url, {
                    headers: { "Accept": "application/vnd.github+json" }
                });
                const comments = await commentsRes.json();

                // 没有评论显示提示
                if (!comments || comments.length === 0) {
                    commentsContainer.innerHTML = "<p>暂无评论</p>";
                    return;
                }

                // 遍历每条评论，生成 HTML
                comments.forEach(c => {
                    const cdiv = document.createElement("div");
                    cdiv.className = "comment";
                    cdiv.innerHTML = `
                        <img src="${c.user.avatar_url}" alt="avatar">
                        <div class="comment-body">
                            <div><span class="author">${c.user.login}</span> <span class="time">${new Date(c.created_at).toLocaleString()}</span></div>
                            <!-- 评论原样显示，禁止 Markdown -->
                            <div class="comment-text">${c.body.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
                        </div>
                    `;
                    commentsContainer.appendChild(cdiv);
                });
            });
        });

    } catch (err) {
        // 捕获错误并显示
        container.innerHTML = `<p style="color:red;text-align:center;">加载失败: ${err.message}</p>`;
    }
}

// 页面加载时执行
loadIssues();
