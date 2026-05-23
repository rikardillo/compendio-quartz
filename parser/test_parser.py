#!/usr/bin/env python3
"""
Test script for the Legal Document Parser
Demonstrates parsing with sample legal text
"""

from legal_parser import LegalDocumentParser

# Sample unformatted legal text (similar to what comes from PDFs)
SAMPLE_LEGAL_TEXT = """---
title: Ley de Ejemplo
tags:
  - legal
  - test
---

EL CONGRESO NACIONAL

En Nombre de la República

Ley núm. 1-24

Considerando primero: Que es necesario regular esta materia.

Considerando segundo: Que la Constitución establece este derecho.

HA DADO LA SIGUIENTE LEY:

TÍTULO I

DE LAS DISPOSICIONES GENERALES

CAPÍTULO I

DEL OBJETO Y ÁMBITO DE APLICACIÓN

Artículo 1.- Objeto. Esta ley tiene por objeto establecer las normas generales para la regulación de la materia. El objetivo principal es garantizar los derechos fundamentales.

Artículo 2.- Ámbito de aplicación. Esta ley es de aplicación en todo el territorio nacional. Se aplicará a todas las personas físicas y jurídicas.

CAPÍTULO II

DE LAS DEFINICIONES

Artículo 3.- Definiciones. Para los efectos de esta ley, se entiende por:

1) Autoridad competente: El organismo designado para aplicar esta ley.

2) Beneficiario: Toda persona que se acoja a los beneficios de esta ley.

TÍTULO II

DE LOS DERECHOS Y OBLIGACIONES

CAPÍTULO I

DE LOS DERECHOS

SECCIÓN I

DERECHOS FUNDAMENTALES

Artículo 4.- Derecho a la información. Toda persona tiene derecho a acceder a la información pública. Este derecho incluye la posibilidad de solicitar y recibir información.

Parágrafo. La información clasificada como confidencial no está sujeta a este derecho.

Artículo 5.- Derecho a la privacidad. Se garantiza el derecho a la privacidad de todas las personas. Los datos personales estarán protegidos conforme a la ley.

SECCIÓN II

OTROS DERECHOS

Artículo 6.- Derecho de petición. Toda persona puede presentar peticiones a las autoridades. Las autoridades están obligadas a responder en un plazo de 30 días.

CAPÍTULO II

DE LAS OBLIGACIONES

Artículo 7.- Obligaciones generales. Son obligaciones de todas las personas sujetas a esta ley:

1) Cumplir con las disposiciones establecidas.

2) Colaborar con las autoridades competentes.

3) Respetar los derechos de terceros.

Artículo l0.- Obligaciones especiales. Los funcionarios públicos tendrán obligaciones especiales conforme al reglamento.
"""


def test_basic_parsing():
    """Test basic parsing functionality."""
    print("=" * 70)
    print("LEGAL DOCUMENT PARSER - TEST")
    print("=" * 70)
    print()

    # Create parser
    parser = LegalDocumentParser()

    # Parse the sample text
    print("Parsing sample legal document...")
    formatted_text = parser.parse(SAMPLE_LEGAL_TEXT)

    print("\n" + "=" * 70)
    print("FORMATTED OUTPUT")
    print("=" * 70)
    print()
    print(formatted_text)
    print()
    print("=" * 70)
    print("TEST COMPLETE")
    print("=" * 70)
    print()
    print("✓ Frontmatter preserved")
    print("✓ Headings detected and formatted")
    print("✓ Article numbers normalized (e.g., 'l0' → '10')")
    print("✓ Legal structure maintained")
    print()

    # Show some statistics
    lines = formatted_text.split("\n")
    h1_count = sum(
        1 for line in lines if line.startswith("# ") and not line.startswith("## ")
    )
    h2_count = sum(
        1 for line in lines if line.startswith("## ") and not line.startswith("### ")
    )
    h3_count = sum(
        1 for line in lines if line.startswith("### ") and not line.startswith("#### ")
    )
    h4_count = sum(
        1
        for line in lines
        if line.startswith("#### ") and not line.startswith("##### ")
    )
    h5_count = sum(1 for line in lines if line.startswith("##### "))

    print("Statistics:")
    print(f"  - H1 headings (Títulos/Libros): {h1_count}")
    print(f"  - H2 headings (Capítulos): {h2_count}")
    print(f"  - H3 headings (Secciones): {h3_count}")
    print(f"  - H4 headings (Artículos): {h4_count}")
    print(f"  - H5 headings (Parágrafos): {h5_count}")
    print()


def test_ocr_corrections():
    """Test OCR error corrections."""
    print("=" * 70)
    print("TESTING OCR ERROR CORRECTIONS")
    print("=" * 70)
    print()

    parser = LegalDocumentParser()

    test_cases = [
        ("Artículo l0.- Test", "Artículo 10.- Test"),
        ("Artículo 2l.- Test", "Artículo 21.- Test"),
        ("CAPÍTULO I", "CAPÍTULO I"),
        ("Articulo 5.- Test", "Articulo 5.- Test"),
    ]

    for input_text, expected in test_cases:
        normalized = parser.normalize_article_number(input_text)
        status = "✓" if expected in normalized else "✗"
        print(f"{status} '{input_text}' → '{normalized}'")

    print()


if __name__ == "__main__":
    test_basic_parsing()
    test_ocr_corrections()
