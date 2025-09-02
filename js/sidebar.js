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
        { text: '如何评论', href: '#how-to-comment' },
        { text: '删除评论', href: '#delete-comment' },
        { text: '如何获得标签和表情', href: '#tags-emojis' }
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
