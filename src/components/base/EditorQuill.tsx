import React, { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

type QuillEditorProps = {
  placeholder?: string;
  theme?: string;
  modules?: object;
  formats?: string[];
  className?: string;
  setEditorContent?: (content: string) => void
};

const QuillEditor: React.FC<QuillEditorProps> = ({  
  placeholder = "Write something...",
  theme = "snow",
  modules = {},
  formats = [],
  className = "",  
  setEditorContent = () => {}
}) => {
  const [content, setContent] = useState<string>("");

  const handleChange = (value: string) => {
    setContent(value);
    setEditorContent?.(value)
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <ReactQuill    
        value={content}
        onChange={handleChange}
        className={className}
        placeholder={placeholder}
        theme={theme}
        modules={modules}
        formats={formats}
      />
      {/* <div className="mt-4 border p-4">
        <h2 className="text-xl font-bold mb-2">Preview:</h2>
        <div dangerouslySetInnerHTML={{ __html: content }}></div>
      </div> */}
    </div>
  );
};

export default QuillEditor;
