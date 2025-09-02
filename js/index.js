const owner = "hshmeng";
const repo = "hshmeng-forum";

async function loadIssues() {
    const container = document.getElementById("issues-container");

    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`, {
            headers: { "Accept": "application/vnd.github+json" }
        });
        if (!res.ok) throw new Error(`API 请求失败: ${res.status}`);
        const issues = await res.json();

        if (!issues || issues.length === 0) {
            container.innerHTML = "<p style='text-align:center'>暂无帖子</p>";
            return;
        }

        issues.forEach(issue => {
            const div = document.createElement("div");
            div.className = "issue-card";

            // 生成标签 HTML
            let labelsHtml = "";
            if (issue.labels && issue.labels.length > 0) {
                labelsHtml = `<div class="issue-labels">`;
                issue.labels.forEach(label => {
                    // 使用 GitHub API 返回的 color
                    const labelColor = `#${label.color}`;
                    // 如果颜色过浅，可以调整文字颜色为黑色
                    let textColor = "#fff";
                    // 判断亮色背景，简单阈值处理
                    const rgb = parseInt(label.color, 16);
                    if ((rgb & 0xff) + ((rgb >> 8) & 0xff) + ((rgb >> 16) & 0xff) > 382) { // 简单亮色判断
                        textColor = "#333";
                    }

                    labelsHtml += `<span class="issue-label" style="background-color:${labelColor}; color:${textColor}">${label.name}</span>`;
                });
                labelsHtml += `</div>`;
            }

            div.innerHTML = `
        <div class="issue-header">
          <div class="issue-header-left">
            <img src="${issue.user.avatar_url}" class="issue-avatar" alt="avatar">
            <div class="issue-title">${issue.title}</div>
          </div>
          <div class="issue-time">${new Date(issue.created_at).toLocaleString()}</div>
        </div>
        <div class="issue-body">${issue.body || ""}</div>
        ${labelsHtml} <!-- 标签显示在评论上方 -->
        <div class="comments-toggle">评论 (${issue.comments}) ▼</div>
        <div class="comments-container"></div>
      `;

            container.appendChild(div);

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
        container.innerHTML = `<p style="color:red;text-align:center;">加载失败: ${err.message}</p>`;
    }
}

// 加载帖子
loadIssues();