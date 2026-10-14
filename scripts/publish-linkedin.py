#!/usr/bin/env python3
"""
Publicador oficial de LinkedIn para P154 - Brújula IA Educación Superior
Soporta subida de múltiples imágenes (capturas en alta resolución) y texto formateado.
"""

import os
import sys
import json
from pathlib import Path
import requests

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Rutas deterministas
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = Path(r"C:\Users\evega\OneDrive\Documents\Obsidian\MyWorld\2 - Project\P137 - Teletrabajo y Compras Publicas 4D\.env")
CAPTURAS_DIR = BASE_DIR / "capturas_linkedin"

def load_credentials():
    config = {}
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                config[k.strip()] = v.strip()
    return config

def get_author_urn(token: str) -> str:
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get("https://api.linkedin.com/v2/userinfo", headers=headers, timeout=10)
    if r.status_code == 200:
        sub = r.json().get("sub")
        if sub:
            return f"urn:li:person:{sub}"
    return "urn:li:person:Q1DxAo8-Dq"

def upload_image_asset(token: str, author_urn: str, image_path: Path, title: str) -> str:
    """Registra y sube una imagen a LinkedIn Digital Media Asset."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }

    register_payload = {
        "registerUploadRequest": {
            "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
            "owner": author_urn,
            "serviceRelationships": [
                {
                    "relationshipType": "OWNER",
                    "identifier": "urn:li:userGeneratedContent"
                }
            ]
        }
    }

    reg_resp = requests.post(
        "https://api.linkedin.com/v2/assets?action=registerUpload",
        headers=headers,
        json=register_payload,
        timeout=15
    )

    if reg_resp.status_code != 200:
        raise RuntimeError(f"Error registrando subida para {image_path.name} (HTTP {reg_resp.status_code}): {reg_resp.text}")

    reg_data = reg_resp.json()["value"]
    asset_urn = reg_data["asset"]
    upload_url = reg_data["uploadMechanism"]["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]["uploadUrl"]

    # Subir el archivo binario
    with open(image_path, "rb") as f:
        img_bytes = f.read()

    put_resp = requests.put(
        upload_url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "image/png"
        },
        data=img_bytes,
        timeout=30
    )

    if put_resp.status_code not in [200, 201]:
        raise RuntimeError(f"Error subiendo bytes de {image_path.name} (HTTP {put_resp.status_code}): {put_resp.text}")

    print(f"  ✓ Subida exitosa: {image_path.name} -> {asset_urn}")
    return asset_urn

def publish(text: str, image_filenames: list, dry_run: bool = True):
    creds = load_credentials()
    token = creds.get("LINKEDIN_ACCESS_TOKEN")
    if not token:
        print("❌ Error: No se encontró LINKEDIN_ACCESS_TOKEN")
        sys.exit(1)

    author_urn = get_author_urn(token)
    print(f"Autor identificado: {author_urn}")
    print(f"Modo: {'DRY RUN (Simulación)' if dry_run else 'EN VIVO (Publicación Real)'}")

    # Verificar existencia de imágenes
    image_paths = []
    for fname in image_filenames:
        p = CAPTURAS_DIR / fname
        if not p.exists():
            print(f"❌ Error: Archivo de imagen no encontrado: {p}")
            sys.exit(1)
        image_paths.append(p)
    print(f"Imágenes verificadas ({len(image_paths)}): {[p.name for p in image_paths]}")

    if dry_run:
        print("\n--- TEXTO DEL POST ---")
        print(text)
        print("\n--- SIMULACIÓN LISTA: No se realizaron llamadas de escritura a la API ---")
        return {"success": True, "dry_run": True}

    # Subir cada imagen
    print("\nSubiendo imágenes a LinkedIn...")
    media_items = []
    for p in image_paths:
        asset_urn = upload_image_asset(token, author_urn, p, p.stem)
        media_items.append({
            "status": "READY",
            "description": {"text": p.stem.replace("_", " ")},
            "media": asset_urn,
            "title": {"text": p.stem}
        })

    # Crear el post con múltiples imágenes
    post_payload = {
        "author": author_urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": text
                },
                "shareMediaCategory": "IMAGE",
                "media": media_items
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }

    print("\nCreando post en LinkedIn...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
    }

    resp = requests.post(
        "https://api.linkedin.com/v2/ugcPosts",
        headers=headers,
        json=post_payload,
        timeout=20
    )

    if resp.status_code in [200, 201]:
        data = resp.json()
        post_urn = data.get("id", resp.headers.get("X-RestLi-Id", ""))
        print(f"\n🎉 ¡Publicación exitosa en LinkedIn!")
        print(f"Post URN: {post_urn}")
        print(f"URL directa: https://www.linkedin.com/feed/update/{post_urn}")
        return {"success": True, "post_urn": post_urn, "url": f"https://www.linkedin.com/feed/update/{post_urn}"}
    else:
        print(f"\n❌ Error al crear post en LinkedIn (HTTP {resp.status_code}): {resp.text}")
        return {"success": False, "status_code": resp.status_code, "error": resp.text}

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true", help="Publica en vivo (sin dry-run)")
    args = parser.parse_args()

    # Post en primera persona singular
    post_text = """Durante los últimos meses me propuse catastrar de forma independiente la situación real de la inteligencia artificial en la educación superior chilena: las 54 universidades oficiales reconocidas por el Mineduc y el SIES.

Construí la «Brújula IA Educación Superior» (https://brujulaiaedusuperior.evegat.cl), un observatorio abierto y auditable que cruza políticas institucionales, compras públicas en Mercado Público y directrices de aula.

Tres datos concretos del levantamiento:

1. Cobertura de políticas institucionales (59,3%)
De las 54 universidades, 32 cuentan con directrices, políticas o resoluciones públicas sobre IA. En los 22 planteles restantes no encontré a la fecha instrumentos formalizados de acceso público para orientar a sus comunidades académicas.

2. Compras públicas de tecnología e IA ($539,7M netos auditados)
Revisé 85 registros contractuales en Mercado Público entre 2020 y 2026 en las 10 universidades del Estado compradoras (17 licitaciones públicas y 68 órdenes de compra, correspondientes a 67 procesos independientes de compra). Al contrastar el gasto con las políticas de aula, el 30% de estos planteles adquiere tecnología e IA sin contar con lineamientos pedagógicos o éticos formalizados para docentes y estudiantes.

3. Protección de datos y Ley N° 21.719
Menos del 25% de las directrices vigentes aborda de forma explícita el resguardo de datos personales o la prohibición de cargar evaluaciones, nóminas o datos de estudiantes en plataformas de IA de terceros.

Dejé la plataforma en acceso libre y código abierto bajo licencia CC BY 4.0. Incluye:
• Matriz interactiva de los 54 planteles y planilla de chequeo descargable en CSV y JSON.
• Detalle de compras públicas por capas (cómputo, back-office, chatbots y docencia).
• 4 cláusulas operativas listas para programas de curso y sílabos.
• Repositorio de buenas prácticas y citas normativas cotejadas.

Si consideras valiosa esta evidencia para la docencia, la gestión académica o la investigación, comparte este post con tus colegas, equipos docentes y directivos universitarios. La idea es que los datos estén abiertos para que se conozcan, se auditen y permitan discutir con evidencia sobre la mesa.

Si en tu institución aprobaron recientemente directrices que aún no figuren en el catastro, el canal de actualización colaborativa está abierto directamente en la web.

🌐 Para colegas de América Latina: a plataforma está totalmente traduzida para o português para apoiar a governança universitária e pesquisa comparada na região.
🌐 For international colleagues: the observatory is fully available in English to support comparative higher education AI policy research.

👉 https://brujulaiaedusuperior.evegat.cl"""

    images = [
        "01_portada_y_guia_3_pasos.png",
        "02_matriz_54_universidades.png",
        "03_radar_ley_21719_datos_personales.png",
        "04_compras_publicas_mercado_publico.png",
        "05_planilla_chequeo_benchmarking.png"
    ]

    publish(post_text, images, dry_run=not args.live)
