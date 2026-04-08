import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const Terms = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/terms.md')
      .then(res => res.text())
      .then(text => setContent(text));
  }, []);

  return (
    <div className="min-h-screen bg-manchester-black text-white px-6 py-20">
      <div className="max-w-4xl mx-auto card-premium p-8">
        <div className="prose prose-invert max-w-none">
          {React.createElement(ReactMarkdown as any, null, content)}
        </div>
      </div>
    </div>
  );
};

export default Terms;