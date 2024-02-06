import '@wangeditor/editor/dist/css/style.css'; // 引入 css
import { useState, useEffect } from 'react';
import { Editor } from '@wangeditor/editor-for-react';
import { IDomEditor, IEditorConfig, Boot } from '@wangeditor/editor';
import markdownModule from '@wangeditor/plugin-md';

Boot.registerModule(markdownModule);
function MyEditor({ value, onChange }: any) {
  const [editor, setEditor] = useState<IDomEditor | null>(null);

  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入内容...',
  };

  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  return (
    <div style={{ border: '1px solid #ccc', zIndex: 100, width: '80%' }}>
      <Editor
        defaultConfig={editorConfig}
        value={value}
        onCreated={setEditor}
        onChange={(editor) => {
          onChange(editor.getHtml());
        }}
        mode="default"
        style={{ overflowY: 'hidden', height: 120, maxHeight: 120 }}
      />
    </div>
  );
}

export default MyEditor;
