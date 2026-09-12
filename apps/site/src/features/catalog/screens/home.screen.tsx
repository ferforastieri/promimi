import {
  CommerceCollection,
  CommerceHero,
  CommerceOfferCard,
  CommerceOfferGrid,
  EmptyState,
  PageLayout,
  PublicFooter,
  PublicHeader,
} from "@promimi/design-system";
import { apiOffers } from "../server";
import { toCommerceOfferCardProps } from "../presenter";

export const meta = () => [
  { title: "Promimi — promoções que valem a pena" },
  {
    name: "description",
    content: "Ofertas verificadas, cupons e preços em reais.",
  },
];
export async function loader({ request }: { request: Request }) {
  return { offers: await apiOffers(new URL(request.url).origin) };
}

export default function Home({
  loaderData,
}: {
  loaderData: { offers: Awaited<ReturnType<typeof apiOffers>> };
}) {
  const offers = loaderData.offers;
  return (
    <>
      <PublicHeader />
      <PageLayout>
        <CommerceHero offerCount={offers.length} />
        <CommerceCollection>
          {offers.length ? (
            <CommerceOfferGrid>
              {offers.map((offer) => (
                <CommerceOfferCard key={offer.id} {...toCommerceOfferCardProps(offer)} />
              ))}
            </CommerceOfferGrid>
          ) : (
            <EmptyState
              title="Nenhuma oferta disponível"
              description="Assim que uma oferta for publicada pela equipe, ela aparecerá aqui."
            />
          )}
        </CommerceCollection>
      </PageLayout>
      <PublicFooter />
    </>
  );
}
