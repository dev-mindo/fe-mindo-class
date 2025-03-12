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
  getEditorContent?: string
};

const QuillEditor: React.FC<QuillEditorProps> = ({  
  placeholder = "Write something...",
  theme = "snow",
  modules = {},
  formats = [],
  className = "",  
  setEditorContent = () => {},
  getEditorContent = ""
}) => {
  const [content, setContent] = useState<string>(getEditorContent);

  const handleChange = (value: string) => {
    setContent(value);
    setEditorContent?.(value)
  };

  return (
    <div className="w-full h-full flex flex-col">
      <ReactQuill          
        style={{ height: "100%" }}
        value={content}
        onChange={handleChange}
        className={` ${className}`}
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
