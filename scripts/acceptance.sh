#!/usr/bin/env bash
set -euo pipefail

# Requires a migrated Promimi stack. The administrator is intentionally supplied
# by the host so no test password is committed to the repository.
api_base=${API_URL:-http://localhost:3001}/api/v1
site_base=${APP_URL:-http://localhost:3000}
: "${ACCEPTANCE_ADMIN_EMAIL:?Defina ACCEPTANCE_ADMIN_EMAIL para um administrador de teste.}"
: "${ACCEPTANCE_ADMIN_PASSWORD:?Defina ACCEPTANCE_ADMIN_PASSWORD para o administrador de teste.}"

json_get() {
  node -e 'let value=JSON.parse(require("fs").readFileSync(0,"utf8")); for (const part of process.argv[1].split(".")) value=value?.[part]; if (value === undefined) process.exit(2); process.stdout.write(typeof value === "string" ? value : JSON.stringify(value));' "$1"
}

json_body() {
  node -e 'const [email,password,name]=process.argv.slice(1); process.stdout.write(JSON.stringify({email,password,name}));' "$@"
}

request() {
  curl --fail-with-body --silent --show-error "$@"
}

visitor_cookie=$(mktemp)
admin_cookie=$(mktemp)
trap 'rm "$visitor_cookie" "$admin_cookie"' EXIT

contains() {
  [[ "$1" == *"$2"* ]]
}

echo "1/8: healthcheck e páginas públicas"
health=$(request "$api_base/health")
test "$(printf '%s' "$health" | json_get ok)" = true
home=$(request "$site_base/")
search=$(request "$site_base/buscar")
privacy=$(request "$site_base/privacidade")
contains "$home" "Preço baixo"
contains "$search" "Ofertas"
contains "$privacy" "Privacidade"

echo "2/8: catálogo e metadados da oferta"
stores=$(request "$api_base/stores")
categories=$(request "$api_base/categories")
store_id=$(printf '%s' "$stores" | json_get 'data.0.id')
category_id=$(printf '%s' "$categories" | json_get 'data.0.id')
offers=$(request "$api_base/offers")
printf '%s' "$offers" | json_get data >/dev/null

echo "3/8: visitante registra, favorita e comenta"
visitor_email="acceptance-$(date +%s)-$RANDOM@example.test"
visitor=$(json_body "$visitor_email" 'Senha-de-visitante-aceitacao' 'Visitante de aceitação' | request -c "$visitor_cookie" -X POST "$api_base/auth/register" -H 'content-type: application/json' -H "origin: $site_base" --data-binary @-)
test "$(printf '%s' "$visitor" | json_get user.role)" = VISITOR
grep -q 'promimi_session' "$visitor_cookie"

echo "4/8: visitante não acessa publicação administrativa"
status=$(curl --silent --output /dev/null --write-out '%{http_code}' -b "$visitor_cookie" -X POST "$api_base/admin/offers" -H 'content-type: application/json' -H "origin: $site_base" --data '{"title":"Oferta que visitante não pode publicar","storeId":"00000000-0000-0000-0000-000000000000","currentPrice":10,"affiliateUrl":"https://example.test"}')
test "$status" = 403

echo "5/8: equipe autentica e cadastra oferta manual"
admin=$(json_body "$ACCEPTANCE_ADMIN_EMAIL" "$ACCEPTANCE_ADMIN_PASSWORD" '' | request -c "$admin_cookie" -X POST "$api_base/auth/login" -H 'content-type: application/json' -H "origin: $site_base" --data-binary @-)
test "$(printf '%s' "$admin" | json_get user.role)" = ADMIN
grep -q 'promimi_session' "$admin_cookie"
offer_payload=$(node -e 'const [storeId,categoryId]=process.argv.slice(1); console.log(JSON.stringify({title:"Oferta de aceitação Promimi",storeId,categoryId,currentPrice:99.9,originalPrice:149.9,couponCode:"ACEITA10",affiliateUrl:"https://example.test/acceptance",status:"PUBLISHED"}))' "$store_id" "$category_id")
offer=$(printf '%s' "$offer_payload" | request -b "$admin_cookie" -X POST "$api_base/admin/offers" -H 'content-type: application/json' -H "origin: $site_base" --data-binary @-)
offer_id=$(printf '%s' "$offer" | json_get data.id)
offer_slug=$(printf '%s' "$offer" | json_get data.slug)

echo "6/8: oferta publicada permite favorito, comentário, denúncia e redirecionamento rastreável"
favorite=$(request -b "$visitor_cookie" -X POST "$api_base/offers/$offer_id/favorite" -H "origin: $site_base")
test "$(printf '%s' "$favorite" | json_get ok)" = true
comment=$(printf '%s' '{"body":"Comentário de aceitação útil e respeitoso."}' | request -b "$visitor_cookie" -X POST "$api_base/offers/$offer_id/comments" -H 'content-type: application/json' -H "origin: $site_base" --data-binary @-)
comment_id=$(printf '%s' "$comment" | json_get data.id)
report=$(printf '%s' '{"reason":"Teste de denúncia para moderação"}' | request -b "$visitor_cookie" -X POST "$api_base/comments/$comment_id/report" -H 'content-type: application/json' -H "origin: $site_base" --data-binary @-)
test "$(printf '%s' "$report" | json_get ok)" = true
published=$(request "$api_base/offers/$offer_slug")
test "$(printf '%s' "$published" | json_get id)" = "$offer_id"
offer_page=$(request "$site_base/oferta/$offer_slug")
contains "$offer_page" "Oferta de aceitação Promimi"
redirect_status=$(curl --silent --output /dev/null --write-out '%{http_code}' "$api_base/offers/$offer_id/go?source=acceptance")
test "$redirect_status" = 302

echo "7/8: painel expira a oferta"
expired=$(printf '%s' '{"status":"EXPIRED"}' | request -b "$admin_cookie" -X PATCH "$api_base/admin/offers/$offer_id" -H 'content-type: application/json' -H "origin: $site_base" --data-binary @-)
test "$(printf '%s' "$expired" | json_get data.status)" = EXPIRED
expired_status=$(curl --silent --output /dev/null --write-out '%{http_code}' "$api_base/offers/$offer_slug")
test "$expired_status" = 404

echo "8/8: recuperação de senha não enumera contas"
password_reset=$(printf '%s' "$(node -e 'console.log(JSON.stringify({email:process.argv[1]}))' "$visitor_email")" | request -X POST "$api_base/auth/request-password-reset" -H 'content-type: application/json' --data-binary @-)
test "$(printf '%s' "$password_reset" | json_get ok)" = true
echo "Acceptance checks passed: catálogo, papéis, oferta manual, favoritos, comentários, denúncia, rastreamento e expiração."
