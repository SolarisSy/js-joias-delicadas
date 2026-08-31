#!/bin/bash
# ===========================================================
# PINS PARA O PINTEREST — imagens 1000x1500 (2:3)
#
# O Pinterest entrega muito menos pin quadrado ou horizontal.
# Este script converte as fotos da loja para o formato vertical
# que a plataforma pede, com fundo branco no lugar das bordas.
#
# Uso:  bash tools/gerar-pins.sh [quantidade por seção]
#       (padrão: 4 de cada seção → 20 pins, uma pauta de 20 dias)
#
# Depende do sips, que já vem no macOS. Por isso fica fora do
# deploy, que roda em Linux.
# ===========================================================
set -e
cd "$(dirname "$0")/.."

POR_SECAO=${1:-4}
SAIDA=artes/pins
mkdir -p "$SAIDA"
rm -f "$SAIDA"/*.jpg

total=0
for secao in anel brinco argola colar pulseira conjunto; do
  n=0
  # -alt é o segundo ângulo da mesma peça: não vira pin separado
  for arquivo in imagens/"$secao"*.png; do
    [ -e "$arquivo" ] || continue
    case "$arquivo" in *-alt.png) continue;; esac
    [ "$n" -ge "$POR_SECAO" ] && break
    n=$((n + 1)); total=$((total + 1))
    nome=$(basename "$arquivo" .png | tr ' ' '-')
    sips -s format jpeg -s formatOptions 85 \
         -Z 1500 -p 1500 1000 --padColor FFFFFF \
         "$arquivo" --out "$SAIDA/$nome.jpg" >/dev/null
  done
done

echo "$total pin(s) 1000x1500 em $SAIDA/"
echo "Título e descrição de cada peça estão em posts.md."
