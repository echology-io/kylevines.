# Echology — The Unified Theory

**Everything Echology has built, how it works, and how it all connects.**

*Kyle Vines | February 21, 2026*

---

## Table of Contents

1. [The Thesis](#1-the-thesis)
2. [Company Architecture](#2-company-architecture)
3. [AECai — Experience Meets Infrastructure](#3-aecai--experience-meets-infrastructure)
4. [Echology's Toolbox](#4-ecologys-toolbox)
5. [Decompose — A Tool That Earned Its Independence](#5-decompose--a-tool-that-earned-its-independence)
6. [RBS Policy QC — A Different Domain, Same Discipline](#6-rbs-policy-qc--a-different-domain-same-discipline)
7. [Polymarket — Applied Pattern Recognition](#7-polymarket--applied-pattern-recognition)
8. [Resonance — How the Systems Harmonize](#8-resonance--how-the-systems-harmonize)
9. [Infrastructure & Deployment](#9-infrastructure--deployment)
10. [Test Coverage](#10-test-coverage)
11. [What's Real vs. What's Planned](#11-whats-real-vs-whats-planned)

---

## 1. The Thesis

> Fifteen years of reading specs, reviewing submittals, and managing construction projects taught me one thing: the industry's problem isn't a lack of AI. It's a lack of structure. The documents already contain the answers — they just need someone who knows where to look, and systems that can look the same way every time.

Echology is a **deterministic intelligence infrastructure company**. It builds tools for processing, classifying, verifying, and retrieving structured knowledge from documents. Not an AI agency. Not a consulting firm. Not a prompt shop.

**AECai** is where those tools meet my experience. It's a document intelligence platform for AEC firms — built by someone who has sat in the plan review meetings, carried the spec sets, and managed the RFI logs. The tools Echology builds serve AECai. The ones that prove themselves — that work well enough to stand alone — get extracted and released independently. Decompose was the first.

The through-line is not a technology stack. It's a conviction:
- **Domain experience decides what to build.** The tools exist because AEC work demanded them.
- **Determinism earns trust.** AI is powerful, but it must be wrapped in systems that produce the same output for the same input.
- **Tools that work in one domain often work in others.** When they do, release them. Let them find their own resonance.

---

## 2. Company Architecture

```
Echology, Inc.
│
│   Builds deterministic intelligence tools.
│   Tools that prove worthy get released standalone.
│
├── AECai (the product — Kyle's AEC experience + Echology's tools)
│   ├── Vanta Engine (document intelligence pipeline)
│   ├── Aletheia Engine (verification & trust)
│   ├── Daedalus Engine (retrieval & reporting)
│   └── GitHub: echology-io/aecai (private)
│
├── Echology's Toolbox (owned by Echology, used by AECai and others)
│   ├── Decompose (text classification — released standalone, MIT)
│   ├── Simulation-aware systems (17 systems across 3 engines)
│   ├── Entity validators (structural validation for AI output)
│   ├── Progressive escalation pattern (deterministic → AI → vision)
│   └── Envelope + provenance architecture (hash-chained audit trails)
│
├── RBS Policy QC (insurance demo — proves tools work outside AEC)
│   └── GitHub: echology-io/rbs-demo (private)
│
└── Polymarket (trading system — proves patterns work outside documents)
    └── Local only, not published
```

### Repos

| Repo | Path | Remote | Purpose |
|------|------|--------|---------|
| aecai | `/Users/kylevines/aecai` | `echology-io/aecai` (private) | Product — AEC document intelligence |
| echology | `/Users/kylevines/echology` | `echology-io/decompose` | Decompose library + company site |
| rbs-demo | `/Users/kylevines/kylevines/rbs-demo` | `echology-io/rbs-demo` (private) | Insurance QC demo |
| polymarket | `/Users/kylevines/polymarket` | None (local only) | Trading system |

### Ports

| System | Port | URL |
|--------|------|-----|
| AECai Server | 8443 | http://localhost:8443 |
| Temporal UI | 8233 | http://localhost:8233 |
| Polymarket | 8500 | http://localhost:8500 (paper), /live (live) |
| RBS Demo | 8600 | http://localhost:8600 |
| Qdrant | 6333 | http://localhost:6333 |
| Ollama | 11434 | http://localhost:11434 |

---

## 3. AECai — Experience Meets Infrastructure

### What It Is

AECai is a local-first document intelligence platform for Architecture, Engineering, and Construction firms. It reads any document a firm produces or receives — specs, submittals, RFIs, contracts, drawings, reports, pay apps — and turns it into structured, searchable, verified data. No cloud. No per-seat SaaS. Runs on the firm's own hardware.

This is what I would have wanted on every project I ever worked on. Every time I've cross-referenced a spec section against an outdated code edition, or manually tracked which submittal responded to which RFI, or spent hours finding the relevant clause in a 400-page contract — AECai is the system that does that work. It knows what to look for because I know what to look for, and I encoded that knowledge into deterministic rules.

Three engines, each named for what it does:

- **Vanta** — Reads, classifies, decomposes documents. The pipeline that turns chaos into structure.
- **Aletheia** — Greek for "truth." Verifies output quality, checks standards against jurisdiction adoptions, maintains tamper-proof audit trails.
- **Daedalus** — The master craftsman. Retrieves patterns from the firm's archive, generates CAD/BIM scripts, builds intelligence reports.

### The 6-Stage Pipeline

Every document flows through:

```
PARSE → PRE-FILTER → CLASSIFY → ENRICH → DECOMPOSE → INDEX
  │         │            │          │          │          │
  ▼         ▼            ▼          ▼          ▼          ▼
 raw     structured   doc type   plugins    semantic   Qdrant
 text    excerpt +    domains    PII,std    chunks +   vectors
         hints        entities   timeline   per-unit
                      risk       finance    classify
```

#### Stage 1: PARSE — `vanta_core.TextExtractor`

Extracts text from 16+ formats. Assumes engineering chaos is normal — scanned PDFs with coffee stains, half-OCR'd ACORD forms, DXF files with 200 layers.

| Format | Method |
|--------|--------|
| PDF | PyMuPDF (OCR fallback via Tesseract for scanned) |
| DOCX | python-docx |
| DXF (CAD) | ezdxf via vanta_geometry.py (AIA layer parsing) |
| Images (.png, .jpg, .tiff, .bmp, .gif) | OCR via pytesseract + Pillow |
| Plain text (.txt, .md, .csv, .xml, .html, .json, .rtf) | Direct extraction |

Returns: `{raw_text, cleaned_text, file_info: {extension, size}, error}`

Also provides:
- `chunk_text(text, chunk_size=2000, overlap=200)` — character-based with sentence-boundary splitting
- `chunk_markdown(text, chunk_size)` — header-aware chunking that respects `#` hierarchy
- `extract_entities(text)` — regex patterns for 15 entity types (email, phone, SSN, dates, standards, drawing numbers, spec sections, addresses, URLs, currency, RFI/CO/submittal numbers)
- `detect_standards(text)` — finds ASTM, ACI, AISC, ASCE, NFPA, IBC, IRC, NEC, OSHA references with body/number/version
- `detect_disciplines(text)` — structural, civil, mechanical, electrical, geotechnical, architectural, environmental
- `make_envelope(stage, file_path)` + `add_provenance(envelope, stage, action, details)` — standardized JSON envelope with hash-chained provenance

#### Stage 1.5: PRE-FILTER — Decompose Library (Optional)

When Decompose is installed, the pipeline uses it to pre-filter text before classification. This is one of Echology's tools being consumed by AECai — the pipeline works without it, but works better with it.

```python
dr = decompose_text(text, chunk_size=2000, compact=True)
llm_filtered = filter_for_llm(dr, max_tokens=self.classifier.char_limit)
structured_excerpt = llm_filtered["text"]  # high-value units only
decompose_hints = {
    "total_units": dr["meta"]["total_units"],
    "filtered_units": llm_filtered["meta"]["output_units"],
    "reduction_pct": llm_filtered["meta"]["reduction_pct"],
    "authority_profile": dr["meta"]["authority_profile"],  # {mandatory: 15, informational: 3, ...}
    "risk_profile": dr["meta"]["risk_profile"],
    "standards_found": dr["meta"]["standards_found"],
}
```

The structured excerpt replaces raw text as AI classifier input. The hints feed the deterministic confidence scorer. Graceful degradation — pipeline works without Decompose installed.

#### Stage 2: CLASSIFY — `vanta_classify_v2.UniversalClassifier`

**Deterministic-first** classification. This is where my experience is most directly encoded — the filename patterns, the domain signals, the confidence scoring. A spec named `spec_03_30_00.pdf` with 23 "shall" clauses and 5 ASTM references doesn't need an LLM to tell you what it is.

Three paths, scored by confidence:

```
filename hints (60+ patterns)  ──┐
regex authority signals         ──┼── confidence score (0.0–1.0)
Decompose standards/profiles   ──┘
         │
    score > 0.8 AND filename matched?
    ├── YES → deterministic classification (no AI call)
    └── NO  → send to Ollama llama3
              ├── AI responds → merge AI + regex results
              └── AI unavailable → regex fallback
```

**Confidence scoring** (`_compute_deterministic_confidence`):

| Signal | Score |
|--------|-------|
| Filename matches known type | +0.40 |
| Decompose found ≥5 standards | +0.20 |
| Decompose found ≥2 standards | +0.10 |
| Authority profile >60% mandatory/prohibitive | +0.15 |
| Regex found ≥10 authority signals | +0.15 |
| Regex found ≥5 authority signals | +0.08 |
| Domain signals found in content | +0.10 |

**Filename type hints** — 60+ patterns ordered by specificity, drawn from how AEC firms actually name files:
`daily_report`, `field_report`, `change_order`, `pay_app`, `spec`, `contract`, `rfi`, `submittal`, `minutes`, `invoice`, `schedule`, `safety`, `inspection`, `sop`, `drawing`, `certificate`, `permit`, `bond`, `jha`, `warranty`, `closeout`...

**Domain signals** — 10 domains with keyword lists:
engineering, legal, financial, marketing, safety, human_resources, operations, regulatory, insurance, field_operations

**Entity validators** (`ENTITY_VALIDATORS` dict in vanta_core.py) — structural guards that reject invalid entities from both regex and AI extraction:

| Entity | Validation Rule |
|--------|----------------|
| email | Has `@`, dot in domain, no spaces |
| phone | ≥10 digits |
| SSN | Not 000-xx, not 666-xx, not 9xx (ITIN), 9 digits |
| date | Parses to 1950–2035, month 1–12, day 1–31 |
| currency | Starts with `$` followed by digits |
| drawing_number | Has digits, ≥4 chars, not pure digits |
| spec_section | Matches `NN NN NN` format |
| address | ≥3 words, has digits |
| url | Starts with `http`, has dot, >10 chars |

AI entity validation in `_merge_document_classification`:
- Maps AI keys to validators (`dates` → `date`, `monetary` → `currency`)
- Context validation: rejects false-positive org names in specs (`"Electric"`, `"Mechanical"`, `"Structural"`, etc.)

**Classification output** — comprehensive envelope:
```json
{
  "document_type": "specification",
  "document_type_confidence": 0.85,
  "content_domains": ["engineering", "construction_admin"],
  "entities": { "standards_codes": ["IBC 2021", "ASTM C150-20"], "..." },
  "risk_indicators": { "has_safety_implications": true, "..." },
  "authority_analysis": { "dominant_authority": "mandatory", "total_authority_signals": 23 },
  "classification_method": "deterministic_high_confidence",
  "_deterministic_confidence": 0.85,
  "_decompose_hints": { "..." }
}
```

#### Stage 3: ENRICH — `vanta_plugins.PluginRegistry`

Plugin-based enrichment. Plugins activate based on classifier's `suggested_plugins` field.

5 built-in plugins:

| Plugin | What It Does |
|--------|-------------|
| Standards Crossref | Detects standards, checks jurisdiction adoption via Aletheia |
| PII Detection | SSNs, phones, emails, credit cards, DOBs, passport numbers |
| Timeline | Dates, temporal events, schedule references |
| Financial Analysis | Dollar amounts, percentages, financial terms |
| Contract Analysis | Parties, obligations, key terms |

Plugin architecture:
- `VantaPlugin` abstract base class with `process(text, classification, envelope)` and `process_unit(unit_text, unit_classification, doc_classification)`
- Circuit breaker: 3-failure quarantine per plugin
- Priority ordering: plugins execute in declared priority order
- Extensible: firms can write custom plugins, auto-discovered from plugin directory

#### Stage 4: DECOMPOSE — Semantic Chunking

Splits document into semantic units with per-unit classification:

```python
# Markdown files → header-aware chunking
chunks = chunk_markdown(raw_markdown, chunk_size=2000)

# Everything else → character-based with sentence-boundary overlap
chunks = chunk_text(text, chunk_size=2000)

# Per-unit classification via UniversalClassifier.classify_unit()
for chunk in chunks:
    unit_classification = classifier.classify_unit(chunk["text"], doc_classification)
    # → authority_level, content_type, risk_relevance, key_entities, domain_tags, actionable
```

#### Stage 5: INDEX — Embedding + Qdrant

Optional. Embeds each semantic unit and stores in Qdrant vector database.

**EmbeddingEngine** (vanta_embed.py) — tries in order:
1. Ollama + nomic-embed-text (768-dim)
2. sentence-transformers + all-MiniLM-L6-v2 (384-dim)
3. None — pipeline continues without indexing

**VantaIndexManager** (vanta_index.py) — HTTP-based Qdrant client (no pip dependency):
- 3 collections: `documents`, `geometry`, `jurisdictions`
- Filterable by: project_id, jurisdiction, discipline, risk_level, document_type, knowledge_type
- Keyword fallback when Qdrant is unavailable

### Opt-in Subsystems

Each is independently toggleable via CLI flags:

| Flag | Module | What It Does |
|------|--------|-------------|
| `--security` | `vanta_security.py` | Input validation, PII scanning, AES-256 encryption, provenance signing, compliance assessment |
| `--ai-enhance` | `vanta_ai.py` | Confidence-gated LLM calls per semantic unit (only when rule-based confidence < 0.70) |
| `--torsion` | `vanta_torsion.py` | Adaptive computation: lazy reality scheduling, coherence-weighted prioritization, chirality feedback. 21% speedup on low-signal content |
| `--simulation` | `vanta_simulation.py` | 13 simulation-aware systems across all 3 engines |
| `--verify` | Aletheia modules | Schema validation + jurisdiction cross-reference + audit certification |
| `--index` | vanta_embed + vanta_index | Embedding + Qdrant vector storage |
| `--report` | Daedalus modules | Intelligence reports (briefing, precedent, risk) |
| `--geometry` | `vanta_geometry.py` | DXF entity extraction with AIA layer naming |

### Aletheia Engine — Verification & Trust

Three core modules:

**SchemaValidator** (`aletheia_schema.py`):
- Validates pipeline output for completeness/correctness
- Checks mandatory fields, cross-field invariants (safety-critical → must reference standards)
- Produces quality score (0–100) and certification level (bronze/silver/gold)
- 25+ valid document types, 18 knowledge categories, 5 confidence levels, 5 risk levels

**JurisdictionRegistry + CrossReferenceEngine** (`aletheia_jurisdiction.py`):
- 40+ code bodies tracked (IBC, IRC, NEC, NFPA 101, ASCE 7, ACI 318, AISC 360...)
- Each body: editions list, regex pattern, supersedes chain
- `check_adoption(ahj, state, standard_ref)` — is this standard adopted here?
- `detect_mismatch()` — flags when document references wrong edition for the AHJ
- This is the kind of thing you learn to check after your first plan review rejection

**AuditLedger** (`aletheia_ledger.py`):
- Hash-chained, append-only SQLite ledger (WAL mode)
- Each entry: SHA-256 chain hash + HMAC-SHA256 signature
- `issue_certificate(source, cert_level)` — bronze/silver/gold badges
- `verify_chain()` — independent tamper detection (if any entry modified, chain breaks)
- Compliant with NIST AU-6 audit requirements

**Simulation-aware verification** (6 additional systems in `aletheia_simulation.py`):
- CausalConsistencyNetwork — DAG of causal relationships for every finding (E&O defense)
- QuantumErrorCorrector — multi-channel parity (regex + structural + AI → majority vote)
- RealityAnchorSystem — known-true elements as confidence anchors with cascade invalidation
- TemporalMerkleTree — unit-level tamper detection without downloading full dataset
- SimulationEscapeDetector — anomaly detection (impossible dates, contradictory standards)
- CounterfactualLogger — logs decisions AND alternatives for audit defense

### Daedalus Engine — Retrieval & Reporting

**RetrievalEngine** (`daedalus_retrieve.py`):
- Semantic search over Qdrant via HTTP (curl-based, no pip dependency)
- Supports: jurisdiction filter, discipline filter, document_type, risk_level, AHJ metadata
- Keyword fallback when Qdrant unavailable

**ReportBuilder** (`daedalus_report.py`):
- 3 report types:
  - **briefing** — pre-submittal intelligence (what to know before submitting to AHJ)
  - **precedent** — design precedent (how firm has handled similar projects)
  - **risk** — risk assessment (applicable standards, compliance gaps, mitigation)
- Optional LLM synthesis for narrative summaries

**PatternToScript + PatternToRevit**:
- Civil3D: `.scr` (AutoCAD), `.lsp` (AutoLISP) for alignments, pipe networks, grading
- Revit: `.txt` (journal files), `.dyn` (Dynamo graphs), `.json` (IFC crosswalk) for walls, framing, MEP

### The Envelope

Every processed document produces a standardized JSON envelope with provenance chain:

```json
{
  "_pipeline": { "version": "2.0.0", "stage": "complete", "engine": "vanta" },
  "_provenance": [
    { "stage": "parse", "action": "complete", "timestamp": "...", "details": {} },
    { "stage": "decompose_prefilter", "action": "complete", "details": {"reduction_pct": 65} },
    { "stage": "classify", "action": "complete", "details": {"method": "deterministic_high_confidence"} }
  ],
  "metadata": { "filename": "spec_03_30_00.pdf", "pages": 42, "word_count": 18500 },
  "decompose_prefilter": { "total_units": 85, "filtered_units": 32, "reduction_pct": 62 },
  "classification": { "document_type": "specification", "classification_method": "deterministic_high_confidence" },
  "plugins": { "standards_crossref": {}, "pii_detection": {} },
  "semantic_units": [ { "text": "...", "classification": {}, "start": 0, "end": 500 } ],
  "summary": { "total_units": 47, "authority_profile": { "mandatory": 23 } }
}
```

### Configuration

All via environment variables (`AECAI_` prefix), sensible defaults:

| Parameter | Default | Purpose |
|-----------|---------|---------|
| OLLAMA_HOST | localhost:11434 | LLM endpoint |
| OLLAMA_MODEL | llama3 | Classification model |
| EMBED_MODEL | nomic-embed-text | Embedding model |
| CHUNK_SIZE | 2000 | Characters per chunk |
| AI_THRESHOLD | 0.70 | Confidence gate for per-unit AI |
| QDRANT_HOST/PORT | localhost:6333 | Vector store |
| SERVER_PORT | 8443 | FastAPI server |
| MAX_UPLOAD_MB | 50 | Upload limit |

Access: `from config import cfg` (singleton `_Config` class).

### Server

FastAPI on port 8443. Pure API — no HTML serving. 29 endpoints across 10 route modules. Security middleware: CORS, API key auth, CSP headers, HSTS, request size limiting, path traversal protection with magic byte verification.

### Temporal Workflows

6 workflows for long-running operations:

| Workflow | What |
|----------|------|
| DocumentPipeline | Single document through Vanta |
| Verification | Schema validation + jurisdiction crossref |
| IntelligenceReport | Retrieval + report synthesis + CAD/BIM scripts |
| BatchProcess | Parallel multi-file (fan-out) |
| Retrain | Ingest + convert training data + fine-tune |
| BatchOutreach | Generate outreach drafts via LLM |

18 activities, task queue `aecai`. Falls back to inline processing when Temporal unavailable.

---

## 4. Echology's Toolbox

Echology builds the tools that power AECai. Some of these tools are general enough to work outside AEC. When one proves itself — when it works well in production and solves a problem that isn't domain-specific — it gets extracted and released independently.

The tools share a design philosophy:
- **Deterministic first.** Regex, structural rules, and pattern matching before any LLM call.
- **AI as escalation, not default.** The LLM is the expensive path. Take it only when the cheap path doesn't have enough signal.
- **Validate everything AI produces.** Structural validators reject impossible values. The AI proposes; the rules dispose.
- **Graceful degradation.** Every component is optional. The system gets better with more tools available, but never breaks when one is missing.

These aren't abstract principles — they emerged from building AECai and discovering what actually works when you process thousands of engineering documents.

### The Progressive Escalation Pattern

Every Echology system uses the same architecture:

```
Tier 1: Deterministic  → regex, filename hints, structural rules, math
Tier 2: Text AI        → LLM on pre-filtered input, validated output
Tier 3: Vision/Advanced → only when Tiers 1+2 leave gaps
```

### The Structural Validation Pattern

Every system validates AI output with structural rules:

| System | Validators |
|--------|------------|
| AECai | `ENTITY_VALIDATORS` — 12 entity types, context validation for org names |
| RBS | `_ai_validators` + `_vision_validators` — per-field format checks |
| Polymarket | False positive filters — date series, bracket series, residual events |

### The Envelope + Provenance Pattern

AECai wraps every operation in a standardized JSON envelope with hash-chained provenance. RBS tracks extraction tiers per field. Polymarket logs every scan and trade decision. Every system knows what it did, when, and why.

### The Graceful Degradation Pattern

| Component Down | AECai | RBS | Polymarket |
|---------------|-------|-----|------------|
| Ollama | regex fallback | regex-only extraction | no news scanning |
| Decompose | pipeline skips Stage 1.5 | no text filtering (regex still works) | N/A |
| Qdrant | no indexing, keyword search fallback | N/A | N/A |
| Temporal | inline processing | N/A | N/A |

---

## 5. Decompose — A Tool That Earned Its Independence

### Why It Exists

Decompose started as AECai's text classification module. The authority detection, risk scoring, and entity extraction in `vanta_core.py` kept getting reused — first in AECai's pipeline, then in the RBS insurance demo, then as a pre-filter for Ollama. At some point it became clear: this isn't an AECai feature. It's a general-purpose text classification tool that happens to work especially well on structured documents.

So it got extracted, packaged, and published. MIT license. Zero dependencies beyond stdlib. Works for anyone building AI agents that need to pre-process text before sending it to an LLM.

### What It Does

Turns any text into classified, structured semantic units — instantly. No LLM. No setup. One function call.

```
Without:  document → chunk → embed → retrieve → LLM → answer  (100% of tokens)
With:     document → decompose → filter → LLM → answer         (20-40% of tokens)
```

### How It Works

Five pure-regex stages. Deterministic. Same input always produces same output.

```
Input Text
    │
    ├── auto_chunk()           ← chunker.py
    │   ├── chunk_markdown()   ← header-aware (respects # hierarchy)
    │   └── chunk_text()       ← sentence-boundary splitting with overlap
    │
    ├── For each chunk:
    │   ├── classify()         ← classifier.py (authority × risk × type → attention)
    │   ├── extract_entities() ← entities.py (standards, dates, financial, CFR)
    │   └── detect_irreducibility() ← irreducibility.py (must this be preserved verbatim?)
    │
    └── Aggregate → DecomposeResult
        ├── units[]            ← classified semantic units
        ├── meta{}             ← authority/risk profiles, standards, token estimates
        └── filter_for_llm()   ← post-filter to high-value units for LLM input
```

### The Classification Model

Every unit gets scored on three axes, then composited into an attention score:

**Authority** (6 levels, RFC 2119 keyword detection):

| Level | Keywords | Weight | Example |
|-------|----------|--------|---------|
| mandatory | shall, must, is required, shall comply | 1.0 | "The contractor **shall** provide..." |
| prohibitive | shall not, must not, prohibited, not permitted | 1.0 | "**Shall not** exceed..." |
| directive | should, recommended, expected, advised to | 0.75 | "**Should** follow practices..." |
| conditional | if...then, when...shall, unless, provided that | 0.60 | "**If** temperature exceeds..." |
| permissive | may, permitted, acceptable, allowable, optional | 0.35 | "Contractor **may** use..." |
| informational | for information, note, non-binding | 0.25 | "**Note:** general background..." |

**Risk** (7 categories, keyword detection):

| Category | Multiplier | Triggers |
|----------|------------|----------|
| safety_critical | 4.0x | life safety, seismic, collapse, fire rated, structural failure |
| security | 3.0x | attack, unauthorized access, vulnerability, malware |
| compliance | 2.0x | shall comply, in accordance with, code requirement, inspection |
| financial | 1.5x | $amounts, retainage, liquidated damages, change order |
| contractual | 1.5x | indemnify, liability, warranty, termination, force majeure |
| advisory | 0.5x | for information, FYI, general guidance |
| informational | 0.3x | (default — no risk signals detected) |

**Content Type** (6 types):

| Type | Patterns |
|------|----------|
| requirement | shall, must, required |
| definition | means, is defined as, refers to |
| reference | in accordance with, per section, see appendix |
| constraint | not to exceed, maximum, minimum, tolerance |
| narrative | background, overview, introduction, summary |
| data | table, figure, schedule, appendix |

**Attention Score** = `min(10.0, authority_score x risk_multiplier)` — clamped 0.0-10.0.

**Actionable** = True if authority is (mandatory OR prohibitive OR directive) OR risk is (safety_critical OR security OR compliance).

### Irreducibility Detection

10 regex pattern categories detect content that **must be preserved verbatim** — it cannot be paraphrased or summarized without losing meaning:

| Category | Example |
|----------|---------|
| legal_mandate | "shall comply", "shall be installed" |
| engineering_value | "10 psi", "50 kip", "25 mm" |
| limit_specification | "NOT TO EXCEED", "NOT LESS THAN" |
| precision_requirement | "minimum 6 inches", "tolerance +/-0.1" |
| legal_reference | "SECTION 5.2.1", "ARTICLE 12" |
| mathematical_formula | "stress = F/A" |
| specification_id | "spec no. 42" |
| legal_obligation | "warranty", "indemnification" |
| financial_value | "$1,000.00" |
| date_reference | "01/15/2025" |

Confidence = `min(1.0, match_count x 0.2)`. Above 0.6 = PRESERVE_VERBATIM. Above 0.3 = PRESERVE_KEY_VALUES. Below = SUMMARIZABLE.

### Entity Extraction

Pure regex, no NER model:

| Entity Type | Pattern Examples |
|-------------|-----------------|
| US Standards | ASTM D3359, AISC 360-22, ACI 318-19 |
| International Standards | ISO 14644, EN 1090-2:2018 |
| Building Codes | IBC 2021, NEC, IRC |
| OSHA | OSHA 1910.1000, 29 CFR 1926 |
| CFR | 29 CFR Part 1910.1200 |
| Dates | 01/15/2025, January 15, 2025 |
| Financial | $1,234.56, 95.5% |

### filter_for_llm()

Post-filter that keeps only high-value units for LLM consumption. Added February 2026 after RBS production proved it improved field extraction from 15 to 22 fields on scanned docs.

```python
from decompose import decompose_text, filter_for_llm

result = decompose_text(document_text)
filtered = filter_for_llm(result, max_tokens=4000)

# filtered["text"]  = concatenated high-value units, ready for LLM
# filtered["meta"]["reduction_pct"] = typically 60-80%
```

Default filter criteria (OR logic — unit matches ANY and is kept):
- **Authorities**: mandatory, prohibitive, directive, conditional
- **Risks**: safety_critical, compliance, financial, contractual
- **Types**: requirement, constraint, data, definition
- **min_attention**: 0.0 (disabled by default)

Options: `include_headings=True` prepends heading paths (`[Division 05 > Structural]`), `max_tokens` truncates at ~4 chars/token.

### Distribution

| Channel | Status |
|---------|--------|
| PyPI | Published v0.1.1 (Trusted Publishers via GitHub Actions OIDC) |
| Official MCP Registry | Published via mcp-publisher |
| ClawHub / OpenClaw | Published v0.1.2 |
| GitHub | echology-io/decompose (MIT license) |

### Performance

- ~14ms average per document on Apple Silicon
- 1,000+ chars/ms throughput
- 63 tests passing
- Zero API calls, zero cost, works offline, air-gapped

### Technical Details

- **Dependencies**: `mcp >= 1.0.0` (runtime), that's it
- **Python**: >= 3.10
- **Entry points**: `decompose` and `decompose-mcp` CLI commands
- **MCP tools**: `decompose_text`, `decompose_url` (with SSRF protection — 10 private IP ranges blocked)
- **All internal modules**: stdlib `re` + `dataclasses` only. No numpy, no transformers, no external deps.

---

## 6. RBS Policy QC — A Different Domain, Same Discipline

### What It Is

Insurance policy QC tool. Upload Quote + Policy + Application + TAM for one insured → engine extracts fields from each → cross-references → flags discrepancies. Built as a demo for a CTO at RBS (insurance agency).

This matters for the Echology story because it proves the tools work outside AEC. The progressive escalation pattern, the structural validators, the Decompose pre-filter — all developed for AECai, all working in insurance without modification. Different documents, same discipline.

Single-file FastAPI server: `server.py` (~1,810 lines). Dark-theme single-page frontend: `index.html`.

### The Three-Tier Extraction Pipeline

```
Document → is native text? ─yes─→ pdfplumber → regex → tables → done
                            │no
                            └──→ OCR (Tesseract 200dpi) → regex
                                 → Decompose filter → Ollama llama3 text AI
                                 → LLaVA vision (page images → JSON)
```

#### Tier 1: Regex (All Documents)

- `COVERAGE_PATTERNS`: 15 property/GL/auto field patterns
- `AUTO_COVERAGE_PATTERNS`: 10 auto-specific patterns with "Included" handling
- `PREMIUM_PATTERNS`: 8 premium patterns ordered by signal strength
- `_extract_fields_from_tables()`: structured PDF table extraction
- Always runs. Handles 70%+ of documents without any AI.

#### Tier 2: Decompose + Ollama Text AI (Scanned Only)

- **Trigger**: `len(fields) < 10 AND Ollama available`
- Decompose filters OCR text to financial/data/compliance units (removes noise)
- Ollama llama3 extracts missing fields from filtered text
- `_ai_validators` reject structurally invalid values
- `_ai_field_aliases` normalize variant names
- **Result**: Improved extraction from 15 → 22 fields on scanned docs

#### Tier 3: LLaVA Vision (Scanned Only)

- **Trigger**: after Tier 2, if `len(still_missing) >= 5 AND is_scanned=True`
- PDF → `convert_from_path(dpi=150, pages 1-3)` → JPEG → base64
- Per-page calls to LLaVA with `_VISION_FIELD_HINTS`
- Only targets `_VISION_FIELDS` (12 property-detail fields — prevents hallucinating auto fields on property docs)
- `_vision_validators` reject clearly wrong values
- 90s timeout per vision call, ~42-65s total

#### Comparison Engine

```python
def compare_field(field_name, values) -> dict:
    # Status: 'match' | 'partial' | 'discrepancy' | 'missing'
    # Normalizes: addresses, entity names (LLC/Inc), date formats
```

### Test Results (Feb 20, 2026)

| Document Set | Fields | Discrepancies | Time | AI Used |
|-------------|--------|---------------|------|---------|
| ICA Properties (scanned) | 22/24 | 4 (genuine) | ~42s | Tier 2 + 3 |
| PSC Construction (native) | 23 | 2 | <1s | None (regex only) |

### What Fed Back

Patterns proven in RBS that were promoted into Echology's toolbox and adopted by AECai:

1. **Decompose as LLM pre-filter** → Stage 1.5 in Vanta pipeline
2. **Deterministic-first** → confidence scoring, skip AI when signals are strong
3. **Structural validators** → `ENTITY_VALIDATORS` in vanta_core.py
4. **`filter_for_llm()`** → first-class Decompose library function

---

## 7. Polymarket — Applied Pattern Recognition

### What It Is

Prediction market scanner + paper/live trader. 4 independent strategies scan Polymarket for opportunities, queue them for human approval, and optionally execute trades via a burner wallet.

Polymarket isn't a document system. It doesn't use Decompose or AECai's pipeline. But it uses the same thinking: deterministic scanning first, AI only for news classification, structural validators to reject false positives, human-in-the-loop before any irreversible action. The patterns travel.

### The 5-Phase Model

```
Phase 1: SCAN      → 4 scanners run on schedule (8AM + 8PM via launchd)
Phase 2: PAPER     → Simulated trades, track P&L in SQLite
Phase 3: APPROVE   → Pending trades queue, human clicks approve on /live
Phase 3+: EXECUTE  → TradeExecutor places order via CLOB API
Phase 4: RESOLVE   → Markets settle, P&L calculated
```

### Four Strategies

#### Strategy #1: Crypto Price Latency Arbitrage (`scanner/crypto_price.py`)
- Compares exchange prices (CoinGecko) vs Polymarket prediction markets
- Finds mispricings on threshold markets ("Will BTC reach $100K by Feb?")
- Calculates distance to strike + historical volatility → implied probability vs market odds
- 291 markets scanned, signals queued

#### Strategy #2: Cross-Market Arbitrage (`scanner/cross_market.py`)
- **Intra-market**: Single market where YES + NO < $1.00
- **Inter-market**: Mutually exclusive outcomes where SUM(YES) < $1.00
- Both require spreads > ~3% to clear 2% fee
- False positive filters: date series, price threshold series, residual events, bracket series
- 0 opportunities (expected — rare market conditions)

#### Strategy #4: News-Driven Event Trading (`scanner/news_event.py`)
- RSS feeds (CoinDesk, BBC) → Ollama llama3 classifies → fuzzy match to active markets → queue
- Pipeline: RSS → LLM extract event → match to Polymarket question → pending trade

#### Strategy #5: Tail-End Harvesting (`scanner/tail_end.py`)
- Buy near-certain outcomes ($0.93-$0.99) that haven't resolved yet
- Collect $1.00 at resolution for 1-7% return per cycle
- Filters: min $5K liquidity, resolves within 60 days, net return >=1%
- 17 open paper trades

### Safety Controls

- `MAX_POSITION_SIZE = $100` per trade
- `MAX_DAILY_VOLUME = $500` per day
- `SLIPPAGE_TOLERANCE = 2%`
- Human approval required for every live trade (no auto-execution)
- Burner wallet: private key in session env var, never on disk
- EIP-712 isolated signer module

### Database

SQLite with WAL mode, 5 tables: `opportunities`, `paper_trades`, `pending_trades`, `live_trades`, `scan_log`.

### Current State (Feb 2026)

| Metric | Value |
|--------|-------|
| Open paper trades | 17 (tail-end) |
| Cross-market opps | 0 (expected) |
| Crypto scanner | 291 markets scanned |
| News scanner | Working (CoinDesk + BBC) |
| Live trades | None (awaiting wallet funding) |

---

## 8. Resonance — How the Systems Harmonize

The systems weren't designed to be a unified theory. They were built independently, for different problems, at different times. But the same patterns kept emerging — because the same person built them, with the same instincts about what makes a system trustworthy.

### What Echology's systems share

**Deterministic scanning before AI.** AECai classifies documents by filename and regex before calling Ollama. RBS extracts 70%+ of fields with regex alone. Polymarket scans markets with pure math before LLM news classification. Not because AI is bad — because deterministic systems are auditable, reproducible, and free.

**Structural validation of everything AI produces.** AECai's entity validators reject impossible dates and fake org names. RBS's field validators reject structurally invalid insurance values. Polymarket's false positive filters reject date-series and bracket-series markets. The AI proposes; the structure disposes.

**Graceful degradation as a design requirement.** Every component is optional. Ollama down? Regex fallback. Decompose not installed? Skip pre-filtering. Qdrant offline? Keyword search. Temporal unavailable? Inline processing. The system gets better with more tools, but never stops working.

**Human-in-the-loop for irreversible actions.** AECai requires human review for gold-level Aletheia certificates. RBS has a 23-step HITL integration map. Polymarket requires GUI approval for every live trade. Automation does the work; humans make the calls.

**Provenance on everything.** AECai wraps every operation in hash-chained envelopes. RBS tracks which extraction tier produced each field. Polymarket logs every scan and trade decision. Every system knows what it did, when, and why — because in high-trust industries, "it works" isn't enough. You need to show your work.

### What connects them

These aren't features I planned. They're reflexes — the kind of thing you build instinctively after years of working in an industry where a missed spec reference can mean a failed inspection, a wrong code edition can mean a rejected permit, and a bad submittal can cost months. The tools reflect the discipline. The discipline comes from the domain.

That's why AECai is the center of the story. Not because it's the biggest system — but because it's where the experience lives. Decompose, the validators, the escalation patterns — they emerged from AECai's needs. They work elsewhere because good patterns travel. But they exist because someone who has read ten thousand specs built a system to read them the same way, every time.

---

## 9. Infrastructure & Deployment

### Local Stack

All systems run locally. No cloud dependencies. No per-seat SaaS.

| Service | Resource |
|---------|----------|
| Ollama | llama3 (4.7GB), llava (4.7GB), aecai (8.5GB custom), nomic-embed-text (274MB) |
| Qdrant | `/Volumes/echo_dev/aecai_data/qdrant_storage/` |
| Temporal | SQLite dev server (`temporal_dev.db`) |
| Python | 3.11.13 via Homebrew, all projects use `.venv/` |

### Docker (AECai production)

5 services via Docker Compose:

| Service | Image | Resources |
|---------|-------|-----------|
| Qdrant | qdrant/qdrant:v1.13.2 | 2 CPU / 2 GB |
| Temporal | temporalio/auto-setup:1.26.2 | 1 CPU / 1 GB |
| Temporal UI | temporalio/ui:2.31.2 | 0.5 CPU / 256 MB |
| AECai Server | Custom Python 3.11-slim | 2 CPU / 4 GB |
| AECai Worker | Same image | 2 CPU / 4 GB |

Non-root container (`aecai`), health checks, resource limits. SOC 2-aligned.

### Storage

- Mac internal: 460GB (~119GB free)
- echo_dev flash drive (1TB): training data, Qdrant storage, movies, downloads archive
- echo_backup flash drive (1.8TB): backup

### Website

- echology.io — GitHub Pages from `echology/docs/`
- Bilingual: EN + PT (hreflang, OG tags, Twitter Cards)
- Pages: index, about, contact, aecai, decompose, rbs, blog (3 posts)

---

## 10. Test Coverage

| Repo | Test Files | Tests | Time |
|------|-----------|-------|------|
| AECai | 36 | 577 | 41.8s |
| Echology/Decompose | 7 | 63 | 0.03s |
| **Total** | **43** | **640** | **~42s** |

AECai test breakdown:

| Category | Files | ~Tests |
|----------|-------|--------|
| Vanta Engine | 10 | ~200 |
| Aletheia | 4 | ~50 |
| Daedalus | 4 | ~40 |
| Server/API | 4 | ~50 |
| Routes | 6 | ~60 |
| Infrastructure | 7 | ~150 |
| Workflows | 1 | ~10 |

---

## 11. What's Real vs. What's Planned

### Shipping Today

- Full 6-stage Vanta pipeline (parse, pre-filter, classify, enrich, decompose, index)
- 16+ file format support including OCR
- Deterministic-first classification with AI fallback
- Structural entity validators (12 types)
- Decompose pre-filter (Stage 1.5) with filter_for_llm()
- 5 built-in enrichment plugins
- Jurisdiction registry with adoption tracking
- Hash-chained audit ledger with certification (bronze/silver/gold)
- Semantic search via Qdrant
- Intelligence report generation (briefing, precedent, risk)
- Civil3D and Revit script generation
- RAG-powered chat
- 6 Temporal workflows with inline fallback
- 17 simulation-aware systems across 3 engines
- Full security/compliance layer (NIST, ISO 27001, SOC 2, GDPR, HIPAA, ITAR)
- Docker Compose deployment
- 640 passing tests across 2 repos
- Decompose on PyPI, MCP Registry, ClawHub
- RBS three-tier extraction demo (live at echology.io/rbs)
- Polymarket paper trading (17 active positions, 4 scanners)

### Not Yet Built

- Multi-tenant AECai support (current: single-firm deployment)
- Paid jurisdiction data service (registry populated manually)
- Web-based jurisdiction management UI
- Fine-tuning pipeline completion (infrastructure exists, training loop needs finishing)
- Production monitoring/alerting (logging exists, dashboards don't)
- Horizontal scaling (single-machine, Temporal enables multi-worker but untested)
- Polymarket live trading execution (awaiting wallet funding)
- Decompose v0.2.0 (filter_for_llm not yet on PyPI)

---

## File Inventory

### AECai Engine (~19,900 lines)

| File | Purpose |
|------|---------|
| `engine/vanta/vanta_core.py` | Text extraction, chunking, entities, standards, validators, envelope |
| `engine/vanta/vanta_pipeline.py` | 6-stage pipeline orchestrator |
| `engine/vanta/vanta_classify_v2.py` | Deterministic-first document classifier |
| `engine/vanta/vanta_plugins.py` | Plugin registry + 5 built-in plugins |
| `engine/vanta/vanta_ai.py` | Confidence-gated AI enhancement |
| `engine/vanta/vanta_security.py` | Security, PII, encryption, compliance |
| `engine/vanta/vanta_embed.py` | Embedding engine (Ollama/sentence-transformers) |
| `engine/vanta/vanta_index.py` | Qdrant vector store client |
| `engine/vanta/vanta_torsion.py` | Adaptive computation scheduling |
| `engine/vanta/vanta_simulation.py` | 13 simulation-aware systems |
| `engine/vanta/vanta_geometry.py` | DXF/CAD geometry extraction |
| `engine/vanta/vanta_batch.py` | Parallel batch processing |
| `engine/aletheia/aletheia_jurisdiction.py` | AHJ code adoption registry |
| `engine/aletheia/aletheia_ledger.py` | Hash-chained audit ledger |
| `engine/aletheia/aletheia_schema.py` | Schema validation |
| `engine/aletheia/aletheia_simulation.py` | Verification simulation systems |
| `engine/daedalus/daedalus_retrieve.py` | Pattern retrieval engine |
| `engine/daedalus/daedalus_report.py` | Intelligence report builder |
| `aecai_server.py` | FastAPI server (port 8443) |
| `config.py` | Centralized configuration |
| `pipeline_ops.py` | Shared processing operations |

### Decompose Library

| File | Purpose |
|------|---------|
| `src/decompose/__init__.py` | Public API exports |
| `src/decompose/core.py` | Main pipeline: decompose_text() + filter_for_llm() |
| `src/decompose/classifier.py` | Authority/risk/type classification |
| `src/decompose/chunker.py` | Text + markdown chunking |
| `src/decompose/entities.py` | Entity extraction (standards, dates, financial) |
| `src/decompose/irreducibility.py` | Verbatim preservation detection |
| `src/decompose/mcp_server.py` | MCP tool interface |
| `src/decompose/cli.py` | CLI entry point |

### RBS Demo

| File | Purpose |
|------|---------|
| `server.py` | FastAPI server + all extraction/comparison logic (~1,810 lines) |
| `index.html` | Dark-theme single-page frontend |

### Polymarket

| File | Purpose |
|------|---------|
| `server.py` | FastAPI dashboard + routes |
| `db.py` | SQLite ORM (5 tables) |
| `config.py` | Constants + thresholds |
| `scanner/tail_end.py` | Strategy #5: near-certain harvesting |
| `scanner/cross_market.py` | Strategy #2: arbitrage |
| `scanner/crypto_price.py` | Strategy #1: latency arbitrage |
| `scanner/news_event.py` | Strategy #4: RSS → LLM → trade |
| `executor/wallet.py` | Burner wallet generator |
| `executor/signer.py` | EIP-712 signing |
| `executor/trader.py` | Order execution + safety limits |

---

*The tools find their resonance when the experience behind them is real.*
