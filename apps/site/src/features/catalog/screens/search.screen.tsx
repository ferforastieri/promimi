import { Form, Link } from "react-router";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageLayout,
} from "@promimi/design-system";
import { Footer, Header, OfferCard } from "../../shell/components";
import { apiOffers } from "../server";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const min = url.searchParams.get("min") ?? "";
  const max = url.searchParams.get("max") ?? "";
  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (min) query.set("min", min);
  if (max) query.set("max", max);
  return {
    q,
    min,
    max,
    offers: await apiOffers(url.origin, query.size ? `?${query}` : ""),
  };
}

export default function Search({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof loader>>;
}) {
  return (
    <>
      <Header />
      <PageLayout>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-ink/42">
              Catálogo
            </p>
            <h1 className="mt-1 text-[clamp(30px,4vw,42px)] font-semibold tracking-[-.055em]">
              {loaderData.q ? (
                <>Resultados para “{loaderData.q}”</>
              ) : (
                "Ofertas publicadas"
              )}
            </h1>
          </div>
          <span className="text-sm text-ink/50">
            {loaderData.offers.length} ofertas
          </span>
        </div>
        <Card className="my-6 p-4">
          <Form
            method="get"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(2,1fr)_auto]"
          >
            <Field
              label="O que você procura"
              className="sm:col-span-2 lg:col-span-1"
            >
              <Input
                name="q"
                defaultValue={loaderData.q}
                placeholder="Ex.: fone, notebook, air fryer"
              />
            </Field>
            <Field label="Preço mínimo">
              <Input
                name="min"
                type="number"
                min="0"
                defaultValue={loaderData.min}
                placeholder="R$ 0"
              />
            </Field>
            <Field label="Preço máximo">
              <Input
                name="max"
                type="number"
                min="0"
                defaultValue={loaderData.max}
                placeholder="Sem limite"
              />
            </Field>
            <div className="flex items-end">
              <Button className="w-full" type="submit">
                Aplicar filtros
              </Button>
            </div>
          </Form>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loaderData.offers.length ? (
            loaderData.offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState
                title="Nenhuma oferta encontrada"
                description="Tente buscar outro produto ou remover os filtros."
                action={
                  <Link
                    className="text-sm font-semibold text-brand"
                    to="/buscar"
                  >
                    Limpar filtros
                  </Link>
                }
              />
            </div>
          )}
        </div>
      </PageLayout>
      <Footer />
    </>
  );
}
