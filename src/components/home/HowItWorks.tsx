import { Ruler, FileCheck, Download, Phone } from 'lucide-react';

const steps = [
  {
    icon: Ruler,
    title: 'Meça seu Terreno',
    description: 'Verifique as dimensões do seu terreno (frente x fundo) para encontrar projetos compatíveis.',
  },
  {
    icon: FileCheck,
    title: 'Escolha seu Projeto',
    description: 'Navegue pelos nossos projetos e encontre o que melhor atende às suas necessidades.',
  },
  {
    icon: Download,
    title: 'Receba os Arquivos',
    description: 'Após a compra, você recebe todos os arquivos técnicos por e-mail em formato PDF.',
  },
  {
    icon: Phone,
    title: 'Suporte Completo',
    description: 'Nossa equipe está pronta para tirar suas dúvidas e auxiliar no que precisar.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como Funciona
          </h2>
          <p className="text-muted-foreground text-lg">
            Adquirir sua planta de casa pronta é simples, rápido e seguro
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connector line (not on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-border" />
              )}
              
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Icon */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <step.icon className="h-10 w-10" />
                  </div>
                  {/* Step number */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
