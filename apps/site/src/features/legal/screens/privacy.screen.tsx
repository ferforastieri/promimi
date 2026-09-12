import { Card, PageLayout, PanelHeader } from "@promimi/design-system";
import { PublicFooter, PublicHeader } from "@promimi/design-system";
export const meta = () => [{ title: "Privacidade — Promimi" }];
export default function Privacy() {
  return (
    <>
      <PublicHeader />
      <PageLayout width="reading">
        <Card className="p-6 sm:p-8">
          <PanelHeader eyebrow="Transparência" title="Privacidade" />
          <p className="mt-6 text-sm leading-7 text-ink/65">
            O Promimi usa os dados mínimos para criar sua conta, manter
            favoritos e moderar comentários. Links de saída podem registrar
            origem e horário do clique para medir a utilidade das ofertas.
          </p>
          <h2 className="mt-8 text-lg font-semibold tracking-[-.025em]">
            Seus controles
          </h2>
          <p className="mt-2 text-sm leading-7 text-ink/65">
            Você pode solicitar acesso, correção ou exclusão da conta. A
            exclusão anonimiza seus dados de perfil e impede novo acesso;
            registros necessários para segurança e obrigações legais podem ser
            preservados pelo prazo aplicável.
          </p>
          <h2 className="mt-8 text-lg font-semibold tracking-[-.025em]">
            Links e afiliados
          </h2>
          <p className="mt-2 text-sm leading-7 text-ink/65">
            Alguns links são afiliados e podem gerar comissão sem custo
            adicional. Não vendemos seus dados pessoais a anunciantes.
          </p>
        </Card>
      </PageLayout>
      <PublicFooter />
    </>
  );
}
