import React, { useState, useEffect, useRef } from 'react';
import { fileSystem } from '../utils/fileSystem';
import '../styles/TextEditor.css';

interface TextEditorProps {
  filePath: string | null;
}

interface FormattingOptions {
  fontSize: number;
  fontFamily: string;
  textColor: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ filePath }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isPreventingTaskFileDeletion, setIsPreventingTaskFileDeletion] = useState<boolean>(false);
  const [formattingOptions, setFormattingOptions] = useState<FormattingOptions>({
    fontSize: 14,
    fontFamily: 'Courier New',
    textColor: '#FFFFFF'
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Available font families
  const fontFamilies: string[] = [
    'Courier New',
    'Arial',
    'Times New Roman',
    'Helvetica',
    'Georgia',
    'Verdana',
    'Consolas',
    'Monaco',
    'Lucida Console'
  ];

  // Load file content when filePath changes
  useEffect(() => {
    if (!filePath) {
      setContent('');
      setFileName('');
      setIsEdited(false);
      return;
    }

    const loadFileContent = async () => {
      setIsLoading(true);
      setError(null);

      preventTaskFileDeletion();

      // Extract file name from path
      const name = filePath.substring(filePath.lastIndexOf('\\') + 1);
      setFileName(name);

      try {
        const fileContent = await fileSystem.readFile(filePath);
        setContent(fileContent);
        setIsEdited(false);
        console.log(`Successfully loaded file: ${name}`);
      } catch (error) {
        setError('Failed to load file');
        console.error('Failed to load file:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFileContent();
  }, [filePath]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(200, textarea.scrollHeight)}px`;
    }
  }, [content]);

  // Apply formatting options to textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.fontSize = `${formattingOptions.fontSize}px`;
      textarea.style.fontFamily = formattingOptions.fontFamily;
      textarea.style.color = formattingOptions.textColor;
      console.log(`Applied formatting: ${formattingOptions.fontSize}px ${formattingOptions.fontFamily} ${formattingOptions.textColor}`);
    }
  }, [formattingOptions]);

  const preventTaskFileDeletion = () => {
    if (filePath?.includes('tasks.json')) {
      setError('Cannot delete task file');
      setIsPreventingTaskFileDeletion(true);
    }
  };

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsEdited(true);
  };

  // Get selected text and cursor position
  const getSelectionInfo = (): { start: number; end: number; selectedText: string } => {
    const textarea = textareaRef.current;
    if (!textarea) return { start: 0, end: 0, selectedText: '' };
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    return { start, end, selectedText };
  };

  // Insert text at cursor position or replace selection
  const insertTextAtCursor = (textToInsert: string, selectInserted: boolean = false): void => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end } = getSelectionInfo();
    const newContent = content.substring(0, start) + textToInsert + content.substring(end);
    
    setContent(newContent);
    setIsEdited(true);

    setTimeout(() => {
      if (selectInserted) {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + textToInsert.length;
      } else {
        textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
      }
      textarea.focus();
    }, 0);

    console.log(`Inserted text: "${textToInsert}" at position ${start}-${end}`);
  };

  // Format selected text with markdown
  const formatText = (formatType: 'bold' | 'italic' | 'underline' | 'strikethrough'): void => {
    const { start, end, selectedText } = getSelectionInfo();
    
    if (selectedText.length === 0) {
      setError('Please select text to format');
      return;
    }

    let formattedText: string = '';
    
    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`;
        break;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    setIsEdited(true);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = start;
        textareaRef.current.selectionEnd = start + formattedText.length;
        textareaRef.current.focus();
      }
    }, 0);

    console.log(`Applied ${formatType} formatting to: "${selectedText}"`);
  };

  // Handle font family change
  const handleFontFamilyChange = (fontFamily: string): void => {
    setFormattingOptions(previous => ({
      ...previous,
      fontFamily: fontFamily
    }));
    console.log(`Changed font family to: ${fontFamily}`);
  };

  // Handle font size change
  const handleFontSizeChange = (fontSize: number): void => {
    setFormattingOptions(previous => ({
      ...previous,
      fontSize: fontSize
    }));
    console.log(`Changed font size to: ${fontSize}px`);
  };

  // Handle text color change
  const handleTextColorChange = (color: string): void => {
    setFormattingOptions(previous => ({
      ...previous,
      textColor: color
    }));
    console.log(`Changed text color to: ${color}`);
  };

  // Insert common formatting elements
  const insertFormattingElement = (elementType: 'heading' | 'list' | 'link' | 'code'): void => {
    let textToInsert: string = '';
    
    switch (elementType) {
      case 'heading':
        textToInsert = '# Heading\n';
        break;
      case 'list':
        textToInsert = '- List item\n';
        break;
      case 'link':
        textToInsert = '[Link text](URL)';
        break;
      case 'code':
        textToInsert = '```\nCode block\n```\n';
        break;
    }

    insertTextAtCursor(textToInsert, true);
    console.log(`Inserted ${elementType} element`);
  };

  // Handle keyboard shortcuts and special keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (isEdited && !isSaving) {
        handleSave();
      }
      return;
    }

    // Ctrl+B for bold
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      formatText('bold');
      return;
    }

    // Ctrl+I for italic
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      formatText('italic');
      return;
    }

    // Ctrl+U for underline
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      formatText('underline');
      return;
    }

    // Tab handling - insert 2 spaces instead of changing focus
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      setIsEdited(true);

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // Shift+Tab to remove indentation
    if (e.shiftKey && e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const lineStart = content.lastIndexOf('\n', start - 1) + 1;
      const lineText = content.substring(lineStart, start);
      
      if (lineText.startsWith('  ')) {
        const newContent = content.substring(0, lineStart) + 
                          content.substring(lineStart + 2, start) + 
                          content.substring(start);
        setContent(newContent);
        setIsEdited(true);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 2;
        }, 0);
      }
      return;
    }

    // Enter key auto-indentation
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const lineStart = content.lastIndexOf('\n', start - 1) + 1;
      const lineText = content.substring(lineStart, start);
      const indentMatch = lineText.match(/^(\s*)/);
      const currentIndent = indentMatch ? indentMatch[1] : '';
      
      if (currentIndent) {
        e.preventDefault();
        const newContent = content.substring(0, start) + '\n' + currentIndent + content.substring(start);
        setContent(newContent);
        setIsEdited(true);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + currentIndent.length;
        }, 0);
      }
    }
  };

  // Save the file
  const handleSave = async () => {
    if (!filePath) return;
    
    setIsSaving(true);
    setError(null);
    console.log(`Saving file: ${fileName}`);

    try {
      const success = await fileSystem.writeFile(filePath, content);
      
      if (success) {
        setIsEdited(false);
        console.log(`Successfully saved file: ${fileName}`);
      } else {
        setError('Failed to save file');
        console.error(`Failed to save file: ${fileName}`);
      }
    } catch (error) {
      setError('Failed to save file');
      console.error('Failed to save file:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!filePath) return;
    
    setIsDeleting(true);
    setError(null);
    console.log(`Deleting file: ${fileName}`);

    try {
      const success = await fileSystem.delete(filePath);
      
      if (success) {
        setError('File deleted successfully');
        console.log(`Successfully deleted file: ${fileName}`);
        // Note: Consider adding a callback prop to notify parent component
      } else {
        setError('Failed to delete file');
        console.error(`Failed to delete file: ${fileName}`);
      }
    } catch (error) {
      setError('Failed to delete file');
      console.error('Failed to delete file:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get file extension for placeholder text
  const getFileTypeHint = (): string => {
    if (!fileName) return 'text content';
    const extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    
    switch (extension) {
      case 'md':
        return 'markdown content...';
      case 'txt':
        return 'text content...';
      case 'json':
        return 'JSON data...';
      case 'js':
      case 'ts':
        return 'JavaScript/TypeScript code...';
      case 'css':
        return 'CSS styles...';
      case 'html':
        return 'HTML markup...';
      default:
        return 'file content...';
    }
  };

  if (!filePath) {
    return (
      <div className="text-editor-empty">
        <p>Select a file to edit</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-editor-loading">
        <p>Loading file...</p>
      </div>
    );
  }

  return (
    <div className="text-editor">
      <div className="text-editor-header">
        <div className="file-info">
          <span className="file-name">{fileName}</span>
          {isEdited && <span className="edited-indicator">*</span>}
        </div>
        <div className="editor-actions">
          <button 
            className="delete-button" 
            onClick={handleDelete}
            disabled={isSaving || isPreventingTaskFileDeletion}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={!isEdited || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

        <div className="formatting-toolbar">
          <div className="formatting-section">
            <label className="formatting-label">Text Style:</label>
            <button 
              className="format-button bold"
              onClick={() => formatText('bold')}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button 
              className="format-button italic"
              onClick={() => formatText('italic')}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button 
              className="format-button underline"
              onClick={() => formatText('underline')}
              title="Underline (Ctrl+U)"
            >
              <u>U</u>
            </button>
            <button 
              className="format-button strikethrough"
              onClick={() => formatText('strikethrough')}
              title="Strikethrough"
            >
              <s>S</s>
            </button>
          </div>

          <div className="formatting-section">
            <label className="formatting-label">Font:</label>
            <select 
              className="font-family-select"
              value={formattingOptions.fontFamily}
              onChange={(e) => handleFontFamilyChange(e.target.value)}
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          <div className="formatting-section">
            <label className="formatting-label">Size:</label>
            <input 
              type="range"
              className="font-size-slider"
              min="10"
              max="24"
              value={formattingOptions.fontSize}
              onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
            />
            <span className="font-size-display">{formattingOptions.fontSize}px</span>
          </div>

          <div className="formatting-section">
            <label className="formatting-label">Color:</label>
            <input 
              type="color"
              className="color-picker"
              value={formattingOptions.textColor}
              onChange={(e) => handleTextColorChange(e.target.value)}
            />
          </div>

          <div className="formatting-section">
            <label className="formatting-label">Insert:</label>
            <button 
              className="insert-button"
              onClick={() => insertFormattingElement('heading')}
              title="Insert heading"
            >
              H1
            </button>
            <button 
              className="insert-button"
              onClick={() => insertFormattingElement('list')}
              title="Insert list"
            >
              •
            </button>
            <button 
              className="insert-button"
              onClick={() => insertFormattingElement('link')}
              title="Insert link"
            >
              🔗
            </button>
            <button 
              className="insert-button"
              onClick={() => insertFormattingElement('code')}
              title="Insert code block"
            >
              &lt;/&gt;
            </button>
          </div>
        </div>

      {error && <div className="error-message">{error}</div>}

      <div className="editor-container">
        <div className="editor-info">
        </div>
        <textarea
          ref={textareaRef}
          className="text-content"
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          spellCheck={true}
          placeholder={`Start typing ${getFileTypeHint()}`}
          aria-label={`Text editor for ${fileName}`}
          aria-describedby="editor-info"
          wrap="soft"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
        />
      </div>
    </div>
  );
};

export default TextEditor; 