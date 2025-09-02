const owner = "hshmeng";             // 仓库用户名
const repo = "hshmeng-forum";        // 仓库名

async function loadIssues() {
    const container = document.getElementById("issues-container");

    try {
        // 拉取仓库所有开放的 Issue
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`, {
            headers: { "Accept": "application/vnd.github+json" }
        });
        if (!res.ok) throw new Error(`API 请求失败: ${res.status}`);
        const issues = await res.json();

        if (!issues || issues.length === 0) {
            container.innerHTML = "<p style='text-align:center'>暂无帖子</p>";
            return;
        }

        // 遍历每个 Issue，生成帖子卡片
        issues.forEach(issue => {
            const div = document.createElement("div");
            div.className = "issue-card";

            // 帖子 HTML 结构
            div.innerHTML = `
        <div class="issue-header">
          <div class="issue-header-left">
            <img src="${issue.user.avatar_url}" class="issue-avatar" alt="avatar">
            <div class="issue-title">${issue.title}</div>
          </div>
          <div class="issue-time">${new Date(issue.created_at).toLocaleString()}</div>
        </div>
        <div class="issue-body">${issue.body || ""}</div>
        <div class="comments-toggle">评论 (${issue.comments}) ▼</div>
        <div class="comments-container"></div>
      `;
            container.appendChild(div);

            // 获取评论按钮和评论容器
            const toggleEl = div.querySelector(".comments-toggle");
            const commentsContainer = div.querySelector(".comments-container");
            let commentsLoaded = false;   // 标记评论是否已加载

            // 点击评论按钮显示/隐藏评论
            toggleEl.addEventListener("click", async () => {
                if (commentsContainer.style.display === "block") {
                    commentsContainer.style.display = "none";
                    toggleEl.textContent = `评论 (${issue.comments}) ▼`;
                    return;
                }
                commentsContainer.style.display = "block";
                toggleEl.textContent = `评论 (${issue.comments}) ▲`;

                // 如果评论已经加载过就不重复拉取
                if (commentsLoaded) return;
                commentsLoaded = true;
                commentsContainer.innerHTML = "";

                // 拉取评论
                const commentsRes = await fetch(issue.comments_url, {
                    headers: { "Accept": "application/vnd.github+json" }
                });
                const comments = await commentsRes.json();
                if (!comments || comments.length === 0) {
                    commentsContainer.innerHTML = "<p>暂无评论</p>";
                    return;
                }

                // 遍历评论生成 HTML
                comments.forEach(c => {
                    const cdiv = document.createElement("div");
                    cdiv.className = "comment";
                    cdiv.innerHTML = `
            <img src="${c.user.avatar_url}" alt="avatar">
            <div class="comment-body">
              <div><span class="author">${c.user.login}</span> <span class="time">${new Date(c.created_at).toLocaleString()}</span></div>
              <div class="comment-text">${c.body.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
            </div>
          `;
                    commentsContainer.appendChild(cdiv);
                });
            });
        });

    } catch (err) {
        // 出错时显示错误信息
        container.innerHTML = `<p style="color:red;text-align:center;">加载失败: ${err.message}</p>`;
    }
}

// 页面加载后执行
loadIssues();