#!/bin/bash

# Script para agregar export const runtime = 'nodejs' a todas las rutas de API que usen Prisma

API_FILES=(
  "app/api/reviews/route.ts"
  "app/api/stripe/account-requirements/route.ts"
  "app/api/stripe/check-account/route.ts"
  "app/api/stats/route.ts"
  "app/api/stripe/create-connected-account/route.ts"
  "app/api/stripe/create-payment-intent/route.ts"
  "app/api/stripe/refund-payment/route.ts"
  "app/api/stripe/verify-onboarding/route.ts"
  "app/api/debug/users/route.ts"
  "app/api/reviews/[reviewId]/response/route.ts"
  "app/api/dev/create-test-user/route.ts"
  "app/api/webhooks/mercadopago/route.ts"
  "app/api/stripe/capture-payment/route.ts"
  "app/api/verification/face-match-simple/route.ts"
  "app/api/verification/status/route.ts"
  "app/api/dashboard/reviews/route.ts"
  "app/api/dashboard/notifications/route.ts"
  "app/api/dashboard/expenses/route.ts"
  "app/api/users/[userId]/route.ts"
  "app/api/dashboard/sales/route.ts"
  "app/api/verification/identity/route.ts"
)

for file in "${API_FILES[@]}"; do
  if [ -f "$file" ]; then
    # Verificar si ya tiene la configuración
    if ! grep -q "export const runtime" "$file"; then
      echo "Agregando runtime a $file"
      echo -e "\n// Forzar Node.js runtime en lugar de Edge runtime\nexport const runtime = 'nodejs';" >> "$file"
    else
      echo "✓ $file ya tiene la configuración de runtime"
    fi
  else
    echo "⚠ Archivo no encontrado: $file"
  fi
done

echo "✅ Proceso completado"
