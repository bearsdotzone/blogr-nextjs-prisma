// pages/p/[id].tsx

import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import ReactMarkdown from 'react-markdown';
import Router from 'next/router';
import Layout from '../../components/Layout';
import { PostProps } from '../../components/Post';
import { useSession, getSession } from 'next-auth/react';
import prisma from '../../lib/prisma';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const post = await prisma.post.findUnique({
    where: {
      id: String(params?.id),
    },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });
  return {
    props: post,
  };
};

const Post: React.FC<PostProps> = (props) => {

  const [title, setTitle] = useState(props.title);
  const [content, setContent] = useState(props.content);
  const { data: session, status } = useSession();
  if (status === 'loading') {
    return <div>Authenticating ...</div>;
  }
  const userHasValidSession = Boolean(session);
  const postBelongsToUser = session?.user?.email === props.author?.email;
  //   let title = props.title;
  //   if (!props.published) {
  //     title = `${title} (Draft)`;
  //   }

  if (!postBelongsToUser || !userHasValidSession) {
    return (
      <Layout>
        <h1>Error - Authentication</h1>
        <div>You are not authorized to view this page.</div>
      </Layout>
    );
  }

  if (props.published) {
    return (
      <Layout>
        <h1>Error - Published</h1>
        <div>Unpublish a post before editing it.</div>
      </Layout>
    );
  }


  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      if (userHasValidSession && postBelongsToUser && !props.published) {
        const body = { title, content };
        await fetch(`/api/edit/${props.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        await Router.push('/my-posts');
      }
      // TODO: Explain this failure, eg one of those variables changed in between loading the page and now.
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <div>
        <form onSubmit={submitData}>
          <input
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            type="text"
            value={title}
          />
          <textarea
            cols={50}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            rows={8}
            value={content}
          />
          <input disabled={!content || !title} type="submit" value="Save Draft" />
          <a className="back" href="#" onClick={() => Router.push('/my-posts')}>
            or Cancel
          </a>
        </form>
        {/* {!props.published && userHasValidSession && postBelongsToUser && (
          <button onClick={() => publishPost(props.id)}>Publish</button>
        )}
        {props.published && userHasValidSession && postBelongsToUser && (
          <button onClick={() => unpublishPost(props.id)}>Unpublish</button>
        )}
        {userHasValidSession && postBelongsToUser && (
          <button onClick={() => deletePost(props.id)}>Delete</button>
        )} */}
      </div>
      <style jsx>{`
        .page {
          background: var(--geist-background);
          padding: 2rem;
        }

        .actions {
          margin-top: 2rem;
        }

        button {
          background: #ececec;
          border: 0;
          border-radius: 0.125rem;
          padding: 1rem 2rem;
        }

        button + button {
          margin-left: 1rem;
        }

        input[type='text'],
        textarea {
          width: 100%;
          padding: 0.5rem;
          margin: 0.5rem 0;
          border-radius: 0.25rem;
          border: 0.125rem solid rgba(0, 0, 0, 0.2);
        }

        input[type='submit'] {
          background: #ececec;
          border: 0;
          padding: 1rem 2rem;
        }

        .back {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  );
};

export default Post;
