import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  projectId?: string;
  projectTitle?: string;
}

const WhatsAppButton = ({ projectId, projectTitle }: WhatsAppButtonProps) => {
  const phoneNumber = '5593999999999'; // Replace with actual number
  
  let message = 'Olá! Gostaria de mais informações sobre os projetos de casas.';
  
  if (projectId && projectTitle) {
    message = `Olá! Gostaria de mais informações sobre o projeto: ${projectTitle} (Código: ${projectId})`;
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};

export default WhatsAppButton;
