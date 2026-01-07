import { CheckCircle, Building, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const benefits = [
  'Projetos desenvolvidos por arquitetos experientes',
  'Plantas detalhadas prontas para construção',
  'Documentação completa incluída',
  'Suporte técnico via WhatsApp',
  'Entrega imediata após pagamento',
  'Possibilidade de modificações personalizadas',
];

const stats = [
  { icon: Building, value: '100+', label: 'Projetos' },
  { icon: Users, value: '2000+', label: 'Clientes Satisfeitos' },
  { icon: Award, value: '10+', label: 'Anos de Experiência' },
];

const AboutSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div>
              <p className="text-primary font-semibold mb-2">Sobre Nós</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Transformando Sonhos em Projetos Reais
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                A Projetar Casas nasceu com o objetivo de democratizar o acesso a 
                projetos arquitetônicos de qualidade. Com mais de uma década de experiência, 
                oferecemos plantas de casas prontas que combinam funcionalidade, estética e 
                preços acessíveis.
              </p>
            </div>

            {/* Benefits list */}
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            <Link to="/projetos">
              <Button size="lg">
                Explorar Projetos
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 text-center space-y-3 border border-border"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary mx-auto flex items-center justify-center">
                  <stat.icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
