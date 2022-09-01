// pages/api/post/[id].ts

import prisma from '../../../lib/prisma';

// edit /api/edit/:id
export default async function handle(req, res) {
    const postId = req.query.id;
    const { title, content } = req.body;
    if (req.method === 'PATCH') {
        const post = await prisma.post.update({
            where: { id: postId },
            data: {
                title: title,
                content: content
            }
        });
        res.json(post);
    } else {
        throw new Error(
            `The HTTP ${req.method} method is not supported at this route.`,
        );
    }
}
