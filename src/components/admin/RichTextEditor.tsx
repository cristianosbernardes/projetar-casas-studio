import { useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const quillRef = useRef<ReactQuill>(null);
    const { toast } = useToast();

    // Custom Image Handler
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
                // 1. Upload to Supabase
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                // Show toast for feedback
                toast({ title: 'Enviando imagem...', description: 'Aguarde o upload.' });

                const { error: uploadError } = await supabase.storage
                    .from('project-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // 2. Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('project-images')
                    .getPublicUrl(filePath);

                // 3. Insert into Editor
                const quill = quillRef.current?.getEditor();
                if (quill) {
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', publicUrl);
                    quill.setSelection(range.index + 1, 0); // Move cursor forward

                    toast({ title: 'Sucesso!', description: 'Imagem inserida com sucesso.' });
                }

            } catch (error: any) {
                console.error('Error uploading image:', error);
                toast({
                    title: 'Erro no upload',
                    description: error.message || 'Não foi possível enviar a imagem.',
                    variant: 'destructive'
                });
            }
        };
    };

    // Modules configuration (Memoized)
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), []);

    return (
        <div className="bg-white rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <style>
                {`
                    .ql-container {
                        min-height: 200px;
                        font-size: 16px;
                        font-family: inherit;
                    }
                    .ql-editor {
                        min-height: 200px;
                    }
                    .ql-toolbar {
                        border-bottom: 1px solid #e2e8f0 !important;
                        background: #f8fafc;
                        border-top-left-radius: calc(var(--radius) - 1px);
                        border-top-right-radius: calc(var(--radius) - 1px);
                    }
                    .ql-container.ql-snow {
                        border: none !important;
                    }
                    .ql-toolbar.ql-snow {
                        border: none !important;
                        border-bottom: 1px solid #e2e8f0 !important;
                    }
                `}
            </style>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder || 'Descreva o projeto detalhadamente...'}
            />
        </div>
    );
}
