// 创建右侧固定导航栏
(function() {
    // 创建 sidebar 容器
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar';

    // 导航标题
    const title = document.createElement('h3');
    title.textContent = '导航';
    sidebar.appendChild(title);

    // 链接列表
    const ul = document.createElement('ul');

    const links = [
        { text: '如何注册和登录', href: 'html/ZhuCeDengLu.html' },
        { text: '如何发布和评论', href: 'html/FaBuPingLun.html' },
        { text: '删除评论的方法', href: '#delete-comment' }
    ];

    links.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = link.text;
        a.href = link.href;
        li.appendChild(a);
        ul.appendChild(li);
    });

    sidebar.appendChild(ul);

    // 插入到 body
    document.body.appendChild(sidebar);
})();
